"use client";

import React, { useState, useEffect, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { cn } from "@/lib/utils";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
  CardHeader 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Filter, 
  MoreVertical,
  Download,
  Eye,
  Edit,
  Trash2,
  FileText,
  Printer,
  Truck,
  Receipt,
  PlusSquare,
  X,
  SlidersHorizontal
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

import api from "@/lib/api";
import { toast } from "sonner";
import { CreateInventoryDialog } from "@/components/inventory/CreateInventoryDialog";
import { EditInventoryDialog } from "@/components/inventory/EditInventoryDialog";
import { ViewInventoryDialog } from "@/components/inventory/ViewInventoryDialog";
import { DeleteInventoryDialog } from "@/components/inventory/DeleteInventoryDialog";
import { inventory as mockInventory } from "@/lib/mockData";

// ─── Filter Panel ──────────────────────────────────────────────────────────────
const INCOMING_STATUSES = ["In Inventory", "Dispatched", "Delivered", "Pending", "In Transit"];

interface InvFilters {
  inventoryId: string;
  lrNo: string;
  cargoName: string;
  senderName: string;
  destination: string;
  incomingStatus: string;
  dateFrom: string;
  dateTo: string;
}

const emptyFilters: InvFilters = {
  inventoryId: "", lrNo: "", cargoName: "", senderName: "",
  destination: "", incomingStatus: "all", dateFrom: "", dateTo: ""
};

function FilterPanel({
  open,
  onClose,
  filters,
  setFilters,
  onApply,
  onClear,
}: {
  open: boolean;
  onClose: () => void;
  filters: InvFilters;
  setFilters: React.Dispatch<React.SetStateAction<InvFilters>>;
  onApply: () => void;
  onClear: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[9998] flex items-start justify-end" onClick={onClose}>
      <div
        className="relative mt-20 mr-6 w-[340px] bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-6 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-primary" />
            <h3 className="font-bold text-sm text-foreground">Filter Inventory</h3>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Fields */}
        <div className="space-y-3">
          <div>
            <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest mb-1 block">Inventory ID</label>
            <Input
              placeholder="e.g. INV-001"
              value={filters.inventoryId}
              onChange={e => setFilters(f => ({ ...f, inventoryId: e.target.value }))}
              className="h-8 text-xs bg-zinc-900 border-zinc-700"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest mb-1 block">LR No</label>
            <Input
              placeholder="e.g. LR-2024-001"
              value={filters.lrNo}
              onChange={e => setFilters(f => ({ ...f, lrNo: e.target.value }))}
              className="h-8 text-xs bg-zinc-900 border-zinc-700"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest mb-1 block">Cargo Name</label>
            <Input
              placeholder="e.g. Cotton Bales"
              value={filters.cargoName}
              onChange={e => setFilters(f => ({ ...f, cargoName: e.target.value }))}
              className="h-8 text-xs bg-zinc-900 border-zinc-700"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest mb-1 block">Consignor / Sender</label>
            <Input
              placeholder="e.g. Aditya Textiles"
              value={filters.senderName}
              onChange={e => setFilters(f => ({ ...f, senderName: e.target.value }))}
              className="h-8 text-xs bg-zinc-900 border-zinc-700"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest mb-1 block">Destination</label>
            <Input
              placeholder="e.g. Mumbai"
              value={filters.destination}
              onChange={e => setFilters(f => ({ ...f, destination: e.target.value }))}
              className="h-8 text-xs bg-zinc-900 border-zinc-700"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest mb-1 block">Incoming Status</label>
            <Select
              value={filters.incomingStatus}
              onValueChange={v => setFilters(f => ({ ...f, incomingStatus: v }))}
            >
              <SelectTrigger className="h-8 text-xs bg-zinc-900 border-zinc-700">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-950 border-zinc-800">
                <SelectItem value="all">All Statuses</SelectItem>
                {INCOMING_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest mb-1 block">Date From</label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value }))}
                className="h-8 text-xs bg-zinc-900 border-zinc-700"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest mb-1 block">Date To</label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={e => setFilters(f => ({ ...f, dateTo: e.target.value }))}
                className="h-8 text-xs bg-zinc-900 border-zinc-700"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-zinc-800">
          <Button
            size="sm"
            className="flex-1 h-8 text-xs bg-primary hover:bg-primary/90"
            onClick={() => { onApply(); onClose(); }}
          >
            Apply Filter
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 h-8 text-xs border-zinc-700 text-muted-foreground hover:text-foreground"
            onClick={() => { onClear(); onClose(); }}
          >
            Clear Filter
          </Button>
        </div>
      </div>
    </div>
  );
}

function applyInvFilters(list: any[], filters: InvFilters, searchTerm: string): any[] {
  return list.filter(item => {
    // Search term check
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchSearch =
        item.inventoryId?.toLowerCase().includes(q) ||
        item.lrNo?.toLowerCase().includes(q) ||
        item.cargoName?.toLowerCase().includes(q) ||
        item.senderName?.toLowerCase().includes(q) ||
        item.destination?.toLowerCase().includes(q);
      if (!matchSearch) return false;
    }
    // Filter fields
    if (filters.inventoryId && !item.inventoryId?.toLowerCase().includes(filters.inventoryId.toLowerCase())) return false;
    if (filters.lrNo && !item.lrNo?.toLowerCase().includes(filters.lrNo.toLowerCase())) return false;
    if (filters.cargoName && !item.cargoName?.toLowerCase().includes(filters.cargoName.toLowerCase())) return false;
    if (filters.senderName && !item.senderName?.toLowerCase().includes(filters.senderName.toLowerCase())) return false;
    if (filters.destination && !item.destination?.toLowerCase().includes(filters.destination.toLowerCase())) return false;
    if (filters.incomingStatus && filters.incomingStatus !== "all" && item.incomingStatus !== filters.incomingStatus) return false;
    if (filters.dateFrom && item.createdAt && new Date(item.createdAt) < new Date(filters.dateFrom)) return false;
    if (filters.dateTo && item.createdAt && new Date(item.createdAt) > new Date(filters.dateTo + "T23:59:59")) return false;
    return true;
  });
}

// ─── Main Page ────────────────────────────────────────────────────────────────

function InventoryPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParam = searchParams.get("search");
  const [searchTerm, setSearchTerm] = useState("");
  const [inventoryList, setInventoryList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [filterOpen, setFilterOpen] = useState(false);
  const [pendingFilters, setPendingFilters] = useState<InvFilters>(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState<InvFilters>(emptyFilters);
  const isFiltered = Object.entries(appliedFilters).some(
    ([k, v]) => k === "incomingStatus" ? v !== "all" : v !== ""
  );

  // Modal states
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const fetchLock = useRef(false);

  const fetchInventory = async () => {
    if (fetchLock.current) return;
    try {
      setLoading(true);
      fetchLock.current = true;
      const { data } = await api.get("/inventory");
      if (data.success && data.data && data.data.length >= 3) {
        setInventoryList(data.data);
      } else {
        setInventoryList(mockInventory);
      }
    } catch (error) {
      console.error("Failed to fetch inventory records", error);
      setInventoryList(mockInventory);
    } finally {
      setLoading(false);
      fetchLock.current = false;
    }
  };

  useEffect(() => { fetchInventory(); }, []);

  useEffect(() => {
    if (searchParam && inventoryList.length > 0) {
      const found = inventoryList.find(
        item => item.inventoryId === searchParam || item._id === searchParam || item.lrNo === searchParam
      );
      if (found) { setSelectedItem(found); setViewOpen(true); }
    }
  }, [searchParam, inventoryList]);

  const filteredInventory = applyInvFilters(inventoryList, appliedFilters, searchTerm);

  const handleExport = () => {
    if (filteredInventory.length === 0) { toast.info("No records to export"); return; }
    const headers = ["Inventory ID", "LR No", "Cargo Name", "Sender Name", "Receiver Name", "Origin", "Destination", "Packages", "Weight", "Rate", "Total Freight", "Payment Mode", "Incoming Status", "Date"];
    const csvRows = filteredInventory.map(item => [
      item.inventoryId, item.lrNo,
      `"${item.cargoName || ''}"`, `"${item.senderName || ''}"`, `"${item.receiverName || ''}"`,
      item.origin, item.destination, item.packages, item.weight, item.rate,
      item.totalFreight, item.paymentMode, item.incomingStatus,
      new Date(item.createdAt).toLocaleDateString()
    ].join(","));
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...csvRows].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `Inventory_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
    toast.success("Inventory exported successfully");
  };

  return (
    <DashboardLayout>
      <FilterPanel
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={pendingFilters}
        setFilters={setPendingFilters}
        onApply={() => setAppliedFilters({ ...pendingFilters })}
        onClear={() => { setPendingFilters(emptyFilters); setAppliedFilters(emptyFilters); }}
      />
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Inventory</h2>
            <p className="text-muted-foreground">Manage inventory and cargo records</p>
          </div>
          <div id="cash-memo-action-bar" className="flex flex-wrap items-center gap-3 justify-end">
            <Button size="sm" onClick={() => router.push("/challan")}
              className="h-9 px-4 rounded-lg bg-slate-800 text-slate-200 hover:bg-blue-600 hover:text-white border border-slate-700 font-medium transition-all duration-200 flex items-center gap-2">
              <FileText className="h-4 w-4" /> Challan
            </Button>
            <Button size="sm" onClick={() => router.push("/cash-memo")}
              className="h-9 px-4 rounded-lg bg-slate-800 text-slate-200 hover:bg-blue-600 hover:text-white border border-slate-700 font-medium transition-all duration-200 flex items-center gap-2">
              <Receipt className="h-4 w-4" /> Cash Memo
            </Button>
            <Button size="sm" onClick={() => router.push("/entry")}
              className="h-9 px-4 rounded-lg bg-slate-800 text-slate-200 hover:bg-violet-600 hover:text-white border border-slate-700 font-medium transition-all duration-200 flex items-center gap-2">
              <PlusSquare className="h-4 w-4" /> Entry
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport} className="border-border/50 hover:bg-secondary">
              <Download className="h-4 w-4 mr-2" /> Export
            </Button>
            <CreateInventoryDialog onCreated={fetchInventory} />
          </div>
        </div>

        <Card className="border-border/50 bg-secondary/20 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by ID, LR No, Cargo, Sender or Destination..."
                  className="pl-10 bg-background/50 border-border/50"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                {isFiltered && (
                  <span className="text-[10px] text-primary font-bold uppercase tracking-widest bg-primary/10 px-2 py-1 rounded-full border border-primary/20">
                    Filtered
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn("hover:bg-background/40 gap-2", isFiltered && "text-primary")}
                  onClick={() => { setPendingFilters(appliedFilters); setFilterOpen(true); }}
                >
                  <Filter className="h-4 w-4" />
                  Filter
                  {isFiltered && <span className="w-2 h-2 rounded-full bg-primary" />}
                </Button>
                {isFiltered && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-background/40 text-muted-foreground hover:text-destructive gap-1 text-xs"
                    onClick={() => { setPendingFilters(emptyFilters); setAppliedFilters(emptyFilters); }}
                  >
                    <X className="h-3 w-3" /> Clear
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isFiltered && (
              <p className="text-[10px] text-muted-foreground mb-3 font-medium">
                Showing {filteredInventory.length} of {inventoryList.length} records
              </p>
            )}
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border/50">
                  <TableHead className="w-[110px]">Inventory ID</TableHead>
                  <TableHead className="w-[100px]">LR No</TableHead>
                  <TableHead>Cargo Name</TableHead>
                  <TableHead>Sender</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead className="text-center">Packages</TableHead>
                  <TableHead className="text-right">Weight</TableHead>
                  <TableHead>Incoming Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && inventoryList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-10 text-muted-foreground">
                      Loading inventory records...
                    </TableCell>
                  </TableRow>
                ) : filteredInventory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-10 text-muted-foreground">
                      {isFiltered ? "No records match the applied filters." : "No inventory records found."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInventory.map((item: any) => (
                    <TableRow key={item._id} className="border-border/50 hover:bg-white/5 transition-colors">
                      <TableCell className="font-mono font-bold text-primary">{item.inventoryId}</TableCell>
                      <TableCell className="font-mono text-muted-foreground">{item.lrNo}</TableCell>
                      <TableCell className="font-medium max-w-[150px] truncate" title={item.cargoName}>{item.cargoName}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium max-w-[120px] truncate" title={item.senderName}>{item.senderName}</span>
                          <span className="text-[10px] text-muted-foreground">{item.origin}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{item.destination}</TableCell>
                      <TableCell className="text-center font-mono">{item.packages}</TableCell>
                      <TableCell className="text-right font-mono">{item.weight} kg</TableCell>
                      <TableCell className="text-xs">
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground">{item.incomingStatus || "N/A"}</span>
                          <span className="text-[10px] text-muted-foreground">
                            Challan: <span className={cn(item.challanStatus === "Created" ? "text-emerald-400 font-medium" : "text-slate-400")}>
                              {item.challanStatus || "Not Created"}
                            </span>
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap font-medium">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/20"
                            onClick={() => { setSelectedItem(item); setViewOpen(true); }} title="View Details">
                            <Eye className="h-4 w-4 text-primary" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-secondary">
                                <MoreVertical className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-52">
                              <DropdownMenuLabel className="text-[10px] uppercase text-muted-foreground font-semibold">Record Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => { setSelectedItem(item); setViewOpen(true); }}>
                                <Eye className="h-4 w-4 mr-2 text-primary" /> View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => { setSelectedItem(item); setEditOpen(true); }}>
                                <Edit className="h-4 w-4 mr-2 text-yellow-500" /> Edit Record
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuLabel className="text-[10px] uppercase text-muted-foreground font-semibold">Dispatch / Challan</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => router.push("/challan")}
                                className="font-medium text-emerald-400 focus:text-emerald-300 focus:bg-emerald-500/10 hover:bg-emerald-500/10">
                                <Truck className="h-4 w-4 mr-2" /> Open Challan
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => { setSelectedItem(item); setDeleteOpen(true); }} variant="destructive">
                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Modal Dialogs */}
        <ViewInventoryDialog open={viewOpen} onOpenChange={setViewOpen} item={selectedItem} />
        <EditInventoryDialog open={editOpen} onOpenChange={setEditOpen} item={selectedItem}
          onUpdated={() => { setSelectedItem(null); fetchInventory(); }} />
        <DeleteInventoryDialog open={deleteOpen} onOpenChange={setDeleteOpen} item={selectedItem}
          onDeleted={() => { setSelectedItem(null); fetchInventory(); }} />
      </div>
    </DashboardLayout>
  );
}

export default function InventoryPage() {
  return (
    <Suspense fallback={
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
        </div>
      </DashboardLayout>
    }>
      <InventoryPageContent />
    </Suspense>
  );
}
