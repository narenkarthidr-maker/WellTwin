import React from "react";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

interface ConstraintBadgeProps {
  status: "PASSED" | "FAILED" | "WARNING" | string;
  size?: "sm" | "md";
}

export const ConstraintBadge: React.FC<ConstraintBadgeProps> = ({ status, size = "sm" }) => {
  const isPassed = status === "PASSED";
  const isFailed = status === "FAILED";

  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs";

  if (isPassed) {
    return (
      <span className={`inline-flex items-center gap-1 rounded font-mono font-bold uppercase bg-emerald-950/70 border border-emerald-700/60 text-emerald-400 ${sizeClasses}`}>
        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
        <span>CONSTRAINTS PASSED</span>
      </span>
    );
  }

  if (isFailed) {
    return (
      <span className={`inline-flex items-center gap-1 rounded font-mono font-bold uppercase bg-rose-950/70 border border-rose-700/60 text-rose-400 ${sizeClasses}`}>
        <XCircle className="w-3 h-3 text-rose-400" />
        <span>VIOLATION REJECTED</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 rounded font-mono font-bold uppercase bg-amber-950/70 border border-amber-700/60 text-amber-400 ${sizeClasses}`}>
      <AlertTriangle className="w-3 h-3 text-amber-400" />
      <span>RESTRICTED MARGIN</span>
    </span>
  );
};
