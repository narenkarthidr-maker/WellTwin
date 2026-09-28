export interface ConstraintCheckItem {
  name: string;
  status: "PASSED" | "FAILED" | "WARNING";
  current_value: number;
  limit_value: number;
  operator: string;
  unit: string;
  message: string;
}

export interface EngineeringConstraintReport {
  overall_status: "PASSED" | "FAILED";
  passed_count: number;
  total_count: number;
  constraints: ConstraintCheckItem[];
  rejection_reason?: string | null;
}

export interface CandidateSolution {
  solution_id: string;
  feasibility: "FEASIBLE" | "INFEASIBLE" | "TRADE-OFF" | "RECOMMENDED";
  css_steam_volume_tons: number;
  css_injection_pressure_bar: number;
  css_soak_time_days: number;
  srp_stroke_in: number;
  srp_spm: number;
  srp_vfd_hz: number;
  predicted_oil_rate_bpd: number;
  predicted_sor: number;
  predicted_energy_kwh_per_bbl: number;
  predicted_pump_efficiency_pct: number;
  predicted_viscosity_cp: number;
  mechanical_risk_index: number;
  thermal_utilization_index: number;
  objective_score: number;
  constraint_passed: boolean;
  rejection_reason?: string | null;
}

export interface JointOptimizeResponse {
  well_id: string;
  timestamp: string;
  message: string;
  recommended_solution: CandidateSolution;
  trade_off_solutions: CandidateSolution[];
  all_candidates_count: number;
  feasible_count: number;
  infeasible_count: number;
  constraint_report: EngineeringConstraintReport;
  explainable_factors: Array<{ factor: string; impact: string; note: string }>;
  why_recommended: string;
  data_mode_label: string;
}

export interface SRPOptimizeResponse {
  well_id: string;
  safe_spm_window: { min_spm: number; max_spm: number; optimal_spm: number };
  safe_stroke_window: { min_stroke_in: number; max_stroke_in: number; optimal_stroke_in: number };
  optimal_vfd_hz: number;
  predicted_pump_efficiency_pct: number;
  predicted_rod_load_lbs: number;
  curve_data: Array<{
    spm: number;
    pump_efficiency_pct: number;
    mechanical_risk_pct: number;
    rod_floating_risk: number;
    is_in_safe_window: boolean;
  }>;
  constraint_report: EngineeringConstraintReport;
  explanation: string;
}

export interface CSSOptimizeResponse {
  well_id: string;
  recommended_steam_volume_range: { min: number; max: number; optimal: number };
  recommended_injection_pressure_range: { min: number; max: number; optimal: number };
  recommended_soak_time_days: number;
  predicted_sor: number;
  predicted_peak_rate_bpd: number;
  constraint_report: EngineeringConstraintReport;
  explanation: string;
}
