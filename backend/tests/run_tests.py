import os
import sys

# Ensure backend path is present
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from backend.app.services.ml_engine import ml_engine
from backend.app.services.digital_twin import simulate_digital_twin
from backend.app.services.scenario_engine import run_whatif_scenario
from backend.app.services.optimizer_service import get_smart_charging_recommendations
from backend.app.services.fleet_scheduler import schedule_fleet
from backend.app.services.copilot_service import ask_copilot
from backend.app.services.carbon_service import get_carbon_intelligence
from backend.app.services.report_service import generate_pdf_report, generate_excel_report, generate_csv_report
from backend.app.schemas.simulation import SimulationRequest
from backend.app.schemas.scenario import ScenarioRequest
from backend.app.schemas.fleet import FleetScheduleRequest
from backend.app.routers.dashboard import get_dashboard_metrics, get_dashboard_visualizations
from backend.app.routers.stations import get_all_stations, get_stations_overview
from backend.app.database import SessionLocal, Base, engine

def run_direct_tests():
    print("================ RUNNING SMARTCHARGE AI VERIFICATION SUITE ================")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. ML Forecasting Engine
        f = ml_engine.predict_future(horizon_hours=24, model_type="RandomForest")
        assert f["horizon_hours"] == 24
        assert len(f["hourly_forecast"]) == 24
        assert f["metrics"]["r2_score"] > 0.85
        assert len(f["feature_importance"]) >= 10
        print(f"✓ ML Demand Forecasting Engine PASSED (R²: {f['metrics']['r2_score']}, MAE: {f['metrics']['mae']} kW)")

        # 2. Dashboard KPIs & Metrics
        metrics = get_dashboard_metrics(db)
        assert metrics["total_stations"] == 12
        assert metrics["forecasted_peak_demand_kw"] > 0
        assert metrics["model_r2_score"] > 0.85
        print(f"✓ Dashboard Metrics PASSED (Stations: {metrics['total_stations']}, Total Capacity: {metrics['total_capacity_kw']} kW)")

        # 3. All 8 Visualizations
        viz = get_dashboard_visualizations()
        assert len(viz["actual_vs_predicted"]) == 24
        assert len(viz["hourly_energy"]) == 24
        assert len(viz["station_utilization"]) == 12
        assert len(viz["heatmap"]) == 24
        assert len(viz["demand_by_region"]) >= 4
        assert len(viz["energy_trends"]) >= 5
        assert len(viz["carbon_trends"]) == 24
        print(f"✓ All 8 Dashboard Visualizations PASSED (Actual vs Pred, Heatmap, Regional, Trends, Carbon)")

        # 4. Stations & Risk Levels
        stations = get_all_stations(db)
        assert len(stations) == 12
        for st in stations:
            assert st.risk_level in ["Low", "Moderate", "High", "Critical"]
        print(f"✓ Stations Risk Classification PASSED ({len(stations)} stations mapped)")

        # 5. Feature 1: Digital Twin Simulator
        sim_req = SimulationRequest(
            num_evs=500,
            num_stations=12,
            charger_capacity_kw=150.0,
            arrival_rate_per_hour=38.0,
            avg_charging_duration_min=35.0,
            peak_multiplier=1.4,
            battery_storage_kw=150.0
        )
        sim = simulate_digital_twin(sim_req)
        assert sim.peak_demand_kw > 0
        assert len(sim.hourly_simulation) == 24
        assert len(sim.system_recommendations) >= 2
        print(f"✓ Digital Twin Simulator PASSED (Sim Peak: {sim.peak_demand_kw} kW, Headroom & BESS savings calculated)")

        # 6. Feature 2: What-If Scenario Lab
        scen_req = ScenarioRequest(
            scenario_name="Adoption Surge +30%",
            ev_adoption_growth_percent=30.0,
            additional_stations=3,
            charger_power_upgrade_percent=25.0,
            peak_tariff_surge_percent=35.0,
            weather_condition="Mild / Normal (20°C)",
            weekend_shift_active=False
        )
        scen = run_whatif_scenario(scen_req)
        assert len(scen.metrics) == 5
        assert len(scen.hourly_comparison) == 24
        assert len(scen.key_findings) >= 3
        print(f"✓ What-If Scenario Lab PASSED ({scen.summary_verdict[:55]}...)")

        # 7. Feature 4: Tariff-Aware Smart Charging Optimizer
        opt = get_smart_charging_recommendations(session_kwh=50.0)
        assert opt["potential_savings_usd"] > 0
        assert opt["savings_percentage"] > 30.0
        assert len(opt["recommendations"]) >= 3
        print(f"✓ Tariff-Aware Optimizer PASSED (Cheapest: {opt['cheapest_window']}, Savings: {opt['savings_percentage']}%)")

        # 8. Feature 5: Fleet Charging Scheduler
        fleet_res = schedule_fleet(max_station_power_kw=350.0, objective="Cost & Peak Avoidance")
        assert fleet_res.total_vehicles_scheduled > 0
        assert fleet_res.total_savings_usd > 0
        assert len(fleet_res.schedules) == 8
        print(f"✓ Fleet Charging Scheduler PASSED ({fleet_res.total_vehicles_scheduled} commercial EVs scheduled, Saved ${fleet_res.total_savings_usd})")

        # 9. Feature 6: Autonomous Energy Intelligence Copilot
        copilot_res = ask_copilot("Which station is likely to overload tomorrow?")
        assert len(copilot_res["answer"]) > 50
        assert copilot_res["confidence_score"] > 0.8
        assert copilot_res["intent_detected"] == "overload_risk_assessment"
        print(f"✓ Autonomous AI Copilot PASSED (Detected Intent: {copilot_res['intent_detected']})")

        # 10. Carbon Intelligence
        carb = get_carbon_intelligence()
        assert carb["net_carbon_avoided_kg"] > 0
        assert len(carb["reduction_scenarios"]) >= 3
        print(f"✓ Carbon Intelligence PASSED (Net avoided: {carb['net_carbon_avoided_kg']:,.0f} kg CO2)")

        # 11. Feature 7: Report Generators (PDF, Excel, CSV)
        pdf_buf = generate_pdf_report()
        assert len(pdf_buf.getvalue()) > 1000
        excel_buf = generate_excel_report()
        assert len(excel_buf.getvalue()) > 1000
        csv_buf = generate_csv_report()
        assert len(csv_buf.getvalue()) > 100
        print(f"✓ Report Generation PASSED (PDF: {len(pdf_buf.getvalue()):,} bytes, Excel: {len(excel_buf.getvalue()):,} bytes, CSV: {len(csv_buf.getvalue()):,} bytes)")

    finally:
        db.close()

    print("\n================ ALL 11 VERIFICATION SUITES PASSED! ================")

if __name__ == "__main__":
    run_direct_tests()
