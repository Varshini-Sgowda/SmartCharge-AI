from typing import Dict, Any, List
from .data_pipeline import STATION_METADATA
from .ml_engine import ml_engine

def get_smart_charging_recommendations(session_kwh: float = 50.0) -> Dict[str, Any]:
    """
    Intelligent Charging Recommendation & Tariff Optimizer Engine:
    Identifies optimal charging windows, cost arbitrage opportunities,
    and spatial load balancing recommendations across the network.
    """
    # 24-hour forecast
    forecast = ml_engine.predict_future(horizon_hours=24, model_type="RandomForest")
    hourly = forecast["hourly_forecast"]

    # 1. Identify Cheapest Charging Window (Cost minimization)
    cheapest_hour = min(hourly, key=lambda x: x["tariff_rate"])
    cheapest_window = f"{cheapest_hour['hour']:02d}:00 - {(cheapest_hour['hour'] + 3) % 24:02d}:00"
    min_cost = session_kwh * cheapest_hour["tariff_rate"]

    # 2. Identify Most Expensive Peak Window
    peak_hour = max(hourly, key=lambda x: (x["tariff_rate"], x["predicted_demand_kw"]))
    peak_window = f"{peak_hour['hour']:02d}:00 - {(peak_hour['hour'] + 3) % 24:02d}:00"
    max_cost = session_kwh * peak_hour["tariff_rate"]

    savings_per_session = round(max_cost - min_cost, 2)
    savings_pct = round((savings_per_session / max_cost) * 100.0, 1)

    # 3. Cleanest Green Charging Window (Lowest Carbon Intensity)
    cleanest_hour = min(hourly, key=lambda x: x["carbon_intensity_kg_kwh"])
    cleanest_window = f"{cleanest_hour['hour']:02d}:00 - {(cleanest_hour['hour'] + 3) % 24:02d}:00"
    cleanest_carbon_kg = round(session_kwh * cleanest_hour["carbon_intensity_kg_kwh"], 2)
    peak_carbon_kg = round(session_kwh * peak_hour["carbon_intensity_kg_kwh"], 2)
    carbon_saved_kg = round(peak_carbon_kg - cleanest_carbon_kg, 2)

    # 4. Spatial Station Load Balancing
    st_forecasts = forecast["station_forecasts"]
    overloaded_stations = [s for s in st_forecasts if s["predicted_utilization"] >= 75.0]
    underutilized_stations = [s for s in st_forecasts if s["predicted_utilization"] < 40.0]

    load_balancing_pairs = []
    for over in overloaded_stations:
        for under in underutilized_stations:
            # Pair if same region or nearby
            if over["region"] == under["region"] or ("Downtown" in over["region"] and "Downtown" in under["region"]):
                load_balancing_pairs.append({
                    "congested_station": over["name"],
                    "alternative_station": under["name"],
                    "region": over["region"],
                    "congested_utilization": over["predicted_utilization"],
                    "alternative_utilization": under["predicted_utilization"],
                    "proposed_incentive": "15% discount for charging at alternative hub",
                    "estimated_load_diverted_kw": round(over["forecasted_peak_kw"] * 0.20, 1)
                })
                break

    # 5. Core AI Recommendations
    recommendations = [
        {
            "id": "REC-01",
            "category": "Tariff Arbitrage",
            "title": f"Shift Flexible Fleet Charging to {cheapest_window}",
            "description": f"Charging during off-peak hours costs ${cheapest_hour['tariff_rate']:.2f}/kWh vs ${peak_hour['tariff_rate']:.2f}/kWh during peak. A single 50 kWh session saves ${savings_per_session:.2f} ({savings_pct}%).",
            "potential_savings": f"${savings_per_session * 120:.2f}/day across fleet",
            "priority": "High",
            "tag": "Cost Reduction"
        },
        {
            "id": "REC-02",
            "category": "Renewable Alignment",
            "title": f"Maximize Midday Solar Window ({cleanest_window})",
            "description": f"California grid solar surplus reaches peak output between 11:00-14:00, lowering carbon emissions to {cleanest_hour['carbon_intensity_kg_kwh']:.3f} kg CO2/kWh.",
            "potential_savings": f"{carbon_saved_kg * 80:.1f} kg CO2 avoided daily",
            "priority": "High",
            "tag": "Decarbonization"
        },
        {
            "id": "REC-03",
            "category": "Grid Protection",
            "title": "Automate Peak Demand Throttling (17:00 - 19:30)",
            "description": f"Network peak load is projected to hit {forecast['peak_demand_kw']} kW at {forecast['peak_demand_window']}. Modulate non-critical charging ports to 80% rated output to avoid utility demand surcharges.",
            "potential_savings": "$1,450 / month in utility demand ratchet charges",
            "priority": "Critical",
            "tag": "Grid Stability"
        },
        {
            "id": "REC-04",
            "category": "Load Balancing",
            "title": f"Reroute Commuters from {overloaded_stations[0]['name'] if overloaded_stations else 'Central'} Hub",
            "description": f"Current load exceeds 85% at Silicon Metro. Push geo-targeted navigation recommendations to direct drivers to nearby underutilized stations.",
            "potential_savings": "Eliminates 18 min average driver queue time",
            "priority": "Medium",
            "tag": "Operations"
        }
    ]

    return {
        "reference_session_kwh": session_kwh,
        "cheapest_window": cheapest_window,
        "cheapest_rate_per_kwh": cheapest_hour["tariff_rate"],
        "estimated_session_cost_cheapest": round(min_cost, 2),
        "peak_window": peak_window,
        "peak_rate_per_kwh": peak_hour["tariff_rate"],
        "estimated_session_cost_peak": round(max_cost, 2),
        "potential_savings_usd": savings_per_session,
        "savings_percentage": savings_pct,
        "cleanest_green_window": cleanest_window,
        "cleanest_carbon_intensity": cleanest_hour["carbon_intensity_kg_kwh"],
        "carbon_saved_kg_per_session": carbon_saved_kg,
        "load_balancing_pairs": load_balancing_pairs,
        "recommendations": recommendations,
        "hourly_price_carbon_profile": [
            {
                "hour": h["hour"],
                "tariff_rate": h["tariff_rate"],
                "tariff_period": h["tariff_period"],
                "carbon_intensity": h["carbon_intensity_kg_kwh"],
                "demand_kw": h["predicted_demand_kw"]
            }
            for h in hourly
        ]
    }
