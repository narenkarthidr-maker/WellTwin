"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";
import { LogOut, X } from "lucide-react";

export const LogoutModal: React.FC = () => {
  const { isLogoutConfirmOpen, setIsLogoutConfirmOpen } = useSettings();
  const { logout } = useAuth();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isLogoutConfirmOpen) {
        setIsLogoutConfirmOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLogoutConfirmOpen, setIsLogoutConfirmOpen]);

  if (!isLogoutConfirmOpen) return null;

  const handleConfirmLogout = () => {
    setIsLogoutConfirmOpen(false);
    logout();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-[#0e162a] border border-[#24355a] rounded-xl shadow-2xl max-w-sm w-full overflow-hidden text-slate-100 flex flex-col font-mono text-xs">
        <div className="p-4 bg-[#121c35] border-b border-[#1f2e52] flex items-center justify-between">
          <div className="flex items-center gap-2 text-rose-400 font-bold">
            <LogOut className="w-4 h-4" />
            <span>Sign out of WELLTWIN?</span>
          </div>
          <button
            onClick={() => setIsLogoutConfirmOpen(false)}
            className="p-1 rounded text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 text-slate-300 font-sans text-xs leading-relaxed">
          Are you sure you want to end your active session as <strong>Asset Engineer</strong>?
          Any unsaved candidate adjustments will be reset.
        </div>

        <div className="p-3.5 bg-[#090e1c] border-t border-[#1f2e52] flex items-center justify-end gap-2 font-mono">
          <button
            onClick={() => setIsLogoutConfirmOpen(false)}
            className="px-3.5 py-1.5 rounded-md bg-[#131d36] hover:bg-[#1a284c] text-slate-300 font-semibold transition"
          >
            CANCEL
          </button>
          <button
            onClick={handleConfirmLogout}
            className="px-3.5 py-1.5 rounded-md bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-md transition"
          >
            SIGN OUT
          </button>
        </div>
      </div>
    </div>
  );
};
