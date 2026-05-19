"use client";

import React from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function ViewInventoryDialog({ 
  open, 
  onOpenChange, 
  item 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
  item: any; 
}) {
  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto overflow-x-hidden w-full max-w-4xl bg-background border-border shadow-2xl rounded-2xl backdrop-blur-sm box-border">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-2xl font-bold">Inventory Record Details</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Complete details for record #{item.inventoryId}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 text-sm w-full box-border">
          <div className="p-3 bg-secondary/20 rounded-lg space-y-1">
            <span className="text-xs text-muted-foreground font-semibold">Inventory ID</span>
            <p className="font-mono font-medium text-base">{item.inventoryId}</p>
          </div>
          <div className="p-3 bg-secondary/20 rounded-lg space-y-1">
            <span className="text-xs text-muted-foreground font-semibold">LR No / Consignment No</span>
            <p className="font-mono font-medium text-base">{item.lrNo}</p>
          </div>

          <div className="p-3 bg-secondary/20 rounded-lg space-y-1 md:col-span-2">
            <span className="text-xs text-muted-foreground font-semibold">Cargo / Item Name</span>
            <p className="font-medium text-base">{item.cargoName}</p>
          </div>

          <div className="p-3 bg-secondary/20 rounded-lg space-y-1">
            <span className="text-xs text-muted-foreground font-semibold">Sender</span>
            <p className="font-medium">{item.senderName}</p>
            <p className="text-xs text-muted-foreground">{item.senderPhone}</p>
          </div>
          <div className="p-3 bg-secondary/20 rounded-lg space-y-1">
            <span className="text-xs text-muted-foreground font-semibold">Receiver</span>
            <p className="font-medium">{item.receiverName}</p>
            <p className="text-xs text-muted-foreground">{item.receiverPhone}</p>
          </div>

          <div className="p-3 bg-secondary/20 rounded-lg space-y-1">
            <span className="text-xs text-muted-foreground font-semibold">Origin</span>
            <p className="font-medium">{item.origin}</p>
          </div>
          <div className="p-3 bg-secondary/20 rounded-lg space-y-1">
            <span className="text-xs text-muted-foreground font-semibold">Destination</span>
            <p className="font-medium">{item.destination}</p>
          </div>

          <div className="p-3 bg-secondary/20 rounded-lg space-y-1">
            <span className="text-xs text-muted-foreground font-semibold">Packages</span>
            <p className="font-medium">{item.packages} unit(s)</p>
          </div>
          <div className="p-3 bg-secondary/20 rounded-lg space-y-1">
            <span className="text-xs text-muted-foreground font-semibold">Weight</span>
            <p className="font-medium">{item.weight} kg</p>
          </div>

          <div className="p-3 bg-secondary/20 rounded-lg space-y-1">
            <span className="text-xs text-muted-foreground font-semibold">Rate & Total Freight</span>
            <p className="font-medium">₹{item.rate}/kg → <span className="text-primary font-bold">₹{item.totalFreight?.toLocaleString()}</span></p>
          </div>
          <div className="p-3 bg-secondary/20 rounded-lg space-y-1">
            <span className="text-xs text-muted-foreground font-semibold">Payment Mode</span>
            <p className="font-medium">{item.paymentMode}</p>
          </div>

          <div className="p-3 bg-secondary/20 rounded-lg space-y-1 md:col-span-2">
            <span className="text-xs text-muted-foreground font-semibold">Warehouse Location</span>
            <p className="font-medium">{item.warehouseLocation || "N/A"}</p>
          </div>

          <div className="p-3 bg-secondary/20 rounded-lg space-y-1">
            <span className="text-xs text-muted-foreground font-semibold">Incoming Status</span>
            <p className="font-medium">{item.incomingStatus || "N/A"}</p>
          </div>
          <div className="p-3 bg-secondary/20 rounded-lg space-y-1">
            <span className="text-xs text-muted-foreground font-semibold">Outgoing Status</span>
            <p className="font-medium">{item.outgoingStatus || "N/A"}</p>
          </div>

          <div className="p-3 bg-secondary/20 rounded-lg space-y-1">
            <span className="text-xs text-muted-foreground font-semibold">Main Status</span>
            <p className="font-medium">{item.status}</p>
          </div>
          <div className="p-3 bg-secondary/20 rounded-lg space-y-1">
            <span className="text-xs text-muted-foreground font-semibold">Challan Status</span>
            <p className="font-medium">{item.challanStatus}</p>
          </div>

          {item.remarks && (
            <div className="p-3 bg-secondary/20 rounded-lg space-y-1 md:col-span-2">
              <span className="text-xs text-muted-foreground font-semibold">Remarks</span>
              <p className="text-sm italic">{item.remarks}</p>
            </div>
          )}

          <div className="p-3 bg-secondary/20 rounded-lg space-y-1 md:col-span-2">
            <span className="text-xs text-muted-foreground font-semibold">Created Date</span>
            <p className="text-xs">{new Date(item.createdAt).toLocaleString()}</p>
          </div>
        </div>

        <DialogFooter className="flex justify-end pt-6 border-t border-border">
          <Button onClick={() => onOpenChange(false)} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
