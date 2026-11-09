import math
from typing import Dict, Any, List
from ..schemas.scenario import ScenarioRequest, ScenarioComparisonResponse, ScenarioHourlyPoint, MetricDelta
from .ml_engine import ml_engine
from .data_pipeline import STATION_METADATA

def run_whatif_scenario(req: ScenarioRequest) -> ScenarioComparisonResponse:
    """
    What-If Scenario Engine:
    Evaluates system dynamics under policy shifts, fleet adoption surges,
    infrastructure expansions, tariff restructurings, and climate events.
    """
    # Obtain baseline 24-hour ML forecast
    baseline_forecast = ml_engine.predict_future(horizon_hours=24, model_type="RandomForest")
    baseline_hours = baseline_forecast["hourly_forecast"]

    # Weather impact multipliers on EV battery thermal management & HVAC draw
    weather_multiplier = 1.0
    if "Cold" in req.weather_condition:
        # Cold temperatures reduce battery chemical kinetics; cabin resistive heating draws 3-6kW extra
        weather_multiplier = 1.28
    elif "Heat" in req.weather_condition:
        # High ambient temp triggers compressor cooling & chiller load
        weather_multiplier = 1.16

    # Fleet adoption growth multiplier
    adoption_mult = 1.0 + (req.ev_adoption_growth_percent / 100.0)

    # Charger power upgrade multiplier (delivers more instantaneous power, shortens sessions)
    power_mult = 1.0 + (req.charger_power_upgrade_percent / 100.0)

    # Tariff price surge factor
    tariff_surge_mult = 1.0 + (req.peak_tariff_surge_percent / 100.0)

    # Additional stations effect: spreads spatial load, increases network capacity
    base_stations_count = len(STATION_METADATA)
    new_total_stations = base_stations_count + req.additional_stations
    capacity_expansion_mult = new_total_stations / base_stations_count

    scenario_hourly: List[ScenarioHourlyPoint] = []
    base_total_energy = 0.0
    scen_total_energy = 0.0
    base_total_cost = 0.0
    scen_total_cost = 0.0

    for item in baseline_hours:
        h = item["hour"]
        base_demand = item["predicted_demand_kw"]
        base_rate = item["tariff_rate"]

        # If weekend shift requested
        dow_mult = 0.82 if (req.weekend_shift_active and not item["is_peak_hour"]) else 1.0

        # Scenario demand formula
        # Energy scales with adoption & weather; peak power draw scales additionally with faster chargers
        scen_demand = base_demand * adoption_mult * weather_multiplier * (1.0 + (req.charger_power_upgrade_percent * 0.003)) * dow_mult
        scen_demand = max(20.0, round(scen_demand, 1))

        # Peak tariff surge applies to peak hours
        if item["is_peak_hour"]:
            scen_rate = base_rate * tariff_surge_mult
        else:
            scen_rate = base_rate

        delta_kw = round(scen_demand - base_demand, 1)
        delta_pct = round(((scen_demand - base_demand) / max(1.0, base_demand)) * 100.0, 1)

        b_cost = base_demand * base_rate
        s_cost = scen_demand * scen_rate

        base_total_energy += base_demand
        scen_total_energy += scen_demand
        base_total_cost += b_cost
        scen_total_cost += s_cost

        scenario_hourly.append(ScenarioHourlyPoint(
            hour=h,
            baseline_demand_kw=base_demand,
            scenario_demand_kw=scen_demand,
            delta_kw=delta_kw,
            delta_percent=delta_pct,
            baseline_cost_usd=round(b_cost, 2),
            scenario_cost_usd=round(s_cost, 2)
        ))

    base_peak = max(p.baseline_demand_kw for p in scenario_hourly)
    scen_peak = max(p.scenario_demand_kw for p in scenario_hourly)
    base_cap_headroom = max(0.0, sum(s["max_power_kw"] for s in STATION_METADATA) - base_peak)
    scen_cap_headroom = max(0.0, (sum(s["max_power_kw"] for s in STATION_METADATA) * capacity_expansion_mult * (1.0 + req.charger_power_upgrade_percent / 100.0)) - scen_peak)
    base_carbon = base_total_energy * 0.385
    scen_carbon = scen_total_energy * 0.385

    # Metric deltas
    metrics = [
        MetricDelta(
            metric="Peak Grid Demand",
            baseline=round(base_peak, 1),
            scenario=round(scen_peak, 1),
            delta=round(scen_peak - base_peak, 1),
            delta_percent=round(((scen_peak - base_peak) / base_peak) * 100.0, 1),
            unit="kW",
            impact="negative" if scen_peak > base_peak else "positive"
        ),
        MetricDelta(
            metric="Total Daily Energy Delivered",
            baseline=round(base_total_energy, 1),
            scenario=round(scen_total_energy, 1),
            delta=round(scen_total_energy - base_total_energy, 1),
            delta_percent=round(((scen_total_energy - base_total_energy) / base_total_energy) * 100.0, 1),
            unit="kWh",
            impact="positive"  # More EV throughput = higher revenue
        ),
        MetricDelta(
            metric="Network Headroom Buffer",
            baseline=round(base_cap_headroom, 1),
            scenario=round(scen_cap_headroom, 1),
            delta=round(scen_cap_headroom - base_cap_headroom, 1),
            delta_percent=round(((scen_cap_headroom - base_cap_headroom) / max(1.0, base_cap_headroom)) * 100.0, 1),
            unit="kW",
            impact="positive" if scen_cap_headroom >= base_cap_headroom else "negative"
        ),
        MetricDelta(
            metric="Operating Electricity Cost",
            baseline=round(base_total_cost, 2),
            scenario=round(scen_total_cost, 2),
            delta=round(scen_total_cost - base_total_cost, 2),
            delta_percent=round(((scen_total_cost - base_total_cost) / base_total_cost) * 100.0, 1),
            unit="USD",
            impact="negative" if scen_total_cost > base_total_cost else "positive"
        ),
        MetricDelta(
            metric="Net Carbon Offset vs ICE",
            baseline=round(base_total_energy * (0.850 - 0.385), 1),  # ICE emits ~0.850 kg CO2 equivalent per EV-mile
            scenario=round(scen_total_energy * (0.850 - 0.385), 1),
            delta=round((scen_total_energy - base_total_energy) * (0.850 - 0.385), 1),
            delta_percent=round(((scen_total_energy - base_total_energy) / base_total_energy) * 100.0, 1),
            unit="kg CO2 avoided",
            impact="positive"
        )
    ]

    # Key findings
    findings = [
        f"Simulated EV adoption change of {req.ev_adoption_growth_percent:+.1f}% translates to a {metrics[0].delta_percent:+.1f}% shift in peak substation demand.",
        f"Weather event '{req.weather_condition}' introduced a {round((weather_multiplier - 1.0) * 100.0, 1)}% auxiliary battery thermal penalty.",
        f"Adding {req.additional_stations} charging hubs boosted network throughput capacity to {sum(s['max_power_kw'] for s in STATION_METADATA) * capacity_expansion_mult:.0f} kW.",
        f"Peak tariff adjustment (+{req.peak_tariff_surge_percent:.0f}%) creates strong price signals that can motivate off-peak charging."
    ]

    actions = [
        "If peak load exceeds 4.2 MW, schedule feeder transformer upgrade with local utility.",
        f"Deploy demand-response smart charging to cap concurrent port output at {round(scen_peak * 0.85, 0)} kW during 17:00-20:00.",
        "Enroll commercial fleet accounts into dynamic off-peak contracts to balance the day-night delta.",
        "Consider colocated solar canopy generation at Harbor Point and Airport District hubs."
    ]

    verdict = f"Scenario '{req.scenario_name}' is technically feasible with {scen_cap_headroom:.0f} kW reserve headroom remaining across the network."

    return ScenarioComparisonResponse(
        scenario_name=req.scenario_name,
        weather_applied=req.weather_condition,
        summary_verdict=verdict,
        metrics=metrics,
        hourly_comparison=scenario_hourly,
        key_findings=findings,
        capacity_planning_actions=actions
    )
