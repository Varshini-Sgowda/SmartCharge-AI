from fastapi import APIRouter, Query
from ..services.optimizer_service import get_smart_charging_recommendations

router = APIRouter(prefix="/optimizer", tags=["Optimizer"])

@router.get("/recommendations")
def get_recommendations(session_kwh: float = Query(default=50.0, ge=10.0, le=150.0)):
    """
    Returns tariff-aware charging recommendations, optimal cost windows,
    clean energy alignment, and station load balancing pairs.
    """
    return get_smart_charging_recommendations(session_kwh=session_kwh)
