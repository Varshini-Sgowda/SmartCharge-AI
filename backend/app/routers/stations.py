from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.station import ChargingStation
from ..schemas.station import StationOut, StationCreate, StationUpdate, StationOverview
from ..services.data_pipeline import STATION_METADATA
from ..services.ml_engine import ml_engine

router = APIRouter(prefix="/stations", tags=["Stations"])

def init_stations_if_empty(db: Session):
    count = db.query(ChargingStation).count()
    if count == 0:
        forecast = ml_engine.predict_future(horizon_hours=24)
        st_forecasts = {s["station_id"]: s for s in forecast["station_forecasts"]}

        for s in STATION_METADATA:
            sf = st_forecasts.get(s["station_id"], {})
            util = sf.get("predicted_utilization", 55.0)
            risk = sf.get("risk_level", "Low")
            action = sf.get("recommended_action", "Nominal operation")

            st_obj = ChargingStation(
                station_id=s["station_id"],
                name=s["name"],
                region=s["region"],
                address=f"{s['region']}, San Francisco Bay Area, CA",
                latitude=s["latitude"],
                longitude=s["longitude"],
                charger_type=s["charger_type"],
                total_ports=s["total_ports"],
                max_power_kw=s["max_power_kw"],
                current_load_kw=round(s["max_power_kw"] * (util / 100.0) * 0.75, 1),
                utilization_rate=util,
                risk_level=risk,
                status="Online",
                recommended_action=action
            )
            db.add(st_obj)
        db.commit()

@router.get("", response_model=List[StationOut])
def get_all_stations(db: Session = Depends(get_db)):
    init_stations_if_empty(db)
    return db.query(ChargingStation).all()

@router.get("/overview", response_model=StationOverview)
def get_stations_overview(db: Session = Depends(get_db)):
    init_stations_if_empty(db)
    stations = db.query(ChargingStation).all()

    total_ports = sum(s.total_ports for s in stations)
    total_capacity = sum(s.max_power_kw for s in stations)
    current_demand = sum(s.current_load_kw for s in stations)
    avg_util = sum(s.utilization_rate for s in stations) / len(stations) if stations else 0.0
    overload_count = sum(1 for s in stations if s.risk_level in ["High", "Critical"])
    under_count = sum(1 for s in stations if s.utilization_rate < 40.0)

    return {
        "total_stations": len(stations),
        "total_ports": total_ports,
        "total_capacity_kw": round(total_capacity, 1),
        "current_demand_kw": round(current_demand, 1),
        "average_utilization": round(avg_util, 1),
        "overload_risk_count": overload_count,
        "underutilized_count": under_count,
        "stations": stations
    }

@router.get("/{station_id}", response_model=StationOut)
def get_station_by_id(station_id: str, db: Session = Depends(get_db)):
    init_stations_if_empty(db)
    st = db.query(ChargingStation).filter(ChargingStation.station_id == station_id).first()
    if not st:
        raise HTTPException(status_code=404, detail=f"Station with ID {station_id} not found")
    return st

@router.patch("/{station_id}", response_model=StationOut)
def update_station(station_id: str, patch: StationUpdate, db: Session = Depends(get_db)):
    st = db.query(ChargingStation).filter(ChargingStation.station_id == station_id).first()
    if not st:
        raise HTTPException(status_code=404, detail="Station not found")

    update_data = patch.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(st, key, value)

    db.commit()
    db.refresh(st)
    return st
