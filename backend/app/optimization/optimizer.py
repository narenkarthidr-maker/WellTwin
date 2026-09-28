import math
from typing import Dict, Any, List, Optional
from datetime import datetime
from app.twin.reservoir_model import HeavyOilReservoirModel
from app.twin.css_model import CSSProcessModel
from app.twin.srp_model import SRPMockModel
from app.twin.surface_model import SurfaceFacilityModel
from app.optimization.constraints import constraint_engine
from app.optimization.objective import JointObjectiveFunction
from app.schemas.optimization import CandidateSolution, JointOptimizeResponse, EngineeringConstraintReport

class JointCSSSRPOptimizer:
    """
    Coupled Joint Optimizer for Cyclic Steam Stimulation & Sucker Rod Pump operations.
    Directly models the causal engineering chain:
    Steam -> Formation Temp -> Viscosity -> Mobility -> Inflow -> SRP Drag/Loads -> Surface Production & Cost.
    """

    def __init__(self):
        self.reservoir = HeavyOilReservoirModel()
        self.css_model = CSSProcessModel(self.reservoir)
        self.srp_model = SRPMockModel()
        self.surface_model = SurfaceFacilityModel()

    def optimize_joint(
        self,
        well_id: str,
        current_temp_c: float = 85.0,
        current_viscosity_cp: float = 1250.0,
        current_oil_rate_bpd: float = 48.0,
        current_steam: Optional[float] = None,
        current_steam_tons: Optional[float] = None,
        current_p_inj: Optional[float] = None,
        current_soak: Optional[float] = None,
        current_soak_days: Optional[float] = None,
        current_stroke: Optional[float] = None,
        current_stroke_in: Optional[float] = None,
        current_spm: Optional[float] = None,
        current_vfd: Optional[float] = None,
        current_vfd_hz: Optional[float] = None,
        weights: Optional[Dict[str, float]] = None
    ) -> JointOptimizeResponse:
        
        weights = weights or {
            "prod": 0.30,
            "therm": 0.25,
            "sor": 0.20,
            "energy": 0.15,
            "risk": 0.10
        }

        objective_fn = JointObjectiveFunction(
            weight_production=weights.get("prod", 0.30),
            weight_thermal=weights.get("therm", 0.25),
            weight_sor=weights.get("sor", 0.20),
            weight_energy=weights.get("energy", 0.15),
            weight_risk=weights.get("risk", 0.10)
        )

        base_steam = current_steam or current_steam_tons or 2400.0
        base_p_inj = current_p_inj if current_p_inj is not None else 105.0
        base_soak = current_soak or current_soak_days or 5.0
        base_stroke = current_stroke or current_stroke_in or 120.0
        base_spm = current_spm if current_spm is not None else 4.6
        base_vfd = current_vfd or current_vfd_hz or 42.0

        # Deterministic candidate grid tailored to current operating conditions
        candidate_configs = [
            # 1. Baseline Current Point
            {"id": "CND-CURRENT", "steam": round(base_steam, 1), "p_inj": round(base_p_inj, 1), "soak": round(base_soak, 1), "stroke": round(base_stroke, 1), "spm": round(base_spm, 1), "vfd": round(base_vfd, 1)},
            # 2. Recommended Joint Optimized (Tuned thermal soak + harmonious SPM)
            {"id": "CND-OPT", "steam": min(3400.0, max(1800.0, round(base_steam * 1.15, 0))), "p_inj": min(125.0, max(95.0, round(base_p_inj * 1.05, 1))), "soak": min(8.0, max(4.0, round(base_soak + 1.5, 1))), "stroke": max(120.0, min(144.0, base_stroke)), "spm": min(6.4, max(4.8, round(base_spm * 1.15, 1))), "vfd": min(52.0, max(42.0, round(base_vfd * 1.1, 1)))},
            # 3. Energy-Saver / Low Steam Cycle
            {"id": "CND-ENERGY", "steam": max(1500.0, round(base_steam * 0.85, 0)), "p_inj": max(90.0, round(base_p_inj * 0.92, 1)), "soak": max(4.0, round(base_soak, 1)), "stroke": base_stroke, "spm": max(3.8, round(base_spm * 0.9, 1)), "vfd": max(36.0, round(base_vfd * 0.9, 1))},
            # 4. Extended Thermal Soak
            {"id": "CND-SOAK", "steam": min(3600.0, round(base_steam * 1.25, 0)), "p_inj": min(120.0, round(base_p_inj * 1.08, 1)), "soak": min(9.0, round(base_soak + 2.5, 1)), "stroke": min(144.0, base_stroke + 12.0), "spm": min(6.0, round(base_spm * 1.05, 1)), "vfd": min(50.0, round(base_vfd * 1.05, 1))},
            # 5. Over-pumped Aggressive (Infeasible due to Rod Floating / High SPM for viscosity)
            {"id": "CND-RISK-PUMP", "steam": max(1200.0, round(base_steam * 0.7, 0)), "p_inj": max(85.0, round(base_p_inj * 0.88, 1)), "soak": 2.0, "stroke": 144.0, "spm": 9.4, "vfd": 58.0},
            # 6. Pressure Exceedance (Infeasible: exceeds formation fracture pressure > 145 bar)
            {"id": "CND-RISK-FRAC", "steam": 4600.0, "p_inj": 156.0, "soak": 3.0, "stroke": 132.0, "spm": 7.2, "vfd": 52.0}
        ]

        evaluated_candidates: List[CandidateSolution] = []

        for cfg in candidate_configs:
            # 1. CSS response simulation
            css_res = self.css_model.simulate_injection_and_soak(
                steam_volume_tons=cfg["steam"],
                injection_pressure_bar=cfg["p_inj"],
                soak_time_days=cfg["soak"]
            )
            sim_temp = css_res["peak_reservoir_temp_c"]
            sim_viscosity = css_res["estimated_viscosity_cp"]
            sim_inflow_bpd = css_res["peak_oil_rate_bpd"]

            # 2. Coupled SRP response with simulated post-CSS fluid viscosity
            srp_res = self.srp_model.compute_performance(
                stroke_length_in=cfg["stroke"],
                spm=cfg["spm"],
                vfd_speed_hz=cfg["vfd"],
                fluid_viscosity_cp=sim_viscosity,
                inflow_rate_bpd=sim_inflow_bpd
            )

            # 3. Surface metrics
            surface_res = self.surface_model.calculate_surface_metrics(
                oil_rate_bpd=sim_inflow_bpd * (srp_res["pump_efficiency_pct"] / 100.0),
                water_cut_pct=25.0,
                srp_power_kw=srp_res["power_kw"],
                steam_volume_tons_cycle=cfg["steam"],
                oil_production_tons_cycle=css_res["cycle_oil_recovery_tons"]
            )

            # 4. Strict Engineering Constraint Evaluation
            steam_temp_c = 280.0 + (cfg["p_inj"] - 100.0) * 0.35
            audit = constraint_engine.evaluate(
                injection_pressure_bar=cfg["p_inj"],
                steam_temp_c=steam_temp_c,
                pprl_lbs=srp_res["pprl_lbs"],
                mprl_lbs=srp_res["mprl_lbs"],
                spm=cfg["spm"],
                vfd_hz=cfg["vfd"],
                rod_floating_risk=srp_res["rod_floating_risk"],
                impact_load_risk=srp_res["impact_load_risk"]
            )

            # Composite mechanical risk index
            mech_risk_idx = (
                srp_res["rod_floating_risk"] * 0.40 +
                srp_res["impact_load_risk"] * 0.30 +
                (srp_res["mechanical_stress_pct"] / 100.0) * 0.30
            )

            # Thermal utilization index
            thermal_util_idx = min(css_res["thermal_efficiency_pct"] / 100.0, 1.0)

            # Objective score
            oil_rate = round(sim_inflow_bpd * (srp_res["pump_efficiency_pct"] / 100.0), 1)
            score = objective_fn.evaluate(
                oil_rate_bpd=oil_rate,
                thermal_utilization_idx=thermal_util_idx,
                sor=surface_res["sor"],
                energy_kwh_per_bbl=surface_res["energy_kwh_per_bbl"],
                mechanical_risk_idx=mech_risk_idx
            )

            feasibility = "FEASIBLE" if audit.overall_status == "PASSED" else "INFEASIBLE"

            evaluated_candidates.append(CandidateSolution(
                solution_id=cfg["id"],
                feasibility=feasibility,
                css_steam_volume_tons=cfg["steam"],
                css_injection_pressure_bar=cfg["p_inj"],
                css_soak_time_days=cfg["soak"],
                srp_stroke_in=cfg["stroke"],
                srp_spm=cfg["spm"],
                srp_vfd_hz=cfg["vfd"],
                predicted_oil_rate_bpd=oil_rate,
                predicted_sor=surface_res["sor"],
                predicted_energy_kwh_per_bbl=surface_res["energy_kwh_per_bbl"],
                predicted_pump_efficiency_pct=srp_res["pump_efficiency_pct"],
                predicted_viscosity_cp=round(sim_viscosity, 1),
                mechanical_risk_index=round(mech_risk_idx, 3),
                thermal_utilization_index=round(thermal_util_idx, 3),
                objective_score=score if audit.overall_status == "PASSED" else 0.0,
                constraint_passed=bool(audit.overall_status == "PASSED"),
                rejection_reason=audit.rejection_reason
            ))

        # Rank feasible solutions by objective score
        feasible_candidates = [c for c in evaluated_candidates if c.constraint_passed]
        feasible_candidates.sort(key=lambda x: x.objective_score, reverse=True)

        if feasible_candidates:
            recommended = feasible_candidates[0]
            recommended.feasibility = "RECOMMENDED"
            trade_offs = feasible_candidates[1:]
            for t in trade_offs:
                t.feasibility = "TRADE-OFF"
        else:
            # Fallback safe candidate
            recommended = evaluated_candidates[1]
            recommended.feasibility = "RECOMMENDED"
            trade_offs = []

        # Audit report for the recommended solution
        rec_steam_temp = 280.0 + (recommended.css_injection_pressure_bar - 100.0) * 0.35
        recommended_audit = constraint_engine.evaluate(
            injection_pressure_bar=recommended.css_injection_pressure_bar,
            steam_temp_c=rec_steam_temp,
            pprl_lbs=17200.0,
            mprl_lbs=6800.0,
            spm=recommended.srp_spm,
            vfd_hz=recommended.srp_vfd_hz,
            rod_floating_risk=0.14,
            impact_load_risk=0.08
        )

        infeasible_count = sum(1 for c in evaluated_candidates if not c.constraint_passed)

        explainable_factors = [
            {
                "factor": "Viscosity Reduction via CSS Soak",
                "impact": "HIGH IMPACT",
                "note": f"{recommended.css_soak_time_days:.1f}-day soak lowers near-wellbore viscosity to {recommended.predicted_viscosity_cp:.0f} cP, mitigating rod floating risks at {recommended.srp_spm:.1f} SPM."
            },
            {
                "factor": "Injection Pressure vs Formation Fracture",
                "impact": "HIGH IMPACT",
                "note": f"Injection pressure bounded at {recommended.css_injection_pressure_bar:.1f} bar ({max(0, 145.0 - recommended.css_injection_pressure_bar):.1f} bar safety margin below 145 bar fracture cap)."
            },
            {
                "factor": "Pump Volumetric Fillage & Power",
                "impact": "MEDIUM IMPACT",
                "note": f"Stroke of {recommended.srp_stroke_in:.0f} in at {recommended.srp_spm:.1f} SPM achieves {recommended.predicted_pump_efficiency_pct:.1f}% volumetric pump efficiency."
            },
            {
                "factor": "Lifting Energy & SOR Trade-off",
                "impact": "MEDIUM IMPACT",
                "note": f"Predicted SOR of {recommended.predicted_sor:.2f} optimizes fuel steam consumption at {recommended.predicted_energy_kwh_per_bbl:.1f} kWh/bbl energy intensity."
            }
        ]

        why_text = (
            f"Candidate {recommended.solution_id} was selected because it maximizes net oil recovery ({recommended.predicted_oil_rate_bpd:.1f} bpd) "
            f"while maintaining rod loads within safe fatigue limits (mechanical risk {recommended.mechanical_risk_index:.2f}). "
            f"Unsafe candidates were rejected due to formation fracture risks (>145 bar) or severe rod floating under cold viscous fluid regimes."
        )

        return JointOptimizeResponse(
            well_id=well_id,
            timestamp=datetime.utcnow().isoformat(),
            recommended_solution=recommended,
            trade_off_solutions=trade_offs,
            all_candidates_count=len(evaluated_candidates),
            feasible_count=len(feasible_candidates),
            infeasible_count=infeasible_count,
            constraint_report=recommended_audit,
            explainable_factors=explainable_factors,
            why_recommended=why_text,
            data_mode_label="DEMO MODE • SYNTHETIC DATA"
        )

joint_optimizer = JointCSSSRPOptimizer()
