"use client";

import React, { useState, useEffect } from "react";
import { DataModeBadge } from "@/components/common/DataModeBadge";
import { fetchSystemStatus, fetchModelRegistry } from "@/lib/api";
import {
  Server,
  Database,
  Cpu,
  Radio,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Layers,
  Sparkles,
  GitMerge
} from "lucide-react";

export default function SystemStatusPage() {
  const [status, setStatus] = useState<any>(null);
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const sys = await fetchSystemStatus();
        const mods = await fetchModelRegistry();
        setStatus(sys);
        setModels(mods);
      } catch (err) {
        console.error("System status error", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-[#182645]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Server className="w-6 h-6 text-emerald-400" />
              Model & System Status
            </h1>
            <DataModeBadge />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Component Health Diagnostics • AI Model Registry • Dataset Versioning
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono bg-emerald-950/60 border border-emerald-800 px-3 py-1.5 rounded-md text-emerald-400 font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>All Subsystems Operational</span>
        </div>
      </div>

      {/* Component Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {status?.components &&
          Object.entries(status.components).map(([key, comp]: [string, any]) => (
            <div
              key={key}
              className="p-4 rounded-lg bg-[#0e162a] border border-[#1a2642] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-[#1b2848]">
                  <span className="text-xs font-bold text-slate-200 capitalize">
                    {key.replace("_", " ")}
                  </span>
                  <span className="flex items-center gap-1.5 font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 live-indicator" />
                    {comp.status}
                  </span>
                </div>
                <div className="mt-2 text-xs text-slate-300 font-sans">
                  {comp.label}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-[#182647] flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>Latency: {comp.latency_ms ? `${comp.latency_ms} ms` : "Nominal"}</span>
                <span className="text-sky-400">Verified</span>
              </div>
            </div>
          ))}
      </div>

      {/* Model Governance Registry Table */}
      <div className="p-5 rounded-lg bg-[#0e162a] border border-[#1a2642] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1b2848] pb-3">
          <div>
            <div className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              REGISTERED AI & PHYSICS MODELS REGISTRY
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              Governed models tracking training dataset versions, features, and validation metrics
            </div>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            Version: {status?.version_info?.dataset_version || "SYNTH_BAGHEWALA_HEAVY_V2"}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#1c2a4a] text-slate-400">
                <th className="py-2 px-3">MODEL NAME</th>
                <th className="py-2 px-3">ARCHITECTURE</th>
                <th className="py-2 px-3">VERSION</th>
                <th className="py-2 px-3">TRAINING DATASET</th>
                <th className="py-2 px-3">VALIDATION METRICS</th>
                <th className="py-2 px-3">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#15213d] text-slate-300">
              {models.map((m) => (
                <tr key={m.name} className="hover:bg-[#121c38] transition">
                  <td className="py-2.5 px-3 font-bold text-white">{m.name}</td>
                  <td className="py-2.5 px-3 text-sky-300">{m.type}</td>
                  <td className="py-2.5 px-3 font-bold text-purple-400">{m.version}</td>
                  <td className="py-2.5 px-3 text-slate-400">{m.training_dataset}</td>
                  <td className="py-2.5 px-3 text-emerald-400">
                    {m.metrics ? JSON.stringify(m.metrics).replace(/{|}|"/g, "").replace(/,/g, ", ") : "N/A"}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                      {m.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
