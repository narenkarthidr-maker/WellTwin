from typing import Dict, Any, List

class MechanicalFailurePredictor:
    """
    Evaluates specific mechanical failure modes for Heavy Oil SRP operations:
    1. Rod Floating Risk: heavy viscous drag slows downstroke fall
    2. Rod Parting / Fatigue Stress: Goodman diagram stress ratio
    3. Fluid Pound / Impact Loading: incomplete pump chamber fillage
    4. Pump Unsetting Risk: upward friction during upstroke
    """

    def predict_risks(
        self,
        viscosity_cp: float,
        spm: float,
        stroke_length_in: float,
        pprl_lbs: float,
        mprl_lbs: float,
        pump_fillage_pct: float
    ) -> Dict[str, Any]:
        
        # 1. Rod floating risk
        # Viscosity > 1500 cP coupled with SPM > 5.5 causes high floating probability
        floating_term = (viscosity_cp / 3500.0) * (spm / 6.0)
        rod_floating_score = min(max((floating_term - 0.20) / 0.80, 0.02), 0.98)
        
        # 2. Impact load risk (Fluid pound)
        if pump_fillage_pct < 60.0:
            impact_score = min(0.95, 0.25 + (60.0 - pump_fillage_pct) * 0.02)
        else:
            impact_score = max(0.04, 0.15 - (pump_fillage_pct / 100.0) * 0.10)

        # 3. Rod fatigue stress (API modified Goodman criteria)
        rod_allowable_stress_lbs = 28500.0
        stress_ratio = pprl_lbs / rod_allowable_stress_lbs
        rod_fatigue_score = min(max(stress_ratio - 0.50, 0.05), 0.98)

        # 4. Pump unsetting risk
        unsetting_score = min(max((viscosity_cp / 8000.0) * (stroke_length_in / 150.0), 0.03), 0.90)

        def get_level(val: float) -> str:
            if val < 0.25:
                return "GOOD"
            elif val < 0.50:
                return "WATCH"
            elif val < 0.75:
                return "WARNING"
            else:
                return "CRITICAL"

        return {
            "rod_floating": {
                "score": round(rod_floating_score, 3),
                "level": get_level(rod_floating_score),
                "explanation": (
                    f"Viscosity of {int(viscosity_cp)} cP at {spm:.1f} SPM creates "
                    f"{'high' if rod_floating_score > 0.5 else 'moderate' if rod_floating_score > 0.25 else 'low'} "
                    "downward drag resistance."
                )
            },
            "impact_loading": {
                "score": round(impact_score, 3),
                "level": get_level(impact_score),
                "explanation": (
                    f"Pump fillage at {pump_fillage_pct:.1f}% indicates "
                    f"{'fluid pounding potential on downstroke' if impact_score > 0.4 else 'adequate chamber fluid fillage'}."
                )
            },
            "rod_fatigue": {
                "score": round(rod_fatigue_score, 3),
                "level": get_level(rod_fatigue_score),
                "explanation": f"Peak rod load at {int(pprl_lbs)} lbs ({stress_ratio*100:.1f}% of API rating)."
            },
            "pump_unsetting": {
                "score": round(unsetting_score, 3),
                "level": get_level(unsetting_score),
                "explanation": "Anchoring load margin under viscous drag."
            }
        }

failure_engine = MechanicalFailurePredictor()
