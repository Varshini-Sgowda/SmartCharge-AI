from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class CopilotQuery(BaseModel):
    query: str
    context_filters: Optional[Dict[str, Any]] = None

class CopilotResponse(BaseModel):
    query: str
    answer: str
    intent_detected: str
    confidence_score: float
    data_points: Dict[str, Any]
    suggested_actions: List[str]
    follow_up_questions: List[str]
