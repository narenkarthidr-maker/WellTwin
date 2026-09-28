"use client";

import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";

interface ProductionChartProps {
  data: Array<{
    timestamp?: string;
    day?: number;
    oil_rate_bpd: number;
    water_rate_bpd?: number;
  }>;
  title?: string;
  height?: number;
}

export const ProductionChart: React.FC<ProductionChartProps> = ({
  data,
  title = "Oil Production Rate (bpd)",
  height = 240
}) => {
  return (
    <div className="w-full p-3 bg-[#090e1c] rounded-lg border border-[#1a2642]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-200">
          {title}
        </span>
        <span className="text-[10px] text-slate-400 font-mono">
          Question: &quot;Is the well responding?&quot;
        </span>
      </div>

      <div style={{ height: `${height}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 15, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="oilGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
              </linearGradient>
            </defs>
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
              formatter={(val: any) => [`${Number(val).toFixed(1)} bpd`, "Oil Production"]}
            />
            <Area
              type="monotone"
              dataKey="oil_rate_bpd"
              stroke="#38bdf8"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#oilGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
