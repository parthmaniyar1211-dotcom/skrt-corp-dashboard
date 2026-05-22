"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { NotificationBell } from "@/components/layout/NotificationBell";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { UserCircle, Search, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const router = useRouter();

  // Global search state
  const [searchQuery, setSearchQuery] = React.useState("");
  const [focused, setFocused] = React.useState(false);
  const [inventory, setInventory] = React.useState<any[]>([]);
  const [shipments, setShipments] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (focused && inventory.length === 0 && shipments.length === 0) {
      const fetchData = async () => {
        setLoading(true);
        try {
          const [invRes, shipRes] = await Promise.all([
            api.get("/inventory"),
            api.get("/shipments"),
          ]);
          if (invRes.data?.success) setInventory(invRes.data.data);
          if (shipRes.data?.success) setShipments(shipRes.data.data);
        } catch (err) {
          console.error("Global search data fetch failed", err);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [focused]);

  const query = searchQuery.toLowerCase().trim();
  const matchedInventory = query
    ? inventory.filter(
        (item) =>
          item.inventoryId?.toLowerCase().includes(query) ||
          item.lrNo?.toLowerCase().includes(query) ||
          item.cargoName?.toLowerCase().includes(query) ||
          item.senderName?.toLowerCase().includes(query) ||
          item.receiverName?.toLowerCase().includes(query)
      ).slice(0, 5)
    : [];

  const matchedShipments = query
    ? shipments.filter(
        (item) =>
          item.consignmentNumber?.toLowerCase().includes(query) ||
          item.vehicleNumber?.toLowerCase().includes(query) ||
          item.cargoName?.toLowerCase().includes(query) ||
          (item.consignor?.name || item.sender?.name || item.sender)
            ?.toLowerCase()
            .includes(query) ||
          (item.consignee?.name || item.receiver?.name || item.receiver)
            ?.toLowerCase()
            .includes(query)
      ).slice(0, 5)
    : [];

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-background text-foreground">
        <Sidebar />
        <div className="flex-1 ml-64 flex flex-col">
          {/* Top Navigation */}
          <header className="h-16 border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-40 px-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                SKRT <span className="text-[10px] opacity-70 font-normal tracking-normal uppercase">CORP</span>
              </h2>
            </div>
            <div className="flex items-center gap-6">
              {/* Global Search Bar */}
              <div className="relative w-64 md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Global search (LR, Cargo, Consignment, Vehicle...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setTimeout(() => setFocused(false), 200)}
                  className="w-full pl-10 pr-4 py-1.5 bg-secondary/30 focus:bg-secondary/50 border border-border/50 focus:border-primary/50 text-foreground text-xs rounded-lg outline-none transition-all duration-200"
                />
                {loading && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 animate-spin text-muted-foreground" />
                )}

                {focused && searchQuery && (
                  <div className="absolute top-full right-0 mt-2 w-[340px] md:w-[400px] bg-zinc-950/95 border border-zinc-800 rounded-xl shadow-2xl backdrop-blur-md overflow-hidden z-50 text-xs font-sans max-h-80 overflow-y-auto">
                    {matchedInventory.length === 0 && matchedShipments.length === 0 && (
                      <div className="p-4 text-center text-muted-foreground">No matches found</div>
                    )}

                    {matchedInventory.length > 0 && (
                      <div className="p-2 border-b border-zinc-900">
                        <div className="px-2 py-1 text-[9px] uppercase font-bold text-primary tracking-widest">Inventory</div>
                        {matchedInventory.map((item) => (
                          <button
                            key={item._id}
                            onClick={() => {
                              router.push(`/inventory?search=${item.inventoryId || item._id}`);
                              setSearchQuery("");
                            }}
                            className="w-full text-left px-3 py-2 rounded-lg hover:bg-zinc-900 transition-colors flex flex-col gap-0.5"
                          >
                            <div className="font-semibold text-zinc-100 flex justify-between">
                              <span>ID: {item.inventoryId}</span>
                              <span className="text-[10px] text-muted-foreground">LR: {item.lrNo}</span>
                            </div>
                            <div className="text-[10px] text-muted-foreground flex justify-between">
                              <span>Cargo: {item.cargoName}</span>
                              <span>{item.senderName} → {item.receiverName}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {matchedShipments.length > 0 && (
                      <div className="p-2">
                        <div className="px-2 py-1 text-[9px] uppercase font-bold text-emerald-400 tracking-widest">Shipments</div>
                        {matchedShipments.map((item) => (
                          <button
                            key={item._id || item.id}
                            onClick={() => {
                              router.push(`/shipments?search=${item.consignmentNumber || item._id || item.id}`);
                              setSearchQuery("");
                            }}
                            className="w-full text-left px-3 py-2 rounded-lg hover:bg-zinc-900 transition-colors flex flex-col gap-0.5"
                          >
                            <div className="font-semibold text-zinc-100 flex justify-between">
                              <span>No: {item.consignmentNumber || item.id}</span>
                              {item.vehicleNumber && (
                                <span className="text-[10px] text-muted-foreground font-mono">{item.vehicleNumber}</span>
                              )}
                            </div>
                            <div className="text-[10px] text-muted-foreground flex justify-between">
                              <span>Cargo: {item.cargoName || "Cargo"}</span>
                              <span>
                                {item.consignor?.name || item.sender?.name || item.sender || "-"} →{" "}
                                {item.consignee?.name || item.receiver?.name || item.receiver || "-"}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

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
