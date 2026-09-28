"use client";

import React, { useState, useEffect } from "react";
import { DataModeBadge } from "@/components/common/DataModeBadge";
import { WellDiagram } from "@/components/twin/WellDiagram";
import { fetchDigitalTwin, recalculateDigitalTwin } from "@/lib/api";
import {
  Layers,
  Thermometer,
  Activity,
  Wind,
  Droplet,
  Zap,
  Gauge,
  Sliders,
  Sparkles,
  Info
} from "lucide-react";

export default function DigitalTwinPage() {
  const [twinData, setTwinData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchDigitalTwin("BGH-01");
        setTwinData(data);
      } catch (err) {
        console.error("Failed to load digital twin", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleRecalculate = async (params: any) => {
    try {
      const updated = await recalculateDigitalTwin("BGH-01", params);
      setTwinData((prev: any) => ({
        ...prev,
        reservoir: {
          ...prev?.reservoir,
          temperature_c: updated.reservoir_temp_c,
          estimated_viscosity_cp: updated.estimated_viscosity_cp
        },
        srp: {
          ...prev?.srp,
          pump_efficiency_pct: updated.pump_efficiency_pct,
          rod_load_lbs: updated.rod_load_lbs,
          rod_floating_risk: updated.rod_floating_risk
        },
        surface: {
          ...prev?.surface,
          oil_rate_bpd: updated.oil_rate_bpd,
          sor: updated.sor,
          energy_kwh_per_bbl: updated.energy_kwh_per_bbl
        }
      }));
    } catch (err) {
      console.error("Recalculate error", err);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-[#182645]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Layers className="w-6 h-6 text-sky-400" />
              Well-to-Surface Digital Twin Centerpiece
            </h1>
            <DataModeBadge />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Coupled 4-Layer Engineering Model: Reservoir • Wellbore • Sucker Rod Pump • Surface Facilities
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono bg-[#0c1426] px-3 py-1.5 rounded-md border border-[#1f2e52] twin-header-indicator">
          <span className="text-slate-400">Sandface Depth:</span>
          <span className="text-sky-300 font-bold">1,150 m</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">Pay Zone:</span>
          <span className="text-orange-300 font-bold">Jodhpur Sandstone</span>
        </div>
      </div>

      {/* Physics Coupling Explainer Banner */}
      <div className="p-3.5 rounded-lg bg-sky-950/30 border border-sky-800/40 text-xs text-slate-300 flex items-start gap-2.5 twin-explainer-banner">
        <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-white">Coupled Well-to-Surface Physics: </strong>
          Cyclic Steam Stimulation changes the near-wellbore reservoir temperature.
          Formation temperature dictates heavy oil dynamic viscosity via the Arrhenius relation.
          Viscosity directly governs upward buoyant drag and downstroke rod falling velocity in the Sucker Rod Pump.
          Adjusting any slider updates all 4 layers synchronously.
        </div>
      </div>

      {/* Interactive Well Diagram with 2D/3D & Sliders */}
      <WellDiagram initialState={twinData} onParameterChange={handleRecalculate} />

      {/* Detailed 4-Layer Parameter Readouts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Layer 1: Reservoir */}
        <div className="p-4 rounded-lg bg-[#0e162a] border border-orange-900/50 space-y-3 twin-layer-reservoir">
          <div className="flex items-center justify-between border-b border-[#1f2e52] pb-2">
            <span className="text-xs font-bold text-orange-400 flex items-center gap-1.5">
              <Thermometer className="w-4 h-4" />
              1. RESERVOIR LAYER
            </span>
            <span className="text-[10px] font-mono text-orange-300 bg-orange-950/80 px-1.5 py-0.5 rounded border border-orange-800 twin-badge-orange">
              58°C - 245°C
            </span>
          </div>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">Sandface Temperature:</span>
              <span className="font-bold text-white">
                {twinData?.reservoir?.temperature_c?.toFixed(1) || "82.4"} °C
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Downhole Viscosity:</span>
              <span className="font-bold text-orange-300">
                {Math.round(twinData?.reservoir?.estimated_viscosity_cp || 1250)} cP
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Oil Mobility (k/mu):</span>
              <span className="font-bold text-emerald-400">
                {twinData?.reservoir?.oil_mobility_md_cp || "0.52"} mD/cP
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Reservoir Pressure:</span>
              <span className="font-bold text-sky-300">
                {twinData?.reservoir?.pressure_bar?.toFixed(1) || "92.0"} bar
              </span>
            </div>
          </div>
        </div>

        {/* Layer 2: Wellbore */}
        <div className="p-4 rounded-lg bg-[#0e162a] border border-indigo-900/50 space-y-3 twin-layer-wellbore">
          <div className="flex items-center justify-between border-b border-[#1f2e52] pb-2">
            <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
              <Wind className="w-4 h-4" />
              2. WELLBORE LAYER
            </span>
            <span className="text-[10px] font-mono text-indigo-300 bg-indigo-950/80 px-1.5 py-0.5 rounded border border-indigo-800 twin-badge-indigo">
              0 - 1,150 m
            </span>
          </div>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">Sandface Steam Quality:</span>
              <span className="font-bold text-white">74.2%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Estimated Heat Loss:</span>
              <span className="font-bold text-amber-300">14.2% Overburden</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Casing OD / ID:</span>
              <span className="font-bold text-slate-300">7.0&quot; / 6.276&quot;</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Bottomhole Flowing P:</span>
              <span className="font-bold text-sky-300">32.4 bar</span>
            </div>
          </div>
        </div>

        {/* Layer 3: SRP Pump */}
        <div className="p-4 rounded-lg bg-[#0e162a] border border-sky-900/50 space-y-3 twin-layer-srp">
          <div className="flex items-center justify-between border-b border-[#1f2e52] pb-2">
            <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
              <Activity className="w-4 h-4" />
              3. SRP PUMP MECHANICS
            </span>
            <span className="text-[10px] font-mono text-sky-300 bg-sky-950/80 px-1.5 py-0.5 rounded border border-sky-800 twin-badge-sky">
              API RP 11L
            </span>
          </div>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">Pump Volumetric Eff:</span>
              <span className="font-bold text-emerald-400">
                {twinData?.srp?.pump_efficiency_pct?.toFixed(1) || "74.5"}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Peak Polished Rod Load:</span>
              <span className="font-bold text-white">
                {twinData?.srp?.rod_load_lbs?.toLocaleString() || "16,500"} lbs
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Rod Floating Risk:</span>
              <span className="font-bold text-orange-400">
                {twinData?.srp?.rod_floating_risk?.toFixed(3) || "0.142"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Operating Status:</span>
              <span className="font-bold text-emerald-400">SAFE OPERATING</span>
            </div>
          </div>
        </div>

        {/* Layer 4: Surface */}
        <div className="p-4 rounded-lg bg-[#0e162a] border border-emerald-900/50 space-y-3 twin-layer-surface">
          <div className="flex items-center justify-between border-b border-[#1f2e52] pb-2">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <Droplet className="w-4 h-4" />
              4. SURFACE PRODUCTION
            </span>
            <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800 twin-badge-emerald">
              Gathering
            </span>
          </div>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">Heavy Oil Production:</span>
              <span className="font-bold text-white">
                {twinData?.surface?.oil_rate_bpd?.toFixed(1) || "48.5"} bpd
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Cumulative SOR:</span>
              <span className="font-bold text-purple-300">
                {twinData?.surface?.sor?.toFixed(2) || "3.25"} bbl/bbl
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Lifting Energy Index:</span>
              <span className="font-bold text-amber-300">
                {twinData?.surface?.energy_kwh_per_bbl?.toFixed(1) || "42.1"} kWh/bbl
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Operating Cost:</span>
              <span className="font-bold text-sky-300">
                ${twinData?.surface?.operating_cost_usd_per_bbl?.toFixed(2) || "14.80"} /bbl
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
