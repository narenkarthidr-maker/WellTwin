"use client";

import React, { useState, useEffect } from "react";
import {
  Bell,
  ChevronDown,
  User,
  Radio,
  Clock,
  Sparkles,
  Settings,
  HelpCircle,
  Menu,
  X,
  Sun,
  Moon
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";
import { useTheme } from "@/context/ThemeContext";
import { NotificationsPopover } from "./NotificationsPopover";
import { ProfilePopover } from "./ProfilePopover";

interface HeaderProps {
  selectedWell: string;
  onSelectWell: (wellId: string) => void;
  onOpenGuidedDemo: () => void;
  onRefresh?: () => void;
  onToggleMobileSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedWell,
  onSelectWell,
  onOpenGuidedDemo,
  onRefresh,
  onToggleMobileSidebar
}) => {
  const { user } = useAuth();
  const {
    unreadCount,
    connectionState,
    telemetryStream,
    dataMode,
    setIsSettingsOpen,
    setIsHelpOpen,
    setIsLogoutConfirmOpen
  } = useSettings();
  const { resolvedTheme, toggleTheme } = useTheme();

  const [lastUpdated, setLastUpdated] = useState<string>("Just now");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLastUpdated(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  const wells = [
    { id: "BGH-01", label: "BGH-01 (Mid Cycle 3 - Cooling)", status: "PRODUCING" },
    { id: "BGH-02", label: "BGH-02 (Hot - High Rate)", status: "PRODUCING" },
    { id: "BGH-03", label: "BGH-03 (Cold - Viscous Alert)", status: "SHUT_IN" }
  ];

  const connectionColors = {
    active: "bg-emerald-400 text-emerald-400",
    connecting: "bg-sky-400 text-sky-400",
    delayed: "bg-amber-400 text-amber-400",
    offline: "bg-rose-400 text-rose-400"
  };

  const connectionLabels = {
    active: dataMode === "REPLAY" ? "Demo Replay" : "Active",
    connecting: "Connecting",
    delayed: "Delayed",
    offline: "Offline"
  };

  return (
    <header className="h-16 bg-[#0c1326] border-b border-[#1a2642] px-4 md:px-6 flex items-center justify-between sticky top-0 z-20 shadow-sm select-none">
      {/* Left: Mobile hamburger + Well Selector & Field Meta */}
      <div className="flex items-center gap-3">
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-1.5 rounded bg-[#131d36] text-slate-300 hover:text-white"
            title="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Well Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#131d36] hover:bg-[#1a2749] border border-[#24355a] text-xs font-semibold text-white transition shadow-inner"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-mono text-sky-300">{selectedWell}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute left-0 mt-1.5 w-64 bg-[#0e162a] border border-[#24355a] rounded-md shadow-xl py-1 z-50">
              <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400">
                Switch Monitored Well
              </div>
              {wells.map((w) => (
                <button
                  key={w.id}
                  onClick={() => {
                    onSelectWell(w.id);
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[#192647] transition ${
                    selectedWell === w.id ? "bg-[#182649] text-sky-400 font-semibold" : "text-slate-300"
                  }`}
                >
                  <span>{w.label}</span>
                  <span className={`text-[9px] font-mono px-1 py-0.5 rounded ${
                    w.status === "PRODUCING" ? "bg-emerald-950 text-emerald-400" : "bg-amber-950 text-amber-400"
                  }`}>
                    {w.status}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Prominent Data Mode Badge - MANDATORY */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-mono font-semibold tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 live-indicator" />
          <span>DEMO MODE • SYNTHETIC DATA</span>
        </div>

        {/* Live Replay Indicator with Functional Status */}
        <div className="hidden lg:flex items-center gap-1.5 text-slate-400 text-xs">
          <Radio className={`w-3.5 h-3.5 ${connectionColors[connectionState].split(" ")[1]} live-indicator`} />
          <span className="font-mono text-[11px]">
            Telemetry Stream: {telemetryStream ? connectionLabels[connectionState] : "Paused"}
          </span>
        </div>
      </div>

      {/* Right Controls: Guided Demo | Help | Notifications | Settings | Clock | Profile */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Guided Demo Button */}
        <button
          onClick={onOpenGuidedDemo}
          className="flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 rounded-md bg-purple-950/70 hover:bg-purple-900 border border-purple-700/60 text-purple-200 text-xs font-semibold shadow-sm transition"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span className="hidden sm:inline">Guided Demo</span>
          <span className="sm:hidden">Demo</span>
        </button>

        {/* Help (?) Button */}
        <button
          onClick={() => setIsHelpOpen(true)}
          className="p-1.5 rounded-md hover:bg-[#1a2749] text-slate-300 hover:text-white transition"
          title="WELLTWIN Help & Knowledge"
        >
          <HelpCircle className="w-4 h-4 text-purple-400" />
        </button>

        {/* Notifications (Bell) with Popover */}
        <div className="relative">
          <button
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setProfileOpen(false);
            }}
            className="p-1.5 rounded-md hover:bg-[#1a2749] text-slate-300 hover:text-white transition relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4 text-sky-400" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center font-mono animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          <NotificationsPopover
            isOpen={notificationsOpen}
            onClose={() => setNotificationsOpen(false)}
          />
        </div>

        {/* Theme Toggle Button (☀ Light / ☾ Dark) */}
        <button
          id="header-theme-toggle"
          onClick={toggleTheme}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#131d36] hover:bg-[#1a2749] border border-[#24355a] text-xs font-mono transition shadow-inner"
          title={`Active theme: ${resolvedTheme === "light" ? "Light" : "Dark"}. Click to toggle.`}
        >
          {resolvedTheme === "light" ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-semibold text-xs">Light</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-sky-400" />
              <span className="font-semibold text-xs">Dark</span>
            </>
          )}
        </button>

        {/* Settings (Gear) Button */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-1.5 rounded-md hover:bg-[#1a2749] text-slate-300 hover:text-white transition"
          title="Platform Settings & Theme"
        >
          <Settings className="w-4 h-4 text-slate-300" />
        </button>

        {/* Last updated timestamp */}
        <div className="hidden xl:flex items-center gap-1 text-[11px] text-slate-400 font-mono">
          <Clock className="w-3 h-3 text-slate-400" />
          <span>{lastUpdated}</span>
        </div>

        {/* User Profile Popover Trigger */}
        <div className="relative">
          <button
            onClick={() => {
              setProfileOpen(!profileOpen);
              setNotificationsOpen(false);
            }}
            className="flex items-center gap-2 pl-2 border-l border-[#1a2642] hover:opacity-90 transition text-left"
          >
            <div className="w-7 h-7 rounded-full bg-sky-950 border border-sky-800 flex items-center justify-center text-sky-400 text-xs font-bold">
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-medium text-slate-200 leading-none">
                {user.name}
              </div>
              <div className="text-[10px] text-slate-400 leading-none mt-0.5 font-mono">
                {user.field.split(" ")[0]} Operations
              </div>
            </div>
          </button>

          <ProfilePopover
            isOpen={profileOpen}
            onClose={() => setProfileOpen(false)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenHelp={() => setIsHelpOpen(true)}
            onOpenLogout={() => setIsLogoutConfirmOpen(true)}
          />
        </div>
      </div>
    </header>
  );
};
