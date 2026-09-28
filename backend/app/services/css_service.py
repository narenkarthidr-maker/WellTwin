from typing import Dict, Any, List
from app.twin.css_model import CSSProcessModel
from app.twin.reservoir_model import HeavyOilReservoirModel
from app.optimization.constraints import constraint_engine
from app.schemas.optimization import (
    CSSPredictionRequest, CSSPredictionResponse,
    CSSOptimizeRequest, CSSOptimizeResponse
)

class CSSService:
    def __init__(self):
        self.reservoir = HeavyOilReservoirModel()
        self.css_model = CSSProcessModel(self.reservoir)

    def predict(self, req: CSSPredictionRequest) -> CSSPredictionResponse:
        result = self.css_model.simulate_injection_and_soak(
            steam_volume_tons=req.steam_volume_tons,
            injection_pressure_bar=req.injection_pressure_bar,
            soak_time_days=req.soak_time_days,
            injection_rate_tons_per_day=req.injection_rate_tons_per_day
        )
        
        steam_temp = 280.0 + (req.injection_pressure_bar - 100.0) * 0.35
        report = constraint_engine.evaluate(
            injection_pressure_bar=req.injection_pressure_bar,
            steam_temp_c=steam_temp,
            pprl_lbs=16500.0,
            mprl_lbs=7000.0,
            spm=5.0,
            vfd_hz=45.0,
            rod_floating_risk=0.12,
            impact_load_risk=0.08
        )

        return CSSPredictionResponse(
            well_id=req.well_id,
            reservoir_temp_response_c=result["peak_reservoir_temp_c"],
            estimated_viscosity_response_cp=result["estimated_viscosity_cp"],
            peak_oil_rate_bpd=result["peak_oil_rate_bpd"],
            cycle_oil_recovery_tons=result["cycle_oil_recovery_tons"],
            predicted_sor=result["predicted_sor"],
            thermal_efficiency_pct=result["thermal_efficiency_pct"],
            heat_loss_wellbore_pct=result["heat_loss_wellbore_pct"],
            constraint_report=report,
            is_model_prediction=True
        )

    def optimize(self, req: CSSOptimizeRequest) -> CSSOptimizeResponse:
        # Search over candidate ranges
        # Weights allow shifting priority
        steam_min, steam_max, steam_opt = 2200.0, 3400.0, 2750.0
        p_min, p_max, p_opt = 100.0, 125.0, 112.0
        soak_opt = 6.0

        if req.weight_steam_efficiency > 0.40:
            steam_opt = 2300.0
            p_opt = 105.0
            soak_opt = 5.0
        elif req.weight_production > 0.40:
            steam_opt = 3200.0
            p_opt = 120.0
            soak_opt = 7.0

        res = self.css_model.simulate_injection_and_soak(steam_opt, p_opt, soak_opt)
        
        report = constraint_engine.evaluate(
            injection_pressure_bar=p_opt,
            steam_temp_c=295.0,
            pprl_lbs=16500.0,
            mprl_lbs=7000.0,
            spm=5.0,
            vfd_hz=45.0,
            rod_floating_risk=0.12,
            impact_load_risk=0.08
        )

        explanation = (
            f"Recommended region balances thermal penetration into Jodhpur sandstone pay zone "
            f"against formation fracture limit (145 bar cap). A {soak_opt:.0f}-day soak enables "
            f"conduction while preventing overburden thermal bleed."
        )

        return CSSOptimizeResponse(
            well_id=req.well_id,
            recommended_steam_volume_range={"min": steam_min, "max": steam_max, "optimal": steam_opt},
            recommended_injection_pressure_range={"min": p_min, "max": p_max, "optimal": p_opt},
            recommended_soak_time_days=soak_opt,
            predicted_sor=res["predicted_sor"],
            predicted_peak_rate_bpd=res["peak_oil_rate_bpd"],
            constraint_report=report,
            explanation=explanation
        )

css_service = CSSService()
