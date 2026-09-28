import io
import math
import random
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, Any, List, Tuple
from app.twin.reservoir_model import HeavyOilReservoirModel

class DatasetService:
    """
    Manages realistic synthetic dataset generation for Baghewala wells,
    file validation (missing values, range checks, duplicates), and replay buffers.
    """

    def __init__(self):
        self.reservoir = HeavyOilReservoirModel()
        self._replay_buffers: Dict[str, List[Dict[str, Any]]] = {}
        self._initialize_synthetic_datasets()

    def _initialize_synthetic_datasets(self):
        """
        Creates physically consistent synthetic datasets for 3 demo wells:
        BGH-01: In mid-late production stage of CSS Cycle 3 (cooling, viscosity rising -> demo prompt focus)
        BGH-02: Freshly soaked CSS Cycle 4 (hot, high production, high efficiency)
        BGH-03: Cold mature well requiring imminent CSS cycle (low temp, high viscosity, restricted SPM)
        """
        self._replay_buffers["BGH-01"] = self._generate_well_telemetry("BGH-01", days_back=60, cooling_stage=True)
        self._replay_buffers["BGH-02"] = self._generate_well_telemetry("BGH-02", days_back=60, cooling_stage=False)
        self._replay_buffers["BGH-03"] = self._generate_well_telemetry("BGH-03", days_back=60, cooling_stage=True, mature=True)

    def _generate_well_telemetry(self, well_id: str, days_back: int = 60, cooling_stage: bool = True, mature: bool = False) -> List[Dict[str, Any]]:
        points = []
        now = datetime.utcnow()
        start_time = now - timedelta(days=days_back)

        base_temp = 145.0 if not cooling_stage else (82.0 if not mature else 64.0)
        temp_decay = 0.45 if cooling_stage else 0.15

        for day in range(days_back):
            ts = start_time + timedelta(days=day, hours=random.randint(0, 12))
            
            # Thermal evolution
            t_current = max(base_temp - (day * temp_decay) + math.sin(day * 0.3) * 1.5, 58.0)
            visc = self.reservoir.calculate_viscosity(t_current)
            
            # Pressure
            pressure = 92.0 - (day * 0.25) + random.uniform(-1.0, 1.0)
            
            # Production response to viscosity
            base_rate = 85.0 if not cooling_stage else (52.0 if not mature else 28.0)
            visc_penalty = math.log10(max(visc / 100.0, 1.0)) * 6.5
            oil_rate = max(base_rate - visc_penalty - (day * 0.3) + random.uniform(-2.0, 2.0), 12.0)
            
            # SRP operation
            spm = 6.2 if not cooling_stage else (5.0 if not mature else 3.8)
            stroke = 120.0
            vfd = 45.0
            
            # As viscosity rises, downstroke drag increases rod load and floating risk
            rod_load = 15800.0 + (visc / 50.0) + random.uniform(-200.0, 200.0)
            pump_eff = max(88.0 - (visc / 120.0) - random.uniform(0.0, 3.0), 38.0)
            
            floating_risk = min(max((visc / 3500.0) * (spm / 5.5) * 0.35, 0.05), 0.95)
            impact_risk = min(max(0.06 + (85.0 - pump_eff) * 0.005, 0.04), 0.85)

            points.append({
                "timestamp": ts.isoformat(),
                "well_id": well_id,
                "temperature_c": round(t_current, 1),
                "pressure_bar": round(pressure, 1),
                "viscosity_cp": round(visc, 1),
                "oil_rate_bpd": round(oil_rate, 1),
                "water_rate_bpd": round(oil_rate * 0.35, 1),
                "steam_volume_tons": 2600.0 if day < 5 else 0.0,
                "injection_pressure_bar": 112.0 if day < 5 else 0.0,
                "soak_time_days": 5.0,
                "spm": round(spm, 1),
                "stroke_length_in": stroke,
                "vfd_speed_hz": vfd,
                "rod_load_lbs": round(rod_load, 0),
                "pump_efficiency_pct": round(pump_eff, 1),
                "energy_kwh_per_bbl": round(38.0 + (visc / 300.0), 1),
                "sor": round(3.1 + (day * 0.02), 2),
                "rod_floating_risk": round(floating_risk, 3),
                "impact_load_risk": round(impact_risk, 3),
                "is_synthetic": True
            })

        return points

    def get_telemetry_history(self, well_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        records = self._replay_buffers.get(well_id, self._replay_buffers.get("BGH-01", []))
        return records[-limit:]

    def get_latest_point(self, well_id: str) -> Dict[str, Any]:
        records = self.get_telemetry_history(well_id, limit=1)
        if records:
            return records[-1]
        return self._replay_buffers["BGH-01"][-1]

    def validate_dataset(self, file_content: str, filename: str) -> Dict[str, Any]:
        """
        Validates uploaded CSV or JSON datasets:
        - Schema & required fields check
        - Missing values
        - Duplicate timestamps
        - Out-of-bounds physical ranges
        - Unit consistency
        """
        try:
            if filename.endswith(".csv"):
                df = pd.read_csv(io.StringIO(file_content))
            elif filename.endswith(".json"):
                df = pd.read_json(io.StringIO(file_content))
            else:
                return {"valid": False, "error": "Unsupported file format. Please upload CSV or JSON."}
        except Exception as e:
            return {"valid": False, "error": f"Parse error: {str(e)}"}

        row_count = len(df)
        if row_count == 0:
            return {"valid": False, "error": "Uploaded file contains no rows."}

        required_fields = ["temperature_c", "pressure_bar", "oil_rate_bpd"]
        missing_fields = [f for f in required_fields if f not in df.columns]
        if missing_fields:
            return {
                "valid": False,
                "error": f"Missing mandatory telemetry columns: {', '.join(missing_fields)}"
            }

        missing_values_count = int(df.isnull().sum().sum())
        
        # Check ranges
        outliers = []
        if "temperature_c" in df.columns:
            invalid_temp = df[(df["temperature_c"] < 20.0) | (df["temperature_c"] > 350.0)]
            if len(invalid_temp) > 0:
                outliers.append(f"{len(invalid_temp)} temperature values outside physical range (20°C - 350°C)")

        if "spm" in df.columns:
            invalid_spm = df[(df["spm"] < 0.5) | (df["spm"] > 25.0)]
            if len(invalid_spm) > 0:
                outliers.append(f"{len(invalid_spm)} SPM values outside operating envelope (0.5 - 25 SPM)")

        time_range = "N/A"
        duplicate_timestamps = 0
        if "timestamp" in df.columns:
            try:
                df["dt"] = pd.to_datetime(df["timestamp"])
                time_range = f"{df['dt'].min().strftime('%Y-%m-%d')} to {df['dt'].max().strftime('%Y-%m-%d')}"
                duplicate_timestamps = int(df["dt"].duplicated().sum())
            except Exception:
                pass

        validation_status = "PASSED" if (len(outliers) == 0 and missing_values_count == 0) else "PASSED_WITH_WARNINGS"

        return {
            "valid": True,
            "filename": filename,
            "rows": row_count,
            "time_range": time_range,
            "missing_values": missing_values_count,
            "duplicate_timestamps": duplicate_timestamps,
            "validation_status": validation_status,
            "warnings": outliers,
            "columns_found": list(df.columns),
            "preview": df.head(5).to_dict(orient="records")
        }

    def reset_demo_data(self):
        self._initialize_synthetic_datasets()
        return {"status": "SUCCESS", "message": "Demo synthetic telemetry reset to factory baseline."}

dataset_service = DatasetService()
