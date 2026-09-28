"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { SettingsProvider } from "@/context/SettingsContext";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { GuidedDemoModal } from "@/components/common/GuidedDemoModal";
import { SettingsModal } from "@/components/layout/SettingsModal";
import { HelpModal } from "@/components/layout/HelpModal";
import { LogoutModal } from "@/components/layout/LogoutModal";

import { WellTwinProvider } from "@/context/WellTwinContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light" data-theme="light" suppressHydrationWarning>
      <head>
        <title>WELLTWIN | Baghewala Heavy-Oil Digital Twin</title>
        <meta
          name="description"
          content="AI-Powered Well-to-Surface Digital Twin for CSS and SRP Optimization in Baghewala Heavy-Oil Field. Prototype Decision Support System."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('welltwin-theme');
                  var theme = 'light';
                  if (saved === 'dark') {
                    theme = 'dark';
                  } else if (saved === 'light') {
                    theme = 'light';
                  } else if (saved === 'system') {
                    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  }
                  document.documentElement.setAttribute('data-theme', theme);
                  document.documentElement.classList.remove('dark', 'light');
                  document.documentElement.classList.add(theme);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="bg-[var(--background)] text-[var(--text-primary)] min-h-screen flex antialiased selection:bg-sky-500 selection:text-white">
        <ThemeProvider>
          <AuthProvider>
            <SettingsProvider>
              <WellTwinProvider>
                <AuthGuard>
                  <AppShell>{children}</AppShell>
                </AuthGuard>
              </WellTwinProvider>
            </SettingsProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [selectedWell, setSelectedWell] = useState<string>("BGH-01");
  const [guidedDemoOpen, setGuidedDemoOpen] = useState<boolean>(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  // For /login route, render standalone without sidebar & header
  if (pathname === "/login") {
    return <main className="flex-1 w-full">{children}</main>;
  }

  return (
    <div className="flex-1 flex min-w-0">
      {/* Sidebar */}
      <Sidebar
        onOpenGuidedDemo={() => setGuidedDemoOpen(true)}
        isMobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:ml-64 min-w-0 min-h-screen">
        <Header
          selectedWell={selectedWell}
          onSelectWell={setSelectedWell}
          onOpenGuidedDemo={() => setGuidedDemoOpen(true)}
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        />
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">{children}</main>
      </div>

      {/* Modals & Dialogs */}
      <GuidedDemoModal
        isOpen={guidedDemoOpen}
        onClose={() => setGuidedDemoOpen(false)}
      />
      <SettingsModal />
      <HelpModal />
      <LogoutModal />
    </div>
  );
}
