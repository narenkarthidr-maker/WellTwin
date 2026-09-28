from typing import Dict, Any, List, Optional
from datetime import datetime
from app.optimization.constraints import constraint_engine

class RecommendationService:
    """
    Explainable Recommendation Engine with Human-in-the-Loop approval workflows.
    Ensures clear separation between AI proposal, engineering validation, and simulation approval.
    """

    def __init__(self):
        self._recommendations: List[Dict[str, Any]] = [
            {
                "id": 101,
                "well_id": "BGH-01",
                "created_at": datetime.utcnow().isoformat(),
                "recommendation_type": "JOINT_OPT",
                "title": "Narrow SRP SPM Envelope & Schedule Pre-CSS Joint Review",
                "what_action": (
                    "Reduce SRP pumping speed from 5.8 SPM to 5.0 SPM (VFD 44.5 Hz) "
                    "and prepare CSS Cycle 4 injection schedule with 2,800 tons steam at 115 bar."
                ),
                "why_explanation": (
                    "Cooling reservoir conditions (declined from 145°C to 82°C) have increased estimated "
                    "viscosity to ~1,250 cP, which increases downstroke viscous resistance. Operating above "
                    "5.4 SPM risks entering the rod floating regime. The optimizer shifts the SRP operating "
                    "point to maintain volumetric efficiency at 76% while dampening mechanical stress."
                ),
                "expected_effect": (
                    "Model prediction: Lowers rod floating risk from 0.42 to 0.14, stabilizes oil production "
                    "at 48.5 bpd, and avoids fluid pound impact shock."
                ),
                "confidence_pct": None, # Kept None to avoid unsupported claims
                "constraint_status": "PASSED",
                "constraint_details": {
                    "fracture_pressure_margin_bar": 30.0,
                    "rod_load_safety_margin_lbs": 11300.0,
                    "floating_margin": 0.26
                },
                "payload": {
                    "spm": 5.0,
                    "stroke_length_in": 120.0,
                    "vfd_hz": 44.5,
                    "steam_volume_tons": 2800.0,
                    "injection_pressure_bar": 115.0,
                    "soak_time_days": 6.0
                },
                "approval_status": "PENDING_REVIEW",
                "approved_at": None,
                "approved_by": None,
                "contributing_factors": [
                    {"factor": "Reservoir Cooling & Viscosity Rise", "impact": "HIGH IMPACT", "detail": "Temperature decline rate 0.45°C/day elevates viscous drag"},
                    {"factor": "Rod Floating Boundary", "impact": "HIGH IMPACT", "detail": "Downstroke fall speed close to viscous buoyancy limit"},
                    {"factor": "Fracture Pressure Safety Cushion", "impact": "MEDIUM IMPACT", "detail": "Planned injection is 115 bar vs 145 bar cap"},
                    {"factor": "Energy per Barrel Metric", "impact": "LOW IMPACT", "detail": "Lifting energy maintained at ~41 kWh/bbl"}
                ]
            },
            {
                "id": 102,
                "well_id": "BGH-01",
                "created_at": datetime.utcnow().isoformat(),
                "recommendation_type": "THERMAL_ALERT",
                "title": "Thermal Drawdown Threshold Monitoring",
                "what_action": "Set SCADA thermal trigger at 70°C for automated CSS cycle sequencing.",
                "why_explanation": "Below 70°C, Jodhpur sandstone heavy oil viscosity exceeds 3,200 cP, causing severe mobility loss.",
                "expected_effect": "Prevents catastrophic production freeze in near-wellbore area.",
                "confidence_pct": None,
                "constraint_status": "PASSED",
                "constraint_details": {},
                "payload": {"threshold_temp_c": 70.0},
                "approval_status": "PENDING_REVIEW",
                "approved_at": None,
                "approved_by": None,
                "contributing_factors": [
                    {"factor": "Viscosity-Temperature Sensitivity", "impact": "HIGH IMPACT", "detail": "Exponential viscosity rise below 70°C"}
                ]
            },
            {
                "id": 103,
                "well_id": "BGH-03",
                "created_at": datetime.utcnow().isoformat(),
                "recommendation_type": "CSS_TIMING",
                "title": "Immediate CSS Cycle 5 Steam Injection Recommended",
                "what_action": "Shut in well for CSS Cycle 5 steaming: 3,000 tons @ 118 bar with 7-day soak.",
                "why_explanation": "Well BGH-03 has reached thermal baseline (64°C, viscosity 5,800 cP). Continued pumping yields marginal recovery at high rod wear.",
                "expected_effect": "Restore reservoir temperature to ~190°C and boost initial oil rate back above 75 bpd.",
                "confidence_pct": None,
                "constraint_status": "PASSED",
                "constraint_details": {},
                "payload": {"steam_volume_tons": 3000.0, "soak_time_days": 7.0},
                "approval_status": "APPROVED_FOR_SIMULATION",
                "approved_at": datetime.utcnow().isoformat(),
                "approved_by": "Senior Reservoir Engineer",
                "contributing_factors": [
                    {"factor": "Near-wellbore Viscosity Spike", "impact": "HIGH IMPACT", "detail": "Viscosity > 5,000 cP"},
                    {"factor": "Pump Efficiency Collapse", "impact": "HIGH IMPACT", "detail": "Efficiency dropped to 42%"}
                ]
            }
        ]

    def list_recommendations(self, well_id: Optional[str] = None) -> List[Dict[str, Any]]:
        if well_id:
            return [r for r in self._recommendations if r["well_id"] == well_id]
        return self._recommendations

    def update_approval(self, rec_id: int, action: str, engineer_name: str, notes: Optional[str] = None) -> Dict[str, Any]:
        for r in self._recommendations:
            if r["id"] == rec_id:
                if action == "APPROVE_FOR_SIMULATION":
                    r["approval_status"] = "APPROVED_FOR_SIMULATION"
                    r["approved_at"] = datetime.utcnow().isoformat()
                    r["approved_by"] = engineer_name
                elif action == "REJECT":
                    r["approval_status"] = "REJECTED"
                    r["approved_at"] = datetime.utcnow().isoformat()
                    r["approved_by"] = engineer_name
                r["notes"] = notes
                return {
                    "success": True,
                    "recommendation": r,
                    "message": f"Recommendation #{rec_id} status updated to {r['approval_status']} by {engineer_name}."
                }
        return {"success": False, "message": f"Recommendation #{rec_id} not found."}

recommendation_service = RecommendationService()
