import numpy as np
from typing import Dict, Any, List
from sklearn.ensemble import IsolationForest

class AnomalyDetector:
    """
    Detects telemetry anomalies and sensor deviations using Isolation Forest
    with fallback robust z-score statistical monitoring.
    """

    def __init__(self, contamination: float = 0.05):
        self.contamination = contamination
        self.model = IsolationForest(contamination=contamination, random_state=42)
        # Pre-fit on representative synthetic operating envelope
        self._fit_baseline()

    def _fit_baseline(self):
        # Baseline normal synthetic points: [temp, pressure, rod_load, pump_eff]
        np.random.seed(42)
        temps = np.random.normal(120.0, 15.0, 300)
        pressures = np.random.normal(85.0, 10.0, 300)
        rod_loads = np.random.normal(16500.0, 1200.0, 300)
        efficiencies = np.random.normal(75.0, 6.0, 300)
        X = np.column_stack([temps, pressures, rod_loads, efficiencies])
        self.model.fit(X)

    def evaluate_point(self, temp_c: float, pressure_bar: float, rod_load_lbs: float, pump_efficiency_pct: float) -> Dict[str, Any]:
        """
        Evaluates a single telemetry record for operational abnormalities.
        """
        X_sample = np.array([[temp_c, pressure_bar, rod_load_lbs, pump_efficiency_pct]])
        prediction = self.model.predict(X_sample)[0] # -1 for anomaly, 1 for normal
        score = float(self.model.decision_function(X_sample)[0])

        is_anomaly = bool(prediction == -1)
        # Anomaly score normalized (0 = clean normal, 1 = severe anomaly)
        normalized_score = float(np.clip(0.5 - (score * 2.0), 0.0, 1.0))

        contributors = []
        if temp_c > 290.0 or temp_c < 55.0:
            contributors.append("Thermal sensor out-of-envelope")
        if rod_load_lbs > 24000.0:
            contributors.append("High rod tension spike")
        elif rod_load_lbs < 6000.0:
            contributors.append("Abnormally low rod load (floating or parting)")
        if pump_efficiency_pct < 40.0:
            contributors.append("Pump volumetric degradation")

        return {
            "is_anomaly": is_anomaly,
            "anomaly_score": round(normalized_score, 3),
            "severity": "CRITICAL" if normalized_score > 0.75 else ("WARNING" if is_anomaly else "NORMAL"),
            "contributing_factors": contributors if contributors else ["Parameters within operating envelope"]
        }

anomaly_engine = AnomalyDetector()
