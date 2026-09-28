export interface SimulationTimeSeriesPoint {
  day: number;
  oil_rate_bpd: number;
  reservoir_temp_c: number;
  viscosity_cp: number;
  sor: number;
  energy_kwh: number;
  rod_load_lbs: number;
  mechanical_risk_pct: number;
}

export interface ScenarioMetrics {
  scenario_name: string;
  oil_production_bpd: number;
  sor: number;
  energy_kwh_per_bbl: number;
  pump_efficiency_pct: number;
  rod_load_lbs: number;
  mechanical_risk_pct: number;
  thermal_drawdown_days: number;
  estimated_viscosity_cp: number;
}

export interface SimulationResponse {
  scenario_name: string;
  is_simulated: boolean;
  notice: string;
  metrics: ScenarioMetrics;
  time_series: SimulationTimeSeriesPoint[];
}

export interface ScenarioComparison {
  scenarios: SimulationResponse[];
  comparison_summary: {
    oil_production_diff_bpd: number;
    sor_reduction: number;
    energy_savings_kwh_per_bbl: number;
    mechanical_risk_reduction_pct: number;
  };
  winning_scenario: string;
}

export interface RecommendationItem {
  id: number;
  well_id: string;
  created_at: string;
  recommendation_type: string;
  title: string;
  what_action: string;
  why_explanation: string;
  expected_effect: string;
  confidence_pct?: number | null;
  constraint_status: string;
  constraint_details?: any;
  payload: any;
  approval_status: "PENDING_REVIEW" | "APPROVED_FOR_SIMULATION" | "REJECTED";
  approved_at?: string | null;
  approved_by?: string | null;
  contributing_factors?: Array<{ factor: string; impact: string; detail: string }>;
}
