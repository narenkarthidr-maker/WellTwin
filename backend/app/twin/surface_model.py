from typing import Dict, Any

class SurfaceFacilityModel:
    """
    Simulates surface separation, energy consumption per barrel, and steam-oil ratio.
    """

    def __init__(self, steam_cost_per_ton_usd: float = 24.0, power_cost_per_kwh_usd: float = 0.09):
        self.steam_cost_per_ton_usd = steam_cost_per_ton_usd
        self.power_cost_per_kwh_usd = power_cost_per_kwh_usd

    def calculate_surface_metrics(
        self,
        oil_rate_bpd: float,
        water_cut_pct: float,
        srp_power_kw: float,
        steam_volume_tons_cycle: float,
        oil_production_tons_cycle: float
    ) -> Dict[str, Any]:
        """
        Calculates surface energy footprint and lifting cost.
        """
        daily_kwh = srp_power_kw * 24.0
        daily_oil_bbl = max(oil_rate_bpd, 1.0)
        energy_kwh_per_bbl = daily_kwh / daily_oil_bbl

        sor = steam_volume_tons_cycle / max(oil_production_tons_cycle, 1.0)
        
        # Lifting power cost per bbl
        power_cost_per_bbl = energy_kwh_per_bbl * self.power_cost_per_kwh_usd
        # Steam cost allocated per bbl
        steam_cost_per_bbl = (sor * 0.150) * self.steam_cost_per_ton_usd # 0.150 ton oil per bbl

        total_operating_cost_per_bbl = power_cost_per_bbl + steam_cost_per_bbl + 4.50 # Base field OpEx

        return {
            "energy_kwh_per_bbl": round(energy_kwh_per_bbl, 1),
            "sor": round(sor, 2),
            "operating_cost_usd_per_bbl": round(total_operating_cost_per_bbl, 2),
            "separator_pressure_bar": 3.8,
            "flowline_temperature_c": 44.5
        }
