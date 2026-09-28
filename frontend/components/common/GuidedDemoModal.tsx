"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  ArrowRight,
  Flame,
  Activity,
  Layers,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  RefreshCw,
  Lightbulb
} from "lucide-react";

interface GuidedDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuidedDemoModal: React.FC<GuidedDemoModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      step: 1,
      title: "Problem Statement",
      subtitle: "Baghewala Heavy Oil Viscosity & Temperature Coupling",
      description:
        "In Rajasthan's Baghewala field, heavy crude (17° API) is extremely viscous (~8,500 cP at initial reservoir temperature 58°C). " +
        "As the near-wellbore formation cools during the production cycle, viscosity skyrockets exponentially. " +
        "Conventional practices treat Cyclic Steam Stimulation (CSS) and Sucker Rod Pumping (SRP) separately—causing either steam waste or severe mechanical rod floating.",
      icon: Flame,
      color: "from-orange-500 to-red-600",
      targetRoute: "/",
      ctaText: "Inspect Command Center"
    },
    {
      step: 2,
      title: "Observe Digital Twin",
      subtitle: "Real-time 4-Layer Thermal & Mechanical Telemetry",
      description:
        "The Digital Twin continuously tracks 4 physics layers: Reservoir, Wellbore, SRP, and Surface. " +
        "Telemetry detects thermal decline from 145°C down to 82°C. The Digital Twin calculates immediate downhole viscosity surge to 1,250 cP, " +
        "flagging a warning on thermal condition.",
      icon: Layers,
      color: "from-blue-500 to-indigo-600",
      targetRoute: "/digital-twin",
      ctaText: "Open 3D/2D Digital Twin"
    },
    {
      step: 3,
      title: "AI / ML Prediction",
      subtitle: "Viscosity Inversion & Mechanical Risk Forecasting",
      description:
        "Using physics-informed Arrhenius models and Isolation Forest anomaly tracking, the AI predicts that continuing at current pumping speed (5.8 SPM) " +
        "will cause downstroke rod floating resistance to exceed safety limits within 14 days, collapsing pump fillage below 60%.",
      icon: Activity,
      color: "from-purple-500 to-pink-600",
      targetRoute: "/predictive-health",
      ctaText: "View Predictive Health"
    },
    {
      step: 4,
      title: "Coupled Joint Optimization",
      subtitle: "CSS + SRP Joint Evaluation",
      description:
        "Because reservoir thermal state dictates pump operating limits, the Joint Optimizer explores candidate steam injection volumes (CSS) " +
        "alongside stroke length and SPM (SRP). It balances oil recovery against steam-oil ratio (SOR), lifting energy, and mechanical wear.",
      icon: Cpu,
      color: "from-emerald-500 to-teal-600",
      targetRoute: "/joint-optimizer",
      ctaText: "Run Joint Optimizer"
    },
    {
      step: 5,
      title: "Engineering Constraint Validation",
      subtitle: "Deterministic Physics Safety Gate",
      description:
        "Before any proposal reaches an engineer, the deterministic Constraint Engine evaluates 7 boundaries: " +
        "Formation fracture pressure (145 bar cap), casing thermal limits (320°C), API Grade D rod yield tension (28,500 lbs), " +
        "minimum compressive buckling load, and downstroke rod floating index. Unsafe candidates are rejected with explicit engineering rationale.",
      icon: ShieldCheck,
      color: "from-rose-500 to-amber-600",
      targetRoute: "/joint-optimizer",
      ctaText: "Check Constraint Audit"
    },
    {
      step: 6,
      title: "Explainable Recommendation",
      subtitle: "Human-in-the-Loop Operator Decision Support",
      description:
        "The system generates an explainable recommendation ranking contributing factors (HIGH, MEDIUM, LOW IMPACT). " +
        "Crucially: WELLTWIN is a decision-support system. It NEVER sends commands directly to real field hardware—the asset engineer must review and approve for simulation.",
      icon: Lightbulb,
      color: "from-amber-500 to-yellow-600",
      targetRoute: "/recommendations",
      ctaText: "Review Recommendations"
    },
    {
      step: 7,
      title: "What-If Simulator",
      subtitle: "Multi-Scenario Comparative Dynamics",
      description:
        "The operator runs a multi-month simulation comparing Scenario A (Current unoptimized baseline) vs Scenario B (Joint optimized) vs Scenario C (Custom). " +
        "The simulator projects oil production, SOR, energy per barrel, and rod stress trajectories labeled clearly as SIMULATED PREDICTIONS.",
      icon: Sparkles,
      color: "from-sky-500 to-cyan-600",
      targetRoute: "/simulator",
      ctaText: "Explore What-If Simulator"
    },
    {
      step: 8,
      title: "Continuous Feedback Loop",
      subtitle: "Telemetry Arrival & Adaptive Calibration",
      description:
        "As telemetry or replay data arrives, model parameters are updated. Historical responses continuously refine steam heat distribution coefficients " +
        "and rod drag estimates, completing the closed-loop optimization cycle.",
      icon: RefreshCw,
      color: "from-emerald-600 to-blue-600",
      targetRoute: "/data-replay",
      ctaText: "Go to Data & Replay"
    }
  ];

  const current = steps[currentStep];
  const StepIcon = current.icon;

  const handleNavigate = () => {
    onClose();
    router.push(current.targetRoute);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-[#0e162a] border border-[#24355a] rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden text-slate-100 flex flex-col">
        {/* Header */}
        <div className="p-4 bg-[#121c35] border-b border-[#1f2e52] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-mono uppercase text-purple-400 font-bold tracking-wider">
                WELLTWIN Platform • Guided Walkthrough
              </div>
              <div className="text-sm font-bold text-white">
                Step {current.step} of 8: {current.title}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-[#1c2c54] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-[#1a2747] w-full flex">
          {steps.map((s, idx) => (
            <div
              key={s.step}
              onClick={() => setCurrentStep(idx)}
              className={`h-full flex-1 cursor-pointer transition-colors ${
                idx <= currentStep ? "bg-gradient-to-r from-purple-500 to-sky-400" : "bg-transparent"
              }`}
            />
          ))}
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${current.color} flex items-center justify-center text-white shadow-lg`}>
              <StepIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="text-base font-bold text-slate-100">
                {current.subtitle}
              </div>
              <div className="text-xs text-sky-400 font-mono">
                Baghewala Engineering Architecture
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-[#090e1c] border border-[#1b2848] text-xs leading-relaxed text-slate-300">
            {current.description}
          </div>

          {/* Differentiator callout for steps 4 & 5 */}
          {(current.step === 4 || current.step === 5) && (
            <div className="p-3 rounded-md bg-purple-950/40 border border-purple-800/50 text-[11px] text-purple-300">
              <span className="font-bold text-purple-200">Central Innovation: </span>
              “We do not optimize CSS and SRP independently. We model how thermal reservoir behavior affects heavy-oil viscosity,
              how viscosity affects artificial-lift performance, and then jointly optimize CSS and SRP within engineering constraints.”
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#121c35] border-t border-[#1f2e52] flex items-center justify-between">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium text-slate-300 hover:text-white disabled:opacity-40 transition"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleNavigate}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-sky-700 hover:bg-sky-600 text-white text-xs font-semibold shadow transition"
            >
              <span>{current.ctaText}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {currentStep < steps.length - 1 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow transition"
              >
                <span>Next Step</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Complete Walkthrough</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
