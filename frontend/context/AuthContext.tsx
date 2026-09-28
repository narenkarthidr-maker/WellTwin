"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export type UserRole = "Asset Engineer" | "Production Engineer" | "Data Analyst" | "Administrator";

export interface UserProfile {
  name: string;
  role: UserRole;
  field: string;
  mode: string;
  status: string;
  email: string;
  lastLogin: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserProfile;
  login: (email: string, role?: UserRole) => Promise<boolean>;
  loginDemo: () => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const DEFAULT_DEMO_USER: UserProfile = {
  name: "Asset Engineer",
  role: "Asset Engineer",
  field: "Baghewala Heavy-Oil Field",
  mode: "Demo / Synthetic Data",
  status: "Online",
  email: "asset.engineer@baghewala.welltwin.io",
  lastLogin: "Active Session"
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<UserProfile>(DEFAULT_DEMO_USER);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check local storage for persistent auth state
    try {
      const storedAuth = localStorage.getItem("welltwin-auth");
      if (storedAuth) {
        const parsed = JSON.parse(storedAuth);
        if (parsed.isAuthenticated) {
          setIsAuthenticated(true);
          if (parsed.user) {
            setUser(parsed.user);
          }
        }
      }
    } catch (e) {
      console.error("Failed to read auth state", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, role: UserRole = "Asset Engineer"): Promise<boolean> => {
    setIsLoading(true);
    // Simulate brief network authentication
    await new Promise((res) => setTimeout(res, 600));

    const loggedUser: UserProfile = {
      ...DEFAULT_DEMO_USER,
      name: role,
      role: role,
      email: email || "engineer@baghewala.welltwin.io",
      lastLogin: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setIsAuthenticated(true);
    setUser(loggedUser);

    try {
      localStorage.setItem(
        "welltwin-auth",
        JSON.stringify({ isAuthenticated: true, user: loggedUser })
      );
    } catch (e) {}

    setIsLoading(false);
    router.push("/command-center");
    return true;
  };

  const loginDemo = async (): Promise<boolean> => {
    return login("demo.asset.engineer@baghewala.welltwin.io", "Asset Engineer");
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(DEFAULT_DEMO_USER);
    try {
      localStorage.removeItem("welltwin-auth");
    } catch (e) {}
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        loginDemo,
        logout,
        isLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
