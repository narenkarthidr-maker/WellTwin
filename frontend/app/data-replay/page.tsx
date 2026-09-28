"use client";

import React, { useState, useEffect } from "react";
import { DataModeBadge } from "@/components/common/DataModeBadge";
import { fetchReplayStatus, controlReplay, resetDemoDataset } from "@/lib/api";
import {
  Database,
  Upload,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Sliders,
  Radio
} from "lucide-react";

export default function DataReplayPage() {
  const [replayState, setReplayState] = useState<any>(null);
  const [speed, setSpeed] = useState<number>(1.0);
  const [uploadFeedback, setUploadFeedback] = useState<any>(null);
  const [simulatedRows, setSimulatedRows] = useState<number>(60);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const state = await fetchReplayStatus();
        setReplayState(state);
      } catch (err) {
        console.error("Replay state fetch error", err);
      }
    }
    load();
    const interval = setInterval(load, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleControl = async (action: string) => {
    try {
      const updated = await controlReplay(action, speed);
      setReplayState(updated);
    } catch (err) {
      console.error("Control error", err);
    }
  };

  const handleResetData = async () => {
    try {
      const res = await resetDemoDataset();
      setResetMessage("Synthetic dataset successfully restored to default baseline.");
      setTimeout(() => setResetMessage(null), 4000);
    } catch (err) {
      console.error("Reset error", err);
    }
  };

  const handleMockUpload = () => {
    setUploadFeedback({
      valid: true,
      filename: "baghewala_scada_replay_v2.csv",
      rows: 1440,
      time_range: "2026-08-01 to 2026-09-28",
      missing_values: 0,
      duplicate_timestamps: 0,
      validation_status: "PASSED",
      warnings: [],
      columns_found: [
        "timestamp", "well_id", "temperature_c", "pressure_bar",
        "oil_rate_bpd", "spm", "stroke_length_in", "rod_load_lbs",
        "pump_efficiency_pct", "sor", "energy_kwh_per_bbl"
      ]
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-[#182645]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Database className="w-6 h-6 text-sky-400" />
              Data Pipeline & Telemetry Replay
            </h1>
            <DataModeBadge />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Replay Continuous Time-Series Telemetry • Ingest Field SCADA Datasets • Data Quality Validation
          </p>
        </div>

        <button
          onClick={handleResetData}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#131d36] hover:bg-[#1a284c] border border-[#24355a] text-slate-300 text-xs font-medium transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Demo Data</span>
        </button>
      </div>

      {resetMessage && (
        <div className="p-3 rounded-md bg-emerald-950/80 border border-emerald-700 text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{resetMessage}</span>
        </div>
      )}

      {/* Telemetry Replay Engine Controls Card */}
      <div className="p-5 rounded-lg bg-[#0e162a] border border-[#1a2642] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1b2848] pb-3">
          <div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400 live-indicator" />
              <span>LIVE TELEMETRY STREAM REPLAY CONTROLS</span>
            </div>
            <div className="text-xs text-slate-400">
              Streams recorded Baghewala thermal decay and SRP load variation in real-time
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Speed:</span>
            {[0.5, 1.0, 2.0, 5.0].map((s) => (
              <button
                key={s}
                onClick={() => {
                  setSpeed(s);
                  controlReplay(replayState?.is_playing ? "PLAY" : "PAUSE", s);
                }}
                className={`px-2 py-0.5 rounded text-xs font-mono font-bold transition ${
                  speed === s ? "bg-sky-600 text-white" : "bg-[#14203a] text-slate-400 hover:text-white border border-[#203258]"
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Playback Transport Buttons & Progress */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-lg bg-[#090e1c] border border-[#1b2848]">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleControl("STEP_BACKWARD")}
              className="p-2 rounded bg-[#131d36] hover:bg-[#1c2c52] text-slate-300 transition"
              title="Step Backward"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleControl(replayState?.is_playing ? "PAUSE" : "PLAY")}
              className="px-4 py-2 rounded bg-sky-600 hover:bg-sky-500 text-white flex items-center gap-1.5 font-semibold text-xs transition"
            >
              {replayState?.is_playing ? (
                <>
                  <Pause className="w-4 h-4" /> Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" /> Play Replay
                </>
              )}
            </button>
            <button
              onClick={() => handleControl("STEP_FORWARD")}
              className="p-2 rounded bg-[#131d36] hover:bg-[#1c2c52] text-slate-300 transition"
              title="Step Forward"
            >
              <SkipForward className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleControl("RESET")}
              className="p-2 rounded bg-[#131d36] hover:bg-[#1c2c52] text-slate-300 transition"
              title="Rewind to Step 0"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 max-w-md space-y-1">
            <div className="flex justify-between text-xs font-mono text-slate-300">
              <span>Simulation Step:</span>
              <span className="font-bold text-sky-400">
                {replayState?.current_step || 0} / {replayState?.total_steps || 60}
              </span>
            </div>
            <div className="w-full bg-[#182645] h-2 rounded-full overflow-hidden">
              <div
                className="bg-sky-500 h-full transition-all duration-300"
                style={{
                  width: `${((replayState?.current_step || 0) / (replayState?.total_steps || 60)) * 100}%`
                }}
              />
            </div>
          </div>

          <div className="text-right text-xs font-mono">
            <div className="text-slate-400">Current Stream Point:</div>
            <div className="font-bold text-white">
              {replayState?.current_telemetry?.temperature_c?.toFixed(1) || "82.4"} °C •{" "}
              {replayState?.current_telemetry?.oil_rate_bpd?.toFixed(1) || "48.5"} bpd
            </div>
          </div>
        </div>
      </div>

      {/* Dataset Ingestion & Validation Section */}
      <div className="p-5 rounded-lg bg-[#0e162a] border border-[#1a2642] space-y-4">
        <div className="flex items-center justify-between border-b border-[#1b2848] pb-3">
          <div className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Upload className="w-4 h-4 text-purple-400" />
            INGEST TELEMETRY DATASET (CSV / JSON)
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            Field SCADA / Replay Compatibility
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Drag & Drop Upload Simulator */}
          <div
            onClick={handleMockUpload}
            className="p-6 rounded-lg border-2 border-dashed border-[#24355a] hover:border-sky-500 bg-[#090e1c] flex flex-col items-center justify-center text-center cursor-pointer transition"
          >
            <div className="w-12 h-12 rounded-full bg-[#131d36] flex items-center justify-center text-sky-400 mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <div className="text-xs font-bold text-slate-200">
              Click to Ingest Demo SCADA Dataset
            </div>
            <div className="text-[11px] text-slate-400 mt-1 max-w-xs">
              Supports CSV & JSON containing temperature, pressure, SPM, stroke, rod load, and production rates.
            </div>
          </div>

          {/* Validation Report */}
          <div className="p-4 rounded-lg bg-[#090e1c] border border-[#1a2747] flex flex-col justify-between text-xs font-mono">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-[#182647]">
                <span className="text-slate-400 uppercase text-[10px] font-bold">DATA QUALITY AUDIT</span>
                {uploadFeedback ? (
                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 font-bold border border-emerald-800">
                    {uploadFeedback.validation_status}
                  </span>
                ) : (
                  <span className="text-slate-400 text-[10px]">Awaiting Dataset</span>
                )}
              </div>

              {uploadFeedback ? (
                <div className="mt-3 space-y-2 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Dataset File:</span>
                    <span className="font-bold text-white">{uploadFeedback.filename}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Rows:</span>
                    <span className="font-bold text-white">{uploadFeedback.rows}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Time Range:</span>
                    <span className="text-slate-300">{uploadFeedback.time_range}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Missing Values:</span>
                    <span className="font-bold text-emerald-400">{uploadFeedback.missing_values}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Duplicate Timestamps:</span>
                    <span className="font-bold text-emerald-400">{uploadFeedback.duplicate_timestamps}</span>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center text-slate-400 text-xs">
                  Click the ingest box on the left to run deterministic data quality checks.
                </div>
              )}
            </div>

            <div className="text-[10px] text-slate-400 border-t border-[#182647] pt-2 mt-3">
              Validation Engine: Range checks, null imputation, timestamp monotonicity
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
