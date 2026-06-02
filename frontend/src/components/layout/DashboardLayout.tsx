"use client";

import React, { useState, useEffect, useRef } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { NotificationBell } from "@/components/layout/NotificationBell";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { UserCircle, Search, X, Loader2, Box, FileText, Truck, Users, Package, MapPin } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { HeaderProvider, useHeader } from "@/context/HeaderContext";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

function DashboardHeader() {
  const { user } = useAuth();
  const { headerCenter, searchQuery, setSearchQuery } = useHeader();
  const [searchInput, setSearchInput] = useState(searchQuery);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchInput.trim().length >= 2) {
        setIsSearching(true);
        setShowDropdown(true);
        try {
          const { data } = await api.get(`/search?q=${encodeURIComponent(searchInput)}`);
          if (data.success) {
            setSearchResults(data.data);
          }
        } catch {
          setSearchResults(null);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults(null);
        setShowDropdown(false);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchInput]);

  const handleSearch = () => {
    setSearchQuery(searchInput);
    setShowDropdown(false);
  };

  const handleClear = () => {
    setSearchInput("");
    setSearchQuery("");
    setSearchResults(null);
    setShowDropdown(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleResultClick = (path: string, val: string) => {
    setSearchInput(val);
    setSearchQuery(val);
    setShowDropdown(false);
    router.push(path);
  };

  const hasResults = searchResults && (
    searchResults.shipments?.length > 0 ||
    searchResults.invoices?.length > 0 ||
    searchResults.vehicles?.length > 0 ||
    searchResults.clients?.length > 0 ||
    searchResults.inventory?.length > 0 ||
    searchResults.tracking?.length > 0
  );

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-40 px-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">SKRT CORP</h2>
      </div>
      <div className="flex-1 flex items-center justify-center px-8">
        {headerCenter}
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-1 relative" ref={dropdownRef}>
          <Input
            type="text"
            placeholder="Quick search…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onFocus={() => { if (hasResults || isSearching) setShowDropdown(true); }}
            onKeyDown={handleKeyDown}
            className="bg-secondary border-border w-[260px] text-sm h-9"
          />
          <button
            onClick={handleSearch}
            className="h-9 w-9 flex items-center justify-center rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary transition-colors"
            title="Search current page"
          >
            <Search className="h-4 w-4" />
          </button>
          {searchQuery && (
            <button
              onClick={handleClear}
              className="h-9 w-9 flex items-center justify-center rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 transition-colors"
              title="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {showDropdown && (
            <div className="absolute top-full left-0 mt-2 w-[420px] bg-zinc-900 border border-zinc-700/60 rounded-xl shadow-2xl shadow-black/40 overflow-hidden z-50 max-h-[70vh] flex flex-col">
              {isSearching ? (
                <div className="flex items-center justify-center p-6 text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" /> Searching...
                </div>
              ) : hasResults ? (
                <div className="overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-border/60">
                  {searchResults.shipments?.length > 0 && (
                    <div className="mb-3">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 px-2 flex items-center gap-1.5"><Box className="w-3 h-3" /> Shipments</h4>
                      {searchResults.shipments.map((s: any) => (
                        <button key={s._id} onClick={() => handleResultClick('/shipments', s.consignmentNumber)} className="w-full text-left p-2 hover:bg-slate-800/80 rounded-lg transition-colors">
                          <p className="text-sm font-semibold">{s.consignmentNumber}</p>
                          <p className="text-[11px] text-muted-foreground">{s.consignor?.name || '?'} → {s.consignee?.name || '?'}</p>
                        </button>
                      ))}
                    </div>
                  )}
                  {searchResults.invoices?.length > 0 && (
                    <div className="mb-3">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 px-2 flex items-center gap-1.5"><FileText className="w-3 h-3" /> Invoices</h4>
                      {searchResults.invoices.map((i: any) => (
                        <button key={i._id} onClick={() => handleResultClick('/invoices', i.invoiceNo)} className="w-full text-left p-2 hover:bg-slate-800/80 rounded-lg transition-colors flex justify-between items-center">
                          <div>
                            <p className="text-sm font-semibold">{i.invoiceNo}</p>
                            <p className="text-[11px] text-muted-foreground">{i.client?.name}</p>
                          </div>
                          <span className="text-xs font-bold text-emerald-400">₹{i.amount}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {searchResults.vehicles?.length > 0 && (
                    <div className="mb-3">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 px-2 flex items-center gap-1.5"><Truck className="w-3 h-3" /> Vehicles</h4>
                      {searchResults.vehicles.map((v: any) => (
                        <button key={v._id} onClick={() => handleResultClick('/fleet', v.vehicleNo)} className="w-full text-left p-2 hover:bg-slate-800/80 rounded-lg transition-colors flex justify-between items-center">
                          <div>
                            <p className="text-sm font-semibold">{v.vehicleNo}</p>
                            <p className="text-[11px] text-muted-foreground">{v.model || v.type}</p>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-md border border-emerald-500/20">{v.status}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {searchResults.clients?.length > 0 && (
                    <div className="mb-1">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 px-2 flex items-center gap-1.5"><Users className="w-3 h-3" /> Clients</h4>
                      {searchResults.clients.map((c: any) => (
                        <button key={c._id} onClick={() => handleResultClick('/clients', c.name)} className="w-full text-left p-2 hover:bg-slate-800/80 rounded-lg transition-colors flex justify-between items-center">
                          <div>
                            <p className="text-sm font-semibold">{c.name}</p>
                            <p className="text-[11px] text-muted-foreground">{c.phone || c.email || c.gstin}</p>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-md border border-blue-500/20">Client</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {searchResults.inventory?.length > 0 && (
                    <div className="mb-3">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 px-2 flex items-center gap-1.5"><Package className="w-3 h-3" /> Inventory</h4>
                      {searchResults.inventory.map((i: any) => (
                        <button key={i._id} onClick={() => handleResultClick('/inventory', i.lrNo)} className="w-full text-left p-2 hover:bg-slate-800/80 rounded-lg transition-colors">
                          <p className="text-sm font-semibold">{i.lrNo}</p>
                          <p className="text-[11px] text-muted-foreground">{i.cargoName} · {i.senderName} → {i.receiverName}</p>
                        </button>
                      ))}
                    </div>
                  )}

                  {searchResults.tracking?.length > 0 && (
                    <div className="mb-1">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 px-2 flex items-center gap-1.5"><MapPin className="w-3 h-3" /> Tracking</h4>
                      {searchResults.tracking.map((t: any) => (
                        <button key={t._id} onClick={() => handleResultClick('/tracking', t.vehicle?.vehicleNo || '')} className="w-full text-left p-2 hover:bg-slate-800/80 rounded-lg transition-colors">
                          <p className="text-sm font-semibold">{t.vehicle?.vehicleNo || 'Unknown'}</p>
                          <p className="text-[11px] text-muted-foreground">{t.currentLocation?.address || 'No location'}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : searchInput.trim().length >= 2 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">No results found for "{searchInput}"</div>
              ) : null}
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
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <HeaderProvider>
        <div className="flex min-h-screen bg-background text-foreground">
          <Sidebar />
          <div className="flex-1 ml-64 flex flex-col">
            <DashboardHeader />
            <main className="flex-1 p-8">
              <div className="max-w-[1600px] mx-auto">
                {children}
              </div>
            </main>
          </div>
        </div>
      </HeaderProvider>
    </ProtectedRoute>
  );
}
