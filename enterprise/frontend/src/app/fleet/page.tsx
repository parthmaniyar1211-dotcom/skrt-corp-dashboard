"use client";

import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Truck, AlertCircle, Fuel, Wrench, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

import api from "@/lib/api";
import { AddVehicleDialog } from "@/components/fleet/AddVehicleDialog";

export default function FleetPage() {
  const [vehicleList, setVehicleList] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/vehicles");
      if (data.success) {
        setVehicleList(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch vehicles", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchVehicles();
  }, []);

  const dummyVehicles = [
    { _id: "v1", vehicleNo: "MH-12-AB-1234", type: "Container", capacity: 18000, status: "on-trip", lastServiceDate: "2024-04-15" },
    { _id: "v2", vehicleNo: "MH-14-CD-5678", type: "Truck", capacity: 12000, status: "available", lastServiceDate: "2024-04-20" },
    { _id: "v3", vehicleNo: "MH-01-EF-9012", type: "Trailer", capacity: 25000, status: "maintenance", lastServiceDate: "2024-05-02" },
    { _id: "v4", vehicleNo: "GJ-05-GH-3456", type: "Truck", capacity: 16000, status: "on-trip", lastServiceDate: "2024-04-10" },
    { _id: "v5", vehicleNo: "RJ-14-IJ-7890", type: "Container", capacity: 20000, status: "available", lastServiceDate: "2024-03-28" },
  ];

  const currentVehicles = vehicleList.length > 0 ? vehicleList : dummyVehicles;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Fleet Management</h2>
            <p className="text-muted-foreground">Monitor vehicle health, service history, and availability.</p>
          </div>
          <AddVehicleDialog onVehicleAdded={fetchVehicles} />
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-border/50 bg-secondary/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Fleet</CardTitle>
              <Truck className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {currentVehicles.filter(v => v.status === 'available').length}/{currentVehicles.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {currentVehicles.length > 0 ? ((currentVehicles.filter(v => v.status === 'on-trip').length / currentVehicles.length) * 100).toFixed(0) : 0}% utilization rate
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-secondary/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {currentVehicles.filter(v => v.status === 'maintenance').length} Units
              </div>
              <p className="text-xs text-muted-foreground mt-1">Currently in service</p>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-secondary/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Capacity</CardTitle>
              <Truck className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {currentVehicles.length > 0 ? (currentVehicles.reduce((acc, v) => acc + (v.capacity || 0), 0) / currentVehicles.length / 1000).toFixed(1) : 0} Tons
              </div>
              <p className="text-xs text-muted-foreground mt-1">Fleet average per unit</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/50 bg-secondary/10">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead>Vehicle No</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Service</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && vehicleList.length === 0 ? (
                   <TableRow>
                     <TableCell colSpan={6} className="text-center py-10 text-muted-foreground animate-pulse">Loading fleet data...</TableCell>
                   </TableRow>
                ) : currentVehicles.map((v) => (
                  <TableRow key={v._id} className="border-border/50 hover:bg-white/5 transition-colors">
                    <TableCell className="font-bold text-primary">{v.vehicleNo}</TableCell>
                    <TableCell>{v.type}</TableCell>
                    <TableCell>{((v.capacity || 0) / 1000).toFixed(1)} Tons</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn(
                        "px-2 py-0.5 capitalize",
                        v.status === "available" ? "text-accent border-accent/20 bg-accent/10" :
                        v.status === "on-trip" ? "text-primary border-primary/20 bg-primary/10" :
                        "text-destructive border-destructive/20 bg-destructive/10"
                      )}>
                        {v.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {v.lastServiceDate ? new Date(v.lastServiceDate).toLocaleDateString() : "No record"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="hover:bg-primary/20 hover:text-primary">
                        <Wrench className="w-4 h-4 mr-2" /> Schedule Service
                      </Button>
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
