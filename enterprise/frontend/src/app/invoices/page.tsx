"use client";

import React from "react";
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
import { FileText, Download, Printer, Filter, CreditCard } from "lucide-react";

import api from "@/lib/api";
import { CreateInvoiceDialog } from "@/components/invoices/CreateInvoiceDialog";
import { cn } from "@/lib/utils";

export default function InvoicesPage() {
  const [invoiceList, setInvoiceList] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/invoices");
      if (data.success) {
        setInvoiceList(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch invoices", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchInvoices();
  }, []);

  const dummyInvoices = [
    { _id: "inv1", invoiceNo: "INV-2025-001", client: { name: "Aditya Textiles" }, shipment: { shipmentId: "SKRT001001" }, total: 245000, status: "paid", createdAt: "2024-05-10" },
    { _id: "inv2", invoiceNo: "INV-2025-002", client: { name: "Rajasthan Fabrics" }, shipment: { shipmentId: "SKRT001002" }, total: 180000, status: "unpaid", createdAt: "2024-05-12" },
    { _id: "inv3", invoiceNo: "INV-2025-003", client: { name: "Global Logistics" }, shipment: { shipmentId: "SKRT001003" }, total: 320000, status: "paid", createdAt: "2024-05-14" },
    { _id: "inv4", invoiceNo: "INV-2025-004", client: { name: "Metro Mart" }, shipment: { shipmentId: "SKRT001004" }, total: 95000, status: "unpaid", createdAt: "2024-05-15" },
  ];

  const currentInvoices = invoiceList.length > 0 ? invoiceList : dummyInvoices;
  const totalBilled = currentInvoices.reduce((acc, curr) => acc + curr.total, 0);
  const pendingAmount = currentInvoices.filter(inv => inv.status === 'unpaid').reduce((acc, curr) => acc + curr.total, 0);
  const paidAmount = currentInvoices.filter(inv => inv.status === 'paid').reduce((acc, curr) => acc + curr.total, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Billing & Invoices</h2>
            <p className="text-muted-foreground">Manage client payments, generate invoices, and track revenue.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm"><Filter className="w-4 h-4 mr-2" /> Filters</Button>
            <CreateInvoiceDialog onInvoiceCreated={fetchInvoices} />
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          <Card className="border-border/50 bg-secondary/10">
            <CardHeader className="p-4 pb-0"><CardTitle className="text-xs uppercase text-muted-foreground">Total Billed</CardTitle></CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="text-2xl font-bold">₹{(totalBilled / 100000).toFixed(1)}L</div>
              <p className="text-[10px] text-accent mt-1">Life time billing</p>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-secondary/10">
            <CardHeader className="p-4 pb-0"><CardTitle className="text-xs uppercase text-muted-foreground">Pending</CardTitle></CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="text-2xl font-bold text-yellow-500">₹{(pendingAmount / 100000).toFixed(1)}L</div>
              <p className="text-[10px] text-muted-foreground mt-1">{currentInvoices.filter(inv => inv.status === 'unpaid').length} invoices outstanding</p>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-secondary/10 border-l-destructive border-l-4">
            <CardHeader className="p-4 pb-0"><CardTitle className="text-xs uppercase text-muted-foreground">Status Split</CardTitle></CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="text-2xl font-bold text-destructive">
                {currentInvoices.filter(inv => inv.status === 'unpaid').length}
              </div>
              <p className="text-[10px] text-destructive mt-1">Pending collection</p>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-secondary/10">
            <CardHeader className="p-4 pb-0"><CardTitle className="text-xs uppercase text-muted-foreground">Paid MTD</CardTitle></CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="text-2xl font-bold text-accent">₹{(paidAmount / 100000).toFixed(1)}L</div>
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
                  <TableHead>Shipment</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && invoiceList.length === 0 ? (
                   <TableRow>
                     <TableCell colSpan={7} className="text-center py-10 animate-pulse text-muted-foreground">Loading invoices...</TableCell>
                   </TableRow>
                ) : currentInvoices.map((inv) => (
                  <TableRow key={inv._id} className="border-border/50 hover:bg-white/5 transition-colors">
                    <TableCell className="font-bold text-primary">{inv.invoiceNo}</TableCell>
                    <TableCell>{inv.client?.name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{inv.shipment?.shipmentId}</TableCell>
                    <TableCell className="font-bold">₹{inv.total.toLocaleString()}</TableCell>
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
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/20 hover:text-primary"><Download className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/20 hover:text-primary"><Printer className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-accent/20 hover:text-accent"><CreditCard className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

function Plus({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14"/><path d="M12 5v14"/></svg>
  )
}
