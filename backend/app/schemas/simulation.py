from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional

class ScenarioParameters(BaseModel):
    scenario_name: str
    steam_volume_tons: float = 2400.0
    injection_pressure_bar: float = 110.0
    soak_time_days: float = 5.0
    stroke_length_in: float = 120.0
    spm: float = 5.0
    vfd_speed_hz: float = 45.0

class ScenarioMetrics(BaseModel):
    scenario_name: str
    oil_production_bpd: float
    sor: float
    energy_kwh_per_bbl: float
    pump_efficiency_pct: float
    rod_load_lbs: float
    mechanical_risk_pct: float
    thermal_drawdown_days: float
    estimated_viscosity_cp: float

class SimulationTimeSeriesPoint(BaseModel):
    day: int
    oil_rate_bpd: float
    reservoir_temp_c: float
    viscosity_cp: float
    sor: float
    energy_kwh: float
    rod_load_lbs: float

class SimulationResponse(BaseModel):
    scenario_name: str
    is_simulated: bool = True
    notice: str = "SIMULATED PREDICTION • NOT ACTUAL FIELD MEASUREMENT"
    metrics: ScenarioMetrics
    time_series: List[SimulationTimeSeriesPoint]

class ScenarioComparisonResponse(BaseModel):
    scenarios: List[SimulationResponse]
    comparison_summary: Dict[str, Any]
    winning_scenario: str
