"use client";

import React, { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
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

export function CreateShipmentDialog({ onShipmentCreated }: { onShipmentCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    shipmentId: `SKRT${Date.now().toString().slice(-6)}`,
    senderName: "",
    senderPhone: "",
    receiverName: "",
    receiverPhone: "",
    origin: "",
    destination: "",
    packages: 1,
    weight: 0,
    rate: 0,
    paymentMode: "ToPay"
  });

  const totalFreight = formData.weight * formData.rate;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        shipmentId: formData.shipmentId,
        sender: {
          name: formData.senderName,
          phone: formData.senderPhone
        },
        receiver: {
          name: formData.receiverName,
          phone: formData.receiverPhone
        },
        origin: formData.origin,
        destination: formData.destination,
        packages: Number(formData.packages),
        weight: Number(formData.weight),
        rate: Number(formData.rate),
        totalFreight: totalFreight,
        paymentMode: formData.paymentMode
      };

      await api.post("/shipments", payload);
      toast.success("Shipment created successfully!");
      setOpen(false);
      onShipmentCreated();
      // Reset form
      setFormData({
        shipmentId: `SKRT${Date.now().toString().slice(-6)}`,
        senderName: "",
        senderPhone: "",
        receiverName: "",
        receiverPhone: "",
        origin: "",
        destination: "",
        packages: 1,
        weight: 0,
        rate: 0,
        paymentMode: "ToPay"
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create shipment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" /> New Shipment
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto overflow-x-hidden w-full max-w-4xl bg-background border-border shadow-2xl box-border">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-2xl font-bold">Create New Shipment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-4 w-full box-border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full box-border">
            <div className="space-y-2 md:col-span-2">
              <Label>Shipment ID</Label>
              <Input 
                value={formData.shipmentId} 
                onChange={(e) => setFormData({...formData, shipmentId: e.target.value})}
                className="bg-secondary/20"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Sender Name</Label>
              <Input 
                required
                placeholder="Sender Name"
                value={formData.senderName} 
                onChange={(e) => setFormData({...formData, senderName: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Sender Phone</Label>
              <Input 
                required
                placeholder="Sender Phone"
                value={formData.senderPhone} 
                onChange={(e) => setFormData({...formData, senderPhone: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Receiver Name</Label>
              <Input 
                required
                placeholder="Receiver Name"
                value={formData.receiverName} 
                onChange={(e) => setFormData({...formData, receiverName: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Receiver Phone</Label>
              <Input 
                required
                placeholder="Receiver Phone"
                value={formData.receiverPhone} 
                onChange={(e) => setFormData({...formData, receiverPhone: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Origin</Label>
              <Input 
                required
                placeholder="City Name"
                value={formData.origin} 
                onChange={(e) => setFormData({...formData, origin: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Destination</Label>
              <Input 
                required
                placeholder="City Name"
                value={formData.destination} 
                onChange={(e) => setFormData({...formData, destination: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Weight (kg)</Label>
              <Input 
                required
                type="number"
                value={formData.weight} 
                onChange={(e) => setFormData({...formData, weight: Number(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <Label>Rate (per kg)</Label>
              <Input 
                required
                type="number"
                value={formData.rate} 
                onChange={(e) => setFormData({...formData, rate: Number(e.target.value)})}
              />
            </div>

            <div className="space-y-2">
              <Label>Payment Mode</Label>
              <Select 
                value={formData.paymentMode} 
                onValueChange={(v) => setFormData({...formData, paymentMode: v})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Payment Mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ToPay">To Pay</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="TBB">TBB</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-primary font-bold">Total Freight</Label>
              <div className="h-10 flex items-center px-3 rounded-md bg-primary/10 text-primary font-bold border border-primary/20">
                ₹{totalFreight.toLocaleString()}
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-3 pt-6 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {loading ? "Creating..." : "Create Shipment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
