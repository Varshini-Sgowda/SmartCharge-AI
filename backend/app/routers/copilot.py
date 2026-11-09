from fastapi import APIRouter
from ..schemas.copilot import CopilotQuery, CopilotResponse
from ..services.copilot_service import ask_copilot

router = APIRouter(prefix="/copilot", tags=["AI Copilot"])

@router.post("/query", response_model=CopilotResponse)
def query_copilot(payload: CopilotQuery):
    """
    Answers user operational, financial, and predictive energy questions using
    actual project data, ML metrics, and scenario simulations.
    """
    return ask_copilot(query=payload.query, context_filters=payload.context_filters)

@router.get("/suggested_prompts")
def get_suggested_prompts():
    """
    Returns curated quick-access prompt queries for instant answers.
    """
    return [
        "Why is demand increasing?",
        "Which station is likely to overload tomorrow?",
        "Which charging stations are underutilized?",
        "How can energy costs be reduced?",
        "What happens if EV adoption increases by 30%?",
        "What is the model accuracy and R2 score?",
        "What is the optimal charging schedule?"
    ]
