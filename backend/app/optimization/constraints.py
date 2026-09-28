from typing import List, Dict, Any, Tuple
from app.schemas.optimization import ConstraintCheckItem, EngineeringConstraintReport

class EngineeringConstraintEngine:
    """
    Enforces deterministic petroleum and mechanical engineering limits.
    Acts as the safety gate between ML/Optimizer and operational recommendations.
    Never allows an unvalidated or violating candidate to be recommended.
    """

    def __init__(
        self,
        max_injection_pressure_bar: float = 145.0, # Formation fracture pressure
        max_steam_temp_c: float = 320.0,           # Tubing/packer thermal limit
        max_pprl_lbs: float = 28500.0,              # API Grade D rod yield safety limit
        min_mprl_lbs: float = 2000.0,               # Minimum rod load to avoid buckling
        min_spm: float = 1.5,
        max_spm: float = 12.0,
        min_vfd_hz: float = 20.0,
        max_vfd_hz: float = 65.0,
        max_rod_floating_risk: float = 0.40,        # Critical safety limit for viscous oil
        max_impact_load_risk: float = 0.45
    ):
        self.max_injection_pressure_bar = max_injection_pressure_bar
        self.max_steam_temp_c = max_steam_temp_c
        self.max_pprl_lbs = max_pprl_lbs
        self.min_mprl_lbs = min_mprl_lbs
        self.min_spm = min_spm
        self.max_spm = max_spm
        self.min_vfd_hz = min_vfd_hz
        self.max_vfd_hz = max_vfd_hz
        self.max_rod_floating_risk = max_rod_floating_risk
        self.max_impact_load_risk = max_impact_load_risk

    def evaluate(
        self,
        injection_pressure_bar: float,
        steam_temp_c: float,
        pprl_lbs: float,
        mprl_lbs: float,
        spm: float,
        vfd_hz: float,
        rod_floating_risk: float,
        impact_load_risk: float
    ) -> EngineeringConstraintReport:
        """
        Runs full deterministic engineering audit.
        """
        items: List[ConstraintCheckItem] = []

        # 1. Formation Fracture Pressure Constraint
        p_ok = injection_pressure_bar <= self.max_injection_pressure_bar
        items.append(ConstraintCheckItem(
            name="Formation Fracture Pressure",
            status="PASSED" if p_ok else "FAILED",
            current_value=round(injection_pressure_bar, 1),
            limit_value=self.max_injection_pressure_bar,
            operator="<=",
            unit="bar",
            message="Injection pressure below formation fracture threshold (145 bar)" if p_ok else "VIOLATION: Injection pressure exceeds formation fracture threshold!"
        ))

        # 2. Thermal Rating Constraint
        t_ok = steam_temp_c <= self.max_steam_temp_c
        items.append(ConstraintCheckItem(
            name="Wellhead & Casing Thermal Limit",
            status="PASSED" if t_ok else "FAILED",
            current_value=round(steam_temp_c, 1),
            limit_value=self.max_steam_temp_c,
            operator="<=",
            unit="°C",
            message="Steam temperature within casing and elastomer thermal rating" if t_ok else "VIOLATION: Steam temperature exceeds metallurgy/elastomer rating!"
        ))

        # 3. Peak Polished Rod Load (Goodman / Tension)
        pprl_ok = pprl_lbs <= self.max_pprl_lbs
        items.append(ConstraintCheckItem(
            name="Peak Polished Rod Load (PPRL)",
            status="PASSED" if pprl_ok else "FAILED",
            current_value=round(pprl_lbs, 0),
            limit_value=self.max_pprl_lbs,
            operator="<=",
            unit="lbs",
            message="Tensile rod stress safely below API Grade D allowable limit" if pprl_ok else "VIOLATION: Peak rod load exceeds fatigue limit (high parting risk)!"
        ))

        # 4. Minimum Rod Load (Buckling Prevention)
        mprl_ok = mprl_lbs >= self.min_mprl_lbs
        items.append(ConstraintCheckItem(
            name="Minimum Rod Load (Compressive Margin)",
            status="PASSED" if mprl_ok else "FAILED",
            current_value=round(mprl_lbs, 0),
            limit_value=self.min_mprl_lbs,
            operator=">=",
            unit="lbs",
            message="Sufficient downward tension maintained to prevent helical buckling" if mprl_ok else "VIOLATION: Rod load drops below minimum margin (compression/buckling risk)!"
        ))

        # 5. SRP SPM Kinematic Limits
        spm_ok = (self.min_spm <= spm <= self.max_spm)
        items.append(ConstraintCheckItem(
            name="Pumping Speed (SPM)",
            status="PASSED" if spm_ok else "FAILED",
            current_value=round(spm, 1),
            limit_value=self.max_spm,
            operator="range",
            unit="SPM",
            message=f"Pumping speed within mechanical range ({self.min_spm}-{self.max_spm} SPM)" if spm_ok else "VIOLATION: SPM outside allowable gearbox/beam envelope!"
        ))

        # 6. Rod Floating Prevention Condition (Viscous Oil Specific)
        floating_ok = rod_floating_risk <= self.max_rod_floating_risk
        items.append(ConstraintCheckItem(
            name="Rod Floating Prevention Limit",
            status="PASSED" if floating_ok else "FAILED",
            current_value=round(rod_floating_risk, 3),
            limit_value=self.max_rod_floating_risk,
            operator="<=",
            unit="index",
            message="Downstroke rod descent rate exceeds viscous buoyant drag" if floating_ok else "VIOLATION: Fluid viscosity causes rod floating on downstroke!"
        ))

        # 7. VFD Electrical Frequency
        vfd_ok = (self.min_vfd_hz <= vfd_hz <= self.max_vfd_hz)
        items.append(ConstraintCheckItem(
            name="VFD Operating Frequency",
            status="PASSED" if vfd_ok else "FAILED",
            current_value=round(vfd_hz, 1),
            limit_value=self.max_vfd_hz,
            operator="range",
            unit="Hz",
            message="VFD operating within motor thermal and torque bandwidth" if vfd_ok else "VIOLATION: VFD frequency outside motor rating!"
        ))

        passed_count = sum(1 for item in items if item.status == "PASSED")
        total_count = len(items)
        overall_status = "PASSED" if passed_count == total_count else "FAILED"

        rejection_reason = None
        if overall_status == "FAILED":
            failed_items = [item.name for item in items if item.status == "FAILED"]
            rejection_reason = f"Candidate operating point violates configured engineering constraints: {', '.join(failed_items)}."

        return EngineeringConstraintReport(
            overall_status=overall_status,
            passed_count=passed_count,
            total_count=total_count,
            constraints=items,
            rejection_reason=rejection_reason
        )

constraint_engine = EngineeringConstraintEngine()
