"use client";

import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { 
  MapPin, 
  Truck, 
  Navigation, 
  Search, 
  Filter,
  RefreshCw,
  Clock,
  ExternalLink,
  User,
  Phone,
  Package,
  Box,
  Scale,
  IndianRupee,
  FileText,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  Dot,
  Download,
  AlertCircle,
  Wifi,
  WifiOff,
  PauseCircle,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import api from "@/lib/api";
import DashboardLayout from "@/components/layout/DashboardLayout";

// Premium dark map SVG component with animated pulsing route
const RouteMapPreview = ({ origin, destination, isDelivered }: { origin: string, destination: string, isDelivered: boolean }) => {
  return (
    <div className="relative w-full h-full min-h-[220px] bg-[#0b1329]/90 rounded-2xl overflow-hidden border border-border/50 shadow-inner flex items-center justify-center p-4">
      {/* Decorative Dark Map Grid & Contours */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#3b82f6" strokeWidth="1" opacity="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          <path d="M -50 150 Q 100 50 300 180 T 700 120" fill="none" stroke="#2563eb" strokeWidth="2" opacity="0.2" />
          <path d="M -50 80 Q 200 200 450 100 T 800 200" fill="none" stroke="#3b82f6" strokeWidth="1" opacity="0.15" />
        </svg>
      </div>

      {/* Map Content */}
      <div className="relative w-full max-w-md h-36 flex items-center justify-between px-8">
        {/* Origin Pin */}
        <div className="flex flex-col items-center relative z-10">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-2 animate-pulse">
            <MapPin className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="text-xs font-semibold bg-background/80 px-2 py-1 rounded border border-border/60 shadow text-emerald-400 whitespace-nowrap">
            {origin || "Pune Warehouse"}
          </span>
        </div>

        {/* Connecting Route Line */}
        <div className="flex-1 relative mx-4 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <svg width="100%" height="40" className="overflow-visible">
              <path 
                d="M 0 20 Q 50% -20 100% 20" 
                fill="none" 
                stroke="#3b82f6" 
                strokeWidth="3" 
                strokeDasharray="6 6" 
                className={isDelivered ? "" : "animate-[dash_3s_linear_infinite]"} 
              />
              <style jsx>{`
                @keyframes dash {
                  to {
                    stroke-dashoffset: -24;
                  }
                }
              `}</style>
            </svg>
          </div>
          {/* Animated Moving Truck on line */}
          {!isDelivered && (
            <motion.div 
              initial={{ x: "-80%" }}
              animate={{ x: "80%" }}
              transition={{ duration: 6, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
              className="relative z-20 w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/50 text-primary-foreground border-2 border-background"
            >
              <Truck className="w-4 h-4" />
            </motion.div>
          )}
        </div>

        {/* Destination Pin */}
        <div className="flex flex-col items-center relative z-10">
          <div className="w-10 h-10 rounded-full bg-rose-500/20 border border-rose-500 flex items-center justify-center shadow-lg shadow-rose-500/30 mb-2">
            <MapPin className="w-5 h-5 text-rose-400" />
          </div>
          <span className="text-xs font-semibold bg-background/80 px-2 py-1 rounded border border-border/60 shadow text-rose-400 whitespace-nowrap">
            {destination || "Mumbai Branch"}
          </span>
        </div>
      </div>

      {/* Mapbox attribution watermark styling */}
      <div className="absolute bottom-2 right-3 text-[10px] text-muted-foreground/60 flex items-center gap-2 pointer-events-none">
        <span>© Mapbox</span>
        <span>© OpenStreetMap</span>
        <span>Improve this map</span>
      </div>
    </div>
  );
};

export default function TrackingPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchLocations();
    
    const socketUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
    const socket = io(socketUrl);
    
    socket.on('location_updated', (data) => {
      setVehicles(prev => prev.map(v => 
        (v._id === data.vehicleId || v.vehicleNo === data.vehicleId)
          ? { ...v, currentLocation: { lat: data.lat, lng: data.lng, address: data.address }, lastUpdate: new Date() } 
          : v
      ));
      
      if (selectedVehicle?._id === data.vehicleId || selectedVehicle?.vehicleNo === data.vehicleId) {
        setSelectedVehicle((prev: any) => ({
          ...prev,
          currentLocation: { lat: data.lat, lng: data.lng, address: data.address },
          lastUpdate: new Date()
        }));
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tracking');
      if (res.data?.data) {
        setVehicles(res.data.data);
        if (res.data.data.length > 0) {
          setSelectedVehicle(res.data.data[0]);
        }
      }
    } catch (error) {
      console.error("Failed to fetch locations", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'in-transit':
      case 'in transit':
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20 px-2.5 py-1">In Transit</Badge>;
      case 'active':
        return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20 px-2.5 py-1">Active</Badge>;
      case 'delivered':
        return <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20 hover:bg-purple-500/20 px-2.5 py-1">Delivered</Badge>;
      case 'idle':
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20 px-2.5 py-1">Idle</Badge>;
      case 'offline':
      default:
        return <Badge className="bg-slate-500/10 text-slate-500 border-slate-500/20 hover:bg-slate-500/20 px-2.5 py-1">Offline</Badge>;
    }
  };

  const filteredVehicles = vehicles.filter(v => {
    const matchSearch = v.vehicleNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        v.driverName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        v.shipment?.lrNo?.toLowerCase().includes(searchTerm.toLowerCase());
    if (statusFilter === "All") return matchSearch;
    return matchSearch && v.status?.toLowerCase() === statusFilter.toLowerCase();
  });

  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);
  const paginatedVehicles = filteredVehicles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const stats = {
    total: vehicles.length,
    active: vehicles.filter(v => v.status === 'active' || v.status === 'in-transit').length,
    idle: vehicles.filter(v => v.status === 'idle').length,
    offline: vehicles.filter(v => v.status === 'offline').length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 p-1">
        {/* Top Header & Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Live Fleet Tracking
            </h1>
            <p className="text-muted-foreground text-sm">
              Monitor your logistics operations in real-time across the globe.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={fetchLocations} className="border-border/60 hover:bg-secondary">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Stats Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-5 bg-card/60 backdrop-blur-md border-border/60 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Total Vehicles</p>
              <h3 className="text-3xl font-bold">{stats.total}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shadow-inner">
              <Truck className="w-6 h-6" />
            </div>
          </Card>

          <Card className="p-5 bg-card/60 backdrop-blur-md border-border/60 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Active Vehicles</p>
              <h3 className="text-3xl font-bold">{stats.active}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-inner">
              <Navigation className="w-6 h-6" />
            </div>
          </Card>

          <Card className="p-5 bg-card/60 backdrop-blur-md border-border/60 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Idle Vehicles</p>
              <h3 className="text-3xl font-bold">{stats.idle}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-inner">
              <PauseCircle className="w-6 h-6" />
            </div>
          </Card>

          <Card className="p-5 bg-card/60 backdrop-blur-md border-border/60 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Offline Vehicles</p>
              <h3 className="text-3xl font-bold">{stats.offline}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-slate-500/10 border border-slate-500/20 flex items-center justify-center text-slate-500 shadow-inner">
              <WifiOff className="w-6 h-6" />
            </div>
          </Card>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT PANEL: Vehicle List & Search */}
          <Card className="lg:col-span-4 p-5 flex flex-col gap-5 bg-card/60 backdrop-blur-md border-border/60 min-h-[750px] shadow-lg">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by vehicle number..." 
                  className="pl-9 bg-background/50 border-border/60 text-sm focus-visible:ring-primary/30"
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="border-border/60 bg-background/50 shrink-0">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44 bg-card/95 backdrop-blur-md border-border/60">
                  {["All", "In-Transit", "Active", "Delivered", "Idle", "Offline"].map(status => (
                    <DropdownMenuItem 
                      key={status} 
                      onClick={() => { setStatusFilter(status); setCurrentPage(1); }}
                      className={`cursor-pointer ${statusFilter.toLowerCase() === status.toLowerCase() ? "bg-primary/20 text-primary font-semibold" : ""}`}
                    >
                      {status}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto pr-1">
              {loading ? (
                [1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-28 rounded-xl bg-secondary/30 animate-pulse border border-border/30" />
                ))
              ) : paginatedVehicles.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground flex flex-col items-center gap-3">
                  <AlertCircle className="w-10 h-10 opacity-30" />
                  <p className="text-sm">No vehicles found matching criteria</p>
                </div>
              ) : (
                paginatedVehicles.map((v) => {
                  const isSelected = selectedVehicle?._id === v._id || selectedVehicle?.vehicleNo === v.vehicleNo;
                  return (
                    <motion.div
                      key={v._id || v.vehicleNo}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setSelectedVehicle(v)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        isSelected 
                          ? "bg-primary/10 border-primary shadow-md shadow-primary/10" 
                          : "bg-secondary/20 border-border/40 hover:border-border/80 hover:bg-secondary/40"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2.5">
                        <div className="font-bold text-base tracking-wide flex items-center gap-2">
                          <Truck className={`w-4 h-4 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                          {v.vehicleNo}
                        </div>
                        {getStatusBadge(v.status)}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-3 bg-background/30 p-2 rounded-lg border border-border/30">
                        <div className="flex items-center gap-1.5 overflow-hidden">
                          <User className="w-3.5 h-3.5 text-primary/70 shrink-0" />
                          <span className="truncate">{v.driverName}</span>
                        </div>
                        <div className="flex items-center gap-1.5 overflow-hidden">
                          <Phone className="w-3.5 h-3.5 text-primary/70 shrink-0" />
                          <span className="truncate">{v.driverPhone}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-xs text-muted-foreground pt-1 border-t border-border/30">
                        <div className="flex items-center gap-1.5 overflow-hidden max-w-[65%]">
                          <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          <span className="truncate font-medium text-foreground/80">
                            {v.currentLocation?.address || "On Expressway"}
                          </span>
                        </div>
                        <span className="text-[10px] text-muted-foreground/80 shrink-0">
                          {v.status === 'delivered' ? '2 hrs ago' : '10 min ago'}
                        </span>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Pagination Controls */}
            {!loading && filteredVehicles.length > 0 && (
              <div className="flex items-center justify-between pt-4 border-t border-border/60 text-xs text-muted-foreground mt-auto">
                <span>
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredVehicles.length)} of {filteredVehicles.length} vehicles
                </span>
                <div className="flex items-center gap-1">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="w-7 h-7 bg-background/50 border-border/60"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </Button>
                  <span className="px-2 font-semibold text-foreground">{currentPage}</span>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="w-7 h-7 bg-background/50 border-border/60"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {/* RIGHT PANEL: Flipkart-Style Live Tracking View */}
          <div className="lg:col-span-8 space-y-6">
            {selectedVehicle ? (
              <>
                {/* Header Information Card */}
                <Card className="p-6 bg-card/60 backdrop-blur-md border-border/60 shadow-lg">
                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-center">
                    <div className="xl:col-span-7 space-y-5">
                      <div className="flex items-center gap-4 border-b border-border/40 pb-4">
                        <div className="w-14 h-14 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary shadow-inner shrink-0">
                          <Truck className="w-7 h-7" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h2 className="text-2xl font-bold tracking-tight">{selectedVehicle.vehicleNo}</h2>
                            {getStatusBadge(selectedVehicle.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {selectedVehicle.driverName} • {selectedVehicle.driverPhone}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-1">
                        <div>
                          <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider mb-1">Shipment / LR No</p>
                          <p className="text-sm font-bold text-foreground">{selectedVehicle.shipment?.lrNo || "LR1234567890"}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider mb-1">From</p>
                          <p className="text-sm font-semibold text-foreground">{selectedVehicle.shipment?.origin || "Pune Warehouse"}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider mb-1">To</p>
                          <p className="text-sm font-semibold text-foreground">{selectedVehicle.shipment?.destination || "Mumbai Branch"}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider mb-1">Vehicle Type</p>
                          <p className="text-sm font-semibold text-foreground">{selectedVehicle.type || "Container Truck"}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider mb-1">Distance to Destination</p>
                          <p className="text-sm font-semibold text-foreground">{selectedVehicle.status === 'delivered' ? '0 km' : (selectedVehicle.distance || "120 km")}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider mb-1">Last Updated</p>
                          <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                            <Clock className="w-3.5 h-3.5 text-primary" />
                            <span>{selectedVehicle.status === 'delivered' ? '2 hrs ago' : '10 min ago'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Premium Dark Map Preview */}
                    <div className="xl:col-span-5 h-full min-h-[220px] flex flex-col justify-center">
                      <RouteMapPreview 
                        origin={selectedVehicle.shipment?.origin} 
                        destination={selectedVehicle.shipment?.destination} 
                        isDelivered={selectedVehicle.status === 'delivered'} 
                      />
                    </div>
                  </div>
                </Card>

                {/* Flipkart-Style Tracking Timeline Card */}
                <Card className="p-6 bg-card/60 backdrop-blur-md border-border/60 shadow-lg">
                  <div className="flex justify-between items-center border-b border-border/40 pb-4 mb-6">
                    <div>
                      <h3 className="text-xl font-bold tracking-tight">Tracking Timeline</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">Live logistic checkpoints and route progression</p>
                    </div>
                    <span className="text-sm font-semibold text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-lg shadow-sm">
                      {selectedVehicle.status === 'delivered' ? 'Delivered Successfully' : 'Expected Delivery: Today, 08:00 PM'}
                    </span>
                  </div>

                  <div className="relative pl-6 py-2 space-y-8 max-w-3xl mx-auto">
                    {/* Connecting Vertical Track Line */}
                    <div className="absolute left-[33px] top-5 bottom-6 w-0.5 bg-border/80" />

                    {(selectedVehicle.trackingHistory || []).map((step: any, index: number) => {
                      const isCompleted = step.status === "completed" || selectedVehicle.status === "delivered";
                      const isActive = step.status === "active" && selectedVehicle.status !== "delivered";
                      const isPending = !isCompleted && !isActive;

                      return (
                        <div key={index} className="relative flex items-start gap-6 group">
                          {/* Step Marker Symbol */}
                          <div className="relative z-10 flex items-center justify-center -ml-[18px] mt-0.5">
                            {isCompleted ? (
                              <div className="w-7 h-7 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 shadow-md shadow-emerald-500/20">
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </div>
                            ) : isActive ? (
                              <div className="w-7 h-7 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center shadow-lg shadow-primary/40 animate-pulse">
                                <div className="w-2.5 h-2.5 rounded-full bg-primary animate-ping absolute" />
                                <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                              </div>
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-background border-2 border-muted-foreground/40 flex items-center justify-center" />
                            )}
                          </div>

                          {/* Step Content */}
                          <div className="flex-1 bg-secondary/15 hover:bg-secondary/30 p-4 rounded-xl border border-border/40 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <div>
                              <h4 className={`text-base font-bold tracking-wide ${isCompleted ? "text-foreground" : isActive ? "text-primary font-extrabold" : "text-muted-foreground"}`}>
                                {step.title}
                              </h4>
                              <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                                <MapPin className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
                                {step.location}
                              </p>
                            </div>
                            
                            <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                              {isCompleted ? (
                                <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-2.5 py-0.5 font-semibold text-[10px]">Completed</Badge>
                              ) : isActive ? (
                                <Badge className="bg-primary/20 text-primary border-primary/30 px-2.5 py-0.5 font-bold text-[10px] animate-pulse">In Progress</Badge>
                              ) : (
                                <Badge className="bg-secondary/60 text-muted-foreground border-border/60 px-2.5 py-0.5 font-medium text-[10px]">Pending</Badge>
                              )}
                              <span className="text-xs text-muted-foreground/80 font-medium">
                                {isCompleted ? step.time || "04 Sep 2025 - 10:15 AM" : isActive ? "Updated live" : "-"}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>

                {/* Bottom Bar Card / Summary Information */}
                <Card className="p-5 bg-card/60 backdrop-blur-md border-border/60 shadow-lg">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-border/60 text-center">
                    <div className="p-2">
                      <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">
                        <Box className="w-4 h-4 text-primary" />
                        <span>Cargo Type</span>
                      </div>
                      <p className="text-base font-bold text-foreground">{selectedVehicle.shipment?.cargoType || "Electronics"}</p>
                    </div>

                    <div className="p-2">
                      <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">
                        <Package className="w-4 h-4 text-emerald-400" />
                        <span>Packages</span>
                      </div>
                      <p className="text-base font-bold text-foreground">{selectedVehicle.shipment?.packages || "24"} Units</p>
                    </div>

                    <div className="p-2">
                      <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">
                        <Scale className="w-4 h-4 text-blue-400" />
                        <span>Weight</span>
                      </div>
                      <p className="text-base font-bold text-foreground">{selectedVehicle.shipment?.weight || "3,450 kg"}</p>
                    </div>

                    <div className="p-2">
                      <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">
                        <IndianRupee className="w-4 h-4 text-amber-400" />
                        <span>Value</span>
                      </div>
                      <p className="text-base font-bold text-foreground">{selectedVehicle.shipment?.value || "₹2,45,000"}</p>
                    </div>

                    <div className="p-2 col-span-2 sm:col-span-1">
                      <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">
                        <FileText className="w-4 h-4 text-purple-400" />
                        <span>Challan No</span>
                      </div>
                      <p className="text-base font-bold text-foreground truncate">{selectedVehicle.shipment?.challanNo || "CHL9876543210"}</p>
                    </div>
                  </div>
                </Card>
              </>
            ) : (
              <Card className="p-16 flex flex-col items-center justify-center text-center text-muted-foreground gap-4 bg-card/60 backdrop-blur-md border-border/60 h-[750px] shadow-lg">
                <Truck className="w-16 h-16 opacity-20" />
                <h3 className="text-xl font-semibold text-foreground/80">No Vehicle Selected</h3>
                <p className="text-sm max-w-sm">
                  Select a vehicle from the left sidebar or search by vehicle number to view Flipkart-style live tracking history.
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

