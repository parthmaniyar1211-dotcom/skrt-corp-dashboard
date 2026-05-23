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

export function AddExpenseDialog({ onExpenseAdded }: { onExpenseAdded: (newExpense?: any) => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    category: "Fuel",
    amount: 0,
    vehicle: "",
    description: "",
    date: new Date().toISOString().split('T')[0],
    paidBy: "",
    vendor: "",
    paymentMode: "Cash",
    status: "paid"
  });

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const { data } = await api.get("/vehicles");
        if (data.success) {
          setVehicles(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch vehicles", error);
      }
    };
    if (open) fetchVehicles();
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Look up vehicle number for local state updates
      let vehicleNo = "N/A";
      if (formData.vehicle && formData.vehicle !== "none") {
        const matchedVeh = vehicles.find(v => v._id === formData.vehicle || v.vehicleNo === formData.vehicle);
        if (matchedVeh) vehicleNo = matchedVeh.vehicleNo;
      }

      const payload = {
        ...formData,
        vehicle: formData.vehicle === "none" ? undefined : formData.vehicle
      };

      const res = await api.post("/expenses", payload);
      toast.success("Expense recorded successfully!");
      setOpen(false);
      
      const returnedData = res.data?.data || {
        ...payload,
        _id: `mock_exp_${Date.now()}`,
        vehicle: { vehicleNo }
      };

      onExpenseAdded(returnedData);
      setFormData({ 
        category: "Fuel", 
        amount: 0, 
        vehicle: "", 
        description: "", 
        date: new Date().toISOString().split('T')[0],
        paidBy: "",
        vendor: "",
        paymentMode: "Cash",
        status: "paid"
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add expense");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-4 shadow-md transition-all active:scale-95">
          <Plus className="w-4 h-4 mr-2" /> Add Expense
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-950 border border-zinc-800 text-zinc-100 max-h-[90vh] overflow-y-auto overflow-x-hidden w-full max-w-[480px] rounded-2xl shadow-2xl p-6 box-border">
        <DialogHeader className="pb-2 border-b border-zinc-900">
          <DialogTitle className="text-xl font-bold text-zinc-100">Record Expense</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4 w-full box-border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-300">Category *</Label>
              <Select 
                value={formData.category} 
                onValueChange={(v) => setFormData({...formData, category: v})}
              >
                <SelectTrigger className="bg-zinc-900 border-zinc-800 text-zinc-100 focus:border-primary/50 focus:ring-primary/50 rounded-lg text-sm">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-100">
                  <SelectItem value="Fuel">Fuel</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                  <SelectItem value="Toll">Toll</SelectItem>
                  <SelectItem value="Driver Allowance">Driver Allowance</SelectItem>
                  <SelectItem value="Loading/Unloading">Loading/Unloading</SelectItem>
                  <SelectItem value="Office Expense">Office Expense</SelectItem>
                  <SelectItem value="Insurance">Insurance</SelectItem>
                  <SelectItem value="Permit">Permit</SelectItem>
                  <SelectItem value="Tyre Repair">Tyre Repair</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="amount" className="text-xs font-semibold text-zinc-300">Amount (₹) *</Label>
              <Input 
                id="amount" 
                type="number"
                required
                className="bg-zinc-900 border-zinc-800 text-zinc-100 focus:border-primary/50 focus:ring-primary/50 rounded-lg text-sm"
                value={formData.amount || ""} 
                onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})} 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-300">Vehicle (Optional)</Label>
              <Select 
                value={formData.vehicle} 
                onValueChange={(v) => setFormData({...formData, vehicle: v})}
              >
                <SelectTrigger className="bg-zinc-900 border-zinc-800 text-zinc-100 focus:border-primary/50 focus:ring-primary/50 rounded-lg text-sm">
                  <SelectValue placeholder="Select Vehicle" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-100">
                  <SelectItem value="none">None</SelectItem>
                  {vehicles.map((v) => (
                    <SelectItem key={v._id} value={v._id}>{v.vehicleNo}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="date" className="text-xs font-semibold text-zinc-300">Date *</Label>
              <Input 
                id="date" 
                type="date"
                required
                className="bg-zinc-900 border-zinc-800 text-zinc-100 focus:border-primary/50 focus:ring-primary/50 rounded-lg text-sm"
                value={formData.date} 
                onChange={(e) => setFormData({...formData, date: e.target.value})} 
                style={{ colorScheme: "dark" }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="paidBy" className="text-xs font-semibold text-zinc-300">Paid By *</Label>
              <Input 
                id="paidBy" 
                required
                placeholder="e.g. Ramesh Singh"
                className="bg-zinc-900 border-zinc-800 text-zinc-100 focus:border-primary/50 focus:ring-primary/50 rounded-lg text-sm"
                value={formData.paidBy} 
                onChange={(e) => setFormData({...formData, paidBy: e.target.value})} 
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="vendor" className="text-xs font-semibold text-zinc-300">Vendor</Label>
              <Input 
                id="vendor" 
                placeholder="e.g. HP Fuel Pump"
                className="bg-zinc-900 border-zinc-800 text-zinc-100 focus:border-primary/50 focus:ring-primary/50 rounded-lg text-sm"
                value={formData.vendor} 
                onChange={(e) => setFormData({...formData, vendor: e.target.value})} 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-300">Payment Mode *</Label>
              <Select 
                value={formData.paymentMode} 
                onValueChange={(v) => setFormData({...formData, paymentMode: v})}
              >
                <SelectTrigger className="bg-zinc-900 border-zinc-800 text-zinc-100 focus:border-primary/50 focus:ring-primary/50 rounded-lg text-sm">
                  <SelectValue placeholder="Payment Mode" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-100">
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="Fuel Card">Fuel Card</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-300">Status *</Label>
              <Select 
                value={formData.status} 
                onValueChange={(v) => setFormData({...formData, status: v})}
              >
                <SelectTrigger className="bg-zinc-900 border-zinc-800 text-zinc-100 focus:border-primary/50 focus:ring-primary/50 rounded-lg text-sm">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-100">
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-xs font-semibold text-zinc-300">Description</Label>
            <Input 
              id="description" 
              placeholder="e.g. NH-48 Toll"
              className="bg-zinc-900 border-zinc-800 text-zinc-100 focus:border-primary/50 focus:ring-primary/50 rounded-lg text-sm"
              value={formData.description} 
              onChange={(e) => setFormData({...formData, description: e.target.value})} 
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
              disabled={loading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 shadow-md transition-all active:scale-95"
            >
              {loading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
