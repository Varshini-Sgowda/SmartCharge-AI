from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime
from ..database import Base

class ChargingStation(Base):
    __tablename__ = "charging_stations"

    id = Column(Integer, primary_key=True, index=True)
    station_id = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    region = Column(String, index=True, nullable=False)
    address = Column(String, nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    charger_type = Column(String, default="DC Fast")
    total_ports = Column(Integer, default=6)
    max_power_kw = Column(Float, default=150.0)
    current_load_kw = Column(Float, default=0.0)
    utilization_rate = Column(Float, default=0.0)  # 0.0 to 100.0%
    risk_level = Column(String, default="Low")     # Low, Moderate, High, Critical
    status = Column(String, default="Online")       # Online, Maintenance, Degraded
    recommended_action = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
