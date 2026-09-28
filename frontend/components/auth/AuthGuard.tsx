"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Activity } from "lucide-react";

export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated && pathname !== "/login") {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  if (pathname === "/login") {
    return <>{children}</>;
  }

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#080d1a] flex flex-col items-center justify-center text-slate-300">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-sky-600 flex items-center justify-center font-bold text-white shadow-lg animate-pulse mb-4">
          WT
        </div>
        <div className="text-sm font-semibold tracking-wider font-mono text-sky-400">
          WELLTWIN INTELLIGENCE PLATFORM
        </div>
        <div className="text-xs text-slate-500 mt-1">Verifying secure session...</div>
      </div>
    );
  }

  return <>{children}</>;
};
