import os
import math
from datetime import datetime, timedelta
import numpy as np
import pandas as pd
from typing import Tuple, Dict, Any, List

# Paths
DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data"))
RAW_DATA_PATH = os.path.join(DATA_DIR, "raw", "ev_charging_sessions.csv")
PROCESSED_DATA_PATH = os.path.join(DATA_DIR, "processed", "hourly_demand.csv")

# Reference Charging Station metadata
STATION_METADATA = [
    {"station_id": "STA-001", "name": "Silicon Metro Supercharge Hub", "region": "Downtown Core", "latitude": 37.7749, "longitude": -122.4194, "charger_type": "DC Fast 150kW", "total_ports": 12, "max_power_kw": 600.0, "base_load_mult": 1.25},
    {"station_id": "STA-002", "name": "Bayfront Clean Energy Plaza", "region": "Harbor Point", "latitude": 37.7955, "longitude": -122.3937, "charger_type": "DC Fast 150kW", "total_ports": 8, "max_power_kw": 400.0, "base_load_mult": 1.05},
    {"station_id": "STA-003", "name": "Airport Logistics FastCharge Terminal", "region": "Airport District", "latitude": 37.6213, "longitude": -122.3790, "charger_type": "Ultra-Fast 350kW", "total_ports": 10, "max_power_kw": 700.0, "base_load_mult": 1.40},
    {"station_id": "STA-004", "name": "Innovation Campus PowerStation", "region": "Tech Corridor", "latitude": 37.4030, "longitude": -122.0322, "charger_type": "DC Fast 100kW", "total_ports": 14, "max_power_kw": 500.0, "base_load_mult": 1.30},
    {"station_id": "STA-005", "name": "North Gateway Commercial Hub", "region": "North Metro", "latitude": 37.8044, "longitude": -122.2712, "charger_type": "Level 2 Dual 22kW", "total_ports": 16, "max_power_kw": 250.0, "base_load_mult": 0.85},
    {"station_id": "STA-006", "name": "Civic Center Green Exchange", "region": "Downtown Core", "latitude": 37.7793, "longitude": -122.4184, "charger_type": "DC Fast 150kW", "total_ports": 8, "max_power_kw": 350.0, "base_load_mult": 0.95},
    {"station_id": "STA-007", "name": "Mission Valley Fleet Depot", "region": "Industrial Hub", "latitude": 37.7599, "longitude": -122.4148, "charger_type": "Ultra-Fast 350kW", "total_ports": 12, "max_power_kw": 650.0, "base_load_mult": 1.20},
    {"station_id": "STA-008", "name": "Sunset District Community Charger", "region": "West Suburbs", "latitude": 37.7544, "longitude": -122.4764, "charger_type": "Level 2 Dual 22kW", "total_ports": 6, "max_power_kw": 120.0, "base_load_mult": 0.60},
    {"station_id": "STA-009", "name": "Palo Alto Research Park Node", "region": "Tech Corridor", "latitude": 37.4275, "longitude": -122.1697, "charger_type": "DC Fast 150kW", "total_ports": 10, "max_power_kw": 450.0, "base_load_mult": 1.15},
    {"station_id": "STA-0010", "name": "Embarcadero Transit Point", "region": "Downtown Core", "latitude": 37.7993, "longitude": -122.3977, "charger_type": "DC Fast 150kW", "total_ports": 8, "max_power_kw": 380.0, "base_load_mult": 1.10},
    {"station_id": "STA-0011", "name": "Redwood Highway Oasis", "region": "Highway Corridor", "latitude": 37.5255, "longitude": -122.2625, "charger_type": "Ultra-Fast 350kW", "total_ports": 12, "max_power_kw": 750.0, "base_load_mult": 1.35},
    {"station_id": "STA-0012", "name": "Marina Green Solar E-Station", "region": "Harbor Point", "latitude": 37.8066, "longitude": -122.4385, "charger_type": "DC Fast 100kW", "total_ports": 6, "max_power_kw": 200.0, "base_load_mult": 0.70},
]

def generate_realistic_raw_dataset(num_days: int = 90) -> pd.DataFrame:
    """
    Synthesizes a high-fidelity EV charging session dataset modeled on Caltech ACN-Data
    and Palo Alto Municipal EV Charging datasets. Incorporates real diurnal arrival patterns,
    workplace morning charging, evening fast-charging, weekend behavioral shifts,
    stochastic battery capacities, and temperature seasonal factors.
    """
    os.makedirs(os.path.join(DATA_DIR, "raw"), exist_ok=True)
    os.makedirs(os.path.join(DATA_DIR, "processed"), exist_ok=True)

    np.random.seed(42)
    end_date = datetime.now().replace(minute=0, second=0, microsecond=0)
    start_date = end_date - timedelta(days=num_days)

    records = []
    session_counter = 10001

    # Typical EV models with battery sizes
    ev_models = [
        {"model": "Tesla Model 3 / Y", "battery_kwh": 78.0, "max_kw": 250.0, "prob": 0.38},
        {"model": "Hyundai Ioniq 5 / Kia EV6", "battery_kwh": 77.4, "max_kw": 235.0, "prob": 0.18},
        {"model": "Ford F-150 Lightning / Mach-E", "battery_kwh": 98.0, "max_kw": 150.0, "prob": 0.14},
        {"model": "Chevrolet Bolt / Equinox EV", "battery_kwh": 65.0, "max_kw": 55.0, "prob": 0.12},
        {"model": "Porsche Taycan / Audi e-tron", "battery_kwh": 93.4, "max_kw": 270.0, "prob": 0.08},
        {"model": "Rivian R1T / R1S Commercial Fleet", "battery_kwh": 135.0, "max_kw": 210.0, "prob": 0.10},
    ]
    model_probs = [m["prob"] for m in ev_models]

    curr_day = start_date
    while curr_day < end_date:
        is_weekend = curr_day.weekday() >= 5
        day_of_year = curr_day.timetuple().tm_yday
        # Ambient seasonal temperature proxy (San Francisco Bay Area climate ~ 10C to 26C)
        ambient_temp = 17.0 + 7.0 * math.sin((day_of_year - 100) / 365.0 * 2 * math.pi) + np.random.normal(0, 2)

        for station in STATION_METADATA:
            st_id = station["station_id"]
            multiplier = station["base_load_mult"]

            # Daily arrival count varies by station capacity and weekend
            base_daily_arrivals = int(station["total_ports"] * 3.8 * multiplier)
            if is_weekend:
                if "Downtown" in station["region"] or "Tech" in station["region"]:
                    base_daily_arrivals = int(base_daily_arrivals * 0.65)
                else:
                    base_daily_arrivals = int(base_daily_arrivals * 1.25)

            daily_arrivals = max(5, int(np.random.poisson(base_daily_arrivals)))

            for _ in range(daily_arrivals):
                # Sample arrival hour based on empirical EV charging curves
                if is_weekend:
                    # Weekend peak shifts to 11:00 - 16:00
                    hour_probs = np.array([
                        0.01, 0.01, 0.01, 0.01, 0.01, 0.02, 0.03, 0.05,
                        0.07, 0.09, 0.10, 0.11, 0.12, 0.10, 0.09, 0.07,
                        0.04, 0.03, 0.02, 0.01, 0.01, 0.01, 0.01, 0.01
                    ])
                else:
                    # Weekday has double peak: Morning 07:30-09:30 & Evening 16:30-19:30
                    hour_probs = np.array([
                        0.01, 0.01, 0.01, 0.01, 0.02, 0.03, 0.06, 0.11,
                        0.13, 0.10, 0.07, 0.06, 0.05, 0.05, 0.06, 0.07,
                        0.09, 0.11, 0.09, 0.06, 0.04, 0.02, 0.01, 0.01
                    ])
                hour_probs = hour_probs / hour_probs.sum()
                arrival_hour = np.random.choice(24, p=hour_probs)
                arrival_min = np.random.randint(0, 60)
                arrival_dt = curr_day.replace(hour=arrival_hour, minute=arrival_min, second=0)

                # Select EV Model
                chosen_ev = np.random.choice(ev_models, p=model_probs)
                batt_cap = chosen_ev["battery_kwh"]

                # Arrival SoC (typically 15% - 45%) and Target SoC (70% - 90%)
                soc_start = np.clip(np.random.normal(30.0, 10.0), 10.0, 60.0)
                soc_target = np.clip(np.random.normal(82.0, 6.0), 65.0, 95.0)
                energy_needed_kwh = round((soc_target - soc_start) / 100.0 * batt_cap, 2)

                # Charger power limit vs vehicle acceptance limit
                max_charge_rate = min(station["max_power_kw"] / station["total_ports"] * 2.2, chosen_ev["max_kw"])
                # Duration in hours (considering CC-CV taper curve ~ 1.15x nominal time)
                effective_kw = max_charge_rate * np.random.uniform(0.68, 0.92)
                duration_hours = max(0.2, round((energy_needed_kwh / effective_kw) * 1.12, 3))
                departure_dt = arrival_dt + timedelta(hours=duration_hours)

                # Pricing calculation based on TOU
                if 14 <= arrival_hour < 21:
                    rate = 0.44  # Peak
                    is_peak = True
                elif 0 <= arrival_hour < 6:
                    rate = 0.14  # Super off-peak
                    is_peak = False
                else:
                    rate = 0.22  # Mid-peak
                    is_peak = False

                cost = round(energy_needed_kwh * rate, 2)
                # Carbon factor: 0.385 kg CO2/kWh base, daytime solar dip (10-15h) down to 0.22, evening peaker up to 0.48
                carbon_factor = 0.385
                if 10 <= arrival_hour <= 15:
                    carbon_factor = 0.210  # California clean solar surplus
                elif 17 <= arrival_hour <= 21:
                    carbon_factor = 0.470  # Peaker gas combustion

                carbon_emissions = round(energy_needed_kwh * carbon_factor, 3)

                records.append({
                    "session_id": f"SES-{session_counter}",
                    "station_id": st_id,
                    "station_name": station["name"],
                    "region": station["region"],
                    "vehicle_model": chosen_ev["model"],
                    "start_time": arrival_dt.strftime("%Y-%m-%d %H:%M:%S"),
                    "end_time": departure_dt.strftime("%Y-%m-%d %H:%M:%S"),
                    "duration_hours": duration_hours,
                    "energy_kwh": energy_needed_kwh,
                    "peak_power_kw": round(effective_kw, 2),
                    "soc_start_percent": round(soc_start, 1),
                    "soc_target_percent": round(soc_target, 1),
                    "cost_usd": cost,
                    "carbon_emissions_kg": carbon_emissions,
                    "is_peak_hour": is_peak,
                    "ambient_temp_c": round(ambient_temp, 1)
                })
                session_counter += 1

        curr_day += timedelta(days=1)

    df = pd.DataFrame(records)
    df.to_csv(RAW_DATA_PATH, index=False)
    print(f"Generated raw dataset: {len(df)} records saved to {RAW_DATA_PATH}")
    return df

def clean_and_process_pipeline(raw_df: pd.DataFrame = None) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """
    Standard ETL & Feature Engineering Pipeline:
    1. Reads raw sessions or generates if absent.
    2. Removes duplicates & nulls.
    3. Detects & clips statistical outliers (IQR method on energy_kwh & duration_hours).
    4. Aggregates sessions into hourly time series per station and network-wide.
    5. Feature Engineering:
       - hour_of_day, day_of_week, is_weekend, month
       - cyclical encodings (sin/cos of hour and day of week)
       - lag features: demand_lag_1h, demand_lag_24h, demand_lag_168h (1 week)
       - rolling features: rolling_mean_3h, rolling_std_24h
       - ambient_temp proxy
    """
    if raw_df is None:
        if not os.path.exists(RAW_DATA_PATH):
            raw_df = generate_realistic_raw_dataset()
        else:
            raw_df = pd.read_csv(RAW_DATA_PATH)

    df = raw_df.copy()

    # Data validation
    df = df.drop_duplicates(subset=["session_id"])
    df = df.dropna(subset=["start_time", "energy_kwh", "station_id"])
    df["start_time"] = pd.to_datetime(df["start_time"])
    df["end_time"] = pd.to_datetime(df["end_time"])

    # Outlier clipping with IQR
    q25 = df["energy_kwh"].quantile(0.01)
    q99 = df["energy_kwh"].quantile(0.99)
    df["energy_kwh"] = df["energy_kwh"].clip(q25, q99)

    # Floor start_time to hour for time series aggregation
    df["timestamp_hour"] = df["start_time"].dt.floor("h")

    # Aggregate by hour across entire network
    hourly_network = df.groupby("timestamp_hour").agg(
        total_demand_kw=("peak_power_kw", "sum"),
        total_energy_kwh=("energy_kwh", "sum"),
        active_sessions=("session_id", "count"),
        avg_duration_hours=("duration_hours", "mean"),
        total_cost_usd=("cost_usd", "sum"),
        total_carbon_kg=("carbon_emissions_kg", "sum"),
        avg_temp_c=("ambient_temp_c", "mean")
    ).reset_index()

    # Ensure continuous time range without missing hours
    min_time = hourly_network["timestamp_hour"].min()
    max_time = hourly_network["timestamp_hour"].max()
    full_range = pd.date_range(start=min_time, end=max_time, freq="h", name="timestamp_hour")
    hourly_network = hourly_network.set_index("timestamp_hour").reindex(full_range).reset_index()

    hourly_network["total_demand_kw"] = hourly_network["total_demand_kw"].interpolate(method="linear").fillna(50.0)
    hourly_network["total_energy_kwh"] = hourly_network["total_energy_kwh"].interpolate(method="linear").fillna(35.0)
    hourly_network["active_sessions"] = hourly_network["active_sessions"].fillna(2).round().astype(int)
    hourly_network["total_cost_usd"] = hourly_network["total_cost_usd"].interpolate(method="linear").fillna(8.0)
    hourly_network["total_carbon_kg"] = hourly_network["total_carbon_kg"].interpolate(method="linear").fillna(12.0)
    hourly_network["avg_temp_c"] = hourly_network["avg_temp_c"].interpolate(method="linear").fillna(18.0)

    # Feature Engineering
    hourly_network["hour"] = hourly_network["timestamp_hour"].dt.hour
    hourly_network["day_of_week"] = hourly_network["timestamp_hour"].dt.dayofweek
    hourly_network["is_weekend"] = (hourly_network["day_of_week"] >= 5).astype(int)
    hourly_network["month"] = hourly_network["timestamp_hour"].dt.month

    # Cyclical encodings
    hourly_network["hour_sin"] = np.sin(2 * np.pi * hourly_network["hour"] / 24.0)
    hourly_network["hour_cos"] = np.cos(2 * np.pi * hourly_network["hour"] / 24.0)
    hourly_network["dow_sin"] = np.sin(2 * np.pi * hourly_network["day_of_week"] / 7.0)
    hourly_network["dow_cos"] = np.cos(2 * np.pi * hourly_network["day_of_week"] / 7.0)

    # Lag features
    hourly_network["lag_1h"] = hourly_network["total_demand_kw"].shift(1)
    hourly_network["lag_2h"] = hourly_network["total_demand_kw"].shift(2)
    hourly_network["lag_24h"] = hourly_network["total_demand_kw"].shift(24)
    hourly_network["lag_168h"] = hourly_network["total_demand_kw"].shift(168)  # same hour last week

    # Rolling window stats
    hourly_network["rolling_mean_6h"] = hourly_network["total_demand_kw"].rolling(window=6, min_periods=1).mean()
    hourly_network["rolling_std_24h"] = hourly_network["total_demand_kw"].rolling(window=24, min_periods=1).std().fillna(0)

    # Backfill earliest lags
    hourly_network = hourly_network.bfill()

    # Save processed dataset
    hourly_network.to_csv(PROCESSED_DATA_PATH, index=False)
    print(f"Processed hourly feature matrix: {len(hourly_network)} rows saved to {PROCESSED_DATA_PATH}")

    return df, hourly_network

def get_station_metadata() -> List[Dict[str, Any]]:
    return STATION_METADATA
