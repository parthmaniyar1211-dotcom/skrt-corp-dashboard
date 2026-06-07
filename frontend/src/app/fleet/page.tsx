"use client";

import React, { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { 
  FileSpreadsheet, 
  Receipt, 
  ClipboardList, 
  Truck, 
  Loader2, 
  X, 
  Search,
  Filter,
  Calendar,
  Download,
  Eye,
  Printer,
  ArrowLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { useHeader } from "@/context/HeaderContext";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ModuleKey = "challan" | "cash-memo" | "summary" | "delivery-statement" | "entry";

const modules: { key: ModuleKey; label: string; icon: React.ReactNode; color: string }[] = [
  { key: "challan", label: "Challan", icon: <ClipboardList className="w-7 h-7" />, color: "from-blue-600/20 to-blue-900/10" },
  { key: "cash-memo", label: "Cash Memo", icon: <Receipt className="w-7 h-7" />, color: "from-emerald-600/20 to-emerald-900/10" },
  { key: "summary", label: "Summary", icon: <FileSpreadsheet className="w-7 h-7" />, color: "from-amber-600/20 to-amber-900/10" },
  { key: "delivery-statement", label: "Delivery Statement", icon: <Truck className="w-7 h-7" />, color: "from-rose-600/20 to-rose-900/10" },
  { key: "entry", label: "Entry", icon: <FileSpreadsheet className="w-7 h-7" />, color: "from-violet-600/20 to-violet-900/10" },
];

const moduleEndpoints: Record<ModuleKey, string> = {
  challan: "/challan",
  "cash-memo": "/cash-memo",
  summary: "/summary",
  "delivery-statement": "/delivery-statement",
  entry: "/entry",
};

const moduleSearchHints: Record<ModuleKey, string> = {
  challan: "Search Challan No, G.R. No, or Driver…",
  "cash-memo": "Search D.R. No or G.R. No…",
  summary: "Search No., Challan No, or Driver…",
  "delivery-statement": "Search Page No, S.No, or D.R. No…",
  entry: "Search Page No, Challan No, or Driver…",
};

const getLocalDateString = (d: Date = new Date()) => {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export default function FleetPage() {
  const { searchQuery } = useHeader();
  const [activeModule, setActiveModule] = useState<ModuleKey | null>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [counts, setCounts] = useState<Record<ModuleKey, number>>({} as any);
  const [localSearch, setLocalSearch] = useState("");
  const [highlightVal, setHighlightVal] = useState<string | null>(null);

  // Date Filtering states
  const [dateFilterType, setDateFilterType] = useState<"all" | "today" | "selected" | "range">("all");
  const [selectedDate, setSelectedDate] = useState(getLocalDateString());
  const [startDate, setStartDate] = useState(getLocalDateString());
  const [endDate, setEndDate] = useState(getLocalDateString());

  // Preview Dialog states
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewModule, setPreviewModule] = useState<ModuleKey | null>(null);
  const [previewData, setPreviewData] = useState<any>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const getRecordDate = (module: ModuleKey, reg: any) => {
    let dateVal = "";
    if (module === "challan") dateVal = reg.date || reg.dateSearch || reg._regDate || "";
    else if (module === "cash-memo") dateVal = reg.date ? new Date(reg.date).toISOString().split('T')[0] : "";
    else if (module === "summary") dateVal = reg.date || reg._regDate || "";
    else if (module === "delivery-statement") dateVal = reg.dateSearch || reg._regDate || "";
    else if (module === "entry") dateVal = reg.dateSearch || reg._regDate || "";
    return dateVal.split('T')[0];
  };

  const matchesDateFilter = (recDate: string) => {
    if (dateFilterType === "all") return true;
    if (!recDate) return false;
    
    if (dateFilterType === "today") {
      const todayStr = getLocalDateString();
      return recDate === todayStr;
    }
    if (dateFilterType === "selected") {
      return recDate === selectedDate;
    }
    if (dateFilterType === "range") {
      return recDate >= startDate && recDate <= endDate;
    }
    return true;
  };

  const getFilteredRegisters = useCallback(() => {
    if (!activeModule) return [];
    return records.filter(reg => {
      const recDate = getRecordDate(activeModule, reg);
      return matchesDateFilter(recDate);
    });
  }, [records, activeModule, dateFilterType, selectedDate, startDate, endDate]);

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

  const handleRowClick = async (module: ModuleKey, regId: string) => {
    setPreviewLoading(true);
    setPreviewOpen(true);
    setPreviewModule(module);
    setPreviewData(null);
    try {
      const endpoint = moduleEndpoints[module];
      const { data } = await api.get(`${endpoint}/${regId}`);
      if (data.success) {
        setPreviewData(data.data);
      } else {
        toast.error("Failed to load record details");
        setPreviewOpen(false);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch record details");
      setPreviewOpen(false);
    } finally {
      setPreviewLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      const highlightParam = params.get("highlight");
      if (highlightParam) {
        setHighlightVal(highlightParam);
      } else {
        setHighlightVal(null);
      }
      if (tabParam) {
        const validModules: ModuleKey[] = ["challan", "cash-memo", "summary", "delivery-statement", "entry"];
        if (validModules.includes(tabParam as ModuleKey)) {
          setActiveModule(tabParam as ModuleKey);
          fetchRecords(tabParam as ModuleKey);
        }
      }
    }
  }, [fetchRecords]);

  // Hook scroll highlight blinking row + Auto-open preview modal
  useEffect(() => {
    if (highlightVal && records.length > 0 && activeModule) {
      const lowerHighlight = highlightVal.toLowerCase();
      let matchedRegId = "";
      let elementId = "";

      if (activeModule === "challan") {
        const matched = records.find(reg => 
          String(reg.challanNo || "").toLowerCase() === lowerHighlight ||
          (reg.entries || []).some((e: any) => String(e.grNo || "").toLowerCase() === lowerHighlight)
        );
        if (matched) {
          matchedRegId = matched._id;
          elementId = `row-challan-${matched.challanNo}`;
        }
      } else if (activeModule === "cash-memo") {
        const matched = records.find(reg => 
          String(reg.drNo || "").toLowerCase() === lowerHighlight ||
          String(reg.grNo || "").toLowerCase() === lowerHighlight
        );
        if (matched) {
          matchedRegId = matched._id;
          elementId = `row-cash-memo-${matched.drNo}`;
        }
      } else if (activeModule === "summary") {
        const matched = records.find(reg => 
          (reg.entries || []).some((e: any) => 
            String(e.sno || "").toLowerCase() === lowerHighlight ||
            String(e.challanNo || "").toLowerCase() === lowerHighlight
          )
        );
        if (matched) {
          matchedRegId = matched._id;
          const matchedEntry = matched.entries.find((e: any) => String(e.sno || "").toLowerCase() === lowerHighlight || String(e.challanNo || "").toLowerCase() === lowerHighlight);
          elementId = `row-summary-${matchedEntry?.sno || matched.entries[0]?.sno}`;
        }
      } else if (activeModule === "delivery-statement") {
        const matched = records.find(reg => 
          String(reg.pageNo || "").toLowerCase() === lowerHighlight ||
          (reg.entries || []).some((e: any) => String(e.sno || "").toLowerCase() === lowerHighlight)
        );
        if (matched) {
          matchedRegId = matched._id;
          elementId = `row-delivery-statement-${matched.pageNo}`;
        }
      } else if (activeModule === "entry") {
        const matched = records.find(reg => 
          String(reg.pageNo || "").toLowerCase() === lowerHighlight ||
          String(reg.challanNo || "").toLowerCase() === lowerHighlight ||
          (reg.entries || []).some((e: any) => String(e.sno || "").toLowerCase() === lowerHighlight)
        );
        if (matched) {
          matchedRegId = matched._id;
          elementId = `row-entry-${matched.pageNo}`;
        }
      }

      if (matchedRegId) {
        handleRowClick(activeModule, matchedRegId);
        
        const timer = setTimeout(() => {
          const el = document.getElementById(elementId);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            el.classList.add("animate-row-blink");
            setTimeout(() => {
              el.classList.remove("animate-row-blink");
            }, 3000);
          }
        }, 600);
        return () => clearTimeout(timer);
      }
    }
  }, [highlightVal, records, activeModule]);

  const handleCardClick = (key: ModuleKey) => {
    if (activeModule === key) {
      setActiveModule(null);
      setRecords([]);
      setLocalSearch("");
      return;
    }
    setActiveModule(key);
    setLocalSearch("");
    fetchRecords(key);
  };

  const effectiveQuery = (localSearch || searchQuery).trim().toLowerCase();

  const isChallanMatch = (row: any, q: string) => {
    const lower = q.toLowerCase().trim();
    if (!lower) return false;
    return (
      String(row.challanNo || "").toLowerCase().includes(lower) ||
      String(row.grNo || "").toLowerCase().includes(lower) ||
      String(row.driverName || "").toLowerCase().includes(lower)
    );
  };

  const isCashMemoMatch = (row: any, q: string) => {
    const lower = q.toLowerCase().trim();
    if (!lower) return false;
    return (
      String(row.drNo || "").toLowerCase().includes(lower) ||
      String(row.grNo || "").toLowerCase().includes(lower)
    );
  };

  const isSummaryMatch = (row: any, q: string) => {
    const lower = q.toLowerCase().trim();
    if (!lower) return false;
    return (
      String(row.sno || "").toLowerCase().includes(lower) ||
      String(row.challanNo || "").toLowerCase().includes(lower) ||
      String(row.driverName || "").toLowerCase().includes(lower)
    );
  };

  const isDeliveryStatementMatch = (row: any, q: string) => {
    const lower = q.toLowerCase().trim();
    if (!lower) return false;
    return (
      String(row.pageNo || "").toLowerCase().includes(lower) ||
      String(row.sno || "").toLowerCase().includes(lower) ||
      String(row.drNo || "").toLowerCase().includes(lower)
    );
  };

  const isEntryMatch = (row: any, q: string) => {
    const lower = q.toLowerCase().trim();
    if (!lower) return false;
    return (
      String(row.pageNo || "").toLowerCase().includes(lower) ||
      String(row.challanNo || "").toLowerCase().includes(lower) ||
      String(row.driverName || "").toLowerCase().includes(lower) ||
      String(row.vehicleNo || "").toLowerCase().includes(lower) ||
      String(row.grNo || "").toLowerCase().includes(lower) ||
      String(row.consignor || "").toLowerCase().includes(lower) ||
      String(row.consignee || "").toLowerCase().includes(lower) ||
      String(row.deliveryReceiptNo || "").toLowerCase().includes(lower)
    );
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
    return { 
      _regId: reg._id, 
      ...entry, 
      ...(reg.date ? { _regDate: reg.date } : {}), 
      ...(reg.dateSearch ? { _regDate: reg.dateSearch } : {}), 
      ...(reg.challanNo ? { challanNo: reg.challanNo } : {}), 
      ...(reg.vehicleNo ? { vehicleNo: reg.vehicleNo } : {}), 
      ...(reg.driverName ? { driverName: reg.driverName } : {}), 
      ...(reg.pageNo ? { pageNo: reg.pageNo } : {}), 
      ...(reg.from ? { _regFrom: reg.from } : {}),
      ...(reg.fromData ? { fromData: reg.fromData } : {}),
      ...(reg.toData ? { toData: reg.toData } : {})
    };
  };

  const handleDownload = () => {
    if (!activeModule) return;
    const filteredRegs = getFilteredRegisters();
    
    let headers: string[] = [];
    let csvRows: any[][] = [];
    
    if (activeModule === "challan") {
      headers = ["Date", "Challan No", "Vehicle", "Driver", "G.R. No", "Pkg", "Dest.", "Content", "Consignor", "Consignee", "Total", "Wt"];
      const flat = filteredRegs.flatMap((reg: any) =>
        (reg.entries || []).map((e: any) => flattenRow(reg, e))
      );
      csvRows = flat.map((r: any) => [
        r._regDate || "",
        r.challanNo || "",
        r.vehicleNo || "",
        r.driverName || "",
        r.grNo || "",
        r.pkg || "",
        r.dest || "",
        r.content || "",
        r.consignor || "",
        r.consignee || "",
        r.total || "",
        r.wt || ""
      ]);
    } else if (activeModule === "cash-memo") {
      headers = ["D.R. No", "G.R. No", "Date", "From", "Consignee", "Freight", "Labour", "Stationery", "Commission", "A.O.C.", "Total"];
      csvRows = filteredRegs.map((memo: any) => [
        memo.drNo || "",
        memo.grNo || "",
        memo.date ? new Date(memo.date).toLocaleDateString() : "",
        memo.from || "",
        memo.consignee || "",
        (memo.freight || 0) + (memo.freightPaise || 0) / 100,
        (memo.labour || 0) + (memo.labourPaise || 0) / 100,
        (memo.stationery || 0) + (memo.stationeryPaise || 0) / 100,
        (memo.commission || 0) + (memo.commissionPaise || 0) / 100,
        (memo.aoc || 0) + (memo.aocPaise || 0) / 100,
        memo.totalAmount || 0
      ]);
    } else if (activeModule === "summary") {
      headers = ["Date", "S.No", "Truck No", "Driver", "From", "To", "Transport", "Challan No", "Fare Del.", "Crossing", "Cross Fare", "Labor", "Del. Comm.", "Credit", "Debit", "Grand Total", "Note"];
      const flat = filteredRegs.flatMap((reg: any) =>
        (reg.entries || []).map((e: any) => flattenRow(reg, e))
      );
      csvRows = flat.map((r: any) => [
        r._regDate || "",
        r.sno || "",
        r.truckNo || "",
        r.driverName || "",
        r.from || "",
        r.to || "",
        r.transportName || "",
        r.challanNo || "",
        r.fareDelivery || "",
        r.crossing || "",
        r.crossingFare || "",
        r.labor || "",
        r.deliveryCommission || "",
        r.credit || "",
        r.debit || "",
        r.grandTotal || "",
        r.note || ""
      ]);
    } else if (activeModule === "delivery-statement") {
      headers = ["Date", "Page No", "S.No", "D.R. No", "Freight", "Labour", "Stationery", "D. Com", "Demurage", "Total"];
      const flat = filteredRegs.flatMap((reg: any) =>
        (reg.entries || []).map((e: any) => flattenRow(reg, e))
      );
      csvRows = flat.map((r: any) => {
        const total = (parseFloat(r.freight) || 0) + (parseFloat(r.labour) || 0) + (parseFloat(r.receiptCh) || 0) + (parseFloat(r.dCom) || 0) + (parseFloat(r.demurage) || 0);
        return [
          r._regDate || "",
          r.pageNo || "",
          r.sno || "",
          r.drNo || "",
          r.freight || "",
          r.labour || "",
          r.receiptCh || "",
          r.dCom || "",
          r.demurage || "",
          total.toFixed(2)
        ];
      });
    } else if (activeModule === "entry") {
      headers = ["Date", "Page No", "Challan No", "Vehicle", "Driver", "S.No", "From", "To", "G.R. No", "Consignor", "Consignee", "No of Packages", "Contents", "Freight", "Delivery Receipt No", "Date of Delivery", "Status"];
      const flat = filteredRegs.flatMap((reg: any) =>
        (reg.entries || []).map((e: any) => flattenRow(reg, e))
      );
      csvRows = flat.map((r: any) => [
        r._regDate || "",
        r.pageNo || "",
        r.challanNo || "",
        r.vehicleNo || "",
        r.driverName || "",
        r.sno || "",
        r.from || "",
        r.to || "",
        r.grNo || "",
        r.consignor || "",
        r.consignee || "",
        r.noOfPackages || "",
        r.contents || "",
        r.freight || "",
        r.deliveryReceiptNo || "",
        r.dateOfDelivery || "",
        r.deliveryStatus || ""
      ]);
    }

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" +
      [headers, ...csvRows].map(e => e.map(val => '"' + String(val ?? '').replace(/"/g, '""') + '"').join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const dateSuffix = dateFilterType === "today" ? "_today" : dateFilterType === "selected" ? `_${selectedDate}` : dateFilterType === "range" ? `_range_${startDate}_to_${endDate}` : "_all";
    link.setAttribute("download", `${activeModule}_records${dateSuffix}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`${modules.find(m => m.key === activeModule)?.label} data downloaded successfully`);
  };

  const renderChallanTable = (filteredRegs: any[]) => {
    const flatRows = filteredRegs.flatMap((reg: any) =>
      (reg.entries || []).map((e: any) => flattenRow(reg, e))
    );
    const lower = effectiveQuery;
    const filtered = lower ? flatRows.filter(r => isChallanMatch(r, lower)) : flatRows;
    
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
              <tr 
                key={i} 
                id={`row-challan-${row.challanNo}`} 
                onClick={() => handleRowClick("challan", row._regId)}
                className={cn("transition-colors cursor-pointer", isChallanMatch(row, searchQuery) ? "bg-[#2388ff]/10" : "hover:bg-slate-800/40")}
              >
                <td className="border border-slate-700 p-2 text-center text-slate-400">{i + 1}</td>
                <td className="border border-slate-700 p-2 text-center text-white">{row._regDate || "—"}</td>
                <td className="border border-slate-700 p-2 text-center text-white font-medium">{row.challanNo || "—"}</td>
                <td className="border border-slate-700 p-2 text-center text-white">{row.vehicleNo || "—"}</td>
                <td className="border border-slate-700 p-2 text-center text-white">{row.driverName || "—"}</td>
                <td className="border border-slate-700 p-2 text-center text-white">{row.grNo || "—"}</td>
                <td className="border border-slate-700 p-2 text-center text-white">{row.pkg || "—"}</td>
                <td className="border border-slate-700 p-2 text-center text-white">{row.dest || "—"}</td>
                <td className="border border-slate-700 p-2 text-center text-white">{row.content || "—"}</td>
                <td className="border border-slate-700 p-2 text-center text-white max-w-[100px] truncate">{row.consignor || "—"}</td>
                <td className="border border-slate-700 p-2 text-center text-white max-w-[100px] truncate">{row.consignee || "—"}</td>
                <td className="border border-slate-700 p-2 text-right text-white font-bold">{row.total || "—"}</td>
                <td className="border border-slate-700 p-2 text-right text-white">{row.wt || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderCashMemoTable = (filteredRegs: any[]) => {
    if (filteredRegs.length === 0) return renderNoData(false);
    const lower = effectiveQuery;
    const filtered = lower ? filteredRegs.filter(r => isCashMemoMatch(r, lower)) : filteredRegs;
    
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
              <tr 
                key={i} 
                id={`row-cash-memo-${memo.drNo}`} 
                onClick={() => handleRowClick("cash-memo", memo._id)}
                className={cn("transition-colors cursor-pointer", isCashMemoMatch(memo, searchQuery) ? "bg-[#2388ff]/10" : "hover:bg-slate-800/40")}
              >
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

  const renderSummaryTable = (filteredRegs: any[]) => {
    const flatRows = filteredRegs.flatMap((reg: any) =>
      (reg.entries || []).map((e: any) => flattenRow(reg, e))
    );
    const lower = effectiveQuery;
    const filtered = lower ? flatRows.filter(r => isSummaryMatch(r, lower)) : flatRows;
    
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
              <th className="border border-slate-700 p-2 text-[#2388ff] font-bold">Grand Total</th>
              <th className="border border-slate-700 p-2 text-[#2388ff] font-bold">Note</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row: any, i: number) => (
              <tr 
                key={i} 
                id={`row-summary-${row.sno}`} 
                onClick={() => handleRowClick("summary", row._regId)}
                className={cn("transition-colors cursor-pointer", isSummaryMatch(row, searchQuery) ? "bg-[#2388ff]/10" : "hover:bg-slate-800/40")}
              >
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
                <td className="border border-slate-700 p-2 text-right text-amber-400 font-bold">{row.grandTotal || "—"}</td>
                <td className="border border-slate-700 p-2 text-left text-slate-300 max-w-[150px] truncate" title={row.note}>{row.note || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderDeliveryStatementTable = (filteredRegs: any[]) => {
    const flatRows = filteredRegs.flatMap((reg: any) =>
      (reg.entries || []).map((e: any) => flattenRow(reg, e))
    ).sort((a: any, b: any) => (parseInt(b.sno) || 0) - (parseInt(a.sno) || 0));
    const lower = effectiveQuery;
    const filtered = lower ? flatRows.filter(r => isDeliveryStatementMatch(r, lower)) : flatRows;
    
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
              <th className="border border-slate-700 p-2 text-[#2388ff] font-bold">Stationery</th>
              <th className="border border-slate-700 p-2 text-[#2388ff] font-bold">D. Com</th>
              <th className="border border-slate-700 p-2 text-[#2388ff] font-bold">Demurage</th>
              <th className="border border-slate-700 p-2 text-[#2388ff] font-bold">Total</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row: any, i: number) => {
              const total = (parseFloat(row.freight) || 0) + (parseFloat(row.labour) || 0) + (parseFloat(row.receiptCh) || 0) + (parseFloat(row.dCom) || 0) + (parseFloat(row.demurage) || 0);
              return (
                <tr 
                  key={i} 
                  id={`row-delivery-statement-${row.pageNo}`} 
                  onClick={() => handleRowClick("delivery-statement", row._regId)}
                  className={cn("transition-colors cursor-pointer", isDeliveryStatementMatch(row, searchQuery) ? "bg-[#2388ff]/10" : "hover:bg-slate-800/40")}
                >
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

  const renderEntryTable = (filteredRegs: any[]) => {
    const flatRows = filteredRegs.flatMap((reg: any) =>
      (reg.entries || []).map((e: any) => flattenRow(reg, e))
    );
    const lower = effectiveQuery;
    const filtered = lower ? flatRows.filter(r => isEntryMatch(r, lower)) : flatRows;
    
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
              <th className="border border-slate-700 p-2 text-[#2388ff] font-bold">Challan No</th>
              <th className="border border-slate-700 p-2 text-[#2388ff] font-bold">Vehicle</th>
              <th className="border border-slate-700 p-2 text-[#2388ff] font-bold">Driver</th>
              <th className="border border-slate-700 p-2 text-[#2388ff] font-bold">S.No.</th>
              <th className="border border-slate-700 p-2 text-[#2388ff] font-bold">From</th>
              <th className="border border-slate-700 p-2 text-[#2388ff] font-bold">To</th>
              <th className="border border-slate-700 p-2 text-[#2388ff] font-bold">G.R. No</th>
              <th className="border border-slate-700 p-2 text-[#2388ff] font-bold">Consignor</th>
              <th className="border border-slate-700 p-2 text-[#2388ff] font-bold">Consignee</th>
              <th className="border border-slate-700 p-2 text-[#2388ff] font-bold">Pkg</th>
              <th className="border border-slate-700 p-2 text-[#2388ff] font-bold">Contents</th>
              <th className="border border-slate-700 p-2 text-[#2388ff] font-bold">Freight</th>
              <th className="border border-slate-700 p-2 text-[#2388ff] font-bold">Receipt No</th>
              <th className="border border-slate-700 p-2 text-[#2388ff] font-bold">Del. Date</th>
              <th className="border border-slate-700 p-2 text-[#2388ff] font-bold">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row: any, i: number) => (
              <tr 
                key={i} 
                id={`row-entry-${row.pageNo}`} 
                onClick={() => handleRowClick("entry", row._regId)}
                className={cn("transition-colors cursor-pointer", isEntryMatch(row, searchQuery) ? "bg-[#2388ff]/10" : "hover:bg-slate-800/40")}
              >
                <td className="border border-slate-700 p-2 text-center text-slate-400">{i + 1}</td>
                <td className="border border-slate-700 p-2 text-center text-white">{row._regDate || "—"}</td>
                <td className="border border-slate-700 p-2 text-center text-white">{row.pageNo || "—"}</td>
                <td className="border border-slate-700 p-2 text-center text-white font-medium">{row.challanNo || "—"}</td>
                <td className="border border-slate-700 p-2 text-center text-white">{row.vehicleNo || "—"}</td>
                <td className="border border-slate-700 p-2 text-center text-white">{row.driverName || "—"}</td>
                <td className="border border-slate-700 p-2 text-center text-slate-400">{row.sno || "—"}</td>
                <td className="border border-slate-700 p-2 text-center text-white">{row.from || "—"}</td>
                <td className="border border-slate-700 p-2 text-center text-white">{row.to || "—"}</td>
                <td className="border border-slate-700 p-2 text-center text-white">{row.grNo || "—"}</td>
                <td className="border border-slate-700 p-2 text-center text-white max-w-[100px] truncate" title={row.consignor}>{row.consignor || "—"}</td>
                <td className="border border-slate-700 p-2 text-center text-white max-w-[100px] truncate" title={row.consignee}>{row.consignee || "—"}</td>
                <td className="border border-slate-700 p-2 text-center text-white">{row.noOfPackages || "—"}</td>
                <td className="border border-slate-700 p-2 text-center text-white max-w-[100px] truncate" title={row.contents}>{row.contents || "—"}</td>
                <td className="border border-slate-700 p-2 text-right text-white">{row.freight || "—"}</td>
                <td className="border border-slate-700 p-2 text-center text-white">{row.deliveryReceiptNo || "—"}</td>
                <td className="border border-slate-700 p-2 text-center text-white">{row.dateOfDelivery || "—"}</td>
                <td className="border border-slate-700 p-2 text-center">
                  <span className={cn(
                    "px-1.5 py-0.5 rounded text-[10px] font-bold uppercase",
                    row.deliveryStatus === "Complete" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                  )}>
                    {row.deliveryStatus || "Pending"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderActiveModuleData = () => {
    if (!activeModule) return null;

    const filteredRegs = getFilteredRegisters();

    const tables: Record<ModuleKey, (data: any[]) => React.ReactNode> = {
      challan: renderChallanTable,
      "cash-memo": renderCashMemoTable,
      summary: renderSummaryTable,
      "delivery-statement": renderDeliveryStatementTable,
      entry: renderEntryTable,
    };

    const flatRowsCount = filteredRegs.flatMap((reg: any) =>
      (reg.entries || []).length > 0 ? reg.entries : [reg]
    ).length;

    return (
      <div className="mt-8 space-y-4">
        {/* Date Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 p-4 bg-slate-900/40 border border-slate-700/50 rounded-xl">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#2388ff]" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Date Filter</span>
          </div>
          
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-lg p-0.5">
            {(["all", "today", "selected", "range"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setDateFilterType(type)}
                className={cn(
                  "px-3 py-1 rounded-md text-xs font-medium uppercase tracking-wider transition-all",
                  dateFilterType === type
                    ? "bg-[#2388ff] text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                )}
              >
                {type === "all" ? "All Time" : type === "selected" ? "Single Date" : type}
              </button>
            ))}
          </div>

          {dateFilterType === "selected" && (
            <div className="flex items-center gap-2 animate-fadeIn">
              <Calendar className="w-4 h-4 text-slate-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white outline-none focus:border-[#2388ff]"
                style={{ colorScheme: "dark" }}
              />
            </div>
          )}

          {dateFilterType === "range" && (
            <div className="flex items-center gap-2 animate-fadeIn border-l border-slate-800 pl-3">
              <Calendar className="w-4 h-4 text-slate-400" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white outline-none focus:border-[#2388ff]"
                style={{ colorScheme: "dark" }}
              />
              <span className="text-xs text-slate-500 font-bold uppercase mx-1">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white outline-none focus:border-[#2388ff]"
                style={{ colorScheme: "dark" }}
              />
            </div>
          )}

          <Button
            size="sm"
            onClick={handleDownload}
            disabled={loading || filteredRegs.length === 0}
            className="ml-auto bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs py-1.5 h-8"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" /> Export CSV
          </Button>
        </div>

        {/* Table Title and local search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            {modules.find((m) => m.key === activeModule)?.icon}
            {modules.find((m) => m.key === activeModule)?.label} Records
            {loading && <Loader2 className="w-4 h-4 animate-spin text-[#2388ff]" />}
            {!loading && (
              <span className="text-sm font-normal text-slate-500 ml-2">
                {flatRowsCount} row{flatRowsCount !== 1 ? "s" : ""} across {filteredRegs.length} register{filteredRegs.length !== 1 ? "s" : ""}
              </span>
            )}
          </h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder={activeModule ? moduleSearchHints[activeModule] : "Search records…"}
                className="h-9 pl-9 pr-3 w-[280px] rounded-lg bg-slate-900 border border-slate-700 text-white text-sm outline-none focus:border-[#2388ff] transition-colors"
              />
              {localSearch && (
                <button
                  onClick={() => setLocalSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => { setActiveModule(null); setRecords([]); setLocalSearch(""); }}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4 mr-1" /> Close
            </Button>
          </div>
        </div>
        
        {tables[activeModule](filteredRegs)}
      </div>
    );
  };

  const renderPreviewContent = () => {
    if (!previewModule || !previewData) return null;

    // ─── CHALLAN PREVIEW ───────────────────────────────────────────────
    if (previewModule === "challan") {
      return (
        <div className="bg-slate-900/40 border border-[#2388ff]/30 rounded-xl p-6 md:p-8 max-w-4xl mx-auto shadow-2xl relative">
          <div className="text-center border-b border-blue-900/50 pb-4 mb-4">
            <div className="text-[10px] tracking-widest text-[#2388ff] mb-2 uppercase font-bold">
              Subject to BHILWARA Jurisdiction
            </div>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <div className="text-2xl font-black tracking-wide text-rose-500 uppercase">
                Sant Kanwar Ram Transport Corp.
              </div>
            </div>
            <div className="text-xs text-[#2388ff] mt-1">
              123-124, Transport Nagar, BHILWARA - 311001 (RAJ.) · Mob.: 96809-92567, 86196-06627
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm">
            <div className="flex justify-between border-b border-slate-800 pb-1.5">
              <span className="font-bold text-[#2388ff]">From Bhilwara To:</span>
              <span className="text-white font-semibold">{previewData.from || "—"}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-1.5">
              <span className="font-bold text-[#2388ff]">Date:</span>
              <span className="text-white font-mono">{previewData.date || "—"}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-1.5">
              <span className="font-bold text-[#2388ff]">Challan No:</span>
              <span className="text-rose-500 font-extrabold text-lg">{previewData.challanNo || "—"}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-1.5">
              <span className="font-bold text-[#2388ff]">Vehicle No:</span>
              <span className="text-white font-semibold">{previewData.vehicleNo || "—"}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-1.5">
              <span className="font-bold text-[#2388ff]">Owner's Name:</span>
              <span className="text-white font-semibold">{previewData.ownerName || "—"}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-1.5 md:col-span-2">
              <span className="font-bold text-[#2388ff]">Driver's Name:</span>
              <span className="text-white font-semibold">{previewData.driverName || "—"}</span>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-lg">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-800 text-[#2388ff]">
                  <th className="p-2 border border-slate-800 text-center">S.No.</th>
                  <th className="p-2 border border-slate-800 text-center">G.R. No.</th>
                  <th className="p-2 border border-slate-800 text-center">Packages</th>
                  <th className="p-2 border border-slate-800 text-right">Weight (Q.)</th>
                  <th className="p-2 border border-slate-800">Destination</th>
                  <th className="p-2 border border-slate-800">Content</th>
                  <th className="p-2 border border-slate-800">Consignor</th>
                  <th className="p-2 border border-slate-800">Consignee</th>
                  <th className="p-2 border border-slate-800 text-right">Freight (Rs)</th>
                </tr>
              </thead>
              <tbody>
                {(previewData.entries || []).map((e: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-800/30">
                    <td className="p-2 border border-slate-800 text-center text-slate-400">{e.sno || idx + 1}</td>
                    <td className="p-2 border border-slate-800 text-center text-white">{e.grNo || "—"}</td>
                    <td className="p-2 border border-slate-800 text-center text-white">{e.pkg || "—"}</td>
                    <td className="p-2 border border-slate-800 text-right text-white">{e.wt || "—"}</td>
                    <td className="p-2 border border-slate-800 text-white">{e.dest || "—"}</td>
                    <td className="p-2 border border-slate-800 text-white">{e.content || "—"}</td>
                    <td className="p-2 border border-slate-800 text-white max-w-[100px] truncate">{e.consignor || "—"}</td>
                    <td className="p-2 border border-slate-800 text-white max-w-[100px] truncate">{e.consignee || "—"}</td>
                    <td className="p-2 border border-slate-800 text-right text-amber-400 font-bold">{e.total || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between items-end mt-8 pt-4 border-t border-slate-800 text-xs">
            <div className="text-slate-500 font-medium">Driver Signature</div>
            <div className="text-right text-[#2388ff] font-bold">
              For Sant Kanwar Ram Transport Corp. (BHL.)
            </div>
          </div>
        </div>
      );
    }

    if (previewModule === "cash-memo") {
      const totalAmount = parseFloat(previewData.totalAmount) || 0;
      return (
        <div className="bg-slate-900/40 border border-emerald-500/30 rounded-xl p-6 md:p-8 max-w-md mx-auto shadow-2xl relative" style={{ borderLeft: "5px solid #10b981" }}>
          <div className="text-center border-b border-emerald-900/50 pb-4 mb-4">
            <h2 className="text-xl font-black text-emerald-400 uppercase tracking-wider">CASH MEMO RECEIPT</h2>
            <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-widest">Sant Kanwar Ram Transport Corp.</p>
          </div>

          <div className="space-y-3 text-sm mb-6">
            <div className="flex justify-between border-b border-slate-800 pb-1">
              <span className="text-slate-400">D.R. No:</span>
              <span className="text-white font-extrabold">{previewData.drNo || "—"}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-1">
              <span className="text-slate-400">G.R. No:</span>
              <span className="text-white font-semibold">{previewData.grNo || "—"}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-1">
              <span className="text-slate-400">Date:</span>
              <span className="text-white font-mono">{previewData.date ? new Date(previewData.date).toLocaleDateString() : "—"}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-1">
              <span className="text-slate-400">From:</span>
              <span className="text-white font-semibold">{previewData.from || "—"}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-1">
              <span className="text-slate-400">Consignee:</span>
              <span className="text-white font-semibold">{previewData.consignee || "—"}</span>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2.5 text-sm">
            <div className="flex justify-between text-slate-400">
              <span>Freight:</span>
              <span className="text-white font-mono">₹ {(previewData.freight || 0) + (previewData.freightPaise || 0)/100}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Labour:</span>
              <span className="text-white font-mono">₹ {(previewData.labour || 0) + (previewData.labourPaise || 0)/100}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Stationery:</span>
              <span className="text-white font-mono">₹ {(previewData.stationery || 0) + (previewData.stationeryPaise || 0)/100}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Commission:</span>
              <span className="text-white font-mono">₹ {(previewData.commission || 0) + (previewData.commissionPaise || 0)/100}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>A.O.C:</span>
              <span className="text-white font-mono">₹ {(previewData.aoc || 0) + (previewData.aocPaise || 0)/100}</span>
            </div>
            <div className="h-px bg-slate-800 my-2" />
            <div className="flex justify-between items-center text-emerald-400 font-extrabold text-lg">
              <span>TOTAL:</span>
              <span>₹ {totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      );
    }

    if (previewModule === "summary") {
      return (
        <div className="space-y-6 max-h-[70vh] overflow-y-auto px-4">
          {(previewData.entries || []).map((e: any, idx: number) => {
            const fareDelivery = parseFloat(e.fareDelivery) || 0;
            const crossingFare = parseFloat(e.crossingFare) || 0;
            const deliveryCommission = parseFloat(e.deliveryCommission) || 0;
            const crossing = parseFloat(e.crossing) || 0;
            const labor = parseFloat(e.labor) || 0;
            const credit = parseFloat(e.credit) || 0;
            const debit = parseFloat(e.debit) || 0;
            const subtotal = fareDelivery + crossingFare + deliveryCommission - crossing - labor;
            const total = subtotal + credit - debit;
            
            return (
              <div 
                key={idx} 
                className="border-2 border-[#ffaec1]/45 rounded-xl overflow-hidden shadow-2xl max-w-xl mx-auto animate-fadeIn"
                style={{ background: "linear-gradient(145deg, #1b0c10 0%, #0c0406 100%)" }}
              >
                <div className="p-6">
                  <div className="flex justify-between text-[9px] text-[#ffaec1]/60 font-semibold mb-1 uppercase tracking-wide">
                    <span>Mob. 96809-92567</span>
                    <span>Mob. 86196-06627</span>
                  </div>
                  <div className="text-center text-[9px] text-slate-500/80 mb-3 italic tracking-wide">
                    All disputes subject to Bhilwara jurisdiction
                  </div>

                  <div className="text-center mb-1">
                    <h2 className="text-lg font-black uppercase text-[#ffaec1] tracking-wide leading-tight">
                      SANT KANWAR RAM TRANSPORT CORP.
                    </h2>
                    <p className="text-[10px] text-slate-500 tracking-wider">Bhilwara - 311001 (Raj.)</p>
                  </div>

                  <div className="flex items-center gap-3 my-3">
                    <div className="flex-1 h-px bg-[#ffaec1]/30" />
                    <span className="text-[11px] font-black uppercase tracking-[4px] text-[#ffaec1]">Summary</span>
                    <div className="flex-1 h-px bg-[#ffaec1]/30" />
                  </div>

                  <div className="flex justify-between items-center mb-4 text-xs font-mono">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-[#ffaec1]">No:</span>
                      <span className="text-rose-400 font-extrabold text-base">{e.sno || idx + 1}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-[#ffaec1]">Date:</span>
                      <span className="text-white">{previewData.date || "—"}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs mb-4">
                    <div className="border-b border-[#ffaec1]/10 pb-1"><span className="text-slate-500">Truck No:</span> <strong className="text-white float-right">{e.truckNo || "—"}</strong></div>
                    <div className="border-b border-[#ffaec1]/10 pb-1"><span className="text-slate-500">Driver Name:</span> <strong className="text-white float-right">{e.driverName || "—"}</strong></div>
                    <div className="border-b border-[#ffaec1]/10 pb-1"><span className="text-slate-500">From:</span> <strong className="text-white float-right">{e.from || "—"}</strong></div>
                    <div className="border-b border-[#ffaec1]/10 pb-1"><span className="text-slate-500">To:</span> <strong className="text-white float-right">{e.to || "—"}</strong></div>
                    <div className="border-b border-[#ffaec1]/10 pb-1"><span className="text-slate-500">Transport:</span> <strong className="text-white float-right">{e.transportName || "—"}</strong></div>
                    <div className="border-b border-[#ffaec1]/10 pb-1"><span className="text-slate-500">Challan No:</span> <strong className="text-white float-right">{e.challanNo || "—"}</strong></div>
                    <div className="border-b border-[#ffaec1]/10 pb-1 col-span-2"><span className="text-slate-500">Total Count:</span> <strong className="text-white float-right">{e.totalCount || "—"}</strong></div>
                  </div>

                  <div className="bg-[#ffaec1]/5 p-3.5 rounded-lg border border-[#ffaec1]/15 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-400"><span>Fare Delivery:</span> <span className="text-white font-mono">₹ {e.fareDelivery || "0"}</span></div>
                    <div className="flex justify-between text-slate-400"><span>Crossing:</span> <span className="text-white font-mono">₹ {e.crossing || "0"}</span></div>
                    <div className="flex justify-between text-slate-400"><span>Crossing Fare:</span> <span className="text-white font-mono">₹ {e.crossingFare || "0"}</span></div>
                    <div className="flex justify-between text-slate-400"><span>Labor:</span> <span className="text-white font-mono">₹ {e.labor || "0"}</span></div>
                    <div className="flex justify-between text-slate-400"><span>Del. Commission:</span> <span className="text-white font-mono">₹ {e.deliveryCommission || "0"}</span></div>
                    {e.note && <div className="text-[10.5px] italic text-[#ffaec1]/85 mt-1 border-t border-[#ffaec1]/10 pt-1">Note: {e.note}</div>}
                    
                    <div className="flex items-center gap-1.5 py-1.5">
                      <div className="flex-1 h-px bg-[#ffaec1]/15" />
                      <span className="text-[9px] uppercase tracking-wider text-slate-500">Adjustments</span>
                      <div className="flex-1 h-px bg-[#ffaec1]/15" />
                    </div>

                    <div className="grid grid-cols-2 gap-x-4">
                      <div className="flex justify-between text-emerald-400"><span>Credit:</span> <span className="font-mono">₹ {e.credit || "0"}</span></div>
                      <div className="flex justify-between text-rose-400"><span>Debit:</span> <span className="font-mono">₹ {e.debit || "0"}</span></div>
                    </div>
                    
                    <div className="h-px bg-[#ffaec1]/20 my-2" />
                    <div className="flex justify-between items-center text-[#ffaec1] font-extrabold text-base">
                      <span>GRAND TOTAL:</span>
                      <span className="text-rose-400">₹ {total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    if (previewModule === "delivery-statement") {
      return (
        <div className="bg-slate-900/40 border border-rose-500/30 rounded-xl p-6 md:p-8 max-w-4xl mx-auto shadow-2xl">
          <div className="text-center border-b border-rose-900/50 pb-4 mb-4">
            <h2 className="text-2xl font-black text-rose-400 uppercase tracking-widest">DELIVERY STATEMENT</h2>
            <div className="text-xs text-slate-500 tracking-wider mt-1 uppercase font-bold">Sant Kanwar Ram Transport Corp.</div>
          </div>

          <div className="flex justify-between text-sm mb-4">
            <div><span className="text-slate-400">Page No:</span> <strong className="text-rose-400 font-extrabold text-lg ml-1">{previewData.pageNo || "—"}</strong></div>
            <div><span className="text-slate-400">Date:</span> <strong className="text-white font-mono ml-1">{previewData.dateSearch || "—"}</strong></div>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-lg">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-800 text-rose-400">
                  <th className="p-2 border border-slate-800 text-center">S.No.</th>
                  <th className="p-2 border border-slate-800 text-center">D.R. No.</th>
                  <th className="p-2 border border-slate-800 text-right">Freight (Cr)</th>
                  <th className="p-2 border border-slate-800 text-right">Labour (Dr)</th>
                  <th className="p-2 border border-slate-800 text-right">Stationery (Dr)</th>
                  <th className="p-2 border border-slate-800 text-right">Commission (Dr)</th>
                  <th className="p-2 border border-slate-800 text-right">A.O.C. (Dr)</th>
                  <th className="p-2 border border-slate-800 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {(previewData.entries || []).map((e: any, idx: number) => {
                  const total = (parseFloat(e.freight) || 0) + (parseFloat(e.labour) || 0) + (parseFloat(e.receiptCh) || 0) + (parseFloat(e.dCom) || 0) + (parseFloat(e.demurage) || 0);
                  return (
                    <tr key={idx} className="hover:bg-slate-800/30">
                      <td className="p-2 border border-slate-800 text-center text-slate-400">{e.sno || idx + 1}</td>
                      <td className="p-2 border border-slate-800 text-center text-white">{e.drNo || "—"}</td>
                      <td className="p-2 border border-slate-800 text-right text-emerald-400">₹ {e.freight || "—"}</td>
                      <td className="p-2 border border-slate-800 text-right text-white">₹ {e.labour || "—"}</td>
                      <td className="p-2 border border-slate-800 text-right text-white">₹ {e.receiptCh || "—"}</td>
                      <td className="p-2 border border-slate-800 text-right text-white">₹ {e.dCom || "—"}</td>
                      <td className="p-2 border border-slate-800 text-right text-white">₹ {e.demurage || "—"}</td>
                      <td className="p-2 border border-slate-800 text-right text-amber-400 font-bold">₹ {total.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-6 bg-slate-950 p-4 rounded-lg border border-slate-800 grid grid-cols-2 md:grid-cols-5 gap-4 text-xs font-mono text-center">
            <div className="border-r border-slate-800"><p className="text-slate-500 uppercase">Tot Freight</p><p className="text-emerald-400 font-extrabold text-sm mt-0.5">₹ {previewData.totals?.freight || 0}</p></div>
            <div className="border-r border-slate-800"><p className="text-slate-500 uppercase">Tot Labour</p><p className="text-white font-extrabold text-sm mt-0.5">₹ {previewData.totals?.labour || 0}</p></div>
            <div className="border-r border-slate-800"><p className="text-slate-500 uppercase">Tot Stationery</p><p className="text-white font-extrabold text-sm mt-0.5">₹ {previewData.totals?.receiptCh || 0}</p></div>
            <div className="border-r border-slate-800"><p className="text-slate-500 uppercase">Tot Comm</p><p className="text-white font-extrabold text-sm mt-0.5">₹ {previewData.totals?.dCom || 0}</p></div>
            <div><p className="text-slate-500 uppercase">Tot Demurage</p><p className="text-white font-extrabold text-sm mt-0.5">₹ {previewData.totals?.demurage || 0}</p></div>
          </div>
          <div className="mt-4 text-right"><span className="text-xs font-bold text-rose-400 uppercase tracking-widest">DS Total: </span><span className="text-rose-500 font-black text-xl ml-2">₹ {previewData.totals?.total || 0}</span></div>
        </div>
      );
    }

    if (previewModule === "entry") {
      return (
        <div className="bg-slate-900/40 border border-violet-500/30 rounded-xl p-6 md:p-8 max-w-5xl mx-auto shadow-2xl">
          <div className="text-center border-b border-violet-900/50 pb-4 mb-4">
            <h2 className="text-2xl font-black text-violet-400 uppercase tracking-widest">DELIVERY REGISTER</h2>
            <div className="text-xs text-slate-500 tracking-wider mt-1 uppercase font-bold">Sant Kanwar Ram Transport Corp.</div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs mb-6 font-mono">
            <div className="border-b border-slate-800 pb-1.5"><span className="text-slate-500 font-bold uppercase">Page No:</span> <strong className="text-violet-400 float-right text-sm">{previewData.pageNo || "—"}</strong></div>
            <div className="border-b border-slate-800 pb-1.5"><span className="text-slate-500 font-bold uppercase">Date:</span> <strong className="text-white float-right text-sm">{previewData.dateSearch || "—"}</strong></div>
            <div className="border-b border-slate-800 pb-1.5"><span className="text-slate-500 font-bold uppercase">Challan No:</span> <strong className="text-white float-right text-sm">{previewData.challanNo || "—"}</strong></div>
            <div className="border-b border-slate-800 pb-1.5"><span className="text-slate-500 font-bold uppercase">Vehicle No:</span> <strong className="text-white float-right text-sm">{previewData.vehicleNo || "—"}</strong></div>
            <div className="border-b border-slate-800 pb-1.5"><span className="text-slate-500 font-bold uppercase">Driver:</span> <strong className="text-white float-right text-sm">{previewData.driverName || "—"}</strong></div>
            <div className="border-b border-slate-800 pb-1.5"><span className="text-slate-500 font-bold uppercase">From:</span> <strong className="text-white float-right text-sm">{previewData.fromData || "—"}</strong></div>
            <div className="border-b border-slate-800 pb-1.5 col-span-2"><span className="text-slate-500 font-bold uppercase">To:</span> <strong className="text-white float-right text-sm">{previewData.toData || "—"}</strong></div>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-lg">
            <table className="w-full text-[10px] text-left border-collapse">
              <thead>
                <tr className="bg-slate-800 text-violet-400">
                  <th className="p-2 border border-slate-800 text-center">S.No.</th>
                  <th className="p-2 border border-slate-800">From</th>
                  <th className="p-2 border border-slate-800">To</th>
                  <th className="p-2 border border-slate-800 text-center">G.R. No.</th>
                  <th className="p-2 border border-slate-800">Consignor</th>
                  <th className="p-2 border border-slate-800">Consignee</th>
                  <th className="p-2 border border-slate-800 text-center">Pkgs</th>
                  <th className="p-2 border border-slate-800">Contents</th>
                  <th className="p-2 border border-slate-800 text-right">Freight</th>
                  <th className="p-2 border border-slate-800 text-center">Receipt No</th>
                  <th className="p-2 border border-slate-800 text-center">Del. Date</th>
                  <th className="p-2 border border-slate-800 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {(previewData.entries || []).map((e: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-800/30">
                    <td className="p-2 border border-slate-800 text-center text-slate-400">{e.sno || idx + 1}</td>
                    <td className="p-2 border border-slate-800 text-white">{e.from || "—"}</td>
                    <td className="p-2 border border-slate-800 text-white">{e.to || "—"}</td>
                    <td className="p-2 border border-slate-800 text-center text-white font-medium">{e.grNo || "—"}</td>
                    <td className="p-2 border border-slate-800 text-white max-w-[80px] truncate" title={e.consignor}>{e.consignor || "—"}</td>
                    <td className="p-2 border border-slate-800 text-white max-w-[80px] truncate" title={e.consignee}>{e.consignee || "—"}</td>
                    <td className="p-2 border border-slate-800 text-center text-white">{e.noOfPackages || "—"}</td>
                    <td className="p-2 border border-slate-800 text-white max-w-[85px] truncate" title={e.contents}>{e.contents || "—"}</td>
                    <td className="p-2 border border-slate-800 text-right text-white font-mono">₹ {e.freight || "0"}</td>
                    <td className="p-2 border border-slate-800 text-center text-white font-mono">{e.deliveryReceiptNo || "—"}</td>
                    <td className="p-2 border border-slate-800 text-center text-white font-mono">{e.dateOfDelivery || "—"}</td>
                    <td className="p-2 border border-slate-800 text-center">
                      <span className={cn(
                        "px-1 py-0.5 rounded text-[8px] font-bold uppercase",
                        e.deliveryStatus === "Complete" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                      )}>
                        {e.deliveryStatus || "Pending"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    return null;
  };

  const getPrintHTML = () => {
    if (!previewModule || !previewData) return "";

    let content = "";
    if (previewModule === "challan") {
      const rowsHtml = (previewData.entries || []).map((e: any, idx: number) => `
        <tr>
          <td style="text-align:center;">${e.sno || idx + 1}</td>
          <td style="text-align:center;">${e.grNo || ""}</td>
          <td style="text-align:center;">${e.pkg || ""}</td>
          <td style="text-align:right;">${e.wt || ""}</td>
          <td>${e.dest || ""}</td>
          <td>${e.content || ""}</td>
          <td>${e.consignor || ""}</td>
          <td>${e.consignee || ""}</td>
          <td style="text-align:right;font-weight:bold;">${e.total || ""}</td>
        </tr>
      `).join("");
      
      content = `
        <div style="border: 2px solid #000; padding: 20px; font-family: Arial, sans-serif; max-width: 900px; margin: 0 auto; background: #fff; color: #000;">
          <div style="text-align:center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px;">
            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Subject to BHILWARA Jurisdiction</div>
            <h1 style="font-size: 26px; font-weight: 950; color: #d32f2f; margin: 5px 0; text-transform: uppercase;">Sant Kanwar Ram Transport Corp.</h1>
            <div style="font-size: 12px;">123-124, Transport Nagar, BHILWARA - 311001 (RAJ.) · Mob.: 96809-92567, 86196-06627</div>
          </div>
          <table style="width:100%; margin-bottom:20px; border-collapse:collapse; font-size: 13px;">
            <tr>
              <td style="width:50%; border:none; padding:4px;"><strong>From Bhilwara To:</strong> ${previewData.from || "—"}</td>
              <td style="width:50%; border:none; padding:4px; text-align:right;"><strong>Date:</strong> ${previewData.date || "—"}</td>
            </tr>
            <tr>
              <td style="border:none; padding:4px;"><strong>Challan No:</strong> <span style="color:#d32f2f; font-weight:bold; font-size:15px;">${previewData.challanNo || "—"}</span></td>
              <td style="border:none; padding:4px; text-align:right;"><strong>Vehicle No:</strong> ${previewData.vehicleNo || "—"}</td>
            </tr>
            <tr>
              <td style="border:none; padding:4px;"><strong>Owner's Name:</strong> ${previewData.ownerName || "—"}</td>
              <td style="border:none; padding:4px; text-align:right;"><strong>Driver's Name:</strong> ${previewData.driverName || "—"}</td>
            </tr>
          </table>
          <table style="width:100%; border-collapse:collapse; font-size:11px;" border="1">
            <thead>
              <tr style="background:#f0f0f0;">
                <th style="padding:5px;">S.No.</th>
                <th style="padding:5px;">G.R. No.</th>
                <th style="padding:5px;">Pkgs</th>
                <th style="padding:5px; text-align:right;">Wt (Q.)</th>
                <th style="padding:5px;">Destination</th>
                <th style="padding:5px;">Content</th>
                <th style="padding:5px;">Consignor</th>
                <th style="padding:5px;">Consignee</th>
                <th style="padding:5px; text-align:right;">Freight (Rs)</th>
              </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>
          <div style="display:flex; justify-content:space-between; margin-top:50px; font-size:13px; font-weight:bold;">
            <div>Driver Signature</div>
            <div>For Sant Kanwar Ram Transport Corp. (BHL.)</div>
          </div>
        </div>
      `;
    } else if (previewModule === "cash-memo") {
      content = `
        <div style="border: 2px solid #000; padding: 30px; font-family: Arial, sans-serif; max-width: 450px; margin: 40px auto; background: #fff; color: #000; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
          <div style="text-align:center; border-bottom: 2px solid #10b981; padding-bottom: 10px; margin-bottom: 20px;">
            <h2 style="color: #10b981; margin: 0; text-transform: uppercase; font-size:22px; font-weight:900;">CASH MEMO</h2>
            <div style="font-size: 10px; font-weight:bold; letter-spacing:1px; margin-top:5px; color:#555;">SANT KANWAR RAM TRANSPORT CORP.</div>
          </div>
          <table style="width:100%; font-size:13px; margin-bottom:20px; border-collapse:collapse;">
            <tr style="border-bottom:1px solid #eee;"><td style="padding:6px 0; color:#555;">D.R. No:</td><td style="padding:6px 0; text-align:right; font-weight:bold;">${previewData.drNo || "—"}</td></tr>
            <tr style="border-bottom:1px solid #eee;"><td style="padding:6px 0; color:#555;">G.R. No:</td><td style="padding:6px 0; text-align:right; font-weight:bold;">${previewData.grNo || "—"}</td></tr>
            <tr style="border-bottom:1px solid #eee;"><td style="padding:6px 0; color:#555;">Date:</td><td style="padding:6px 0; text-align:right; font-mono;">${previewData.date ? new Date(previewData.date).toLocaleDateString() : "—"}</td></tr>
            <tr style="border-bottom:1px solid #eee;"><td style="padding:6px 0; color:#555;">From:</td><td style="padding:6px 0; text-align:right;">${previewData.from || "—"}</td></tr>
            <tr style="border-bottom:1px solid #eee;"><td style="padding:6px 0; color:#555;">Consignee:</td><td style="padding:6px 0; text-align:right;">${previewData.consignee || "—"}</td></tr>
          </table>
          <table style="width:100%; font-size:13px; border-collapse:collapse; background:#f9f9f9; border:1px solid #eee;">
            <tr><td style="padding:8px; color:#555;">Freight:</td><td style="padding:8px; text-align:right; font-mono;">₹ ${(previewData.freight || 0) + (previewData.freightPaise || 0)/100}</td></tr>
            <tr><td style="padding:8px; color:#555;">Labour:</td><td style="padding:8px; text-align:right; font-mono;">₹ ${(previewData.labour || 0) + (previewData.labourPaise || 0)/100}</td></tr>
            <tr><td style="padding:8px; color:#555;">Stationery:</td><td style="padding:8px; text-align:right; font-mono;">₹ ${(previewData.stationery || 0) + (previewData.stationeryPaise || 0)/100}</td></tr>
            <tr><td style="padding:8px; color:#555;">Commission:</td><td style="padding:8px; text-align:right; font-mono;">₹ ${(previewData.commission || 0) + (previewData.commissionPaise || 0)/100}</td></tr>
            <tr><td style="padding:8px; color:#555;">A.O.C:</td><td style="padding:8px; text-align:right; font-mono;">₹ ${(previewData.aoc || 0) + (previewData.aocPaise || 0)/100}</td></tr>
            <tr style="border-top:2px solid #000; font-weight:bold; font-size:15px; background:#fff;"><td style="padding:10px 8px; color:#10b981;">TOTAL:</td><td style="padding:10px 8px; text-align:right; font-mono; color:#10b981;">₹ ${parseFloat(previewData.totalAmount || 0).toFixed(2)}</td></tr>
          </table>
        </div>
      `;
    } else if (previewModule === "summary") {
      const slipsHtml = (previewData.entries || []).map((e: any, idx: number) => {
        const fareDelivery = parseFloat(e.fareDelivery) || 0;
        const crossingFare = parseFloat(e.crossingFare) || 0;
        const deliveryCommission = parseFloat(e.deliveryCommission) || 0;
        const crossing = parseFloat(e.crossing) || 0;
        const labor = parseFloat(e.labor) || 0;
        const credit = parseFloat(e.credit) || 0;
        const debit = parseFloat(e.debit) || 0;
        const subtotal = fareDelivery + crossingFare + deliveryCommission - crossing - labor;
        const total = subtotal + credit - debit;
        
        return `
          <div style="width: 580px; height: 820px; background: #ffaec1; color: #111e54; border-radius: 2px; padding: 30px 40px; display: flex; flex-direction: column; margin: 0 auto 40px; page-break-after: always; box-sizing: border-box; font-family: sans-serif;">
            <div style="display:flex; justify-content:space-between; font-size:12px; font-weight:bold; margin-bottom:5px;">
              <span>Mob. 96809-92567</span><span>Mob. 86196-06627</span>
            </div>
            <div style="text-align:center; font-size:10px; font-style:italic; margin-bottom:5px;">All disputes subject to Bhilwara jurisdiction</div>
            <div style="text-align:center;">
              <h2 style="font-size:18px; font-weight:900; margin:0;">SANT KANWAR RAM TRANSPORT CORP.</h2>
              <p style="font-size:12px; margin:2px 0 0 0;">Bhilwara - 311001 (Raj.)</p>
            </div>
            <div style="display:flex; align-items:center; justify-content:center; margin:10px 0;">
              <div style="flex-grow:1; height:1px; background:#111e54;"></div>
              <span style="font-size:15px; font-weight:bold; padding:0 10px;">SUMMARY</span>
              <div style="flex-grow:1; height:1px; background:#111e54;"></div>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:13px; margin-bottom:15px;">
              <div>No: <span style="font-size:16px; font-weight:bold; color:#d32f2f;">${e.sno || idx + 1}</span></div>
              <div>Date: <strong>${previewData.date || "—"}</strong></div>
            </div>
            <div style="display:flex; flex-direction:column; gap:12px; flex-grow:1; font-size:13px;">
              <div style="border-bottom:1px dotted #111e54; padding-bottom:3px;"><strong>Truck No:</strong> ${e.truckNo || "—"}</div>
              <div style="border-bottom:1px dotted #111e54; padding-bottom:3px;"><strong>Driver Name:</strong> ${e.driverName || "—"}</div>
              <div style="border-bottom:1px dotted #111e54; padding-bottom:3px;"><strong>From:</strong> ${e.from || "—"} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <strong>To:</strong> ${e.to || "—"}</div>
              <div style="border-bottom:1px dotted #111e54; padding-bottom:3px;"><strong>Transport:</strong> ${e.transportName || "—"} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <strong>Challan No:</strong> ${e.challanNo || "—"}</div>
              <div style="border-bottom:1px dotted #111e54; padding-bottom:3px;"><strong>Total Count:</strong> ${e.totalCount || "—"}</div>
              <div style="border-bottom:1px dotted #111e54; padding-bottom:3px;"><strong>Fare Delivery:</strong> ₹ ${e.fareDelivery || "0"} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <strong>Crossing:</strong> ₹ ${e.crossing || "0"}</div>
              <div style="border-bottom:1px dotted #111e54; padding-bottom:3px;"><strong>Crossing Fare:</strong> ₹ ${e.crossingFare || "0"} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <strong>Labor:</strong> ₹ ${e.labor || "0"}</div>
              <div style="border-bottom:1px dotted #111e54; padding-bottom:3px;"><strong>Del. Commission:</strong> ₹ ${e.deliveryCommission || "0"}</div>
              ${e.note ? `<div style="border-bottom:1px dotted #111e54; padding-bottom:3px; font-style:italic;"><strong>Note:</strong> ${e.note}</div>` : ''}
              
              <div style="margin: 10px 0 5px 0; text-align:center; font-size:10px; font-weight:bold; letter-spacing:2px; text-transform:uppercase; opacity:0.8;">Adjustments</div>
              <div style="display:flex; justify-content:space-between; border-bottom:1px dotted #111e54; padding-bottom:3px;">
                <span><strong>Credit:</strong> ₹ ${e.credit || "0"}</span>
                <span><strong>Debit:</strong> ₹ ${e.debit || "0"}</span>
              </div>
              <div style="border-top:1.5px solid #111e54; padding-top:10px; margin-top:15px; display:flex; justify-content:between; font-size:16px; font-weight:900;">
                <span>GRAND TOTAL:</span>
                <span style="margin-left:auto;">₹ ${total.toFixed(2)}</span>
              </div>
            </div>
            <div style="display:flex; justify-content:space-between; margin-top:30px; font-size:12px; font-weight:bold;">
              <div>Driver Signature</div><div>Auth. Signature</div>
            </div>
          </div>
        `;
      }).join("");

      content = `<div style="background:#e0e0e0; padding:20px 0;">${slipsHtml}</div>`;
    } else if (previewModule === "delivery-statement") {
      const rowsHtml = (previewData.entries || []).map((e: any, idx: number) => {
        const total = (parseFloat(e.freight) || 0) + (parseFloat(e.labour) || 0) + (parseFloat(e.receiptCh) || 0) + (parseFloat(e.dCom) || 0) + (parseFloat(e.demurage) || 0);
        return `
          <tr>
            <td style="text-align:center;">${e.sno || idx + 1}</td>
            <td style="text-align:center;">${e.drNo || ""}</td>
            <td style="text-align:right;">₹ ${e.freight || "0"}</td>
            <td style="text-align:right;">₹ ${e.labour || "0"}</td>
            <td style="text-align:right;">₹ ${e.receiptCh || "0"}</td>
            <td style="text-align:right;">₹ ${e.dCom || "0"}</td>
            <td style="text-align:right;">₹ ${e.demurage || "0"}</td>
            <td style="text-align:right;font-weight:bold;">₹ ${total.toFixed(2)}</td>
          </tr>
        `;
      }).join("");

      content = `
        <div style="border: 2px solid #000; padding: 20px; font-family: Arial, sans-serif; max-width: 850px; margin: 0 auto; background: #fff; color: #000;">
          <div style="text-align:center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px;">
            <h2 style="margin:0; text-transform:uppercase; font-size:24px;">DELIVERY STATEMENT</h2>
            <div style="font-size:11px; font-weight:bold;">SANT KANWAR RAM TRANSPORT CORP.</div>
          </div>
          <div style="display:flex; justify-content:space-between; margin-bottom:15px; font-size:13px;">
            <div>Page No: <strong>${previewData.pageNo || "—"}</strong></div>
            <div>Date: <strong>${previewData.dateSearch || "—"}</strong></div>
          </div>
          <table style="width:100%; border-collapse:collapse; font-size:12px;" border="1">
            <thead>
              <tr style="background:#f0f0f0;">
                <th style="padding:6px;">S.No.</th>
                <th style="padding:6px;">D.R. No.</th>
                <th style="padding:6px; text-align:right;">Freight (Cr)</th>
                <th style="padding:6px; text-align:right;">Labour (Dr)</th>
                <th style="padding:6px; text-align:right;">Stationery (Dr)</th>
                <th style="padding:6px; text-align:right;">Commission (Dr)</th>
                <th style="padding:6px; text-align:right;">A.O.C. (Dr)</th>
                <th style="padding:6px; text-align:right;">Total</th>
              </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>
          <div style="margin-top:20px; text-align:right; font-size:15px; font-weight:bold;">
            Statement Total: <span style="font-size:18px; color:#d32f2f;">₹ ${previewData.totals?.total || 0}</span>
          </div>
        </div>
      `;
    } else if (previewModule === "entry") {
      const rowsHtml = (previewData.entries || []).map((e: any, idx: number) => `
        <tr>
          <td style="text-align:center;">${e.sno || idx + 1}</td>
          <td>${e.from || ""}</td>
          <td>${e.to || ""}</td>
          <td style="text-align:center;">${e.grNo || ""}</td>
          <td>${e.consignor || ""}</td>
          <td>${e.consignee || ""}</td>
          <td style="text-align:center;">${e.noOfPackages || ""}</td>
          <td>${e.contents || ""}</td>
          <td style="text-align:right;">${e.freight || "0"}</td>
          <td>${e.deliveryReceiptNo || ""}</td>
          <td>${e.dateOfDelivery || ""}</td>
        </tr>
      `).join("");

      content = `
        <div style="border: 2px solid #000; padding: 15px; font-family: Arial, sans-serif; max-width: 1100px; margin: 0 auto; background: #fff; color: #000;">
          <div style="text-align:center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px;">
            <h1 style="font-size: 24px; font-weight:bold; uppercase; margin:0;">Sant Kanwar Ram Transport Corporation</h1>
            <div style="font-size: 11px; text-transform:uppercase;">Bhilwara (Raj.) · Delivery Register</div>
          </div>
          <table style="width:100%; margin-bottom:15px; font-size:12px; border-collapse:collapse;">
            <tr>
              <td><strong>Page No:</strong> ${previewData.pageNo || "—"}</td>
              <td><strong>Date:</strong> ${previewData.dateSearch || "—"}</td>
              <td><strong>Challan No:</strong> ${previewData.challanNo || "—"}</td>
              <td><strong>Vehicle No:</strong> ${previewData.vehicleNo || "—"}</td>
              <td><strong>Driver:</strong> ${previewData.driverName || "—"}</td>
            </tr>
          </table>
          <table style="width:100%; border-collapse:collapse; font-size:9.5px;" border="1">
            <thead>
              <tr style="background:#f0f0f0;">
                <th style="padding:4px;">S.No.</th>
                <th style="padding:4px;">From</th>
                <th style="padding:4px;">To</th>
                <th style="padding:4px;">G.R. No.</th>
                <th style="padding:4px;">Consignor</th>
                <th style="padding:4px;">Consignee</th>
                <th style="padding:4px;">Pkgs</th>
                <th style="padding:4px;">Contents</th>
                <th style="padding:4px; text-align:right;">Freight</th>
                <th style="padding:4px;">Receipt No</th>
                <th style="padding:4px;">Del. Date</th>
              </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>
        </div>
      `;
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Print Slip</title>
        <style>
          @media print {
            body { margin:0; padding: 20px; }
            @page { size: auto; margin: 10mm; }
          }
        </style>
      </head>
      <body onload="window.print();">
        ${content}
      </body>
      </html>
    `;
  };

  return (
    <DashboardLayout>
      <style>{`
        @keyframes row-blink {
          0%, 100% { background-color: transparent; }
          25%, 75% { background-color: rgba(35, 136, 255, 0.4); }
          50% { background-color: rgba(35, 136, 255, 0.15); }
        }
        .animate-row-blink {
          animation: row-blink 1.2s ease-in-out 2 !important;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(2px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.25s ease-out forwards;
        }
      `}</style>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Observation</h2>
          <p className="text-muted-foreground">View all records across modules — Challan, Cash Memo, Summary, Delivery Statement, and Entry.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {modules.map(({ key, label, icon, color }) => {
            const isActive = activeModule === key;
            return (
              <button
                key={key}
                onClick={() => handleCardClick(key)}
                className={cn(
                  "relative group text-left rounded-xl border transition-all duration-200 p-5 cursor-pointer",
                  isActive
                    ? "border-[#2388ff] bg-slate-900/90 shadow-lg shadow-blue-500/10"
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
                    {counts[key] !== undefined ? `${counts[key]} records` : "—"}
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

      {/* Record Preview Dialog Modal */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-slate-950 border border-slate-850 text-white p-6 rounded-xl box-border">
          <DialogHeader className="flex flex-row items-center justify-between border-b border-slate-800 pb-3">
            <DialogTitle className="text-lg font-bold text-[#2388ff] flex items-center gap-2 uppercase tracking-wider">
              <Eye className="w-5 h-5" />
              {previewModule ? `${previewModule.replace('-', ' ')} Preview` : "Record Details"}
            </DialogTitle>
            <div className="flex gap-2 mr-6 print-hide">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const pw = window.open("", "_blank");
                  if (!pw) return;
                  pw.document.write(getPrintHTML());
                  pw.document.close();
                }}
                className="bg-slate-900 border-slate-700 hover:bg-slate-800 text-white font-semibold"
              >
                <Printer className="w-4 h-4 mr-1.5" /> Print / Save PDF
              </Button>
            </div>
          </DialogHeader>
          
          {previewLoading && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
              <Loader2 className="w-10 h-10 animate-spin text-[#2388ff]" />
              <p className="text-sm font-semibold uppercase tracking-widest">Fetching prefilled slip data...</p>
            </div>
          )}

          {!previewLoading && !previewData && (
            <div className="text-center py-10 text-slate-500">
              No record data available.
            </div>
          )}

          {!previewLoading && previewData && (
            <div className="py-4 w-full box-border">
              {renderPreviewContent()}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
