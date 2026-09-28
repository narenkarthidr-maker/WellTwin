"use client";

import React, { useState } from "react";
import { DataModeBadge } from "@/components/common/DataModeBadge";
import { ConstraintBadge } from "@/components/common/ConstraintBadge";
import { useWellTwin } from "@/context/WellTwinContext";
import {
  GitMerge,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  PlayCircle,
  RotateCcw,
  Sparkles,
  Info,
  Layers,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Activity,
  Sliders,
  Flame,
  Zap,
  Gauge,
  History,
  BarChart3,
  Check,
  ChevronRight
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";

export default function JointOptimizerPage() {
  const {
    currentParams,
    updateParams,
    resetToDefaults,
    currentState,
    isOptimizing,
    optimizationStatusMsg,
    optimizationResult,
    optimizationHistory,
    runJointOptimization,
    viewSettings,
    updateViewSettings,
  } = useWellTwin();

  const [activeTab, setActiveTab] = useState<"COMPARISON" | "MATRIX" | "CHARTS" | "HISTORY">("COMPARISON");

  const getFeasibilityBadge = (tag: string) => {
    if (tag === "RECOMMENDED") {
      return (
        <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-purple-950 text-purple-300 border border-purple-700 joint-badge-rec">
          ★ RECOMMENDED
        </span>
      );
    }
    if (tag === "CURRENT") {
      return (
        <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-slate-800 text-slate-300 border border-slate-600">
          BASELINE
        </span>
      );
    }
    if (tag === "TRADE-OFF") {
      return (
        <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-sky-950 text-sky-400 border border-sky-800 joint-badge-tradeoff">
          TRADE-OFF
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-rose-950 text-rose-400 border border-rose-800 joint-badge-infeasible">
        ✕ INFEASIBLE
      </span>
    );
  };

  // Prepare Before / After Chart Data
  const chartData = optimizationResult
    ? [
        {
          metric: "Oil Rate (bpd)",
          Current: optimizationResult.baselineState.oilProductionBpd,
          Recommended: optimizationResult.recommendedState.oilProductionBpd,
          unit: "bpd",
        },
        {
          metric: "SOR (bbl/bbl)",
          Current: optimizationResult.baselineState.sor,
          Recommended: optimizationResult.recommendedState.sor,
          unit: "SOR",
        },
        {
          metric: "Energy (kWh/bbl)",
          Current: optimizationResult.baselineState.energyKwhPerBbl,
          Recommended: optimizationResult.recommendedState.energyKwhPerBbl,
          unit: "kWh/bbl",
        },
        {
          metric: "Pump Eff. (%)",
          Current: optimizationResult.baselineState.pumpEfficiencyPct,
          Recommended: optimizationResult.recommendedState.pumpEfficiencyPct,
          unit: "%",
        },
        {
          metric: "Float Risk (×100)",
          Current: parseFloat((optimizationResult.baselineState.rodFloatingRisk * 100).toFixed(1)),
          Recommended: parseFloat((optimizationResult.recommendedState.rodFloatingRisk * 100).toFixed(1)),
          unit: "idx",
        },
      ]
    : [
        {
          metric: "Oil Rate (bpd)",
          Current: currentState.oilProductionBpd,
          Recommended: currentState.oilProductionBpd,
          unit: "bpd",
        },
        {
          metric: "SOR (bbl/bbl)",
          Current: currentState.sor,
          Recommended: currentState.sor,
          unit: "SOR",
        },
        {
          metric: "Energy (kWh/bbl)",
          Current: currentState.energyKwhPerBbl,
          Recommended: currentState.energyKwhPerBbl,
          unit: "kWh/bbl",
        },
        {
          metric: "Pump Eff. (%)",
          Current: currentState.pumpEfficiencyPct,
          Recommended: currentState.pumpEfficiencyPct,
          unit: "%",
        },
        {
          metric: "Float Risk (×100)",
          Current: parseFloat((currentState.rodFloatingRisk * 100).toFixed(1)),
          Recommended: parseFloat((currentState.rodFloatingRisk * 100).toFixed(1)),
          unit: "idx",
        },
      ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-[#182645]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <GitMerge className="w-6 h-6 text-purple-400" />
              Joint CSS + SRP Optimizer
            </h1>
            <DataModeBadge />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Physics-Guided Coupled Optimization Engine for Thermal Stimulation & Artificial Lift Mechanics
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Working Reset Button */}
          <button
            onClick={resetToDefaults}
            disabled={isOptimizing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-[#131d35] hover:bg-[#1c2c50] text-slate-300 text-xs font-semibold border border-[#23355c] transition disabled:opacity-50"
            title="Reset all parameters and optimization results to baseline"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset</span>
          </button>

          {/* Working Solve Joint Optimization Button */}
          <button
            onClick={runJointOptimization}
            disabled={isOptimizing}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md transition disabled:opacity-50"
          >
            {isOptimizing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{optimizationStatusMsg || "Evaluating feasible CSS + SRP operating windows..."}</span>
              </>
            ) : (
              <>
                <PlayCircle className="w-4 h-4" />
                <span>Solve Joint Optimization</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* CORE INNOVATION STATEMENT */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-[#1f1338] via-[#15122e] to-[#0c1833] border-2 border-purple-500/60 shadow-lg relative overflow-hidden">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center text-white shrink-0 shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="text-[11px] font-mono uppercase text-purple-400 font-bold tracking-widest">
              Core Engineering Differentiator
            </div>
            <p className="text-sm md:text-base font-semibold text-white leading-relaxed">
              &ldquo;We do not optimize CSS and SRP independently.
              We model how thermal reservoir behavior affects heavy-oil viscosity,
              how viscosity affects artificial-lift performance,
              and then jointly optimize CSS and SRP within engineering constraints.&rdquo;
            </p>
          </div>
        </div>
      </div>

      {/* INTERACTIVE OPERATING CONTROLS & CURRENT WELL STATE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT COLUMN: CSS PARAMETERS & SRP PARAMETERS (col-span-7) */}
        <div className="lg:col-span-7 space-y-4">
          {/* CSS Parameters Panel */}
          <div className="p-4 rounded-xl bg-[#0e162a] border border-[#1a2642] space-y-4">
            <div className="flex items-center justify-between border-b border-[#1b2848] pb-2">
              <span className="text-xs font-bold text-orange-400 uppercase tracking-wide flex items-center gap-1.5">
                <Flame className="w-4 h-4" />
                CSS (Cyclic Steam Stimulation) Parameters
              </span>
              <span className="text-[10px] font-mono text-slate-400">Thermal Stimulation Controls</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Steam Volume */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Steam Volume:</span>
                  <span className="font-mono font-bold text-orange-400">{currentParams.steamVolumeTons} tons</span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="4500"
                  step="50"
                  value={currentParams.steamVolumeTons}
                  onChange={(e) => updateParams({ steamVolumeTons: Number(e.target.value) })}
                  className="w-full accent-orange-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>1,000t</span>
                  <span>4,500t</span>
                </div>
              </div>

              {/* Injection Pressure */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Injection Pressure:</span>
                  <span className="font-mono font-bold text-orange-400">{currentParams.injectionPressureBar} bar</span>
                </div>
                <input
                  type="range"
                  min="70"
                  max="155"
                  step="1"
                  value={currentParams.injectionPressureBar}
                  onChange={(e) => updateParams({ injectionPressureBar: Number(e.target.value) })}
                  className="w-full accent-orange-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>70 bar</span>
                  <span className={currentParams.injectionPressureBar > 145 ? "text-rose-400 font-bold" : "text-slate-500"}>
                    Cap: 145 bar
                  </span>
                </div>
              </div>

              {/* Soak Time */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Soak Time:</span>
                  <span className="font-mono font-bold text-orange-400">{currentParams.soakTimeDays.toFixed(1)} days</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="14.0"
                  step="0.5"
                  value={currentParams.soakTimeDays}
                  onChange={(e) => updateParams({ soakTimeDays: Number(e.target.value) })}
                  className="w-full accent-orange-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>1.0 d</span>
                  <span>14.0 d</span>
                </div>
              </div>

              {/* Production Cut-off */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Production Cut-off:</span>
                  <span className="font-mono font-bold text-orange-400">{currentParams.productionCutoffBpd.toFixed(1)} bpd</span>
                </div>
                <input
                  type="range"
                  min="5.0"
                  max="30.0"
                  step="1.0"
                  value={currentParams.productionCutoffBpd}
                  onChange={(e) => updateParams({ productionCutoffBpd: Number(e.target.value) })}
                  className="w-full accent-orange-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>5.0 bpd</span>
                  <span>30.0 bpd</span>
                </div>
              </div>
            </div>
          </div>

          {/* SRP Parameters Panel */}
          <div className="p-4 rounded-xl bg-[#0e162a] border border-[#1a2642] space-y-4">
            <div className="flex items-center justify-between border-b border-[#1b2848] pb-2">
              <span className="text-xs font-bold text-sky-400 uppercase tracking-wide flex items-center gap-1.5">
                <Activity className="w-4 h-4" />
                SRP (Sucker Rod Pump) Parameters
              </span>
              <span className="text-[10px] font-mono text-slate-400">Artificial Lift Mechanics</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Stroke Length */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Stroke Length:</span>
                  <span className="font-mono font-bold text-sky-400">{currentParams.strokeLengthIn}&quot;</span>
                </div>
                <input
                  type="range"
                  min="84"
                  max="168"
                  step="12"
                  value={currentParams.strokeLengthIn}
                  onChange={(e) => updateParams({ strokeLengthIn: Number(e.target.value) })}
                  className="w-full accent-sky-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>84&quot;</span>
                  <span>168&quot;</span>
                </div>
              </div>

              {/* SPM */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Pumping Speed:</span>
                  <span className="font-mono font-bold text-sky-400">{currentParams.spm.toFixed(1)} SPM</span>
                </div>
                <input
                  type="range"
                  min="2.0"
                  max="10.0"
                  step="0.2"
                  value={currentParams.spm}
                  onChange={(e) => updateParams({ spm: Number(e.target.value) })}
                  className="w-full accent-sky-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>2.0 SPM</span>
                  <span className={currentParams.spm > 6.5 ? "text-amber-400 font-bold" : "text-slate-500"}>
                    Limit: 8.5
                  </span>
                </div>
              </div>

              {/* VFD Setting */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">VFD Inverter:</span>
                  <span className="font-mono font-bold text-sky-400">{currentParams.vfdHz.toFixed(1)} Hz</span>
                </div>
                <input
                  type="range"
                  min="25.0"
                  max="60.0"
                  step="1.0"
                  value={currentParams.vfdHz}
                  onChange={(e) => updateParams({ vfdHz: Number(e.target.value) })}
                  className="w-full accent-sky-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>25 Hz</span>
                  <span>60 Hz</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CURRENT WELL STATE & MECHANICAL RISK (col-span-5) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 rounded-xl bg-[#0e162a] border border-[#1a2642] space-y-3.5">
            <div className="flex items-center justify-between border-b border-[#1b2848] pb-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-emerald-400" />
                Current Coupled Well State
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                LIVE PHYSICS COUPLING
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-[#090e1c] border border-[#1b284a]">
                <div className="text-[10px] text-slate-400">RESERVOIR TEMP</div>
                <div className="text-sm font-bold text-orange-400">{currentState.reservoirTempC}°C</div>
                <div className="text-[9px] text-slate-500">Heated Sandface</div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#090e1c] border border-[#1b284a]">
                <div className="text-[10px] text-slate-400">EST. VISCOSITY</div>
                <div className="text-sm font-bold text-amber-300">{currentState.estimatedViscosityCp} cP</div>
                <div className="text-[9px] text-slate-500">Arrhenius Model</div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#090e1c] border border-[#1b284a]">
                <div className="text-[10px] text-slate-400">OIL PRODUCTION</div>
                <div className="text-sm font-bold text-emerald-400">{currentState.oilProductionBpd} bpd</div>
                <div className="text-[9px] text-slate-500">Net Surface Recovery</div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#090e1c] border border-[#1b284a]">
                <div className="text-[10px] text-slate-400">STEAM-OIL RATIO</div>
                <div className="text-sm font-bold text-sky-300">{currentState.sor}</div>
                <div className="text-[9px] text-slate-500">Cycle Thermal Metric</div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#090e1c] border border-[#1b284a]">
                <div className="text-[10px] text-slate-400">PUMP EFFICIENCY</div>
                <div className="text-sm font-bold text-emerald-300">{currentState.pumpEfficiencyPct}%</div>
                <div className="text-[9px] text-slate-500">Volumetric Fillage</div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#090e1c] border border-[#1b284a]">
                <div className="text-[10px] text-slate-400">ENERGY / BARREL</div>
                <div className="text-sm font-bold text-amber-400">{currentState.energyKwhPerBbl} kWh/bbl</div>
                <div className="text-[9px] text-slate-500">Lifting Intensity</div>
              </div>
            </div>

            {/* MECHANICAL RISK PARAMETERS */}
            <div className="pt-2 border-t border-[#1b2848] space-y-2">
              <div className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
                <span>MECHANICAL RISK AUDIT</span>
                <span className="text-[10px] text-slate-400 font-mono">Limit: 0.40</span>
              </div>

              {/* Rod Floating Risk */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-slate-400">Rod Floating Risk:</span>
                  <span className={`font-bold ${currentState.rodFloatingRisk > 0.4 ? "text-rose-400" : currentState.rodFloatingRisk > 0.25 ? "text-amber-400" : "text-emerald-400"}`}>
                    {currentState.rodFloatingRisk.toFixed(3)}
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#162238] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      currentState.rodFloatingRisk > 0.4 ? "bg-rose-500" : currentState.rodFloatingRisk > 0.25 ? "bg-amber-500" : "bg-emerald-500"
                    }`}
                    style={{ width: `${Math.min(100, currentState.rodFloatingRisk * 100)}%` }}
                  />
                </div>
              </div>

              {/* Impact Loading Risk */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-slate-400">Impact Loading Risk:</span>
                  <span className="font-bold text-slate-200">
                    {currentState.impactLoadRisk.toFixed(3)}
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#162238] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-sky-500 transition-all duration-300"
                    style={{ width: `${Math.min(100, currentState.impactLoadRisk * 100)}%` }}
                  />
                </div>
              </div>

              {/* Pump Unsetting Risk */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-slate-400">Pump Unsetting Risk:</span>
                  <span className="font-bold text-slate-200">
                    {currentState.pumpUnsettingRisk.toFixed(3)}
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#162238] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-indigo-500 transition-all duration-300"
                    style={{ width: `${Math.min(100, currentState.pumpUnsettingRisk * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* OPTIMIZATION RESULT TABS & MAIN DISPLAY */}
      {optimizationResult ? (
        <div className="space-y-5">
          {/* Tab Navigation Bar */}
          <div className="flex items-center justify-between border-b border-[#1b2848] pb-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("COMPARISON")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeTab === "COMPARISON"
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-[#131d35]"
                }`}
              >
                Current vs Recommended
              </button>
              <button
                onClick={() => setActiveTab("CHARTS")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                  activeTab === "CHARTS"
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-[#131d35]"
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Before / After Chart</span>
              </button>
              <button
                onClick={() => setActiveTab("MATRIX")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeTab === "MATRIX"
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-[#131d35]"
                }`}
              >
                Candidate Matrix ({optimizationResult.candidates.length})
              </button>
              <button
                onClick={() => setActiveTab("HISTORY")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                  activeTab === "HISTORY"
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-[#131d35]"
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>Run History ({optimizationHistory.length})</span>
              </button>
            </div>

            <div className="text-[11px] font-mono text-purple-300 font-bold hidden sm:block">
              {optimizationResult.runId} • Objective Score: {optimizationResult.objectiveScore.toFixed(1)} / 100
            </div>
          </div>

          {/* TAB 1: CURRENT VS RECOMMENDED COMPARISON TABLES */}
          {activeTab === "COMPARISON" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Operating Parameters: Current vs Recommended */}
                <div className="p-4 rounded-xl bg-[#0e162a] border border-[#1a2642] space-y-3">
                  <div className="flex items-center justify-between border-b border-[#1b2848] pb-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Sliders className="w-4 h-4 text-purple-400" />
                      OPERATING PARAMETERS
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">CSS + SRP Input Controls</span>
                  </div>

                  <div className="divide-y divide-[#15213d] text-xs font-mono">
                    <div className="py-2 flex items-center justify-between">
                      <span className="text-slate-400">Steam Volume:</span>
                      <div className="flex items-center gap-2 font-bold">
                        <span className="text-slate-300">{optimizationResult.baselineParams.steamVolumeTons}t</span>
                        <ArrowRight className="w-3.5 h-3.5 text-purple-400" />
                        <span className="text-white">{optimizationResult.recommendedParams.steamVolumeTons}t</span>
                      </div>
                    </div>

                    <div className="py-2 flex items-center justify-between">
                      <span className="text-slate-400">Injection Pressure:</span>
                      <div className="flex items-center gap-2 font-bold">
                        <span className="text-slate-300">{optimizationResult.baselineParams.injectionPressureBar} bar</span>
                        <ArrowRight className="w-3.5 h-3.5 text-purple-400" />
                        <span className="text-white">{optimizationResult.recommendedParams.injectionPressureBar} bar</span>
                      </div>
                    </div>

                    <div className="py-2 flex items-center justify-between">
                      <span className="text-slate-400">Soak Time:</span>
                      <div className="flex items-center gap-2 font-bold">
                        <span className="text-slate-300">{optimizationResult.baselineParams.soakTimeDays.toFixed(1)} d</span>
                        <ArrowRight className="w-3.5 h-3.5 text-purple-400" />
                        <span className="text-white">{optimizationResult.recommendedParams.soakTimeDays.toFixed(1)} d</span>
                      </div>
                    </div>

                    <div className="py-2 flex items-center justify-between">
                      <span className="text-slate-400">Stroke Length:</span>
                      <div className="flex items-center gap-2 font-bold">
                        <span className="text-slate-300">{optimizationResult.baselineParams.strokeLengthIn}&quot;</span>
                        <ArrowRight className="w-3.5 h-3.5 text-purple-400" />
                        <span className="text-white">{optimizationResult.recommendedParams.strokeLengthIn}&quot;</span>
                      </div>
                    </div>

                    <div className="py-2 flex items-center justify-between">
                      <span className="text-slate-400">Pumping Speed (SPM):</span>
                      <div className="flex items-center gap-2 font-bold">
                        <span className="text-slate-300">{optimizationResult.baselineParams.spm.toFixed(1)} SPM</span>
                        <ArrowRight className="w-3.5 h-3.5 text-purple-400" />
                        <span className="text-white">{optimizationResult.recommendedParams.spm.toFixed(1)} SPM</span>
                      </div>
                    </div>

                    <div className="py-2 flex items-center justify-between">
                      <span className="text-slate-400">VFD Inverter Frequency:</span>
                      <div className="flex items-center gap-2 font-bold">
                        <span className="text-slate-300">{optimizationResult.baselineParams.vfdHz.toFixed(1)} Hz</span>
                        <ArrowRight className="w-3.5 h-3.5 text-purple-400" />
                        <span className="text-white">{optimizationResult.recommendedParams.vfdHz.toFixed(1)} Hz</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Predicted Performance & Risk Deltas */}
                <div className="p-4 rounded-xl bg-[#0e162a] border border-[#1a2642] space-y-3">
                  <div className="flex items-center justify-between border-b border-[#1b2848] pb-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      PREDICTED PERFORMANCE & RISK
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">Model Predictions & Deltas</span>
                  </div>

                  <div className="divide-y divide-[#15213d] text-xs font-mono">
                    <div className="py-2 flex items-center justify-between">
                      <span className="text-slate-400">Oil Production:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-300">{optimizationResult.baselineState.oilProductionBpd} bpd</span>
                        <ArrowRight className="w-3 h-3 text-slate-500" />
                        <span className="font-bold text-emerald-400">{optimizationResult.recommendedState.oilProductionBpd} bpd</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800">
                          +{optimizationResult.deltaProductionPct}%
                        </span>
                      </div>
                    </div>

                    <div className="py-2 flex items-center justify-between">
                      <span className="text-slate-400">Steam-Oil Ratio (SOR):</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-300">{optimizationResult.baselineState.sor}</span>
                        <ArrowRight className="w-3 h-3 text-slate-500" />
                        <span className="font-bold text-sky-300">{optimizationResult.recommendedState.sor}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] border ${
                          optimizationResult.deltaSorPct <= 0 ? "bg-emerald-950 text-emerald-300 border-emerald-800" : "bg-amber-950 text-amber-300 border-amber-800"
                        }`}>
                          {optimizationResult.deltaSorPct > 0 ? "+" : ""}{optimizationResult.deltaSorPct}%
                        </span>
                      </div>
                    </div>

                    <div className="py-2 flex items-center justify-between">
                      <span className="text-slate-400">Pump Efficiency:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-300">{optimizationResult.baselineState.pumpEfficiencyPct}%</span>
                        <ArrowRight className="w-3 h-3 text-slate-500" />
                        <span className="font-bold text-emerald-400">{optimizationResult.recommendedState.pumpEfficiencyPct}%</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800">
                          +{optimizationResult.deltaEfficiencyPct}%
                        </span>
                      </div>
                    </div>

                    <div className="py-2 flex items-center justify-between">
                      <span className="text-slate-400">Energy / Barrel:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-300">{optimizationResult.baselineState.energyKwhPerBbl}</span>
                        <ArrowRight className="w-3 h-3 text-slate-500" />
                        <span className="font-bold text-amber-300">{optimizationResult.recommendedState.energyKwhPerBbl} kWh</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">
                          {optimizationResult.deltaEnergyPct > 0 ? "+" : ""}{optimizationResult.deltaEnergyPct}%
                        </span>
                      </div>
                    </div>

                    <div className="py-2 flex items-center justify-between">
                      <span className="text-slate-400">Rod Floating Risk:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-300">{optimizationResult.baselineState.rodFloatingRisk.toFixed(2)}</span>
                        <ArrowRight className="w-3 h-3 text-slate-500" />
                        <span className="font-bold text-emerald-400">{optimizationResult.recommendedState.rodFloatingRisk.toFixed(2)}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800">
                          Safe
                        </span>
                      </div>
                    </div>

                    <div className="py-2 flex items-center justify-between">
                      <span className="text-slate-400">Impact Loading Risk:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-300">{optimizationResult.baselineState.impactLoadRisk.toFixed(2)}</span>
                        <ArrowRight className="w-3 h-3 text-slate-500" />
                        <span className="font-bold text-emerald-400">{optimizationResult.recommendedState.impactLoadRisk.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="py-2 flex items-center justify-between">
                      <span className="text-slate-400">Pump Unsetting Risk:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-300">{optimizationResult.baselineState.pumpUnsettingRisk.toFixed(2)}</span>
                        <ArrowRight className="w-3 h-3 text-slate-500" />
                        <span className="font-bold text-emerald-400">{optimizationResult.recommendedState.pumpUnsettingRisk.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic Optimization Rationale & Explainable AI */}
              <div className="p-4 rounded-xl bg-[#0e162a] border border-[#1a2642] space-y-3">
                <div className="flex items-center justify-between border-b border-[#1b2848] pb-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    OPTIMIZATION RATIONALE & CONTRIBUTING FACTORS
                  </span>
                  <span className="text-[10px] font-mono text-purple-300 font-bold">
                    Physics-Grounded Recommendation
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {optimizationResult.explainableFactors.map((f) => (
                    <div key={f.factor} className="p-3 rounded-lg bg-[#090e1c] border border-[#1b2848] text-xs joint-factor-card">
                      <div className="flex items-center justify-between font-semibold mb-1">
                        <span className="text-slate-200">{f.factor}</span>
                        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                          f.impact === "HIGH IMPACT"
                            ? "bg-purple-950 text-purple-300 border border-purple-800"
                            : "bg-sky-950 text-sky-300 border border-sky-800"
                        }`}>
                          {f.impact}
                        </span>
                      </div>
                      <div className="text-slate-400 leading-relaxed font-sans">{f.note}</div>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-lg bg-purple-950/30 border border-purple-800/40 text-xs text-purple-200 leading-relaxed font-sans joint-rationale-box">
                  <strong className="text-white">Engineering Decision Rationale: </strong>
                  {optimizationResult.whyRecommended}
                </div>
              </div>

              {/* Engineering Constraint Engine Audit Panel */}
              <div className="p-4 rounded-xl bg-[#0e162a] border border-[#1a2642] space-y-3">
                <div className="flex items-center justify-between border-b border-[#1b2848] pb-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    DEMO / CONFIGURABLE ENGINEERING CONSTRAINTS (6 GATES)
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                    ALL CONSTRAINTS PASSED
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {optimizationResult.constraints.map((c) => (
                    <div
                      key={c.name}
                      className="p-3 rounded-lg bg-[#090e1c] border border-[#1b284a] flex flex-col justify-between text-xs font-mono joint-constraint-card"
                    >
                      <div className="flex items-start justify-between gap-1">
                        <span className="font-semibold text-slate-200">{c.name}</span>
                        {c.status === "PASSED" ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        )}
                      </div>
                      <div className="mt-2 flex items-baseline justify-between text-[11px]">
                        <span className="text-slate-400">Candidate Value:</span>
                        <span className="font-bold text-white">{c.actual}</span>
                      </div>
                      <div className="flex items-baseline justify-between text-[11px] text-slate-400 border-t border-[#14203d] pt-1 mt-1">
                        <span>Configured Limit:</span>
                        <span className="text-sky-400">{c.limit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BEFORE / AFTER CHARTS */}
          {activeTab === "CHARTS" && (
            <div className="p-4 rounded-xl bg-[#0e162a] border border-[#1a2642] space-y-4">
              <div className="flex items-center justify-between border-b border-[#1b2848] pb-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-sky-400" />
                  BEFORE VS RECOMMENDED PERFORMANCE BENCHMARK
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Updated on each optimization run
                </span>
              </div>

              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1c2c4c" />
                    <XAxis dataKey="metric" stroke="#94a3b8" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                    <YAxis stroke="#94a3b8" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--surface, #0b1326)",
                        borderColor: "var(--border, #22355e)",
                        borderRadius: "8px",
                        color: "var(--text-primary, #fff)",
                        fontFamily: "monospace",
                        fontSize: "12px",
                      }}
                    />
                    <Legend wrapperStyle={{ paddingTop: "10px", fontSize: "12px" }} />
                    <Bar dataKey="Current" fill="#64748b" radius={[4, 4, 0, 0]} name="Current Baseline" />
                    <Bar dataKey="Recommended" fill="#a855f7" radius={[4, 4, 0, 0]} name="Recommended Point" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* TAB 3: CANDIDATE SOLUTIONS MATRIX */}
          {activeTab === "MATRIX" && (
            <div className="p-4 rounded-xl bg-[#0e162a] border border-[#1a2642] space-y-3">
              <div className="flex items-center justify-between border-b border-[#1b2848] pb-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  CANDIDATE PERMUTATION EVALUATION MATRIX
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {optimizationResult.candidates.filter((c) => c.feasible).length} Feasible • {optimizationResult.candidates.filter((c) => !c.feasible).length} Rejected
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-[#1c2a4a] text-slate-400">
                      <th className="py-2 px-2.5">ID & NAME</th>
                      <th className="py-2 px-2.5">STATUS</th>
                      <th className="py-2 px-2.5">CSS STEAM / PRESS</th>
                      <th className="py-2 px-2.5">SRP STROKE / SPM</th>
                      <th className="py-2 px-2.5">OIL RATE</th>
                      <th className="py-2 px-2.5">SOR</th>
                      <th className="py-2 px-2.5">EFFICIENCY</th>
                      <th className="py-2 px-2.5">SCORE</th>
                      <th className="py-2 px-2.5">AUDIT NOTE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#15213d] text-slate-300">
                    {optimizationResult.candidates.map((cand) => (
                      <tr
                        key={cand.id}
                        className={`transition ${
                          cand.tag === "RECOMMENDED"
                            ? "bg-purple-950/30 hover:bg-purple-950/40"
                            : cand.feasible
                            ? "hover:bg-[#121c38]"
                            : "bg-rose-950/15 hover:bg-rose-950/25 text-rose-300/80"
                        }`}
                      >
                        <td className="py-2.5 px-2.5 font-bold">
                          <div className={cand.tag === "RECOMMENDED" ? "text-purple-300" : "text-white"}>{cand.id}</div>
                          <div className="text-[10px] text-slate-400 font-sans font-normal">{cand.name}</div>
                        </td>
                        <td className="py-2.5 px-2.5">{getFeasibilityBadge(cand.tag)}</td>
                        <td className="py-2.5 px-2.5">
                          {cand.params.steamVolumeTons}t @ {cand.params.injectionPressureBar}bar
                        </td>
                        <td className="py-2.5 px-2.5">
                          {cand.params.strokeLengthIn}&quot; @ {cand.params.spm} SPM
                        </td>
                        <td className="py-2.5 px-2.5 font-bold text-emerald-400">
                          {cand.feasible ? `${cand.state.oilProductionBpd} bpd` : "—"}
                        </td>
                        <td className="py-2.5 px-2.5">
                          {cand.feasible ? cand.state.sor.toFixed(2) : "—"}
                        </td>
                        <td className="py-2.5 px-2.5">
                          {cand.feasible ? `${cand.state.pumpEfficiencyPct}%` : "—"}
                        </td>
                        <td className="py-2.5 px-2.5 font-mono font-bold text-purple-300">
                          {cand.feasible ? cand.score.toFixed(1) : "0.0"}
                        </td>
                        <td className="py-2.5 px-2.5 text-[11px] font-sans">
                          {cand.feasible ? (
                            <span className="text-emerald-400 font-semibold">Passed all active constraints</span>
                          ) : (
                            <span className="text-rose-400 font-semibold">{cand.rejectionReason}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: OPTIMIZATION RUN HISTORY */}
          {activeTab === "HISTORY" && (
            <div className="p-4 rounded-xl bg-[#0e162a] border border-[#1a2642] space-y-3">
              <div className="flex items-center justify-between border-b border-[#1b2848] pb-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <History className="w-4 h-4 text-purple-400" />
                  LOCAL OPTIMIZATION RUN HISTORY
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {optimizationHistory.length} total runs logged
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-[#1c2a4a] text-slate-400">
                      <th className="py-2 px-2.5">RUN ID</th>
                      <th className="py-2 px-2.5">TIMESTAMP</th>
                      <th className="py-2 px-2.5">BASELINE CONDITION</th>
                      <th className="py-2 px-2.5">RECOMMENDED POINT</th>
                      <th className="py-2 px-2.5">PROD BENEFIT</th>
                      <th className="py-2 px-2.5">OBJECTIVE SCORE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#15213d] text-slate-300">
                    {optimizationHistory.map((run) => (
                      <tr key={run.runId} className="hover:bg-[#121c38] transition">
                        <td className="py-2.5 px-2.5 font-bold text-purple-300">{run.runId}</td>
                        <td className="py-2.5 px-2.5 text-slate-400">{run.timestamp}</td>
                        <td className="py-2.5 px-2.5">
                          {run.baselineParams.steamVolumeTons}t, {run.baselineParams.spm} SPM ({run.baselineState.oilProductionBpd} bpd)
                        </td>
                        <td className="py-2.5 px-2.5 text-emerald-400 font-bold">
                          {run.recommendedParams.steamVolumeTons}t, {run.recommendedParams.spm} SPM ({run.recommendedState.oilProductionBpd} bpd)
                        </td>
                        <td className="py-2.5 px-2.5 text-emerald-400 font-bold">
                          +{run.deltaProductionPct}%
                        </td>
                        <td className="py-2.5 px-2.5 font-mono text-white font-bold">
                          {run.objectiveScore.toFixed(1)} / 100
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Empty State / Prompt to Solve */
        <div className="p-8 rounded-xl bg-[#0e162a] border border-[#1a2642] text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-purple-950/60 border border-purple-800 flex items-center justify-center mx-auto text-purple-400">
            <GitMerge className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No Joint Optimization Executed Yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Adjust the CSS and SRP operating controls above or click &ldquo;Solve Joint Optimization&rdquo; to evaluate feasible operating envelopes against hard engineering constraints.
          </p>
          <button
            onClick={runJointOptimization}
            disabled={isOptimizing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow transition"
          >
            <PlayCircle className="w-4 h-4" />
            <span>Run Joint Optimizer Now</span>
          </button>
        </div>
      )}
    </div>
  );
}
