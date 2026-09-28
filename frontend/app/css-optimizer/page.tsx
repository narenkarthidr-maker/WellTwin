"use client";

import React, { useState } from "react";
import { DataModeBadge } from "@/components/common/DataModeBadge";
import { useWellTwin } from "@/context/WellTwinContext";
import {
  Flame,
  Sliders,
  PlayCircle,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Info,
} from "lucide-react";

// ─── helpers ──────────────────────────────────────────────────────────────────
function DeltaBadge({ value, unit = "%", lowerIsBetter = false }: { value: number; unit?: string; lowerIsBetter?: boolean }) {
  const improved = lowerIsBetter ? value < 0 : value > 0;
  const neutral = Math.abs(value) < 0.05;
  if (neutral) return <span className="inline-flex items-center gap-0.5 text-slate-400 font-mono text-xs"><Minus className="w-3 h-3" /> 0.0{unit}</span>;
  return (
    <span className={`inline-flex items-center gap-0.5 font-mono text-xs font-bold ${improved ? "text-emerald-400" : "text-rose-400"}`}>
      {improved ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {value > 0 ? "+" : ""}{value.toFixed(1)}{unit}
    </span>
  );
}

function ConstraintRow({ name, limit, actual, status }: { name: string; limit: string; actual: string; status: "PASSED" | "VIOLATED" }) {
  return (
    <div className={`flex items-center justify-between px-3 py-1.5 rounded text-xs font-mono border ${status === "PASSED" ? "bg-emerald-950/30 border-emerald-900/40" : "bg-rose-950/30 border-rose-900/40"}`}>
      <span className="text-slate-300 truncate mr-2">{name}</span>
      <span className="text-slate-400 mr-3 shrink-0">{limit}</span>
      <span className={`font-bold shrink-0 mr-2 ${status === "PASSED" ? "text-white" : "text-rose-400"}`}>{actual}</span>
      {status === "PASSED"
        ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        : <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
    </div>
  );
}

// ─── page ──────────────────────────────────────────────────────────────────────
export default function CSSOptimizerPage() {
  const {
    currentParams, currentState,
    isCSSOptimizing, cssOptimizationResult,
    runCSSOptimization, resetCSSOptimization,
  } = useWellTwin();

  // Local slider controls — initialised from shared state so they reflect current well
  const [steamVolume,       setSteamVolume]       = useState<number>(currentParams.steamVolumeTons);
  const [injectionPressure, setInjectionPressure] = useState<number>(currentParams.injectionPressureBar);
  const [injectionRate,     setInjectionRate]     = useState<number>(120);
  const [soakTime,          setSoakTime]          = useState<number>(currentParams.soakTimeDays);
  const [productionCutoff,  setProductionCutoff]  = useState<number>(currentParams.productionCutoffBpd);

  // Objective-function weights
  const [weightProd,   setWeightProd]   = useState<number>(0.35);
  const [weightSteam,  setWeightSteam]  = useState<number>(0.25);
  const [weightEnergy, setWeightEnergy] = useState<number>(0.20);
  const [weightRisk,   setWeightRisk]   = useState<number>(0.20);

  const [btnLabel, setBtnLabel] = useState<"idle" | "done">("idle");

  const handleRunOptimization = async () => {
    setBtnLabel("idle");
    await runCSSOptimization({
      steamVolume,
      injectionPressure,
      injectionRate,
      soakTime,
      productionCutoff,
      weightProd,
      weightSteam,
      weightEnergy,
      weightRisk,
    });
    setBtnLabel("done");
    setTimeout(() => setBtnLabel("idle"), 4000);
  };

  const handleReset = () => {
    resetCSSOptimization();
    setSteamVolume(currentParams.steamVolumeTons);
    setInjectionPressure(currentParams.injectionPressureBar);
    setSoakTime(currentParams.soakTimeDays);
    setProductionCutoff(currentParams.productionCutoffBpd);
    setWeightProd(0.35); setWeightSteam(0.25); setWeightEnergy(0.20); setWeightRisk(0.20);
    setBtnLabel("idle");
  };

  const res = cssOptimizationResult;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-[var(--border-primary)]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-2">
              <Flame className="w-6 h-6 text-orange-500" />
              CSS Cycle Optimization
            </h1>
            <DataModeBadge />
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Deterministic multi-objective sweep — balances thermal response, oil production, steam use and engineering constraints.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {res && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-[var(--bg-card)] border border-[var(--border-primary)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          )}
          <button
            id="css-optimize-btn"
            onClick={handleRunOptimization}
            disabled={isCSSOptimizing}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-semibold shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PlayCircle className="w-4 h-4" />
            <span>
              {isCSSOptimizing
                ? "Evaluating CSS Cycle…"
                : btnLabel === "done"
                ? "✓ CSS Cycle Optimized"
                : "Optimize CSS Cycle"}
            </span>
          </button>
        </div>
      </div>

      {/* ── Grid: Inputs & Current Well State ──────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Input Panel */}
        <div className="lg:col-span-7 p-4 rounded-lg bg-[var(--bg-card)] border border-[var(--border-primary)] space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-secondary)] pb-2">
            <span className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-orange-400" />
              CSS OPERATIONAL PARAMETER CONTROLS
            </span>
            <span className="text-[10px] font-mono text-[var(--text-muted)]">Jodhpur Heavy Oil Calibration</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Steam Volume */}
            <div>
              <div className="flex justify-between text-[var(--text-secondary)] mb-1">
                <span>Steam Volume:</span>
                <span className="font-mono font-bold text-[var(--text-primary)]">{steamVolume} tons</span>
              </div>
              <input type="range" min="1000" max="5000" step="50" value={steamVolume}
                onChange={(e) => setSteamVolume(Number(e.target.value))}
                className="w-full accent-orange-500 cursor-pointer" />
              <div className="text-[10px] text-[var(--text-muted)] flex justify-between mt-0.5">
                <span>1,000 tons</span><span>5,000 tons</span>
              </div>
            </div>

            {/* Injection Pressure */}
            <div>
              <div className="flex justify-between text-[var(--text-secondary)] mb-1">
                <span>Injection Pressure:</span>
                <span className="font-mono font-bold text-[var(--text-primary)]">{injectionPressure} bar</span>
              </div>
              <input type="range" min="80" max="140" step="1" value={injectionPressure}
                onChange={(e) => setInjectionPressure(Number(e.target.value))}
                className="w-full accent-orange-500 cursor-pointer" />
              <div className="text-[10px] text-[var(--text-muted)] flex justify-between mt-0.5">
                <span>80 bar</span><span className="text-rose-400 font-bold">145 bar Max</span>
              </div>
            </div>

            {/* Injection Rate */}
            <div>
              <div className="flex justify-between text-[var(--text-secondary)] mb-1">
                <span>Injection Rate:</span>
                <span className="font-mono font-bold text-[var(--text-primary)]">{injectionRate} t/d</span>
              </div>
              <input type="range" min="60" max="250" step="5" value={injectionRate}
                onChange={(e) => setInjectionRate(Number(e.target.value))}
                className="w-full accent-orange-500 cursor-pointer" />
              <div className="text-[10px] text-[var(--text-muted)] flex justify-between mt-0.5">
                <span>60 t/d</span><span>250 t/d</span>
              </div>
            </div>

            {/* Soak Time */}
            <div>
              <div className="flex justify-between text-[var(--text-secondary)] mb-1">
                <span>Soak Time:</span>
                <span className="font-mono font-bold text-[var(--text-primary)]">{soakTime.toFixed(1)} days</span>
              </div>
              <input type="range" min="1.0" max="15.0" step="0.5" value={soakTime}
                onChange={(e) => setSoakTime(Number(e.target.value))}
                className="w-full accent-orange-500 cursor-pointer" />
              <div className="text-[10px] text-[var(--text-muted)] flex justify-between mt-0.5">
                <span>1 day</span><span>15 days</span>
              </div>
            </div>

            {/* Production Cutoff */}
            <div className="md:col-span-2">
              <div className="flex justify-between text-[var(--text-secondary)] mb-1">
                <span>Production Cutoff:</span>
                <span className="font-mono font-bold text-[var(--text-primary)]">{productionCutoff.toFixed(1)} bpd</span>
              </div>
              <input type="range" min="5" max="30" step="0.5" value={productionCutoff}
                onChange={(e) => setProductionCutoff(Number(e.target.value))}
                className="w-full accent-orange-500 cursor-pointer" />
              <div className="text-[10px] text-[var(--text-muted)] flex justify-between mt-0.5">
                <span>5 bpd</span><span>30 bpd</span>
              </div>
            </div>
          </div>

          {/* Objective Function Priority Weights */}
          <div className="pt-3 border-t border-[var(--border-secondary)] space-y-3">
            <div className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
              Multi-Objective Weights (must sum to 1.00)
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              {[
                { label: "Production Priority", val: weightProd,   set: setWeightProd,   color: "text-sky-400" },
                { label: "Steam Efficiency",    val: weightSteam,  set: setWeightSteam,  color: "text-orange-400" },
                { label: "Energy Footprint",    val: weightEnergy, set: setWeightEnergy, color: "text-amber-400" },
                { label: "Reliability / Safety",val: weightRisk,   set: setWeightRisk,   color: "text-emerald-400" },
              ].map(({ label, val, set, color }) => (
                <div key={label} className="p-2 rounded bg-[var(--bg-deep)] border border-[var(--border-secondary)]">
                  <div className="text-[10px] text-[var(--text-muted)]">{label}</div>
                  <div className={`font-mono font-bold text-sm mt-0.5 ${color}`}>{(val * 100).toFixed(0)}%</div>
                  <input type="range" min="0.05" max="0.65" step="0.05" value={val}
                    onChange={(e) => set(Number(e.target.value))}
                    className={`w-full mt-1 cursor-pointer accent-orange-500`} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Current Well State Baseline */}
        <div className="lg:col-span-5 p-4 rounded-lg bg-[var(--bg-card)] border border-[var(--border-primary)] flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[var(--border-secondary)] pb-2 mb-3">
            <span className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
              CURRENT WELL STATE (BASELINE)
            </span>
            <span className="text-[10px] font-mono text-sky-400">Well: BGH-01</span>
          </div>

          <div className="space-y-2.5 text-xs font-mono">
            {[
              { label: "Reservoir Temp:",    val: `${currentState.reservoirTempC.toFixed(1)} °C`,        color: "text-orange-400" },
              { label: "Bottomhole Press:",  val: `${currentState.reservoirPressureBar.toFixed(1)} bar`, color: "text-[var(--text-primary)]" },
              { label: "Est. Viscosity:",    val: `${currentState.estimatedViscosityCp.toFixed(0)} cP`,  color: "text-amber-300" },
              { label: "Oil Production:",    val: `${currentState.oilProductionBpd.toFixed(1)} bpd`,     color: "text-[var(--text-primary)]" },
              { label: "Steam-Oil Ratio:",   val: `${currentState.sor.toFixed(2)} bbl/bbl`,              color: "text-purple-400" },
              { label: "Steam Volume:",      val: `${currentParams.steamVolumeTons} tons`,               color: "text-orange-300" },
              { label: "Injection Pressure:",val: `${currentParams.injectionPressureBar} bar`,           color: "text-[var(--text-primary)]" },
              { label: "Soak Time:",         val: `${currentParams.soakTimeDays.toFixed(1)} days`,       color: "text-[var(--text-primary)]" },
            ].map(({ label, val, color }) => (
              <div key={label} className="flex justify-between p-2 rounded bg-[var(--bg-deep)] border border-[var(--border-secondary)]">
                <span className="text-[var(--text-muted)]">{label}</span>
                <span className={`font-bold ${color}`}>{val}</span>
              </div>
            ))}
          </div>

          <div className="mt-3 p-3 rounded bg-[var(--bg-deep)] border border-orange-900/50 text-[11px] text-orange-300">
            <strong>Thermal Trigger Alert: </strong>
            Temperature decline at {currentState.reservoirTempC.toFixed(1)}°C is increasing
            viscosity to {currentState.estimatedViscosityCp.toFixed(0)} cP. CSS optimisation
            recommended before next SRP cycle.
          </div>
        </div>
      </div>

      {/* ── Loading spinner ─────────────────────────────────────────────────── */}
      {isCSSOptimizing && (
        <div className="p-6 rounded-lg bg-[var(--bg-card)] border border-orange-900/50 flex items-center justify-center gap-3">
          <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-orange-300 font-mono">Evaluating CSS cycle — sweeping {6 * 5 * 5} candidate configurations…</span>
        </div>
      )}

      {/* ── Infeasible error state ──────────────────────────────────────────── */}
      {res && res.overallConstraintStatus === "VIOLATED" && res.deltaProductionPct === 0 && (
        <div className="p-5 rounded-lg bg-rose-950/30 border border-rose-900/50 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-bold text-rose-300">No Feasible CSS Cycle Found</div>
            <div className="text-xs text-rose-200/80 mt-1">{res.explanation}</div>
          </div>
        </div>
      )}

      {/* ── Main Result Panel ──────────────────────────────────────────────── */}
      {res && !(res.overallConstraintStatus === "VIOLATED" && res.deltaProductionPct === 0) && (
        <div className="space-y-4">
          {/* Current → Recommended Comparison */}
          <div className="p-5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-primary)] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-secondary)] pb-3">
              <div>
                <div className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                  CURRENT → RECOMMENDED COMPARISON
                  <span className={`text-[10px] px-2 py-0.5 rounded font-mono border ${res.overallConstraintStatus === "PASSED" ? "bg-emerald-950 text-emerald-400 border-emerald-800" : "bg-rose-950 text-rose-400 border-rose-800"}`}>
                    {res.overallConstraintStatus}
                  </span>
                </div>
                <div className="text-xs text-[var(--text-muted)] mt-0.5">
                  Run ID: {res.runId} — {res.timestamp}
                </div>
              </div>
            </div>

            {/* Side-by-side table */}
            <div className="grid grid-cols-3 gap-1 text-xs font-mono">
              <div className="text-[10px] font-bold uppercase text-[var(--text-muted)] pb-1">Parameter</div>
              <div className="text-[10px] font-bold uppercase text-slate-400 text-center pb-1">Current</div>
              <div className="text-[10px] font-bold uppercase text-orange-400 text-center pb-1">Recommended</div>

              {[
                { name: "Steam Volume", cur: `${res.baselineParams.steamVolumeTons} tons`,          rec: `${res.recommendedParams.steamVolumeTons} tons` },
                { name: "Inj. Pressure",cur: `${res.baselineParams.injectionPressureBar} bar`,       rec: `${res.recommendedParams.injectionPressureBar} bar` },
                { name: "Soak Time",    cur: `${res.baselineParams.soakTimeDays.toFixed(1)} days`,   rec: `${res.recommendedParams.soakTimeDays.toFixed(1)} days` },
                { name: "Prod. Cutoff", cur: `${res.baselineParams.productionCutoffBpd.toFixed(1)} bpd`, rec: `${res.recommendedParams.productionCutoffBpd.toFixed(1)} bpd` },
                { name: "Res. Temp",    cur: `${res.baselineState.reservoirTempC.toFixed(1)} °C`,   rec: `${res.recommendedState.reservoirTempC.toFixed(1)} °C` },
                { name: "Viscosity",    cur: `${res.baselineState.estimatedViscosityCp.toFixed(0)} cP`, rec: `${res.recommendedState.estimatedViscosityCp.toFixed(0)} cP` },
                { name: "Oil Prod.",    cur: `${res.baselineState.oilProductionBpd.toFixed(1)} bpd`,rec: `${res.recommendedState.oilProductionBpd.toFixed(1)} bpd` },
                { name: "SOR",          cur: `${res.baselineState.sor.toFixed(2)} bbl/bbl`,         rec: `${res.recommendedState.sor.toFixed(2)} bbl/bbl` },
              ].map(({ name, cur, rec }) => (
                <React.Fragment key={name}>
                  <div className="py-1.5 px-2 rounded-l bg-[var(--bg-deep)] border-y border-l border-[var(--border-secondary)] text-[var(--text-muted)]">{name}</div>
                  <div className="py-1.5 px-2 bg-[var(--bg-deep)] border-y border-[var(--border-secondary)] text-center text-[var(--text-secondary)]">{cur}</div>
                  <div className="py-1.5 px-2 rounded-r bg-[var(--bg-deep)] border-y border-r border-orange-900/40 text-center text-orange-300 font-bold">{rec}</div>
                </React.Fragment>
              ))}
            </div>

            {/* Delta KPI cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded bg-[var(--bg-deep)] border border-[var(--border-secondary)] space-y-1">
                <div className="text-[10px] text-[var(--text-muted)] uppercase">Production Δ</div>
                <DeltaBadge value={res.deltaProductionPct} />
                <div className="text-[11px] text-[var(--text-muted)]">{res.baselineState.oilProductionBpd.toFixed(1)} → {res.recommendedState.oilProductionBpd.toFixed(1)} bpd</div>
              </div>
              <div className="p-3 rounded bg-[var(--bg-deep)] border border-[var(--border-secondary)] space-y-1">
                <div className="text-[10px] text-[var(--text-muted)] uppercase">SOR Δ</div>
                <DeltaBadge value={res.deltaSorPct} lowerIsBetter />
                <div className="text-[11px] text-[var(--text-muted)]">{res.baselineState.sor.toFixed(2)} → {res.recommendedState.sor.toFixed(2)} bbl/bbl</div>
              </div>
              <div className="p-3 rounded bg-[var(--bg-deep)] border border-[var(--border-secondary)] space-y-1">
                <div className="text-[10px] text-[var(--text-muted)] uppercase">Energy Δ</div>
                <DeltaBadge value={res.deltaEnergyPct} lowerIsBetter />
                <div className="text-[11px] text-[var(--text-muted)]">{res.baselineState.energyKwhPerBbl.toFixed(1)} → {res.recommendedState.energyKwhPerBbl.toFixed(1)} kWh/bbl</div>
              </div>
            </div>
          </div>

          {/* Recommended Operating Region */}
          <div className="p-5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-primary)] space-y-4">
            <div className="text-sm font-bold text-[var(--text-primary)] border-b border-[var(--border-secondary)] pb-3">
              OPTIMISED CSS CYCLE RECOMMENDATION
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3.5 rounded bg-[var(--bg-deep)] border border-orange-900/50">
                <div className="text-[10px] uppercase font-bold text-orange-400">Recommended Steam Volume</div>
                <div className="mt-1 text-lg font-bold font-mono text-[var(--text-primary)]">
                  {res.steamVolMin} – {res.steamVolMax} tons
                </div>
                <div className="text-[11px] text-[var(--text-muted)] mt-1 font-mono">
                  Optimal: <strong className="text-[var(--text-primary)]">{res.steamVolOptimal} tons</strong>
                </div>
              </div>

              <div className="p-3.5 rounded bg-[var(--bg-deep)] border border-orange-900/50">
                <div className="text-[10px] uppercase font-bold text-orange-400">Injection Pressure Envelope</div>
                <div className="mt-1 text-lg font-bold font-mono text-[var(--text-primary)]">
                  {res.pressureMin} – {res.pressureMax} bar
                </div>
                <div className="text-[11px] text-emerald-400 mt-1 font-mono">
                  Safety margin: {(145 - res.pressureOptimal).toFixed(0)} bar below fracture (145 bar)
                </div>
              </div>

              <div className="p-3.5 rounded bg-[var(--bg-deep)] border border-orange-900/50">
                <div className="text-[10px] uppercase font-bold text-orange-400">Predicted CSS Performance</div>
                <div className="mt-1 text-lg font-bold font-mono text-emerald-400">
                  SOR: {res.predictedSor.toFixed(2)} • {res.predictedProductionBpd.toFixed(1)} bpd
                </div>
                <div className="text-[11px] text-[var(--text-muted)] mt-1 font-mono">
                  Soak: <strong className="text-[var(--text-primary)]">{res.soakOptimal.toFixed(1)} days</strong>
                  {" "} • Energy: <strong className="text-amber-300">{res.predictedEnergyKwhPerBbl.toFixed(1)} kWh/bbl</strong>
                </div>
              </div>
            </div>

            {/* Constraint table */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wide flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Engineering Constraint Validation
              </div>
              {res.constraints.map((c) => (
                <ConstraintRow key={c.name} {...c} />
              ))}
            </div>

            {/* Rationale */}
            <div className="p-3.5 rounded bg-[var(--bg-deep)] border border-[var(--border-secondary)] text-xs text-[var(--text-secondary)] leading-relaxed">
              <span className="font-bold text-sky-400">Engineering Rationale: </span>
              {res.explanation}
            </div>
          </div>
        </div>
      )}

      {/* ── Empty state before first run ────────────────────────────────────── */}
      {!res && !isCSSOptimizing && (
        <div className="p-8 rounded-lg bg-[var(--bg-card)] border border-dashed border-[var(--border-primary)] flex flex-col items-center justify-center gap-3 text-center">
          <Info className="w-8 h-8 text-orange-400/60" />
          <div className="text-sm text-[var(--text-muted)]">
            Adjust the parameters above and click <strong className="text-orange-400">Optimize CSS Cycle</strong> to run the deterministic sweep.
          </div>
          <div className="text-xs text-[var(--text-muted)]">
            The optimizer evaluates 150 candidate configurations across steam, pressure and soak-time axes.
          </div>
        </div>
      )}
    </div>
  );
}
