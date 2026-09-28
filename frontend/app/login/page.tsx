"use client";

import React, { useState, useCallback } from "react";
import { useAuth, UserRole } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import {
  Layers,
  Flame,
  Activity,
  Droplet,
  Sparkles,
  ArrowDown,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Mail,
  User,
  Cpu,
  Sun,
  Moon
} from "lucide-react";
import { DigitalTwinBackground } from "@/components/login/DigitalTwinBackground";
import { WellTwinIntro } from "@/components/login/WellTwinIntro";

export default function LoginPage() {
  const { login, loginDemo, isLoading } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();
  const [email, setEmail] = useState("engineer@baghewala.welltwin.io");
  const [password, setPassword] = useState("••••••••••••");
  const [selectedRole, setSelectedRole] = useState<UserRole>("Asset Engineer");
  const [rememberMe, setRememberMe] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Intro: show on first visit, skip on repeat
  const [showIntro, setShowIntro] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("welltwinIntroSeen") !== "true";
  });

  const handleIntroComplete = useCallback(() => {
    setShowIntro(false);
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await login(email, selectedRole);
    setSubmitting(false);
  };

  const handleDemoMode = async () => {
    setSubmitting(true);
    await loginDemo();
    setSubmitting(false);
  };

  return (
    <>
      {/* Cinematic Initialization Intro (first visit only) */}
      {showIntro && <WellTwinIntro onComplete={handleIntroComplete} />}

      <div
        className={`min-h-screen flex flex-col justify-center items-center p-4 selection:bg-sky-500 selection:text-white relative login-container overflow-hidden ${
          resolvedTheme === "light" ? "bg-slate-100/40 text-slate-800" : "bg-[#060a14]/50 text-slate-100"
        }`}
      >
      {/* Live Digital Twin Engineering Background */}
      <DigitalTwinBackground theme={resolvedTheme} />

      {/* Theme Toggle Button */}
      <div className="absolute top-4 right-4 z-20">
        <button
          type="button"
          onClick={toggleTheme}
          className="px-3 py-1.5 rounded-lg border border-[#1a2642] bg-[#0c1326]/90 backdrop-blur-md text-slate-300 hover:text-white flex items-center gap-2 text-xs font-mono transition shadow-sm toggle-btn-inactive"
          title="Toggle Light / Dark Mode"
        >
          {resolvedTheme === "light" ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>Light</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-sky-400" />
              <span>Dark</span>
            </>
          )}
        </button>
      </div>

      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 rounded-xl overflow-hidden border border-[#1a2642] bg-[#0c1326]/95 backdrop-blur-md shadow-[0_20px_60px_rgba(0,0,0,0.65)] login-card relative z-10">
        
        {/* Left Column: Brand & Engineering Flow Illustration */}
        <div className="md:col-span-6 p-8 bg-gradient-to-br from-[#0c1326] via-[#0e172e] to-[#111c38] border-b md:border-b-0 md:border-r border-[#1a2642] flex flex-col justify-between space-y-6 login-left-col">
          <div>
            {/* Brand Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-sky-600 flex items-center justify-center font-bold text-white text-lg shadow-md shadow-orange-500/20">
                WT
              </div>
              <div>
                <div className="font-extrabold tracking-wider text-white text-lg flex items-center gap-1.5">
                  WELLTWIN
                </div>
                <div className="text-xs text-sky-400 font-medium">
                  Well-to-Surface Intelligence
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-300 mt-4 leading-relaxed">
              AI-enabled Digital Twin for Cyclic Steam Stimulation (CSS) and Sucker Rod Pump (SRP)
              optimization in the Baghewala Heavy-Oil Field.
            </p>
          </div>

          {/* Engineering Causal Chain Diagram */}
          <div className="p-4 rounded-lg bg-[#090e1c] border border-[#1b2848] space-y-2 login-chain-box">
            <div className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider mb-2 flex items-center justify-between">
              <span>PHYSICAL COUPLING ARCHITECTURE</span>
              <span className="text-orange-400">17.5° API Crude</span>
            </div>

            {/* Steps */}
            <div className="space-y-1.5 text-xs font-mono">
              <div className="p-2 rounded bg-[#131d36] border border-[#203258] flex items-center justify-between login-chain-step">
                <span className="flex items-center gap-2 text-orange-400 font-bold">
                  <Flame className="w-3.5 h-3.5" /> Reservoir
                </span>
                <span className="text-[10px] text-slate-400">Heavy Oil & Thermal Steam</span>
              </div>
              <div className="flex justify-center text-slate-600">
                <ArrowDown className="w-3.5 h-3.5" />
              </div>

              <div className="p-2 rounded bg-[#131d36] border border-[#203258] flex items-center justify-between login-chain-step">
                <span className="flex items-center gap-2 text-indigo-400 font-bold">
                  <Layers className="w-3.5 h-3.5" /> Wellbore
                </span>
                <span className="text-[10px] text-slate-400">1150m Casing Enthalpy</span>
              </div>
              <div className="flex justify-center text-slate-600">
                <ArrowDown className="w-3.5 h-3.5" />
              </div>

              <div className="p-2 rounded bg-[#131d36] border border-[#203258] flex items-center justify-between login-chain-step">
                <span className="flex items-center gap-2 text-sky-400 font-bold">
                  <Activity className="w-3.5 h-3.5" /> SRP Pump
                </span>
                <span className="text-[10px] text-slate-400">Rod Viscous Drag & Kinematics</span>
              </div>
              <div className="flex justify-center text-slate-600">
                <ArrowDown className="w-3.5 h-3.5" />
              </div>

              <div className="p-2 rounded bg-[#131d36] border border-[#203258] flex items-center justify-between login-chain-step">
                <span className="flex items-center gap-2 text-emerald-400 font-bold">
                  <Droplet className="w-3.5 h-3.5" /> Surface
                </span>
                <span className="text-[10px] text-slate-400">Separation & Energy Footprint</span>
              </div>
              <div className="flex justify-center text-slate-600">
                <ArrowDown className="w-3.5 h-3.5 text-purple-400" />
              </div>

              <div className="p-2 rounded bg-purple-950/50 border border-purple-800 text-purple-200 flex items-center justify-between font-bold login-chain-intelligence">
                <span className="flex items-center gap-2 text-purple-300">
                  <Cpu className="w-3.5 h-3.5" /> Digital Intelligence
                </span>
                <span className="text-[10px] text-purple-400 font-mono">Joint Optimization</span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Decision-support prototype • Operator approval required</span>
          </div>
        </div>

        {/* Right Column: Login Card & Demo Access */}
        <div className="md:col-span-6 p-8 flex flex-col justify-between space-y-6 bg-[#0e162a] login-right-col">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Operator Sign In
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Access Baghewala Digital Twin Intelligence
                </p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-semibold">
                DEMO MODE
              </span>
            </div>

            {/* Sign In Form */}
            <form onSubmit={handleSignIn} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Email / Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 rounded-md bg-[#090e1c] border border-[#203258] text-white focus:outline-none focus:border-sky-500 font-mono text-xs"
                    placeholder="engineer@baghewala.welltwin.io"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 rounded-md bg-[#090e1c] border border-[#203258] text-white focus:outline-none focus:border-sky-500 font-mono text-xs"
                    placeholder="••••••••••••"
                  />
                </div>
              </div>

              {/* Role Selector */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Authorized Role
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                    className="w-full pl-9 pr-3 py-2 rounded-md bg-[#090e1c] border border-[#203258] text-white focus:outline-none focus:border-sky-500 font-mono text-xs appearance-none cursor-pointer"
                  >
                    <option value="Asset Engineer">Asset Engineer (Default)</option>
                    <option value="Production Engineer">Production Engineer</option>
                    <option value="Data Analyst">Data Analyst</option>
                    <option value="Administrator">Administrator</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-[#203258] bg-[#090e1c] text-sky-600 focus:ring-0"
                  />
                  <span>Remember me</span>
                </label>
                <span className="hover:text-slate-200 cursor-pointer">
                  Forgot password?
                </span>
              </div>

              <button
                type="submit"
                disabled={submitting || isLoading}
                className="w-full py-2.5 rounded-md bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md transition disabled:opacity-50"
              >
                {submitting ? "Signing in..." : "SIGN IN"}
              </button>
            </form>

            {/* Demo Access Section */}
            <div className="mt-5 pt-4 border-t border-[#1b2848] space-y-3">
              <div className="text-center">
                <span className="text-[10px] font-mono uppercase text-slate-400">
                  Demo Access
                </span>
              </div>

              <button
                type="button"
                onClick={handleDemoMode}
                disabled={submitting || isLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-md bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs shadow-md shadow-orange-950/40 transition disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{submitting ? "Entering Demo..." : "ENTER DEMO MODE"}</span>
              </button>

              {/* Demo User Info Box */}
              <div className="p-3 rounded-md bg-[#090e1c] border border-[#1b2848] text-[11px] font-mono text-slate-400 space-y-1 login-demo-box">
                <div className="flex justify-between">
                  <span>Demo User:</span>
                  <strong className="text-white">Chief Production Engineer</strong>
                </div>
                <div className="flex justify-between">
                  <span>Role:</span>
                  <span className="text-sky-400 font-bold">Asset Engineer</span>
                </div>
                <div className="flex justify-between">
                  <span>Mode:</span>
                  <span className="text-amber-400 font-bold">Synthetic Data</span>
                </div>
                <div className="flex justify-between">
                  <span>Environment:</span>
                  <span className="text-slate-300">Baghewala Heavy-Oil Field</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center text-[10px] text-slate-500 font-mono">
            WELLTWIN v1.0.0 • Decision-Support Platform
          </div>
        </div>

      </div>
    </div>
    </>
  );
}
