"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type ConnectionState = "active" | "connecting" | "delayed" | "offline";
export type DataMode = "DEMO" | "REPLAY" | "FIELD";

export interface NotificationItem {
  id: string;
  type: "WARNING" | "INFO" | "SUCCESS";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface SettingsContextType {
  telemetryStream: boolean;
  setTelemetryStream: (on: boolean) => void;
  refreshInterval: number; // in seconds
  setRefreshInterval: (interval: number) => void;
  dataMode: DataMode;
  setDataMode: (mode: DataMode) => void;
  connectionState: ConnectionState;
  setConnectionState: (state: ConnectionState) => void;

  // Notifications
  notifications: NotificationItem[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;

  // Modal open states
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  isHelpOpen: boolean;
  setIsHelpOpen: (open: boolean) => void;
  isLogoutConfirmOpen: boolean;
  setIsLogoutConfirmOpen: (open: boolean) => void;
  isProfileOpen: boolean;
  setIsProfileOpen: (open: boolean) => void;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    type: "WARNING",
    title: "Thermal Condition Changing",
    message: "Reservoir temperature has declined to 82.4°C. Viscosity is rising toward 1,250 cP.",
    timestamp: "10m ago",
    read: false
  },
  {
    id: "notif-2",
    type: "WARNING",
    title: "SRP Operating Window Narrowing",
    message: "Operating above 5.4 SPM increases downstroke rod floating hazard. Shift to optimal envelope.",
    timestamp: "25m ago",
    read: false
  },
  {
    id: "notif-3",
    type: "INFO",
    title: "Joint Optimization Ready",
    message: "Coupled CSS + SRP candidate CND-02 evaluated with full constraint validation.",
    timestamp: "1h ago",
    read: false
  },
  {
    id: "notif-4",
    type: "SUCCESS",
    title: "Simulation Completed",
    message: "90-day trajectory comparison for Scenario B (Joint Optimized) passed all safety thresholds.",
    timestamp: "2h ago",
    read: true
  }
];

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [telemetryStream, setTelemetryStream] = useState<boolean>(true);
  const [refreshInterval, setRefreshInterval] = useState<number>(5);
  const [dataMode, setDataMode] = useState<DataMode>("DEMO");
  const [connectionState, setConnectionState] = useState<ConnectionState>("active");

  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <SettingsContext.Provider
      value={{
        telemetryStream,
        setTelemetryStream,
        refreshInterval,
        setRefreshInterval,
        dataMode,
        setDataMode,
        connectionState,
        setConnectionState,
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        isSettingsOpen,
        setIsSettingsOpen,
        isHelpOpen,
        setIsHelpOpen,
        isLogoutConfirmOpen,
        setIsLogoutConfirmOpen,
        isProfileOpen,
        setIsProfileOpen
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
