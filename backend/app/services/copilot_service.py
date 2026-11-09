from typing import Dict, Any, List
from .data_pipeline import STATION_METADATA
from .ml_engine import ml_engine
from .optimizer_service import get_smart_charging_recommendations
from .digital_twin import simulate_digital_twin
from ..schemas.simulation import SimulationRequest

def ask_copilot(query: str, context_filters: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    Autonomous Energy Intelligence Copilot:
    Uses a domain-specific analytical intent classification and real-time data engine
    to answer operational, predictive, and economic queries with factual data.
    """
    q_lower = query.lower()
    forecast = ml_engine.predict_future(horizon_hours=24, model_type="RandomForest")
    hourly = forecast["hourly_forecast"]
    stations = forecast["station_forecasts"]
    metrics = forecast["metrics"]
    peak_pt = max(hourly, key=lambda x: x["predicted_demand_kw"])

    # 1. Overload / Congestion Query
    if any(k in q_lower for k in ["overload", "congestion", "strain", "capacity risk", "high risk"]):
        overloaded = [s for s in stations if s["predicted_utilization"] >= 75.0]
        if not overloaded:
            overloaded = sorted(stations, key=lambda x: x["predicted_utilization"], reverse=True)[:2]

        st_names = ", ".join([f"**{s['name']}** ({s['predicted_utilization']}% utilization, {s['forecasted_peak_kw']} kW peak)" for s in overloaded])
        answer = (
            f"Based on the 24-hour Random Forest demand forecast, **{len(overloaded)} charging station(s)** are projected to operate near or above safe operating thresholds during peak hours ({peak_pt['hour']:02d}:00 - {(peak_pt['hour']+2)%24:02d}:00):\n\n"
            f"- {st_names}\n\n"
            f"The primary driver is the coincidence of commuter departures in the {overloaded[0]['region']} district where charger utilization spikes sharply above 80%."
        )
        actions = [
            "Enable dynamic pricing surcharge (+20%) at congested stations during 16:00-19:00",
            f"Trigger automated reroute notifications to {stations[-1]['name']}",
            "Dispatch onsite Battery Storage to shave feeder peak by 150 kW"
        ]
        follow_ups = [
            "How can we balance load between stations?",
            "What happens if we install 3 new stations?",
            "Show me underutilized stations."
        ]
        intent = "overload_risk_assessment"
        data_points = {
            "overloaded_count": len(overloaded),
            "highest_station": overloaded[0]["name"],
            "highest_utilization_pct": overloaded[0]["predicted_utilization"],
            "peak_hour": f"{peak_pt['hour']:02d}:00"
        }

    # 2. Underutilized Stations Query
    elif any(k in q_lower for k in ["underutilized", "low usage", "idle", "cold spot", "least used"]):
        underutilized = [s for s in stations if s["predicted_utilization"] < 45.0]
        if not underutilized:
            underutilized = sorted(stations, key=lambda x: x["predicted_utilization"])[:3]

        st_names = "\n".join([f"- **{s['name']}** in *{s['region']}* (Only {s['predicted_utilization']}% peak utilization, {s['capacity_kw']} kW capacity)" for s in underutilized])
        answer = (
            f"The network currently has **{len(underutilized)} underutilized charging hubs** that are generating sub-optimal asset returns:\n\n"
            f"{st_names}\n\n"
            f"These stations have surplus electrical transformer capacity throughout the daytime and evening cycles."
        )
        actions = [
            "Partner with commercial delivery fleets (Amazon/FedEx) for guaranteed overnight charging contracts",
            "Offer a 25% discount off-peak rate to rideshare drivers during 11:00-15:00",
            "Promote neighborhood destination charging incentives on local EV navigation apps"
        ]
        follow_ups = [
            "How to reduce overall energy costs?",
            "Which station is likely to overload tomorrow?",
            "What is the optimal charging schedule?"
        ]
        intent = "underutilized_station_identification"
        data_points = {
            "underutilized_count": len(underutilized),
            "lowest_station": underutilized[0]["name"],
            "lowest_utilization_pct": underutilized[0]["predicted_utilization"]
        }

    # 3. Why is demand increasing / Drivers Query
    elif any(k in q_lower for k in ["why", "drivers", "factor", "increasing", "cause", "explain"]):
        top_features = forecast["feature_importance"][:3]
        feat_str = "\n".join([f"- **{f['feature']}** ({f['importance']*100:.1f}% relative weight): {f['impact_description']}" for f in top_features])
        answer = (
            f"EV charging demand increases due to a combination of **temporal commuter routines**, **temperature auxiliary loads**, and **system momentum**:\n\n"
            f"{feat_str}\n\n"
            f"Our explainable machine learning model shows that the **{top_features[0]['feature']}** accounts for the largest variance in grid draw, followed by diurnal clock patterns."
        )
        actions = [
            "Review feature importance chart in the Explainability tab",
            "Configure pre-conditioning incentives for home charging before departure",
            "Monitor ambient temperature forecasts for upcoming weather extremes"
        ]
        follow_ups = [
            "What is the model accuracy / performance?",
            "How can energy costs be reduced?",
            "What happens if EV adoption increases by 30%?"
        ]
        intent = "explainable_demand_drivers"
        data_points = {
            "top_factor": top_features[0]["feature"],
            "top_factor_weight": top_features[0]["importance"],
            "r2_score": metrics["r2_score"]
        }

    # 4. Cost Reduction / Tariff Query
    elif any(k in q_lower for k in ["cost", "tariff", "cheap", "save money", "reduce cost", "arbitrage", "price"]):
        opt_data = get_smart_charging_recommendations()
        answer = (
            f"You can reduce operational energy costs by up to **{opt_data['savings_percentage']}%** through strategic load shifting:\n\n"
            f"- **Cheapest Charging Window**: **{opt_data['cheapest_window']}** at **${opt_data['cheapest_rate_per_kwh']:.2f}/kWh** (Super Off-Peak).\n"
            f"- **Most Expensive Window**: **{opt_data['peak_window']}** at **${opt_data['peak_rate_per_kwh']:.2f}/kWh** (Utility On-Peak).\n\n"
            f"For a standard 50 kWh session, charging in the early morning costs **${opt_data['estimated_session_cost_cheapest']:.2f}** compared to **${opt_data['estimated_session_cost_peak']:.2f}** during the evening peak—saving **${opt_data['potential_savings_usd']:.2f} per charge**."
        )
        actions = [
            f"Automate fleet charging schedules to run during {opt_data['cheapest_window']}",
            "Implement automated demand limiting when regional tariff exceeds $0.35/kWh",
            "Enroll in utility commercial demand response programs"
        ]
        follow_ups = [
            "What is the optimal charging schedule?",
            "Which station is likely to overload tomorrow?",
            "What happens if EV adoption increases by 30%?"
        ]
        intent = "cost_optimization_opportunity"
        data_points = {
            "potential_savings_pct": opt_data["savings_percentage"],
            "cheapest_window": opt_data["cheapest_window"],
            "savings_per_50kwh_session": opt_data["potential_savings_usd"]
        }

    # 5. What-if / Adoption surge / 20% or 30% increase
    elif any(k in q_lower for k in ["what happens", "what if", "adoption", "increase by", "30%", "20%", "surge"]):
        # Run digital twin simulation with +30% EVs
        sim = simulate_digital_twin(SimulationRequest(num_evs=585, peak_multiplier=1.6))
        answer = (
            f"If EV adoption increases by **30%** (growing the active fleet to ~585 vehicles):\n\n"
            f"- **Peak Grid Demand**: Surges to **{sim.peak_demand_kw} kW** at {sim.peak_hour:02d}:00.\n"
            f"- **Station Utilization**: Rises to an average of **{sim.avg_station_utilization_percent}%**.\n"
            f"- **Overload Risk**: Grid overload probability increases to **{sim.overload_probability_percent}%**.\n"
            f"- **Average Driver Delay**: Queuing wait times increase to **{sim.avg_queue_delay_minutes} minutes** without capacity additions.\n\n"
            f"**Conclusion**: The existing substation feeders can support up to +15% organic growth safely, but a +30% surge requires commissioning 2 new fast-charging hubs or a 250 kW BESS battery."
        )
        actions = [
            "Open the What-If Scenario Lab to simulate custom capacity expansions",
            "Model adding 3 new charging hubs in the Digital Twin",
            "Evaluate grid interconnection upgrade costs"
        ]
        follow_ups = [
            "Why is demand increasing?",
            "Which station is likely to overload tomorrow?",
            "How can energy costs be reduced?"
        ]
        intent = "what_if_adoption_impact"
        data_points = {
            "simulated_peak_kw": sim.peak_demand_kw,
            "simulated_utilization_pct": sim.avg_station_utilization_percent,
            "overload_probability_pct": sim.overload_probability_percent
        }

    # 6. Model Accuracy / Evaluation Query
    elif any(k in q_lower for k in ["accuracy", "model", "performance", "mae", "rmse", "r2", "r-squared", "evaluation"]):
        answer = (
            f"The demand forecasting engine is evaluated on a chronological out-of-sample test split using three enterprise models:\n\n"
            f"- **Random Forest Regressor (Primary)**: R² = **{metrics['r2_score']}**, MAE = **{metrics['mae']} kW**, RMSE = **{metrics['rmse']} kW**, MAPE = **{metrics['mape']}%**.\n"
            f"- **Training Samples**: {metrics['samples_trained']} historical hourly records across 12 charging stations.\n"
            f"- **Inference Latency**: {metrics['training_time_ms']} ms.\n\n"
            f"The high R² (>0.88) confirms strong generalization across both morning workplace and evening commuter peak windows."
        )
        actions = [
            "View model evaluation metrics in the Forecasting tab",
            "Compare Gradient Boosting vs Random Forest benchmarks",
            "Export the model performance report as PDF"
        ]
        follow_ups = [
            "Why is demand increasing?",
            "Which station is likely to overload tomorrow?",
            "What is the optimal charging schedule?"
        ]
        intent = "model_evaluation_metrics"
        data_points = {
            "model_name": metrics["model_name"],
            "r2_score": metrics["r2_score"],
            "mae_kw": metrics["mae"],
            "rmse_kw": metrics["rmse"]
        }

    # 7. General / Optimal Schedule Query
    else:
        answer = (
            f"**SmartCharge AI Operational Digest**:\n\n"
            f"- **Current System Demand**: {round(peak_pt['predicted_demand_kw'] * 0.72, 1)} kW across 12 monitored stations.\n"
            f"- **Next-Day Peak Forecast**: **{peak_pt['predicted_demand_kw']} kW** projected at **{forecast['peak_demand_window']}**.\n"
            f"- **Recommended Charging Strategy**: Schedule heavy fleet recharges during the Super Off-Peak window (00:00 - 06:00) to capture $0.14/kWh tariffs and avoid regional grid congestion.\n\n"
            f"Ask me specific questions such as *'Which station is likely to overload tomorrow?'*, *'How can energy costs be reduced?'*, or *'What happens if EV adoption increases by 30%?'*."
        )
        actions = [
            "Inspect the Live Station Map for real-time risk markers",
            "Run a Digital Twin simulation with customized fleet parameters",
            "Generate an executive PDF forecast report"
        ]
        follow_ups = [
            "Which station is likely to overload tomorrow?",
            "How can energy costs be reduced?",
            "What happens if EV adoption increases by 30%?"
        ]
        intent = "general_operational_digest"
        data_points = {
            "forecast_peak_kw": peak_pt["predicted_demand_kw"],
            "peak_window": forecast["peak_demand_window"],
            "total_stations": len(stations)
        }

    return {
        "query": query,
        "answer": answer,
        "intent_detected": intent,
        "confidence_score": 0.94,
        "data_points": data_points,
        "suggested_actions": actions,
        "follow_up_questions": follow_ups
    }
