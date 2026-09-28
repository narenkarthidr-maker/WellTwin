import math
from typing import Dict, Any, List

class SRPMockModel:
    """
    Sucker Rod Pump (SRP) mechanics model for heavy viscous oil pumping.
    Models the direct physics coupling between fluid viscosity and pump performance:
    - Rod string buoyant weight vs viscous drag force
    - Rod floating limit (downstroke velocity vs fluid viscosity)
    - Volumetric efficiency as a function of pump fillage and fluid slip
    - Peak Polished Rod Load (PPRL) and Minimum Polished Rod Load (MPRL)
    - Impact loading / fluid pound risk
    """

    def __init__(
        self,
        plunger_diameter_in: float = 2.25,
        rod_string_weight_lbs_per_ft: float = 2.2, # Grade D/High-strength tapered rod string
        well_depth_ft: float = 3770.0, # ~1150 m
        tubing_id_in: float = 2.992
    ):
        self.plunger_diameter_in = plunger_diameter_in
        self.rod_string_weight_lbs_per_ft = rod_string_weight_lbs_per_ft
        self.well_depth_ft = well_depth_ft
        self.tubing_id_in = tubing_id_in
        self.plunger_area_sqin = (math.pi / 4.0) * (plunger_diameter_in ** 2)
        self.total_rod_dry_weight_lbs = self.well_depth_ft * self.rod_string_weight_lbs_per_ft

    def compute_performance(
        self,
        stroke_length_in: float,
        spm: float,
        vfd_speed_hz: float,
        fluid_viscosity_cp: float,
        inflow_rate_bpd: float = 65.0
    ) -> Dict[str, Any]:
        """
        Computes mechanical loads, efficiencies, and risk factors for candidate SRP settings.
        """
        # Linear velocity of rod string: v_avg = 2 * Stroke * SPM / (60 * 12) ft/s
        avg_velocity_fps = (2.0 * stroke_length_in * spm) / 720.0
        
        # Buoyant rod weight in heavy oil (specific gravity ~0.95)
        # Steel density ~490 lb/cuft, oil density ~59 lb/cuft => buoyancy factor ~0.879
        buoyant_rod_weight_lbs = self.total_rod_dry_weight_lbs * 0.88

        # Hydrostatic fluid load on plunger (psi = 0.433 * SG * Depth)
        fluid_gradient_psi_per_ft = 0.412
        hydrostatic_pressure_psi = self.well_depth_ft * fluid_gradient_psi_per_ft
        fluid_load_lbs = hydrostatic_pressure_psi * self.plunger_area_sqin

        # Viscous drag force on downstroke (F_visc ~ mu * v * L / ln(r2/r1))
        # In heavy oil (> 1000 cP), this becomes massive!
        viscous_drag_factor = (fluid_viscosity_cp / 500.0) * (avg_velocity_fps / 2.0)
        viscous_drag_lbs = 1200.0 * viscous_drag_factor

        # Peak Polished Rod Load (PPRL): Upstroke load = Buoyant Rod + Fluid Load + Dynamic + Viscous Drag Up
        # Mills acceleration factor: 1 + (Stroke * SPM^2) / 70500
        acceleration_factor = 1.0 + (stroke_length_in * (spm ** 2)) / 70500.0
        pprl_lbs = (buoyant_rod_weight_lbs * acceleration_factor) + fluid_load_lbs + (viscous_drag_lbs * 0.7)

        # Minimum Polished Rod Load (MPRL): Downstroke load = Buoyant Rod - Dynamic - Viscous Drag Down
        mprl_lbs = max((buoyant_rod_weight_lbs * (2.0 - acceleration_factor)) - viscous_drag_lbs, 500.0)

        # Rod Floating Risk Index:
        # If viscous drag on downstroke exceeds downward rod gravity force, rod floats!
        floating_ratio = viscous_drag_lbs / max(buoyant_rod_weight_lbs, 1.0)
        # High viscosity + high SPM triggers severe rod floating
        rod_floating_risk = min(max((floating_ratio - 0.25) / 0.65, 0.0), 1.0)
        if fluid_viscosity_cp > 2500.0 and spm > 7.0:
            rod_floating_risk = max(rod_floating_risk, 0.85)

        # Theoretical displacement: Q_theor = 0.1166 * (D_p)^2 * S * SPM (in bpd)
        q_theoretical_bpd = 0.1166 * (self.plunger_diameter_in ** 2) * stroke_length_in * spm

        # Pump fillage: balance between reservoir inflow and pump displacement
        fillage_ratio = inflow_rate_bpd / max(q_theoretical_bpd, 1.0)
        pump_fillage_pct = min(max(fillage_ratio * 100.0, 35.0), 98.0)

        # Fluid pound / impact load risk: occurs when pump fillage is low (<70%) and pump strikes fluid on downstroke
        if pump_fillage_pct < 65.0:
            impact_load_risk = min(1.0, (65.0 - pump_fillage_pct) / 40.0 + 0.20)
        else:
            impact_load_risk = max(0.04, 0.15 - (pump_fillage_pct / 100.0) * 0.12)

        # Volumetric pump efficiency: product of fillage and slippage
        # Heavy oil has low slippage, but high viscosity restricts valve ball sealing if SPM is erratic
        valve_lag_factor = 1.0 - min(0.35, (fluid_viscosity_cp / 8000.0) * (spm / 10.0))
        pump_efficiency_pct = (pump_fillage_pct * valve_lag_factor)
        pump_efficiency_pct = round(min(max(pump_efficiency_pct, 25.0), 92.0), 1)

        # Pump unsetting risk: high upward friction drag on pump barrel
        pump_unsetting_risk = min(max((viscous_drag_lbs / 14000.0) * 0.8, 0.02), 0.95)

        # Electrical power estimation (kW):
        hydraulic_hp = (q_theoretical_bpd * (pump_efficiency_pct / 100.0) * hydrostatic_pressure_psi) / 58800.0
        friction_hp = (pprl_lbs - mprl_lbs) * (avg_velocity_fps) / 550.0
        total_hp = (hydraulic_hp + friction_hp) / 0.75 # 75% mechanical/motor efficiency
        power_kw = round(total_hp * 0.7457, 1)

        # Structural stress percentage against API Grade D rod rating (~30,000 lbs max)
        rod_rating_lbs = 28500.0
        mechanical_stress_pct = round((pprl_lbs / rod_rating_lbs) * 100.0, 1)

        return {
            "stroke_length_in": stroke_length_in,
            "spm": spm,
            "vfd_speed_hz": vfd_speed_hz,
            "pprl_lbs": round(pprl_lbs, 0),
            "mprl_lbs": round(mprl_lbs, 0),
            "rod_load_lbs": round(pprl_lbs, 0),
            "pump_efficiency_pct": pump_efficiency_pct,
            "pump_fillage_pct": round(pump_fillage_pct, 1),
            "rod_floating_risk": round(rod_floating_risk, 3),
            "impact_load_risk": round(impact_load_risk, 3),
            "pump_unsetting_risk": round(pump_unsetting_risk, 3),
            "power_kw": power_kw,
            "mechanical_stress_pct": mechanical_stress_pct,
            "operating_status": "SAFE" if (rod_floating_risk < 0.35 and impact_load_risk < 0.40 and mechanical_stress_pct < 85.0) else "RESTRICTED"
        }
