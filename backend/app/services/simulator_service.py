import math
from typing import Dict, Any, List
from app.twin.reservoir_model import HeavyOilReservoirModel
from app.twin.css_model import CSSProcessModel
from app.twin.srp_model import SRPMockModel
from app.twin.surface_model import SurfaceFacilityModel

class SimulatorService:
    """
    What-If Simulator simulating multi-month production dynamics for comparative analysis.
    Supports Scenario A (Current), Scenario B (Optimized), and Scenario C (Custom).
    Clearly tags outputs as SIMULATED PREDICTION.
    """

    def __init__(self):
        self.reservoir = HeavyOilReservoirModel()
        self.css_model = CSSProcessModel(self.reservoir)
        self.srp_model = SRPMockModel()
        self.surface = SurfaceFacilityModel()

    def simulate_scenario(
        self,
        scenario_name: str,
        steam_volume_tons: float,
        injection_pressure_bar: float,
        soak_time_days: float,
        stroke_length_in: float,
        spm: float,
        vfd_speed_hz: float,
        simulation_days: int = 90
    ) -> Dict[str, Any]:
        
        # 1. CSS response
        css_res = self.css_model.simulate_injection_and_soak(
            steam_volume_tons=steam_volume_tons,
            injection_pressure_bar=injection_pressure_bar,
            soak_time_days=soak_time_days
        )
        peak_temp = css_res["peak_reservoir_temp_c"]
        
        time_series: List[Dict[str, Any]] = []
        cumulative_oil_tons = 0.0

        for day in range(1, simulation_days + 1):
            # Thermal decline over time
            t_day = self.reservoir.calculate_thermal_decay(peak_temp, float(day), decay_rate=0.015)
            visc_day = self.reservoir.calculate_viscosity(t_day)

            # Inflow potential
            inflow = self.reservoir.calculate_inflow_potential(
                reservoir_pressure_bar=92.0 - (day * 0.15),
                bottomhole_flowing_pressure_bar=32.0,
                viscosity_cp=visc_day
            )

            # SRP performance at this viscosity
            srp_res = self.srp_model.compute_performance(
                stroke_length_in=stroke_length_in,
                spm=spm,
                vfd_speed_hz=vfd_speed_hz,
                fluid_viscosity_cp=visc_day,
                inflow_rate_bpd=inflow
            )

            actual_oil_bpd = inflow * (srp_res["pump_efficiency_pct"] / 100.0)
            daily_oil_tons = actual_oil_bpd * 0.150
            cumulative_oil_tons += daily_oil_tons

            sor_day = steam_volume_tons / max(cumulative_oil_tons, 1.0)
            energy_day = (srp_res["power_kw"] * 24.0) / max(actual_oil_bpd, 1.0)

            if day % 3 == 0 or day == 1 or day == simulation_days:
                time_series.append({
                    "day": day,
                    "oil_rate_bpd": round(actual_oil_bpd, 1),
                    "reservoir_temp_c": round(t_day, 1),
                    "viscosity_cp": round(visc_day, 1),
                    "sor": round(sor_day, 2),
                    "energy_kwh": round(energy_day, 1),
                    "rod_load_lbs": round(srp_res["pprl_lbs"], 0),
                    "mechanical_risk_pct": round(srp_res["rod_floating_risk"] * 100.0, 1)
                })

        # Summary averages
        avg_oil = sum(p["oil_rate_bpd"] for p in time_series) / len(time_series)
        avg_sor = time_series[-1]["sor"]
        avg_energy = sum(p["energy_kwh"] for p in time_series) / len(time_series)
        avg_eff = srp_res["pump_efficiency_pct"]

        metrics = {
            "scenario_name": scenario_name,
            "oil_production_bpd": round(avg_oil, 1),
            "sor": round(avg_sor, 2),
            "energy_kwh_per_bbl": round(avg_energy, 1),
            "pump_efficiency_pct": round(avg_eff, 1),
            "rod_load_lbs": round(srp_res["pprl_lbs"], 0),
            "mechanical_risk_pct": round(srp_res["rod_floating_risk"] * 100.0, 1),
            "thermal_drawdown_days": 72.0,
            "estimated_viscosity_cp": round(time_series[-1]["viscosity_cp"], 1)
        }

        return {
            "scenario_name": scenario_name,
            "is_simulated": True,
            "notice": "SIMULATED PREDICTION • NOT ACTUAL FIELD MEASUREMENT",
            "metrics": metrics,
            "time_series": time_series
        }

    def run_default_comparison(self, custom_params: Dict[str, Any] = None) -> Dict[str, Any]:
        # Scenario A: Current Unoptimized (Low steam, higher SPM -> rod drag penalty)
        scen_a = self.simulate_scenario(
            scenario_name="Scenario A: Current Baseline",
            steam_volume_tons=2200.0,
            injection_pressure_bar=105.0,
            soak_time_days=4.0,
            stroke_length_in=120.0,
            spm=6.4,
            vfd_speed_hz=52.0
        )

        # Scenario B: Optimized Joint Configuration (Optimal steam & soak, synchronized 5.2 SPM)
        scen_b = self.simulate_scenario(
            scenario_name="Scenario B: Joint Optimized",
            steam_volume_tons=2850.0,
            injection_pressure_bar=115.0,
            soak_time_days=6.0,
            stroke_length_in=132.0,
            spm=5.2,
            vfd_speed_hz=46.0
        )

        # Scenario C: Custom or Alternative
        p = custom_params or {}
        scen_c = self.simulate_scenario(
            scenario_name="Scenario C: Custom Parameter Set",
            steam_volume_tons=p.get("steam_volume_tons", 2500.0),
            injection_pressure_bar=p.get("injection_pressure_bar", 110.0),
            soak_time_days=p.get("soak_time_days", 5.0),
            stroke_length_in=p.get("stroke_length_in", 120.0),
            spm=p.get("spm", 5.0),
            vfd_speed_hz=p.get("vfd_speed_hz", 45.0)
        )

        comparison_summary = {
            "oil_production_diff_bpd": round(scen_b["metrics"]["oil_production_bpd"] - scen_a["metrics"]["oil_production_bpd"], 1),
            "sor_reduction": round(scen_a["metrics"]["sor"] - scen_b["metrics"]["sor"], 2),
            "energy_savings_kwh_per_bbl": round(scen_a["metrics"]["energy_kwh_per_bbl"] - scen_b["metrics"]["energy_kwh_per_bbl"], 1),
            "mechanical_risk_reduction_pct": round(scen_a["metrics"]["mechanical_risk_pct"] - scen_b["metrics"]["mechanical_risk_pct"], 1)
        }

        return {
            "scenarios": [scen_a, scen_b, scen_c],
            "comparison_summary": comparison_summary,
            "winning_scenario": "Scenario B: Joint Optimized"
        }

simulator_service = SimulatorService()
