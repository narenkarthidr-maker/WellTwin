import math
from typing import Dict, Any
from app.twin.reservoir_model import HeavyOilReservoirModel

class CSSProcessModel:
    """
    Cyclic Steam Stimulation process model for heavy oil wells:
    1. Steam injection heat balance
    2. Soak period thermal distribution & pressure equilibration
    3. Production phase recovery & SOR evolution
    """

    def __init__(self, reservoir_model: HeavyOilReservoirModel = None):
        self.reservoir = reservoir_model or HeavyOilReservoirModel()

    def simulate_injection_and_soak(
        self,
        steam_volume_tons: float,
        injection_pressure_bar: float,
        soak_time_days: float,
        injection_rate_tons_per_day: float = 120.0
    ) -> Dict[str, Any]:
        """
        Simulates thermal response from CSS steam volume and soak duration.
        """
        # Steam enthalpy at ~110 bar saturated steam is ~2750 kJ/kg
        enthalpy_per_ton_gj = 2.75 # ~2.75 GJ per ton of steam
        total_heat_injected_gj = steam_volume_tons * enthalpy_per_ton_gj
        
        # Heated zone radius approximation (Marx-Langenheim style energy balance)
        # Volumetric heat capacity of sandstone saturated with heavy oil ~2.2 MJ/m3/K
        volumetric_heat_capacity_gj_per_m3 = 0.0022
        delta_t_effective = 140.0 # Effective temp rise above base 58 C
        heated_volume_m3 = (total_heat_injected_gj * 0.72) / (volumetric_heat_capacity_gj_per_m3 * delta_t_effective)
        pay_zone_thickness = self.reservoir.pay_zone_thickness_m
        heated_radius_m = math.sqrt(max(heated_volume_m3 / (math.pi * pay_zone_thickness), 4.0))

        # Peak near-wellbore temperature achieved after soak
        # Soak allows steam condensation and heat conduction into the cold matrix
        soak_cooling_penalty = max(0.0, (soak_time_days - 6.0) * 1.8) # Excessive soak loses heat to cap/base rock
        soak_distribution_benefit = min(1.0, soak_time_days / 4.0)
        
        peak_temp_c = 58.0 + (185.0 * (steam_volume_tons / 3000.0) ** 0.38) * soak_distribution_benefit - soak_cooling_penalty
        peak_temp_c = min(max(peak_temp_c, 85.0), 285.0)

        # Resulting near-wellbore viscosity
        viscosity_cp = self.reservoir.calculate_viscosity(peak_temp_c)
        
        # Expected initial peak oil rate
        peak_rate_bpd = self.reservoir.calculate_inflow_potential(
            reservoir_pressure_bar=injection_pressure_bar * 0.85,
            bottomhole_flowing_pressure_bar=35.0,
            viscosity_cp=viscosity_cp
        )

        # Cycle cumulative oil estimation (empirical recovery factor for CSS cycle)
        # Typically 1 ton of steam recovers 0.25 to 0.45 tons of heavy oil in Baghewala conditions
        oil_density_tons_per_bbl = 0.150 # ~6.67 bbl/ton for 17 API oil
        recovery_efficiency = 0.34 * (2000.0 / (viscosity_cp + 50.0)) ** 0.12
        cycle_oil_tons = (steam_volume_tons * recovery_efficiency) / max(1.0 + (viscosity_cp / 5000.0), 1.0)
        predicted_sor = steam_volume_tons / max(cycle_oil_tons, 10.0)

        return {
            "peak_reservoir_temp_c": round(peak_temp_c, 1),
            "estimated_viscosity_cp": round(viscosity_cp, 1),
            "heated_radius_m": round(heated_radius_m, 1),
            "peak_oil_rate_bpd": round(peak_rate_bpd, 1),
            "cycle_oil_recovery_tons": round(cycle_oil_tons, 1),
            "predicted_sor": round(predicted_sor, 2),
            "thermal_efficiency_pct": round(min(88.0, 68.0 + 15.0 * (soak_time_days / 6.0)), 1),
            "heat_loss_wellbore_pct": round(12.5 + (150.0 / injection_rate_tons_per_day), 1)
        }
