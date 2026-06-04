"use client";

import React, { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Receipt, ClipboardList, Truck, Loader2, X, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { useHeader } from "@/context/HeaderContext";

type ModuleKey = "challan" | "cash-memo" | "summary" | "delivery-statement";

const modules: { key: ModuleKey; label: string; icon: React.ReactNode; color: string }[] = [
  { key: "challan", label: "Challan", icon: <ClipboardList className="w-7 h-7" />, color: "from-blue-600/20 to-blue-900/10" },
  { key: "cash-memo", label: "Cash Memo", icon: <Receipt className="w-7 h-7" />, color: "from-emerald-600/20 to-emerald-900/10" },
  { key: "summary", label: "Summary", icon: <FileSpreadsheet className="w-7 h-7" />, color: "from-amber-600/20 to-amber-900/10" },
  { key: "delivery-statement", label: "Delivery Statement", icon: <Truck className="w-7 h-7" />, color: "from-rose-600/20 to-rose-900/10" },
];

const moduleEndpoints: Record<ModuleKey, string> = {
  challan: "/challan",
  "cash-memo": "/cash-memo",
  summary: "/summary",
  "delivery-statement": "/delivery-statement",
};

export default function FleetPage() {
  const { searchQuery } = useHeader();
  const [activeModule, setActiveModule] = useState<ModuleKey | null>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [counts, setCounts] = useState<Record<ModuleKey, number>>({} as any);

  const fetchAllCounts = useCallback(async () => {
    const results: Record<string, number> = {};
    for (const [key, endpoint] of Object.entries(moduleEndpoints)) {
      try {
        const { data } = await api.get(endpoint);
        if (data.success) {
          results[key] = data.data?.length || data.count || 0;
        }
      } catch {
        results[key] = 0;
      }
    }
    setCounts(results as Record<ModuleKey, number>);
  }, []);

  useEffect(() => {
    fetchAllCounts();
  }, [fetchAllCounts]);

  const fetchRecords = useCallback(async (module: ModuleKey) => {
    setLoading(true);
    try {
      const { data } = await api.get(moduleEndpoints[module]);
      if (data.success) {
        setRecords(data.data || []);
      } else {
        setRecords([]);
      }
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCardClick = (key: ModuleKey) => {
    if (activeModule === key) {
      setActiveModule(null);
      setRecords([]);
      return;
    }
    setActiveModule(key);
    fetchRecords(key);
  };

  const rowMatches = (row: any, q: string) => {
    if (!q.trim()) return false;
    const lower = q.toLowerCase();
    return Object.values(row).some((v) => String(v).toLowerCase().includes(lower));
  };

  const renderNoData = (isSearchResult: boolean) => (
    <div className="text-center py-16 text-slate-500">
      <Search className="w-12 h-12 mx-auto mb-3 opacity-40" />
      <p className="text-lg font-medium">{isSearchResult ? "No matches found" : "No records found"}</p>
      <p className="text-sm mt-1">
        {isSearchResult ? "Try a different search term." : "The database has no records for this module."}
      </p>
    </div>
  );

  const flattenRow = (reg: any, entry: any) => {
    return { _regId: reg._id, ...entry, ...(reg.date ? { _regDate: reg.date } : {}), ...(reg.dateSearch ? { _regDate: reg.dateSearch } : {}), ...(reg.challanNo ? { challanNo: reg.challanNo } : {}), ...(reg.vehicleNo ? { vehicleNo: reg.vehicleNo } : {}), ...(reg.driverName ? { driverName: reg.driverName } : {}), ...(reg.pageNo ? { pageNo: reg.pageNo } : {}), ...(reg.from ? { _regFrom: reg.from } : {}) };
  };

  const filterRows = (rows: any[], q: string) => {
    if (!q.trim()) return rows;
    return rows.filter((r) => rowMatches(r, q));
  };

  const renderChallanTable = () => {
    const flatRows = records.flatMap((reg: any) =>
      (reg.entries || []).map((e: any) => flattenRow(reg, e))
    );
    const filtered = filterRows(flatRows, searchQuery);
    if (flatRows.length === 0) return renderNoData(false);
    if (filtered.length === 0) return renderNoData(true);
    return (
      <div className="overflow-x-auto border border-slate-700 rounded-lg">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-slate-900/80">
              <th className="border border-slate-700 p-2 text-[#2388ff] font-bold">No.</th>
              <th className="border border-slate-700 p-2 text-[#2388ff] font-bold">Date</th>
              <th className="border border-slate-700 p-2 text-[#2388ff] font-bold">Challan No</th>
              <th className="border border-slate-700 p-2 text-[#2388ff] font-bold">Vehicle</th>
              <th className="border border-slate-700 p-2 text-[#2388ff] font-bold">Driver</th>
              <th className="border border-slate-700 p-2 text-[#2388ff] font-bold">G.R. No</th>
              <th className="border border-slate-700 p-2 text-[#2388ff] font-bold">Pkg</th>
              <th className="border border-slate-700 p-2 text-[#2388ff] font-bold">Dest.</th>
              <th className="border border-slate-700 p-2 text-[#2388ff] font-bold">Content</th>
              <th className="border border-slate-700 p-2 text-[#2388ff] font-bold">Consignor</th>
              <th className="border border-slate-700 p-2 text-[#2388ff] font-bold">Consignee</th>
              <th className="border border-slate-700 p-2 text-[#2388ff] font-bold">Total</th>
              <th className="border border-slate-700 p-2 text-[#2388ff] font-bold">Wt</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row: any, i: number) => (
              <tr key={i} className={cn("transition-colors", rowMatches(row, searchQuery) ? "bg-[#2388ff]/10" : "hover:bg-slate-800/40")}>
                <td className="border border-slate-700 p-2 text-center text-slate-400">{i + 1}</td>
                <td className="border border-slate-700 p-2 text-center text-white">{row._regDate || "—"}</td>
                <td className="border border-slate-700 p-2 text-center text-white font-medium">{row.challanNo || "—"}</td>
                <td className="border border-slate-700 p-2 text-center text-white">{row.vehicleNo || "—"}</td>
                <td className="border border-slate-700 p-2 text-center text-white">{row.driverName || "—"}</td>
                <td className="border border-slate-700 p-2 text-center text-white">{row.grNo || "—"}</td>
                <td className="border border-slate-700 p-2 text-center text-white">{row.pkg || "—"}</td>
                <td className="border border-slate-700 p-2 text-center text-white">{row.dest || "—"}</td>
                <td className="border border-slate-700 p-2 text-center text-white">{row.content || "—"}</td>
                <td className="border border-slate-700 p-2 text-center text-white">{row.consignor || "—"}</td>
                <td className="border border-slate-700 p-2 text-center text-white">{row.consignee || "—"}</td>
                <td className="border border-slate-700 p-2 text-right text-white">{row.total || "—"}</td>
                <td className="border border-slate-700 p-2 text-right text-white">{row.wt || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderCashMemoTable = () => {
    if (records.length === 0) return renderNoData(false);
    const filtered = filterRows(records, searchQuery);
    if (filtered.length === 0) return renderNoData(true);
    return (
      <div className="overflow-x-auto border border-slate-700 rounded-lg">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-slate-900/80">
              <th className="border border-slate-700 p-2 text-[#2388ff] font-bold">No.</th>
              <th className="border border-slate-700 p-2 text-[#2388ff] font-bold">D.R. No</th>
              <th className="border border-slate-700 p-2 text-[#2388ff] font-bold">G.R. No</th>
              <th className="border border-slate-700 p-2 text-[#2388ff] font-bold">Date</th>
              <th className="border border-slate-700 p-2 text-[#2388ff] font-bold">From</th>
              <th className="border border-slate-700 p-2 text-[#2388ff] font-bold">Consignee</th>
              <th className="border border-slate-700 p-2 text-[#2388ff] font-bold">Freight</th>
              <th className="border border-slate-700 p-2 text-[#2388ff] font-bold">Labour</th>
              <th className="border border-slate-700 p-2 text-[#2388ff] font-bold">Stationery</th>
              <th className="border border-slate-700 p-2 text-[#2388ff] font-bold">Commission</th>
              <th className="border border-slate-700 p-2 text-[#2388ff] font-bold">A.O.C.</th>
              <th className="border border-slate-700 p-2 text-[#2388ff] font-bold">Total</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((memo: any, i: number) => (
              <tr key={i} className={cn("transition-colors", rowMatches(memo, searchQuery) ? "bg-[#2388ff]/10" : "hover:bg-slate-800/40")}>
                <td className="border border-slate-700 p-2 text-center text-slate-400">{i + 1}</td>
                <td className="border border-slate-700 p-2 text-center text-white font-medium">{memo.drNo || "—"}</td>
                <td className="border border-slate-700 p-2 text-center text-white">{memo.grNo || "—"}</td>
                <td className="border border-slate-700 p-2 text-center text-white">{memo.date ? new Date(memo.date).toLocaleDateString() : "—"}</td>
                <td className="border border-slate-700 p-2 text-center text-white">{memo.from || "—"}</td>
                <td className="border border-slate-700 p-2 text-center text-white">{memo.consignee || "—"}</td>
                <td className="border border-slate-700 p-2 text-right text-white">{(memo.freight || 0) + (memo.freightPaise || 0) / 100}</td>
                <td className="border border-slate-700 p-2 text-right text-white">{(memo.labour || 0) + (memo.labourPaise || 0) / 100}</td>
                <td className="border border-slate-700 p-2 text-right text-white">{(memo.stationery || 0) + (memo.stationeryPaise || 0) / 100}</td>
                <td className="border border-slate-700 p-2 text-right text-white">{(memo.commission || 0) + (memo.commissionPaise || 0) / 100}</td>
                <td className="border border-slate-700 p-2 text-right text-white">{(memo.aoc || 0) + (memo.aocPaise || 0) / 100}</td>
                <td className="border border-slate-700 p-2 text-right text-white font-bold text-amber-400">{memo.totalAmount || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderSummaryTable = () => {
    const flatRows = records.flatMap((reg: any) =>
      (reg.entries || []).map((e: any) => flattenRow(reg, e))
    );
    const filtered = filterRows(flatRows, searchQuery);
    if (flatRows.length === 0) return renderNoData(false);
    if (filtered.length === 0) return renderNoData(true);
    return (
      <div className="overflow-x-auto border border-slate-700 rounded-lg">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-slate-900/80">
              <th className="border border-slate-700 p-2 text-[#2388ff] font-bold">No.</th>
              <th className="border border-slate-700 p-2 text-[#2388ff] font-bold">Date</th>
              <th className="border border-slate-700 p-2 text-[#2388ff] font-bold">Truck No</th>
              <th className="border border-slate-700 p-2 text-[#2388ff] font-bold">Driver</th>
              <th className="border border-slate-700 p-2 text-[#2388ff] font-bold">From</th>
              <th className="border border-slate-700 p-2 text-[#2388ff] font-bold">To</th>
              <th className="border border-slate-700 p-2 text-[#2388ff] font-bold">Transport</th>
              <th className="border border-slate-700 p-2 text-[#2388ff] font-bold">Challan No</th>
              <th className="border border-slate-700 p-2 text-[#2388ff] font-bold">Fare Del.</th>
              <th className="border border-slate-700 p-2 text-[#2388ff] font-bold">Crossing</th>
              <th className="border border-slate-700 p-2 text-[#2388ff] font-bold">Cross Fare</th>
              <th className="border border-slate-700 p-2 text-[#2388ff] font-bold">Labor</th>
              <th className="border border-slate-700 p-2 text-[#2388ff] font-bold">Del. Comm.</th>
              <th className="border border-slate-700 p-2 text-[#2388ff] font-bold">Credit</th>
              <th className="border border-slate-700 p-2 text-[#2388ff] font-bold">Debit</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row: any, i: number) => (
              <tr key={i} className={cn("transition-colors", rowMatches(row, searchQuery) ? "bg-[#2388ff]/10" : "hover:bg-slate-800/40")}>
                <td className="border border-slate-700 p-2 text-center text-slate-400 font-mono text-xs">{row.sno || "—"}</td>
                <td className="border border-slate-700 p-2 text-center text-white">{row._regDate || "—"}</td>
                <td className="border border-slate-700 p-2 text-center text-white">{row.truckNo || "—"}</td>
                <td className="border border-slate-700 p-2 text-center text-white">{row.driverName || "—"}</td>
                <td className="border border-slate-700 p-2 text-center text-white">{row.from || "—"}</td>
                <td className="border border-slate-700 p-2 text-center text-white">{row.to || "—"}</td>
                <td className="border border-slate-700 p-2 text-center text-white">{row.transportName || "—"}</td>
                <td className="border border-slate-700 p-2 text-center text-white">{row.challanNo || "—"}</td>
                <td className="border border-slate-700 p-2 text-right text-white">{row.fareDelivery || "—"}</td>
                <td className="border border-slate-700 p-2 text-right text-white">{row.crossing || "—"}</td>
                <td className="border border-slate-700 p-2 text-right text-white">{row.crossingFare || "—"}</td>
                <td className="border border-slate-700 p-2 text-right text-white">{row.labor || "—"}</td>
                <td className="border border-slate-700 p-2 text-right text-white">{row.deliveryCommission || "—"}</td>
                <td className="border border-slate-700 p-2 text-right text-emerald-400">{row.credit || "—"}</td>
                <td className="border border-slate-700 p-2 text-right text-rose-400">{row.debit || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderDeliveryStatementTable = () => {
    const flatRows = records.flatMap((reg: any) =>
      (reg.entries || []).map((e: any) => flattenRow(reg, e))
    ).sort((a: any, b: any) => (parseInt(b.sno) || 0) - (parseInt(a.sno) || 0));
    const filtered = filterRows(flatRows, searchQuery);
    if (flatRows.length === 0) return renderNoData(false);
    if (filtered.length === 0) return renderNoData(true);
    return (
      <div className="overflow-x-auto border border-slate-700 rounded-lg">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-slate-900/80">
              <th className="border border-slate-700 p-2 text-[#2388ff] font-bold">No.</th>
              <th className="border border-slate-700 p-2 text-[#2388ff] font-bold">Date</th>
              <th className="border border-slate-700 p-2 text-[#2388ff] font-bold">Page No</th>
              <th className="border border-slate-700 p-2 text-[#2388ff] font-bold">S.No</th>
              <th className="border border-slate-700 p-2 text-[#2388ff] font-bold">D.R. No</th>
              <th className="border border-slate-700 p-2 text-[#2388ff] font-bold">Freight</th>
              <th className="border border-slate-700 p-2 text-[#2388ff] font-bold">Labour</th>
              <th className="border border-slate-700 p-2 text-[#2388ff] font-bold">Receipt Ch.</th>
              <th className="border border-slate-700 p-2 text-[#2388ff] font-bold">D. Com</th>
              <th className="border border-slate-700 p-2 text-[#2388ff] font-bold">Demurage</th>
              <th className="border border-slate-700 p-2 text-[#2388ff] font-bold">Total</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row: any, i: number) => {
              const total = (parseFloat(row.freight) || 0) + (parseFloat(row.labour) || 0) + (parseFloat(row.receiptCh) || 0) + (parseFloat(row.dCom) || 0) + (parseFloat(row.demurage) || 0);
              return (
                <tr key={i} className={cn("transition-colors", rowMatches(row, searchQuery) ? "bg-[#2388ff]/10" : "hover:bg-slate-800/40")}>
                  <td className="border border-slate-700 p-2 text-center text-slate-400">{i + 1}</td>
                  <td className="border border-slate-700 p-2 text-center text-white">{row._regDate || "—"}</td>
                  <td className="border border-slate-700 p-2 text-center text-white">{row.pageNo || "—"}</td>
                  <td className="border border-slate-700 p-2 text-center text-slate-400">{row.sno || "—"}</td>
                  <td className="border border-slate-700 p-2 text-center text-white">{row.drNo || "—"}</td>
                  <td className="border border-slate-700 p-2 text-right text-white">{row.freight || "—"}</td>
                  <td className="border border-slate-700 p-2 text-right text-white">{row.labour || "—"}</td>
                  <td className="border border-slate-700 p-2 text-right text-white">{row.receiptCh || "—"}</td>
                  <td className="border border-slate-700 p-2 text-right text-white">{row.dCom || "—"}</td>
                  <td className="border border-slate-700 p-2 text-right text-white">{row.demurage || "—"}</td>
                  <td className="border border-slate-700 p-2 text-right text-white font-bold text-amber-400">{total.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const renderActiveModuleData = () => {
    if (!activeModule) return null;

    const tables: Record<ModuleKey, () => React.ReactNode> = {
      challan: renderChallanTable,
      "cash-memo": renderCashMemoTable,
      summary: renderSummaryTable,
      "delivery-statement": renderDeliveryStatementTable,
    };

    const flatRows = records.flatMap((reg: any) =>
      (reg.entries || []).length > 0 ? reg.entries : [reg]
    );
    const filteredCount = filterRows(flatRows, searchQuery).length;

    return (
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            {modules.find((m) => m.key === activeModule)?.icon}
            {modules.find((m) => m.key === activeModule)?.label} Records
            {loading && <Loader2 className="w-4 h-4 animate-spin text-[#2388ff]" />}
            {!loading && (
              <span className="text-sm font-normal text-slate-500 ml-2">
                {searchQuery.trim() ? (
                  <>{filteredCount} of {flatRows.length} record{flatRows.length !== 1 ? "s" : ""}</>
                ) : (
                  <>{flatRows.length} record{flatRows.length !== 1 ? "s" : ""} across {records.length} register{records.length !== 1 ? "s" : ""}</>
                )}
              </span>
            )}
          </h3>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => { setActiveModule(null); setRecords([]); }}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4 mr-1" /> Close
          </Button>
        </div>
        {tables[activeModule]()}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Observation</h2>
          <p className="text-muted-foreground">View all records across modules — Challan, Cash Memo, Summary, and Delivery Statement.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {modules.map(({ key, label, icon, color }) => {
            const isActive = activeModule === key;
            return (
              <button
                key={key}
                onClick={() => handleCardClick(key)}
                className={cn(
                  "relative group text-left rounded-xl border transition-all duration-200 p-5 cursor-pointer",
                  isActive
                    ? "border-[#2388ff] bg-gradient-to-br shadow-lg shadow-blue-500/10"
                    : "border-slate-700/50 bg-slate-900/40 hover:border-slate-600 hover:bg-slate-800/60"
                )}
              >
                <div className={cn(
                  "absolute inset-0 rounded-xl opacity-10 transition-opacity duration-200",
                  isActive && "opacity-20",
                  `bg-gradient-to-br ${color}`
                )} />
                <div className="relative z-10">
                  <div className={cn(
                    "w-12 h-12 rounded-lg flex items-center justify-center mb-3 transition-colors",
                    isActive ? "bg-[#2388ff]/20 text-[#2388ff]" : "bg-slate-800 text-slate-400 group-hover:text-slate-300"
                  )}>
                    {icon}
                  </div>
                  <h3 className={cn(
                    "text-base font-bold transition-colors",
                    isActive ? "text-white" : "text-slate-300 group-hover:text-white"
                  )}>
                    {label}
                  </h3>
                  <p className={cn(
                    "text-xs mt-1 transition-colors",
                    isActive ? "text-[#2388ff]" : "text-slate-500"
                  )}>
                    {(counts as any)[key] !== undefined ? `${(counts as any)[key]} records` : "—"}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {activeModule && renderActiveModuleData()}

        {!activeModule && (
          <div className="text-center py-20 border border-dashed border-slate-700/50 rounded-xl bg-slate-900/20">
            <Search className="w-16 h-16 mx-auto mb-4 text-slate-600" />
            <h3 className="text-xl font-semibold text-slate-400">Select a Module</h3>
            <p className="text-slate-600 mt-1 max-w-md mx-auto">
              Click on any card above to view all its records from the database.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
