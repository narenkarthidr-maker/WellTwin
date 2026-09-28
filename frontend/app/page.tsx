"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Droplet,
  Thermometer,
  Wind,
  Gauge,
  Zap,
  TrendingDown,
  Layers,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  GitMerge,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Play
} from "lucide-react";
import { KpiCard } from "@/components/common/KpiCard";
import { DataModeBadge } from "@/components/common/DataModeBadge";
import { fetchWellState, fetchTelemetry } from "@/lib/api";
import { WellState, TelemetryPoint } from "@/types/well";
import { ProductionChart } from "@/components/charts/ProductionChart";
import { TemperatureChart } from "@/components/charts/TemperatureChart";

export default function CommandCenterPage() {
  const [wellState, setWellState] = useState<WellState | null>(null);
  const [telemetry, setTelemetry] = useState<TelemetryPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const state = await fetchWellState("BGH-01");
        const hist = await fetchTelemetry("BGH-01", 30);
        setWellState(state);
        setTelemetry(hist);
      } catch (err) {
        console.error("Failed to load command center state", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const healthBadges = {
    GOOD: "bg-emerald-950 text-emerald-400 border-emerald-800",
    WATCH: "bg-amber-950 text-amber-400 border-amber-800",
    WARNING: "bg-orange-950 text-orange-400 border-orange-800",
    CRITICAL: "bg-rose-950 text-rose-400 border-rose-800"
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Title & Subtitle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#182645]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
              Command Center
            </h1>
            <DataModeBadge />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Baghewala Heavy-Oil Field • Well Intelligence & Operational Decision Support
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/joint-optimizer"
            className="flex items-center gap-2 px-3.5 py-2 rounded-md bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md transition"
          >
            <GitMerge className="w-4 h-4" />
            <span>Launch Joint Optimizer</span>
          </Link>
          <Link
            href="/simulator"
            className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-[#131d36] hover:bg-[#1a284c] border border-[#24355a] text-slate-300 text-xs font-medium transition"
          >
            <Cpu className="w-4 h-4 text-sky-400" />
            <span>What-If Simulator</span>
          </Link>
        </div>
      </div>

      {/* Top KPI Cards (Answers: What is happening to this well?) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard
          title="Oil Production"
          value={wellState ? wellState.oil_rate_bpd.toFixed(1) : "48.5"}
          unit="bpd"
          subtext="Net heavy oil rate"
          icon={Droplet}
          badge={{ text: "DECLINING", variant: "watch" }}
          accentColor="border-sky-500/40"
          href="/data-replay"
        />
        <KpiCard
          title="Reservoir Temp"
          value={wellState ? wellState.reservoir_temp_c.toFixed(1) : "82.4"}
          unit="°C"
          subtext="Sandface thermal state"
          icon={Thermometer}
          badge={{ text: "COOLING", variant: "warning" }}
          accentColor="border-orange-500/40"
          href="/digital-twin"
        />
        <KpiCard
          title="Est. Viscosity"
          value={wellState ? Math.round(wellState.estimated_viscosity_cp) : "1,250"}
          unit="cP"
          subtext="Inverted from temp"
          icon={Wind}
          badge={{ text: "HIGH DRAG", variant: "warning" }}
          accentColor="border-amber-500/40"
          href="/digital-twin"
        />
        <KpiCard
          title="Steam-Oil Ratio"
          value={wellState ? wellState.sor.toFixed(2) : "3.25"}
          unit="bbl/bbl"
          subtext="Cumulative CSS cycle"
          icon={Gauge}
          badge={{ text: "ACCEPTABLE", variant: "good" }}
          accentColor="border-purple-500/40"
          href="/css-optimizer"
        />
        <KpiCard
          title="Pump Efficiency"
          value={wellState ? wellState.pump_efficiency_pct.toFixed(1) : "74.5"}
          unit="%"
          subtext="SRP volumetric fillage"
          icon={Gauge}
          badge={{ text: "NOMINAL", variant: "good" }}
          accentColor="border-emerald-500/40"
          href="/srp-optimizer"
        />
        <KpiCard
          title="Energy / Barrel"
          value={wellState ? wellState.energy_kwh_per_bbl.toFixed(1) : "42.1"}
          unit="kWh"
          subtext="Lifting power index"
          icon={Zap}
          badge={{ text: "TRACKING", variant: "neutral" }}
          accentColor="border-blue-500/40"
          href="/simulator"
        />
      </div>

      {/* Middle Section: Mini Digital Twin + Well Health Diagnostics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Mini Digital Twin Cross-Section Snapshot */}
        <div className="lg:col-span-5 p-4 rounded-lg bg-[#0e162a] border border-[#1a2642] flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[#1b2848] pb-2 mb-3">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-sky-400" />
              DIGITAL TWIN STATUS
            </span>
            <Link href="/digital-twin" className="text-[11px] text-sky-400 hover:underline flex items-center gap-1 font-mono">
              Full 3D Twin <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2 text-xs font-mono">
            {/* Surface */}
            <div className="p-2.5 rounded bg-[#090e1c] border border-[#1f2e52] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-400" />
                <span className="text-slate-300 font-semibold">SURFACE FACILITY</span>
              </div>
              <span className="text-slate-400">P: 3.8 bar • T_flow: 42°C</span>
            </div>

            {/* SRP Pump */}
            <div className="p-2.5 rounded bg-[#090e1c] border border-[#1f2e52] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                <span className="text-slate-300 font-semibold">SRP PUMPJACK</span>
              </div>
              <span className="text-sky-300 font-bold">5.2 SPM • 120&quot; Stroke</span>
            </div>

            {/* Wellbore */}
            <div className="p-2.5 rounded bg-[#090e1c] border border-[#1f2e52] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                <span className="text-slate-300 font-semibold">WELLBORE (1150m)</span>
              </div>
              <span className="text-slate-400">Quality: 74% • BHP: 32 bar</span>
            </div>

            {/* Reservoir */}
            <div className="p-2.5 rounded bg-gradient-to-r from-[#211108] to-[#090e1c] border border-orange-900/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                <span className="text-orange-200 font-semibold">RESERVOIR (Jodhpur Fm)</span>
              </div>
              <span className="text-orange-300 font-bold">82.4°C • ~1,250 cP</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#1b2848] flex items-center justify-between text-[11px] text-slate-400">
            <span>Thermal Coupling: <strong className="text-emerald-400">Active</strong></span>
            <span>Last CSS: Cycle 3 (2,600t)</span>
          </div>
        </div>

        {/* Right: Well Health Categorical Status */}
        <div className="lg:col-span-7 p-4 rounded-lg bg-[#0e162a] border border-[#1a2642] flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[#1b2848] pb-2 mb-3">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
              WELL MECHANICAL & THERMAL HEALTH
            </span>
            <span className="text-[10px] font-mono text-slate-400">Status Categorization (Zero Unsupported %)</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="p-3 rounded bg-[#090e1c] border border-[#1a2747]">
              <div className="text-[10px] text-slate-400 uppercase tracking-wide">Thermal Condition</div>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-200">Cooling Decay</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold border ${healthBadges[wellState?.thermal_condition || "WATCH"]}`}>
                  {wellState?.thermal_condition || "WATCH"}
                </span>
              </div>
            </div>

            <div className="p-3 rounded bg-[#090e1c] border border-[#1a2747]">
              <div className="text-[10px] text-slate-400 uppercase tracking-wide">Pump Condition</div>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-200">Valve Fillage</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold border ${healthBadges[wellState?.pump_condition || "GOOD"]}`}>
                  {wellState?.pump_condition || "GOOD"}
                </span>
              </div>
            </div>

            <div className="p-3 rounded bg-[#090e1c] border border-[#1a2747]">
              <div className="text-[10px] text-slate-400 uppercase tracking-wide">Rod Floating Risk</div>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-200">Viscous Downstroke</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold border ${healthBadges[wellState?.rod_floating_risk || "WATCH"]}`}>
                  {wellState?.rod_floating_risk || "WATCH"}
                </span>
              </div>
            </div>

            <div className="p-3 rounded bg-[#090e1c] border border-[#1a2747]">
              <div className="text-[10px] text-slate-400 uppercase tracking-wide">Impact Load Risk</div>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-200">Fluid Pounding</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold border ${healthBadges[wellState?.impact_load_risk || "GOOD"]}`}>
                  {wellState?.impact_load_risk || "GOOD"}
                </span>
              </div>
            </div>

            <div className="p-3 rounded bg-[#090e1c] border border-[#1a2747]">
              <div className="text-[10px] text-slate-400 uppercase tracking-wide">Pump Unsetting Risk</div>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-200">Anchor Margin</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold border ${healthBadges[wellState?.pump_unsetting_risk || "GOOD"]}`}>
                  {wellState?.pump_unsetting_risk || "GOOD"}
                </span>
              </div>
            </div>

            <div className="p-3 rounded bg-[#090e1c] border border-[#1a2747]">
              <div className="text-[10px] text-slate-400 uppercase tracking-wide">Production Trend</div>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-200">Drawdown Curve</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold border bg-amber-950 text-amber-400 border-amber-800">
                  DECLINING
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-[#1b2848]">
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Deterministic Constraints Active
            </span>
            <Link href="/predictive-health" className="text-sky-400 hover:underline flex items-center gap-1">
              Detailed Diagnostics <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* AI INSIGHT SECTION */}
      <div className="p-4 rounded-lg bg-gradient-to-r from-[#17122b] to-[#0c162d] border border-purple-800/40 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-md bg-purple-900/60 border border-purple-700/60 flex items-center justify-center text-purple-300 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <div className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-2">
              <span>PHYSICS-GUIDED AI INSIGHT</span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-950 text-purple-400 border border-purple-800">
                Coupled Model
              </span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              {wellState?.ai_insight || (
                "Reservoir cooling is increasing estimated viscosity. The predicted SRP operating window is narrowing. " +
                "Run Joint Optimization before the next CSS cycle to avoid downstroke rod floating."
              )}
            </p>
          </div>
        </div>
      </div>

      {/* CURRENT OPERATION vs RECOMMENDED OPERATION TABLE */}
      <div className="p-4 rounded-lg bg-[#0e162a] border border-[#1a2642] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1b2848] pb-3">
          <div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <span>CURRENT OPERATION vs RECOMMENDED OPERATION</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800 font-bold">
                MODEL PREDICTION
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              Deterministic comparison between active SCADA baseline and validated Joint Optimizer candidate
            </div>
          </div>

          <div className="text-[10px] font-mono text-amber-400 bg-amber-950/40 px-2.5 py-1 rounded border border-amber-800/50">
            *Outputs are model predictions, not field measurements
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#1c2a4a] text-slate-400">
                <th className="py-2 px-3">SUBSYSTEM</th>
                <th className="py-2 px-3">PARAMETER</th>
                <th className="py-2 px-3">CURRENT BASELINE</th>
                <th className="py-2 px-3 text-sky-400 font-bold">RECOMMENDED POINT</th>
                <th className="py-2 px-3">EXPECTED EFFECT (MODEL)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#15213d] text-slate-300">
              <tr>
                <td className="py-2.5 px-3 font-bold text-orange-400">CSS Cycle</td>
                <td className="py-2.5 px-3">Steam Volume</td>
                <td className="py-2.5 px-3">2,600 tons</td>
                <td className="py-2.5 px-3 font-bold text-white">2,800 tons</td>
                <td className="py-2.5 px-3 text-slate-400">Deepens heated zone to 24m radius</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-orange-400">CSS Cycle</td>
                <td className="py-2.5 px-3">Injection Pressure</td>
                <td className="py-2.5 px-3">112 bar</td>
                <td className="py-2.5 px-3 font-bold text-white">115 bar</td>
                <td className="py-2.5 px-3 text-emerald-400 font-semibold">Safe cushion below 145 bar fracture cap</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-orange-400">CSS Cycle</td>
                <td className="py-2.5 px-3">Soak Time</td>
                <td className="py-2.5 px-3">5.0 days</td>
                <td className="py-2.5 px-3 font-bold text-white">6.0 days</td>
                <td className="py-2.5 px-3 text-slate-400">Enables thermal distribution into sandstone</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-blue-400">SRP Pump</td>
                <td className="py-2.5 px-3">Stroke Length</td>
                <td className="py-2.5 px-3">120 in</td>
                <td className="py-2.5 px-3 font-bold text-white">132 in</td>
                <td className="py-2.5 px-3 text-slate-400">Increases chamber displacement volume</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-blue-400">SRP Pump</td>
                <td className="py-2.5 px-3">Pump Speed (SPM)</td>
                <td className="py-2.5 px-3 text-rose-400">5.8 SPM (Risk Zone)</td>
                <td className="py-2.5 px-3 font-bold text-emerald-400">5.0 SPM (Safe Window)</td>
                <td className="py-2.5 px-3 text-emerald-400 font-semibold">Eliminates rod floating risk on downstroke</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-blue-400">SRP Pump</td>
                <td className="py-2.5 px-3">VFD Frequency</td>
                <td className="py-2.5 px-3">48.2 Hz</td>
                <td className="py-2.5 px-3 font-bold text-white">44.5 Hz</td>
                <td className="py-2.5 px-3 text-slate-400">Lowers motor thermal stress & power consumption</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Expected Performance Metrics Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-[#1b2848]">
          <div className="p-2.5 rounded bg-[#090e1c] border border-[#1f2e52]">
            <div className="text-[10px] text-slate-400">PREDICTED OIL RATE</div>
            <div className="text-sm font-bold text-white font-mono mt-0.5">54.2 bpd <span className="text-emerald-400 text-xs font-normal">(+5.7 bpd)</span></div>
          </div>
          <div className="p-2.5 rounded bg-[#090e1c] border border-[#1f2e52]">
            <div className="text-[10px] text-slate-400">PREDICTED SOR</div>
            <div className="text-sm font-bold text-white font-mono mt-0.5">2.92 <span className="text-emerald-400 text-xs font-normal">(-0.33)</span></div>
          </div>
          <div className="p-2.5 rounded bg-[#090e1c] border border-[#1f2e52]">
            <div className="text-[10px] text-slate-400">PUMP EFFICIENCY</div>
            <div className="text-sm font-bold text-white font-mono mt-0.5">78.2% <span className="text-emerald-400 text-xs font-normal">(+3.7%)</span></div>
          </div>
          <div className="p-2.5 rounded bg-[#090e1c] border border-[#1f2e52]">
            <div className="text-[10px] text-slate-400">MECHANICAL RISK</div>
            <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5">0.14 <span className="text-xs font-normal text-slate-400">(Low / Safe)</span></div>
          </div>
        </div>
      </div>

      {/* Production & Thermal Telemetry Trends */}
      {telemetry.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ProductionChart data={telemetry} title="Recent 30-Day Heavy Oil Production Trend (bpd)" />
          <TemperatureChart data={telemetry} title="Recent 30-Day Sandface Temperature Decline (°C)" />
        </div>
      )}
    </div>
  );
}
