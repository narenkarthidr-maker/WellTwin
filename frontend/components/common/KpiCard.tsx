import React from "react";
import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtext?: string;
  icon: LucideIcon;
  badge?: {
    text: string;
    variant: "good" | "watch" | "warning" | "critical" | "neutral";
  };
  accentColor?: string;
  href?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  unit,
  subtext,
  icon: Icon,
  badge,
  accentColor = "border-sky-500/30",
  href
}) => {
  const badgeColors = {
    good: "bg-emerald-950/80 text-emerald-400 border-emerald-800",
    watch: "bg-amber-950/80 text-amber-400 border-amber-800",
    warning: "bg-orange-950/80 text-orange-400 border-orange-800",
    critical: "bg-rose-950/80 text-rose-400 border-rose-800",
    neutral: "bg-slate-800 text-slate-300 border-slate-700"
  };

  const cardContent = (
    <div
      className={`p-4 rounded-lg bg-[#0e162a] border ${accentColor} flex flex-col justify-between shadow-sm card-panel-hover transition ${
        href ? "cursor-pointer hover:border-sky-400/70" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        <div className="p-1.5 rounded-md bg-[#14203d] text-slate-300">
          <Icon className="w-4 h-4 text-sky-400" />
        </div>
      </div>

      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="text-2xl font-bold font-mono text-white tracking-tight">
          {value}
        </span>
        {unit && (
          <span className="text-xs font-mono text-slate-400">
            {unit}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between pt-2 border-t border-[#182647] text-[10px]">
        <span className="text-slate-400 truncate max-w-[130px]">
          {subtext || "Synthetic telemetry"}
        </span>
        {badge && (
          <span className={`px-1.5 py-0.5 rounded font-mono font-bold uppercase text-[9px] border ${badgeColors[badge.variant]}`}>
            {badge.text}
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href} className="block no-underline">{cardContent}</Link>;
  }

  return cardContent;
};
