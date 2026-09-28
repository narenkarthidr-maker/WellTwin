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

interface TemperatureChartProps {
  data: Array<{
    timestamp?: string;
    day?: number;
    temperature_c?: number;
    reservoir_temp_c?: number;
  }>;
  title?: string;
  height?: number;
}

export const TemperatureChart: React.FC<TemperatureChartProps> = ({
  data,
  title = "Reservoir Temperature (°C)",
  height = 240
}) => {
  return (
    <div className="w-full p-3 bg-[#090e1c] rounded-lg border border-[#1a2642]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-200">
          {title}
        </span>
        <span className="text-[10px] text-orange-400 font-mono">
          Question: &quot;Is the reservoir cooling?&quot;
        </span>
      </div>

      <div style={{ height: `${height}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 15, left: -15, bottom: 0 }}>
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
              formatter={(val: any) => [`${Number(val).toFixed(1)} °C`, "Reservoir Temp"]}
            />
            <Line
              type="monotone"
              dataKey={data[0]?.temperature_c !== undefined ? "temperature_c" : "reservoir_temp_c"}
              stroke="#f97316"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
