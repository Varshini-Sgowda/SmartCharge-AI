from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean
from datetime import datetime
from ..database import Base

class ChargingSession(Base):
    __tablename__ = "charging_sessions"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, unique=True, index=True, nullable=False)
    station_id = Column(String, index=True, nullable=False)
    vehicle_id = Column(String, nullable=True)
    start_time = Column(DateTime, index=True, nullable=False)
    end_time = Column(DateTime, nullable=False)
    duration_hours = Column(Float, nullable=False)
    energy_kwh = Column(Float, nullable=False)
    peak_power_kw = Column(Float, nullable=False)
    cost_usd = Column(Float, default=0.0)
    carbon_emissions_kg = Column(Float, default=0.0)
    is_peak_hour = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
