"use client";

import React, { useState, useEffect } from "react";
import { useTheme, ThemeMode } from "@/context/ThemeContext";
import { useSettings, DataMode } from "@/context/SettingsContext";
import { useAuth } from "@/context/AuthContext";
import {
  X,
  Sliders,
  Moon,
  Sun,
  Laptop,
  Radio,
  Clock,
  Database,
  User,
  ShieldAlert,
  CheckCircle2,
  RotateCcw,
  PlayCircle,
  FileCheck
} from "lucide-react";

export const SettingsModal: React.FC = () => {
  const { isSettingsOpen, setIsSettingsOpen, telemetryStream, setTelemetryStream, refreshInterval, setRefreshInterval, dataMode, setDataMode } = useSettings();
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<"APPEARANCE" | "SYSTEM" | "DATA" | "ACCOUNT">("APPEARANCE");
  const [dataModeWarning, setDataModeWarning] = useState<string | null>(null);
  const [dataActionMsg, setDataActionMsg] = useState<string | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isSettingsOpen) {
        setIsSettingsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSettingsOpen, setIsSettingsOpen]);

  if (!isSettingsOpen) return null;

  const handleDataModeChange = (mode: DataMode) => {
    setDataMode(mode);
    if (mode === "FIELD") {
      setDataModeWarning("Field mode requires a configured data source.");
    } else {
      setDataModeWarning(null);
    }
  };

  const handleDataAction = (action: string) => {
    setDataActionMsg(`${action} executed successfully on Baghewala demo dataset.`);
    setTimeout(() => setDataActionMsg(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-[#0e162a] border border-[#24355a] rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden text-slate-100 flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="p-4 bg-[#121c35] border-b border-[#1f2e52] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-600/30 border border-sky-500/50 flex items-center justify-center text-sky-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">System & Platform Settings</div>
              <div className="text-[10px] text-slate-400 font-mono">Baghewala Well Intelligence</div>
            </div>
          </div>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-[#1c2c54] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#1f2e52] bg-[#090e1c] px-4 text-xs font-mono">
          {(["APPEARANCE", "SYSTEM", "DATA", "ACCOUNT"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-4 font-semibold border-b-2 transition ${
                activeTab === tab
                  ? "border-sky-500 text-sky-400 bg-[#121c35]/50"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs font-mono">
          {/* TAB 1: APPEARANCE */}
          {activeTab === "APPEARANCE" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-bold uppercase text-slate-300 tracking-wider mb-1">
                  Interface Theme
                </h3>
                <p className="text-[11px] text-slate-400 font-sans">
                  Select your preferred visual theme. Preference persists across sessions in localStorage.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setTheme("dark")}
                  className={`p-3.5 rounded-lg border text-left flex flex-col justify-between transition ${
                    theme === "dark"
                      ? "border-sky-500 bg-sky-950/40 text-white"
                      : "border-[#1b2848] bg-[#090e1c] text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Moon className="w-5 h-5 text-sky-400 mb-2" />
                  <span className="font-bold text-xs">Dark Mode</span>
                  <span className="text-[10px] text-slate-500 mt-1 font-sans">
                    Deep navy industrial control room
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme("light")}
                  className={`p-3.5 rounded-lg border text-left flex flex-col justify-between transition ${
                    theme === "light"
                      ? "border-sky-500 bg-sky-950/40 text-white"
                      : "border-[#1b2848] bg-[#090e1c] text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Sun className="w-5 h-5 text-amber-400 mb-2" />
                  <span className="font-bold text-xs">Light Mode</span>
                  <span className="text-[10px] text-slate-500 mt-1 font-sans">
                    Crisp engineering daylight palette (Default)
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme("system")}
                  className={`p-3.5 rounded-lg border text-left flex flex-col justify-between transition ${
                    theme === "system"
                      ? "border-sky-500 bg-sky-950/40 text-white"
                      : "border-[#1b2848] bg-[#090e1c] text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Laptop className="w-5 h-5 text-purple-400 mb-2" />
                  <span className="font-bold text-xs">System Match</span>
                  <span className="text-[10px] text-slate-500 mt-1 font-sans">
                    Synchronize with operating system setting
                  </span>
                </button>
              </div>

              <div className="p-3 rounded bg-[#090e1c] border border-[#1b2848] text-[11px] text-slate-400 font-sans">
                <strong>Color Architecture: </strong>
                Semantic variables ensure accessible contrast for reservoir thermals, sucker rod mechanics, and ISO charts in both Dark and Light modes.
              </div>
            </div>
          )}

          {/* TAB 2: SYSTEM */}
          {activeTab === "SYSTEM" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-bold uppercase text-slate-300 tracking-wider mb-1">
                  Telemetry & Ingestion Controls
                </h3>
                <p className="text-[11px] text-slate-400 font-sans">
                  Configure streaming telemetry dispatch and sampling frequency.
                </p>
              </div>

              {/* Telemetry Stream Toggle */}
              <div className="p-3.5 rounded-lg bg-[#090e1c] border border-[#1b2848] flex items-center justify-between">
                <div>
                  <div className="font-bold text-white flex items-center gap-2">
                    <Radio className="w-4 h-4 text-emerald-400" />
                    <span>Telemetry Stream</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-sans mt-0.5">
                    Live WebSocket broadcasting of downhole and surface sensors
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setTelemetryStream(!telemetryStream)}
                  className={`px-3 py-1 rounded font-bold text-xs transition ${
                    telemetryStream ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {telemetryStream ? "ON" : "OFF"}
                </button>
              </div>

              {/* Refresh Interval */}
              <div className="p-3.5 rounded-lg bg-[#090e1c] border border-[#1b2848] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-sky-400" />
                    <span>Refresh Interval</span>
                  </div>
                  <span className="text-sky-400 font-bold">{refreshInterval} sec</span>
                </div>
                <div className="grid grid-cols-4 gap-2 pt-1">
                  {[5, 10, 30, 60].map((interval) => (
                    <button
                      key={interval}
                      type="button"
                      onClick={() => setRefreshInterval(interval)}
                      className={`py-1.5 rounded border text-center transition ${
                        refreshInterval === interval
                          ? "border-sky-500 bg-sky-950/60 text-white font-bold"
                          : "border-[#1e2e50] bg-[#121c35] text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {interval}s
                    </button>
                  ))}
                </div>
              </div>

              {/* Data Mode Selector */}
              <div className="p-3.5 rounded-lg bg-[#090e1c] border border-[#1b2848] space-y-2">
                <div className="font-bold text-white">Operational Data Mode</div>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {(["DEMO", "REPLAY", "FIELD"] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => handleDataModeChange(mode)}
                      className={`py-1.5 rounded border text-center font-bold transition ${
                        dataMode === mode
                          ? "border-amber-500 bg-amber-950/50 text-amber-300"
                          : "border-[#1e2e50] bg-[#121c35] text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>

                {dataModeWarning && (
                  <div className="p-2.5 rounded bg-amber-950/40 border border-amber-800/60 text-amber-300 text-[11px] font-sans flex items-center gap-2 mt-2">
                    <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{dataModeWarning}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: DATA */}
          {activeTab === "DATA" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-bold uppercase text-slate-300 tracking-wider mb-1">
                  Dataset Management & Actions
                </h3>
                <p className="text-[11px] text-slate-400 font-sans">
                  Active synthetic baseline calibrated to Baghewala Jodhpur Sandstone.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-[#090e1c] border border-[#1b2848] space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Current Mode:</span>
                  <span className="text-amber-400 font-bold">DEMO MODE • SYNTHETIC DATA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Active Dataset:</span>
                  <span className="text-white font-bold">Baghewala Demo Dataset</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Dataset Version:</span>
                  <span className="text-sky-400 font-mono">v1.0 (Calibrated)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Formation Depth:</span>
                  <span className="text-slate-200">1,150 m Pay Zone</span>
                </div>
              </div>

              {/* Data Action Buttons */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => handleDataAction("Validate Dataset")}
                  className="flex items-center justify-center gap-1.5 p-2.5 rounded bg-[#131d36] hover:bg-[#1a284c] border border-[#24355a] text-sky-400 font-bold transition"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Validate Data</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDataAction("Reset Demo Data")}
                  className="flex items-center justify-center gap-1.5 p-2.5 rounded bg-[#131d36] hover:bg-[#1a284c] border border-[#24355a] text-amber-400 font-bold transition"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset Demo</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDataAction("Replay Trigger")}
                  className="flex items-center justify-center gap-1.5 p-2.5 rounded bg-[#131d36] hover:bg-[#1a284c] border border-[#24355a] text-emerald-400 font-bold transition"
                >
                  <PlayCircle className="w-4 h-4" />
                  <span>Replay Data</span>
                </button>
              </div>

              {dataActionMsg && (
                <div className="p-2.5 rounded bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-[11px] font-sans flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{dataActionMsg}</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ACCOUNT */}
          {activeTab === "ACCOUNT" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-bold uppercase text-slate-300 tracking-wider mb-1">
                  Authenticated Operator Profile
                </h3>
                <p className="text-[11px] text-slate-400 font-sans">
                  Current credential session and role privileges.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-[#090e1c] border border-[#1b2848] space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">User Identity:</span>
                  <span className="text-white font-bold">{user.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Role:</span>
                  <span className="text-sky-400 font-bold">{user.role}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Field Asset:</span>
                  <span className="text-slate-300">{user.field}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Operational Mode:</span>
                  <span className="text-amber-400 font-bold">{user.mode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status:</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    {user.status}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#121c35] border-t border-[#1f2e52] flex items-center justify-between">
          <div className="text-[10px] text-slate-400 font-mono">
            Press <kbd className="px-1.5 py-0.5 rounded bg-[#1e2e50] text-white">ESC</kbd> to close
          </div>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="px-4 py-1.5 rounded-md bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
