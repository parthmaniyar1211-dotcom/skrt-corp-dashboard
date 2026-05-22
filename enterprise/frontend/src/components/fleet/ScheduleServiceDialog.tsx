"use client";

import React, { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/api";
import { toast } from "sonner";

interface ScheduleServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicle: any;
  onServiceScheduled: () => void;
}

export function ScheduleServiceDialog({ 
  open, 
  onOpenChange, 
  vehicle, 
  onServiceScheduled 
}: ScheduleServiceDialogProps) {
  const [loading, setLoading] = useState(false);
  const [serviceDate, setServiceDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [description, setDescription] = useState("");
  const [cost, setCost] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicle) return;
    setLoading(true);

    try {
      // Patch vehicle status to maintenance and update lastServiceDate
      await api.patch(`/vehicles/${vehicle._id}`, {
        status: "maintenance",
        lastServiceDate: serviceDate
      });

      toast.success(`Service scheduled for vehicle ${vehicle.vehicleNo}!`);
      onOpenChange(false);
      onServiceScheduled();
      setDescription("");
      setCost("");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to schedule service");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-950 border border-zinc-800 text-zinc-100 w-full max-w-[425px] rounded-2xl shadow-2xl p-6">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-xl font-bold text-zinc-100">
            Schedule Service
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            Vehicle: <span className="font-semibold text-primary">{vehicle?.vehicleNo}</span>
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="serviceDate" className="text-xs font-semibold text-zinc-300">
              Service Date *
            </Label>
            <Input 
              id="serviceDate" 
              type="date"
              required
              className="bg-zinc-900 border-zinc-800 text-zinc-100 focus:border-primary/50 rounded-lg text-sm"
              value={serviceDate} 
              onChange={(e) => setServiceDate(e.target.value)} 
              style={{ colorScheme: "dark" }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cost" className="text-xs font-semibold text-zinc-300">
              Estimated Cost (₹)
            </Label>
            <Input 
              id="cost" 
              type="number"
              placeholder="0.00"
              className="bg-zinc-900 border-zinc-800 text-zinc-100 focus:border-primary/50 rounded-lg text-sm"
              value={cost} 
              onChange={(e) => setCost(e.target.value)} 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-xs font-semibold text-zinc-300">
              Service Description / Notes *
            </Label>
            <Textarea 
              id="description" 
              required
              placeholder="e.g. Engine oil change, brake inspection"
              className="bg-zinc-900 border-zinc-800 text-zinc-100 focus:border-primary/50 rounded-lg text-sm min-h-[80px]"
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
            />
          </div>
          <DialogFooter className="pt-2">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => onOpenChange(false)}
              className="hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 shadow-md transition-all active:scale-95"
            >
              {loading ? "Scheduling..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
