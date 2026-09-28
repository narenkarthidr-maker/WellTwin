"use client";

import React, { useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";
import {
  User,
  Sliders,
  HelpCircle,
  LogOut,
  ShieldCheck,
  ChevronRight
} from "lucide-react";

interface ProfilePopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
  onOpenLogout: () => void;
}

export const ProfilePopover: React.FC<ProfilePopoverProps> = ({
  isOpen,
  onClose,
  onOpenSettings,
  onOpenHelp,
  onOpenLogout
}) => {
  const { user } = useAuth();
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={popoverRef}
      className="absolute right-0 top-12 w-72 rounded-xl bg-[#0e162a] border border-[#24355a] shadow-2xl z-50 overflow-hidden text-xs font-mono animate-in fade-in"
    >
      {/* Profile Header */}
      <div className="p-4 bg-[#121c35] border-b border-[#1f2e52]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-sky-950 border border-sky-700 flex items-center justify-center text-sky-400 font-bold text-sm">
            <User className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-white text-sm tracking-wide">
              {user.name.toUpperCase()}
            </div>
            <div className="text-[10px] text-slate-400 font-sans">
              Baghewala Operations Asset
            </div>
          </div>
        </div>
      </div>

      {/* Profile Meta Breakdown */}
      <div className="p-3.5 bg-[#090e1c] border-b border-[#182645] space-y-2 text-[11px]">
        <div className="flex justify-between">
          <span className="text-slate-400">Role:</span>
          <span className="text-sky-400 font-bold">{user.role}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Field:</span>
          <span className="text-slate-200">{user.field}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Mode:</span>
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

      {/* Menu Options */}
      <div className="p-2 space-y-0.5 text-slate-300 font-sans">
        <button
          onClick={() => {
            onClose();
            onOpenSettings();
          }}
          className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-[#131d36] transition text-xs"
        >
          <div className="flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5 text-sky-400" />
            <span>Platform Settings</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
        </button>

        <button
          onClick={() => {
            onClose();
            onOpenHelp();
          }}
          className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-[#131d36] transition text-xs"
        >
          <div className="flex items-center gap-2">
            <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
            <span>Help & Overview</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
        </button>

        <button
          onClick={() => {
            onClose();
            onOpenLogout();
          }}
          className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-rose-950/40 text-rose-300 transition text-xs"
        >
          <div className="flex items-center gap-2">
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span>Sign Out</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-rose-400" />
        </button>
      </div>
    </div>
  );
};
