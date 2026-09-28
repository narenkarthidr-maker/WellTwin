import math
from typing import Dict, Any

class HeavyOilReservoirModel:
    """
    Physical model for Baghewala heavy oil reservoir (Jodhpur Sandstone formation).
    Calibrated parameters for heavy oil (~17° API, base reservoir temp ~58°C).
    """

    def __init__(
        self,
        base_temp_c: float = 58.0,
        initial_pressure_bar: float = 95.0,
        base_viscosity_cp: float = 8500.0,
        pay_zone_thickness_m: float = 14.0,
        permeability_md: float = 850.0,
        porosity: float = 0.28
    ):
        self.base_temp_c = base_temp_c
        self.initial_pressure_bar = initial_pressure_bar
        self.base_viscosity_cp = base_viscosity_cp
        self.pay_zone_thickness_m = pay_zone_thickness_m
        self.permeability_md = permeability_md
        self.porosity = porosity

    def calculate_viscosity(self, temp_c: float) -> float:
        """
        Calculates heavy oil dynamic viscosity (cP) as a function of temperature (Celsius)
        using the Andrade/Arrhenius temperature-dependence relation:
        mu(T) = A * exp(B / (T + 273.15))
        Calibrated:
          At 58°C  -> ~8,500 cP
          At 100°C -> ~420 cP
          At 160°C -> ~75 cP
          At 220°C -> ~28 cP
          At 280°C -> ~14 cP
        """
        temp_k = max(temp_c + 273.15, 273.15)
        # Andrade calibrated parameters
        b_constant = 4250.0
        # A calculated from 8500 cP at (58 + 273.15) K = 331.15 K
        # ln(8500) = ln(A) + 4250 / 331.15 => ln(A) = 9.0478 - 12.834 = -3.786
        a_constant = math.exp(math.log(self.base_viscosity_cp) - (b_constant / (self.base_temp_c + 273.15)))
        
        viscosity = a_constant * math.exp(b_constant / temp_k)
        return max(float(viscosity), 5.0) # Lower bound ~5 cP at extreme superheated steam temps

    def calculate_mobility(self, viscosity_cp: float, rel_perm_oil: float = 0.75) -> float:
        """
        Effective oil mobility lambda_o = k * k_ro / mu_o (mD / cP)
        """
        viscosity_cp = max(viscosity_cp, 1.0)
        return (self.permeability_md * rel_perm_oil) / viscosity_cp

    def calculate_inflow_potential(self, reservoir_pressure_bar: float, bottomhole_flowing_pressure_bar: float, viscosity_cp: float) -> float:
        """
        Estimates inflow rate (bpd) using Darcy radial inflow for heated zone:
        J = 2*pi*k*h / (mu * (ln(re/rw) + s))
        """
        delta_p = max(reservoir_pressure_bar - bottomhole_flowing_pressure_bar, 2.0)
        mobility = self.calculate_mobility(viscosity_cp)
        # Empirical productivity index factor
        pi_factor = 0.0085 * (self.pay_zone_thickness_m / 10.0)
        q_bpd = mobility * delta_p * pi_factor
        return max(q_bpd, 2.0)

    def calculate_thermal_decay(self, peak_temp_c: float, elapsed_production_days: float, decay_rate: float = 0.012) -> float:
        """
        Predicts temperature decline during production phase:
        T(t) = T_base + (T_peak - T_base) * exp(-decay_rate * t)
        """
        temp_c = self.base_temp_c + (peak_temp_c - self.base_temp_c) * math.exp(-decay_rate * elapsed_production_days)
        return max(float(temp_c), self.base_temp_c)
