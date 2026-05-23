"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Truck, 
  MapPin, 
  Users, 
  FileText, 
  BarChart3, 
  Settings, 
  LogOut,
  Package,
  Warehouse,
  CreditCard
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Warehouse, label: "Inventory", href: "/inventory" },
  { icon: Package, label: "Shipments", href: "/shipments" },
  { icon: MapPin, label: "Live Tracking", href: "/tracking" },
  { icon: Truck, label: "Fleet", href: "/fleet" },
  { icon: Users, label: "Drivers", href: "/drivers" },
  { icon: Users, label: "Clients", href: "/clients" },
  { icon: CreditCard, label: "Expenses", href: "/expenses" },
  { icon: FileText, label: "Invoices", href: "/invoices" },
  { icon: BarChart3, label: "Analytics", href: "/analytics" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside
      style={{
        width: "16rem",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "fixed",
        left: 0,
        top: 0,
        zIndex: 50,
      }}
      className="bg-background border-r border-border"
    >
      {/* Logo — fixed at top, never shrinks */}
      <div className="p-6 flex-shrink-0 border-b border-border/40">
        <Link href="/dashboard" className="block">
          <h1 className="text-2xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent tracking-tight">
            SKRT<span className="text-[10px] font-normal text-muted-foreground ml-1 tracking-widest uppercase align-middle">CORP</span>
          </h1>
        </Link>
      </div>

      {/* Nav — scrollable middle section */}
      <nav
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          paddingBottom: "0.5rem",
        }}
        className="px-4 pt-4 space-y-1"
      >
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href === "/inventory" &&
              ["/inventory", "/challan", "/cash-memo", "/entry"].includes(pathname));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 group",
                isActive
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <Icon
                className={cn(
                  "w-5 h-5 flex-shrink-0",
                  isActive
                    ? "text-primary-foreground"
                    : "group-hover:text-primary transition-colors"
                )}
              />
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout — always pinned at bottom, never overlaps nav */}
      <div
        className="flex-shrink-0 border-t border-border bg-background"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <button
          onClick={logout}
          className="flex items-center gap-3 px-8 py-4 w-full text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors rounded-none"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
}
