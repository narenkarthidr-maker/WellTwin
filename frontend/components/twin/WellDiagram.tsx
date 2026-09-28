"use client";

import React from "react";
import {
  Layers,
  Thermometer,
  Gauge,
  Activity,
  Zap,
  Flame,
  ArrowDown,
  ArrowUp,
  Sliders,
  Maximize2,
  Box,
  Info,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { useWellTwin } from "@/context/WellTwinContext";
import { ThreeWellTwin } from "./ThreeWellTwin";

interface WellDiagramProps {
  initialState?: any;
  onParameterChange?: (params: any) => void;
}

export const WellDiagram: React.FC<WellDiagramProps> = ({
  initialState,
  onParameterChange
}) => {
  const {
    currentParams, currentState, updateParams,
    twinViewMode, setTwinViewMode,
    optimizationResult, cssOptimizationResult, srpSafeWindowResult,
  } = useWellTwin();
  const [renderType, setRenderType] = React.useState<"2D_SCHEMATIC" | "3D_TWIN">("3D_TWIN");

  // Alias for shorter references
  const viewMode = twinViewMode;

  const steamVolume = currentParams.steamVolumeTons;
  const injectionPressure = currentParams.injectionPressureBar;
  const soakTime = currentParams.soakTimeDays;
  const stroke = currentParams.strokeLengthIn;
  const spm = currentParams.spm;
  const vfd = currentParams.vfdHz;

  const tempEst = currentState.reservoirTempC;
  const viscEst = currentState.estimatedViscosityCp;
  const effEst = currentState.pumpEfficiencyPct;
  const rodLoadEst = currentState.pprlLbs;
  const floatingRisk = currentState.rodFloatingRisk;

  const handleParamUpdate = (updates: Partial<typeof currentParams>) => {
    updateParams(updates);
    if (onParameterChange) {
      onParameterChange({
        steam_volume_tons: updates.steamVolumeTons ?? steamVolume,
        injection_pressure_bar: updates.injectionPressureBar ?? injectionPressure,
        soak_time_days: updates.soakTimeDays ?? soakTime,
        stroke_length_in: updates.strokeLengthIn ?? stroke,
        spm: updates.spm ?? spm,
        vfd_speed_hz: updates.vfdHz ?? vfd,
      });
    }
  };

  // Determine recommended values for Compare mode
  // Priority: Joint Optimizer > CSS Optimizer (for CSS params) > SRP Optimizer (for SRP params)
  const recParams = optimizationResult?.recommendedParams ?? cssOptimizationResult?.recommendedParams ?? null;
  const recState  = optimizationResult?.recommendedState  ?? cssOptimizationResult?.recommendedState  ?? null;
  const hasRecommendation = !!recParams;

  return (
    <div className="space-y-4">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-[var(--bg-card)] border border-[var(--border-primary)]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[var(--text-secondary)]">View Mode:</span>
          <div className="inline-flex rounded-md p-0.5 bg-[var(--bg-deep)] border border-[var(--border-secondary)] toggle-pill-container">
            {(["physical", "digital", "compare"] as const).map((mode) => (
              <button
                key={mode}
                id={`twin-view-${mode}`}
                onClick={() => setTwinViewMode(mode)}
                className={`px-3 py-1 rounded text-xs font-mono font-bold transition ${
                  viewMode === mode
                    ? "bg-sky-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white toggle-btn-inactive"
                }`}
              >
                {mode === "physical" ? "Physical View" : mode === "digital" ? "Digital Twin" : "Compare"}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-md p-0.5 bg-[var(--bg-deep)] border border-[var(--border-secondary)] toggle-pill-container">
            <button
              onClick={() => setRenderType("2D_SCHEMATIC")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition ${
                renderType === "2D_SCHEMATIC" ? "bg-[#1d2d50] text-sky-300 font-bold toggle-btn-2d-active" : "text-slate-400 hover:text-white toggle-btn-inactive"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>2D Well Section</span>
            </button>
            <button
              onClick={() => setRenderType("3D_TWIN")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition ${
                renderType === "3D_TWIN" ? "bg-purple-900 text-purple-200 font-bold toggle-btn-3d-active" : "text-slate-400 hover:text-white toggle-btn-inactive"
              }`}
            >
              <Box className="w-3.5 h-3.5 text-purple-400" />
              <span>3D Digital Twin</span>
            </button>
          </div>
          {/* Active mode label */}
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
            viewMode === "physical" ? "bg-sky-950 text-sky-300 border-sky-800" :
            viewMode === "digital"  ? "bg-purple-950 text-purple-300 border-purple-800" :
            "bg-indigo-950 text-indigo-300 border-indigo-800"
          }`}>
            {viewMode === "physical" ? "PHYSICAL LAYER" : viewMode === "digital" ? "DIGITAL TWIN" : "COMPARE MODE"}
          </span>
        </div>
      </div>

      {/* Main Twin Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Well Schematic or 3D Twin View */}
        <div className={`${viewMode === "compare" ? "lg:col-span-7" : "lg:col-span-8"} space-y-3`}>
          {renderType === "3D_TWIN" ? (
            <div className="h-[620px] rounded-lg border border-[var(--border-primary)] overflow-hidden">
              <ThreeWellTwin viewMode={viewMode} />
            </div>
          ) : (
            /* 2D Engineering Diagram */
            <div className="rounded-lg border border-[#1a2642] bg-[#090e1c] p-4 text-xs font-mono select-none twin-cross-section">
              <div className="flex items-center justify-between pb-3 border-b border-[#1b2848] text-slate-300">
                <span className="font-bold text-sky-400 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-sky-400" />
                  WELL-TO-SURFACE ENGINEERING CROSS-SECTION
                </span>
                <span className="text-[11px] text-slate-400">Total Depth: 1,150 m (Jodhpur Fm)</span>
              </div>

              {/* 1. SURFACE LAYER */}
              <div className="mt-3 p-3 rounded bg-[#0d162b] border border-[#213257] relative twin-layer-box">
                <div className="flex items-center justify-between font-bold text-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-sky-950 text-sky-400 text-[10px] border border-sky-800">
                      SURFACE
                    </span>
                    <span>Production Facilities & Separation</span>
                  </div>
                  <span className="text-emerald-400">P_sep: 3.8 bar</span>
                </div>
                <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] text-slate-300">
                  <div className="bg-[#121c35] p-2 rounded border border-[#1b284a] twin-sub-box">
                    <div className="text-slate-400 text-[9px]">SURFACE SEPARATOR</div>
                    <div className="font-bold text-white">Three-Phase Gravity</div>
                  </div>
                  <div className="bg-[#121c35] p-2 rounded border border-[#1b284a] twin-sub-box">
                    <div className="text-slate-400 text-[9px]">LIFTING POWER</div>
                    <div className="font-bold text-sky-300">{((rodLoadEst * spm) / 1100).toFixed(1)} kW</div>
                  </div>
                  <div className="bg-[#121c35] p-2 rounded border border-[#1b284a] twin-sub-box">
                    <div className="text-slate-400 text-[9px]">ENERGY FOOTPRINT</div>
                    <div className="font-bold text-amber-300">{(38 + viscEst / 300).toFixed(1)} kWh/bbl</div>
                  </div>
                  <div className="bg-[#121c35] p-2 rounded border border-[#1b284a] twin-sub-box">
                    <div className="text-slate-400 text-[9px]">FLOWLINE TEMP</div>
                    <div className="font-bold text-orange-300">42.5 °C</div>
                  </div>
                </div>
              </div>

              {/* Coupling Flow Indicator */}
              <div className="flex justify-center my-1 text-sky-400">
                <ArrowUp className="w-4 h-4 animate-bounce" />
              </div>

              {/* 2. SRP PUMP LAYER */}
              <div className="p-3 rounded bg-[#0d162b] border border-[#213257] relative twin-layer-box">
                <div className="flex items-center justify-between font-bold text-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-blue-950 text-blue-400 text-[10px] border border-blue-800">
                      SRP PUMP
                    </span>
                    <span>Sucker Rod String & Downhole Plunger</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                    floatingRisk > 0.4 ? "bg-rose-950 text-rose-400 border border-rose-800" : "bg-emerald-950 text-emerald-400 border border-emerald-800"
                  }`}>
                    {floatingRisk > 0.4 ? "FLOATING RISK ELEVATED" : "KINEMATICS NOMINAL"}
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] text-slate-300">
                  <div className="bg-[#121c35] p-2 rounded border border-[#1b284a] twin-sub-box">
                    <div className="text-slate-400 text-[9px]">PEAK ROD LOAD (PPRL)</div>
                    <div className="font-bold text-white">{rodLoadEst.toLocaleString()} lbs</div>
                  </div>
                  <div className="bg-[#121c35] p-2 rounded border border-[#1b284a] twin-sub-box">
                    <div className="text-slate-400 text-[9px]">PUMP EFFICIENCY</div>
                    <div className="font-bold text-emerald-400">{effEst.toFixed(1)}%</div>
                  </div>
                  <div className="bg-[#121c35] p-2 rounded border border-[#1b284a] twin-sub-box">
                    <div className="text-slate-400 text-[9px]">PUMP SPEED / STROKE</div>
                    <div className="font-bold text-sky-300">{spm.toFixed(1)} SPM / {stroke}&quot;</div>
                  </div>
                  <div className="bg-[#121c35] p-2 rounded border border-[#1b284a] twin-sub-box">
                    <div className="text-slate-400 text-[9px]">ROD FLOATING RATIO</div>
                    <div className="font-bold text-orange-400">{floatingRisk.toFixed(3)}</div>
                  </div>
                </div>
              </div>

              {/* Coupling Flow Indicator */}
              <div className="flex justify-center my-1 text-sky-400">
                <ArrowUp className="w-4 h-4 animate-bounce" />
              </div>

              {/* 3. WELLBORE LAYER */}
              <div className="p-3 rounded bg-[#0d162b] border border-[#213257] relative twin-layer-box">
                <div className="flex items-center justify-between font-bold text-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-400 text-[10px] border border-indigo-800">
                      WELLBORE
                    </span>
                    <span>1,150 m Casing & Thermal Enthalpy Gradient</span>
                  </div>
                  <span className="text-sky-300 text-[11px]">Steam Quality: 74% @ Sandface</span>
                </div>
                <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] text-slate-300">
                  <div className="bg-[#121c35] p-2 rounded border border-[#1b284a] twin-sub-box">
                    <div className="text-slate-400 text-[9px]">CASING OD / ID</div>
                    <div className="font-bold text-white">7.0&quot; / 6.276&quot;</div>
                  </div>
                  <div className="bg-[#121c35] p-2 rounded border border-[#1b284a] twin-sub-box">
                    <div className="text-slate-400 text-[9px]">TUBING STRING</div>
                    <div className="font-bold text-white">3.5&quot; Insulated Tubing</div>
                  </div>
                  <div className="bg-[#121c35] p-2 rounded border border-[#1b284a] twin-sub-box">
                    <div className="text-slate-400 text-[9px]">OVERBURDEN HEAT LOSS</div>
                    <div className="font-bold text-amber-300">14.2% Wellbore Loss</div>
                  </div>
                  <div className="bg-[#121c35] p-2 rounded border border-[#1b284a] twin-sub-box">
                    <div className="text-slate-400 text-[9px]">BOTTOMHOLE PRESSURE</div>
                    <div className="font-bold text-sky-300">32.4 bar Flowing</div>
                  </div>
                </div>
              </div>

              {/* Coupling Flow Indicator */}
              <div className="flex justify-center my-1 text-orange-400">
                <ArrowDown className="w-4 h-4 text-orange-500 animate-pulse" />
              </div>

              {/* 4. RESERVOIR LAYER */}
              <div className="p-3 rounded bg-gradient-to-r from-[#24130b] via-[#1c1209] to-[#0e162a] border border-orange-900/60 relative twin-reservoir-layer">
                <div className="flex items-center justify-between font-bold text-orange-200">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-orange-950 text-orange-400 text-[10px] border border-orange-800">
                      RESERVOIR
                    </span>
                    <span>Jodhpur Sandstone (Heavy Oil Pay Zone)</span>
                  </div>
                  <span className="text-orange-400 font-bold">17.5° API Crude</span>
                </div>
                <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] text-slate-300">
                  <div className="bg-[#150d08] p-2 rounded border border-orange-900/40 twin-reservoir-sub-box">
                    <div className="text-orange-400 text-[9px]">SANDFACE TEMP</div>
                    <div className="font-bold text-white">{tempEst.toFixed(1)} °C</div>
                  </div>
                  <div className="bg-[#150d08] p-2 rounded border border-orange-900/40 twin-reservoir-sub-box">
                    <div className="text-orange-400 text-[9px]">DOWNHOLE VISCOSITY</div>
                    <div className="font-bold text-orange-300">{Math.round(viscEst)} cP</div>
                  </div>
                  <div className="bg-[#150d08] p-2 rounded border border-orange-900/40 twin-reservoir-sub-box">
                    <div className="text-orange-400 text-[9px]">STEAM CHAMBER RADIUS</div>
                    <div className="font-bold text-white">{(12.5 + (steamVolume / 250)).toFixed(1)} m</div>
                  </div>
                  <div className="bg-[#150d08] p-2 rounded border border-orange-900/40 twin-reservoir-sub-box">
                    <div className="text-orange-400 text-[9px]">OIL MOBILITY (k/mu)</div>
                    <div className="font-bold text-emerald-400">{(650 / Math.max(viscEst, 1)).toFixed(2)} mD/cP</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Mode-Dependent Panel */}
        <div className={`${viewMode === "compare" ? "lg:col-span-5" : "lg:col-span-4"} space-y-3`}>

          {/* PHYSICAL MODE: show static engineering specs, hide digital overlays */}
          {viewMode === "physical" && (
            <div className="p-4 rounded-lg bg-[var(--bg-card)] border border-[var(--border-primary)] space-y-3">
              <div className="flex items-center gap-2 font-bold text-sm text-[var(--text-primary)] border-b border-[var(--border-secondary)] pb-2">
                <Sliders className="w-4 h-4 text-sky-400" />
                Physical Engineering Specifications
              </div>
              <div className="space-y-2 text-xs font-mono">
                {[
                  { label: "Casing OD / ID",   val: "7.0\" / 6.276\"" },
                  { label: "Tubing String",     val: "3.5\" Insulated" },
                  { label: "Total Depth",        val: "1,150 m MD" },
                  { label: "Pay Zone",           val: "Jodhpur Sandstone" },
                  { label: "Pump Barrel Size",  val: "2.75\" Tubing Pump" },
                  { label: "Rod String Grade",  val: "API Grade D" },
                  { label: "Rod Rating (PPRL)", val: "22,000 lbs" },
                  { label: "Pumpjack Unit",     val: "C-640D-365-168" },
                  { label: "Motor Rating",      val: "75 HP TEFC VFD" },
                  { label: "Gearbox Torque",    val: "640,000 in-lb" },
                  { label: "Stroke Range",      val: "84\" – 168\"" },
                  { label: "API RP Standard",   val: "API RP 11L" },
                ].map(({ label, val }) => (
                  <div key={label} className="flex justify-between py-1 border-b border-[var(--border-secondary)] last:border-0">
                    <span className="text-[var(--text-muted)]">{label}:</span>
                    <span className="text-[var(--text-primary)] font-bold">{val}</span>
                  </div>
                ))}
              </div>
              <div className="p-2.5 rounded bg-[var(--bg-deep)] border border-sky-900/40 text-[11px] text-sky-300">
                Physical View shows wellhead, pumpjack, casing, tubing and SRP mechanism without digital telemetry overlays.
              </div>
            </div>
          )}

          {/* DIGITAL MODE: live controls + metrics */}
          {viewMode === "digital" && (
            <div className="p-4 rounded-lg bg-[var(--bg-card)] border border-[var(--border-primary)] space-y-4 twin-controls-card">
              <div className="flex items-center justify-between border-b border-[var(--border-secondary)] pb-2">
                <div className="flex items-center gap-2 font-bold text-sm text-[var(--text-primary)]">
                  <Sliders className="w-4 h-4 text-sky-400" />
                  <span>Interactive Twin Controls</span>
                </div>
                <span className="text-[10px] font-mono text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800">
                  Physics Synced
                </span>
              </div>

              {/* CSS Controls */}
              <div className="space-y-3">
                <div className="text-xs font-semibold text-orange-400 uppercase tracking-wide flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5" />
                  <span>Cyclic Steam Injection (CSS)</span>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-[var(--text-secondary)] mb-1">
                    <span>Steam Volume:</span>
                    <span className="font-mono font-bold text-[var(--text-primary)]">{steamVolume} tons</span>
                  </div>
                  <input type="range" min="1000" max="5000" step="100" value={steamVolume}
                    onChange={(e) => handleParamUpdate({ steamVolumeTons: Number(e.target.value) })}
                    className="w-full accent-orange-500 cursor-pointer" />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-[var(--text-secondary)] mb-1">
                    <span>Injection Pressure:</span>
                    <span className="font-mono font-bold text-[var(--text-primary)]">{injectionPressure} bar</span>
                  </div>
                  <input type="range" min="80" max="140" step="1" value={injectionPressure}
                    onChange={(e) => handleParamUpdate({ injectionPressureBar: Number(e.target.value) })}
                    className="w-full accent-orange-500 cursor-pointer" />
                  <div className="text-[10px] text-[var(--text-muted)] flex justify-between mt-0.5">
                    <span>Min: 80 bar</span>
                    <span className="text-rose-400 font-bold">Fracture Limit: 145 bar</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-[var(--text-secondary)] mb-1">
                    <span>Soak Time:</span>
                    <span className="font-mono font-bold text-[var(--text-primary)]">{soakTime.toFixed(1)} days</span>
                  </div>
                  <input type="range" min="1" max="15" step="0.5" value={soakTime}
                    onChange={(e) => handleParamUpdate({ soakTimeDays: Number(e.target.value) })}
                    className="w-full accent-orange-500 cursor-pointer" />
                </div>
              </div>

              {/* SRP Controls */}
              <div className="space-y-3 pt-3 border-t border-[var(--border-secondary)]">
                <div className="text-xs font-semibold text-sky-400 uppercase tracking-wide flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  <span>Sucker Rod Pump (SRP)</span>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-[var(--text-secondary)] mb-1">
                    <span>Pumping Speed (SPM):</span>
                    <span className="font-mono font-bold text-[var(--text-primary)]">{spm.toFixed(1)} SPM</span>
                  </div>
                  <input type="range" min="2.0" max="11.0" step="0.2" value={spm}
                    onChange={(e) => handleParamUpdate({ spm: Number(e.target.value) })}
                    className="w-full accent-sky-500 cursor-pointer" />
                  <div className="text-[10px] text-[var(--text-muted)] flex justify-between mt-0.5">
                    <span>Min: 2.0 SPM</span>
                    <span className={spm > 6.5 ? "text-rose-400 font-bold" : "text-emerald-400"}>
                      {spm > 6.5 ? "High Floating Risk!" : "Safe Envelope"}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-[var(--text-secondary)] mb-1">
                    <span>Stroke Length:</span>
                    <span className="font-mono font-bold text-[var(--text-primary)]">{stroke}&quot;</span>
                  </div>
                  <input type="range" min="84" max="144" step="12" value={stroke}
                    onChange={(e) => handleParamUpdate({ strokeLengthIn: Number(e.target.value) })}
                    className="w-full accent-sky-500 cursor-pointer" />
                </div>
              </div>

              {/* Coupled Model Output */}
              <div className="p-3 rounded bg-[var(--bg-deep)] border border-[var(--border-secondary)] space-y-1.5 text-xs twin-output-box">
                <div className="font-bold text-[var(--text-muted)] text-[11px] uppercase">Coupled Model Output</div>
                {[
                  { label: "Predicted Viscosity:",   val: `${Math.round(viscEst)} cP`,       color: "text-orange-400" },
                  { label: "Pump Efficiency:",        val: `${effEst.toFixed(1)}%`,           color: "text-emerald-400" },
                  { label: "Peak Polished Rod Load:", val: `${rodLoadEst.toLocaleString()} lbs`, color: "text-[var(--text-primary)]" },
                  { label: "Rod Floating Risk:",      val: floatingRisk.toFixed(3),           color: floatingRisk > 0.4 ? "text-rose-400" : "text-emerald-400" },
                ].map(({ label, val, color }) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-[var(--text-muted)]">{label}</span>
                    <span className={`font-mono font-bold ${color}`}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* COMPARE MODE: Current vs Recommended table */}
          {viewMode === "compare" && (
            <div className="p-4 rounded-lg bg-[var(--bg-card)] border border-[var(--border-primary)] space-y-4">
              <div className="font-bold text-sm text-[var(--text-primary)] border-b border-[var(--border-secondary)] pb-2 flex items-center gap-2">
                CURRENT vs RECOMMENDED
              </div>

              {!hasRecommendation ? (
                <div className="p-4 rounded bg-[var(--bg-deep)] border border-dashed border-[var(--border-secondary)] text-center text-xs text-[var(--text-muted)] space-y-2">
                  <Info className="w-6 h-6 text-indigo-400/50 mx-auto" />
                  <div>No recommended operating state available.</div>
                  <div className="text-[10px]">Run the <strong className="text-orange-400">CSS Optimizer</strong>, <strong className="text-sky-400">SRP Optimizer</strong> or <strong className="text-purple-400">Joint Optimizer</strong> to generate a comparison.</div>
                </div>
              ) : (
                <>
                  {/* Parameter comparison table */}
                  <div className="space-y-1 text-xs font-mono">
                    <div className="grid grid-cols-3 text-[10px] font-bold uppercase text-[var(--text-muted)] pb-1">
                      <span>Parameter</span><span className="text-center">Current</span><span className="text-center text-orange-400">Recommended</span>
                    </div>
                    {[
                      { name: "Steam Vol.",   cur: `${currentParams.steamVolumeTons} t`,              rec: `${recParams!.steamVolumeTons} t` },
                      { name: "Inj. Press.",  cur: `${currentParams.injectionPressureBar} bar`,        rec: `${recParams!.injectionPressureBar} bar` },
                      { name: "Soak Time",    cur: `${currentParams.soakTimeDays.toFixed(1)} d`,       rec: `${recParams!.soakTimeDays.toFixed(1)} d` },
                      { name: "SPM",          cur: `${currentParams.spm.toFixed(1)}`,                  rec: `${recParams!.spm.toFixed(1)}` },
                      { name: "Stroke",       cur: `${currentParams.strokeLengthIn}"`,                 rec: `${recParams!.strokeLengthIn}"` },
                      { name: "VFD",          cur: `${currentParams.vfdHz.toFixed(1)} Hz`,             rec: `${recParams!.vfdHz.toFixed(1)} Hz` },
                    ].map(({ name, cur, rec }) => (
                      <div key={name} className="grid grid-cols-3 py-1 border-b border-[var(--border-secondary)] last:border-0">
                        <span className="text-[var(--text-muted)]">{name}</span>
                        <span className="text-center text-[var(--text-secondary)]">{cur}</span>
                        <span className="text-center text-orange-300 font-bold">{rec}</span>
                      </div>
                    ))}
                  </div>

                  {/* Performance comparison */}
                  {recState && (
                    <div className="space-y-1 pt-2 border-t border-[var(--border-secondary)]">
                      <div className="text-[10px] uppercase font-bold text-[var(--text-muted)] pb-1">Predicted Performance</div>
                      {[
                        { name: "Reservoir Temp", cur: `${currentState.reservoirTempC.toFixed(1)}°C`, rec: `${recState.reservoirTempC.toFixed(1)}°C`, improved: recState.reservoirTempC > currentState.reservoirTempC },
                        { name: "Viscosity",      cur: `${currentState.estimatedViscosityCp.toFixed(0)} cP`,  rec: `${recState.estimatedViscosityCp.toFixed(0)} cP`,  improved: recState.estimatedViscosityCp < currentState.estimatedViscosityCp },
                        { name: "Oil Prod.",      cur: `${currentState.oilProductionBpd.toFixed(1)} bpd`, rec: `${recState.oilProductionBpd.toFixed(1)} bpd`, improved: recState.oilProductionBpd > currentState.oilProductionBpd },
                        { name: "SOR",            cur: `${currentState.sor.toFixed(2)}`,              rec: `${recState.sor.toFixed(2)}`,              improved: recState.sor < currentState.sor },
                        { name: "Pump Eff.",      cur: `${currentState.pumpEfficiencyPct.toFixed(1)}%`, rec: `${recState.pumpEfficiencyPct.toFixed(1)}%`, improved: recState.pumpEfficiencyPct > currentState.pumpEfficiencyPct },
                        { name: "Float Risk",     cur: currentState.rodFloatingRisk.toFixed(3),       rec: recState.rodFloatingRisk.toFixed(3),       improved: recState.rodFloatingRisk < currentState.rodFloatingRisk },
                      ].map(({ name, cur, rec, improved }) => (
                        <div key={name} className="grid grid-cols-3 text-xs font-mono py-1 border-b border-[var(--border-secondary)] last:border-0">
                          <span className="text-[var(--text-muted)] text-[10px]">{name}</span>
                          <span className="text-center text-[var(--text-secondary)]">{cur}</span>
                          <span className={`text-center font-bold ${improved ? "text-emerald-400" : "text-rose-400"}`}>{rec}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* SRP safe window in compare mode */}
                  {srpSafeWindowResult?.feasible && (
                    <div className="p-3 rounded bg-sky-950/30 border border-sky-900/40 text-xs font-mono space-y-1">
                      <div className="text-[10px] font-bold text-sky-400 uppercase">SRP Safe Window</div>
                      <div className="flex justify-between"><span className="text-[var(--text-muted)]">SPM Range:</span><span className="text-emerald-400 font-bold">{srpSafeWindowResult.spmMin.toFixed(1)} – {srpSafeWindowResult.spmMax.toFixed(1)} SPM</span></div>
                      <div className="flex justify-between"><span className="text-[var(--text-muted)]">Optimal SPM:</span><span className="text-[var(--text-primary)] font-bold">{srpSafeWindowResult.spmOptimal.toFixed(1)} SPM</span></div>
                      <div className="flex justify-between"><span className="text-[var(--text-muted)]">VFD Optimal:</span><span className="text-[var(--text-primary)] font-bold">{srpSafeWindowResult.vfdOptimal.toFixed(1)} Hz</span></div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
