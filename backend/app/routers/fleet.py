from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.fleet import FleetVehicle
from ..schemas.fleet import FleetVehicleCreate, FleetVehicleOut, FleetScheduleRequest, FleetScheduleResult
from ..services.fleet_scheduler import schedule_fleet, DEFAULT_FLEET

router = APIRouter(prefix="/fleet", tags=["Fleet Management"])

@router.get("/vehicles")
def get_fleet_vehicles():
    """
    Returns active fleet vehicles for commercial charging dispatch.
    """
    return DEFAULT_FLEET

@router.post("/schedule", response_model=FleetScheduleResult)
def run_fleet_scheduling(req: FleetScheduleRequest):
    """
    Runs an Earliest Deadline First (EDF) and power-constrained scheduling algorithm
    across the fleet to minimize electricity cost while meeting all departure deadlines.
    """
    result = schedule_fleet(
        vehicles=DEFAULT_FLEET,
        max_station_power_kw=req.max_station_power_kw,
        objective=req.optimization_objective
    )
    return result
