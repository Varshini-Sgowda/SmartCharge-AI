from fastapi import APIRouter
from ..schemas.simulation import SimulationRequest, SimulationResult
from ..services.digital_twin import simulate_digital_twin

router = APIRouter(prefix="/simulator", tags=["Digital Twin"])

@router.post("/run", response_model=SimulationResult)
def run_simulation(params: SimulationRequest):
    """
    Executes an interactive Monte Carlo & queuing simulation of the EV charging network.
    Dynamically recalculates power load, grid strain, queuing delay, and battery storage buffering.
    """
    result = simulate_digital_twin(params)
    return result

@router.get("/defaults", response_model=SimulationRequest)
def get_simulation_defaults():
    """
    Returns baseline parameter presets for the Digital Twin.
    """
    return SimulationRequest()
