"use client";

import React from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, Award, MapPin, Star, Shield, Calendar, Truck } from "lucide-react";

interface ViewProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  driver: any;
}

export function ViewProfileDialog({ open, onOpenChange, driver }: ViewProfileDialogProps) {
  if (!driver) return null;

  // Derive driver details
  const rating = driver.rating || 4.8;
  const experience = driver.experience || "5+ Years";
  const location = driver.location || "Active Route";
  const status = driver.status || "Available";
  const vehicleNo = driver.vehicleNo || "MH-12-TC-9988";
  const licenseNo = driver.licenseNo || `DL-${driver.phone?.slice(-4) || "8877"}/MUM/2019`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-950 border border-zinc-800 text-zinc-100 w-full max-w-[480px] rounded-2xl shadow-2xl p-6 overflow-hidden">
        <DialogHeader className="relative pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-2xl border border-primary/30">
              {driver.name ? driver.name.charAt(0) : "D"}
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-zinc-100 flex items-center gap-2">
                {driver.name}
              </DialogTitle>
              <p className="text-xs text-zinc-400 mt-0.5">Driver ID: {driver.id || driver._id?.slice(-8).toUpperCase()}</p>
              <div className="mt-1.5 flex gap-2">
                <Badge variant="outline" className={
                  status === "Available" ? "text-accent border-accent/20 bg-accent/10" :
                  status === "On Duty" ? "text-primary border-primary/20 bg-primary/10" :
                  "text-muted-foreground bg-secondary"
                }>
                  {status}
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="py-6 space-y-5">
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl p-3 text-center">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 mx-auto mb-1" />
              <span className="text-xs text-zinc-400 block">Rating</span>
              <span className="text-sm font-semibold text-zinc-200">{rating} / 5.0</span>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl p-3 text-center">
              <Award className="w-4 h-4 text-primary mx-auto mb-1" />
              <span className="text-xs text-zinc-400 block">Experience</span>
              <span className="text-sm font-semibold text-zinc-200">{experience}</span>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl p-3 text-center">
              <Truck className="w-4 h-4 text-accent mx-auto mb-1" />
              <span className="text-xs text-zinc-400 block">Vehicle</span>
              <span className="text-sm font-semibold text-zinc-200 truncate block">{vehicleNo}</span>
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-3 bg-zinc-900/30 border border-zinc-800/60 rounded-xl p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">Contact & Credentials</h4>
            
            <div className="flex items-center gap-3 text-sm">
              <Phone className="w-4 h-4 text-zinc-500" />
              <span className="text-zinc-300">{driver.phone || "Not provided"}</span>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-zinc-500" />
              <span className="text-zinc-300 truncate">{driver.email || "Not provided"}</span>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <Shield className="w-4 h-4 text-zinc-500" />
              <div className="text-zinc-300 flex items-center gap-1.5">
                License: <span className="font-mono text-xs bg-zinc-900 px-2 py-0.5 border border-zinc-800 rounded">{licenseNo}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <MapPin className="w-4 h-4 text-zinc-500" />
              <span className="text-zinc-300">{location}</span>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-4 h-4 text-zinc-500" />
              <span className="text-zinc-300">Member since {new Date(driver.createdAt || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</span>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-zinc-800 pt-4">
          <Button 
            type="button" 
            onClick={() => onOpenChange(false)}
            className="w-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 hover:text-zinc-100"
          >
            Close Profile
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
