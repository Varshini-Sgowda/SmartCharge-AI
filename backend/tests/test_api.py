import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "SmartCharge" in data["app"]

def test_auth_login():
    response = client.post("/api/auth/login", json={
        "username_or_email": "operator",
        "password": "operator123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["username"] == "operator"

def test_dashboard_metrics():
    response = client.get("/api/dashboard/metrics")
    assert response.status_code == 200
    data = response.json()
    assert data["total_stations"] == 12
    assert "forecasted_peak_demand_kw" in data
    assert data["average_station_utilization_percent"] > 0

def test_dashboard_visualizations():
    response = client.get("/api/dashboard/visualizations")
    assert response.status_code == 200
    data = response.json()
    assert len(data["actual_vs_predicted"]) == 24
    assert len(data["heatmap"]) == 24
    assert len(data["station_utilization"]) == 12

def test_forecast_endpoint():
    response = client.get("/api/forecast?horizon_hours=24&model_type=RandomForest")
    assert response.status_code == 200
    data = response.json()
    assert data["horizon_hours"] == 24
    assert len(data["hourly_forecast"]) == 24
    assert data["metrics"]["r2_score"] > 0.80

def test_digital_twin_simulation():
    response = client.post("/api/simulator/run", json={
        "num_evs": 500,
        "num_stations": 12,
        "charger_capacity_kw": 150.0,
        "arrival_rate_per_hour": 40.0,
        "avg_charging_duration_min": 35.0,
        "peak_multiplier": 1.4,
        "battery_storage_kw": 100.0
    })
    assert response.status_code == 200
    data = response.json()
    assert data["peak_demand_kw"] > 0
    assert len(data["hourly_simulation"]) == 24

def test_whatif_scenario():
    response = client.post("/api/scenarios/evaluate", json={
        "scenario_name": "Test Surge",
        "ev_adoption_growth_percent": 25.0,
        "additional_stations": 3,
        "charger_power_upgrade_percent": 20.0,
        "peak_tariff_surge_percent": 30.0,
        "weather_condition": "Mild / Normal (20°C)",
        "weekend_shift_active": False
    })
    assert response.status_code == 200
    data = response.json()
    assert len(data["metrics"]) > 0
    assert len(data["hourly_comparison"]) == 24

def test_fleet_scheduler():
    response = client.post("/api/fleet/schedule", json={
        "optimization_objective": "Cost & Peak Avoidance",
        "max_station_power_kw": 350.0
    })
    assert response.status_code == 200
    data = response.json()
    assert data["total_vehicles_scheduled"] > 0
    assert data["total_savings_usd"] >= 0

def test_copilot_query():
    response = client.post("/api/copilot/query", json={
        "query": "Which station is likely to overload tomorrow?"
    })
    assert response.status_code == 200
    data = response.json()
    assert "answer" in data
    assert data["confidence_score"] > 0.8

def test_carbon_metrics():
    response = client.get("/api/carbon/metrics")
    assert response.status_code == 200
    data = response.json()
    assert "net_carbon_avoided_kg" in data
    assert data["total_energy_forecast_kwh"] > 0

def test_report_csv_generation():
    response = client.get("/api/reports/csv")
    assert response.status_code == 200
    assert "text/csv" in response.headers["content-type"]
    assert len(response.content) > 100

def test_report_pdf_generation():
    response = client.get("/api/reports/pdf")
    assert response.status_code == 200
    assert "application/pdf" in response.headers["content-type"]
    assert len(response.content) > 1000
