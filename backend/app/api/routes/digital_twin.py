from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Any
from app.services.digital_twin_service import digital_twin_service

router = APIRouter(prefix="/digital-twin", tags=["Digital Twin"])

class RecalculateRequest(BaseModel):
    steam_volume_tons: float = 2600.0
    injection_pressure_bar: float = 112.0
    soak_time_days: float = 5.0
    stroke_length_in: float = 120.0
    spm: float = 5.0
    vfd_speed_hz: float = 45.0

@router.get("/{well_id}", summary="Get complete 4-layer well-to-surface digital twin state")
def get_digital_twin_state(well_id: str) -> Dict[str, Any]:
    return digital_twin_service.get_full_twin_state(well_id.upper())

@router.post("/{well_id}/recalculate", summary="Interactive physics recalculation for modified parameters")
def recalculate_digital_twin(well_id: str, req: RecalculateRequest) -> Dict[str, Any]:
    return digital_twin_service.compute_custom_twin_state(
        well_id=well_id.upper(),
        steam_volume_tons=req.steam_volume_tons,
        injection_pressure_bar=req.injection_pressure_bar,
        soak_time_days=req.soak_time_days,
        stroke_length_in=req.stroke_length_in,
        spm=req.spm,
        vfd_speed_hz=req.vfd_speed_hz
    )
