import { Well, WellState, TelemetryPoint, WellHealthData } from "@/types/well";
import { JointOptimizeResponse, SRPOptimizeResponse, CSSOptimizeResponse } from "@/types/optimization";
import { ScenarioComparison, SimulationResponse, RecommendationItem } from "@/types/simulation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export async function fetchWells(): Promise<Well[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/wells`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch wells");
    return await res.json();
  } catch (err) {
    console.warn("API offline, using fallback wells list", err);
    return [
      { id: 1, well_id: "BGH-01", name: "Baghewala Well #01", field: "Baghewala Heavy Oil Field", status: "PRODUCING", latitude: 27.915, longitude: 72.845, depth_m: 1150, reservoir_layer: "Jodhpur Sandstone (Heavy Oil)", current_css_cycle: 3, data_mode: "DEMO", created_at: "2024-01-10T08:00:00Z" },
      { id: 2, well_id: "BGH-02", name: "Baghewala Well #02", field: "Baghewala Heavy Oil Field", status: "PRODUCING", latitude: 27.922, longitude: 72.851, depth_m: 1162, reservoir_layer: "Jodhpur Sandstone (Heavy Oil)", current_css_cycle: 4, data_mode: "DEMO", created_at: "2024-01-15T08:00:00Z" },
      { id: 3, well_id: "BGH-03", name: "Baghewala Well #03", field: "Baghewala Heavy Oil Field", status: "SHUT_IN", latitude: 27.908, longitude: 72.839, depth_m: 1145, reservoir_layer: "Jodhpur Sandstone (Heavy Oil)", current_css_cycle: 4, data_mode: "DEMO", created_at: "2024-02-01T08:00:00Z" }
    ];
  }
}

export async function fetchWellState(wellId: string = "BGH-01"): Promise<WellState> {
  try {
    const res = await fetch(`${API_BASE_URL}/wells/${wellId}/state`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch well state");
    return await res.json();
  } catch {
    return {
      well_id: wellId,
      name: `Baghewala Well #${wellId.replace("BGH-0", "")}`,
      field: "Baghewala Heavy Oil Field, Bikaner-Nagaur Basin",
      data_mode: "DEMO",
      data_mode_label: "DEMO MODE • SYNTHETIC DATA",
      status: "PRODUCING",
      timestamp: new Date().toISOString(),
      oil_rate_bpd: 48.5,
      water_rate_bpd: 16.8,
      reservoir_temp_c: 82.4,
      estimated_viscosity_cp: 1250,
      sor: 3.25,
      pump_efficiency_pct: 74.5,
      energy_kwh_per_bbl: 42.1,
      stroke_length_in: 120,
      spm: 5.2,
      vfd_speed_hz: 45.0,
      rod_load_lbs: 16500,
      steam_volume_tons: 2600,
      injection_pressure_bar: 112,
      soak_time_days: 5,
      thermal_condition: "WATCH",
      pump_condition: "GOOD",
      rod_floating_risk: "WATCH",
      impact_load_risk: "GOOD",
      pump_unsetting_risk: "GOOD",
      production_trend: "DECLINING",
      ai_insight: "Reservoir cooling (82.4°C) is increasing estimated viscosity (1250 cP). The predicted safe SRP operating window is narrowing. Run Joint Optimization before the next CSS cycle.",
      constraint_status: "PASSED"
    };
  }
}

export async function fetchDigitalTwin(wellId: string = "BGH-01"): Promise<Record<string, unknown>> {
  const res = await fetch(`${API_BASE_URL}/digital-twin/${wellId}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch digital twin");
  return await res.json();
}

export async function recalculateDigitalTwin(wellId: string, params: Record<string, unknown>): Promise<Record<string, unknown>> {
  const res = await fetch(`${API_BASE_URL}/digital-twin/${wellId}/recalculate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params)
  });
  return await res.json();
}

export async function fetchTelemetry(wellId: string = "BGH-01", limit: number = 40): Promise<TelemetryPoint[]> {
  const res = await fetch(`${API_BASE_URL}/wells/${wellId}/telemetry?limit=${limit}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch telemetry");
  return await res.json();
}

export async function fetchWellHealth(wellId: string = "BGH-01"): Promise<WellHealthData> {
  const res = await fetch(`${API_BASE_URL}/health/${wellId}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch health");
  return await res.json();
}

export async function runJointOptimization(params: Record<string, unknown>): Promise<JointOptimizeResponse> {
  const res = await fetch(`${API_BASE_URL}/optimizer/joint`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params)
  });
  return await res.json();
}

export async function optimizeSRP(params: Record<string, unknown>): Promise<SRPOptimizeResponse> {
  const res = await fetch(`${API_BASE_URL}/srp/optimize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params)
  });
  return await res.json();
}

export async function optimizeCSS(params: Record<string, unknown>): Promise<CSSOptimizeResponse> {
  const res = await fetch(`${API_BASE_URL}/css/optimize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params)
  });
  return await res.json();
}

export async function fetchScenarioComparison(): Promise<ScenarioComparison> {
  const res = await fetch(`${API_BASE_URL}/simulator/comparison`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch scenario comparison");
  return await res.json();
}

export async function runCustomSimulation(params: Record<string, unknown>): Promise<SimulationResponse> {
  const res = await fetch(`${API_BASE_URL}/simulator/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params)
  });
  return await res.json();
}

export async function fetchRecommendations(wellId?: string): Promise<RecommendationItem[]> {
  const url = wellId ? `${API_BASE_URL}/recommendations?well_id=${wellId}` : `${API_BASE_URL}/recommendations`;
  const res = await fetch(url, { cache: "no-store" });
  return await res.json();
}

export async function approveRecommendation(recId: number, action: string, notes?: string): Promise<{
  success: boolean;
  recommendation: RecommendationItem;
  message: string;
}> {
  const res = await fetch(`${API_BASE_URL}/recommendations/approve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      recommendation_id: recId,
      action: action,
      engineer_name: "Chief Production Engineer (Bikaner-Nagaur Asset)",
      notes: notes
    })
  });
  return await res.json();
}

export async function fetchSystemStatus(): Promise<Record<string, unknown>> {
  const res = await fetch(`${API_BASE_URL}/system/status`, { cache: "no-store" });
  return await res.json();
}

export async function fetchModelRegistry(): Promise<Array<{
  name: string;
  type: string;
  version: string;
  training_dataset: string;
  metrics?: Record<string, unknown>;
  status: string;
}>> {
  const res = await fetch(`${API_BASE_URL}/system/models`, { cache: "no-store" });
  return await res.json();
}

export async function fetchReplayStatus(): Promise<Record<string, unknown>> {
  const res = await fetch(`${API_BASE_URL}/datasets/replay`, { cache: "no-store" });
  return await res.json();
}

export async function controlReplay(action: string, speed?: number, wellId?: string): Promise<Record<string, unknown>> {
  const res = await fetch(`${API_BASE_URL}/datasets/replay/control`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, speed, well_id: wellId })
  });
  return await res.json();
}

export async function resetDemoDataset(): Promise<Record<string, unknown>> {
  const res = await fetch(`${API_BASE_URL}/datasets/reset`, { method: "POST" });
  return await res.json();
}
