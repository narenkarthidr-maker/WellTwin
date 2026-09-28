"use client";

import React, { useState, useEffect } from "react";
import { DataModeBadge } from "@/components/common/DataModeBadge";
import { ConstraintBadge } from "@/components/common/ConstraintBadge";
import { fetchRecommendations, approveRecommendation } from "@/lib/api";
import { RecommendationItem } from "@/types/simulation";
import {
  Lightbulb,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  AlertTriangle,
  PlayCircle,
  FileCheck,
  UserCheck,
  Info,
  Sparkles
} from "lucide-react";

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRec, setSelectedRec] = useState<RecommendationItem | null>(null);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchRecommendations();
        setRecommendations(data);
      } catch (err) {
        console.error("Failed to fetch recommendations", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleApprovalAction = async (recId: number, action: "APPROVE_FOR_SIMULATION" | "REJECT") => {
    try {
      const res = await approveRecommendation(recId, action);
      if (res.success) {
        setRecommendations((prev) =>
          prev.map((r) => (r.id === recId ? res.recommendation : r))
        );
        setActionSuccessMessage(res.message);
        setTimeout(() => setActionSuccessMessage(null), 5000);
      }
    } catch (err) {
      console.error("Approval action error", err);
    }
  };

  const statusBadges: Record<string, string> = {
    PENDING_REVIEW: "bg-amber-950 text-amber-300 border-amber-800",
    APPROVED_FOR_SIMULATION: "bg-emerald-950 text-emerald-300 border-emerald-800",
    REJECTED: "bg-rose-950 text-rose-300 border-rose-800"
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-[#182645]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Lightbulb className="w-6 h-6 text-amber-400" />
              Recommendation Center
            </h1>
            <DataModeBadge />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Explainable AI Engineering Proposals • Human-in-the-Loop Operational Governance
          </p>
        </div>

        {/* Human-in-the-Loop Mandatory Banner */}
        <div className="px-3 py-1.5 rounded-md bg-amber-500/10 border border-amber-500/40 text-amber-300 font-mono text-[11px] font-bold flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <span>Decision-Support Prototype — Operator Approval Required</span>
        </div>
      </div>

      {actionSuccessMessage && (
        <div className="p-3 rounded-md bg-emerald-950/80 border border-emerald-700 text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{actionSuccessMessage}</span>
        </div>
      )}

      {/* Recommendations Cards List */}
      <div className="space-y-4">
        {recommendations.map((rec) => {
          const isPending = rec.approval_status === "PENDING_REVIEW";
          return (
            <div
              key={rec.id}
              className={`p-5 rounded-lg bg-[#0e162a] border transition ${
                isPending ? "border-[#20325c] hover:border-sky-500/50" : "border-[#16223d] opacity-90"
              }`}
            >
              {/* Header inside card */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#1b2848]">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-bold text-sky-400">
                    #{rec.id} • {rec.well_id}
                  </span>
                  <span className="font-bold text-sm text-white">
                    {rec.title}
                  </span>
                </div>

                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${statusBadges[rec.approval_status]}`}>
                    {rec.approval_status.replace("_", " ")}
                  </span>
                  <ConstraintBadge status={rec.constraint_status} />
                </div>
              </div>

              {/* 3 Core Fields: WHAT, WHY, EXPECTED EFFECT */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-xs">
                {/* WHAT */}
                <div className="p-3.5 rounded bg-[#090e1c] border border-[#182647] space-y-1">
                  <div className="text-[10px] uppercase font-bold text-sky-400">WHAT (RECOMMENDED ACTION)</div>
                  <div className="text-slate-200 leading-relaxed font-sans">{rec.what_action}</div>
                </div>

                {/* WHY */}
                <div className="p-3.5 rounded bg-[#090e1c] border border-[#182647] space-y-1">
                  <div className="text-[10px] uppercase font-bold text-purple-400">WHY (ENGINEERING EXPLANATION)</div>
                  <div className="text-slate-300 leading-relaxed font-sans">{rec.why_explanation}</div>
                </div>

                {/* EXPECTED EFFECT */}
                <div className="p-3.5 rounded bg-[#090e1c] border border-[#182647] space-y-1">
                  <div className="text-[10px] uppercase font-bold text-emerald-400">EXPECTED EFFECT (MODEL PREDICTION)</div>
                  <div className="text-slate-300 leading-relaxed font-sans">{rec.expected_effect}</div>
                </div>
              </div>

              {/* Contributing factors if present */}
              {rec.contributing_factors && rec.contributing_factors.length > 0 && (
                <div className="mt-3 pt-3 border-t border-[#182647] flex flex-wrap items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-mono">Contributing Factors:</span>
                  {rec.contributing_factors.map((cf) => (
                    <span
                      key={cf.factor}
                      className="text-[10px] px-2 py-0.5 rounded bg-[#131d38] border border-[#213257] text-slate-300 font-mono"
                    >
                      {cf.factor} ({cf.impact})
                    </span>
                  ))}
                </div>
              )}

              {/* Approval Action Panel */}
              <div className="mt-4 pt-3 border-t border-[#1b2848] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-[11px] font-mono text-slate-400">
                  {rec.approved_by ? (
                    <span className="text-emerald-400 flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5" />
                      Approved by: {rec.approved_by} on {rec.approved_at?.slice(0, 10)}
                    </span>
                  ) : (
                    <span>Awaiting Chief Production Engineer validation</span>
                  )}
                </div>

                {isPending && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApprovalAction(rec.id, "REJECT")}
                      className="px-3 py-1.5 rounded bg-[#1c182a] hover:bg-rose-950 text-rose-300 border border-rose-900/60 text-xs font-semibold transition"
                    >
                      Reject Proposal
                    </button>
                    <button
                      onClick={() => handleApprovalAction(rec.id, "APPROVE_FOR_SIMULATION")}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve For Simulation</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
