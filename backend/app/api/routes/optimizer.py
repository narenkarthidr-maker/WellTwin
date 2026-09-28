from fastapi import APIRouter
from app.schemas.optimization import JointOptimizeRequest, JointOptimizeResponse
from app.optimization.optimizer import joint_optimizer

router = APIRouter(prefix="/optimizer", tags=["Joint Optimizer"])

@router.post("/joint", response_model=JointOptimizeResponse, summary="Coupled Joint CSS + SRP Optimizer")
def optimize_joint(req: JointOptimizeRequest):
    weights = {
        "prod": req.target_production_weight,
        "therm": req.thermal_utilization_weight,
        "sor": req.sor_reduction_weight,
        "energy": req.energy_minimization_weight,
        "risk": req.mechanical_risk_weight
    }
    return joint_optimizer.optimize_joint(
        well_id=req.well_id,
        current_temp_c=req.current_temp_c or 82.4,
        current_viscosity_cp=req.current_viscosity_cp or 1250.0,
        current_oil_rate_bpd=req.current_oil_rate_bpd or 48.5,
        current_steam=req.current_steam_volume_tons or 2600.0,
        current_p_inj=req.current_injection_pressure_bar or 112.0,
        current_soak=req.current_soak_time_days or 5.0,
        current_stroke=req.current_stroke_length_in or 120.0,
        current_spm=req.current_spm or 5.2,
        current_vfd=req.current_vfd_hz or 45.0,
        weights=weights
    )
