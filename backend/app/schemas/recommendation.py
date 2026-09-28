from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime
from app.schemas.optimization import EngineeringConstraintReport

class RecommendationResponse(BaseModel):
    id: int
    well_id: str
    created_at: datetime
    recommendation_type: str
    title: str
    what_action: str
    why_explanation: str
    expected_effect: str
    confidence_pct: Optional[float] = None
    constraint_status: str
    constraint_details: Optional[Dict[str, Any]] = None
    payload: Dict[str, Any]
    approval_status: str # "PENDING_REVIEW", "APPROVED_FOR_SIMULATION", "REJECTED"
    approved_at: Optional[datetime] = None
    approved_by: Optional[str] = None
    disclaimer: str = "Decision-support prototype — operator approval required."

    class Config:
        from_attributes = True

class RecommendationApprovalRequest(BaseModel):
    recommendation_id: int
    action: str # "APPROVE_FOR_SIMULATION" or "REJECT"
    engineer_name: str = "Chief Production Engineer (Bikaner-Nagaur Asset)"
    notes: Optional[str] = None

class RecommendationValidationResponse(BaseModel):
    recommendation_id: int
    constraint_report: EngineeringConstraintReport
    is_safe_for_field: bool
    review_status: str
