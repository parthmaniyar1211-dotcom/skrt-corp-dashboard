"use client";

import React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { NotificationBell } from "@/components/layout/NotificationBell";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { UserCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-background text-foreground">
        <Sidebar />
        <div className="flex-1 ml-64 flex flex-col">
          {/* Top Navigation */}
          <header className="h-16 border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-40 px-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">SKRT CORP</h2>
            </div>
            <div className="flex items-center gap-6">
              <NotificationBell />
              <div className="h-8 w-px bg-border" />
              <div className="flex items-center gap-3">
                <div className="text-right hidden md:block">
                  <p className="text-sm font-bold">{user?.name || "Administrator"}</p>
                  <p className="text-[10px] text-muted-foreground uppercase">{user?.role || "Manager"}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                  <UserCircle className="w-6 h-6 text-primary" />
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 p-8">
            <div className="max-w-[1600px] mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
