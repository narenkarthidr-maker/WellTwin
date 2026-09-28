"use client";

import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";

interface ViscosityChartProps {
  data: Array<{
    timestamp?: string;
    day?: number;
    viscosity_cp: number;
  }>;
  title?: string;
  height?: number;
}

export const ViscosityChart: React.FC<ViscosityChartProps> = ({
  data,
  title = "Estimated Heavy Oil Viscosity (cP)",
  height = 240
}) => {
  return (
    <div className="w-full p-3 bg-[#090e1c] rounded-lg border border-[#1a2642]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-200">
          {title}
        </span>
        <span className="text-[10px] text-amber-400 font-mono">
          Question: &quot;Is fluid mobility restricting lift?&quot;
        </span>
      </div>

      <div style={{ height: `${height}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 15, left: -5, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#16223d" />
            <XAxis
              dataKey={data[0]?.day !== undefined ? "day" : "timestamp"}
              stroke="#64748b"
              tick={{ fill: "#94a3b8", fontSize: 10 }}
              tickFormatter={(v) => (typeof v === "number" ? `Day ${v}` : String(v).slice(5, 10))}
            />
            <YAxis stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 10 }} domain={["auto", "auto"]} />
            <Tooltip
              contentStyle={{ backgroundColor: "#0c1426", borderColor: "#24355a", borderRadius: "0.375rem", fontSize: "11px", color: "#f8fafc" }}
              formatter={(val: any) => [`${Math.round(Number(val))} cP`, "Viscosity"]}
            />
            <Line
              type="monotone"
              dataKey="viscosity_cp"
              stroke="#eab308"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
