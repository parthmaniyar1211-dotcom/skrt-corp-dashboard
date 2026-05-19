"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { cn } from "@/lib/utils";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Plus, 
  Filter, 
  MoreVertical,
  Download,
  Eye
} from "lucide-react";

const shipments = [
  { id: "SKRT001001", sender: "Aditya Textiles", receiver: "Rajasthan Fabrics", origin: "Bhilwara", dest: "Ahmedabad", status: "In Transit", date: "2024-05-10" },
  { id: "SKRT001002", sender: "Global Logistics", receiver: "Metro Mart", origin: "Mumbai", dest: "Delhi", status: "Delivered", date: "2024-05-09" },
  { id: "SKRT001003", sender: "Kishore Spinners", receiver: "Cotton World", origin: "Bhilwara", dest: "Surat", status: "Booked", date: "2024-05-12" },
  { id: "SKRT001004", sender: "Prime Garments", receiver: "Fashion Hub", origin: "Jaipur", dest: "Bangalore", status: "In Transit", date: "2024-05-11" },
  { id: "SKRT001005", sender: "Royal Weavers", receiver: "Elite Stores", origin: "Bhilwara", dest: "Indore", status: "Inventory", date: "2024-05-12" },
];

const statusColors: Record<string, string> = {
  "In Transit": "bg-primary/20 text-primary border-primary/30",
  "Delivered": "bg-accent/20 text-accent border-accent/30",
  "Booked": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "Inventory": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
};

import { CreateShipmentDialog } from "@/components/shipments/CreateShipmentDialog";
import api from "@/lib/api";

export default function ShipmentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [shipmentList, setShipmentList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/shipments");
      if (data.success) {
        setShipmentList(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch shipments", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchShipments();
  }, []);

  const filteredShipments = shipmentList.filter(s => {
    const idMatch = s.shipmentId?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const senderMatch = s.sender?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || s.sender?.toLowerCase()?.includes(searchTerm.toLowerCase()) || false;
    const destMatch = s.destination?.toLowerCase().includes(searchTerm.toLowerCase()) || s.dest?.toLowerCase()?.includes(searchTerm.toLowerCase()) || false;
    return idMatch || senderMatch || destMatch;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Shipments</h2>
            <p className="text-muted-foreground">Manage and track all consignments in real-time.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" /> Export
            </Button>
            <CreateShipmentDialog onShipmentCreated={fetchShipments} />
          </div>
        </div>

        <Card className="border-border/50 bg-secondary/20 backdrop-blur-sm">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by ID, Sender or Destination..." 
                  className="pl-10 bg-background/50 border-border/50"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="ghost" size="sm">
                <Filter className="h-4 w-4 mr-2" /> Filters
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border/50">
                  <TableHead className="w-[120px]">ID</TableHead>
                  <TableHead>Sender</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(shipmentList.length > 0 ? filteredShipments : shipments).map((shipment: any) => (
                  <TableRow key={shipment.id || shipment._id} className="border-border/50 hover:bg-white/5 transition-colors">
                    <TableCell className="font-medium text-primary">{shipment.shipmentId || shipment.id}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{shipment.sender?.name || shipment.sender}</span>
                        <span className="text-xs text-muted-foreground">{shipment.origin}</span>
                      </div>
                    </TableCell>
                    <TableCell>{shipment.destination || shipment.dest}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("px-2 py-0.5", statusColors[shipment.status])}>
                        {shipment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{shipment.date || new Date(shipment.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/20">
                          <Eye className="h-4 w-4 text-primary" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
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
