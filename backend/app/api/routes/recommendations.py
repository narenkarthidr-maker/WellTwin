from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any, Optional
from app.services.recommendation_service import recommendation_service
from app.schemas.recommendation import (
    RecommendationResponse, RecommendationApprovalRequest,
    RecommendationValidationResponse
)
from app.optimization.constraints import constraint_engine

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])

@router.get("", summary="List explainable engineering recommendations")
def list_recommendations(well_id: Optional[str] = None):
    return recommendation_service.list_recommendations(well_id)

@router.post("/validate", summary="Validate engineering constraints for recommendation")
def validate_recommendation(payload: Dict[str, Any]):
    report = constraint_engine.evaluate(
        injection_pressure_bar=payload.get("injection_pressure_bar", 115.0),
        steam_temp_c=payload.get("steam_temp_c", 285.0),
        pprl_lbs=payload.get("pprl_lbs", 17200.0),
        mprl_lbs=payload.get("mprl_lbs", 6800.0),
        spm=payload.get("spm", 5.0),
        vfd_hz=payload.get("vfd_hz", 45.0),
        rod_floating_risk=payload.get("rod_floating_risk", 0.14),
        impact_load_risk=payload.get("impact_load_risk", 0.08)
    )
    return {
        "constraint_report": report,
        "is_safe_for_field": bool(report.overall_status == "PASSED"),
        "status": "APPROVED_ENGINEERING_CHECK" if report.overall_status == "PASSED" else "REJECTED_VIOLATION"
    }

@router.post("/approve", summary="Human-in-the-loop review and approval for simulation")
def approve_recommendation(req: RecommendationApprovalRequest):
    res = recommendation_service.update_approval(
        rec_id=req.recommendation_id,
        action=req.action,
        engineer_name=req.engineer_name,
        notes=req.notes
    )
    if not res["success"]:
        raise HTTPException(status_code=404, detail=res["message"])
    return res
