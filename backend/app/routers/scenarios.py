from fastapi import APIRouter
from ..schemas.scenario import ScenarioRequest, ScenarioComparisonResponse
from ..services.scenario_engine import run_whatif_scenario

router = APIRouter(prefix="/scenarios", tags=["What-If Scenario Lab"])

@router.post("/evaluate", response_model=ScenarioComparisonResponse)
def evaluate_scenario(scenario_data: ScenarioRequest):
    """
    Evaluates policy shifts, fleet adoption jumps, extreme weather events,
    and capacity expansions against baseline forecast curves.
    """
    result = run_whatif_scenario(scenario_data)
    return result

@router.get("/presets")
def get_scenario_presets():
    """
    Returns pre-configured industrial scenario templates.
    """
    return [
        {
            "scenario_name": "Aggressive Commercial EV Transition (+50%)",
            "ev_adoption_growth_percent": 50.0,
            "additional_stations": 4,
            "charger_power_upgrade_percent": 30.0,
            "peak_tariff_surge_percent": 40.0,
            "weather_condition": "Mild / Normal (20°C)",
            "weekend_shift_active": False,
            "description": "Rapid electrification of light delivery and rideshare fleets."
        },
        {
            "scenario_name": "Winter Polar Vortex Heat-Pump Strain",
            "ev_adoption_growth_percent": 15.0,
            "additional_stations": 0,
            "charger_power_upgrade_percent": 0.0,
            "peak_tariff_surge_percent": 25.0,
            "weather_condition": "Cold Snap (-10°C)",
            "weekend_shift_active": False,
            "description": "Severe sub-zero freeze inducing battery preconditioning and cabin heating loads."
        },
        {
            "scenario_name": "Summer Heatwave & Peaker Plant Scarcity",
            "ev_adoption_growth_percent": 20.0,
            "additional_stations": 2,
            "charger_power_upgrade_percent": 15.0,
            "peak_tariff_surge_percent": 60.0,
            "weather_condition": "Heat Wave (38°C)",
            "weekend_shift_active": False,
            "description": "High thermal chiller loads coincident with regional grid emergency alerts."
        },
        {
            "scenario_name": "Weekend Transit & Tourism Surge",
            "ev_adoption_growth_percent": 25.0,
            "additional_stations": 2,
            "charger_power_upgrade_percent": 20.0,
            "peak_tariff_surge_percent": 10.0,
            "weather_condition": "Mild / Normal (20°C)",
            "weekend_shift_active": True,
            "description": "Recreational highway and coastal corridor demand redistribution."
        }
    ]
