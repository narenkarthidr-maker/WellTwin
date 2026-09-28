"use client";

import React from "react";
import { DataModeBadge } from "@/components/common/DataModeBadge";
import {
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Layers,
  Sparkles,
  RefreshCw,
  Flame,
  Activity,
  CheckCircle2
} from "lucide-react";

export default function MethodologyPage() {
  const steps = [
    {
      num: "01",
      title: "Real & Demo Well Data",
      desc: "Time-series stream of bottomhole temperature, pressure, casing flow, and stroke dynamics.",
      type: "Ingestion"
    },
    {
      num: "02",
      title: "Data Quality & Processing",
      desc: "Outlier filtering, null imputation, timestamp monotonicity, and range validation.",
      type: "Cleansing"
    },
    {
      num: "03",
      title: "Hybrid Digital Twin",
      desc: "4-Layer physical representation: Reservoir (Arrhenius), Wellbore (Enthalpy), SRP (API RP 11L), Surface.",
      type: "Physics Engine"
    },
    {
      num: "04",
      title: "AI / ML Prediction",
      desc: "Inverts downhole viscosity from temperature decline and projects near-wellbore mobility.",
      type: "Prediction"
    },
    {
      num: "05",
      title: "Joint CSS + SRP Optimizer",
      desc: "Evaluates coupled candidate settings. Directly models how thermal state alters the SRP operating window.",
      type: "Optimization"
    },
    {
      num: "06",
      title: "Engineering Constraint Check",
      desc: "Deterministic safety gate testing fracture pressure, thermal ratings, rod fatigue, and rod floating.",
      type: "Safety Gate"
    },
    {
      num: "07",
      title: "Explainable Recommendation",
      desc: "Categorizes factors into HIGH, MEDIUM, LOW impact. Formats rationale in petroleum engineering language.",
      type: "Explainable AI"
    },
    {
      num: "08",
      title: "Engineer Approval",
      desc: "Human-in-the-loop validation. Prototype NEVER commands real hardware directly.",
      type: "Governance"
    },
    {
      num: "09",
      title: "What-If Simulation",
      desc: "Multi-scenario 90-day dynamics comparing baseline, optimized, and custom candidate sets.",
      type: "Simulation"
    },
    {
      num: "10",
      title: "Adaptive Feedback Loop",
      desc: "Newly logged telemetry updates model parameters, closing the decision support cycle.",
      type: "Closed Loop"
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-[#182645]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-sky-400" />
              Engineering & Mathematical Methodology
            </h1>
            <DataModeBadge />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            WELLTWIN Technical Whitepaper • Governing Physics, ML Architecture & Constraints
          </p>
        </div>

        <div className="text-xs font-mono text-slate-400 bg-[#0c1426] px-3 py-1.5 rounded-md border border-[#1f2e52]">
          Bikaner-Nagaur Heavy Oil Asset
        </div>
      </div>

      {/* Complete Architecture Flow Banner */}
      <div className="p-5 rounded-lg bg-[#0e162a] border border-[#1a2642] space-y-4">
        <div className="text-xs font-bold text-white uppercase tracking-wider">
          END-TO-END DECISION-SUPPORT WORKFLOW (10 PHASES)
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {steps.map((s) => (
            <div
              key={s.num}
              className="p-3 rounded bg-[#090e1c] border border-[#1a2747] flex flex-col justify-between text-xs font-mono"
            >
              <div>
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span className="font-bold text-sky-400">{s.num}</span>
                  <span className="px-1.5 py-0.2 rounded bg-[#131d36] text-slate-300">{s.type}</span>
                </div>
                <div className="mt-1.5 font-bold text-slate-200 text-xs font-sans">
                  {s.title}
                </div>
              </div>
              <div className="mt-2 text-[11px] text-slate-400 font-sans leading-tight border-t border-[#14203a] pt-1.5">
                {s.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Physics Formulation Deep-Dive */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Viscosity & Arrhenius */}
        <div className="p-4 rounded-lg bg-[#0e162a] border border-orange-900/50 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-orange-400 border-b border-[#1f2e52] pb-2">
            <Flame className="w-4 h-4" />
            <span>1. Heavy Oil Viscosity Law</span>
          </div>
          <div className="p-3 rounded bg-[#090e1c] font-mono text-[11px] text-orange-300 border border-orange-950">
            ln(mu) = ln(A) + B / (T + 273.15)
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            Baghewala heavy oil (~17° API) viscosity exhibits extreme temperature sensitivity:
            dropping from 8,500 cP at initial formation temperature (58°C) to under 40 cP during steam soak.
          </p>
        </div>

        {/* Rod Floating Mechanics */}
        <div className="p-4 rounded-lg bg-[#0e162a] border border-sky-900/50 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-sky-400 border-b border-[#1f2e52] pb-2">
            <Activity className="w-4 h-4" />
            <span>2. Rod Floating Mechanics</span>
          </div>
          <div className="p-3 rounded bg-[#090e1c] font-mono text-[11px] text-sky-300 border border-sky-950">
            F_drag = (2 * pi * mu * v * L) / ln(D_t / D_r)
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            On downstroke, upward viscous shear opposes gravity. If viscous drag exceeds buoyant rod weight,
            the rod floats, causing compressive buckling and polished rod clamp shock.
          </p>
        </div>

        {/* Multi-Objective Optimization */}
        <div className="p-4 rounded-lg bg-[#0e162a] border border-purple-900/50 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-purple-400 border-b border-[#1f2e52] pb-2">
            <Cpu className="w-4 h-4" />
            <span>3. Multi-Objective Objective</span>
          </div>
          <div className="p-3 rounded bg-[#090e1c] font-mono text-[11px] text-purple-300 border border-purple-950">
            max [ w1*Q_oil + w2*Eta_th - w3*SOR - w4*E_lift - w5*Risk ]
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            Scalarized multi-objective objective balancing total heavy oil recovery against steam consumption,
            lifting kilowatt-hours, and rod mechanical stress.
          </p>
        </div>
      </div>

      {/* Decision-Support System Notice */}
      <div className="p-4 rounded-lg bg-[#0e162a] border border-[#1b2848] text-xs font-mono text-slate-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span className="font-bold text-white uppercase tracking-wider">Decision-Support Prototype</span>
        </div>
        <div className="text-[11px] text-slate-400">
          Demo results use synthetic/replay data unless connected to validated field data.
        </div>
      </div>
    </div>
  );
}
