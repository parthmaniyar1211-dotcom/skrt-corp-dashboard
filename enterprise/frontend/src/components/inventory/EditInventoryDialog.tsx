"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import api from "@/lib/api";
import { toast } from "sonner";

export function EditInventoryDialog({
  open,
  onOpenChange,
  item,
  onUpdated
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: any;
  onUpdated: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    cargoName: "",
    senderName: "",
    senderPhone: "",
    receiverName: "",
    receiverPhone: "",
    origin: "",
    destination: "",
    packages: 1,
    weight: 0,
    rate: 0,
    paymentMode: "To Pay",
    warehouseLocation: "Main Warehouse",
    incomingStatus: "Pending",
    outgoingStatus: "Pending",
    status: "In Inventory",
    remarks: ""
  });

  useEffect(() => {
    if (item) {
      setFormData({
        cargoName: item.cargoName || "",
        senderName: item.senderName || "",
        senderPhone: item.senderPhone || "",
        receiverName: item.receiverName || "",
        receiverPhone: item.receiverPhone || "",
        origin: item.origin || "",
        destination: item.destination || "",
        packages: item.packages || 1,
        weight: item.weight || 0,
        rate: item.rate || 0,
        paymentMode: item.paymentMode || "To Pay",
        warehouseLocation: item.warehouseLocation || "Main Warehouse",
        incomingStatus: item.incomingStatus || "Pending",
        outgoingStatus: item.outgoingStatus || "Pending",
        status: item.status || "In Inventory",
        remarks: item.remarks || ""
      });
    }
  }, [item]);

  const totalFreight = (Number(formData.weight) || 0) * (Number(formData.rate) || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;
    setLoading(true);

    try {
      const payload = {
        ...formData,
        packages: Number(formData.packages),
        weight: Number(formData.weight),
        rate: Number(formData.rate),
        totalFreight
      };

      const res = await api.put(`/inventory/${item._id}`, payload);
      if (res.data.success) {
        toast.success("Inventory record updated successfully!");
        onOpenChange(false);
        onUpdated();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update inventory record");
    } finally {
      setLoading(false);
    }
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto overflow-x-hidden w-full max-w-4xl bg-background border-border shadow-2xl rounded-2xl backdrop-blur-sm box-border">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-2xl font-bold">Edit Inventory Record ({item.inventoryId})</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Update cargo details, statuses, and freight calculations.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-4 w-full box-border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full box-border">
            <div className="space-y-2">
              <Label>Inventory ID</Label>
              <Input disabled value={item.inventoryId} className="bg-secondary/40 font-mono text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <Label>LR No / Consignment No</Label>
              <Input disabled value={item.lrNo} className="bg-secondary/40 font-mono text-muted-foreground" />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Item / Cargo Name *</Label>
              <Input
                required
                value={formData.cargoName}
                onChange={(e) => setFormData({ ...formData, cargoName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Sender Name *</Label>
              <Input
                required
                value={formData.senderName}
                onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Sender Phone *</Label>
              <Input
                required
                value={formData.senderPhone}
                onChange={(e) => setFormData({ ...formData, senderPhone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Receiver Name *</Label>
              <Input
                required
                value={formData.receiverName}
                onChange={(e) => setFormData({ ...formData, receiverName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Receiver Phone *</Label>
              <Input
                required
                value={formData.receiverPhone}
                onChange={(e) => setFormData({ ...formData, receiverPhone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Origin *</Label>
              <Input
                required
                value={formData.origin}
                onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Destination *</Label>
              <Input
                required
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Packages *</Label>
              <Input
                required
                type="number"
                min="1"
                value={formData.packages}
                onChange={(e) => setFormData({ ...formData, packages: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Weight (kg) *</Label>
              <Input
                required
                type="number"
                min="0"
                step="any"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label>Rate (per kg) *</Label>
              <Input
                required
                type="number"
                min="0"
                step="any"
                value={formData.rate}
                onChange={(e) => setFormData({ ...formData, rate: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-primary font-bold">Total Freight (₹)</Label>
              <div className="h-10 flex items-center px-3 rounded-md bg-primary/10 text-primary font-bold border border-primary/20">
                ₹{totalFreight.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Payment Mode *</Label>
              <Select
                value={formData.paymentMode}
                onValueChange={(v) => setFormData({ ...formData, paymentMode: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Payment Mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="To Pay">To Pay</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Credit">Credit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Warehouse Location</Label>
              <Input
                value={formData.warehouseLocation}
                onChange={(e) => setFormData({ ...formData, warehouseLocation: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Incoming Status</Label>
              <Select
                value={formData.incomingStatus}
                onValueChange={(v) => setFormData({ ...formData, incomingStatus: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Incoming Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="N/A">N/A</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Received">Received</SelectItem>
                  <SelectItem value="Arrived at Warehouse">Arrived at Warehouse</SelectItem>
                  <SelectItem value="Checked In">Checked In</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Outgoing Status</Label>
              <Select
                value={formData.outgoingStatus}
                onValueChange={(v) => setFormData({ ...formData, outgoingStatus: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Outgoing Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="N/A">N/A</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Dispatched">Dispatched</SelectItem>
                  <SelectItem value="In Transit">In Transit</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Main Status</Label>
              <Select
                value={formData.status}
                onValueChange={(v) => setFormData({ ...formData, status: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Main Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="In Inventory">In Inventory</SelectItem>
                  <SelectItem value="Incoming">Incoming</SelectItem>
                  <SelectItem value="Outgoing">Outgoing</SelectItem>
                  <SelectItem value="In Transit">In Transit</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Remarks</Label>
              <Input
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter className="flex gap-3 pt-6 border-t border-border">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {loading ? "Updating..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
