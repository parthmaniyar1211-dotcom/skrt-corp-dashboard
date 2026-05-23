"use client";

import React, { Suspense } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Printer, Filter, CreditCard, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";

import api from "@/lib/api";
import { CreateInvoiceDialog } from "@/components/invoices/CreateInvoiceDialog";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { invoices as mockInvoices } from "@/lib/mockData";

const getShipmentId = (shipment: any): string => {
  if (!shipment) return "N/A";
  if (typeof shipment === "string") return shipment;
  if (typeof shipment === "object") {
    if (shipment.consignmentNumber && typeof shipment.consignmentNumber === "string") {
      return shipment.consignmentNumber;
    }
    if (shipment.shipmentId && typeof shipment.shipmentId === "string") {
      return shipment.shipmentId;
    }
    if (shipment._id) {
      return typeof shipment._id === "object" ? (shipment._id.toString ? shipment._id.toString() : JSON.stringify(shipment._id)) : String(shipment._id);
    }
  }
  return "N/A";
};

function InvoicesPageContent() {
  const searchParams = useSearchParams();
  const clientQuery = searchParams.get("client") || "";

  const [invoiceList, setInvoiceList] = React.useState<any[]>(mockInvoices);
  const [loading, setLoading] = React.useState(true);
  
  // Filter States
  const [filterClient, setFilterClient] = React.useState(clientQuery);
  const [filterDateStart, setFilterDateStart] = React.useState("");
  const [filterDateEnd, setFilterDateEnd] = React.useState("");
  const [showFilters, setShowFilters] = React.useState(!!clientQuery);

  // Detail Modal States
  const [selectedInvoice, setSelectedInvoice] = React.useState<any>(null);
  const [detailsOpen, setDetailsOpen] = React.useState(false);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/invoices");
      if (data.success && data.data && data.data.length >= 3) {
        setInvoiceList(data.data);
      } else {
        setInvoiceList(mockInvoices);
      }
    } catch (error) {
      console.error("Failed to fetch invoices", error);
      setInvoiceList(mockInvoices);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchInvoices();
  }, []);

  const handleDownloadInvoice = (inv: any) => {
    const textContent = `
========================================
             SKRT CORP INVOICE
========================================
Invoice Number: ${inv.invoiceNo}
Date:           ${new Date(inv.createdAt).toLocaleDateString()}
Client Name:    ${inv.client?.name}
Shipment ID:    ${getShipmentId(inv.shipment)}
----------------------------------------
Base Amount:    ₹${(inv.total / 1.18).toFixed(2)}
Tax (GST 18%):  ₹${(inv.total - inv.total / 1.18).toFixed(2)}
Total Payable:  ₹${inv.total.toLocaleString()}
Status:         ${inv.status.toUpperCase()}
========================================
Thank you for choosing SKRT CORP!
`;
    const blob = new Blob([textContent], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${inv.invoiceNo}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintInvoice = (inv: any) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Invoice ${inv.invoiceNo}</title>
          <style>
            body { font-family: monospace; padding: 40px; background: #fff; color: #000; line-height: 1.5; }
            pre { font-size: 14px; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <pre>
============================================================
                     SKRT CORP LOGISTICS
============================================================
INVOICE DETAILS
------------------------------------------------------------
Invoice Number : ${inv.invoiceNo}
Invoice Date   : ${new Date(inv.createdAt).toLocaleDateString()}
Client Name    : ${inv.client?.name}
Shipment ID    : ${getShipmentId(inv.shipment)}
------------------------------------------------------------
Base Amount    : INR ${(inv.total / 1.18).toFixed(2)}
GST (18%)      : INR ${(inv.total - inv.total / 1.18).toFixed(2)}
Total Amount   : INR ${inv.total.toLocaleString()}
Payment Status : ${inv.status.toUpperCase()}
============================================================
This is a computer generated invoice and requires no signature.
          </pre>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleExportFiltered = () => {
    const headers = ["Invoice No", "Client", "Shipment ID", "Amount", "Status", "Date"];
    const csvRows = [headers.join(",")];
    
    filteredInvoices.forEach(inv => {
      const row = [
        inv.invoiceNo,
        `"${inv.client?.name || ""}"`,
        getShipmentId(inv.shipment),
        inv.total,
        inv.status,
        new Date(inv.createdAt).toLocaleDateString()
      ];
      csvRows.push(row.join(","));
    });
    
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `filtered_invoices_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  React.useEffect(() => {
    fetchInvoices();
  }, []);

  const currentInvoices = invoiceList;
  
  const filteredInvoices = currentInvoices.filter(inv => {
    // Client filter
    if (filterClient && !inv.client?.name?.toLowerCase().includes(filterClient.toLowerCase())) {
      return false;
    }
    // Date filters
    const invDate = new Date(inv.createdAt);
    if (filterDateStart && new Date(filterDateStart) > invDate) {
      return false;
    }
    if (filterDateEnd) {
      const endDate = new Date(filterDateEnd);
      endDate.setHours(23, 59, 59, 999);
      if (invDate > endDate) {
        return false;
      }
    }
    return true;
  });

  const totalBilled = filteredInvoices.reduce((acc, curr) => acc + curr.total, 0);
  const pendingAmount = filteredInvoices.filter(inv => inv.status === 'unpaid').reduce((acc, curr) => acc + curr.total, 0);
  const paidAmount = filteredInvoices.filter(inv => inv.status === 'paid').reduce((acc, curr) => acc + curr.total, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Invoices</h2>
            <p className="text-muted-foreground">Manage client payments, generate invoices, and track revenue.</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowFilters(!showFilters)}
              className={cn("h-9 border-zinc-805 hover:bg-zinc-900 transition-all", showFilters && "bg-primary/20 border-primary/50 text-primary hover:bg-primary/30")}
            >
              <Filter className="w-4 h-4 mr-2" /> Filters
            </Button>
            <CreateInvoiceDialog onInvoiceCreated={fetchInvoices} />
          </div>
        </div>

        {/* Collapsible Filter Panel */}
        {showFilters && (
          <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/80 text-zinc-100 flex flex-wrap gap-4 items-end transition-all">
            <div className="space-y-1.5 flex-1 min-w-[200px]">
              <span className="text-xs font-semibold text-zinc-400">Client Name</span>
              <Input 
                placeholder="Search client..." 
                value={filterClient}
                onChange={(e) => setFilterClient(e.target.value)}
                className="bg-zinc-900 border-zinc-800 text-zinc-100 text-sm h-9"
              />
            </div>
            <div className="space-y-1.5 min-w-[150px]">
              <span className="text-xs font-semibold text-zinc-400">From Date</span>
              <Input 
                type="date" 
                value={filterDateStart}
                onChange={(e) => setFilterDateStart(e.target.value)}
                className="bg-zinc-900 border-zinc-800 text-zinc-100 text-sm h-9"
                style={{ colorScheme: "dark" }}
              />
            </div>
            <div className="space-y-1.5 min-w-[150px]">
              <span className="text-xs font-semibold text-zinc-400">To Date</span>
              <Input 
                type="date" 
                value={filterDateEnd}
                onChange={(e) => setFilterDateEnd(e.target.value)}
                className="bg-zinc-900 border-zinc-800 text-zinc-100 text-sm h-9"
                style={{ colorScheme: "dark" }}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-9 hover:bg-zinc-900 border-zinc-800 text-zinc-300"
                onClick={() => {
                  setFilterClient("");
                  setFilterDateStart("");
                  setFilterDateEnd("");
                }}
              >
                Reset
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-9 bg-primary/10 border-primary/20 text-primary hover:bg-primary/20 font-semibold px-4"
                onClick={handleExportFiltered}
              >
                <Download className="w-4 h-4 mr-2" /> Export CSV
              </Button>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-4 gap-6">
          <Card className="border-border/50 bg-secondary/10">
            <CardHeader className="p-4 pb-0"><CardTitle className="text-xs uppercase text-muted-foreground">Total Billed</CardTitle></CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="text-2xl font-bold">₹{(totalBilled / 100000).toFixed(2)}L</div>
              <p className="text-[10px] text-accent mt-1">Based on current filters</p>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-secondary/10">
            <CardHeader className="p-4 pb-0"><CardTitle className="text-xs uppercase text-muted-foreground">Pending</CardTitle></CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="text-2xl font-bold text-yellow-500">₹{(pendingAmount / 100000).toFixed(2)}L</div>
              <p className="text-[10px] text-muted-foreground mt-1">{filteredInvoices.filter(inv => inv.status === 'unpaid').length} outstanding</p>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-secondary/10 border-l-destructive border-l-4">
            <CardHeader className="p-4 pb-0"><CardTitle className="text-xs uppercase text-muted-foreground">Unpaid Invoices</CardTitle></CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="text-2xl font-bold text-destructive font-mono">
                {filteredInvoices.filter(inv => inv.status === 'unpaid').length}
              </div>
              <p className="text-[10px] text-destructive mt-1">Pending collection</p>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-secondary/10">
            <CardHeader className="p-4 pb-0"><CardTitle className="text-xs uppercase text-muted-foreground">Paid Total</CardTitle></CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="text-2xl font-bold text-accent">₹{(paidAmount / 100000).toFixed(2)}L</div>
              <p className="text-[10px] text-accent mt-1">High collection efficiency</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/50 bg-secondary/10">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead>Invoice No.</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Shipment ID</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && invoiceList.length === 0 ? (
                   <TableRow>
                     <TableCell colSpan={7} className="text-center py-10 animate-pulse text-muted-foreground">Loading invoices...</TableCell>
                   </TableRow>
                ) : filteredInvoices.length === 0 ? (
                   <TableRow>
                     <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">No invoices match selected filters.</TableCell>
                   </TableRow>
                ) : filteredInvoices.map((inv) => (
                  <TableRow key={inv._id} className="border-border/50 hover:bg-white/5 transition-colors">
                    <TableCell className="font-bold text-primary">{inv.invoiceNo}</TableCell>
                    <TableCell className="font-semibold text-zinc-300">{inv.client?.name}</TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">{getShipmentId(inv.shipment)}</TableCell>
                    <TableCell className="font-bold text-zinc-200">₹{inv.total.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn(
                        "px-2 py-0.5 capitalize",
                        inv.status === "paid" ? "text-accent border-accent/20 bg-accent/10" :
                        inv.status === "unpaid" ? "text-yellow-500 border-yellow-500/20 bg-yellow-500/10" :
                        "text-destructive border-destructive/20 bg-destructive/10"
                      )}>
                        {inv.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{new Date(inv.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 hover:bg-primary/20 hover:text-primary transition-all rounded-lg"
                          onClick={() => handleDownloadInvoice(inv)}
                          title="Download Invoice"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 hover:bg-primary/20 hover:text-primary transition-all rounded-lg"
                          onClick={() => handlePrintInvoice(inv)}
                          title="Print Invoice"
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 hover:bg-accent/20 hover:text-accent transition-all rounded-lg"
                          onClick={() => {
                            setSelectedInvoice(inv);
                            setDetailsOpen(true);
                          }}
                          title="Invoice Details"
                        >
                          <CreditCard className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Invoice Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="bg-zinc-950 border border-zinc-800 text-zinc-100 w-full max-w-[480px] rounded-2xl shadow-2xl p-6 box-border">
          <DialogHeader className="pb-4 border-b border-zinc-900">
            <DialogTitle className="text-xl font-bold text-zinc-100 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" /> Invoice Details
            </DialogTitle>
            <p className="text-xs text-zinc-400 mt-1">Invoice: <span className="font-semibold text-primary">{selectedInvoice?.invoiceNo}</span></p>
          </DialogHeader>

          <div className="py-6 space-y-4 text-sm">
            <div className="flex justify-between items-center bg-zinc-900/50 p-3 border border-zinc-850 rounded-xl">
              <span className="text-xs text-zinc-400">Status</span>
              <Badge variant="outline" className={cn(
                "px-2.5 py-1 capitalize",
                selectedInvoice?.status === "paid" ? "text-accent border-accent/20 bg-accent/10" :
                "text-yellow-500 border-yellow-500/20 bg-yellow-500/10"
              )}>
                {selectedInvoice?.status}
              </Badge>
            </div>

            <div className="space-y-3 bg-zinc-900/30 border border-zinc-850 rounded-xl p-4">
              <div className="flex justify-between">
                <span className="text-zinc-500">Client Name</span>
                <span className="text-zinc-200 font-semibold">{selectedInvoice?.client?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Shipment Ref</span>
                <span className="text-zinc-200 font-mono text-xs bg-zinc-900 px-2 py-0.5 border border-zinc-800 rounded">
                  {getShipmentId(selectedInvoice?.shipment)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Invoice Date</span>
                <span className="text-zinc-300">{selectedInvoice?.createdAt ? new Date(selectedInvoice.createdAt).toLocaleDateString() : ""}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Due Date</span>
                <span className="text-zinc-300">{selectedInvoice?.dueDate ? new Date(selectedInvoice.dueDate).toLocaleDateString() : "Net 7 Days"}</span>
              </div>
            </div>

            <div className="space-y-2 bg-zinc-900/40 border border-zinc-850 rounded-xl p-4">
              <div className="flex justify-between text-xs text-zinc-500">
                <span>Base Amount</span>
                <span>₹{(selectedInvoice?.total / 1.18 || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-zinc-500">
                <span>GST Tax (18%)</span>
                <span>₹{(selectedInvoice?.total - selectedInvoice?.total / 1.18 || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-zinc-200 pt-2 border-t border-zinc-800/65">
                <span>Total Payable</span>
                <span className="text-primary">₹{selectedInvoice?.total?.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setDetailsOpen(false);
                handlePrintInvoice(selectedInvoice);
              }}
              className="flex-1 bg-zinc-900 text-zinc-300 border-zinc-805 hover:bg-zinc-800"
            >
              <Printer className="w-4 h-4 mr-2" /> Print
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setDetailsOpen(false);
                handleDownloadInvoice(selectedInvoice);
              }}
              className="flex-1 bg-zinc-900 text-zinc-300 border-zinc-805 hover:bg-zinc-800"
            >
              <Download className="w-4 h-4 mr-2" /> Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

export default function InvoicesPage() {
  return (
    <Suspense fallback={
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
        </div>
      </DashboardLayout>
    }>
      <InvoicesPageContent />
    </Suspense>
  );
}

function Plus({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14"/><path d="M12 5v14"/></svg>
  )
}
