from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean
from datetime import datetime
from ..database import Base

class FleetVehicle(Base):
    __tablename__ = "fleet_vehicles"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(String, unique=True, index=True, nullable=False)
    make_model = Column(String, nullable=False)
    battery_capacity_kwh = Column(Float, nullable=False)
    current_soc_percent = Column(Float, nullable=False)
    target_soc_percent = Column(Float, nullable=False)
    arrival_time = Column(DateTime, default=datetime.utcnow)
    departure_deadline = Column(DateTime, nullable=False)
    assigned_station_id = Column(String, nullable=True)
    status = Column(String, default="Idle")  # Idle, Scheduled, Charging, Ready
    created_at = Column(DateTime, default=datetime.utcnow)

class ChargingSchedule(Base):
    __tablename__ = "charging_schedules"

    id = Column(Integer, primary_key=True, index=True)
    schedule_id = Column(String, unique=True, index=True, nullable=False)
    vehicle_id = Column(String, index=True, nullable=False)
    station_id = Column(String, index=True, nullable=False)
    scheduled_start = Column(DateTime, nullable=False)
    scheduled_end = Column(DateTime, nullable=False)
    allocated_power_kw = Column(Float, nullable=False)
    required_energy_kwh = Column(Float, nullable=False)
    estimated_cost_usd = Column(Float, default=0.0)
    is_cost_optimized = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
