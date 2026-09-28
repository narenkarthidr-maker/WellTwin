import React from "react";

interface DataModeBadgeProps {
  mode?: string;
  className?: string;
}

export const DataModeBadge: React.FC<DataModeBadgeProps> = ({ mode = "DEMO", className = "" }) => {
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-[10px] font-bold tracking-wide select-none ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
      <span>DEMO MODE • SYNTHETIC DATA</span>
    </div>
  );
};
