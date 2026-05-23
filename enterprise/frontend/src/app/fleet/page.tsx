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
import { Input } from "@/components/ui/input";
import { Truck, AlertCircle, Wrench, Download, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

import api from "@/lib/api";
import { AddVehicleDialog } from "@/components/fleet/AddVehicleDialog";
import { ScheduleServiceDialog } from "@/components/fleet/ScheduleServiceDialog";
import { vehicles as mockVehicles } from "@/lib/mockData";

export default function FleetPage() {
  const [vehicleList, setVehicleList] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedVehicle, setSelectedVehicle] = React.useState<any>(null);
  const [serviceDialogOpen, setServiceDialogOpen] = React.useState(false);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/vehicles");
      if (data.success && data.data && data.data.length >= 3) {
        setVehicleList(data.data);
      } else {
        setVehicleList(mockVehicles);
      }
    } catch (error) {
      console.error("Failed to fetch vehicles", error);
      setVehicleList(mockVehicles);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchVehicles();
  }, []);

  const filteredVehicles = vehicleList.filter(v =>
    v.vehicleNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExport = () => {
    const headers = ["Vehicle No", "Type", "Model", "Capacity (kg)", "Status", "Last Service Date", "Insurance Expiry"];
    const csvRows = [headers.join(",")];
    filteredVehicles.forEach(v => {
      csvRows.push([
        v.vehicleNo || '',
        v.type || '',
        v.model || '',
        v.capacity || 0,
        v.status || '',
        v.lastServiceDate ? new Date(v.lastServiceDate).toLocaleDateString() : 'N/A',
        v.insuranceExpiry ? new Date(v.insuranceExpiry).toLocaleDateString() : 'N/A'
      ].join(","));
    });
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `fleet_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Fleet data exported successfully");
  };

  const availableCount = vehicleList.filter(v => v.status === 'available').length;
  const maintenanceCount = vehicleList.filter(v => v.status === 'maintenance').length;
  const onTripCount = vehicleList.filter(v => v.status === 'on-trip').length;
  const avgCapacity = vehicleList.length > 0
    ? (vehicleList.reduce((acc, v) => acc + (v.capacity || 0), 0) / vehicleList.length / 1000).toFixed(1)
    : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Fleet Management</h2>
            <p className="text-muted-foreground">Monitor vehicle health, service history, and availability.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExport} className="border-border/50 hover:bg-secondary">
              <Download className="w-4 h-4 mr-2" /> Export
            </Button>
            <AddVehicleDialog onVehicleAdded={fetchVehicles} />
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          <Card className="border-border/50 bg-secondary/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Fleet</CardTitle>
              <Truck className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{availableCount}/{vehicleList.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {vehicleList.length > 0 ? ((onTripCount / vehicleList.length) * 100).toFixed(0) : 0}% utilization rate
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-secondary/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">On Trip</CardTitle>
              <Truck className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{onTripCount} Units</div>
              <p className="text-xs text-muted-foreground mt-1">Currently active</p>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-secondary/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{maintenanceCount} Units</div>
              <p className="text-xs text-muted-foreground mt-1">Currently in service</p>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-secondary/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Capacity</CardTitle>
              <Truck className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgCapacity} Tons</div>
              <p className="text-xs text-muted-foreground mt-1">Fleet average per unit</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/50 bg-secondary/10">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by vehicle no, type, model..."
                  className="pl-10 bg-background/50 border-border/50"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead>Vehicle No</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Insurance Expiry</TableHead>
                  <TableHead>Last Service</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <TableRow key={i} className="border-border/50">
                      {Array(8).fill(0).map((_, j) => (
                        <TableCell key={j}>
                          <div className="h-4 bg-secondary/20 animate-pulse rounded" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filteredVehicles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                      No vehicles found.
                    </TableCell>
                  </TableRow>
                ) : filteredVehicles.map((v) => (
                  <TableRow key={v._id} className="border-border/50 hover:bg-white/5 transition-colors">
                    <TableCell className="font-bold text-primary font-mono">{v.vehicleNo}</TableCell>
                    <TableCell>{v.type}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{v.model || 'N/A'}</TableCell>
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
                    <TableCell className="text-muted-foreground text-sm">
                      {v.insuranceExpiry ? new Date(v.insuranceExpiry).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {v.lastServiceDate ? new Date(v.lastServiceDate).toLocaleDateString() : "No record"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="hover:bg-primary/20 hover:text-primary"
                        onClick={() => {
                          setSelectedVehicle(v);
                          setServiceDialogOpen(true);
                        }}
                      >
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

      <ScheduleServiceDialog 
        open={serviceDialogOpen} 
        onOpenChange={setServiceDialogOpen} 
        vehicle={selectedVehicle} 
        onServiceScheduled={fetchVehicles} 
      />
    </DashboardLayout>
  );
}
