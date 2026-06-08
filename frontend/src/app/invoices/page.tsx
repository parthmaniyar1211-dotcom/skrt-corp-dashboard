"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  FileText, Download, Printer, Calendar, Calculator,
  TrendingUp, TrendingDown, Loader2, RefreshCw, ChevronDown,
  BarChart3, Users, Filter, AlertCircle
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { WhatsAppShareButton } from "@/components/shared/WhatsAppShareButton";

/* ─── helpers ─── */
const getLocalDate = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const getFirstOfMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
};

const fmtDate = (s: string) => {
  if (!s) return "—";
  const p = s.split("-");
  return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : s;
};

const fmtINR = (n: number) =>
  `₹ ${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

/* ─── tab IDs ─── */
type Tab = "summary" | "delivery" | "combined";

/* ─────────────────────────────────────────────────────────────
   PRINT HELPERS
───────────────────────────────────────────────────────────── */
function printHtml(html: string) {
  const pw = window.open("", "_blank");
  if (!pw) return;
  pw.document.write(html);
  pw.document.close();
}

function downloadPdfHtml(html: string, filename: string) {
  const withScript = html.replace(
    "</body>",
    `<script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"><\/script>
<script>window.onload=function(){html2pdf().set({margin:8,filename:'${filename}.pdf',html2canvas:{scale:2},jsPDF:{unit:'mm',format:'a4',orientation:'portrait'}}).from(document.body).save();};<\/script></body>`
  );
  const pw = window.open("", "_blank");
  if (!pw) return;
  pw.document.write(withScript);
  pw.document.close();
}

/* ─── base print HTML wrapper ─── */
function basePrintWrapper(title: string, content: string, meta = "") {
  return `<!DOCTYPE html><html lang="en"><head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Arial',sans-serif;background:#fff;color:#111;padding:30px;font-size:13px}
    .header{text-align:center;border-bottom:2px solid #1a3a6b;padding-bottom:18px;margin-bottom:22px}
    .header h1{font-size:22px;font-weight:900;text-transform:uppercase;color:#1a3a6b;letter-spacing:.5px}
    .header h2{font-size:14px;color:#555;margin-top:3px}
    .header .badge{display:inline-block;margin-top:8px;padding:3px 16px;border:1.5px solid #1a3a6b;border-radius:4px;font-weight:700;font-size:12px;text-transform:uppercase;letter-spacing:2px;color:#1a3a6b}
    .meta{display:flex;justify-content:space-between;flex-wrap:wrap;gap:6px;margin-bottom:18px;font-size:12px;color:#444;font-weight:600}
    table{width:100%;border-collapse:collapse;margin-bottom:20px;font-size:12px}
    th{background:#e8ecf0;border:1px solid #bbb;padding:7px 8px;font-weight:700;text-transform:uppercase;font-size:10.5px;text-align:left}
    td{border:1px solid #ccc;padding:6px 8px}
    .tr{text-align:right}
    .tc{text-align:center}
    .totals-row td{background:#f0f4f8;font-weight:700;border-top:2px solid #1a3a6b}
    .summary-box{display:flex;gap:20px;margin-top:20px}
    .sum-card{flex:1;border:1.5px solid #ddd;border-radius:6px;padding:12px;text-align:center}
    .sum-card .label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#777;margin-bottom:4px}
    .sum-card .amount{font-size:18px;font-weight:900}
    .credit{color:#10b981}.debit{color:#ef4444}.net{color:#1a3a6b}
    .section-title{font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#1a3a6b;border-bottom:1.5px solid #1a3a6b;padding-bottom:6px;margin:20px 0 10px}
    .footer{margin-top:50px;display:flex;justify-content:space-between;font-size:12px;font-weight:700;border-top:1px solid #ccc;padding-top:14px}
    .no-print{text-align:center;margin-bottom:20px}
    .no-print button{background:#1a3a6b;color:#fff;border:none;padding:9px 28px;border-radius:5px;font-size:13px;font-weight:600;cursor:pointer}
    @media print{.no-print{display:none}.sum-card{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
  </style></head><body>
  <div class="no-print"><button onclick="window.print()">🖨️ Print</button></div>
  <div class="header">
    <h1>Sant Kanwar Ram Transport Corporation</h1>
    <h2>Bhilwara – 311001 (Rajasthan)</h2>
    ${meta}
  </div>
  ${content}
  <div class="footer">
    <span>Prepared by: SKRT ERP System</span>
    <span>Authorised Signatory: _______________________</span>
  </div>
  </body></html>`;
}

/* ─────────────────────────────────────────────────────────────
   STAT CARD
───────────────────────────────────────────────────────────── */
function StatCard({ label, value, color, icon: Icon }: {
  label: string; value: string; color: string; icon: any;
}) {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${color}/20`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</p>
        <p className={`text-lg font-black font-mono mt-0.5 ${color}`}>{value}</p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   FILTER BAR
───────────────────────────────────────────────────────────── */
function FilterBar({
  startDate, endDate, onStartDate, onEndDate,
  transportName, onTransportName, transportNames,
  onApply, loading
}: any) {
  const [selMonth, setSelMonth] = useState("");

  const applyMonth = (val: string) => {
    setSelMonth(val);
    if (!val) return;
    const [y, m] = val.split("-").map(Number);
    const start = `${y}-${String(m).padStart(2, "0")}-01`;
    const lastDay = new Date(y, m, 0).getDate();
    const end = `${y}-${String(m).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
    onStartDate(start);
    onEndDate(end);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 p-4 bg-slate-900/40 rounded-xl border border-slate-800">
      <Filter className="w-4 h-4 text-slate-500 shrink-0" />

      {/* Month picker */}
      <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs">
        <Calendar className="w-3.5 h-3.5 text-[#2388ff]" />
        <span className="text-slate-400 font-semibold">Month:</span>
        <input
          type="month"
          value={selMonth}
          onChange={(e) => applyMonth(e.target.value)}
          className="bg-transparent text-white border-0 outline-none text-xs"
          style={{ colorScheme: "dark" }}
        />
      </div>

      {/* Date range */}
      <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs">
        <span className="text-slate-400 font-semibold">From:</span>
        <input
          type="date"
          value={startDate}
          onChange={(e) => onStartDate(e.target.value)}
          className="bg-transparent text-white border-0 outline-none text-xs"
          style={{ colorScheme: "dark" }}
        />
        <span className="text-slate-500">–</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => onEndDate(e.target.value)}
          className="bg-transparent text-white border-0 outline-none text-xs"
          style={{ colorScheme: "dark" }}
        />
      </div>

      {/* Transport / client filter */}
      {transportNames && transportNames.length > 0 && (
        <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs">
          <Users className="w-3.5 h-3.5 text-[#2388ff]" />
          <select
            value={transportName}
            onChange={(e) => onTransportName(e.target.value)}
            className="bg-transparent text-white border-0 outline-none text-xs cursor-pointer"
          >
            <option value="all" className="bg-slate-900">All Transports</option>
            {transportNames.map((n: string) => (
              <option key={n} value={n} className="bg-slate-900">{n}</option>
            ))}
          </select>
        </div>
      )}

      <Button
        size="sm"
        onClick={onApply}
        disabled={loading}
        className="h-8 px-4 bg-[#2388ff] hover:bg-[#2388ff]/90 text-white font-semibold text-xs"
      >
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
        <span className="ml-1.5">Apply</span>
      </Button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════ */
export default function InvoicesPage() {
  const [tab, setTab] = useState<Tab>("summary");

  /* shared filter state */
  const [startDate, setStartDate] = useState(getFirstOfMonth());
  const [endDate, setEndDate] = useState(getLocalDate());
  const [transportName, setTransportName] = useState("all");

  /* data */
  const [summaryBill, setSummaryBill] = useState<any>(null);
  const [dsBill, setDsBill] = useState<any>(null);
  const [combinedBill, setCombinedBill] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [transportNames, setTransportNames] = useState<string[]>([]);

  /* ── fetch ── */
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        startDate,
        endDate,
        ...(transportName !== "all" ? { transportName } : {})
      });

      const [sumRes, dsRes, comRes] = await Promise.all([
        api.get(`/invoices/summary-bill?${params}`),
        api.get(`/invoices/ds-bill?${params}`),
        api.get(`/invoices/combined-bill?${params}`)
      ]);

      if (sumRes.data.success) setSummaryBill(sumRes.data.data);
      if (dsRes.data.success) setDsBill(dsRes.data.data);
      if (comRes.data.success) setCombinedBill(comRes.data.data);

      // Extract unique transport names from summary rows
      if (sumRes.data.success) {
        const names = [...new Set(
          (sumRes.data.data.rows || [])
            .map((r: any) => r.transportName)
            .filter(Boolean)
        )] as string[];
        setTransportNames(names);
      }
    } catch (err) {
      toast.error("Failed to fetch billing data");
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, transportName]);

  useEffect(() => { fetchData(); }, []);

  /* ─── SUMMARY PRINT HTML ─── */
  const buildSummaryPrintHtml = () => {
    const d = summaryBill;
    if (!d) return "";
    const rows = (d.rows || []).map((r: any, i: number) => `
      <tr>
        <td>${fmtDate(r.date)}</td>
        <td class="tc">${r.summaryNo || i + 1}</td>
        <td>${r.transportName || "—"}</td>
        <td>${r.driverName || "—"}</td>
        <td class="tr text-emerald-600">${r.credit > 0 ? fmtINR(r.credit) : "—"}</td>
        <td class="tr text-red-600">${r.debit > 0 ? fmtINR(r.debit) : "—"}</td>
        <td>${r.note || "—"}</td>
      </tr>`).join("");

    const content = `
      <div class="section-title">Summary Register — ${fmtDate(startDate)} to ${fmtDate(endDate)}</div>
      <table>
        <thead><tr>
          <th>Date</th><th>Summary No.</th><th>Transport Name</th><th>Driver</th>
          <th class="tr">Credit (₹)</th><th class="tr">Debit (₹)</th><th>Note</th>
        </tr></thead>
        <tbody>${rows}
          <tr class="totals-row">
            <td colspan="4" style="text-align:right">TOTALS:</td>
            <td class="tr credit">${fmtINR(d.totalCredit)}</td>
            <td class="tr debit">${fmtINR(d.totalDebit)}</td>
            <td></td>
          </tr>
        </tbody>
      </table>
      <div class="summary-box">
        <div class="sum-card"><div class="label">Total Credit</div><div class="amount credit">${fmtINR(d.totalCredit)}</div></div>
        <div class="sum-card"><div class="label">Total Debit</div><div class="amount debit">${fmtINR(d.totalDebit)}</div></div>
        <div class="sum-card"><div class="label">Net Balance</div><div class="amount net">${fmtINR(d.netBalance)}</div></div>
      </div>`;

    return basePrintWrapper(
      "Summary Invoice",
      content,
      `<div class="badge">Summary Invoice</div>`
    );
  };

  /* ─── DS PRINT HTML ─── */
  const buildDsPrintHtml = () => {
    const d = dsBill;
    if (!d) return "";
    const rows = (d.rows || []).map((r: any, i: number) => `
      <tr>
        <td>${fmtDate(r.date)}</td>
        <td class="tc">${r.pageNo || "—"}</td>
        <td>${r.drNo || "—"}</td>
        <td class="tr">${r.freight ? fmtINR(r.freight) : "—"}</td>
        <td class="tr">${r.labour ? fmtINR(r.labour) : "—"}</td>
        <td class="tr">${r.stationery ? fmtINR(r.stationery) : "—"}</td>
        <td class="tr">${r.commission ? fmtINR(r.commission) : "—"}</td>
        <td class="tr">${r.aoc ? fmtINR(r.aoc) : "—"}</td>
        <td class="tr">${fmtINR(r.total || 0)}</td>
      </tr>`).join("");

    const t = d.totals || {};
    const content = `
      <div class="section-title">Delivery Statement — ${fmtDate(startDate)} to ${fmtDate(endDate)}</div>
      <table>
        <thead><tr>
          <th>Date</th><th class="tc">Page No.</th><th>D.R. No.</th>
          <th class="tr">Freight</th><th class="tr">Labour</th><th class="tr">Stationery</th>
          <th class="tr">Commission</th><th class="tr">A.O.C.</th><th class="tr">Total</th>
        </tr></thead>
        <tbody>${rows}
          <tr class="totals-row">
            <td colspan="3" style="text-align:right">TOTALS:</td>
            <td class="tr credit">${fmtINR(t.freight || 0)}</td>
            <td class="tr debit">${fmtINR(t.labour || 0)}</td>
            <td class="tr debit">${fmtINR(t.stationery || 0)}</td>
            <td class="tr debit">${fmtINR(t.commission || 0)}</td>
            <td class="tr debit">${fmtINR(t.aoc || 0)}</td>
            <td class="tr">${fmtINR(t.grandTotal || 0)}</td>
          </tr>
        </tbody>
      </table>
      <div class="summary-box">
        <div class="sum-card"><div class="label">Total Credit (Freight)</div><div class="amount credit">${fmtINR(d.totalCredit)}</div></div>
        <div class="sum-card"><div class="label">Total Debit</div><div class="amount debit">${fmtINR(d.totalDebit)}</div></div>
        <div class="sum-card"><div class="label">Net Amount</div><div class="amount net">${fmtINR(d.netAmount)}</div></div>
      </div>`;

    return basePrintWrapper("Delivery Statement Invoice", content, `<div class="badge">Delivery Statement Invoice</div>`);
  };

  /* ─── COMBINED PRINT HTML ─── */
  const buildCombinedPrintHtml = () => {
    const d = combinedBill;
    if (!d) return "";
    const sumRows = (d.summary?.rows || []).map((r: any) => `
      <tr>
        <td>${fmtDate(r.date)}</td>
        <td class="tc">${r.summaryNo || "—"}</td>
        <td>${r.transportName || "—"}</td>
        <td class="tr credit">${r.credit > 0 ? fmtINR(r.credit) : "—"}</td>
        <td class="tr debit">${r.debit > 0 ? fmtINR(r.debit) : "—"}</td>
        <td>${r.note || "—"}</td>
      </tr>`).join("");

    const dsRows = (d.deliveryStatement?.rows || []).map((r: any) => `
      <tr>
        <td>${fmtDate(r.date)}</td>
        <td class="tc">${r.pageNo || "—"}</td>
        <td>${r.drNo || "—"}</td>
        <td class="tr">${r.freight ? fmtINR(r.freight) : "—"}</td>
        <td class="tr">${r.labour ? fmtINR(r.labour) : "—"}</td>
        <td class="tr">${r.stationery ? fmtINR(r.stationery) : "—"}</td>
        <td class="tr">${r.commission ? fmtINR(r.commission) : "—"}</td>
        <td class="tr">${r.aoc ? fmtINR(r.aoc) : "—"}</td>
        <td class="tr">${fmtINR(r.total || 0)}</td>
      </tr>`).join("");

    const content = `
      <div class="section-title">A. Summary Register</div>
      <table>
        <thead><tr><th>Date</th><th class="tc">No.</th><th>Transport</th><th class="tr">Credit</th><th class="tr">Debit</th><th>Note</th></tr></thead>
        <tbody>${sumRows}
          <tr class="totals-row">
            <td colspan="3" style="text-align:right">Summary Totals:</td>
            <td class="tr credit">${fmtINR(d.summary?.totalCredit || 0)}</td>
            <td class="tr debit">${fmtINR(d.summary?.totalDebit || 0)}</td>
            <td></td>
          </tr>
        </tbody>
      </table>
      <div class="section-title" style="margin-top:24px">B. Delivery Statement</div>
      <table>
        <thead><tr><th>Date</th><th class="tc">Page</th><th>D.R. No.</th><th class="tr">Freight</th><th class="tr">Labour</th><th class="tr">Stationery</th><th class="tr">Commission</th><th class="tr">A.O.C.</th><th class="tr">Total</th></tr></thead>
        <tbody>${dsRows}
          <tr class="totals-row">
            <td colspan="3" style="text-align:right">DS Totals:</td>
            <td class="tr credit">${fmtINR(d.deliveryStatement?.totals?.freight || 0)}</td>
            <td class="tr debit">${fmtINR(d.deliveryStatement?.totals?.labour || 0)}</td>
            <td class="tr debit">${fmtINR(d.deliveryStatement?.totals?.stationery || 0)}</td>
            <td class="tr debit">${fmtINR(d.deliveryStatement?.totals?.commission || 0)}</td>
            <td class="tr debit">${fmtINR(d.deliveryStatement?.totals?.aoc || 0)}</td>
            <td class="tr">${fmtINR(d.deliveryStatement?.totals?.grandTotal || 0)}</td>
          </tr>
        </tbody>
      </table>
      <div class="summary-box" style="margin-top:24px">
        <div class="sum-card"><div class="label">Summary Net</div><div class="amount net">${fmtINR(d.summary?.netBalance || 0)}</div></div>
        <div class="sum-card"><div class="label">DS Net</div><div class="amount net">${fmtINR(d.deliveryStatement?.netAmount || 0)}</div></div>
        <div class="sum-card" style="border:2px solid #1a3a6b"><div class="label">Grand Total</div><div class="amount net" style="font-size:22px">${fmtINR(d.grandTotal || 0)}</div></div>
      </div>`;

    return basePrintWrapper("Combined Client Invoice", content, `<div class="badge">Combined Invoice</div>`);
  };

  /* ─── TABS ─── */
  const tabs: { id: Tab; label: string; icon: any; color: string }[] = [
    { id: "summary", label: "Summary Invoice", icon: FileText, color: "text-emerald-400" },
    { id: "delivery", label: "Delivery Statement Invoice", icon: BarChart3, color: "text-blue-400" },
    { id: "combined", label: "Combined Client Bill", icon: Calculator, color: "text-violet-400" },
  ];

  /* ─── ACTION BAR (shared) ─── */
  function ActionBar({ onPrint, onPdf, printHtmlFn, pdfFilename }: any) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          onClick={() => printHtml(printHtmlFn())}
          className="h-8 px-3 bg-[#2388ff] hover:bg-[#2388ff]/90 text-white font-semibold text-xs"
        >
          <Printer className="w-3.5 h-3.5 mr-1.5" /> Print
        </Button>
        <Button
          size="sm"
          onClick={() => downloadPdfHtml(printHtmlFn(), pdfFilename)}
          className="h-8 px-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold text-xs border border-slate-600"
        >
          <Download className="w-3.5 h-3.5 mr-1.5" /> PDF
        </Button>
      </div>
    );
  }

  /* ─── PAGE ─── */
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* ── PAGE HEADER ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#2388ff]/15 border border-[#2388ff]/30 flex items-center justify-center">
                <Calculator className="w-5 h-5 text-[#2388ff]" />
              </div>
              Billing & Invoices
            </h2>
            <p className="text-slate-400 text-sm mt-1.5">
              Transport accounting — monthly billing, reconciliation, and client invoices
            </p>
          </div>
        </div>

        {/* ── TABS ── */}
        <div className="flex gap-1 bg-slate-900/60 border border-slate-800 rounded-xl p-1.5 w-fit">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200",
                  isActive
                    ? "bg-slate-800 text-white shadow-md"
                    : "text-slate-500 hover:text-slate-300"
                )}
              >
                <Icon className={cn("w-4 h-4", isActive ? t.color : "")} />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* ── FILTER BAR ── */}
        <FilterBar
          startDate={startDate}
          endDate={endDate}
          onStartDate={setStartDate}
          onEndDate={setEndDate}
          transportName={transportName}
          onTransportName={setTransportName}
          transportNames={transportNames}
          onApply={fetchData}
          loading={loading}
        />

        {/* ══════════════════════════════════════════
            TAB 1 – SUMMARY INVOICE
        ══════════════════════════════════════════ */}
        {tab === "summary" && (
          <div className="space-y-5">
            {/* Stat cards */}
            {summaryBill && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <StatCard label="Total Credit" value={fmtINR(summaryBill.totalCredit || 0)} color="text-emerald-400" icon={TrendingUp} />
                <StatCard label="Total Debit" value={fmtINR(summaryBill.totalDebit || 0)} color="text-rose-400" icon={TrendingDown} />
                <StatCard
                  label="Net Balance"
                  value={fmtINR(summaryBill.netBalance || 0)}
                  color={summaryBill.netBalance >= 0 ? "text-[#2388ff]" : "text-rose-500"}
                  icon={Calculator}
                />
              </div>
            )}

            {/* Table card */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-900/60">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-bold text-white uppercase tracking-wide">Summary Register</span>
                  <span className="text-[10px] text-slate-500 font-mono ml-1">
                    {fmtDate(startDate)} – {fmtDate(endDate)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <ActionBar printHtmlFn={buildSummaryPrintHtml} pdfFilename="summary-invoice" />
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-14 gap-3 text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin text-[#2388ff]" />
                  <span className="text-sm">Loading summary data...</span>
                </div>
              ) : !summaryBill || summaryBill.rows?.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 text-slate-500 gap-2">
                  <AlertCircle className="w-8 h-8 opacity-40" />
                  <p className="text-sm">No summary records for this period</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-900/80">
                        <th className="text-left text-[10px] font-bold uppercase tracking-widest text-slate-500 px-4 py-2.5">Date</th>
                        <th className="text-center text-[10px] font-bold uppercase tracking-widest text-slate-500 px-3 py-2.5">S.No.</th>
                        <th className="text-left text-[10px] font-bold uppercase tracking-widest text-slate-500 px-3 py-2.5">Transport Name</th>
                        <th className="text-left text-[10px] font-bold uppercase tracking-widest text-slate-500 px-3 py-2.5">Driver</th>
                        <th className="text-left text-[10px] font-bold uppercase tracking-widest text-slate-500 px-3 py-2.5">Challan No.</th>
                        <th className="text-right text-[10px] font-bold uppercase tracking-widest text-emerald-600 px-3 py-2.5">Credit</th>
                        <th className="text-right text-[10px] font-bold uppercase tracking-widest text-rose-500 px-3 py-2.5">Debit</th>
                        <th className="text-left text-[10px] font-bold uppercase tracking-widest text-slate-500 px-3 py-2.5">Note</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summaryBill.rows.map((r: any, i: number) => (
                        <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                          <td className="px-4 py-2.5 font-mono text-slate-300 text-xs">{fmtDate(r.date)}</td>
                          <td className="px-3 py-2.5 text-center text-slate-400 text-xs">{r.summaryNo || i + 1}</td>
                          <td className="px-3 py-2.5 text-white font-medium text-xs">{r.transportName || "—"}</td>
                          <td className="px-3 py-2.5 text-slate-400 text-xs">{r.driverName || "—"}</td>
                          <td className="px-3 py-2.5 text-slate-400 text-xs font-mono">{r.challanNo || "—"}</td>
                          <td className="px-3 py-2.5 text-right font-mono font-semibold text-emerald-400 text-xs">
                            {r.credit > 0 ? fmtINR(r.credit) : "—"}
                          </td>
                          <td className="px-3 py-2.5 text-right font-mono font-semibold text-rose-400 text-xs">
                            {r.debit > 0 ? fmtINR(r.debit) : "—"}
                          </td>
                          <td className="px-3 py-2.5 text-slate-500 text-xs">{r.note || "—"}</td>
                        </tr>
                      ))}
                      {/* Totals row */}
                      <tr className="bg-slate-800/80 border-t-2 border-[#2388ff]/40">
                        <td colSpan={5} className="px-4 py-3 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Totals</td>
                        <td className="px-3 py-3 text-right font-mono font-black text-emerald-400">{fmtINR(summaryBill.totalCredit)}</td>
                        <td className="px-3 py-3 text-right font-mono font-black text-rose-400">{fmtINR(summaryBill.totalDebit)}</td>
                        <td></td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Net Balance Bar */}
                  <div className="px-5 py-4 bg-gradient-to-r from-[#2388ff]/10 to-transparent border-t border-slate-800 flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Net Balance (Credit − Debit)</span>
                    <span className={cn(
                      "text-2xl font-black font-mono",
                      summaryBill.netBalance >= 0 ? "text-emerald-400" : "text-rose-500"
                    )}>
                      {fmtINR(summaryBill.netBalance || 0)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════
            TAB 2 – DELIVERY STATEMENT INVOICE
        ══════════════════════════════════════════ */}
        {tab === "delivery" && (
          <div className="space-y-5">
            {/* Stat cards */}
            {dsBill && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <StatCard label="Total Freight (Credit)" value={fmtINR(dsBill.totalCredit || 0)} color="text-emerald-400" icon={TrendingUp} />
                <StatCard label="Total Debit" value={fmtINR(dsBill.totalDebit || 0)} color="text-rose-400" icon={TrendingDown} />
                <StatCard
                  label="Net Amount"
                  value={fmtINR(dsBill.netAmount || 0)}
                  color={dsBill.netAmount >= 0 ? "text-[#2388ff]" : "text-rose-500"}
                  icon={Calculator}
                />
              </div>
            )}

            {/* DS breakdown cards */}
            {dsBill?.totals && (
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                {[
                  { label: "Freight", key: "freight", color: "text-emerald-400" },
                  { label: "Labour", key: "labour", color: "text-rose-400" },
                  { label: "Stationery", key: "stationery", color: "text-orange-400" },
                  { label: "Commission", key: "commission", color: "text-amber-400" },
                  { label: "A.O.C.", key: "aoc", color: "text-red-400" },
                ].map(({ label, key, color }) => (
                  <div key={key} className="bg-slate-900/40 border border-slate-800 rounded-xl p-3 text-center">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1">{label}</p>
                    <p className={`text-sm font-black font-mono ${color}`}>
                      {fmtINR(dsBill.totals[key] || 0)}
                    </p>
                    <p className="text-[8px] text-slate-600 mt-0.5">
                      {key === "freight" ? "Credit ↑" : "Debit ↓"}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Table */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-900/60">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-bold text-white uppercase tracking-wide">Delivery Statement</span>
                  <span className="text-[10px] text-slate-500 font-mono ml-1">
                    {fmtDate(startDate)} – {fmtDate(endDate)}
                  </span>
                </div>
                <ActionBar printHtmlFn={buildDsPrintHtml} pdfFilename="ds-invoice" />
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-14 gap-3 text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin text-[#2388ff]" />
                  <span className="text-sm">Loading delivery statement data...</span>
                </div>
              ) : !dsBill || dsBill.rows?.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 text-slate-500 gap-2">
                  <AlertCircle className="w-8 h-8 opacity-40" />
                  <p className="text-sm">No delivery statement records for this period</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs min-w-[900px]">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-900/80">
                        {["Date", "Page No.", "D.R. No.", "Freight", "Labour", "Stationery", "Commission", "A.O.C.", "Total"].map((h, i) => (
                          <th key={h} className={cn(
                            "text-[10px] font-bold uppercase tracking-widest px-3 py-2.5",
                            i < 3 ? "text-left text-slate-500" : i === 3 ? "text-right text-emerald-600" : "text-right text-rose-500",
                            i === 8 ? "text-right text-[#2388ff]" : ""
                          )}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {dsBill.rows.map((r: any, i: number) => (
                        <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                          <td className="px-3 py-2.5 font-mono text-slate-300">{fmtDate(r.date)}</td>
                          <td className="px-3 py-2.5 text-center text-slate-400">{r.pageNo || "—"}</td>
                          <td className="px-3 py-2.5 text-white font-mono">{r.drNo || "—"}</td>
                          <td className="px-3 py-2.5 text-right font-mono text-emerald-400">{r.freight ? fmtINR(r.freight) : "—"}</td>
                          <td className="px-3 py-2.5 text-right font-mono text-rose-400">{r.labour ? fmtINR(r.labour) : "—"}</td>
                          <td className="px-3 py-2.5 text-right font-mono text-orange-400">{r.stationery ? fmtINR(r.stationery) : "—"}</td>
                          <td className="px-3 py-2.5 text-right font-mono text-amber-400">{r.commission ? fmtINR(r.commission) : "—"}</td>
                          <td className="px-3 py-2.5 text-right font-mono text-red-400">{r.aoc ? fmtINR(r.aoc) : "—"}</td>
                          <td className="px-3 py-2.5 text-right font-mono font-bold text-white">{fmtINR(r.total || 0)}</td>
                        </tr>
                      ))}
                      {/* Totals */}
                      {dsBill.totals && (
                        <tr className="bg-slate-800/80 border-t-2 border-[#2388ff]/40">
                          <td colSpan={3} className="px-3 py-3 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Totals</td>
                          <td className="px-3 py-3 text-right font-mono font-black text-emerald-400">{fmtINR(dsBill.totals.freight || 0)}</td>
                          <td className="px-3 py-3 text-right font-mono font-black text-rose-400">{fmtINR(dsBill.totals.labour || 0)}</td>
                          <td className="px-3 py-3 text-right font-mono font-black text-orange-400">{fmtINR(dsBill.totals.stationery || 0)}</td>
                          <td className="px-3 py-3 text-right font-mono font-black text-amber-400">{fmtINR(dsBill.totals.commission || 0)}</td>
                          <td className="px-3 py-3 text-right font-mono font-black text-red-400">{fmtINR(dsBill.totals.aoc || 0)}</td>
                          <td className="px-3 py-3 text-right font-mono font-black text-white">{fmtINR(dsBill.totals.grandTotal || 0)}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  {/* Net bar */}
                  <div className="px-5 py-4 bg-gradient-to-r from-blue-500/10 to-transparent border-t border-slate-800">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Credit Side (Freight)
                      </span>
                      <span className="text-base font-black font-mono text-emerald-400">{fmtINR(dsBill.totalCredit)}</span>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Debit Side (Labour + Stationery + Commission + A.O.C.)
                      </span>
                      <span className="text-base font-black font-mono text-rose-400">{fmtINR(dsBill.totalDebit)}</span>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-700">
                      <span className="text-sm font-bold text-white uppercase tracking-wider">Net Amount (Credit − Debit)</span>
                      <span className={cn(
                        "text-2xl font-black font-mono",
                        dsBill.netAmount >= 0 ? "text-emerald-400" : "text-rose-500"
                      )}>{fmtINR(dsBill.netAmount || 0)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════
            TAB 3 – COMBINED CLIENT BILL
        ══════════════════════════════════════════ */}
        {tab === "combined" && (
          <div className="space-y-5">
            {/* Grand total highlight */}
            {combinedBill && (
              <div className="bg-gradient-to-r from-violet-500/10 via-slate-900/60 to-transparent border border-violet-500/20 rounded-xl p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center">
                    <Calculator className="w-6 h-6 text-violet-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Combined Client Invoice</p>
                    <p className="text-sm text-slate-300 mt-0.5">{fmtDate(startDate)} — {fmtDate(endDate)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Grand Total</p>
                  <p className={cn(
                    "text-3xl font-black font-mono",
                    combinedBill.grandTotal >= 0 ? "text-violet-400" : "text-rose-500"
                  )}>{fmtINR(combinedBill.grandTotal || 0)}</p>
                </div>
                <ActionBar printHtmlFn={buildCombinedPrintHtml} pdfFilename="combined-invoice" />
              </div>
            )}

            {/* Two sections side by side */}
            {combinedBill && (
              <div className="grid md:grid-cols-2 gap-5">
                {/* Summary Section */}
                <div className="bg-slate-900/50 border border-emerald-500/20 rounded-xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-800 bg-emerald-500/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm font-bold text-white">Summary</span>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] text-slate-500 uppercase">Net</p>
                      <p className={cn("text-sm font-black font-mono", combinedBill.summary?.netBalance >= 0 ? "text-emerald-400" : "text-rose-400")}>
                        {fmtINR(combinedBill.summary?.netBalance || 0)}
                      </p>
                    </div>
                  </div>
                  <div className="p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Credit</span>
                      <span className="font-mono font-semibold text-emerald-400">{fmtINR(combinedBill.summary?.totalCredit || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Debit</span>
                      <span className="font-mono font-semibold text-rose-400">{fmtINR(combinedBill.summary?.totalDebit || 0)}</span>
                    </div>
                    <div className="h-px bg-slate-800 my-2" />
                    <div className="flex justify-between font-bold">
                      <span className="text-white">Net Balance</span>
                      <span className={cn("font-mono", combinedBill.summary?.netBalance >= 0 ? "text-emerald-400" : "text-rose-400")}>
                        {fmtINR(combinedBill.summary?.netBalance || 0)}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono">{combinedBill.summary?.rows?.length || 0} records</p>
                  </div>
                </div>

                {/* DS Section */}
                <div className="bg-slate-900/50 border border-blue-500/20 rounded-xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-800 bg-blue-500/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-blue-400" />
                      <span className="text-sm font-bold text-white">Delivery Statement</span>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] text-slate-500 uppercase">Net</p>
                      <p className={cn("text-sm font-black font-mono", combinedBill.deliveryStatement?.netAmount >= 0 ? "text-emerald-400" : "text-rose-400")}>
                        {fmtINR(combinedBill.deliveryStatement?.netAmount || 0)}
                      </p>
                    </div>
                  </div>
                  <div className="p-4 space-y-2 text-sm">
                    {[
                      { label: "Freight (Credit)", key: "freight", color: "text-emerald-400" },
                      { label: "Labour", key: "labour", color: "text-rose-400" },
                      { label: "Stationery", key: "stationery", color: "text-orange-400" },
                      { label: "Commission", key: "commission", color: "text-amber-400" },
                      { label: "A.O.C.", key: "aoc", color: "text-red-400" },
                    ].map(({ label, key, color }) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-slate-400">{label}</span>
                        <span className={cn("font-mono font-semibold", color)}>
                          {fmtINR(combinedBill.deliveryStatement?.totals?.[key] || 0)}
                        </span>
                      </div>
                    ))}
                    <div className="h-px bg-slate-800 my-2" />
                    <div className="flex justify-between font-bold">
                      <span className="text-white">Net Amount</span>
                      <span className={cn("font-mono", combinedBill.deliveryStatement?.netAmount >= 0 ? "text-emerald-400" : "text-rose-400")}>
                        {fmtINR(combinedBill.deliveryStatement?.netAmount || 0)}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono">{combinedBill.deliveryStatement?.rows?.length || 0} entries</p>
                  </div>
                </div>
              </div>
            )}

            {!combinedBill && loading && (
              <div className="flex items-center justify-center py-20 gap-3 text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin text-[#2388ff]" />
                <span>Loading combined bill...</span>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
