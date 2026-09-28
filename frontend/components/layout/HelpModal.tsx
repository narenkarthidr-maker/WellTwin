"use client";

import React, { useEffect } from "react";
import { useSettings } from "@/context/SettingsContext";
import {
  HelpCircle,
  X,
  Layers,
  Flame,
  Activity,
  GitMerge,
  Database,
  ShieldCheck
} from "lucide-react";

export const HelpModal: React.FC = () => {
  const { isHelpOpen, setIsHelpOpen } = useSettings();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isHelpOpen) {
        setIsHelpOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isHelpOpen, setIsHelpOpen]);

  if (!isHelpOpen) return null;

  const faqs = [
    {
      q: "What is Digital Twin?",
      a: "A digital representation of the reservoir, wellbore, artificial-lift system and surface production system used to monitor, predict and evaluate operating scenarios.",
      icon: Layers,
      color: "text-sky-400"
    },
    {
      q: "What is CSS?",
      a: "Cyclic Steam Stimulation (CSS) is a thermal enhanced oil recovery process comprising injection of high-enthalpy steam, a soak period for matrix heat conduction, and production of thermally thinned heavy crude.",
      icon: Flame,
      color: "text-orange-400"
    },
    {
      q: "What is SRP?",
      a: "A Sucker Rod Pump (SRP) is a reciprocating beam pumping unit that lifts viscous fluid using a downhole plunger barrel, standing valve, and traveling valve connected via a steel rod string.",
      icon: Activity,
      color: "text-blue-400"
    },
    {
      q: "What does Joint Optimization mean?",
      a: "CSS and SRP are physically coupled. Steaming heats the reservoir, drastically lowering heavy-oil viscosity and changing pump fluid load. Joint optimization evaluates steam parameters and pump kinematics together to avoid rod floating and maximize recovery.",
      icon: GitMerge,
      color: "text-purple-400"
    },
    {
      q: "What is Demo Mode?",
      a: "A safe, controlled environment running synthetic time-series telemetry calibrated to Baghewala field PVT data (17.5° API, 8,500 cP dead oil viscosity). It ensures complete decision support testing without pretending to actuate live wells.",
      icon: Database,
      color: "text-amber-400"
    },
    {
      q: "How are recommendations generated?",
      a: "Candidates are evaluated by physics models, filtered by a 7-gate deterministic engineering constraint engine (fracture pressure, rod tension, rod floating condition), and presented for Human-in-the-Loop engineer review and simulation approval.",
      icon: ShieldCheck,
      color: "text-emerald-400"
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-[#0e162a] border border-[#24355a] rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden text-slate-100 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 bg-[#121c35] border-b border-[#1f2e52] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-600/30 border border-sky-500/50 flex items-center justify-center text-sky-400">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">WELLTWIN Knowledge & Help</div>
              <div className="text-[10px] text-slate-400 font-mono">Baghewala Heavy-Oil Field Quick Reference</div>
            </div>
          </div>
          <button
            onClick={() => setIsHelpOpen(false)}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-[#1c2c54] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Q&A List */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {faqs.map((faq) => {
            const Icon = faq.icon;
            return (
              <div
                key={faq.q}
                className="p-3.5 rounded-lg bg-[#090e1c] border border-[#1b2848] space-y-1.5"
              >
                <div className="flex items-center gap-2 font-bold text-white text-xs">
                  <Icon className={`w-4 h-4 ${faq.color}`} />
                  <span>{faq.q}</span>
                </div>
                <p className="text-slate-300 font-sans leading-relaxed text-[11px] pl-6">
                  {faq.a}
                </p>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-[#121c35] border-t border-[#1f2e52] flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>WELLTWIN Platform • Decision Support System</span>
          <button
            onClick={() => setIsHelpOpen(false)}
            className="px-3.5 py-1.5 rounded-md bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
