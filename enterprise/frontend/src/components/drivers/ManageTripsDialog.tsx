"use client";

import React, { useEffect, useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Truck, MapPin, Calendar, Clock, AlertCircle, ArrowRight } from "lucide-react";
import api from "@/lib/api";

interface ManageTripsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  driver: any;
}

export function ManageTripsDialog({ open, onOpenChange, driver }: ManageTripsDialogProps) {
  const [shipments, setShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && driver) {
      fetchTrips();
    }
  }, [open, driver]);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/shipments");
      if (data.success && data.data) {
        // Filter by driver's assigned vehicle number
        const driverVehicle = driver?.assignedVehicle?.vehicleNo || driver?.vehicleNo || "";
        const matched = data.data.filter((s: any) => 
          (driverVehicle && s.vehicleNumber === driverVehicle) || 
          s.driver?._id === driver?._id ||
          s.driver?.name === driver?.name
        );
        setShipments(matched);
      }
    } catch (e) {
      console.error("Failed to fetch trips", e);
    } finally {
      setLoading(false);
    }
  };

  // Use driver's pre-loaded trips array if API returns no matches
  const getDriverTrips = () => {
    if (driver?.trips && driver.trips.length > 0) {
      return driver.trips.map((t: any) => ({
        consignmentNumber: t.consignmentNumber || t.id,
        bookedAt: t.date ? new Date(t.date).toISOString() : new Date().toISOString(),
        toBranch: t.route?.split(' → ')[1] || t.route || 'N/A',
        status: t.status || 'Completed',
        description: t.cargoType || 'General Cargo',
        actualWeight: 5000 + Math.random() * 10000,
        vehicleNumber: t.vehicle || driver?.assignedVehicle?.vehicleNo || 'N/A',
        route: t.route
      }));
    }
    return [];
  };

  const displayTrips = shipments.length > 0 ? shipments : getDriverTrips();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-950 border border-zinc-800 text-zinc-100 w-full max-w-[540px] rounded-2xl shadow-2xl p-6 overflow-hidden">
        <DialogHeader className="pb-4 border-b border-zinc-800">
          <DialogTitle className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <Truck className="w-5 h-5 text-primary" /> Active & Past Trips
          </DialogTitle>
          <p className="text-xs text-zinc-400 mt-1">
            Assigned shipments for driver <span className="font-semibold text-primary">{driver?.name}</span>
          </p>
        </DialogHeader>

        <div className="py-4 max-h-[350px] overflow-y-auto space-y-4 pr-1 mt-4 scrollbar-thin">
          {loading ? (
            <div className="text-center py-10 text-zinc-400 animate-pulse text-sm">
              Fetching trips data...
            </div>
          ) : displayTrips.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-zinc-800 rounded-xl">
              <AlertCircle className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-zinc-400">No trips assigned to this driver</p>
              <p className="text-xs text-zinc-500 mt-1">Assign a shipment via the Shipments module</p>
            </div>
          ) : (
            displayTrips.map((trip: any, idx: number) => (
              <div 
                key={trip.consignmentNumber || trip.id || idx}
                className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4 hover:border-zinc-700/80 transition-all space-y-3"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-zinc-200 bg-zinc-900 px-2.5 py-1 border border-zinc-800 rounded-lg">
                      {trip.consignmentNumber || 'N/A'}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {trip.bookedAt ? new Date(trip.bookedAt).toLocaleDateString() : (trip.date || 'N/A')}
                    </span>
                  </div>
                  <Badge variant="outline" className={
                    trip.status === "Delivered" || trip.status === "Completed" ? "text-accent border-accent/20 bg-accent/10" :
                    trip.status === "In Transit" ? "text-primary border-primary/20 bg-primary/10" :
                    "text-yellow-500 border-yellow-500/20 bg-yellow-500/10"
                  }>
                    {trip.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-zinc-500 block">Route</span>
                    <span className="text-zinc-300 font-medium flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-zinc-400" /> {trip.route || trip.toBranch || (trip.consignee?.city ? `→ ${trip.consignee.city}` : 'N/A')}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Cargo / Weight</span>
                    <span className="text-zinc-300 font-medium block truncate mt-0.5">
                      {trip.description || trip.cargoType || 'General'} ({((trip.actualWeight || 5000) / 1000).toFixed(1)} Tons)
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-800/50 text-[11px] text-zinc-500">
                  <div className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Vehicle: <span className="text-zinc-300 font-semibold">{trip.vehicleNumber || trip.vehicle || 'N/A'}</span></span>
                  </div>
                  <span className="text-zinc-400 flex items-center gap-0.5">
                    {trip.consignmentNumber || 'N/A'} <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        <DialogFooter className="border-t border-zinc-800 pt-4 mt-2">
          <Button 
            type="button" 
            onClick={() => onOpenChange(false)}
            className="w-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 hover:text-zinc-100"
          >
            Close Dialog
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
