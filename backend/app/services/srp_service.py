from typing import Dict, Any, List
from app.twin.srp_model import SRPMockModel
from app.services.dataset_service import dataset_service
from app.optimization.constraints import constraint_engine
from app.schemas.optimization import (
    SRPPredictionRequest, SRPPredictionResponse,
    SRPOptimizeRequest, SRPOptimizeResponse
)

class SRPService:
    def __init__(self):
        self.srp_model = SRPMockModel()

    def predict(self, req: SRPPredictionRequest) -> SRPPredictionResponse:
        # Resolve viscosity from well state if not passed
        viscosity = req.fluid_viscosity_cp
        if viscosity is None:
            latest = dataset_service.get_latest_point(req.well_id)
            viscosity = latest.get("viscosity_cp", 1250.0)

        res = self.srp_model.compute_performance(
            stroke_length_in=req.stroke_length_in,
            spm=req.spm,
            vfd_speed_hz=req.vfd_speed_hz,
            fluid_viscosity_cp=viscosity
        )

        report = constraint_engine.evaluate(
            injection_pressure_bar=110.0,
            steam_temp_c=285.0,
            pprl_lbs=res["pprl_lbs"],
            mprl_lbs=res["mprl_lbs"],
            spm=req.spm,
            vfd_hz=req.vfd_speed_hz,
            rod_floating_risk=res["rod_floating_risk"],
            impact_load_risk=res["impact_load_risk"]
        )

        return SRPPredictionResponse(
            well_id=req.well_id,
            pump_efficiency_pct=res["pump_efficiency_pct"],
            peak_polished_rod_load_lbs=res["pprl_lbs"],
            min_polished_rod_load_lbs=res["mprl_lbs"],
            pump_fillage_pct=res["pump_fillage_pct"],
            rod_floating_risk=res["rod_floating_risk"],
            impact_load_risk=res["impact_load_risk"],
            pump_unsetting_risk=res["pump_unsetting_risk"],
            mechanical_stress_pct=res["mechanical_stress_pct"],
            power_consumption_kw=res["power_kw"],
            operating_status=res["operating_status"],
            constraint_report=report,
            is_model_prediction=True
        )

    def optimize(self, req: SRPOptimizeRequest) -> SRPOptimizeResponse:
        viscosity = req.fluid_viscosity_cp
        if viscosity is None:
            latest = dataset_service.get_latest_point(req.well_id)
            viscosity = latest.get("viscosity_cp", 1250.0)

        # Generate SPM sweep curve for the chart: SPM vs Efficiency and SPM vs Mechanical Risk
        curve_data: List[Dict[str, Any]] = []
        best_spm = 4.8
        best_score = -999.0
        
        for spm_val in [2.0, 3.0, 4.0, 4.8, 5.5, 6.2, 7.0, 8.0, 9.5, 11.0]:
            p = self.srp_model.compute_performance(
                stroke_length_in=req.current_stroke_in,
                spm=spm_val,
                vfd_speed_hz=42.0 + (spm_val * 1.5),
                fluid_viscosity_cp=viscosity
            )
            # Mechanical risk composite (0 to 100 scale for plotting beside efficiency)
            mech_risk_scaled = round((p["rod_floating_risk"] * 0.5 + p["impact_load_risk"] * 0.3 + (p["mechanical_stress_pct"] / 100.0) * 0.2) * 100.0, 1)
            eff = p["pump_efficiency_pct"]
            
            # Safe operating window is where efficiency is high (>65%) and mechanical risk is low (<35%)
            net_margin = eff - mech_risk_scaled
            if net_margin > best_score and p["rod_floating_risk"] < 0.38:
                best_score = net_margin
                best_spm = spm_val

            curve_data.append({
                "spm": spm_val,
                "pump_efficiency_pct": eff,
                "mechanical_risk_pct": mech_risk_scaled,
                "rod_floating_risk": round(p["rod_floating_risk"], 3),
                "is_in_safe_window": (eff >= 60.0 and mech_risk_scaled <= 38.0)
            })

        # Calculate safe window bounds
        safe_spms = [c["spm"] for c in curve_data if c["is_in_safe_window"]]
        min_safe = min(safe_spms) if safe_spms else 3.5
        max_safe = max(safe_spms) if safe_spms else 5.8

        opt_p = self.srp_model.compute_performance(
            stroke_length_in=req.current_stroke_in,
            spm=best_spm,
            vfd_speed_hz=45.0,
            fluid_viscosity_cp=viscosity
        )

        report = constraint_engine.evaluate(
            injection_pressure_bar=110.0,
            steam_temp_c=285.0,
            pprl_lbs=opt_p["pprl_lbs"],
            mprl_lbs=opt_p["mprl_lbs"],
            spm=best_spm,
            vfd_hz=45.0,
            rod_floating_risk=opt_p["rod_floating_risk"],
            impact_load_risk=opt_p["impact_load_risk"]
        )

        explanation = (
            "The recommended operating window balances production performance and mechanical risk. "
            f"At fluid viscosity {int(viscosity)} cP, exceeding {max_safe:.1f} SPM sharply increases rod floating "
            f"and compressive buckling risk on downstroke, while operating below {min_safe:.1f} SPM compromises pump fillage efficiency."
        )

        return SRPOptimizeResponse(
            well_id=req.well_id,
            safe_spm_window={"min_spm": min_safe, "max_spm": max_safe, "optimal_spm": best_spm},
            safe_stroke_window={"min_stroke_in": 108.0, "max_stroke_in": 144.0, "optimal_stroke_in": 120.0},
            optimal_vfd_hz=44.5,
            predicted_pump_efficiency_pct=opt_p["pump_efficiency_pct"],
            predicted_rod_load_lbs=opt_p["pprl_lbs"],
            curve_data=curve_data,
            constraint_report=report,
            explanation=explanation
        )

srp_service = SRPService()
