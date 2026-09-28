from typing import Dict, Any, List
from app.services.dataset_service import dataset_service
from app.ml.anomaly_detection import anomaly_engine
from app.ml.failure_prediction import failure_engine

class HealthService:
    """
    Predictive Well Health assessment service across 5 critical dimensions:
    Thermal, Pump, Rod, Production, and Equipment.
    Enforces technical credibility: uses categorical health status (GOOD, WATCH, WARNING, CRITICAL)
    and explainable mechanical indicators.
    """

    def get_well_health(self, well_id: str) -> Dict[str, Any]:
        point = dataset_service.get_latest_point(well_id)
        temp_c = point["temperature_c"]
        pressure_bar = point["pressure_bar"]
        visc_cp = point["viscosity_cp"]
        rod_load = point["rod_load_lbs"]
        pump_eff = point["pump_efficiency_pct"]
        spm = point["spm"]
        stroke = point["stroke_length_in"]
        oil_rate = point["oil_rate_bpd"]

        # Run Isolation Forest Anomaly Detection
        anomaly_res = anomaly_engine.evaluate_point(
            temp_c=temp_c,
            pressure_bar=pressure_bar,
            rod_load_lbs=rod_load,
            pump_efficiency_pct=pump_eff
        )

        # Run Mechanical Risk Prediction
        mech_res = failure_engine.predict_risks(
            viscosity_cp=visc_cp,
            spm=spm,
            stroke_length_in=stroke,
            pprl_lbs=rod_load,
            mprl_lbs=rod_load * 0.42,
            pump_fillage_pct=min(pump_eff * 1.15, 95.0)
        )

        # 1. Thermal Health
        if temp_c > 110.0:
            thermal_status = "GOOD"
            thermal_summary = f"Reservoir temperature at {temp_c:.1f}°C maintains low viscosity ({int(visc_cp)} cP) with optimal mobility."
        elif temp_c > 75.0:
            thermal_status = "WATCH"
            thermal_summary = f"Reservoir cooling to {temp_c:.1f}°C is gradually elevating fluid viscosity ({int(visc_cp)} cP). Monitor rod drag."
        else:
            thermal_status = "WARNING"
            thermal_summary = f"Thermal depletion ({temp_c:.1f}°C). Near-wellbore viscosity has spiked to {int(visc_cp)} cP. Prepare CSS cycle."

        # 2. Pump Health
        if pump_eff > 72.0:
            pump_status = "GOOD"
            pump_summary = f"Pump volumetric efficiency is high at {pump_eff:.1f}%. Valve seals and fillage nominal."
        elif pump_eff > 55.0:
            pump_status = "WATCH"
            pump_summary = f"Volumetric efficiency at {pump_eff:.1f}%. Mild slippage or viscosity lag detected in traveling valve."
        else:
            pump_status = "WARNING"
            pump_summary = f"Low pump efficiency ({pump_eff:.1f}%). Possible severe fluid pounding or gas interference."

        # 3. Rod Health
        rod_stress_ratio = rod_load / 28500.0
        if rod_stress_ratio < 0.65 and mech_res["rod_floating"]["level"] in ["GOOD", "WATCH"]:
            rod_status = "GOOD"
            rod_summary = f"Rod string tension at {int(rod_load)} lbs ({rod_stress_ratio*100:.1f}% of yield). Fatigue life within bounds."
        elif rod_stress_ratio < 0.82:
            rod_status = "WATCH"
            rod_summary = f"Elevated peak load ({int(rod_load)} lbs). Moderate stress amplitude across stroke cycles."
        else:
            rod_status = "WARNING"
            rod_summary = f"High rod stress ({rod_stress_ratio*100:.1f}% of rating). Immediate stroke/SPM mitigation advised."

        # 4. Production Health
        if oil_rate > 55.0:
            prod_status = "GOOD"
            prod_trend = "STABLE"
        elif oil_rate > 35.0:
            prod_status = "WATCH"
            prod_trend = "DECLINING"
        else:
            prod_status = "WARNING"
            prod_trend = "DEPLETED"

        # 5. Equipment Health
        equip_status = "WARNING" if anomaly_res["is_anomaly"] else ("WATCH" if pump_status == "WATCH" else "GOOD")

        # Overall well health label
        statuses = [thermal_status, pump_status, rod_status, prod_status, equip_status]
        if "CRITICAL" in statuses or statuses.count("WARNING") >= 2:
            overall_health = "WARNING"
        elif "WATCH" in statuses:
            overall_health = "WATCH"
        else:
            overall_health = "GOOD"

        return {
            "well_id": well_id,
            "overall_health_condition": overall_health,
            "sections": {
                "thermal_health": {
                    "status": thermal_status,
                    "temperature_c": temp_c,
                    "viscosity_cp": visc_cp,
                    "summary": thermal_summary
                },
                "pump_health": {
                    "status": pump_status,
                    "efficiency_pct": pump_eff,
                    "fillage_pct": round(min(pump_eff * 1.15, 95.0), 1),
                    "summary": pump_summary
                },
                "rod_health": {
                    "status": rod_status,
                    "peak_load_lbs": rod_load,
                    "stress_ratio_pct": round(rod_stress_ratio * 100.0, 1),
                    "summary": rod_summary
                },
                "production_health": {
                    "status": prod_status,
                    "trend": prod_trend,
                    "oil_rate_bpd": oil_rate,
                    "sor": point.get("sor", 3.2),
                    "summary": f"Current rate: {oil_rate:.1f} bpd with SOR of {point.get('sor', 3.2):.2f}."
                },
                "equipment_health": {
                    "status": equip_status,
                    "anomaly_detection": anomaly_res["severity"],
                    "vfd_hz": point.get("vfd_speed_hz", 45.0),
                    "summary": f"Anomaly engine reports: {', '.join(anomaly_res['contributing_factors'])}."
                }
            },
            "risk_cards": [
                {
                    "title": "Rod Floating Risk",
                    "level": mech_res["rod_floating"]["level"],
                    "score": mech_res["rod_floating"]["score"],
                    "factor": "Viscous buoyant drag vs rod gravity",
                    "explanation": mech_res["rod_floating"]["explanation"]
                },
                {
                    "title": "Impact Loading (Fluid Pound)",
                    "level": mech_res["impact_loading"]["level"],
                    "score": mech_res["impact_loading"]["score"],
                    "factor": "Incomplete pump chamber fillage",
                    "explanation": mech_res["impact_loading"]["explanation"]
                },
                {
                    "title": "Rod Fatigue Parting Risk",
                    "level": mech_res["rod_fatigue"]["level"],
                    "score": mech_res["rod_fatigue"]["score"],
                    "factor": "Goodman cyclic stress amplitude",
                    "explanation": mech_res["rod_fatigue"]["explanation"]
                },
                {
                    "title": "Pump Unsetting Risk",
                    "level": mech_res["pump_unsetting"]["level"],
                    "score": mech_res["pump_unsetting"]["score"],
                    "factor": "Upstroke frictional drag against anchor",
                    "explanation": mech_res["pump_unsetting"]["explanation"]
                }
            ],
            "model_architecture": {
                "labeled_failure_data_available": False,
                "strategy_used": "Physics-Guided Semi-Supervised + Isolation Forest Anomaly Detection",
                "models_applied": ["Arrhenius Viscosity Inversion", "API RP 11L SRP Mechanics", "Scikit-Learn Isolation Forest"]
            }
        }

health_service = HealthService()
