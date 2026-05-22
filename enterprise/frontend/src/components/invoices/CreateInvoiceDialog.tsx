"use client";

import React, { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

export function CreateInvoiceDialog({ onInvoiceCreated }: { onInvoiceCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shipments, setShipments] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    invoiceNo: `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
    shipmentId: "",
    clientName: "",
    amount: 0,
    tax: 0,
    total: 0,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        const { data } = await api.get("/shipments");
        if (data.success) {
          setShipments(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch shipments", error);
      }
    };
    if (open) fetchShipments();
  }, [open]);

  const handleShipmentChange = (shipmentId: string) => {
    const selected = shipments.find(s => s._id === shipmentId);
    if (selected) {
      const amount = selected.totalFreight || selected.totalPayable || 0;
      const tax = amount * 0.18; // 18% GST default
      setFormData({
        ...formData,
        shipmentId,
        clientName: selected.consignor?.name || selected.sender?.name || "",
        amount,
        tax,
        total: amount + tax
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        invoiceNo: formData.invoiceNo,
        shipment: formData.shipmentId,
        client: {
          name: formData.clientName
        },
        amount: formData.amount,
        tax: formData.tax,
        total: formData.total,
        dueDate: formData.dueDate
      };

      await api.post("/invoices", payload);
      toast.success("Invoice created successfully!");
      setOpen(false);
      onInvoiceCreated();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create invoice");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-4 shadow-md transition-all active:scale-95">
          <Plus className="w-4 h-4 mr-2" /> New Invoice
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-950 border border-zinc-800 text-zinc-100 max-h-[90vh] overflow-y-auto overflow-x-hidden w-full max-w-[425px] rounded-2xl shadow-2xl p-6 box-border">
        <DialogHeader className="pb-2 border-b border-zinc-900">
          <DialogTitle className="text-xl font-bold text-zinc-100">Create New Invoice</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4 w-full box-border">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-300">Invoice Number</Label>
            <Input 
              className="bg-zinc-900 border-zinc-800 text-zinc-100 focus:border-primary/50 focus:ring-primary/50 rounded-lg text-sm"
              value={formData.invoiceNo} 
              onChange={(e) => setFormData({...formData, invoiceNo: e.target.value})} 
            />
          </div>
          
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-300">Select Shipment *</Label>
            <Select onValueChange={handleShipmentChange}>
              <SelectTrigger className="bg-zinc-900 border-zinc-800 text-zinc-100 focus:border-primary/50 focus:ring-primary/50 rounded-lg text-sm">
                <SelectValue placeholder="Choose a shipment" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-100">
                {shipments.map((s) => (
                  <SelectItem key={s._id} value={s._id}>
                    {s.consignmentNumber || s.shipmentId || s._id.slice(-6).toUpperCase()} - {s.consignor?.name || s.sender?.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full box-border">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-300">Base Amount</Label>
              <Input type="number" value={formData.amount} readOnly className="bg-zinc-900/50 border-zinc-800 text-zinc-400 rounded-lg text-sm cursor-not-allowed" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-300">Tax (GST 18%)</Label>
              <Input type="number" value={formData.tax} readOnly className="bg-zinc-900/50 border-zinc-800 text-zinc-400 rounded-lg text-sm cursor-not-allowed" />
            </div>
          </div>

          <div className="space-y-1.5 p-3 rounded-lg bg-zinc-900/50 border border-zinc-850">
            <Label className="text-zinc-400 font-medium text-xs">Total Payable</Label>
            <div className="text-2xl font-bold text-primary">₹{formData.total.toLocaleString()}</div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-300">Due Date</Label>
            <Input 
              type="date" 
              className="bg-zinc-900 border-zinc-800 text-zinc-100 focus:border-primary/50 focus:ring-primary/50 rounded-lg text-sm"
              value={formData.dueDate} 
              onChange={(e) => setFormData({...formData, dueDate: e.target.value})} 
              style={{ colorScheme: "dark" }}
            />
          </div>

          <DialogFooter className="pt-2 border-t border-zinc-900">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => setOpen(false)}
              className="hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !formData.shipmentId}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 shadow-md transition-all active:scale-95"
            >
              {loading ? "Generating..." : "Generate Invoice"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
