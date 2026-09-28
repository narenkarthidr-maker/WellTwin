import math
from typing import Dict, Any, List

class WellboreThermalModel:
    """
    Simulates wellbore heat transfer and vertical pressure/temperature gradients
    along the 1150 m casing for Baghewala heavy oil wells.
    """

    def __init__(self, well_depth_m: float = 1150.0, casing_id_in: float = 7.0, tubing_od_in: float = 3.5):
        self.well_depth_m = well_depth_m
        self.casing_id_in = casing_id_in
        self.tubing_od_in = tubing_od_in
        self.geothermal_gradient_c_per_km = 30.0 # ~30 C per 1000m
        self.surface_ambient_temp_c = 28.0

    def compute_temperature_profile(self, surface_injection_temp_c: float, bottomhole_temp_c: float, mode: str = "PRODUCTION") -> List[Dict[str, float]]:
        """
        Calculates temperature distribution at 10 depth stations from surface (0m) to sandface (1150m).
        """
        stations = []
        depth_steps = 10
        step_m = self.well_depth_m / depth_steps

        for i in range(depth_steps + 1):
            depth = round(i * step_m, 1)
            depth_fraction = depth / self.well_depth_m

            if mode == "INJECTION":
                # During injection, steam enters hot at surface, minor conductive heat loss to overburden
                heat_loss_factor = 0.08 * depth_fraction
                t_station = surface_injection_temp_c * (1.0 - heat_loss_factor)
                p_station = 120.0 + (depth / 100.0) * 1.5 # Steam hydrostatic + friction
            else: # PRODUCTION mode
                # Fluid ascends from reservoir hot bottomhole to surface, cooling along the tubing
                cooling_loss = (bottomhole_temp_c - self.surface_ambient_temp_c) * (1.0 - math.exp(-1.8 * (1.0 - depth_fraction)))
                t_station = self.surface_ambient_temp_c + cooling_loss
                # Hydrostatic column of heavy oil + water
                p_station = max(15.0 + (depth / 10.0) * 0.85, 2.0)

            stations.append({
                "depth_m": depth,
                "temperature_c": round(t_station, 1),
                "pressure_bar": round(p_station, 1),
                "depth_label": f"{int(depth)}m"
            })

        return stations

    def compute_steam_quality_at_sandface(self, surface_steam_quality: float = 0.85, injection_rate_tons_day: float = 120.0) -> float:
        """
        Estimates downhole steam dryness fraction accounting for wellbore heat loss.
        """
        # Heat loss fraction decreases with higher injection mass flow
        loss_fraction = 0.16 * (100.0 / max(injection_rate_tons_day, 50.0))
        sandface_quality = surface_steam_quality * (1.0 - min(loss_fraction, 0.35))
        return max(round(sandface_quality, 3), 0.50)
