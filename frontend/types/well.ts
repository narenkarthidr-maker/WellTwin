export interface Well {
  id: number;
  well_id: string;
  name: string;
  field: string;
  status: string;
  latitude: number;
  longitude: number;
  depth_m: number;
  reservoir_layer: string;
  current_css_cycle: number;
  data_mode: string;
  created_at: string;
}

export interface WellState {
  well_id: string;
  name: string;
  field: string;
  data_mode: string;
  data_mode_label: string;
  status: string;
  timestamp: string;
  oil_rate_bpd: number;
  water_rate_bpd: number;
  reservoir_temp_c: number;
  estimated_viscosity_cp: number;
  sor: number;
  pump_efficiency_pct: number;
  energy_kwh_per_bbl: number;
  stroke_length_in: number;
  spm: number;
  vfd_speed_hz: number;
  rod_load_lbs: number;
  steam_volume_tons: number;
  injection_pressure_bar: number;
  soak_time_days: number;
  thermal_condition: "GOOD" | "WATCH" | "WARNING" | "CRITICAL";
  pump_condition: "GOOD" | "WATCH" | "WARNING" | "CRITICAL";
  rod_floating_risk: "GOOD" | "WATCH" | "WARNING" | "CRITICAL";
  impact_load_risk: "GOOD" | "WATCH" | "WARNING" | "CRITICAL";
  pump_unsetting_risk: "GOOD" | "WATCH" | "WARNING" | "CRITICAL";
  production_trend: string;
  ai_insight: string;
  constraint_status: string;
}

export interface TelemetryPoint {
  timestamp: string;
  well_id: string;
  temperature_c: number;
  pressure_bar: number;
  viscosity_cp: number;
  oil_rate_bpd: number;
  water_rate_bpd: number;
  steam_volume_tons: number;
  injection_pressure_bar: number;
  soak_time_days: number;
  spm: number;
  stroke_length_in: number;
  vfd_speed_hz: number;
  rod_load_lbs: number;
  pump_efficiency_pct: number;
  energy_kwh_per_bbl: number;
  sor: number;
  rod_floating_risk: number;
  impact_load_risk: number;
  is_synthetic: boolean;
}

export interface WellHealthData {
  well_id: string;
  overall_health_condition: string;
  sections: {
    thermal_health: { status: string; temperature_c: number; viscosity_cp: number; summary: string };
    pump_health: { status: string; efficiency_pct: number; fillage_pct: number; summary: string };
    rod_health: { status: string; peak_load_lbs: number; stress_ratio_pct: number; summary: string };
    production_health: { status: string; trend: string; oil_rate_bpd: number; sor: number; summary: string };
    equipment_health: { status: string; anomaly_detection: string; vfd_hz: number; summary: string };
  };
  risk_cards: Array<{
    title: string;
    level: string;
    score: number;
    factor: string;
    explanation: string;
  }>;
  model_architecture: {
    labeled_failure_data_available: boolean;
    strategy_used: string;
    models_applied: string[];
  };
}
