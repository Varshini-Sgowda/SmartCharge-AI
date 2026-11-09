from fastapi import APIRouter
from ..services.carbon_service import get_carbon_intelligence

router = APIRouter(prefix="/carbon", tags=["Carbon Intelligence"])

@router.get("/metrics")
def get_carbon_metrics():
    """
    Returns estimated carbon emissions, ICE displacement analytics,
    clean solar windows, and decarbonization roadmap scenarios.
    """
    return get_carbon_intelligence()
