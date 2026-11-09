from pydantic import BaseModel, Field
from typing import List, Dict, Optional

class ScenarioRequest(BaseModel):
    scenario_name: str = "Rapid EV Adoption Wave"
    ev_adoption_growth_percent: float = Field(default=25.0, ge=-50.0, le=200.0)
    additional_stations: int = Field(default=3, ge=0, le=20)
    charger_power_upgrade_percent: float = Field(default=20.0, ge=0.0, le=150.0)
    peak_tariff_surge_percent: float = Field(default=30.0, ge=-50.0, le=100.0)
    weather_condition: str = "Mild / Normal (20°C)"  # "Cold Snap (-10°C)", "Heat Wave (38°C)", "Mild / Normal (20°C)"
    weekend_shift_active: bool = False

class ScenarioHourlyPoint(BaseModel):
    hour: int
    baseline_demand_kw: float
    scenario_demand_kw: float
    delta_kw: float
    delta_percent: float
    baseline_cost_usd: float
    scenario_cost_usd: float

class MetricDelta(BaseModel):
    metric: str
    baseline: float
    scenario: float
    delta: float
    delta_percent: float
    unit: str
    impact: str  # positive, negative, neutral

class ScenarioComparisonResponse(BaseModel):
    scenario_name: str
    weather_applied: str
    summary_verdict: str
    metrics: List[MetricDelta]
    hourly_comparison: List[ScenarioHourlyPoint]
    key_findings: List[str]
    capacity_planning_actions: List[str]
