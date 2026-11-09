from pydantic import BaseModel, Field
from typing import List, Dict, Any

class SimulationRequest(BaseModel):
    num_evs: int = Field(default=450, ge=50, le=5000, description="Total active EV population")
    num_stations: int = Field(default=12, ge=2, le=50, description="Active charging hubs")
    charger_capacity_kw: float = Field(default=150.0, ge=7.0, le=350.0, description="Charger rating per stall")
    arrival_rate_per_hour: float = Field(default=35.0, ge=5.0, le=200.0, description="Mean EV arrival rate")
    avg_charging_duration_min: float = Field(default=35.0, ge=10.0, le=180.0, description="Mean charging duration in minutes")
    peak_multiplier: float = Field(default=1.4, ge=0.5, le=3.0, description="Peak load multiplier")
    battery_storage_kw: float = Field(default=100.0, ge=0.0, le=1000.0, description="Onsite Battery Energy Storage System (BESS)")

class HourlySimPoint(BaseModel):
    hour: int
    grid_demand_kw: float
    bess_discharge_kw: float
    active_evs: int
    queue_wait_min: float
    utilization_rate: float
    overload_risk: bool

class SimulationResult(BaseModel):
    total_energy_kwh: float
    peak_demand_kw: float
    peak_hour: int
    avg_station_utilization_percent: float
    overload_probability_percent: float
    avg_queue_delay_minutes: float
    estimated_daily_cost_usd: float
    bess_cost_savings_usd: float
    estimated_carbon_kg: float
    status_summary: str
    hourly_simulation: List[HourlySimPoint]
    station_stresses: List[Dict[str, Any]]
    system_recommendations: List[str]
