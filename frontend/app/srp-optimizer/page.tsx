"use client";

import React, { useState } from "react";
import { DataModeBadge } from "@/components/common/DataModeBadge";
import { useWellTwin } from "@/context/WellTwinContext";
import {
  Activity,
  PlayCircle,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Info,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
} from "lucide-react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ReferenceArea,
} from "recharts";

// ─── helpers ──────────────────────────────────────────────────────────────────
function RiskBar({ label, value, limit, color }: { label: string; value: number; limit: number; color: string }) {
  const pct = Math.min(100, (value / limit) * 100);
  const safe = value <= limit;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] font-mono">
        <span className="text-[var(--text-muted)]">{label}</span>
        <span className={safe ? "text-emerald-400" : "text-rose-400"}>
          {value.toFixed(3)} / {limit.toFixed(2)} {safe ? "✓" : "✗"}
        </span>
      </div>
      <div className="h-2 rounded bg-[var(--bg-deep)] overflow-hidden">
        <div
          className={`h-full rounded transition-all duration-500 ${safe ? "bg-emerald-500" : "bg-rose-500"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function ConstraintRow({ name, limit, actual, status }: { name: string; limit: string; actual: string; status: "PASSED" | "VIOLATED" }) {
  return (
    <div className={`flex items-center justify-between px-3 py-1.5 rounded text-xs font-mono border ${status === "PASSED" ? "bg-emerald-950/30 border-emerald-900/40" : "bg-rose-950/30 border-rose-900/40"}`}>
      <span className="text-[var(--text-secondary)] truncate mr-2">{name}</span>
      <span className="text-[var(--text-muted)] mr-3 shrink-0">{limit}</span>
      <span className={`font-bold shrink-0 mr-2 ${status === "PASSED" ? "text-[var(--text-primary)]" : "text-rose-400"}`}>{actual}</span>
      {status === "PASSED"
        ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        : <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
    </div>
  );
}

// Custom Recharts tooltip
const SRPTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0c1426]/95 border border-[#2a3e6b] rounded-lg p-3 text-xs font-mono shadow-xl">
      <div className="font-bold text-sky-300 mb-1">{Number(label).toFixed(1)} SPM</div>
      {payload.map((p: any) => (
        <div key={p.name} className="flex justify-between gap-4">
          <span style={{ color: p.color }}>{p.name}:</span>
          <span className="text-white font-bold">{typeof p.value === "number" ? p.value.toFixed(1) : p.value}</span>
        </div>
      ))}
    </div>
  );
};

// ─── page ─────────────────────────────────────────────────────────────────────
export default function SRPOptimizerPage() {
  const {
    currentParams, currentState,
    isSRPOptimizing, srpSafeWindowResult,
    runSRPOptimization, resetSRPOptimization,
  } = useWellTwin();

  const [spm,           setSpm]          = useState<number>(currentParams.spm);
  const [strokeIn,      setStrokeIn]     = useState<number>(currentParams.strokeLengthIn);
  const [vfdHz,         setVfdHz]        = useState<number>(currentParams.vfdHz);
  const [viscosityCp,   setViscosityCp]  = useState<number>(Math.round(currentState.estimatedViscosityCp));

  const [btnLabel, setBtnLabel] = useState<"idle" | "done">("idle");

  const handleRun = async () => {
    setBtnLabel("idle");
    await runSRPOptimization({ spm, strokeIn, vfdHz, viscosityCp });
    setBtnLabel("done");
    setTimeout(() => setBtnLabel("idle"), 4000);
  };

  const handleReset = () => {
    resetSRPOptimization();
    setSpm(currentParams.spm);
    setStrokeIn(currentParams.strokeLengthIn);
    setVfdHz(currentParams.vfdHz);
    setViscosityCp(Math.round(currentState.estimatedViscosityCp));
    setBtnLabel("idle");
  };

  const res = srpSafeWindowResult;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-[var(--border-primary)]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-2">
              <Activity className="w-6 h-6 text-sky-400" />
              SRP Operating Optimization
            </h1>
            <DataModeBadge />
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Deterministic safe-window sweep — balances pump volumetric efficiency against viscous rod floating risk.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {res && (
            <button onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-[var(--bg-card)] border border-[var(--border-primary)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition">
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          )}
          <button
            id="srp-recalculate-btn"
            onClick={handleRun}
            disabled={isSRPOptimizing}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PlayCircle className="w-4 h-4" />
            <span>
              {isSRPOptimizing
                ? "Calculating Safe Window…"
                : btnLabel === "done"
                ? "✓ Safe Window Updated"
                : "Recalculate Safe Window"}
            </span>
          </button>
        </div>
      </div>

      {/* ── Explainer ──────────────────────────────────────────────────────── */}
      <div className="p-3.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-primary)] text-xs text-[var(--text-secondary)] flex items-start gap-2.5">
        <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-[var(--text-primary)]">Heavy Oil Artificial Lift Challenge: </strong>
          In heavy oil (~{viscosityCp.toLocaleString()} cP), upward buoyant drag on the downstroke resists rod gravity fall.
          If SPM is too high, the rod string floats — leading to compressive buckling, polished-rod clamp shock, and failure.
          The safe window is the SPM range where pump efficiency is maximised and rod-floating risk stays below 0.40.
        </div>
      </div>

      {/* ── Controls ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 p-4 rounded-lg bg-[var(--bg-card)] border border-[var(--border-primary)] space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-secondary)] pb-2">
            <span className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-sky-400" />
              SRP INPUT CONDITIONS
            </span>
            <span className="text-[10px] font-mono text-[var(--text-muted)]">API RP 11L / Baghewala Field</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* SPM */}
            <div>
              <div className="flex justify-between text-[var(--text-secondary)] mb-1">
                <span>Pumping Speed (SPM):</span>
                <span className={`font-mono font-bold ${spm > 6.5 ? "text-rose-400" : "text-[var(--text-primary)]"}`}>{spm.toFixed(1)} SPM</span>
              </div>
              <input type="range" min="2.0" max="9.0" step="0.2" value={spm}
                onChange={(e) => setSpm(Number(e.target.value))}
                className="w-full accent-sky-500 cursor-pointer" />
              <div className="text-[10px] text-[var(--text-muted)] flex justify-between mt-0.5">
                <span>2.0 SPM</span>
                <span className={spm > 6.5 ? "text-rose-400 font-bold" : "text-emerald-400"}>
                  {spm > 6.5 ? "⚠ High Float Risk" : "Safe Range"}
                </span>
                <span>9.0 SPM</span>
              </div>
            </div>

            {/* Stroke */}
            <div>
              <div className="flex justify-between text-[var(--text-secondary)] mb-1">
                <span>Stroke Length:</span>
                <span className="font-mono font-bold text-[var(--text-primary)]">{strokeIn}&quot;</span>
              </div>
              <input type="range" min="84" max="168" step="12" value={strokeIn}
                onChange={(e) => setStrokeIn(Number(e.target.value))}
                className="w-full accent-sky-500 cursor-pointer" />
              <div className="text-[10px] text-[var(--text-muted)] flex justify-between mt-0.5">
                <span>84&quot;</span><span>168&quot;</span>
              </div>
            </div>

            {/* VFD */}
            <div>
              <div className="flex justify-between text-[var(--text-secondary)] mb-1">
                <span>VFD Frequency:</span>
                <span className="font-mono font-bold text-[var(--text-primary)]">{vfdHz.toFixed(1)} Hz</span>
              </div>
              <input type="range" min="25" max="60" step="0.5" value={vfdHz}
                onChange={(e) => setVfdHz(Number(e.target.value))}
                className="w-full accent-sky-500 cursor-pointer" />
              <div className="text-[10px] text-[var(--text-muted)] flex justify-between mt-0.5">
                <span>25 Hz</span><span>60 Hz</span>
              </div>
            </div>

            {/* Viscosity */}
            <div>
              <div className="flex justify-between text-[var(--text-secondary)] mb-1">
                <span>Fluid Viscosity:</span>
                <span className={`font-mono font-bold ${viscosityCp > 2000 ? "text-rose-400" : viscosityCp > 800 ? "text-amber-400" : "text-emerald-400"}`}>
                  {viscosityCp.toLocaleString()} cP
                </span>
              </div>
              <input type="range" min="50" max="8500" step="50" value={viscosityCp}
                onChange={(e) => setViscosityCp(Number(e.target.value))}
                className="w-full accent-sky-500 cursor-pointer" />
              <div className="text-[10px] text-[var(--text-muted)] flex justify-between mt-0.5">
                <span>50 cP (warm)</span><span className="text-rose-400">8,500 cP (cold)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Current Operating Point */}
        <div className="lg:col-span-5 p-4 rounded-lg bg-[var(--bg-card)] border border-[var(--border-primary)] space-y-3">
          <div className="flex items-center justify-between border-b border-[var(--border-secondary)] pb-2">
            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">CURRENT OPERATING POINT</span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold ${
              spm > 6.5
                ? "bg-rose-950 text-rose-400 border-rose-800"
                : spm > 5.5
                ? "bg-amber-950 text-amber-400 border-amber-800"
                : "bg-emerald-950 text-emerald-400 border-emerald-800"
            }`}>
              {spm > 6.5 ? "CAUTION" : spm > 5.5 ? "MARGINAL" : "SAFE"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            {[
              { label: "PUMPING SPEED",  val: `${spm.toFixed(1)} SPM`,    warn: spm > 6.5 },
              { label: "STROKE LENGTH",  val: `${strokeIn}"`,              warn: false },
              { label: "VFD FREQUENCY",  val: `${vfdHz.toFixed(1)} Hz`,   warn: false },
              { label: "FLUID VISCOSITY",val: `${viscosityCp.toLocaleString()} cP`, warn: viscosityCp > 2000 },
            ].map(({ label, val, warn }) => (
              <div key={label} className="p-3 rounded bg-[var(--bg-deep)] border border-[var(--border-secondary)]">
                <div className="text-[10px] text-[var(--text-muted)]">{label}</div>
                <div className={`text-lg font-bold mt-1 ${warn ? "text-rose-400" : "text-[var(--text-primary)]"}`}>{val}</div>
              </div>
            ))}
          </div>

          {/* Current risk bars */}
          <div className="space-y-2.5 pt-2">
            <div className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Current Risk Profile</div>
            <RiskBar
              label="Rod Floating Risk"
              value={res ? res.currentRodFloatingRisk : currentState.rodFloatingRisk}
              limit={0.40}
              color="rose"
            />
            <RiskBar
              label="Impact Load Risk"
              value={res ? res.currentImpactLoadRisk : currentState.impactLoadRisk}
              limit={0.55}
              color="amber"
            />
          </div>
        </div>
      </div>

      {/* ── Loading state ──────────────────────────────────────────────────── */}
      {isSRPOptimizing && (
        <div className="p-6 rounded-lg bg-[var(--bg-card)] border border-sky-900/50 flex items-center justify-center gap-3">
          <div className="w-5 h-5 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-sky-300 font-mono">Sweeping SPM 1.8 → 9.0 in 0.2-step increments…</span>
        </div>
      )}

      {/* ── Infeasible result ──────────────────────────────────────────────── */}
      {res && !res.feasible && (
        <div className="p-5 rounded-lg bg-rose-950/30 border border-rose-900/50 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-bold text-rose-300">No Safe SRP Operating Window Found</div>
            <div className="text-xs text-rose-200/80 mt-1">{res.infeasibleReason}</div>
          </div>
        </div>
      )}

      {/* ── Safe Window Result ─────────────────────────────────────────────── */}
      {res && res.feasible && (
        <div className="space-y-4">
          {/* Safe Window KPI cards */}
          <div className="p-5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-primary)] space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-secondary)] pb-3">
              <div>
                <div className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  SAFE RECOMMENDED OPERATING WINDOW
                  <span className={`text-[10px] px-2 py-0.5 rounded font-mono border ${res.overallConstraintStatus === "PASSED" ? "bg-emerald-950 text-emerald-400 border-emerald-800" : "bg-amber-950 text-amber-400 border-amber-800"}`}>
                    {res.overallConstraintStatus}
                  </span>
                </div>
                <div className="text-xs text-[var(--text-muted)] mt-0.5">Run {res.runId} — {res.timestamp}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 rounded bg-[var(--bg-deep)] border border-sky-900/60">
                <div className="text-[10px] text-sky-400 font-bold">SAFE SPM WINDOW</div>
                <div className="text-lg font-bold text-emerald-400 mt-1">{res.spmMin.toFixed(1)} – {res.spmMax.toFixed(1)} SPM</div>
                <div className="text-[10px] text-[var(--text-muted)] mt-0.5">
                  Optimal: <strong className="text-[var(--text-primary)]">{res.spmOptimal.toFixed(1)} SPM</strong>
                </div>
              </div>

              <div className="p-3 rounded bg-[var(--bg-deep)] border border-sky-900/60">
                <div className="text-[10px] text-sky-400 font-bold">STROKE ENVELOPE</div>
                <div className="text-lg font-bold text-[var(--text-primary)] mt-1">{res.strokeMin}&quot; – {res.strokeMax}&quot;</div>
                <div className="text-[10px] text-[var(--text-muted)] mt-0.5">
                  Optimal: <strong className="text-[var(--text-primary)]">{res.strokeOptimal}&quot;</strong>
                </div>
              </div>

              <div className="p-3 rounded bg-[var(--bg-deep)] border border-sky-900/60">
                <div className="text-[10px] text-sky-400 font-bold">OPTIMAL VFD SPEED</div>
                <div className="text-lg font-bold text-[var(--text-primary)] mt-1">{res.vfdMin.toFixed(1)} – {res.vfdMax.toFixed(1)} Hz</div>
                <div className="text-[10px] text-emerald-400 mt-0.5">Target: {res.vfdOptimal.toFixed(1)} Hz</div>
              </div>

              <div className="p-3 rounded bg-[var(--bg-deep)] border border-sky-900/60">
                <div className="text-[10px] text-sky-400 font-bold">PREDICTED EFFICIENCY</div>
                <div className="text-lg font-bold text-emerald-400 mt-1">{res.predictedEfficiencyPct.toFixed(1)}%</div>
                <div className="text-[10px] text-[var(--text-muted)] mt-0.5">Volumetric fillage</div>
              </div>
            </div>

            {/* Current vs Recommended risk comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="space-y-2 p-3 rounded bg-[var(--bg-deep)] border border-[var(--border-secondary)]">
                <div className="text-[10px] uppercase font-bold text-slate-400">Current Point Risks</div>
                <RiskBar label="Rod Floating Risk" value={res.currentRodFloatingRisk} limit={0.40} color="rose" />
                <RiskBar label="Impact Load Risk"  value={res.currentImpactLoadRisk}  limit={0.55} color="amber" />
                <div className="text-[10px] text-[var(--text-muted)]">Efficiency: <span className="text-[var(--text-primary)] font-mono">{res.currentEfficiencyPct.toFixed(1)}%</span></div>
              </div>
              <div className="space-y-2 p-3 rounded bg-emerald-950/30 border border-emerald-900/40">
                <div className="text-[10px] uppercase font-bold text-emerald-400">Optimal Point Risks</div>
                <RiskBar label="Rod Floating Risk" value={res.predictedRodFloatingRisk} limit={0.40} color="rose" />
                <RiskBar label="Impact Load Risk"  value={res.predictedImpactLoadRisk}  limit={0.55} color="amber" />
                <div className="text-[10px] text-[var(--text-muted)]">Efficiency: <span className="text-emerald-400 font-mono font-bold">{res.predictedEfficiencyPct.toFixed(1)}%</span></div>
              </div>
            </div>

            {/* Constraint table */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wide">Engineering Constraint Validation</div>
              {res.constraints.map((c) => (
                <ConstraintRow key={c.name} {...c} />
              ))}
            </div>
          </div>

          {/* SPM Curve Chart */}
          <div className="p-4 rounded-lg bg-[var(--bg-card)] border border-[var(--border-primary)] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-secondary)] pb-2">
              <div>
                <div className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
                  KINEMATIC TRADE-OFF CURVE: PUMP EFFICIENCY vs ROD FLOATING RISK
                </div>
                <div className="text-[11px] text-[var(--text-muted)]">
                  Blue shaded region = safe operating window (both metrics pass)
                </div>
              </div>
            </div>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={res.curveData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a2642" />
                  <XAxis dataKey="spm" tickFormatter={(v) => `${v.toFixed(1)}`} tick={{ fontSize: 10, fill: "#94a3b8" }} label={{ value: "SPM", position: "insideBottom", offset: -2, fontSize: 10, fill: "#94a3b8" }} />
                  <YAxis yAxisId="eff"  orientation="left"  domain={[0, 100]} tick={{ fontSize: 10, fill: "#94a3b8" }} label={{ value: "Efficiency (%)", angle: -90, position: "insideLeft", fontSize: 10, fill: "#94a3b8" }} />
                  <YAxis yAxisId="risk" orientation="right" domain={[0, 1]}   tick={{ fontSize: 10, fill: "#94a3b8" }} label={{ value: "Risk Index", angle: 90, position: "insideRight", fontSize: 10, fill: "#94a3b8" }} />
                  <Tooltip content={<SRPTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />

                  {/* Safe window shading */}
                  <ReferenceArea yAxisId="eff" x1={res.spmMin} x2={res.spmMax} fill="#0ea5e9" fillOpacity={0.08} />

                  {/* Current SPM */}
                  <ReferenceLine yAxisId="eff" x={res.inputSpm} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 3" label={{ value: "Current", position: "top", fontSize: 9, fill: "#f59e0b" }} />

                  {/* Optimal SPM */}
                  <ReferenceLine yAxisId="eff" x={res.spmOptimal} stroke="#34d399" strokeWidth={2} label={{ value: "Optimal", position: "top", fontSize: 9, fill: "#34d399" }} />

                  {/* Rod floating limit */}
                  <ReferenceLine yAxisId="risk" y={0.40} stroke="#f87171" strokeWidth={1} strokeDasharray="3 3" label={{ value: "Float Limit 0.40", position: "right", fontSize: 9, fill: "#f87171" }} />

                  <Area    yAxisId="eff"  type="monotone" dataKey="pumpEfficiencyPct"  name="Pump Efficiency (%)" fill="#38bdf8" stroke="#38bdf8" fillOpacity={0.15} strokeWidth={2} dot={false} />
                  <Line   yAxisId="risk"  type="monotone" dataKey="rodFloatingRisk"    name="Rod Float Risk"     stroke="#f87171" strokeWidth={2} dot={false} />
                  <Line   yAxisId="risk"  type="monotone" dataKey="impactLoadRisk"     name="Impact Load Risk"   stroke="#f59e0b" strokeWidth={1.5} dot={false} strokeDasharray="4 3" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Rationale */}
            <div className="p-3.5 rounded bg-[var(--bg-deep)] border border-[var(--border-secondary)] text-xs text-[var(--text-secondary)] leading-relaxed">
              <span className="font-bold text-sky-400">Engineering Rationale: </span>
              {res.explanation}
            </div>
          </div>
        </div>
      )}

      {/* ── Empty state ────────────────────────────────────────────────────── */}
      {!res && !isSRPOptimizing && (
        <div className="p-8 rounded-lg bg-[var(--bg-card)] border border-dashed border-[var(--border-primary)] flex flex-col items-center justify-center gap-3 text-center">
          <Info className="w-8 h-8 text-sky-400/60" />
          <div className="text-sm text-[var(--text-muted)]">
            Adjust the SRP parameters above and click <strong className="text-sky-400">Recalculate Safe Window</strong>.
          </div>
          <div className="text-xs text-[var(--text-muted)]">
            The calculator sweeps SPM 1.8 → 9.0 in 0.2-step increments (~36 evaluation points) using the deterministic physics model.
          </div>
        </div>
      )}
    </div>
  );
}
