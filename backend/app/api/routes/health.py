from fastapi import APIRouter
from typing import Dict, Any
from app.services.health_service import health_service

router = APIRouter(prefix="/health", tags=["Predictive Health"])

@router.get("/{well_id}", summary="Get predictive well health indicators and risk cards")
def get_well_health_metrics(well_id: str) -> Dict[str, Any]:
    return health_service.get_well_health(well_id.upper())
