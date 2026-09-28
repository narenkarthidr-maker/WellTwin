"use client";

import React, { useState, useEffect } from "react";
import { DataModeBadge } from "@/components/common/DataModeBadge";
import { fetchScenarioComparison, runCustomSimulation } from "@/lib/api";
import { ScenarioComparison, SimulationResponse } from "@/types/simulation";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from "recharts";
import {
  Cpu,
  Sparkles,
  Sliders,
  PlayCircle,
  TrendingUp,
  CheckCircle2,
  Info,
  Layers,
  ArrowRight
} from "lucide-react";

export default function SimulatorPage() {
  const [comparison, setComparison] = useState<ScenarioComparison | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeChartMetric, setActiveChartMetric] = useState<"oil" | "temp" | "visc" | "sor" | "energy">("oil");

  // Custom Scenario Inputs
  const [customSteam, setCustomSteam] = useState<number>(3100);
  const [customPressure, setCustomPressure] = useState<number>(118);
  const [customSoak, setCustomSoak] = useState<number>(7.0);
  const [customStroke, setCustomStroke] = useState<number>(132);
  const [customSpm, setCustomSpm] = useState<number>(5.4);
  const [customVfd, setCustomVfd] = useState<number>(46.0);
  const [simulating, setSimulating] = useState<boolean>(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchScenarioComparison();
        setComparison(data);
      } catch (err) {
        console.error("Failed to load scenario comparison", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleRunCustomSimulation = async () => {
    setSimulating(true);
    try {
      const customRes = await runCustomSimulation({
        scenario_name: "Scenario C: Custom Parameter Set",
        steam_volume_tons: customSteam,
        injection_pressure_bar: customPressure,
        soak_time_days: customSoak,
        stroke_length_in: customStroke,
        spm: customSpm,
        vfd_speed_hz: customVfd,
        simulation_days: 90
      });

      setComparison((prev) => {
        if (!prev) return prev;
        const updated = [...prev.scenarios];
        updated[2] = customRes;
        return {
          ...prev,
          scenarios: updated
        };
      });
    } catch (err) {
      console.error("Custom simulation error", err);
    } finally {
      setSimulating(false);
    }
  };

  // Combine time series for multi-line comparison chart
  const combinedTimeSeries = React.useMemo(() => {
    if (!comparison || !comparison.scenarios || comparison.scenarios.length === 0) return [];
    const scenA = comparison.scenarios[0]?.time_series || [];
    const scenB = comparison.scenarios[1]?.time_series || [];
    const scenC = comparison.scenarios[2]?.time_series || [];

    return scenA.map((pointA, idx) => {
      const pointB = scenB[idx] || {};
      const pointC = scenC[idx] || {};
      return {
        day: pointA.day,
        oil_a: pointA.oil_rate_bpd,
        oil_b: pointB.oil_rate_bpd,
        oil_c: pointC.oil_rate_bpd,
        temp_a: pointA.reservoir_temp_c,
        temp_b: pointB.reservoir_temp_c,
        temp_c: pointC.reservoir_temp_c,
        visc_a: pointA.viscosity_cp,
        visc_b: pointB.viscosity_cp,
        visc_c: pointC.viscosity_cp,
        sor_a: pointA.sor,
        sor_b: pointB.sor,
        sor_c: pointC.sor,
        energy_a: pointA.energy_kwh,
        energy_b: pointB.energy_kwh,
        energy_c: pointC.energy_kwh,
      };
    });
  }, [comparison]);

  const metricConfig = {
    oil: { title: "Oil Production (bpd)", keyA: "oil_a", keyB: "oil_b", keyC: "oil_c", unit: "bpd" },
    temp: { title: "Reservoir Temperature (°C)", keyA: "temp_a", keyB: "temp_b", keyC: "temp_c", unit: "°C" },
    visc: { title: "Estimated Viscosity (cP)", keyA: "visc_a", keyB: "visc_b", keyC: "visc_c", unit: "cP" },
    sor: { title: "Steam-Oil Ratio (SOR)", keyA: "sor_a", keyB: "sor_b", keyC: "sor_c", unit: "bbl/bbl" },
    energy: { title: "Lifting Energy (kWh/bbl)", keyA: "energy_a", keyB: "energy_b", keyC: "energy_c", unit: "kWh" },
  };

  const currentMetric = metricConfig[activeChartMetric];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-[#182645]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Cpu className="w-6 h-6 text-sky-400" />
              What-If Operating Simulator
            </h1>
            <DataModeBadge />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Simulate and compare multi-month production dynamics across candidate operating strategies
          </p>
        </div>

        {/* Mandatory Explicit Disclaimer Badge */}
        <div className="px-3 py-1.5 rounded-md bg-purple-950/70 border border-purple-700/60 text-purple-300 font-mono text-[11px] font-bold">
          SIMULATED PREDICTION • NOT ACTUAL FIELD MEASUREMENT
        </div>
      </div>

      {/* Scenario Comparison Cards: Side-by-Side */}
      {comparison && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {comparison.scenarios.map((scen, idx) => {
            const isWinner = idx === 1;
            return (
              <div
                key={scen.scenario_name}
                className={`p-4 rounded-lg bg-[#0e162a] border flex flex-col justify-between transition ${
                  isWinner ? "border-purple-500/70 shadow-lg shadow-purple-950/30" : "border-[#1a2642]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-[#1b2848]">
                    <span className="font-bold text-xs text-white truncate">{scen.scenario_name}</span>
                    {isWinner && (
                      <span className="px-2 py-0.5 rounded bg-purple-900 text-purple-300 font-mono text-[9px] font-bold">
                        ★ OPTIMAL
                      </span>
                    )}
                  </div>

                  <div className="mt-3 space-y-2 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Avg Oil Rate:</span>
                      <span className="font-bold text-white">{scen.metrics.oil_production_bpd} bpd</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Cumulative SOR:</span>
                      <span className="font-bold text-purple-300">{scen.metrics.sor.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Pump Efficiency:</span>
                      <span className="font-bold text-emerald-400">{scen.metrics.pump_efficiency_pct.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Lifting Energy:</span>
                      <span className="font-bold text-amber-300">{scen.metrics.energy_kwh_per_bbl} kWh/bbl</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Peak Rod Load:</span>
                      <span className="font-bold text-slate-200">{scen.metrics.rod_load_lbs.toLocaleString()} lbs</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Mechanical Risk:</span>
                      <span className={`font-bold ${scen.metrics.mechanical_risk_pct > 30 ? "text-rose-400" : "text-emerald-400"}`}>
                        {scen.metrics.mechanical_risk_pct.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-[#1b2848] text-[10px] text-slate-400 font-mono flex items-center justify-between">
                  <span>90-Day Simulation</span>
                  <span className="text-sky-400">Thermal Drawdown: 72d</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Multi-Parameter Comparative Time-Series Chart */}
      <div className="p-4 rounded-lg bg-[#0e162a] border border-[#1a2642] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1b2848] pb-3">
          <div>
            <div className="text-sm font-bold text-white">
              90-DAY DYNAMIC TRAJECTORY SIMULATION
            </div>
            <div className="text-xs text-slate-400">
              Compare temporal response between Baseline, Joint Optimized, and Custom scenarios
            </div>
          </div>

          {/* Metric Selector Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            {(["oil", "temp", "visc", "sor", "energy"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setActiveChartMetric(m)}
                className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition ${
                  activeChartMetric === m
                    ? "bg-sky-600 text-white font-bold"
                    : "bg-[#14203a] text-slate-400 hover:text-slate-200 border border-[#203258]"
                }`}
              >
                {metricConfig[m].title.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>

        {/* The Recharts Multi-Line Comparison */}
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={combinedTimeSeries} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#16223d" />
              <XAxis dataKey="day" stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 11 }} label={{ value: "Production Days Elapsed", position: "insideBottomRight", offset: -5, fill: "#64748b", fontSize: 10 }} />
              <YAxis stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 11 }} domain={["auto", "auto"]} label={{ value: currentMetric.unit, angle: -90, position: "insideLeft", fill: "#64748b", fontSize: 10 }} />
              <Tooltip
                contentStyle={{ backgroundColor: "var(--surface, #0c1426)", borderColor: "var(--border, #24355a)", borderRadius: "0.375rem", fontSize: "11px", color: "var(--text-primary, #f8fafc)" }}
                formatter={(val: any, name: any) => {
                  if (name === currentMetric.keyA) return [`${Number(val).toFixed(1)} ${currentMetric.unit}`, "Scenario A (Baseline)"];
                  if (name === currentMetric.keyB) return [`${Number(val).toFixed(1)} ${currentMetric.unit}`, "Scenario B (Optimized)"];
                  if (name === currentMetric.keyC) return [`${Number(val).toFixed(1)} ${currentMetric.unit}`, "Scenario C (Custom)"];
                  return [val, name];
                }}
                labelFormatter={(day) => `Day ${day} Post-CSS`}
              />
              <Legend
                formatter={(value) => {
                  if (value === currentMetric.keyA) return "Scenario A: Baseline (Grey)";
                  if (value === currentMetric.keyB) return "Scenario B: Joint Optimized (Purple)";
                  if (value === currentMetric.keyC) return "Scenario C: Custom (Sky Blue)";
                  return value;
                }}
              />
              <Line type="monotone" dataKey={currentMetric.keyA} stroke="#94a3b8" strokeWidth={2} strokeDasharray="4 4" dot={false} name={currentMetric.keyA} />
              <Line type="monotone" dataKey={currentMetric.keyB} stroke="#a855f7" strokeWidth={2.5} dot={false} name={currentMetric.keyB} />
              <Line type="monotone" dataKey={currentMetric.keyC} stroke="#38bdf8" strokeWidth={2} dot={false} name={currentMetric.keyC} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Custom Scenario Builder Controls */}
      <div className="p-4 rounded-lg bg-[#0e162a] border border-[#1a2642] space-y-4">
        <div className="flex items-center justify-between border-b border-[#1b2848] pb-2">
          <div className="flex items-center gap-2 font-bold text-sm text-white">
            <Sliders className="w-4 h-4 text-sky-400" />
            <span>Customize Scenario C Parameters</span>
          </div>
          <button
            onClick={handleRunCustomSimulation}
            disabled={simulating}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow transition disabled:opacity-50"
          >
            <PlayCircle className="w-3.5 h-3.5" />
            <span>{simulating ? "Simulating..." : "Run Scenario C"}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div>
            <div className="text-slate-400 text-[11px] mb-1">Steam: <strong className="text-white">{customSteam}t</strong></div>
            <input type="range" min="1500" max="4500" step="100" value={customSteam} onChange={(e) => setCustomSteam(Number(e.target.value))} className="w-full accent-orange-500" />
          </div>
          <div>
            <div className="text-slate-400 text-[11px] mb-1">Pressure: <strong className="text-white">{customPressure} bar</strong></div>
            <input type="range" min="90" max="135" step="1" value={customPressure} onChange={(e) => setCustomPressure(Number(e.target.value))} className="w-full accent-orange-500" />
          </div>
          <div>
            <div className="text-slate-400 text-[11px] mb-1">Soak: <strong className="text-white">{customSoak.toFixed(1)}d</strong></div>
            <input type="range" min="2" max="12" step="0.5" value={customSoak} onChange={(e) => setCustomSoak(Number(e.target.value))} className="w-full accent-orange-500" />
          </div>
          <div>
            <div className="text-slate-400 text-[11px] mb-1">Stroke: <strong className="text-white">{customStroke}&quot;</strong></div>
            <input type="range" min="96" max="144" step="12" value={customStroke} onChange={(e) => setCustomStroke(Number(e.target.value))} className="w-full accent-sky-500" />
          </div>
          <div>
            <div className="text-slate-400 text-[11px] mb-1">SPM: <strong className="text-white">{customSpm.toFixed(1)}</strong></div>
            <input type="range" min="3.0" max="9.0" step="0.2" value={customSpm} onChange={(e) => setCustomSpm(Number(e.target.value))} className="w-full accent-sky-500" />
          </div>
          <div>
            <div className="text-slate-400 text-[11px] mb-1">VFD: <strong className="text-white">{customVfd.toFixed(1)} Hz</strong></div>
            <input type="range" min="30" max="60" step="1" value={customVfd} onChange={(e) => setCustomVfd(Number(e.target.value))} className="w-full accent-sky-500" />
          </div>
        </div>
      </div>
    </div>
  );
}
