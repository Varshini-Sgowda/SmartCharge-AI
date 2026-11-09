from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class StationBase(BaseModel):
    station_id: str
    name: str
    region: str
    address: Optional[str] = None
    latitude: float
    longitude: float
    charger_type: str = "DC Fast"
    total_ports: int = 6
    max_power_kw: float = 150.0
    current_load_kw: float = 0.0
    utilization_rate: float = 0.0
    risk_level: str = "Low"
    status: str = "Online"
    recommended_action: Optional[str] = None

class StationCreate(StationBase):
    pass

class StationUpdate(BaseModel):
    name: Optional[str] = None
    region: Optional[str] = None
    total_ports: Optional[int] = None
    max_power_kw: Optional[float] = None
    status: Optional[str] = None
    risk_level: Optional[str] = None
    recommended_action: Optional[str] = None

class StationOut(StationBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class StationOverview(BaseModel):
    total_stations: int
    total_ports: int
    total_capacity_kw: float
    current_demand_kw: float
    average_utilization: float
    overload_risk_count: int
    underutilized_count: int
    stations: List[StationOut]
