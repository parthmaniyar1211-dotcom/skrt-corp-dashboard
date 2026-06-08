"use client";

import React, { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Search, Eye, Printer, Download, Loader2, AlertCircle,
  FileText, ChevronRight, X
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { WhatsAppShareButton } from "@/components/shared/WhatsAppShareButton";

/* ─── helpers ─── */
const fmtDate = (s: string | Date | null | undefined) => {
  if (!s) return "—";
  try {
    const d = new Date(s as string);
    if (isNaN(d.getTime())) return String(s);
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch { return String(s); }
};

const fmtStrDate = (s: string) => {
  if (!s) return "—";
  const p = s.split("-");
  return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : s;
};

/* ─── record types ─── */
type RecordType = "challan" | "entry" | "cash-memo" | "summary" | "delivery-statement" | "shipment" | "invoice";

interface TabConfig {
  id: RecordType;
  label: string;
  emoji: string;
  color: string;
  borderColor: string;
  searchFields: string[];
  apiPath: string;
}

const TABS: TabConfig[] = [
  {
    id: "challan",
    label: "Challan",
    emoji: "📋",
    color: "text-blue-400",
    borderColor: "border-blue-500/30",
    searchFields: ["Challan No.", "Date", "Vehicle No.", "Driver"],
    apiPath: "/challan",
  },
  {
    id: "entry",
    label: "Entry",
    emoji: "📝",
    color: "text-cyan-400",
    borderColor: "border-cyan-500/30",
    searchFields: ["Page No.", "Challan No.", "Vehicle No.", "Driver"],
    apiPath: "/entry",
  },
  {
    id: "cash-memo",
    label: "Cash Memo",
    emoji: "💰",
    color: "text-amber-400",
    borderColor: "border-amber-500/30",
    searchFields: ["D.R. No.", "G.R. No.", "Consignee", "Date"],
    apiPath: "/cash-memo",
  },
  {
    id: "summary",
    label: "Summary",
    emoji: "📄",
    color: "text-violet-400",
    borderColor: "border-violet-500/30",
    searchFields: ["Summary No.", "Challan No.", "Driver", "Date"],
    apiPath: "/summary",
  },
  {
    id: "delivery-statement",
    label: "Delivery Statement",
    emoji: "🚛",
    color: "text-rose-400",
    borderColor: "border-rose-500/30",
    searchFields: ["Page No.", "D.R. No.", "S.No.", "Date"],
    apiPath: "/delivery-statement",
  },
  {
    id: "shipment",
    label: "Shipment",
    emoji: "🚢",
    color: "text-emerald-400",
    borderColor: "border-emerald-500/30",
    searchFields: ["Consignment No.", "Client", "Consignor", "Consignee", "Date"],
    apiPath: "/shipments",
  },
  {
    id: "invoice",
    label: "Invoice",
    emoji: "🧾",
    color: "text-[#2388ff]",
    borderColor: "border-[#2388ff]/30",
    searchFields: ["Invoice No.", "Client Name", "Status"],
    apiPath: "/invoices",
  },
];

/* ─── normalize records to a common shape ─── */
function normalizeRecord(type: RecordType, r: any): any {
  switch (type) {
    case "challan":
      return {
        _id: r._id,
        title: `Challan No. ${r.challanNo || "—"}`,
        sub1: r.driverName || "—",
        sub2: r.vehicleNo || "—",
        sub3: r.date || "—",
        badge: r.challanNo,
        raw: r,
      };
    case "entry":
      return {
        _id: r._id,
        title: `Page ${r.pageNo || "—"}`,
        sub1: `Challan: ${r.challanNo || "—"}`,
        sub2: r.vehicleNo || r.vehicleNo || "—",
        sub3: r.dateSearch || "—",
        badge: r.pageNo,
        raw: r,
      };
    case "cash-memo":
      return {
        _id: r._id,
        title: `D.R. No. ${r.drNo || "—"}`,
        sub1: `G.R. No. ${r.grNo || "—"}`,
        sub2: r.consignee || "—",
        sub3: r.date ? fmtDate(r.date) : "—",
        badge: r.drNo,
        raw: r,
      };
    case "summary":
      return {
        _id: r._id,
        title: `Summary — ${fmtStrDate(r.date)}`,
        sub1: `${r.entries?.length || 0} entries`,
        sub2: r.entries?.[0]?.driverName || "—",
        sub3: r.date || "—",
        badge: r.date,
        raw: r,
      };
    case "delivery-statement":
      return {
        _id: r._id,
        title: `Page No. ${r.pageNo || "—"}`,
        sub1: `${r.entries?.length || 0} entries`,
        sub2: r.entries?.[0]?.drNo || "—",
        sub3: r.dateSearch || "—",
        badge: r.pageNo,
        raw: r,
      };
    case "shipment":
      return {
        _id: r._id,
        title: `Consignment ${r.consignmentNumber || "—"}`,
        sub1: r.consignor?.name || "—",
        sub2: r.consignee?.name || "—",
        sub3: r.createdAt ? fmtDate(r.createdAt) : "—",
        badge: r.status,
        raw: r,
      };
    case "invoice":
      return {
        _id: r._id,
        title: `Invoice ${r.invoiceNo || "—"}`,
        sub1: r.client?.name || "—",
        sub2: `₹ ${(r.total || 0).toLocaleString("en-IN")}`,
        sub3: r.createdAt ? fmtDate(r.createdAt) : "—",
        badge: r.status,
        raw: r,
      };
  }
}

/* ─── search filter ─── */
function filterRecord(type: RecordType, r: any, q: string): boolean {
  if (!q.trim()) return true;
  const lower = q.toLowerCase();
  const searchIn = (...vals: any[]) => vals.some(v => String(v || "").toLowerCase().includes(lower));

  switch (type) {
    case "challan":
      return searchIn(r.challanNo, r.date, r.vehicleNo, r.driverName, ...(r.entries || []).map((e: any) => e.grNo));
    case "entry":
      return searchIn(r.pageNo, r.challanNo, r.vehicleNo, r.driverName,
        ...(r.entries || []).map((e: any) => [e.sno, e.grNo, e.deliveryReceiptNo]).flat());
    case "cash-memo":
      return searchIn(r.drNo, r.grNo, r.consignee, r.date, r.from);
    case "summary":
      return searchIn(r.date,
        ...(r.entries || []).map((e: any) => [e.sno, e.challanNo, e.driverName]).flat());
    case "delivery-statement":
      return searchIn(r.pageNo, r.dateSearch,
        ...(r.entries || []).map((e: any) => [e.sno, e.drNo]).flat());
    case "shipment":
      return searchIn(r.consignmentNumber, r.vehicleNumber, r.consignor?.name, r.consignee?.name);
    case "invoice":
      return searchIn(r.invoiceNo, r.client?.name, r.status);
  }
}

/* ─── print HTML for preview ─── */
function buildPreviewHtml(type: RecordType, r: any): string {
  const fmtN = (n: any) => (parseFloat(n) || 0).toFixed(2);

  if (type === "challan") {
    const rows = (r.entries || []).map((e: any) => `
      <tr><td>${e.grNo||'—'}</td><td>${e.pkg||'—'}</td><td>${e.dest||'—'}</td><td>${e.consignor||'—'}</td><td>${e.consignee||'—'}</td><td style="text-align:right">${e.total||'—'}</td><td style="text-align:right">${e.wt||'—'}</td></tr>`).join('');
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Challan ${r.challanNo}</title>
    <style>body{font-family:Arial,sans-serif;padding:30px;color:#111}h1{text-align:center;font-size:20px;text-transform:uppercase;color:#1a3a6b}
    .meta{display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;margin:16px 0;font-size:13px;font-weight:600}
    table{width:100%;border-collapse:collapse;font-size:12px}th,td{border:1px solid #ccc;padding:6px 8px}th{background:#e8ecf0;font-weight:700;text-transform:uppercase}
    .totals{margin-top:14px;font-size:13px}.totals div{display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px dotted #ccc}
    .footer{margin-top:50px;display:flex;justify-content:space-between;font-size:13px;font-weight:700}.no-print{text-align:center;margin-bottom:18px}
    .no-print button{background:#1a3a6b;color:#fff;border:none;padding:8px 24px;border-radius:4px;cursor:pointer;font-size:13px;font-weight:600}</style></head><body>
    <div class="no-print"><button onclick="window.print()">🖨️ Print</button></div>
    <h1>Sant Kanwar Ram Transport Corporation</h1><h2 style="text-align:center;font-size:14px">Challan</h2>
    <div class="meta">
      <span><b>Challan No.:</b> ${r.challanNo||'—'}</span><span><b>Date:</b> ${r.date||'—'}</span>
      <span><b>Vehicle:</b> ${r.vehicleNo||'—'}</span><span><b>Driver:</b> ${r.driverName||'—'}</span>
    </div>
    <table><thead><tr><th>G.R. No.</th><th>Pkg</th><th>Destination</th><th>Consignor</th><th>Consignee</th><th>Total</th><th>Wt.</th></tr></thead><tbody>${rows}</tbody></table>
    <div class="totals">
      <div><span>Truck Freight:</span><span>₹ ${r.truckFreight||'0'}</span></div>
      <div><span>Commission:</span><span>₹ ${r.commission||'0'}</span></div>
      <div><span>Labour:</span><span>₹ ${r.labour||'0'}</span></div>
      <div><span>Advance:</span><span>₹ ${r.advance||'0'}</span></div>
      <div><span><b>Total to Pay:</b></span><span><b>₹ ${r.totalToPay||'0'}</b></span></div>
    </div>
    <div class="footer"><span>Driver Signature: _________</span><span>For Sant Kanwar Ram Transport Corp.</span></div>
    </body></html>`;
  }

  if (type === "cash-memo") {
    const total = (parseFloat(r.freight)||0)+(parseFloat(r.labour)||0)+(parseFloat(r.stationery)||0)+(parseFloat(r.commission)||0)+(parseFloat(r.aoc)||0);
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Cash Memo ${r.drNo}</title>
    <style>body{font-family:Arial,sans-serif;padding:30px;color:#111;max-width:480px;margin:auto}h1{text-align:center;font-size:19px;text-transform:uppercase;color:#1a3a6b}
    .field{display:flex;padding:6px 0;border-bottom:1px dotted #ccc;font-size:13px}.label{font-weight:700;min-width:130px;color:#444}
    .total-row{display:flex;justify-content:space-between;font-size:16px;font-weight:900;margin-top:20px;padding-top:10px;border-top:2px solid #1a3a6b}
    .no-print{text-align:center;margin-bottom:18px}.no-print button{background:#1a3a6b;color:#fff;border:none;padding:8px 24px;border-radius:4px;cursor:pointer;font-size:13px}</style></head><body>
    <div class="no-print"><button onclick="window.print()">🖨️ Print</button></div>
    <h1>Sant Kanwar Ram Transport Corporation</h1><h2 style="text-align:center;font-size:13px;margin:4px 0">Cash Memo (Delivery Receipt)</h2>
    <div class="field"><span class="label">D.R. No.:</span><span>${r.drNo||'—'}</span></div>
    <div class="field"><span class="label">G.R. No.:</span><span>${r.grNo||'—'}</span></div>
    <div class="field"><span class="label">Date:</span><span>${fmtDate(r.date)}</span></div>
    <div class="field"><span class="label">From:</span><span>${r.from||'—'}</span></div>
    <div class="field"><span class="label">Consignee:</span><span>${r.consignee||'—'}</span></div>
    <div class="field"><span class="label">Freight:</span><span>₹ ${fmtN(r.freight)}</span></div>
    <div class="field"><span class="label">Labour:</span><span>₹ ${fmtN(r.labour)}</span></div>
    <div class="field"><span class="label">Stationery:</span><span>₹ ${fmtN(r.stationery)}</span></div>
    <div class="field"><span class="label">Commission:</span><span>₹ ${fmtN(r.commission)}</span></div>
    <div class="field"><span class="label">A.O.C.:</span><span>₹ ${fmtN(r.aoc)}</span></div>
    <div class="total-row"><span>TOTAL:</span><span>₹ ${total.toFixed(2)}</span></div>
    </body></html>`;
  }

  if (type === "summary") {
    const rows = (r.entries||[]).map((e: any) => `<tr><td>${e.sno||'—'}</td><td>${e.truckNo||'—'}</td><td>${e.driverName||'—'}</td><td>${e.transportName||'—'}</td><td>${e.challanNo||'—'}</td><td style="text-align:right">${fmtN(e.credit)}</td><td style="text-align:right">${fmtN(e.debit)}</td><td>${e.note||'—'}</td></tr>`).join('');
    const tc = (r.entries||[]).reduce((a: number,e: any)=>a+(parseFloat(e.credit)||0),0);
    const td = (r.entries||[]).reduce((a: number,e: any)=>a+(parseFloat(e.debit)||0),0);
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Summary ${r.date}</title>
    <style>body{font-family:Arial,sans-serif;padding:30px;color:#111}h1{text-align:center;font-size:19px;text-transform:uppercase;color:#1a3a6b}
    table{width:100%;border-collapse:collapse;font-size:11px;margin-top:12px}th,td{border:1px solid #ccc;padding:5px 7px}th{background:#e8ecf0;font-weight:700;text-transform:uppercase}
    .tot{font-weight:700;background:#f0f4f8}.no-print{text-align:center;margin-bottom:18px}.no-print button{background:#1a3a6b;color:#fff;border:none;padding:8px 24px;border-radius:4px;cursor:pointer;font-size:13px}</style></head><body>
    <div class="no-print"><button onclick="window.print()">🖨️ Print</button></div>
    <h1>Sant Kanwar Ram Transport Corporation</h1><h2 style="text-align:center;font-size:13px;margin:4px 0">Summary Register — ${r.date||'—'}</h2>
    <table><thead><tr><th>S.No.</th><th>Truck</th><th>Driver</th><th>Transport</th><th>Challan</th><th>Credit</th><th>Debit</th><th>Note</th></tr></thead>
    <tbody>${rows}<tr class="tot"><td colspan="5" style="text-align:right">TOTALS:</td><td style="text-align:right">₹ ${tc.toFixed(2)}</td><td style="text-align:right">₹ ${td.toFixed(2)}</td><td></td></tr></tbody></table>
    <div style="margin-top:14px;font-size:14px;font-weight:700;text-align:right">Net Balance: ₹ ${(tc-td).toFixed(2)}</div>
    </body></html>`;
  }

  if (type === "delivery-statement") {
    const val = (s: any) => parseFloat(s)||0;
    const tot = (e: any) => val(e.freight)+val(e.labour)+val(e.receiptCh)+val(e.dCom)+val(e.demurage);
    const rows = (r.entries||[]).map((e: any)=>`<tr><td>${e.sno||'—'}</td><td>${e.drNo||'—'}</td><td style="text-align:right">${e.freight||'—'}</td><td style="text-align:right">${e.labour||'—'}</td><td style="text-align:right">${e.receiptCh||'—'}</td><td style="text-align:right">${e.dCom||'—'}</td><td style="text-align:right">${e.demurage||'—'}</td><td style="text-align:right">${tot(e).toFixed(2)}</td></tr>`).join('');
    const t = r.totals||{};
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>DS Page ${r.pageNo}</title>
    <style>body{font-family:Arial,sans-serif;padding:30px;color:#111}h1{text-align:center;font-size:19px;text-transform:uppercase;color:#1a3a6b}
    table{width:100%;border-collapse:collapse;font-size:11px;margin-top:12px}th,td{border:1px solid #ccc;padding:5px 7px}th{background:#e8ecf0;font-weight:700;text-transform:uppercase}
    .meta{display:flex;justify-content:space-between;margin:14px 0 8px;font-size:13px;font-weight:600}.tot{font-weight:700;background:#f0f4f8}
    .no-print{text-align:center;margin-bottom:18px}.no-print button{background:#1a3a6b;color:#fff;border:none;padding:8px 24px;border-radius:4px;cursor:pointer;font-size:13px}</style></head><body>
    <div class="no-print"><button onclick="window.print()">🖨️ Print</button></div>
    <h1>Sant Kanwar Ram Transport Corporation</h1><h2 style="text-align:center;font-size:13px;margin:4px 0">Delivery Statement</h2>
    <div class="meta"><span>Date: ${r.dateSearch||'—'}</span><span>Page No.: ${r.pageNo||'—'}</span></div>
    <table><thead><tr><th>S.No.</th><th>D.R. No.</th><th>Freight</th><th>Labour</th><th>Stationery</th><th>Commission</th><th>A.O.C.</th><th>Total</th></tr></thead>
    <tbody>${rows}<tr class="tot"><td colspan="2" style="text-align:right">TOTALS:</td><td style="text-align:right">${(t.freight||0).toFixed(2)}</td><td style="text-align:right">${(t.labour||0).toFixed(2)}</td><td style="text-align:right">${(t.receiptCh||0).toFixed(2)}</td><td style="text-align:right">${(t.dCom||0).toFixed(2)}</td><td style="text-align:right">${(t.demurage||0).toFixed(2)}</td><td style="text-align:right">${(t.total||0).toFixed(2)}</td></tr></tbody></table>
    </body></html>`;
  }

  if (type === "entry") {
    const rows = (r.entries||[]).map((e: any)=>`<tr><td>${e.sno||'—'}</td><td>${e.grNo||'—'}</td><td>${e.consignor||'—'}</td><td>${e.consignee||'—'}</td><td>${e.from||'—'}→${e.to||'—'}</td><td>${e.noOfPackages||'—'}</td><td style="text-align:right">${e.freight||'—'}</td><td>${e.deliveryReceiptNo||'—'}</td><td>${e.deliveryStatus||'—'}</td></tr>`).join('');
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Entry Page ${r.pageNo}</title>
    <style>body{font-family:Arial,sans-serif;padding:30px;color:#111}h1{text-align:center;font-size:19px;text-transform:uppercase;color:#1a3a6b}
    table{width:100%;border-collapse:collapse;font-size:10.5px;margin-top:12px}th,td{border:1px solid #ccc;padding:5px 6px}th{background:#e8ecf0;font-weight:700;text-transform:uppercase}
    .meta{display:flex;flex-wrap:wrap;gap:12px;margin:14px 0 8px;font-size:12px;font-weight:600}
    .no-print{text-align:center;margin-bottom:18px}.no-print button{background:#1a3a6b;color:#fff;border:none;padding:8px 24px;border-radius:4px;cursor:pointer;font-size:13px}</style></head><body>
    <div class="no-print"><button onclick="window.print()">🖨️ Print</button></div>
    <h1>Sant Kanwar Ram Transport Corporation</h1><h2 style="text-align:center;font-size:13px;margin:4px 0">Entry Register (Delivery Register)</h2>
    <div class="meta"><span>Page: ${r.pageNo||'—'}</span><span>Date: ${r.dateSearch||'—'}</span><span>Challan: ${r.challanNo||'—'}</span><span>Vehicle: ${r.vehicleNo||'—'}</span><span>Driver: ${r.driverName||'—'}</span></div>
    <table><thead><tr><th>S.No.</th><th>G.R. No.</th><th>Consignor</th><th>Consignee</th><th>Route</th><th>Pkgs</th><th>Freight</th><th>D.R. No.</th><th>Status</th></tr></thead>
    <tbody>${rows}</tbody></table>
    </body></html>`;
  }

  if (type === "shipment") {
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Shipment ${r.consignmentNumber}</title>
    <style>body{font-family:Arial,sans-serif;padding:30px;color:#111;max-width:550px;margin:auto}h1{text-align:center;font-size:19px;text-transform:uppercase;color:#1a3a6b}
    .field{display:flex;padding:5px 0;border-bottom:1px dotted #ccc;font-size:13px}.label{font-weight:700;min-width:160px;color:#444}
    .badge{display:inline-block;padding:2px 10px;border-radius:4px;background:#e8ecf0;font-weight:700;font-size:11px}
    .no-print{text-align:center;margin-bottom:18px}.no-print button{background:#1a3a6b;color:#fff;border:none;padding:8px 24px;border-radius:4px;cursor:pointer;font-size:13px}</style></head><body>
    <div class="no-print"><button onclick="window.print()">🖨️ Print</button></div>
    <h1>Sant Kanwar Ram Transport Corporation</h1><h2 style="text-align:center;font-size:13px">Shipment Details</h2>
    <div class="field"><span class="label">Consignment No.:</span><span>${r.consignmentNumber||'—'}</span></div>
    <div class="field"><span class="label">Vehicle No.:</span><span>${r.vehicleNumber||'—'}</span></div>
    <div class="field"><span class="label">Status:</span><span class="badge">${r.status||'—'}</span></div>
    <div class="field"><span class="label">Consignor:</span><span>${r.consignor?.name||'—'}</span></div>
    <div class="field"><span class="label">Consignee:</span><span>${r.consignee?.name||'—'}</span></div>
    <div class="field"><span class="label">Origin:</span><span>${r.origin||'—'}</span></div>
    <div class="field"><span class="label">Destination:</span><span>${r.destination||'—'}</span></div>
    <div class="field"><span class="label">Created:</span><span>${fmtDate(r.createdAt)}</span></div>
    </body></html>`;
  }

  if (type === "invoice") {
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Invoice ${r.invoiceNo}</title>
    <style>body{font-family:Arial,sans-serif;padding:30px;color:#111;max-width:600px;margin:auto}h1{text-align:center;font-size:19px;text-transform:uppercase;color:#1a3a6b}
    .meta{display:flex;justify-content:space-between;margin:16px 0 10px;font-size:12px}
    table{width:100%;border-collapse:collapse;margin-top:14px}th,td{border:1px solid #ccc;padding:7px 10px}th{background:#e8ecf0;font-weight:700}
    .total{text-align:right;font-weight:900;font-size:16px;margin-top:16px}
    .no-print{text-align:center;margin-bottom:18px}.no-print button{background:#1a3a6b;color:#fff;border:none;padding:8px 24px;border-radius:4px;cursor:pointer;font-size:13px}</style></head><body>
    <div class="no-print"><button onclick="window.print()">🖨️ Print</button></div>
    <h1>Sant Kanwar Ram Transport Corporation</h1><h2 style="text-align:center;font-size:13px">Invoice</h2>
    <div class="meta">
      <div><b>Invoice No.:</b> ${r.invoiceNo||'—'}</div>
      <div><b>Date:</b> ${fmtDate(r.createdAt)}</div>
      <div><b>Status:</b> ${r.status||'—'}</div>
    </div>
    <div style="font-size:13px;margin-bottom:14px"><b>Bill To:</b> ${r.client?.name||'—'}</div>
    <table><thead><tr><th>Description</th><th style="text-align:right">Amount</th></tr></thead>
    <tbody>
      <tr><td>Transport Services</td><td style="text-align:right">₹ ${(r.amount||0).toFixed(2)}</td></tr>
      <tr><td>Tax</td><td style="text-align:right">₹ ${(r.tax||0).toFixed(2)}</td></tr>
    </tbody></table>
    <div class="total">Total: ₹ ${(r.total||0).toFixed(2)}</div>
    </body></html>`;
  }

  return `<html><body><p>Preview not available for this record type.</p></body></html>`;
}

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────── */
export default function RecordsPage() {
  const [activeTab, setActiveTab] = useState<RecordType>("challan");
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [previewRecord, setPreviewRecord] = useState<any | null>(null);
  const [previewHtml, setPreviewHtml] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);

  const currentTab = TABS.find((t) => t.id === activeTab)!;

  /* ── fetch records for current tab ── */
  const fetchRecords = async (type: RecordType) => {
    setLoading(true);
    setRecords([]);
    setSearchQuery("");
    try {
      const { data } = await api.get(TABS.find(t => t.id === type)!.apiPath);
      const list = data.data || data.invoices || [];
      setRecords(Array.isArray(list) ? list : []);
    } catch {
      toast.error("Failed to load records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRecords(activeTab); }, [activeTab]);

  /* ── filtered + normalized records ── */
  const normalized = useMemo(() => {
    return records
      .filter((r) => filterRecord(activeTab, r, searchQuery))
      .map((r) => normalizeRecord(activeTab, r));
  }, [records, activeTab, searchQuery]);

  /* ── view record ── */
  const handleView = (item: any) => {
    const html = buildPreviewHtml(activeTab, item.raw);
    setPreviewRecord(item);
    setPreviewHtml(html);
    setPreviewOpen(true);
  };

  /* ── print ── */
  const handlePrint = (item: any) => {
    const html = buildPreviewHtml(activeTab, item.raw);
    const pw = window.open("", "_blank");
    if (!pw) return;
    pw.document.write(html);
    pw.document.close();
  };

  /* ── download PDF ── */
  const handlePdf = (item: any) => {
    const html = buildPreviewHtml(activeTab, item.raw);
    const withScript = html.replace(
      "</body>",
      `<script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"><\/script>
<script>window.onload=function(){html2pdf().set({margin:8,filename:'${activeTab}-${item._id}.pdf'}).from(document.body).save();};<\/script></body>`
    );
    const pw = window.open("", "_blank");
    if (!pw) return;
    pw.document.write(withScript);
    pw.document.close();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* ── HEADER ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#2388ff]/15 border border-[#2388ff]/30 flex items-center justify-center">
                <span className="text-lg">🗂</span>
              </div>
              Record Center
            </h2>
            <p className="text-slate-400 text-sm mt-1.5">
              Search, view, print, download and share any document — including historical records
            </p>
          </div>
        </div>

        <div className="flex gap-5">
          {/* ── SIDEBAR TABS ── */}
          <div className="w-48 shrink-0 space-y-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 text-left border",
                  activeTab === t.id
                    ? `bg-slate-800 text-white ${t.borderColor} shadow-md`
                    : "bg-transparent text-slate-500 border-transparent hover:text-slate-300 hover:bg-slate-900/60"
                )}
              >
                <span className="text-base">{t.emoji}</span>
                <span className={activeTab === t.id ? t.color : ""}>{t.label}</span>
              </button>
            ))}
          </div>

          {/* ── MAIN CONTENT ── */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Search bar */}
            <div className={cn(
              "flex items-center gap-3 bg-slate-900/60 border rounded-xl px-4 py-2.5",
              currentTab.borderColor
            )}>
              <Search className={cn("w-4 h-4 shrink-0", currentTab.color)} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search by ${currentTab.searchFields.join(", ")}...`}
                className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-slate-600"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-slate-500 hover:text-white transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <span className="text-[10px] text-slate-500 font-mono">
                {normalized.length} record{normalized.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Records table */}
            <div className={cn(
              "bg-slate-900/50 border rounded-xl overflow-hidden",
              currentTab.borderColor
            )}>
              {/* Table header */}
              <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-800 bg-slate-900/60">
                <span className="text-base">{currentTab.emoji}</span>
                <span className={cn("text-sm font-bold uppercase tracking-wide", currentTab.color)}>
                  {currentTab.label} Records
                </span>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-16 gap-3 text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin text-[#2388ff]" />
                  <span className="text-sm">Loading {currentTab.label} records...</span>
                </div>
              ) : normalized.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-500 gap-3">
                  <AlertCircle className="w-8 h-8 opacity-40" />
                  <p className="text-sm">
                    {searchQuery ? `No ${currentTab.label} records match "${searchQuery}"` : `No ${currentTab.label} records found`}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-800/50">
                  {normalized.map((item) => (
                    <div
                      key={item._id}
                      className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-800/30 transition-colors group"
                    >
                      {/* Icon */}
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm",
                        `bg-slate-800 border ${currentTab.borderColor}`
                      )}>
                        {currentTab.emoji}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">{item.title}</p>
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {item.sub1} &nbsp;·&nbsp; {item.sub2} &nbsp;·&nbsp;
                          <span className="font-mono">{item.sub3}</span>
                        </p>
                      </div>

                      {/* Badge */}
                      {item.badge && (
                        <span className={cn(
                          "text-[10px] px-2 py-0.5 rounded-full font-bold border shrink-0 hidden sm:inline",
                          currentTab.color, currentTab.borderColor
                        )}>
                          {item.badge}
                        </span>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* View */}
                        <button
                          onClick={() => handleView(item)}
                          title="View"
                          className="h-7 w-7 rounded-lg bg-slate-800 hover:bg-[#2388ff]/20 border border-slate-700 hover:border-[#2388ff]/40 flex items-center justify-center text-slate-400 hover:text-[#2388ff] transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Print */}
                        <button
                          onClick={() => handlePrint(item)}
                          title="Print"
                          className="h-7 w-7 rounded-lg bg-slate-800 hover:bg-blue-500/20 border border-slate-700 hover:border-blue-500/40 flex items-center justify-center text-slate-400 hover:text-blue-400 transition-all"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>

                        {/* PDF */}
                        <button
                          onClick={() => handlePdf(item)}
                          title="Download PDF"
                          className="h-7 w-7 rounded-lg bg-slate-800 hover:bg-amber-500/20 border border-slate-700 hover:border-amber-500/40 flex items-center justify-center text-slate-400 hover:text-amber-400 transition-all"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        {/* WhatsApp Share */}
                        <WhatsAppShareButton
                          recordType={activeTab}
                          recordId={item._id}
                          label=""
                          size="sm"
                          className="h-7 w-7 !px-0 justify-center"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── PREVIEW MODAL ── */}
      {previewOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setPreviewOpen(false)}
          />
          <div className="relative w-full max-w-4xl h-[85vh] bg-white rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col">
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-3 bg-[#1a3a6b] text-white shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span className="font-bold text-sm">{previewRecord?.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { const pw = window.open("","_blank"); pw?.document.write(previewHtml); pw?.document.close(); }}
                  className="px-3 py-1 text-xs font-semibold bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Printer className="w-3 h-3" /> Print
                </button>
                <button
                  onClick={() => setPreviewOpen(false)}
                  className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* iframe preview */}
            <iframe
              srcDoc={previewHtml}
              title="Record Preview"
              className="flex-1 w-full border-0"
            />
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
