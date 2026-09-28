from typing import Dict, Any, List
from datetime import datetime
from app.services.dataset_service import dataset_service
from app.twin.reservoir_model import HeavyOilReservoirModel
from app.twin.wellbore_model import WellboreThermalModel
from app.twin.css_model import CSSProcessModel
from app.twin.srp_model import SRPMockModel
from app.twin.surface_model import SurfaceFacilityModel

class DigitalTwinService:
    """
    Orchestrates the Well-to-Surface Digital Twin across 4 connected layers:
    1. Reservoir (Heavy Oil & Thermal Steam Chamber)
    2. Wellbore (Thermal gradients & pressure drop over 1150m)
    3. SRP Pump (Rod string, loads, volumetric efficiency, floating risk)
    4. Surface (Separation, lifting power, net operating cost)
    """

    def __init__(self):
        self.reservoir = HeavyOilReservoirModel()
        self.wellbore = WellboreThermalModel()
        self.css_model = CSSProcessModel(self.reservoir)
        self.srp_model = SRPMockModel()
        self.surface = SurfaceFacilityModel()

    def get_full_twin_state(self, well_id: str) -> Dict[str, Any]:
        """
        Retrieves the unified physical + digital model parameters and telemetry for the well.
        """
        point = dataset_service.get_latest_point(well_id)
        temp_c = point["temperature_c"]
        visc_cp = point["viscosity_cp"]
        spm = point["spm"]
        stroke = point["stroke_length_in"]
        vfd = point["vfd_speed_hz"]
        oil_rate = point["oil_rate_bpd"]

        # 1. Reservoir State
        mobility = self.reservoir.calculate_mobility(visc_cp)
        inflow = self.reservoir.calculate_inflow_potential(
            reservoir_pressure_bar=point["pressure_bar"],
            bottomhole_flowing_pressure_bar=32.0,
            viscosity_cp=visc_cp
        )

        # 2. Wellbore State
        wellbore_stations = self.wellbore.compute_temperature_profile(
            surface_injection_temp_c=300.0,
            bottomhole_temp_c=temp_c,
            mode="PRODUCTION"
        )
        steam_quality = self.wellbore.compute_steam_quality_at_sandface()

        # 3. SRP Mechanics
        srp_res = self.srp_model.compute_performance(
            stroke_length_in=stroke,
            spm=spm,
            vfd_speed_hz=vfd,
            fluid_viscosity_cp=visc_cp,
            inflow_rate_bpd=inflow
        )

        # 4. Surface Metrics
        surface_res = self.surface.calculate_surface_metrics(
            oil_rate_bpd=oil_rate,
            water_cut_pct=26.0,
            srp_power_kw=srp_res["power_kw"],
            steam_volume_tons_cycle=point.get("steam_volume_tons", 2600.0),
            oil_production_tons_cycle=point.get("steam_volume_tons", 2600.0) / max(point.get("sor", 3.2), 0.5)
        )

        # Determine condition badges
        thermal_condition = "GOOD" if temp_c > 110.0 else ("WATCH" if temp_c > 75.0 else "WARNING")
        pump_condition = "GOOD" if srp_res["pump_efficiency_pct"] > 70.0 else ("WATCH" if srp_res["pump_efficiency_pct"] > 55.0 else "WARNING")
        rod_floating_condition = "CRITICAL" if srp_res["rod_floating_risk"] > 0.60 else ("WARNING" if srp_res["rod_floating_risk"] > 0.35 else ("WATCH" if srp_res["rod_floating_risk"] > 0.18 else "GOOD"))
        impact_load_condition = "CRITICAL" if srp_res["impact_load_risk"] > 0.50 else ("WARNING" if srp_res["impact_load_risk"] > 0.25 else "GOOD")
        pump_unsetting_condition = "GOOD" if srp_res["pump_unsetting_risk"] < 0.25 else "WATCH"

        return {
            "well_id": well_id,
            "timestamp": datetime.utcnow().isoformat(),
            "data_mode": "DEMO",
            "data_mode_label": "DEMO MODE • SYNTHETIC DATA",
            "reservoir": {
                "temperature_c": temp_c,
                "pressure_bar": point["pressure_bar"],
                "estimated_viscosity_cp": visc_cp,
                "oil_mobility_md_cp": round(mobility, 2),
                "formation": "Jodhpur Sandstone",
                "depth_m": 1150.0,
                "net_pay_thickness_m": 14.0,
                "thermal_status": thermal_condition
            },
            "wellbore": {
                "depth_m": 1150.0,
                "casing_size_in": 7.0,
                "tubing_od_in": 3.5,
                "sandface_steam_quality": steam_quality,
                "temperature_profile": wellbore_stations,
                "estimated_heat_loss_pct": 14.2
            },
            "srp": {
                "stroke_length_in": stroke,
                "spm": spm,
                "vfd_speed_hz": vfd,
                "rod_load_lbs": srp_res["pprl_lbs"],
                "pprl_lbs": srp_res["pprl_lbs"],
                "mprl_lbs": srp_res["mprl_lbs"],
                "pump_efficiency_pct": srp_res["pump_efficiency_pct"],
                "pump_fillage_pct": srp_res["pump_fillage_pct"],
                "rod_floating_risk": srp_res["rod_floating_risk"],
                "impact_load_risk": srp_res["impact_load_risk"],
                "pump_unsetting_risk": srp_res["pump_unsetting_risk"],
                "power_kw": srp_res["power_kw"],
                "mechanical_stress_pct": srp_res["mechanical_stress_pct"],
                "pump_condition": pump_condition,
                "rod_floating_condition": rod_floating_condition
            },
            "surface": {
                "oil_rate_bpd": oil_rate,
                "water_rate_bpd": point["water_rate_bpd"],
                "sor": surface_res["sor"],
                "energy_kwh_per_bbl": surface_res["energy_kwh_per_bbl"],
                "operating_cost_usd_per_bbl": surface_res["operating_cost_usd_per_bbl"],
                "separator_pressure_bar": surface_res["separator_pressure_bar"]
            },
            "css_status": {
                "current_cycle": 3,
                "last_steam_volume_tons": point.get("steam_volume_tons", 2600.0),
                "soak_time_days": 5.0,
                "thermal_efficiency_pct": 74.2
            }
        }

    def compute_custom_twin_state(
        self,
        well_id: str,
        steam_volume_tons: float,
        injection_pressure_bar: float,
        soak_time_days: float,
        stroke_length_in: float,
        spm: float,
        vfd_speed_hz: float
    ) -> Dict[str, Any]:
        """
        Interactive re-calculation when user drags sliders on the Digital Twin or Simulator page.
        """
        css_res = self.css_model.simulate_injection_and_soak(
            steam_volume_tons=steam_volume_tons,
            injection_pressure_bar=injection_pressure_bar,
            soak_time_days=soak_time_days
        )
        sim_temp = css_res["peak_reservoir_temp_c"]
        sim_visc = css_res["estimated_viscosity_cp"]
        inflow = css_res["peak_oil_rate_bpd"]

        srp_res = self.srp_model.compute_performance(
            stroke_length_in=stroke_length_in,
            spm=spm,
            vfd_speed_hz=vfd_speed_hz,
            fluid_viscosity_cp=sim_visc,
            inflow_rate_bpd=inflow
        )

        surface_res = self.surface.calculate_surface_metrics(
            oil_rate_bpd=inflow * (srp_res["pump_efficiency_pct"] / 100.0),
            water_cut_pct=25.0,
            srp_power_kw=srp_res["power_kw"],
            steam_volume_tons_cycle=steam_volume_tons,
            oil_production_tons_cycle=css_res["cycle_oil_recovery_tons"]
        )

        return {
            "reservoir_temp_c": round(sim_temp, 1),
            "estimated_viscosity_cp": round(sim_visc, 1),
            "oil_rate_bpd": round(inflow * (srp_res["pump_efficiency_pct"] / 100.0), 1),
            "sor": surface_res["sor"],
            "energy_kwh_per_bbl": surface_res["energy_kwh_per_bbl"],
            "pump_efficiency_pct": srp_res["pump_efficiency_pct"],
            "rod_load_lbs": srp_res["pprl_lbs"],
            "rod_floating_risk": srp_res["rod_floating_risk"],
            "impact_load_risk": srp_res["impact_load_risk"],
            "is_simulated": True
        }

digital_twin_service = DigitalTwinService()
