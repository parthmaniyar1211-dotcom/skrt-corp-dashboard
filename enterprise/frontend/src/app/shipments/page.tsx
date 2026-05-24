"use client";

import React, { useState, useCallback, useEffect, Suspense } from "react";
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
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  Eye,
  Edit,
  User,
  Search,
  Plus,
  Filter,
  Download,
  Printer,
  X,
  SlidersHorizontal
} from "lucide-react";

import { CreateShipmentDialog } from "@/components/shipments/CreateShipmentDialog";
import { ViewShipmentDialog } from "@/components/shipments/ViewShipmentDialog";
import { ViewContactDialog } from "@/components/shipments/ViewContactDialog";
import api from "@/lib/api";
import { toast } from "sonner";
import { shipments as mockShipments } from "@/lib/mockData";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

// ─── Shipments Filter Panel ──────────────────────────────────────────────────
const PAYMENT_MODES = ['Paid', 'ToPay', 'Credit'];
const STATUSES = ['Booked', 'In Transit', 'Delivered', 'Cancelled'];
const OUTGOING_STATUSES_F = ['Pending', 'Loaded', 'Dispatched', 'In Transit', 'Arrived at Branch', 'Out for Delivery', 'Delivered'];

interface ShipFilters {
  lrNo: string;
  consignor: string;
  consignee: string;
  toBranch: string;
  paymentMode: string;
  status: string;
  outgoingStatus: string;
  dateFrom: string;
  dateTo: string;
}

const emptyShipFilters: ShipFilters = {
  lrNo: '', consignor: '', consignee: '', toBranch: '',
  paymentMode: 'all', status: 'all', outgoingStatus: 'all',
  dateFrom: '', dateTo: ''
};

function ShipFilterPanel({
  open, onClose, filters, setFilters, onApply, onClear
}: {
  open: boolean;
  onClose: () => void;
  filters: ShipFilters;
  setFilters: React.Dispatch<React.SetStateAction<ShipFilters>>;
  onApply: () => void;
  onClear: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[9998] flex items-start justify-end" onClick={onClose}>
      <div
        className="relative mt-20 mr-6 w-[360px] bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-6 flex flex-col gap-4 max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-primary" />
            <h3 className="font-bold text-sm text-foreground">Filter Shipments</h3>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest mb-1 block">Consignment / LR No</label>
            <Input placeholder="e.g. SKRT-1001" value={filters.lrNo}
              onChange={e => setFilters(f => ({ ...f, lrNo: e.target.value }))}
              className="h-8 text-xs bg-zinc-900 border-zinc-700" />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest mb-1 block">Consignor</label>
            <Input placeholder="e.g. Aditya Textiles" value={filters.consignor}
              onChange={e => setFilters(f => ({ ...f, consignor: e.target.value }))}
              className="h-8 text-xs bg-zinc-900 border-zinc-700" />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest mb-1 block">Consignee</label>
            <Input placeholder="e.g. Mumbai Auto Corp" value={filters.consignee}
              onChange={e => setFilters(f => ({ ...f, consignee: e.target.value }))}
              className="h-8 text-xs bg-zinc-900 border-zinc-700" />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest mb-1 block">To Branch</label>
            <Input placeholder="e.g. Mumbai" value={filters.toBranch}
              onChange={e => setFilters(f => ({ ...f, toBranch: e.target.value }))}
              className="h-8 text-xs bg-zinc-900 border-zinc-700" />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest mb-1 block">Payment Mode</label>
            <Select value={filters.paymentMode} onValueChange={v => setFilters(f => ({ ...f, paymentMode: v }))}>
              <SelectTrigger className="h-8 text-xs bg-zinc-900 border-zinc-700"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-zinc-950 border-zinc-800">
                <SelectItem value="all">All Modes</SelectItem>
                {PAYMENT_MODES.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest mb-1 block">Status</label>
            <Select value={filters.status} onValueChange={v => setFilters(f => ({ ...f, status: v }))}>
              <SelectTrigger className="h-8 text-xs bg-zinc-900 border-zinc-700"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-zinc-950 border-zinc-800">
                <SelectItem value="all">All Statuses</SelectItem>
                {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest mb-1 block">Outgoing Status</label>
            <Select value={filters.outgoingStatus} onValueChange={v => setFilters(f => ({ ...f, outgoingStatus: v }))}>
              <SelectTrigger className="h-8 text-xs bg-zinc-900 border-zinc-700"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-zinc-950 border-zinc-800">
                <SelectItem value="all">All Outgoing Statuses</SelectItem>
                {OUTGOING_STATUSES_F.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest mb-1 block">Date From</label>
              <Input type="date" value={filters.dateFrom}
                onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value }))}
                className="h-8 text-xs bg-zinc-900 border-zinc-700" />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest mb-1 block">Date To</label>
              <Input type="date" value={filters.dateTo}
                onChange={e => setFilters(f => ({ ...f, dateTo: e.target.value }))}
                className="h-8 text-xs bg-zinc-900 border-zinc-700" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-zinc-800">
          <Button size="sm" className="flex-1 h-8 text-xs bg-primary hover:bg-primary/90"
            onClick={() => { onApply(); onClose(); }}>Apply Filter</Button>
          <Button size="sm" variant="outline" className="flex-1 h-8 text-xs border-zinc-700 text-muted-foreground hover:text-foreground"
            onClick={() => { onClear(); onClose(); }}>Clear Filter</Button>
        </div>
      </div>
    </div>
  );
}

function applyShipFilters(list: any[], filters: ShipFilters, searchTerm: string): any[] {
  return list.filter(s => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match =
        s.consignmentNumber?.toLowerCase().includes(q) ||
        s.consignor?.name?.toLowerCase().includes(q) ||
        s.consignee?.name?.toLowerCase().includes(q) ||
        s.toBranch?.toLowerCase().includes(q) ||
        s.vehicleNumber?.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (filters.lrNo && !s.consignmentNumber?.toLowerCase().includes(filters.lrNo.toLowerCase())) return false;
    if (filters.consignor && !((s.consignor?.name || s.sender?.name || s.sender || '')?.toLowerCase().includes(filters.consignor.toLowerCase()))) return false;
    if (filters.consignee && !((s.consignee?.name || s.receiver?.name || s.receiver || '')?.toLowerCase().includes(filters.consignee.toLowerCase()))) return false;
    if (filters.toBranch && !(s.toBranch || s.origin || '')?.toLowerCase().includes(filters.toBranch.toLowerCase())) return false;
    if (filters.paymentMode && filters.paymentMode !== 'all' && s.paymentMode !== filters.paymentMode) return false;
    if (filters.status && filters.status !== 'all' && s.status !== filters.status) return false;
    if (filters.outgoingStatus && filters.outgoingStatus !== 'all' && s.outgoingStatus !== filters.outgoingStatus) return false;
    if (filters.dateFrom && s.createdAt && new Date(s.createdAt) < new Date(filters.dateFrom)) return false;
    if (filters.dateTo && s.createdAt && new Date(s.createdAt) > new Date(filters.dateTo + 'T23:59:59')) return false;
    return true;
  });
}


const outgoingStatusOptions = [
  'Pending', 'Loaded', 'Dispatched', 'In Transit',
  'Arrived at Branch', 'Out for Delivery', 'Delivered'
];

const outgoingStatusColors: Record<string, string> = {
  "Pending": "text-yellow-400",
  "Loaded": "text-orange-400",
  "Dispatched": "text-blue-400",
  "In Transit": "text-cyan-400",
  "Arrived at Branch": "text-indigo-400",
  "Out for Delivery": "text-violet-400",
  "Delivered": "text-green-400",
};

function ShipmentsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParam = searchParams.get("search");
  const [searchTerm, setSearchTerm] = useState("");
  const [shipmentList, setShipmentList] = useState<any[]>(mockShipments);
  const [loading, setLoading] = useState(true);
  const [savingStatusId, setSavingStatusId] = useState<string | null>(null);

  // Filter state
  const [filterOpen, setFilterOpen] = useState(false);
  const [pendingShipFilters, setPendingShipFilters] = useState<ShipFilters>(emptyShipFilters);
  const [appliedShipFilters, setAppliedShipFilters] = useState<ShipFilters>(emptyShipFilters);
  const isShipFiltered = Object.entries(appliedShipFilters).some(
    ([k, v]) => ['paymentMode', 'status', 'outgoingStatus'].includes(k) ? v !== 'all' : v !== ''
  );

  // Modal states
  const [selectedShipment, setSelectedShipment] = useState<any>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewConsignorOpen, setViewConsignorOpen] = useState(false);
  const [viewConsigneeOpen, setViewConsigneeOpen] = useState(false);

  const fetchLock = React.useRef(false);

  const fetchShipments = async () => {
    if (fetchLock.current) return;
    try {
      setLoading(true);
      fetchLock.current = true;
      const { data } = await api.get("/shipments");
      if (data.success && data.data && data.data.length >= 3) {
        setShipmentList(data.data);
      } else {
        setShipmentList(mockShipments);
      }
    } catch (error) {
      console.error("Failed to fetch shipments", error);
      setShipmentList(mockShipments);
    } finally {
      setLoading(false);
      fetchLock.current = false;
    }
  };

  React.useEffect(() => {
    fetchShipments();
  }, []);

  useEffect(() => {
    if (searchParam && shipmentList.length > 0) {
      const found = shipmentList.find(
        ship => ship.consignmentNumber === searchParam || ship._id === searchParam || ship.id === searchParam
      );
      if (found) {
        setSelectedShipment(found);
        setViewOpen(true);
      }
    }
  }, [searchParam, shipmentList]);

  const filteredShipments = applyShipFilters(shipmentList, appliedShipFilters, searchTerm);

  const handleOutgoingStatusChange = useCallback(async (shipmentId: string, newStatus: string) => {
    // Optimistically update UI
    const prevList = shipmentList;
    setShipmentList(prev => prev.map(s => s._id === shipmentId ? { ...s, outgoingStatus: newStatus } : s));
    setSavingStatusId(shipmentId);
    try {
      const { data } = await api.put(`/shipments/${shipmentId}`, {
        outgoingStatus: newStatus,
        lastUpdatedAt: new Date().toISOString()
      });
      if (data.success && data.data) {
        setShipmentList(prev => prev.map(s => s._id === shipmentId ? data.data : s));
      }
      toast.success(`Outgoing status updated to "${newStatus}"`);
      // Notify tracking page (same tab) to refresh its timeline immediately
      window.dispatchEvent(new CustomEvent('skrt_outgoing_status_updated', {
        detail: { shipmentId, newStatus, vehicleNo: data?.data?.vehicleNumber }
      }));
    } catch (error) {
      // Revert optimistic update on failure
      setShipmentList(prevList);
      toast.error('Failed to update outgoing status. Please try again.');
    } finally {
      setSavingStatusId(null);
    }
  }, [shipmentList]);


  const handleExport = () => {
    const listToExport = filteredShipments.length > 0 ? filteredShipments : shipmentList;
    if (listToExport.length === 0) {
      toast.info("No shipment records to export");
      return;
    }
    const headers = ["Consignment Number", "Vehicle Number", "Consignor Name", "Consignee Name", "To Branch", "Package Type", "Quantity", "Charged Weight", "Payment Mode", "Total Freight", "Outgoing Status", "Date"];
    const csvRows = listToExport.map(s => [
      s.consignmentNumber || s.id,
      s.vehicleNumber || "",
      `"${s.consignor?.name || s.sender?.name || s.sender || ''}"`,
      `"${s.consignee?.name || s.receiver?.name || s.receiver || ''}"`,
      s.toBranch || s.origin || "",
      s.packageType || s.dest || "",
      s.quantity || 0,
      s.chargedWeight || 0,
      s.paymentMode || "",
      s.totalFreight || 0,
      s.outgoingStatus || "Pending",
      s.createdAt ? new Date(s.createdAt).toLocaleDateString() : ""
    ].join(","));

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...csvRows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Shipments_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Shipments exported successfully");
  };

  return (
    <DashboardLayout>
      <ShipFilterPanel
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={pendingShipFilters}
        setFilters={setPendingShipFilters}
        onApply={() => setAppliedShipFilters({ ...pendingShipFilters })}
        onClear={() => { setPendingShipFilters(emptyShipFilters); setAppliedShipFilters(emptyShipFilters); }}
      />
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Shipments</h2>
            <p className="text-muted-foreground">Manage and track all consignments in real-time.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" /> Export
            </Button>
            <CreateShipmentDialog onShipmentCreated={fetchShipments} />
          </div>
        </div>

        <Card className="border-border/50 bg-secondary/20 backdrop-blur-sm">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by consignment #, consignor, consignee, or branch..."
                  className="pl-10 bg-background/50 border-border/50"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                {isShipFiltered && (
                  <span className="text-[10px] text-primary font-bold uppercase tracking-widest bg-primary/10 px-2 py-1 rounded-full border border-primary/20">
                    Filtered
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn("gap-2", isShipFiltered && "text-primary")}
                  onClick={() => { setPendingShipFilters(appliedShipFilters); setFilterOpen(true); }}
                >
                  <Filter className="h-4 w-4" />
                  Filters
                  {isShipFiltered && <span className="w-2 h-2 rounded-full bg-primary" />}
                </Button>
                {isShipFiltered && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-background/40 text-muted-foreground hover:text-destructive gap-1 text-xs"
                    onClick={() => { setPendingShipFilters(emptyShipFilters); setAppliedShipFilters(emptyShipFilters); }}
                  >
                    <X className="h-3 w-3" /> Clear
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border/50">
                  <TableHead className="w-[150px]">Consignment No</TableHead>
                  <TableHead>Vehicle No</TableHead>
                  <TableHead>Consignor</TableHead>
                  <TableHead>Consignee</TableHead>
                  <TableHead>To Branch</TableHead>
                  <TableHead>Package Type</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Charged Weight</TableHead>
                  <TableHead>Payment Mode</TableHead>
                  <TableHead>Total Freight</TableHead>
                  <TableHead>Outgoing Status</TableHead>
                  <TableHead className="text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredShipments.map((shipment: any) => (
                  <TableRow key={shipment._id || shipment.id} className="border-border/50 hover:bg-white/5 transition-colors">
                    <TableCell className="font-medium text-primary">{shipment.consignmentNumber || shipment.shipmentId || shipment.id}</TableCell>
                    <TableCell className="font-mono text-xs text-foreground/90 font-bold">{shipment.vehicleNumber || '-'}</TableCell>
                    <TableCell>{shipment.consignor?.name || shipment.sender?.name || shipment.sender || '-'}</TableCell>
                    <TableCell>{shipment.consignee?.name || shipment.receiver?.name || shipment.receiver || '-'}</TableCell>
                    <TableCell>{shipment.toBranch || shipment.origin || '-'}</TableCell>
                    <TableCell>{shipment.packageType || shipment.dest || '-'}</TableCell>
                    <TableCell>{shipment.quantity ?? '-'}</TableCell>
                    <TableCell>{shipment.chargedWeight ?? '-'}</TableCell>
                    <TableCell>{shipment.paymentMode || '-'}</TableCell>
                    <TableCell>₹{shipment.totalFreight?.toLocaleString() || '-'}</TableCell>
                    <TableCell>
                      <div className="relative">
                        <Select
                          value={shipment.outgoingStatus || 'Pending'}
                          onValueChange={(val) => handleOutgoingStatusChange(shipment._id, val)}
                          disabled={savingStatusId === shipment._id}
                        >
                          <SelectTrigger className={cn(
                            "h-8 w-[145px] text-xs font-semibold border-border/50 bg-transparent",
                            savingStatusId === shipment._id ? "opacity-60 cursor-not-allowed" : "",
                            outgoingStatusColors[shipment.outgoingStatus] || 'text-yellow-400'
                          )}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {outgoingStatusOptions.map(opt => (
                              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {savingStatusId === shipment._id && (
                          <div className="absolute right-8 top-1/2 -translate-y-1/2">
                            <div className="w-3 h-3 border border-primary/60 border-t-primary rounded-full animate-spin" />
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-primary/20"
                          onClick={() => { setSelectedShipment(shipment); setViewOpen(true); }}
                          title="View Details"
                        >
                          <Eye className="h-4 w-4 text-primary" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-secondary">
                              <MoreVertical className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-52 z-[9999]">
                            <DropdownMenuLabel className="text-[10px] uppercase text-muted-foreground font-semibold tracking-wider">Actions</DropdownMenuLabel>

                            <DropdownMenuItem
                              onClick={() => { setSelectedShipment(shipment); setViewOpen(true); }}
                            >
                              <Eye className="h-4 w-4 mr-2 text-primary" /> View Shipment
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => { setSelectedShipment(shipment); setEditOpen(true); }}
                            >
                              <Edit className="h-4 w-4 mr-2 text-yellow-500" /> Edit Shipment
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />
                            <DropdownMenuLabel className="text-[10px] uppercase text-muted-foreground font-semibold tracking-wider">Contact Info</DropdownMenuLabel>

                            <DropdownMenuItem
                              onClick={() => { setSelectedShipment(shipment); setViewConsignorOpen(true); }}
                            >
                              <User className="h-4 w-4 mr-2 text-blue-400" /> View Consignor
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => { setSelectedShipment(shipment); setViewConsigneeOpen(true); }}
                            >
                              <User className="h-4 w-4 mr-2 text-purple-400" /> View Consignee
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Dialogs */}
        <ViewShipmentDialog
          open={viewOpen}
          onOpenChange={setViewOpen}
          shipment={selectedShipment}
        />
        <CreateShipmentDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          shipmentData={selectedShipment}
          isEdit={true}
          onShipmentCreated={() => { fetchShipments(); setSelectedShipment(null); }}
        />
        <ViewContactDialog
          open={viewConsignorOpen}
          onOpenChange={setViewConsignorOpen}
          contact={selectedShipment?.consignor}
          title="Consignor Details"
        />
        <ViewContactDialog
          open={viewConsigneeOpen}
          onOpenChange={setViewConsigneeOpen}
          contact={selectedShipment?.consignee}
          title="Consignee Details"
        />
      </div>
    </DashboardLayout>
  );
}

export default function ShipmentsPage() {
  return (
    <Suspense fallback={
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
        </div>
      </DashboardLayout>
    }>
      <ShipmentsPageContent />
    </Suspense>
  );
}
