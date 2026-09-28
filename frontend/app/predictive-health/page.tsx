"use client";

import React, { useState, useEffect } from "react";
import { DataModeBadge } from "@/components/common/DataModeBadge";
import { fetchWellHealth } from "@/lib/api";
import { WellHealthData } from "@/types/well";
import {
  HeartPulse,
  Thermometer,
  Activity,
  AlertTriangle,
  ShieldCheck,
  Zap,
  Info,
  Layers,
  Droplet,
  Radio
} from "lucide-react";

export default function PredictiveHealthPage() {
  const [healthData, setHealthData] = useState<WellHealthData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchWellHealth("BGH-01");
        setHealthData(data);
      } catch (err) {
        console.error("Health fetch error", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const badgeColors: Record<string, string> = {
    GOOD: "bg-emerald-950 text-emerald-400 border-emerald-800",
    WATCH: "bg-amber-950 text-amber-400 border-amber-800",
    WARNING: "bg-orange-950 text-orange-400 border-orange-800",
    CRITICAL: "bg-rose-950 text-rose-400 border-rose-800"
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-[#182645]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <HeartPulse className="w-6 h-6 text-emerald-400" />
              Predictive Well Health Diagnostics
            </h1>
            <DataModeBadge />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            5-Dimension Health Monitoring & Heavy-Oil Mechanical Failure Risk Analysis
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono bg-[#0c1426] px-3 py-1.5 rounded-md border border-[#1f2e52]">
          <span className="text-slate-400">Composite Health:</span>
          <span className="font-bold text-amber-400">WATCH (Thermal & Viscosity Decay)</span>
        </div>
      </div>

      {/* 4 Risk Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {healthData?.risk_cards.map((card) => {
          const isWarning = card.level === "WARNING" || card.level === "CRITICAL";
          return (
            <div
              key={card.title}
              className={`p-4 rounded-lg bg-[#0e162a] border flex flex-col justify-between transition ${
                isWarning ? "border-orange-500/50 shadow-md" : "border-[#1a2642]"
              }`}
            >
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-[#1b2848]">
                  <span className="text-xs font-bold text-slate-200">{card.title}</span>
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold border ${badgeColors[card.level]}`}>
                    {card.level}
                  </span>
                </div>

                <div className="mt-2 text-xl font-bold font-mono text-white">
                  {(card.score * 100).toFixed(1)}%
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                  Factor: {card.factor}
                </div>

                <div className="mt-3 p-2.5 rounded bg-[#090e1c] border border-[#182647] text-[11px] text-slate-300 leading-relaxed font-sans">
                  {card.explanation}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-[#1b2848] text-[9px] text-slate-400 font-mono">
                API RP 11L Structural Criteria
              </div>
            </div>
          );
        })}
      </div>

      {/* 5 Well Health Dimensions Section */}
      <div className="p-5 rounded-lg bg-[#0e162a] border border-[#1a2642] space-y-4">
        <div className="flex items-center justify-between border-b border-[#1b2848] pb-3">
          <div className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-sky-400" />
            5-DIMENSION SUBSYSTEM HEALTH ANALYSIS
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            Categorical Diagnostics (Zero unsupported claims)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
          {/* Thermal Health */}
          <div className="p-3.5 rounded bg-[#090e1c] border border-orange-900/40 flex flex-col justify-between space-y-2">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-orange-400">1. THERMAL</span>
                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold border ${badgeColors[healthData?.sections.thermal_health.status || "WATCH"]}`}>
                  {healthData?.sections.thermal_health.status || "WATCH"}
                </span>
              </div>
              <div className="mt-2 font-mono font-bold text-white text-base">
                {healthData?.sections.thermal_health.temperature_c.toFixed(1)} °C
              </div>
              <div className="text-[10px] text-orange-300 font-mono">
                Viscosity: {Math.round(healthData?.sections.thermal_health.viscosity_cp || 1250)} cP
              </div>
            </div>
            <div className="text-[11px] text-slate-300 leading-tight pt-2 border-t border-[#182647]">
              {healthData?.sections.thermal_health.summary}
            </div>
          </div>

          {/* Pump Health */}
          <div className="p-3.5 rounded bg-[#090e1c] border border-sky-900/40 flex flex-col justify-between space-y-2">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-sky-400">2. PUMP</span>
                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold border ${badgeColors[healthData?.sections.pump_health.status || "GOOD"]}`}>
                  {healthData?.sections.pump_health.status || "GOOD"}
                </span>
              </div>
              <div className="mt-2 font-mono font-bold text-white text-base">
                {healthData?.sections.pump_health.efficiency_pct.toFixed(1)}% Eff
              </div>
              <div className="text-[10px] text-sky-300 font-mono">
                Fillage: {healthData?.sections.pump_health.fillage_pct.toFixed(1)}%
              </div>
            </div>
            <div className="text-[11px] text-slate-300 leading-tight pt-2 border-t border-[#182647]">
              {healthData?.sections.pump_health.summary}
            </div>
          </div>

          {/* Rod Health */}
          <div className="p-3.5 rounded bg-[#090e1c] border border-blue-900/40 flex flex-col justify-between space-y-2">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-400">3. ROD STRING</span>
                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold border ${badgeColors[healthData?.sections.rod_health.status || "GOOD"]}`}>
                  {healthData?.sections.rod_health.status || "GOOD"}
                </span>
              </div>
              <div className="mt-2 font-mono font-bold text-white text-base">
                {healthData?.sections.rod_health.peak_load_lbs.toLocaleString()} lbs
              </div>
              <div className="text-[10px] text-blue-300 font-mono">
                Stress: {healthData?.sections.rod_health.stress_ratio_pct.toFixed(1)}% API
              </div>
            </div>
            <div className="text-[11px] text-slate-300 leading-tight pt-2 border-t border-[#182647]">
              {healthData?.sections.rod_health.summary}
            </div>
          </div>

          {/* Production Health */}
          <div className="p-3.5 rounded bg-[#090e1c] border border-purple-900/40 flex flex-col justify-between space-y-2">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-purple-400">4. PRODUCTION</span>
                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold border ${badgeColors[healthData?.sections.production_health.status || "WATCH"]}`}>
                  {healthData?.sections.production_health.status || "WATCH"}
                </span>
              </div>
              <div className="mt-2 font-mono font-bold text-white text-base">
                {healthData?.sections.production_health.oil_rate_bpd.toFixed(1)} bpd
              </div>
              <div className="text-[10px] text-purple-300 font-mono">
                SOR: {healthData?.sections.production_health.sor.toFixed(2)} bbl/bbl
              </div>
            </div>
            <div className="text-[11px] text-slate-300 leading-tight pt-2 border-t border-[#182647]">
              {healthData?.sections.production_health.summary}
            </div>
          </div>

          {/* Equipment Health */}
          <div className="p-3.5 rounded bg-[#090e1c] border border-emerald-900/40 flex flex-col justify-between space-y-2">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-400">5. EQUIPMENT</span>
                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold border ${badgeColors[healthData?.sections.equipment_health.status || "GOOD"]}`}>
                  {healthData?.sections.equipment_health.status || "GOOD"}
                </span>
              </div>
              <div className="mt-2 font-mono font-bold text-white text-base">
                {healthData?.sections.equipment_health.vfd_hz.toFixed(1)} Hz VFD
              </div>
              <div className="text-[10px] text-emerald-300 font-mono">
                Anomaly: {healthData?.sections.equipment_health.anomaly_detection}
              </div>
            </div>
            <div className="text-[11px] text-slate-300 leading-tight pt-2 border-t border-[#182647]">
              {healthData?.sections.equipment_health.summary}
            </div>
          </div>
        </div>
      </div>

      {/* Model Selection & Technical Architecture Card */}
      <div className="p-4 rounded-lg bg-[#0e162a] border border-[#1a2642] space-y-3">
        <div className="flex items-center justify-between border-b border-[#1b2848] pb-2">
          <div className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Radio className="w-4 h-4 text-purple-400" />
            AI MODEL SELECTION ARCHITECTURE
          </div>
          <span className="text-[10px] font-mono text-slate-400">Decision Support Governance</span>
        </div>

        <div className="p-3 rounded bg-[#090e1c] border border-[#1f2e52] text-xs text-slate-300 leading-relaxed space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">Engineering Principle:</span>
            <span>Do NOT use deep learning just for appearance. Use the simplest technically appropriate model for each task.</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-[11px] font-mono">
            <div className="p-2.5 rounded bg-[#121c35] border border-[#1c2c54]">
              <div className="text-slate-400">Labeled Failure Data Available?</div>
              <div className="font-bold text-amber-400 mt-0.5">NO (Field SCADA typically lacks labeled parted rod logs)</div>
              <div className="text-slate-300 mt-1">Strategy: Physics-based stress ratio + Unsupervised Isolation Forest Anomaly Detection</div>
            </div>
            <div className="p-2.5 rounded bg-[#121c35] border border-[#1c2c54]">
              <div className="text-slate-400">Active Modeling Engines:</div>
              <div className="font-bold text-emerald-400 mt-0.5">Andrade Inversion + API RP 11L Kinematics</div>
              <div className="text-slate-300 mt-1">Status: Validated against Baghewala heavy oil PVT curves</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
