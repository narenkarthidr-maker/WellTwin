"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Layers,
  Flame,
  Activity,
  GitMerge,
  Cpu,
  HeartPulse,
  Lightbulb,
  Database,
  Server,
  BookOpen,
  PlayCircle,
  X
} from "lucide-react";

interface SidebarProps {
  onOpenGuidedDemo: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onOpenGuidedDemo,
  isMobileOpen = false,
  onCloseMobile
}) => {
  const pathname = usePathname();

  const navItems = [
    { label: "Command Center", href: "/", icon: LayoutDashboard, badge: null },
    { label: "Digital Twin", href: "/digital-twin", icon: Layers, badge: "3D/2D" },
    { label: "CSS Optimizer", href: "/css-optimizer", icon: Flame, badge: null },
    { label: "SRP Optimizer", href: "/srp-optimizer", icon: Activity, badge: null },
    { label: "Joint Optimizer", href: "/joint-optimizer", icon: GitMerge, badge: "CORE" },
    { label: "What-If Simulator", href: "/simulator", icon: Cpu, badge: "3 Scenarios" },
    { label: "Predictive Health", href: "/predictive-health", icon: HeartPulse, badge: "5 Checks" },
    { label: "Recommendations", href: "/recommendations", icon: Lightbulb, badge: "Approval" },
    { label: "Data & Replay", href: "/data-replay", icon: Database, badge: null },
    { label: "System Status", href: "/system-status", icon: Server, badge: "Live" },
    { label: "Methodology", href: "/methodology", icon: BookOpen, badge: null },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
        />
      )}

      <aside
        className={`sidebar-container w-64 bg-[#090e1c] border-r border-[#1a2642] flex flex-col h-screen fixed left-0 top-0 z-40 select-none transition-transform duration-300 md:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Brand Header */}
        <div className="sidebar-brand-header p-4 border-b border-[#1a2642] bg-[#0c1326] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-500 to-sky-600 flex items-center justify-center font-bold text-white shadow-md shadow-orange-500/10">
              WT
            </div>
            <div>
              <div className="font-extrabold tracking-wider text-white text-base flex items-center gap-1.5">
                WELLTWIN
              </div>
              <div className="text-[10px] text-slate-400 tracking-tight">
                Baghewala Heavy Oil Field
              </div>
            </div>
          </div>

          {/* Close button for mobile */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1 rounded text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Primary Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-2 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Engineering Modules
          </div>

          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href === "/" && pathname === "/command-center") ||
              (item.href !== "/" && pathname?.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={`flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? "sidebar-nav-active bg-sky-600/20 text-sky-400 border border-sky-500/40 shadow-sm"
                    : "sidebar-nav-inactive text-slate-300 hover:text-white hover:bg-[#121c33] border border-transparent"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? "text-sky-400" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`sidebar-badge text-[9px] px-1.5 py-0.5 rounded font-mono font-semibold ${
                      item.badge === "CORE"
                        ? "badge-core bg-purple-900/60 text-purple-300 border border-purple-700/50"
                        : item.badge === "Live"
                        ? "badge-live bg-emerald-950 text-emerald-400 border border-emerald-800"
                        : "badge-other bg-[#16223d] text-slate-300 border border-[#23355e]"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Guided Demo Action Box */}
        <div className="sidebar-bottom-box p-3 border-t border-[#1a2642] bg-[#0c1326]/60">
          <button
            onClick={() => {
              if (onCloseMobile) onCloseMobile();
              onOpenGuidedDemo();
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-md bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-semibold shadow-md shadow-orange-950/40 transition"
          >
            <PlayCircle className="w-4 h-4 animate-pulse" />
            <span>Start Guided Demo</span>
          </button>

          <div className="mt-2.5 flex items-center justify-between px-1 text-[10px] text-slate-400">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 live-indicator" />
              <span>Digital Twin Ready</span>
            </div>
            <span className="font-mono">v1.0.0</span>
          </div>
        </div>
      </aside>
    </>
  );
};
