from typing import Dict, Any

class JointObjectiveFunction:
    """
    Multi-objective scalarization function for coupled CSS + SRP operations.
    Balances:
    1. Maximize Oil Production (bpd)
    2. Maximize Thermal Utilization (efficient heat transfer into oil zone)
    3. Minimize Steam-Oil Ratio (SOR)
    4. Minimize Lifting Energy (kWh / bbl)
    5. Minimize Mechanical Risk (rod floating + impact loading + fatigue)
    """

    def __init__(
        self,
        weight_production: float = 0.30,
        weight_thermal: float = 0.25,
        weight_sor: float = 0.20,
        weight_energy: float = 0.15,
        weight_risk: float = 0.10
    ):
        self.w_prod = weight_production
        self.w_therm = weight_thermal
        self.w_sor = weight_sor
        self.w_energy = weight_energy
        self.w_risk = weight_risk

    def evaluate(
        self,
        oil_rate_bpd: float,
        thermal_utilization_idx: float, # 0.0 - 1.0
        sor: float,
        energy_kwh_per_bbl: float,
        mechanical_risk_idx: float      # 0.0 - 1.0
    ) -> float:
        """
        Calculates normalized composite objective score between 0.0 and 100.0.
        Higher is better.
        """
        # Production component (normalized against nominal 120 bpd)
        norm_prod = min(oil_rate_bpd / 120.0, 1.5) * 100.0
        # Thermal utilization component
        norm_therm = thermal_utilization_idx * 100.0
        # SOR penalty (ideal SOR ~2.0, worse > 6.0)
        norm_sor = max(0.0, (7.0 - sor) / 5.0) * 100.0
        # Energy penalty (ideal ~25 kWh/bbl, worse > 65 kWh/bbl)
        norm_energy = max(0.0, (65.0 - energy_kwh_per_bbl) / 40.0) * 100.0
        # Mechanical risk penalty
        norm_risk = max(0.0, (1.0 - mechanical_risk_idx)) * 100.0

        composite_score = (
            self.w_prod * norm_prod +
            self.w_therm * norm_therm +
            self.w_sor * norm_sor +
            self.w_energy * norm_energy +
            self.w_risk * norm_risk
        )
        return round(float(composite_score), 2)
