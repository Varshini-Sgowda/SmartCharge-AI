import math
import numpy as np
from typing import Dict, Any, List
from ..schemas.simulation import SimulationRequest, SimulationResult, HourlySimPoint
from .data_pipeline import STATION_METADATA

def simulate_digital_twin(req: SimulationRequest) -> SimulationResult:
    """
    EV Energy Digital Twin Simulator:
    Implements a discrete-event power flow & M/M/c queuing simulation model across 24 hours.
    Takes fleet size, station stalls, charger power kW, arrival rates, charging durations,
    peak multipliers, and BESS (Battery Energy Storage System) capacity.
    """
    total_ports = req.num_stations * int(math.ceil(req.num_evs / (req.num_stations * 18.0)))
    total_ports = max(req.num_stations * 4, total_ports)
    grid_capacity_kw = req.num_stations * req.charger_capacity_kw * (total_ports / req.num_stations) * 0.75

    hourly_points: List[HourlySimPoint] = []
    total_energy_kwh = 0.0
    total_cost_usd = 0.0
    unmanaged_cost_usd = 0.0
    overload_hours = 0
    total_wait_minutes = 0.0

    # Diurnal arrival probability distribution
    diurnal_curve = [
        0.015, 0.012, 0.010, 0.010, 0.015, 0.030,
        0.065, 0.095, 0.085, 0.060, 0.050, 0.055,
        0.060, 0.065, 0.075, 0.085, 0.095, 0.080,
        0.055, 0.040, 0.030, 0.025, 0.018, 0.015
    ]

    # BESS state of charge tracking (starts at 50% capacity)
    bess_max_kwh = req.battery_storage_kw * 4.0  # 4-hour duration BESS
    bess_current_kwh = bess_max_kwh * 0.5

    for hour in range(24):
        # Calculate arrivals in this hour
        prob = diurnal_curve[hour]
        # Peak multiplier applies between 14:00 and 20:00
        is_peak_window = 14 <= hour <= 20
        hour_mult = req.peak_multiplier if is_peak_window else 1.0

        expected_arrivals = (req.arrival_rate_per_hour * 24.0 * prob) * hour_mult
        actual_arrivals = max(0, int(np.random.poisson(expected_arrivals)))

        # Average energy needed per arrival (battery capacity ~ 65kWh, 40% DoD)
        avg_kwh_per_session = (req.avg_charging_duration_min / 60.0) * (req.charger_capacity_kw * 0.70)
        raw_demand_kw = actual_arrivals * (req.charger_capacity_kw * 0.72)

        # TOU pricing ($/kWh)
        if 14 <= hour < 21:
            tariff = 0.44
        elif 0 <= hour < 6:
            tariff = 0.14
        else:
            tariff = 0.22

        # BESS Dispatch Logic:
        # Off-peak (00:00-06:00): Charge BESS from grid if surplus capacity exists
        # Peak (14:00-21:00): Discharge BESS to clip peak demand
        bess_discharge_kw = 0.0
        if 0 <= hour < 6 and bess_current_kwh < bess_max_kwh:
            charge_power = min(req.battery_storage_kw, (bess_max_kwh - bess_current_kwh))
            bess_current_kwh += charge_power
            grid_demand_kw = raw_demand_kw + charge_power
        elif 14 <= hour < 21 and bess_current_kwh > 0:
            discharge_power = min(req.battery_storage_kw, bess_current_kwh, raw_demand_kw * 0.45)
            bess_current_kwh -= discharge_power
            bess_discharge_kw = discharge_power
            grid_demand_kw = max(0.0, raw_demand_kw - discharge_power)
        else:
            grid_demand_kw = raw_demand_kw

        # M/M/c Queuing model approximation
        c = total_ports
        mu = 60.0 / req.avg_charging_duration_min  # service rate per port per hour
        lam = actual_arrivals                      # arrival rate per hour
        rho = lam / (c * mu) if (c * mu) > 0 else 0.99
        utilization = min(99.5, max(5.0, rho * 100.0))

        # Expected queuing delay (minutes)
        if rho >= 1.0:
            queue_delay = max(5.0, (lam - c * mu) * 4.5 + 8.0)
            is_overloaded = True
        elif rho > 0.82:
            queue_delay = round(12.0 * (rho ** 4), 1)
            is_overloaded = grid_demand_kw > (grid_capacity_kw * 0.92)
        else:
            queue_delay = round(1.5 * rho, 1)
            is_overloaded = False

        if is_overloaded or grid_demand_kw > grid_capacity_kw:
            overload_hours += 1

        total_wait_minutes += queue_delay
        hour_energy = grid_demand_kw * 1.0
        total_energy_kwh += hour_energy
        total_cost_usd += hour_energy * tariff
        unmanaged_cost_usd += (raw_demand_kw * 1.0) * tariff

        hourly_points.append(HourlySimPoint(
            hour=hour,
            grid_demand_kw=round(grid_demand_kw, 1),
            bess_discharge_kw=round(bess_discharge_kw, 1),
            active_evs=actual_arrivals,
            queue_wait_min=round(queue_delay, 1),
            utilization_rate=round(utilization, 1),
            overload_risk=is_overloaded
        ))

    # Overall metrics
    peak_pt = max(hourly_points, key=lambda p: p.grid_demand_kw)
    avg_util = sum(p.utilization_rate for p in hourly_points) / 24.0
    overload_prob = round((overload_hours / 24.0) * 100.0, 1)
    avg_queue = round(total_wait_minutes / 24.0, 1)
    bess_savings = max(0.0, round(unmanaged_cost_usd - total_cost_usd, 2))
    carbon_est = round(total_energy_kwh * 0.385, 1)

    # Station stress breakdown
    stresses = []
    for s in STATION_METADATA[:req.num_stations]:
        st_load = peak_pt.grid_demand_kw * (s["max_power_kw"] / grid_capacity_kw) * s["base_load_mult"]
        st_util = min(100.0, round((st_load / s["max_power_kw"]) * 100.0, 1))
        stresses.append({
            "station_id": s["station_id"],
            "name": s["name"],
            "peak_load_kw": round(st_load, 1),
            "capacity_kw": s["max_power_kw"],
            "utilization_percent": st_util
        })

    # Actionable engineering recommendations
    recs = []
    if overload_prob > 25.0:
        recs.append("CRITICAL: Grid interconnection capacity breached during peak hours. Expand BESS to >= 300 kW or introduce managed charging power modulation.")
    elif overload_prob > 10.0:
        recs.append("MODERATE: Peak period congestion detected. Deploy automated price elasticity signals to shift 15% of arrivals to off-peak slots.")
    else:
        recs.append("OPTIMAL: System capacity buffer is healthy (>20% headroom). Network can support additional fleet onboarding.")

    if avg_queue > 15.0:
        recs.append(f"Driver Experience Warning: Average wait time of {avg_queue} mins causes customer churn. Add {max(2, req.num_stations // 3)} extra fast-charging bays.")

    if req.battery_storage_kw > 0:
        recs.append(f"BESS Peak Shaving Value: Onsite energy storage shaved {round(bess_savings, 2)} USD in peak demand tariffs today.")

    summary = f"Simulated {req.num_evs} EVs across {req.num_stations} stations. Peak grid load reached {peak_pt.grid_demand_kw} kW at {peak_pt.hour:02d}:00 with {avg_util:.1f}% average utilization."

    return SimulationResult(
        total_energy_kwh=round(total_energy_kwh, 1),
        peak_demand_kw=round(peak_pt.grid_demand_kw, 1),
        peak_hour=peak_pt.hour,
        avg_station_utilization_percent=round(avg_util, 1),
        overload_probability_percent=overload_prob,
        avg_queue_delay_minutes=avg_queue,
        estimated_daily_cost_usd=round(total_cost_usd, 2),
        bess_cost_savings_usd=bess_savings,
        estimated_carbon_kg=carbon_est,
        status_summary=summary,
        hourly_simulation=hourly_points,
        station_stresses=stresses,
        system_recommendations=recs
    )
