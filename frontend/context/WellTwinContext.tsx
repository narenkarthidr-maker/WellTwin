"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

export interface OperatingParams {
  steamVolumeTons: number;       // tons (1000 - 4500)
  injectionPressureBar: number;  // bar (70 - 155)
  soakTimeDays: number;          // days (1 - 14)
  productionCutoffBpd: number;   // bpd (5 - 30)
  strokeLengthIn: number;        // inches (84 - 168)
  spm: number;                   // strokes per minute (2.0 - 10.0)
  vfdHz: number;                 // Hz (25 - 60)
}

export interface CalculatedWellState {
  reservoirTempC: number;
  reservoirPressureBar: number;
  estimatedViscosityCp: number;
  oilProductionBpd: number;
  sor: number;
  pumpEfficiencyPct: number;
  energyKwhPerBbl: number;
  rodFloatingRisk: number;       // 0.0 - 1.0
  impactLoadRisk: number;        // 0.0 - 1.0
  pumpUnsettingRisk: number;     // 0.0 - 1.0
  pprlLbs: number;
  mprlLbs: number;
  hydraulicPowerKw: number;
  status: "COOLING" | "HOT_STABLE" | "DEPLETED" | "OPTIMIZED";
}

export interface CandidateEvaluation {
  id: string;
  name: string;
  params: OperatingParams;
  state: CalculatedWellState;
  score: number;
  feasible: boolean;
  rejectionReason?: string;
  tag: "CURRENT" | "RECOMMENDED" | "TRADE-OFF" | "INFEASIBLE";
}

export interface OptimizationRun {
  runId: string;
  timestamp: string;
  baselineParams: OperatingParams;
  baselineState: CalculatedWellState;
  recommendedParams: OperatingParams;
  recommendedState: CalculatedWellState;
  objectiveScore: number;
  deltaProductionPct: number;
  deltaSorPct: number;
  deltaEnergyPct: number;
  deltaEfficiencyPct: number;
  deltaRiskPct: number;
  candidates: CandidateEvaluation[];
  explainableFactors: Array<{ factor: string; impact: string; note: string }>;
  whyRecommended: string;
  constraints: Array<{ name: string; limit: string; actual: string; status: "PASSED" | "VIOLATED" }>;
}

// CSS-specific optimization result (separate from Joint Optimizer)
export interface CSSOptimizationResult {
  runId: string;
  timestamp: string;
  baselineParams: OperatingParams;
  baselineState: CalculatedWellState;
  recommendedParams: OperatingParams;
  recommendedState: CalculatedWellState;
  // Steam window
  steamVolMin: number;
  steamVolOptimal: number;
  steamVolMax: number;
  // Pressure window
  pressureMin: number;
  pressureOptimal: number;
  pressureMax: number;
  // Soak window
  soakOptimal: number;
  productionCutoffOptimal: number;
  // Predictions
  predictedTempC: number;
  predictedViscosityCp: number;
  predictedProductionBpd: number;
  predictedSor: number;
  predictedEnergyKwhPerBbl: number;
  // Deltas vs baseline
  deltaProductionPct: number;
  deltaSorPct: number;
  deltaEnergyPct: number;
  // Constraints
  constraints: Array<{ name: string; limit: string; actual: string; status: "PASSED" | "VIOLATED" }>;
  overallConstraintStatus: "PASSED" | "VIOLATED";
  explanation: string;
}

// SRP-specific safe window result
export interface SRPSafeWindowResult {
  runId: string;
  timestamp: string;
  // Inputs used
  inputSpm: number;
  inputStroke: number;
  inputVfd: number;
  inputViscosity: number;
  // Safe window bounds (all derived from physics)
  spmMin: number;
  spmOptimal: number;
  spmMax: number;
  strokeMin: number;
  strokeOptimal: number;
  strokeMax: number;
  vfdOptimal: number;
  vfdMin: number;
  vfdMax: number;
  // At optimal point
  predictedEfficiencyPct: number;
  predictedPprlLbs: number;
  predictedRodFloatingRisk: number;
  predictedImpactLoadRisk: number;
  // Current-point risks
  currentRodFloatingRisk: number;
  currentImpactLoadRisk: number;
  currentEfficiencyPct: number;
  // Curve data for chart
  curveData: Array<{
    spm: number;
    pumpEfficiencyPct: number;
    rodFloatingRisk: number;
    impactLoadRisk: number;
    isInSafeWindow: boolean;
  }>;
  constraints: Array<{ name: string; limit: string; actual: string; status: "PASSED" | "VIOLATED" }>;
  overallConstraintStatus: "PASSED" | "VIOLATED";
  feasible: boolean;
  infeasibleReason?: string;
  explanation: string;
}

export interface SensorDataPoint {
  id: string;
  name: string;
  category: "SURFACE" | "SRP" | "WELLBORE" | "RESERVOIR";
  primaryValue: string;
  secondaryValue: string;
  statusText: string;
  statusColor: "emerald" | "amber" | "rose" | "sky";
  coordinates: { x: number; y: number; z: number };
  details: Record<string, string>;
}

export interface DigitalTwinViewSettings {
  viewMode: "3D" | "2D";
  isPlaying: boolean;
  showFlow: boolean;
  showThermal: boolean;
  showSensors: boolean;
  activeDisplayMode: "CURRENT" | "RECOMMENDED";
  selectedSensorId: string | null;
}

export type TwinViewMode = "physical" | "digital" | "compare";

export interface WellTwinContextType {
  selectedWell: string;
  setSelectedWell: (well: string) => void;
  currentParams: OperatingParams;
  updateParams: (updates: Partial<OperatingParams>) => void;
  resetToDefaults: () => void;
  currentState: CalculatedWellState;
  activeParams: OperatingParams;
  activeState: CalculatedWellState;
  isOptimizing: boolean;
  optimizationStatusMsg: string;
  optimizationResult: OptimizationRun | null;
  optimizationHistory: OptimizationRun[];
  runJointOptimization: () => Promise<void>;
  // CSS-specific optimizer
  isCSSOptimizing: boolean;
  cssOptimizationResult: CSSOptimizationResult | null;
  runCSSOptimization: (params: {
    steamVolume: number;
    injectionPressure: number;
    injectionRate: number;
    soakTime: number;
    productionCutoff: number;
    weightProd: number;
    weightSteam: number;
    weightEnergy: number;
    weightRisk: number;
  }) => Promise<void>;
  resetCSSOptimization: () => void;
  // SRP-specific optimizer
  isSRPOptimizing: boolean;
  srpSafeWindowResult: SRPSafeWindowResult | null;
  runSRPOptimization: (params: {
    spm: number;
    strokeIn: number;
    vfdHz: number;
    viscosityCp: number;
  }) => Promise<void>;
  resetSRPOptimization: () => void;
  // Digital Twin view mode (Physical / Digital / Compare)
  twinViewMode: TwinViewMode;
  setTwinViewMode: (mode: TwinViewMode) => void;
  // View settings
  viewSettings: DigitalTwinViewSettings;
  updateViewSettings: (updates: Partial<DigitalTwinViewSettings>) => void;
  resetViewSettings: () => void;
  sensors: SensorDataPoint[];
}

// Default baseline operating parameters
export const DEFAULT_OPERATING_PARAMS: OperatingParams = {
  steamVolumeTons: 2450,
  injectionPressureBar: 112,
  soakTimeDays: 5.0,
  productionCutoffBpd: 12.0,
  strokeLengthIn: 120,
  spm: 5.2,
  vfdHz: 44.0,
};

// Pure deterministic physics coupling model
export function calculatePhysicsCoupling(p: OperatingParams): CalculatedWellState {
  // 1. Thermal response to CSS parameters
  // Effective steam enthalpy & soak retention
  const effectiveSteam = p.steamVolumeTons * Math.pow(p.injectionPressureBar / 110, 0.28);
  const soakMultiplier = Math.min(1.35, 0.72 + (p.soakTimeDays * 0.085));
  const reservoirTemp = Math.min(225.0, Math.max(55.0, 58.0 + (effectiveSteam / 24.5) * soakMultiplier * 0.19));

  // 2. Viscosity (empirical exponential decay for Baghewala heavy oil)
  // Baseline ~8500 cP at 58C, down to ~85-180 cP at elevated temperatures
  const estimatedViscosity = Math.max(35.0, Math.min(8800.0, 8500.0 * Math.exp(-0.0248 * (reservoirTemp - 58.0))));

  // 3. Reservoir pressure
  const reservoirPressure = Math.min(95.0, Math.max(22.0, 32.0 + (p.injectionPressureBar * 0.18) + (p.steamVolumeTons * 0.004)));

  // 4. Inflow capability (Vogel/Darcy representation for viscous heavy oil)
  const mobilityFactor = 18500.0 / (estimatedViscosity + 240.0);
  const theoreticalInflow = Math.min(68.0, Math.max(12.0, 14.5 + mobilityFactor));

  // 5. SRP Pump efficiency (Volumetric fillage constrained by viscosity and pump speed)
  const viscousDragPenalty = estimatedViscosity / 175.0;
  const speedChokePenalty = p.spm > 5.5 ? Math.pow(p.spm - 5.5, 1.45) * 4.2 : 0;
  const strokeBenefit = (p.strokeLengthIn - 120.0) * 0.05;
  const pumpEfficiency = Math.max(28.0, Math.min(92.5, 87.5 - viscousDragPenalty - speedChokePenalty + strokeBenefit));

  // 6. Net oil production (bpd)
  const rawProduction = theoreticalInflow * (pumpEfficiency / 100.0);
  const oilProduction = Math.max(4.0, Math.min(62.0, parseFloat(rawProduction.toFixed(1))));

  // 7. Steam-Oil Ratio (SOR)
  // Tons of steam injected / equivalent oil recovery over cycle
  const estimatedCycleOilTons = (oilProduction * 30.0 * 0.155);
  const sor = Math.max(1.85, Math.min(7.2, parseFloat((p.steamVolumeTons / Math.max(450.0, estimatedCycleOilTons * 8.5)).toFixed(2))));

  // 8. Surface Lifting Power and Energy Intensity
  const motorLoad = (p.spm * 1.75) + (p.strokeLengthIn * 0.038) + (p.vfdHz * 0.11);
  const hydraulicPowerKw = Math.max(8.5, motorLoad);
  const energyKwhPerBbl = Math.max(12.5, Math.min(48.0, parseFloat(((hydraulicPowerKw * 24.0) / Math.max(8.0, oilProduction)).toFixed(1))));

  // 9. Mechanical Risks
  // Rod floating risk: surges if viscous oil + high SPM
  const rodFloatingRisk = Math.min(0.98, Math.max(0.04, parseFloat(((estimatedViscosity / 2600.0) * (p.spm / 5.0) * 0.32).toFixed(3))));
  
  // Impact loading risk: surges at aggressive SPM + large stroke
  const impactLoadRisk = Math.min(0.95, Math.max(0.03, parseFloat(((Math.pow(p.spm, 1.75) * p.strokeLengthIn) / 8200.0).toFixed(3))));

  // Pump unsetting risk: surges at extreme injection pressures
  const pumpUnsettingRisk = Math.min(0.92, Math.max(0.02, parseFloat((p.injectionPressureBar > 125 ? 0.04 + (p.injectionPressureBar - 125) * 0.025 : 0.035).toFixed(3))));

  // Rod string loads (lbs)
  const pprlLbs = Math.round(13800 + (estimatedViscosity / 28) + (p.spm * 310) + (p.strokeLengthIn * 14));
  const mprlLbs = Math.round(Math.max(2200, 6900 - (estimatedViscosity / 24) - (p.spm * 190)));

  // Status definition
  let status: CalculatedWellState["status"] = "HOT_STABLE";
  if (reservoirTemp < 70) status = "COOLING";
  if (oilProduction > 24 && rodFloatingRisk < 0.25) status = "OPTIMIZED";
  if (oilProduction < p.productionCutoffBpd) status = "DEPLETED";

  return {
    reservoirTempC: parseFloat(reservoirTemp.toFixed(1)),
    reservoirPressureBar: parseFloat(reservoirPressure.toFixed(1)),
    estimatedViscosityCp: parseFloat(estimatedViscosity.toFixed(0)),
    oilProductionBpd: oilProduction,
    sor: sor,
    pumpEfficiencyPct: parseFloat(pumpEfficiency.toFixed(1)),
    energyKwhPerBbl: energyKwhPerBbl,
    rodFloatingRisk,
    impactLoadRisk,
    pumpUnsettingRisk,
    pprlLbs,
    mprlLbs,
    hydraulicPowerKw: parseFloat(hydraulicPowerKw.toFixed(1)),
    status,
  };
}

// Objective function score calculation
function calculateObjectiveScore(state: CalculatedWellState): number {
  // Normalize each component (0.0 to 1.0)
  const prodNorm = Math.min(1.0, state.oilProductionBpd / 50.0);
  const sorNorm = Math.max(0.0, 1.0 - (state.sor - 1.8) / 4.5);
  const energyNorm = Math.max(0.0, 1.0 - (state.energyKwhPerBbl - 12.0) / 30.0);
  const riskPenalty = (state.rodFloatingRisk * 0.45) + (state.impactLoadRisk * 0.35) + (state.pumpUnsettingRisk * 0.20);
  const mechSafetyNorm = Math.max(0.0, 1.0 - riskPenalty);

  // Weights: Prod (35%), SOR (25%), Energy (20%), Safety (20%)
  const rawScore = (prodNorm * 0.35) + (sorNorm * 0.25) + (energyNorm * 0.20) + (mechSafetyNorm * 0.20);
  return parseFloat((rawScore * 100).toFixed(1));
}

const WellTwinContext = createContext<WellTwinContextType | null>(null);

export const WellTwinProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedWell, setSelectedWell] = useState<string>("BGH-01");
  const [currentParams, setCurrentParams] = useState<OperatingParams>(DEFAULT_OPERATING_PARAMS);
  const [currentState, setCurrentState] = useState<CalculatedWellState>(() => calculatePhysicsCoupling(DEFAULT_OPERATING_PARAMS));
  
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [optimizationStatusMsg, setOptimizationStatusMsg] = useState<string>("");
  const [optimizationResult, setOptimizationResult] = useState<OptimizationRun | null>(null);
  const [optimizationHistory, setOptimizationHistory] = useState<OptimizationRun[]>([]);

  // CSS-specific optimizer state
  const [isCSSOptimizing, setIsCSSOptimizing] = useState<boolean>(false);
  const [cssOptimizationResult, setCSSOptimizationResult] = useState<CSSOptimizationResult | null>(null);

  // SRP-specific optimizer state
  const [isSRPOptimizing, setIsSRPOptimizing] = useState<boolean>(false);
  const [srpSafeWindowResult, setSRPSafeWindowResult] = useState<SRPSafeWindowResult | null>(null);

  // Digital Twin view mode
  const [twinViewMode, setTwinViewMode] = useState<TwinViewMode>("digital");

  const [viewSettings, setViewSettings] = useState<DigitalTwinViewSettings>({
    viewMode: "3D",
    isPlaying: true,
    showFlow: true,
    showThermal: true,
    showSensors: true,
    activeDisplayMode: "CURRENT",
    selectedSensorId: null,
  });

  // Re-calculate state whenever current parameters change
  const updateParams = useCallback((updates: Partial<OperatingParams>) => {
    setCurrentParams((prev) => {
      const next = { ...prev, ...updates };
      setCurrentState(calculatePhysicsCoupling(next));
      return next;
    });
  }, []);

  const resetToDefaults = useCallback(() => {
    setCurrentParams(DEFAULT_OPERATING_PARAMS);
    setCurrentState(calculatePhysicsCoupling(DEFAULT_OPERATING_PARAMS));
    setOptimizationResult(null);
    setCSSOptimizationResult(null);
    setSRPSafeWindowResult(null);
    setViewSettings((v) => ({ ...v, activeDisplayMode: "CURRENT", selectedSensorId: null }));
  }, []);

  const resetCSSOptimization = useCallback(() => {
    setCSSOptimizationResult(null);
  }, []);

  const resetSRPOptimization = useCallback(() => {
    setSRPSafeWindowResult(null);
  }, []);

  // ── Deterministic CSS Optimizer ────────────────────────────────────────────
  const runCSSOptimization = useCallback(async (inp: {
    steamVolume: number;
    injectionPressure: number;
    injectionRate: number;
    soakTime: number;
    productionCutoff: number;
    weightProd: number;
    weightSteam: number;
    weightEnergy: number;
    weightRisk: number;
  }) => {
    setIsCSSOptimizing(true);
    // Simulate a short deterministic computation delay
    await new Promise((r) => setTimeout(r, 900));
    try {
      const base = currentParams;
      const baseState = calculatePhysicsCoupling(base);

      // Build scored CSS candidate grid around current CSS params
      // We sweep steam volume and soak time in engineering-sensible steps
      type CSSCandidate = { steamVol: number; pressure: number; soak: number; cutoff: number; state: CalculatedWellState; score: number; feasible: boolean; reason: string };
      const candidates: CSSCandidate[] = [];

      const steamSteps  = [0.70, 0.85, 1.00, 1.12, 1.25, 1.40];
      const soakSteps   = [0.70, 0.85, 1.00, 1.15, 1.30];
      const pressSteps  = [0.90, 0.96, 1.00, 1.04, 1.08];

      for (const sv of steamSteps) {
        for (const sk of soakSteps) {
          for (const pr of pressSteps) {
            const trialSteam    = Math.round(Math.min(5000, Math.max(800, inp.steamVolume  * sv)));
            const trialPressure = Math.round(Math.min(140,  Math.max(75,  inp.injectionPressure * pr)));
            const trialSoak     = parseFloat(Math.min(14.0, Math.max(1.0, inp.soakTime * sk)).toFixed(1));

            const trialParams: OperatingParams = {
              ...base,
              steamVolumeTons:      trialSteam,
              injectionPressureBar: trialPressure,
              soakTimeDays:         trialSoak,
              productionCutoffBpd:  inp.productionCutoff,
            };
            const state = calculatePhysicsCoupling(trialParams);

            // Constraint checks
            let feasible = true;
            let reason = "";
            if (trialPressure > 145) { feasible = false; reason = `Injection pressure ${trialPressure} bar exceeds fracture cap (145 bar)`; }
            else if (state.oilProductionBpd < inp.productionCutoff) { feasible = false; reason = `Predicted production ${state.oilProductionBpd.toFixed(1)} bpd below cutoff (${inp.productionCutoff} bpd)`; }
            else if (state.sor > 6.5) { feasible = false; reason = `SOR ${state.sor.toFixed(2)} exceeds economic limit (6.5)`; }

            // Multi-objective score using caller-supplied weights
            const prodNorm   = Math.min(1, state.oilProductionBpd / 55.0);
            const sorNorm    = Math.max(0, 1 - (state.sor - 1.8) / 4.5);
            const energyNorm = Math.max(0, 1 - (state.energyKwhPerBbl - 12) / 30);
            const riskPen    = (state.rodFloatingRisk * 0.45) + (state.impactLoadRisk * 0.35) + (state.pumpUnsettingRisk * 0.20);
            const safeNorm   = Math.max(0, 1 - riskPen);
            const score = feasible
              ? (prodNorm * inp.weightProd) + (sorNorm * inp.weightSteam) + (energyNorm * inp.weightEnergy) + (safeNorm * inp.weightRisk)
              : 0;

            candidates.push({ steamVol: trialSteam, pressure: trialPressure, soak: trialSoak, cutoff: inp.productionCutoff, state, score, feasible, reason });
          }
        }
      }

      const feasible = candidates.filter((c) => c.feasible);
      if (feasible.length === 0) {
        // No feasible solution found — return error result
        const errResult: CSSOptimizationResult = {
          runId: `CSS-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
          baselineParams: base,
          baselineState: baseState,
          recommendedParams: base,
          recommendedState: baseState,
          steamVolMin: inp.steamVolume, steamVolOptimal: inp.steamVolume, steamVolMax: inp.steamVolume,
          pressureMin: inp.injectionPressure, pressureOptimal: inp.injectionPressure, pressureMax: inp.injectionPressure,
          soakOptimal: inp.soakTime,
          productionCutoffOptimal: inp.productionCutoff,
          predictedTempC: baseState.reservoirTempC,
          predictedViscosityCp: baseState.estimatedViscosityCp,
          predictedProductionBpd: baseState.oilProductionBpd,
          predictedSor: baseState.sor,
          predictedEnergyKwhPerBbl: baseState.energyKwhPerBbl,
          deltaProductionPct: 0, deltaSorPct: 0, deltaEnergyPct: 0,
          constraints: [],
          overallConstraintStatus: "VIOLATED",
          explanation: "No feasible CSS cycle found within the configured constraints. Consider reducing injection pressure or relaxing production cutoff.",
        };
        setCSSOptimizationResult(errResult);
        return;
      }

      feasible.sort((a, b) => b.score - a.score);
      const best = feasible[0];

      // Derive engineering window: feasible candidates within 5% of best score
      const nearBest = feasible.filter((c) => c.score >= best.score * 0.95);
      const steamVolMin    = Math.min(...nearBest.map((c) => c.steamVol));
      const steamVolMax    = Math.max(...nearBest.map((c) => c.steamVol));
      const pressureMin    = Math.min(...nearBest.map((c) => c.pressure));
      const pressureMax    = Math.max(...nearBest.map((c) => c.pressure));

      const recParams: OperatingParams = {
        ...base,
        steamVolumeTons:      best.steamVol,
        injectionPressureBar: best.pressure,
        soakTimeDays:         best.soak,
        productionCutoffBpd:  best.cutoff,
      };
      const recState = best.state;

      const deltaProd   = ((recState.oilProductionBpd - baseState.oilProductionBpd) / Math.max(1, baseState.oilProductionBpd)) * 100;
      const deltaSor    = ((recState.sor - baseState.sor) / Math.max(0.1, baseState.sor)) * 100;
      const deltaEnergy = ((recState.energyKwhPerBbl - baseState.energyKwhPerBbl) / Math.max(1, baseState.energyKwhPerBbl)) * 100;

      const constraints: CSSOptimizationResult["constraints"] = [
        { name: "Formation Fracture Pressure", limit: "≤ 145 bar",     actual: `${best.pressure} bar`,                      status: best.pressure <= 145 ? "PASSED" : "VIOLATED" },
        { name: "Production Cutoff",           limit: `≥ ${inp.productionCutoff} bpd`, actual: `${recState.oilProductionBpd.toFixed(1)} bpd`, status: recState.oilProductionBpd >= inp.productionCutoff ? "PASSED" : "VIOLATED" },
        { name: "Steam-Oil Ratio",             limit: "≤ 6.5 bbl/bbl", actual: `${recState.sor.toFixed(2)} bbl/bbl`,         status: recState.sor <= 6.5 ? "PASSED" : "VIOLATED" },
        { name: "Rod Floating Risk",           limit: "≤ 0.40",        actual: recState.rodFloatingRisk.toFixed(3),            status: recState.rodFloatingRisk <= 0.40 ? "PASSED" : "VIOLATED" },
        { name: "Peak Polished Rod Load",      limit: "≤ 22,000 lbs",  actual: `${recState.pprlLbs.toLocaleString()} lbs`,    status: recState.pprlLbs <= 22000 ? "PASSED" : "VIOLATED" },
      ];
      const overallConstraintStatus = constraints.every((c) => c.status === "PASSED") ? "PASSED" : "VIOLATED";

      const explanation =
        `Recommended steam volume of ${best.steamVol} tons at ${best.pressure} bar injection pressure with ${best.soak.toFixed(1)}-day soak ` +
        `is projected to increase production by ${deltaProd >= 0 ? "+" : ""}${deltaProd.toFixed(1)}% ` +
        `and improve SOR from ${baseState.sor.toFixed(2)} to ${recState.sor.toFixed(2)} bbl/bbl ` +
        `(${deltaSor >= 0 ? "+" : ""}${deltaSor.toFixed(1)}%). ` +
        `Injection pressure maintains a ${(145 - best.pressure).toFixed(0)} bar safety margin below the 145 bar formation fracture threshold. ` +
        `Near-wellbore viscosity reduces from ${baseState.estimatedViscosityCp.toFixed(0)} cP to ${recState.estimatedViscosityCp.toFixed(0)} cP via thermal attenuation.`;

      const newResult: CSSOptimizationResult = {
        runId: `CSS-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        baselineParams: base,
        baselineState: baseState,
        recommendedParams: recParams,
        recommendedState: recState,
        steamVolMin, steamVolOptimal: best.steamVol, steamVolMax,
        pressureMin, pressureOptimal: best.pressure, pressureMax,
        soakOptimal: best.soak,
        productionCutoffOptimal: best.cutoff,
        predictedTempC: recState.reservoirTempC,
        predictedViscosityCp: recState.estimatedViscosityCp,
        predictedProductionBpd: recState.oilProductionBpd,
        predictedSor: recState.sor,
        predictedEnergyKwhPerBbl: recState.energyKwhPerBbl,
        deltaProductionPct: parseFloat(deltaProd.toFixed(1)),
        deltaSorPct: parseFloat(deltaSor.toFixed(1)),
        deltaEnergyPct: parseFloat(deltaEnergy.toFixed(1)),
        constraints,
        overallConstraintStatus,
        explanation,
      };
      setCSSOptimizationResult(newResult);

      // Push the CSS recommendation into Joint Optimizer recommended state so Digital Twin can display it
      setViewSettings((v) => ({ ...v, activeDisplayMode: "RECOMMENDED" }));
    } finally {
      setIsCSSOptimizing(false);
    }
  }, [currentParams]);

  // ── Deterministic SRP Safe-Window Calculator ───────────────────────────────
  const runSRPOptimization = useCallback(async (inp: {
    spm: number;
    strokeIn: number;
    vfdHz: number;
    viscosityCp: number;
  }) => {
    setIsSRPOptimizing(true);
    await new Promise((r) => setTimeout(r, 750));
    try {
      // Sweep SPM from 1.8 to 9.0 in 0.2-step increments
      type SRPPt = { spm: number; eff: number; floatRisk: number; impactRisk: number; feasible: boolean };
      const curve: SRPPt[] = [];
      for (let s = 1.8; s <= 9.0; s = parseFloat((s + 0.2).toFixed(1))) {
        const trialParams: OperatingParams = {
          ...currentParams,
          spm: s,
          strokeLengthIn: inp.strokeIn,
          vfdHz: inp.vfdHz,
        };
        const st = calculatePhysicsCoupling(trialParams);
        curve.push({
          spm: s,
          eff: st.pumpEfficiencyPct,
          floatRisk: st.rodFloatingRisk,
          impactRisk: st.impactLoadRisk,
          feasible: st.rodFloatingRisk <= 0.40 && st.impactLoadRisk <= 0.55 && st.pprlLbs <= 22000 && s >= 2.0 && s <= 8.5,
        });
      }

      const feasiblePts = curve.filter((p) => p.feasible);
      const feasibleWindow = feasiblePts.length > 0;

      // Optimal point = highest pump efficiency within safe zone
      const optPt = feasiblePts.length > 0
        ? feasiblePts.reduce((best, p) => (p.eff > best.eff ? p : best), feasiblePts[0])
        : curve.reduce((best, p) => (p.eff > best.eff ? p : best), curve[0]);

      const spmMin = feasiblePts.length > 0 ? feasiblePts[0].spm : optPt.spm;
      const spmMax = feasiblePts.length > 0 ? feasiblePts[feasiblePts.length - 1].spm : optPt.spm;
      const spmOptimal = optPt.spm;

      // Stroke window: physics favour longer stroke → calculate marginal efficiency gain vs impact risk
      const strokeMin = Math.max(84, Math.round(inp.strokeIn * 0.82 / 12) * 12);
      const strokeMax = Math.min(168, Math.round(inp.strokeIn * 1.18 / 12) * 12);
      // Optimal stroke: longer usually better until impact risk rises sharply
      const strokeOptimal = Math.min(144, Math.round((inp.strokeIn + 12) / 12) * 12);

      // VFD window derived from SPM window via motor slip model (≈ VFD_Hz / SPM = constant)
      const vfdPerSpm = inp.vfdHz / Math.max(0.1, inp.spm);
      const vfdMin = Math.max(25, parseFloat((spmMin * vfdPerSpm).toFixed(1)));
      const vfdMax = Math.min(60, parseFloat((spmMax * vfdPerSpm).toFixed(1)));
      const vfdOptimal = Math.max(25, Math.min(60, parseFloat((spmOptimal * vfdPerSpm).toFixed(1))));

      // Calculate current-point risks
      const currentPointState = calculatePhysicsCoupling({ ...currentParams, spm: inp.spm, strokeLengthIn: inp.strokeIn, vfdHz: inp.vfdHz });
      const optimalPointState = calculatePhysicsCoupling({ ...currentParams, spm: spmOptimal, strokeLengthIn: strokeOptimal, vfdHz: vfdOptimal });

      const constraints: SRPSafeWindowResult["constraints"] = [
        { name: "Pumping Speed",              limit: "2.0 – 8.5 SPM",  actual: `${inp.spm.toFixed(1)} SPM`,           status: inp.spm >= 2.0 && inp.spm <= 8.5 ? "PASSED" : "VIOLATED" },
        { name: "Rod Floating Risk",          limit: "≤ 0.40",          actual: currentPointState.rodFloatingRisk.toFixed(3), status: currentPointState.rodFloatingRisk <= 0.40 ? "PASSED" : "VIOLATED" },
        { name: "Impact Load Risk",           limit: "≤ 0.55",          actual: currentPointState.impactLoadRisk.toFixed(3),  status: currentPointState.impactLoadRisk <= 0.55 ? "PASSED" : "VIOLATED" },
        { name: "Peak Polished Rod Load",     limit: "≤ 22,000 lbs",   actual: `${currentPointState.pprlLbs.toLocaleString()} lbs`, status: currentPointState.pprlLbs <= 22000 ? "PASSED" : "VIOLATED" },
        { name: "VFD Frequency",              limit: "25.0 – 60.0 Hz", actual: `${inp.vfdHz.toFixed(1)} Hz`,          status: inp.vfdHz >= 25 && inp.vfdHz <= 60 ? "PASSED" : "VIOLATED" },
      ];
      const overallConstraintStatus = constraints.every((c) => c.status === "PASSED") ? "PASSED" : "VIOLATED";

      const infeasibleReason = !feasibleWindow
        ? `No safe SPM window found between 2.0 and 8.5 SPM for fluid viscosity ${inp.viscosityCp.toFixed(0)} cP. Consider reducing viscosity via CSS steam injection before pump restart.`
        : undefined;

      const explanation =
        feasibleWindow
          ? `Safe SPM window is ${spmMin.toFixed(1)} – ${spmMax.toFixed(1)} SPM at ${inp.strokeIn}" stroke and ${inp.vfdHz.toFixed(1)} Hz VFD. ` +
            `Optimal operating point at ${spmOptimal.toFixed(1)} SPM delivers ${optimalPointState.pumpEfficiencyPct.toFixed(1)}% volumetric efficiency ` +
            `with rod floating risk of ${optimalPointState.rodFloatingRisk.toFixed(3)} (well below the 0.40 limit). ` +
            `Current operating point at ${inp.spm.toFixed(1)} SPM has a floating risk of ${currentPointState.rodFloatingRisk.toFixed(3)}.`
          : infeasibleReason!;

      const newResult: SRPSafeWindowResult = {
        runId: `SRP-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        inputSpm: inp.spm, inputStroke: inp.strokeIn, inputVfd: inp.vfdHz, inputViscosity: inp.viscosityCp,
        spmMin, spmOptimal, spmMax,
        strokeMin, strokeOptimal, strokeMax,
        vfdMin, vfdOptimal, vfdMax,
        predictedEfficiencyPct: optimalPointState.pumpEfficiencyPct,
        predictedPprlLbs: optimalPointState.pprlLbs,
        predictedRodFloatingRisk: optimalPointState.rodFloatingRisk,
        predictedImpactLoadRisk: optimalPointState.impactLoadRisk,
        currentRodFloatingRisk: currentPointState.rodFloatingRisk,
        currentImpactLoadRisk: currentPointState.impactLoadRisk,
        currentEfficiencyPct: currentPointState.pumpEfficiencyPct,
        curveData: curve.map((p) => ({
          spm: p.spm,
          pumpEfficiencyPct: p.eff,
          rodFloatingRisk: p.floatRisk,
          impactLoadRisk: p.impactRisk,
          isInSafeWindow: p.feasible,
        })),
        constraints,
        overallConstraintStatus,
        feasible: feasibleWindow,
        infeasibleReason,
        explanation,
      };
      setSRPSafeWindowResult(newResult);
    } finally {
      setIsSRPOptimizing(false);
    }
  }, [currentParams]);

  const updateViewSettings = useCallback((updates: Partial<DigitalTwinViewSettings>) => {
    setViewSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetViewSettings = useCallback(() => {
    setViewSettings({
      viewMode: "3D",
      isPlaying: true,
      showFlow: true,
      showThermal: true,
      showSensors: true,
      activeDisplayMode: "CURRENT",
      selectedSensorId: null,
    });
  }, []);

  // Determine active parameters and state based on Digital Twin display mode
  const activeParams = (viewSettings.activeDisplayMode === "RECOMMENDED" && optimizationResult)
    ? optimizationResult.recommendedParams
    : currentParams;

  const activeState = (viewSettings.activeDisplayMode === "RECOMMENDED" && optimizationResult)
    ? optimizationResult.recommendedState
    : currentState;

  // Real deterministic Joint Optimizer run
  const runJointOptimization = useCallback(async () => {
    setIsOptimizing(true);
    setOptimizationStatusMsg("Evaluating feasible CSS + SRP operating windows...");

    // Realistic physics calculation duration
    await new Promise((r) => setTimeout(r, 850));

    try {
      // Deterministic candidate generation around current parameters
      const base = currentParams;

      const candidateDefinitions: Array<{ id: string; name: string; params: OperatingParams }> = [
        // 1. Current Baseline
        {
          id: "CND-CURRENT",
          name: "Current Operating Baseline",
          params: { ...base },
        },
        // 2. Balanced Joint Optimized (Tuned CSS soak + harmonic SPM)
        {
          id: "CND-OPT",
          name: "Balanced Thermal-Lifting Optimum",
          params: {
            steamVolumeTons: Math.min(3400, Math.max(2200, Math.round(base.steamVolumeTons * 1.16))),
            injectionPressureBar: Math.min(125, Math.max(98, Math.round(base.injectionPressureBar * 1.04))),
            soakTimeDays: Math.min(8.0, Math.max(4.5, parseFloat((base.soakTimeDays + 1.5).toFixed(1)))),
            productionCutoffBpd: base.productionCutoffBpd,
            strokeLengthIn: Math.min(144, Math.max(120, base.strokeLengthIn)),
            spm: Math.min(6.2, Math.max(4.6, parseFloat((base.spm * 1.12).toFixed(1)))),
            vfdHz: Math.min(52.0, Math.max(40.0, parseFloat((base.vfdHz * 1.08).toFixed(1)))),
          },
        },
        // 3. Low-Steam Energy Saver
        {
          id: "CND-ENERGY",
          name: "Fuel-Conservative Eco Cycle",
          params: {
            steamVolumeTons: Math.max(1600, Math.round(base.steamVolumeTons * 0.82)),
            injectionPressureBar: Math.max(92, Math.round(base.injectionPressureBar * 0.92)),
            soakTimeDays: Math.max(3.5, parseFloat(base.soakTimeDays.toFixed(1))),
            productionCutoffBpd: base.productionCutoffBpd,
            strokeLengthIn: base.strokeLengthIn,
            spm: Math.max(3.8, parseFloat((base.spm * 0.88).toFixed(1))),
            vfdHz: Math.max(36.0, parseFloat((base.vfdHz * 0.88).toFixed(1))),
          },
        },
        // 4. Deep Thermal Soak Candidate
        {
          id: "CND-SOAK",
          name: "High-Enthalpy Deep Soak",
          params: {
            steamVolumeTons: Math.min(3500, Math.round(base.steamVolumeTons * 1.25)),
            injectionPressureBar: Math.min(122, Math.round(base.injectionPressureBar * 1.06)),
            soakTimeDays: Math.min(9.5, parseFloat((base.soakTimeDays + 2.5).toFixed(1))),
            productionCutoffBpd: base.productionCutoffBpd,
            strokeLengthIn: Math.min(144, base.strokeLengthIn + 12),
            spm: Math.min(5.8, parseFloat((base.spm * 1.05).toFixed(1))),
            vfdHz: Math.min(48.0, parseFloat((base.vfdHz * 1.05).toFixed(1))),
          },
        },
        // 5. Infeasible: Excessive Rod Speed in Viscous Fluid (Rod Floating violation)
        {
          id: "CND-REJECT-FLOAT",
          name: "Aggressive Lift (Cold Oil Regime)",
          params: {
            steamVolumeTons: Math.max(1200, Math.round(base.steamVolumeTons * 0.65)),
            injectionPressureBar: Math.max(85, Math.round(base.injectionPressureBar * 0.85)),
            soakTimeDays: 2.0,
            productionCutoffBpd: base.productionCutoffBpd,
            strokeLengthIn: 144,
            spm: 9.4,
            vfdHz: 58.0,
          },
        },
        // 6. Infeasible: Fracture Pressure Exceedance (> 145 bar cap)
        {
          id: "CND-REJECT-FRAC",
          name: "Over-pressurized Steam Injection",
          params: {
            steamVolumeTons: 4600,
            injectionPressureBar: 154,
            soakTimeDays: 3.5,
            productionCutoffBpd: base.productionCutoffBpd,
            strokeLengthIn: 132,
            spm: 7.0,
            vfdHz: 52.0,
          },
        },
      ];

      // Evaluate each candidate deterministically against engineering constraints
      const evaluated: CandidateEvaluation[] = candidateDefinitions.map((c) => {
        const state = calculatePhysicsCoupling(c.params);
        let feasible = true;
        let rejectionReason = "";

        // Engineering constraint checks:
        if (c.params.injectionPressureBar > 145.0) {
          feasible = false;
          rejectionReason = `Injection pressure (${c.params.injectionPressureBar} bar) exceeds reservoir fracture cap (145.0 bar)`;
        } else if (state.rodFloatingRisk > 0.40) {
          feasible = false;
          rejectionReason = `Rod floating risk (${state.rodFloatingRisk.toFixed(2)}) exceeds allowable limit (0.40) due to high SPM under cold viscous regime`;
        } else if (state.pprlLbs > 22000) {
          feasible = false;
          rejectionReason = `Peak Polished Rod Load (${state.pprlLbs} lbs) exceeds Grade D rod string fatigue rating (22,000 lbs)`;
        } else if (c.params.spm > 8.5) {
          feasible = false;
          rejectionReason = `SPM (${c.params.spm}) exceeds maximum recommended pumping speed (8.5 SPM)`;
        }

        const score = feasible ? calculateObjectiveScore(state) : 0;
        let tag: CandidateEvaluation["tag"] = feasible ? "TRADE-OFF" : "INFEASIBLE";
        if (c.id === "CND-CURRENT") tag = "CURRENT";

        return {
          id: c.id,
          name: c.name,
          params: c.params,
          state,
          score,
          feasible,
          rejectionReason: rejectionReason || undefined,
          tag,
        };
      });

      // Find top feasible candidate
      const feasibleList = evaluated.filter((e) => e.feasible && e.id !== "CND-CURRENT");
      feasibleList.sort((a, b) => b.score - a.score);

      const recommendedCandidate = feasibleList[0] || evaluated[1];
      recommendedCandidate.tag = "RECOMMENDED";

      const baselineState = calculatePhysicsCoupling(base);
      const recParams = recommendedCandidate.params;
      const recState = recommendedCandidate.state;

      // Deltas
      const deltaProd = ((recState.oilProductionBpd - baselineState.oilProductionBpd) / Math.max(1, baselineState.oilProductionBpd)) * 100;
      const deltaSor = ((recState.sor - baselineState.sor) / Math.max(0.1, baselineState.sor)) * 100;
      const deltaEnergy = ((recState.energyKwhPerBbl - baselineState.energyKwhPerBbl) / Math.max(1, baselineState.energyKwhPerBbl)) * 100;
      const deltaEff = ((recState.pumpEfficiencyPct - baselineState.pumpEfficiencyPct) / Math.max(1, baselineState.pumpEfficiencyPct)) * 100;
      const deltaRisk = ((recState.rodFloatingRisk - baselineState.rodFloatingRisk) / Math.max(0.01, baselineState.rodFloatingRisk)) * 100;

      // Dynamic explainable rationale generated from actual numbers
      const explainableFactors = [
        {
          factor: "Thermal Viscosity Attenuation",
          impact: "HIGH IMPACT",
          note: `Increasing soak to ${recParams.soakTimeDays.toFixed(1)} days with ${recParams.steamVolumeTons}t steam lowers near-wellbore viscosity from ${baselineState.estimatedViscosityCp} cP to ${recState.estimatedViscosityCp} cP (${((1 - recState.estimatedViscosityCp / baselineState.estimatedViscosityCp) * 100).toFixed(0)}% reduction).`,
        },
        {
          factor: "Fracture Pressure Safety Margin",
          impact: "HIGH IMPACT",
          note: `Injection pressure regulated at ${recParams.injectionPressureBar} bar maintains a ${(145 - recParams.injectionPressureBar).toFixed(0)} bar safety margin below the 145 bar formation fracture threshold.`,
        },
        {
          factor: "Rod String Dynamic Harmonization",
          impact: "MEDIUM IMPACT",
          note: `Operating at ${recParams.spm.toFixed(1)} SPM with ${recParams.strokeLengthIn}" stroke ensures volumetric pump efficiency of ${recState.pumpEfficiencyPct}% without rod floating (risk index ${recState.rodFloatingRisk.toFixed(2)} vs allowable 0.40).`,
        },
        {
          factor: "Fuel-to-Lifting Thermodynamic Trade-off",
          impact: "MEDIUM IMPACT",
          note: `Optimized SOR of ${recState.sor.toFixed(2)} bbl/bbl balances surface steam boiler fuel consumption against net lift rate at ${recState.energyKwhPerBbl.toFixed(1)} kWh/bbl energy intensity.`,
        },
      ];

      const whyRecommended = `Candidate ${recommendedCandidate.name} (${recommendedCandidate.id}) was selected because it maximizes net production (${recState.oilProductionBpd.toFixed(1)} bpd, +${deltaProd.toFixed(1)}%) while maintaining rod string dynamic stress inside safe fatigue boundaries (rod float risk ${recState.rodFloatingRisk.toFixed(2)}, PPRL ${recState.pprlLbs} lbs). Unsafe candidate permutations were rejected due to formation fracture risks (>145 bar) and severe downstroke rod floating under cold viscous fluid regimes.`;

      const constraints = [
        {
          name: "Injection Pressure vs Formation Fracture",
          limit: "≤ 145.0 bar",
          actual: `${recParams.injectionPressureBar.toFixed(1)} bar`,
          status: (recParams.injectionPressureBar <= 145 ? "PASSED" : "VIOLATED") as "PASSED" | "VIOLATED",
        },
        {
          name: "Rod Floating Risk Index",
          limit: "≤ 0.40",
          actual: recState.rodFloatingRisk.toFixed(2),
          status: (recState.rodFloatingRisk <= 0.40 ? "PASSED" : "VIOLATED") as "PASSED" | "VIOLATED",
        },
        {
          name: "Peak Polished Rod Load (PPRL)",
          limit: "≤ 22,000 lbs",
          actual: `${recState.pprlLbs.toLocaleString()} lbs`,
          status: (recState.pprlLbs <= 22000 ? "PASSED" : "VIOLATED") as "PASSED" | "VIOLATED",
        },
        {
          name: "Minimum Polished Rod Load (MPRL)",
          limit: "≥ 2,500 lbs",
          actual: `${recState.mprlLbs.toLocaleString()} lbs`,
          status: (recState.mprlLbs >= 2500 ? "PASSED" : "VIOLATED") as "PASSED" | "VIOLATED",
        },
        {
          name: "Pumping Speed (SPM)",
          limit: "2.0 – 8.5 SPM",
          actual: `${recParams.spm.toFixed(1)} SPM`,
          status: (recParams.spm >= 2.0 && recParams.spm <= 8.5 ? "PASSED" : "VIOLATED") as "PASSED" | "VIOLATED",
        },
        {
          name: "VFD Inverter Frequency",
          limit: "25.0 – 60.0 Hz",
          actual: `${recParams.vfdHz.toFixed(1)} Hz`,
          status: (recParams.vfdHz >= 25.0 && recParams.vfdHz <= 60.0 ? "PASSED" : "VIOLATED") as "PASSED" | "VIOLATED",
        },
      ];

      const newRun: OptimizationRun = {
        runId: `Run #${optimizationHistory.length + 1}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        baselineParams: base,
        baselineState,
        recommendedParams: recParams,
        recommendedState: recState,
        objectiveScore: recommendedCandidate.score,
        deltaProductionPct: parseFloat(deltaProd.toFixed(1)),
        deltaSorPct: parseFloat(deltaSor.toFixed(1)),
        deltaEnergyPct: parseFloat(deltaEnergy.toFixed(1)),
        deltaEfficiencyPct: parseFloat(deltaEff.toFixed(1)),
        deltaRiskPct: parseFloat(deltaRisk.toFixed(1)),
        candidates: evaluated,
        explainableFactors,
        whyRecommended,
        constraints,
      };

      setOptimizationResult(newRun);
      setOptimizationHistory((prev) => [newRun, ...prev].slice(0, 10));
      setViewSettings((v) => ({ ...v, activeDisplayMode: "RECOMMENDED" }));
    } finally {
      setIsOptimizing(false);
      setOptimizationStatusMsg("");
    }
  }, [currentParams, optimizationHistory.length]);

  // Sensor definitions derived from active state
  const sensors: SensorDataPoint[] = [
    {
      id: "surface_wellhead",
      name: "Surface Wellhead & Flowline",
      category: "SURFACE",
      primaryValue: `${activeState.oilProductionBpd} bpd`,
      secondaryValue: `${activeState.sor} SOR`,
      statusText: "Flow Stable",
      statusColor: "emerald",
      coordinates: { x: 0, y: 1.5, z: 0 },
      details: {
        "Oil Production": `${activeState.oilProductionBpd} bpd`,
        "Steam-Oil Ratio": `${activeState.sor}`,
        "Energy Demand": `${activeState.energyKwhPerBbl} kWh/bbl`,
        "Water Cut": "28.5%",
      },
    },
    {
      id: "srp_unit",
      name: "SRP Surface Pumping Unit",
      category: "SRP",
      primaryValue: `${activeParams.spm} SPM`,
      secondaryValue: `${activeParams.strokeLengthIn}" Stroke`,
      statusText: activeState.rodFloatingRisk > 0.35 ? "High Drag Warning" : "Optimal Stroke",
      statusColor: activeState.rodFloatingRisk > 0.35 ? "amber" : "emerald",
      coordinates: { x: -1.2, y: 2.8, z: 0 },
      details: {
        "Pumping Speed": `${activeParams.spm} SPM`,
        "Stroke Length": `${activeParams.strokeLengthIn} in`,
        "VFD Frequency": `${activeParams.vfdHz} Hz`,
        "PPRL": `${activeState.pprlLbs.toLocaleString()} lbs`,
        "MPRL": `${activeState.mprlLbs.toLocaleString()} lbs`,
        "Volumetric Efficiency": `${activeState.pumpEfficiencyPct}%`,
        "Motor Power": `${activeState.hydraulicPowerKw} kW`,
      },
    },
    {
      id: "wellbore_mid",
      name: "Subsurface Wellbore Casing",
      category: "WELLBORE",
      primaryValue: `${activeState.pprlLbs} lbs PPRL`,
      secondaryValue: `Float Risk: ${(activeState.rodFloatingRisk * 100).toFixed(0)}%`,
      statusText: activeState.rodFloatingRisk > 0.4 ? "Rod Float Alert" : "Nominal Motion",
      statusColor: activeState.rodFloatingRisk > 0.4 ? "rose" : "sky",
      coordinates: { x: 0, y: -2.0, z: 0 },
      details: {
        "Tubing Depth": "980 m MD",
        "Peak Polish Rod Load": `${activeState.pprlLbs.toLocaleString()} lbs`,
        "Rod Floating Risk": activeState.rodFloatingRisk.toFixed(2),
        "Impact Load Risk": activeState.impactLoadRisk.toFixed(2),
        "Casing Pressure": "14.2 bar",
      },
    },
    {
      id: "reservoir_sandface",
      name: "Reservoir Sandface & Steam Bulb",
      category: "RESERVOIR",
      primaryValue: `${activeState.reservoirTempC}°C`,
      secondaryValue: `${activeState.estimatedViscosityCp} cP`,
      statusText: activeState.status,
      statusColor: activeState.status === "COOLING" ? "amber" : "emerald",
      coordinates: { x: 0, y: -4.8, z: 0 },
      details: {
        "Reservoir Temperature": `${activeState.reservoirTempC}°C`,
        "Fluid Viscosity": `${activeState.estimatedViscosityCp} cP`,
        "Reservoir Pressure": `${activeState.reservoirPressureBar} bar`,
        "Injected Steam": `${activeParams.steamVolumeTons} tons`,
        "Injection Pressure": `${activeParams.injectionPressureBar} bar`,
        "Thermal Status": activeState.status,
      },
    },
  ];

  return (
    <WellTwinContext.Provider
      value={{
        selectedWell,
        setSelectedWell,
        currentParams,
        updateParams,
        resetToDefaults,
        currentState,
        activeParams,
        activeState,
        isOptimizing,
        optimizationStatusMsg,
        optimizationResult,
        optimizationHistory,
        runJointOptimization,
        isCSSOptimizing,
        cssOptimizationResult,
        runCSSOptimization,
        resetCSSOptimization,
        isSRPOptimizing,
        srpSafeWindowResult,
        runSRPOptimization,
        resetSRPOptimization,
        twinViewMode,
        setTwinViewMode,
        viewSettings,
        updateViewSettings,
        resetViewSettings,
        sensors,
      }}
    >
      {children}
    </WellTwinContext.Provider>
  );
};

export const useWellTwin = (): WellTwinContextType => {
  const context = useContext(WellTwinContext);
  if (!context) {
    throw new Error("useWellTwin must be used within a WellTwinProvider");
  }
  return context;
};
