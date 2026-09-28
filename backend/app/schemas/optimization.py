from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

# Constraint check item
class ConstraintCheckItem(BaseModel):
    name: str
    status: str # "PASSED" | "FAILED" | "WARNING"
    current_value: float
    limit_value: float
    operator: str # "<=", ">=", "range"
    unit: str
    message: str

class EngineeringConstraintReport(BaseModel):
    overall_status: str # "PASSED" | "FAILED"
    passed_count: int
    total_count: int
    constraints: List[ConstraintCheckItem]
    rejection_reason: Optional[str] = None

# CSS schemas
class CSSPredictionRequest(BaseModel):
    well_id: str = "BGH-01"
    steam_volume_tons: float = Field(2500.0, ge=500.0, le=8000.0)
    injection_pressure_bar: float = Field(110.0, ge=40.0, le=160.0)
    injection_rate_tons_per_day: float = Field(120.0, ge=50.0, le=300.0)
    soak_time_days: float = Field(5.0, ge=1.0, le=20.0)
    production_cutoff_bpd: float = Field(15.0, ge=5.0, le=50.0)

class CSSPredictionResponse(BaseModel):
    well_id: str
    reservoir_temp_response_c: float
    estimated_viscosity_response_cp: float
    peak_oil_rate_bpd: float
    cycle_oil_recovery_tons: float
    predicted_sor: float
    thermal_efficiency_pct: float
    heat_loss_wellbore_pct: float
    constraint_report: EngineeringConstraintReport
    is_model_prediction: bool = True

class CSSOptimizeRequest(BaseModel):
    well_id: str = "BGH-01"
    weight_production: float = 0.35
    weight_steam_efficiency: float = 0.25
    weight_energy: float = 0.20
    weight_risk: float = 0.20

class CSSOptimizeResponse(BaseModel):
    well_id: str
    recommended_steam_volume_range: Dict[str, float] # min, max, optimal
    recommended_injection_pressure_range: Dict[str, float]
    recommended_soak_time_days: float
    predicted_sor: float
    predicted_peak_rate_bpd: float
    constraint_report: EngineeringConstraintReport
    explanation: str

# SRP schemas
class SRPPredictionRequest(BaseModel):
    well_id: str = "BGH-01"
    stroke_length_in: float = Field(120.0, ge=60.0, le=200.0)
    spm: float = Field(5.0, ge=1.0, le=14.0)
    vfd_speed_hz: float = Field(45.0, ge=20.0, le=65.0)
    fluid_viscosity_cp: Optional[float] = None # If None, deduced from well state

class SRPPredictionResponse(BaseModel):
    well_id: str
    pump_efficiency_pct: float
    peak_polished_rod_load_lbs: float
    min_polished_rod_load_lbs: float
    pump_fillage_pct: float
    rod_floating_risk: float
    impact_load_risk: float
    pump_unsetting_risk: float
    mechanical_stress_pct: float
    power_consumption_kw: float
    operating_status: str # "SAFE" | "WATCH" | "RESTRICTED"
    constraint_report: EngineeringConstraintReport
    is_model_prediction: bool = True

class SRPOptimizeRequest(BaseModel):
    well_id: str = "BGH-01"
    current_spm: float = 5.0
    current_stroke_in: float = 120.0
    fluid_viscosity_cp: Optional[float] = None

class SRPOptimizeResponse(BaseModel):
    well_id: str
    safe_spm_window: Dict[str, float] # min_spm, max_spm, optimal_spm
    safe_stroke_window: Dict[str, float]
    optimal_vfd_hz: float
    predicted_pump_efficiency_pct: float
    predicted_rod_load_lbs: float
    curve_data: List[Dict[str, Any]] # spm, efficiency, mechanical_risk, net_score
    constraint_report: EngineeringConstraintReport
    explanation: str

# Joint Optimizer schemas
class JointOptimizeRequest(BaseModel):
    well_id: str = "BGH-01"
    target_production_weight: float = 0.30
    thermal_utilization_weight: float = 0.25
    sor_reduction_weight: float = 0.20
    energy_minimization_weight: float = 0.15
    mechanical_risk_weight: float = 0.10
    # Current operating conditions from UI
    current_steam_volume_tons: Optional[float] = 2600.0
    current_injection_pressure_bar: Optional[float] = 112.0
    current_soak_time_days: Optional[float] = 5.0
    current_production_cutoff_bpd: Optional[float] = 15.0
    current_stroke_length_in: Optional[float] = 120.0
    current_spm: Optional[float] = 5.2
    current_vfd_hz: Optional[float] = 45.0
    current_temp_c: Optional[float] = 82.4
    current_viscosity_cp: Optional[float] = 1250.0
    current_oil_rate_bpd: Optional[float] = 48.5
    current_sor: Optional[float] = 3.25
    current_pump_efficiency_pct: Optional[float] = 74.5
    current_energy_kwh_per_bbl: Optional[float] = 42.1

class CandidateSolution(BaseModel):
    solution_id: str
    feasibility: str # "FEASIBLE" | "INFEASIBLE" | "TRADE-OFF" | "RECOMMENDED"
    css_steam_volume_tons: float
    css_injection_pressure_bar: float
    css_soak_time_days: float
    srp_stroke_in: float
    srp_spm: float
    srp_vfd_hz: float
    predicted_oil_rate_bpd: float
    predicted_sor: float
    predicted_energy_kwh_per_bbl: float
    predicted_pump_efficiency_pct: float
    predicted_viscosity_cp: float
    mechanical_risk_index: float # 0 - 1
    thermal_utilization_index: float
    objective_score: float
    constraint_passed: bool
    rejection_reason: Optional[str] = None

class JointOptimizeResponse(BaseModel):
    well_id: str
    timestamp: str
    message: str = (
        "We do not optimize CSS and SRP independently. "
        "We model how thermal reservoir behavior affects heavy-oil viscosity, "
        "how viscosity affects artificial-lift performance, "
        "and then jointly optimize CSS and SRP within engineering constraints."
    )
    recommended_solution: CandidateSolution
    trade_off_solutions: List[CandidateSolution]
    all_candidates_count: int
    feasible_count: int
    infeasible_count: int
    constraint_report: EngineeringConstraintReport
    explainable_factors: List[Dict[str, Any]] # factor, impact (HIGH/MED/LOW), note
    why_recommended: str
    data_mode_label: str = "DEMO MODE • SYNTHETIC DATA"
