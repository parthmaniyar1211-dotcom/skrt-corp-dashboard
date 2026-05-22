"use client";

import React, { useState } from "react";
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
import { Plus } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

export function AddClientDialog({ onClientAdded }: { onClientAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    gstin: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/clients", formData);
      toast.success("Client added successfully!");
      setOpen(false);
      onClientAdded();
      setFormData({ name: "", contactPerson: "", email: "", phone: "", address: "", gstin: "" });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add client");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-4 shadow-md transition-all active:scale-95">
          <Plus className="w-4 h-4 mr-2" /> Add Client
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-950 border border-zinc-800 text-zinc-100 max-h-[90vh] overflow-y-auto overflow-x-hidden w-full max-w-[500px] rounded-2xl shadow-2xl p-6 box-border">
        <DialogHeader className="pb-2 border-b border-zinc-900">
          <DialogTitle className="text-xl font-bold text-zinc-100">Add New Client</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4 w-full box-border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full box-border">
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="name" className="text-xs font-semibold text-zinc-300">Company Name *</Label>
              <Input 
                id="name" 
                required
                className="bg-zinc-900 border-zinc-800 text-zinc-100 focus:border-primary/50 focus:ring-primary/50 rounded-lg text-sm"
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contact" className="text-xs font-semibold text-zinc-300">Contact Person</Label>
              <Input 
                id="contact" 
                className="bg-zinc-900 border-zinc-800 text-zinc-100 focus:border-primary/50 focus:ring-primary/50 rounded-lg text-sm"
                value={formData.contactPerson} 
                onChange={(e) => setFormData({...formData, contactPerson: e.target.value})} 
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="gstin" className="text-xs font-semibold text-zinc-300">GSTIN</Label>
              <Input 
                id="gstin" 
                className="bg-zinc-900 border-zinc-800 text-zinc-100 focus:border-primary/50 focus:ring-primary/50 rounded-lg text-sm"
                value={formData.gstin} 
                onChange={(e) => setFormData({...formData, gstin: e.target.value})} 
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs font-semibold text-zinc-300">Phone *</Label>
              <Input 
                id="phone" 
                required
                className="bg-zinc-900 border-zinc-800 text-zinc-100 focus:border-primary/50 focus:ring-primary/50 rounded-lg text-sm"
                value={formData.phone} 
                onChange={(e) => setFormData({...formData, phone: e.target.value})} 
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold text-zinc-300">Email</Label>
              <Input 
                id="email" 
                type="email"
                className="bg-zinc-900 border-zinc-800 text-zinc-100 focus:border-primary/50 focus:ring-primary/50 rounded-lg text-sm"
                value={formData.email} 
                onChange={(e) => setFormData({...formData, email: e.target.value})} 
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="address" className="text-xs font-semibold text-zinc-300">Address</Label>
              <Input 
                id="address" 
                className="bg-zinc-900 border-zinc-800 text-zinc-100 focus:border-primary/50 focus:ring-primary/50 rounded-lg text-sm"
                value={formData.address} 
                onChange={(e) => setFormData({...formData, address: e.target.value})} 
              />
            </div>
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
              {loading ? "Adding..." : "Add Client"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
