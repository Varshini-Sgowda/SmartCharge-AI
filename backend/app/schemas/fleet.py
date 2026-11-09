from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class FleetVehicleBase(BaseModel):
    vehicle_id: str
    make_model: str
    battery_capacity_kwh: float = 75.0
    current_soc_percent: float = 20.0
    target_soc_percent: float = 85.0
    departure_deadline: datetime
    assigned_station_id: Optional[str] = "STA-001"

class FleetVehicleCreate(FleetVehicleBase):
    pass

class FleetVehicleOut(FleetVehicleBase):
    id: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class ScheduleItem(BaseModel):
    vehicle_id: str
    make_model: str
    station_id: str
    start_hour: int
    end_hour: int
    duration_hours: float
    allocated_power_kw: float
    energy_delivered_kwh: float
    scheduled_cost_usd: float
    unmanaged_cost_usd: float
    cost_savings_usd: float
    is_deadline_met: bool
    status: str

class FleetScheduleRequest(BaseModel):
    optimization_objective: str = "Cost & Peak Avoidance"  # "Cost & Peak Avoidance", "Fastest Turnaround", "Carbon Minimization"
    max_station_power_kw: float = 250.0

class FleetScheduleResult(BaseModel):
    total_vehicles_scheduled: int
    all_deadlines_met: bool
    total_energy_kwh: float
    optimized_cost_usd: float
    unmanaged_cost_usd: float
    total_savings_usd: float
    savings_percent: float
    peak_draw_kw: float
    schedules: List[ScheduleItem]
    hourly_fleet_load: List[dict]
    scheduling_notes: List[str]
