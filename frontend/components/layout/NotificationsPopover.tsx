"use client";

import React, { useRef, useEffect } from "react";
import { useSettings } from "@/context/SettingsContext";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  Check,
  X
} from "lucide-react";

interface NotificationsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsPopover: React.FC<NotificationsPopoverProps> = ({ isOpen, onClose }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useSettings();
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

  const iconMap = {
    WARNING: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />,
    INFO: <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />,
    SUCCESS: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
  };

  const badgeMap = {
    WARNING: "bg-amber-950 text-amber-400 border-amber-800",
    INFO: "bg-sky-950 text-sky-400 border-sky-800",
    SUCCESS: "bg-emerald-950 text-emerald-400 border-emerald-800"
  };

  return (
    <div
      ref={popoverRef}
      className="absolute right-0 top-12 w-80 sm:w-96 rounded-xl bg-[#0e162a] border border-[#24355a] shadow-2xl z-50 overflow-hidden text-xs font-mono animate-in fade-in"
    >
      {/* Header */}
      <div className="p-3 bg-[#121c35] border-b border-[#1f2e52] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-sky-400" />
          <span className="font-bold text-white">Notifications</span>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-white text-[10px] font-bold">
              {unreadCount}
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-[11px] text-sky-400 hover:text-sky-300 font-sans font-semibold flex items-center gap-1"
          >
            <Check className="w-3 h-3" /> Mark all as read
          </button>
        )}
      </div>

      {/* Notification List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-[#182645]">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-slate-400 font-sans">
            No notifications at this time.
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => markAsRead(n.id)}
              className={`p-3.5 flex items-start gap-3 cursor-pointer hover:bg-[#131d36] transition ${
                !n.read ? "bg-[#11192e]" : "bg-transparent opacity-80"
              }`}
            >
              {iconMap[n.type]}
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">{n.title}</span>
                  <span className={`text-[8px] font-bold px-1 py-0.2 rounded border ${badgeMap[n.type]}`}>
                    {n.type}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans leading-tight">
                  {n.message}
                </p>
                <div className="text-[9px] text-slate-500 pt-0.5">{n.timestamp}</div>
              </div>
              {!n.read && (
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-1 shrink-0" />
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-2.5 bg-[#090e1c] border-t border-[#1f2e52] text-center text-[10px] text-slate-400 font-sans">
        Baghewala Field Telemetry Event Bus
      </div>
    </div>
  );
};
