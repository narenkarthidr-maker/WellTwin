"use client";

import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceArea,
  ReferenceLine
} from "recharts";

interface SPMOptimizationCurveProps {
  data: Array<{
    spm: number;
    pump_efficiency_pct: number;
    mechanical_risk_pct: number;
    rod_floating_risk: number;
    is_in_safe_window: boolean;
  }>;
  safeWindow?: { min_spm: number; max_spm: number; optimal_spm: number };
}

export const SPMOptimizationCurveChart: React.FC<SPMOptimizationCurveProps> = ({
  data,
  safeWindow = { min_spm: 3.5, max_spm: 5.8, optimal_spm: 5.0 }
}) => {
  return (
    <div className="w-full h-[320px] p-2 bg-[#090e1c] rounded-lg border border-[#1a2642]">
      <div className="flex items-center justify-between px-2 mb-2">
        <div className="text-xs font-semibold text-slate-200">
          SPM vs Volumetric Efficiency & Mechanical Risk Trade-Off
        </div>
        <div className="flex items-center gap-3 text-[10px] font-mono">
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-2.5 h-0.5 bg-emerald-400 inline-block" /> Volumetric Efficiency (%)
          </span>
          <span className="flex items-center gap-1 text-rose-400">
            <span className="w-2.5 h-0.5 bg-rose-400 inline-block" /> Mechanical Risk (%)
          </span>
          <span className="px-1.5 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800">
            Safe Window: {safeWindow.min_spm} - {safeWindow.max_spm} SPM
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height="88%">
        <LineChart data={data} margin={{ top: 10, right: 25, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#182645" />
          <XAxis
            dataKey="spm"
            stroke="#64748b"
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            label={{ value: "Pumping Speed (SPM)", position: "insideBottomRight", offset: -5, fill: "#64748b", fontSize: 10 }}
          />
          <YAxis
            stroke="#64748b"
            domain={[0, 100]}
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            label={{ value: "Percentage (%)", angle: -90, position: "insideLeft", fill: "#64748b", fontSize: 10 }}
          />
          <Tooltip
            contentStyle={{ backgroundColor: "#0c1426", borderColor: "#24355a", borderRadius: "0.375rem", fontSize: "11px", color: "#f8fafc" }}
            formatter={(value: any, name: any) => {
              if (name === "pump_efficiency_pct") return [`${Number(value).toFixed(1)}%`, "Pump Efficiency"];
              if (name === "mechanical_risk_pct") return [`${Number(value).toFixed(1)}%`, "Mechanical Risk"];
              return [value, name];
            }}
            labelFormatter={(label) => `${label} SPM`}
          />

          {/* Safe Recommended Operating Window Shading */}
          <ReferenceArea
            x1={safeWindow.min_spm}
            x2={safeWindow.max_spm}
            strokeOpacity={0.3}
            fill="#0284c7"
            fillOpacity={0.12}
          />

          {/* Optimal SPM vertical marker */}
          <ReferenceLine
            x={safeWindow.optimal_spm}
            stroke="#38bdf8"
            strokeDasharray="4 4"
            label={{ value: `Optimal: ${safeWindow.optimal_spm} SPM`, fill: "#38bdf8", fontSize: 10, position: "top" }}
          />

          <Line
            type="monotone"
            dataKey="pump_efficiency_pct"
            stroke="#10b981"
            strokeWidth={2.5}
            dot={{ r: 3, fill: "#10b981" }}
            activeDot={{ r: 5 }}
            name="pump_efficiency_pct"
          />

          <Line
            type="monotone"
            dataKey="mechanical_risk_pct"
            stroke="#f43f5e"
            strokeWidth={2.5}
            dot={{ r: 3, fill: "#f43f5e" }}
            activeDot={{ r: 5 }}
            name="mechanical_risk_pct"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
