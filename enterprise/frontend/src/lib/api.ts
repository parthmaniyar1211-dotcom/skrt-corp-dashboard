import axios from "axios";
import {
  clients as initialClients,
  vehicles as initialVehicles,
  drivers as initialDrivers,
  inventory as initialInventory,
  shipments as initialShipments,
  invoices as initialInvoices,
  expenses as initialExpenses,
  tracking as initialTracking,
  analytics as initialAnalytics
} from "./mockData";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Helper for localStorage virtual database
const getCollection = (key: string, initialData: any[]) => {
  if (typeof window === "undefined") return initialData;
  const stored = localStorage.getItem(key);
  if (!stored) {
    localStorage.setItem(key, JSON.stringify(initialData));
    return initialData;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return initialData;
  }
};

const saveCollection = (key: string, data: any[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(data));
  }
};

// Core Virtual Database engine
const handleVirtualDB = (config: any) => {
  let endpoint = config.url || "";
  
  // Normalize endpoint
  if (config.baseURL && endpoint.startsWith(config.baseURL)) {
    endpoint = endpoint.substring(config.baseURL.length);
  }
  if (endpoint.startsWith("http://") || endpoint.startsWith("https://")) {
    try {
      const parsed = new URL(endpoint);
      endpoint = parsed.pathname;
    } catch (e) {}
  }
  if (endpoint.startsWith("/api")) {
    endpoint = endpoint.substring(4);
  }

  // Split parts
  const parts = endpoint.split("/").filter(Boolean); // e.g. ["inventory"] or ["inventory", "mock_inv_1"]
  const resource = parts[0];
  const id = parts[1];
  const method = (config.method || "get").toLowerCase();
  
  let parsedData: any = {};
  if (config.data) {
    try {
      parsedData = typeof config.data === "string" ? JSON.parse(config.data) : config.data;
    } catch (e) {
      if (typeof config.data === "object") {
        parsedData = config.data;
      } else {
        console.error("Failed to parse request data", e);
      }
    }
  }

  console.warn(`⚡ Virtual DB Engine processing: ${method.toUpperCase()} ${endpoint}`);

  let responseData: any = { success: false, message: "Virtual DB resource not found" };

  // 1. INVENTORY ENDPOINTS
  if (resource === "inventory") {
    const list = getCollection("skrt_inventory", initialInventory);
    if (method === "get") {
      responseData = { success: true, data: list };
    } else if (method === "post") {
      const newItem = {
        _id: parsedData._id || `mock_inv_${Date.now()}`,
        inventoryId: parsedData.inventoryId || `INV${Date.now().toString().slice(-4)}`,
        lrNo: parsedData.lrNo || `LR${Date.now().toString().slice(-4)}`,
        ...parsedData,
        createdAt: new Date().toISOString()
      };
      list.unshift(newItem);
      saveCollection("skrt_inventory", list);
      responseData = { success: true, data: newItem };
    } else if (method === "put" && id) {
      const updatedList = list.map((item: any) => item._id === id ? { ...item, ...parsedData } : item);
      saveCollection("skrt_inventory", updatedList);
      responseData = { success: true, data: updatedList.find((item: any) => item._id === id) };
    } else if (method === "delete" && id) {
      const updatedList = list.filter((item: any) => item._id !== id);
      saveCollection("skrt_inventory", updatedList);
      responseData = { success: true };
    }
  }

  // 2. SHIPMENTS ENDPOINTS
  else if (resource === "shipments") {
    const list = getCollection("skrt_shipments", initialShipments);
    if (method === "get") {
      responseData = { success: true, data: list };
    } else if (method === "post") {
      const newItem = {
        _id: parsedData._id || `mock_ship_${Date.now()}`,
        consignmentNumber: parsedData.consignmentNumber || `SKRT-${Date.now().toString().slice(-4)}`,
        ...parsedData,
        createdAt: new Date().toISOString()
      };
      list.unshift(newItem);
      saveCollection("skrt_shipments", list);
      responseData = { success: true, data: newItem };
    } else if (method === "put" && id) {
      const updatedList = list.map((item: any) => item._id === id ? { ...item, ...parsedData } : item);
      saveCollection("skrt_shipments", updatedList);
      responseData = { success: true, data: updatedList.find((item: any) => item._id === id) };
    }
  }

  // 3. TRACKING ENDPOINTS
  else if (resource === "tracking") {
    const shipmentsList = getCollection("skrt_shipments", initialShipments);
    const vehiclesList = getCollection("skrt_vehicles", initialVehicles);
    const driversList = getCollection("skrt_drivers", initialDrivers);
    
    const inTransit = shipmentsList.filter((s: any) => s.status === 'In Transit');
    const trackingList = inTransit.map((s: any, i: number) => {
      const baseLat = 22.3072 + (i * 0.15);
      const baseLng = 73.1812 - (i * 0.08);
      const assignedVehicle = vehiclesList[i % vehiclesList.length] || { vehicleNo: s.vehicleNumber || "GJ-01-AB-1234", type: "Truck" };
      const assignedDriver = driversList[i % driversList.length] || { name: s.driver?.name || "Ramesh Kumar", phone: s.driver?.phone || "9876543210" };
      
      return {
        _id: `mock_track_${s._id}`,
        consignmentNumber: s.consignmentNumber || s.id,
        vehicleNumber: assignedVehicle.vehicleNo,
        driverName: assignedDriver.name,
        driverPhone: assignedDriver.phone,
        type: assignedVehicle.type,
        status: 'active',
        statusLabel: 'In Transit',
        currentLocation: {
          lat: baseLat,
          lng: baseLng,
          address: `NH-48 Corridor, Milepost #${i + 1}`
        },
        lastUpdate: new Date().toISOString(),
        distance: `${120 + (i * 45)} km`,
        shipment: {
          lrNo: s.consignmentNumber || s.id,
          origin: s.consignor?.city || "Warehouse",
          destination: s.consignee?.city || s.toBranch || "Destination",
          sender: s.consignor?.name || "Sender",
          receiver: s.consignee?.name || "Receiver",
          cargoType: s.description || "Cargo",
          packages: s.quantity || 10,
          weight: `${s.actualWeight || 500} kg`,
          value: `₹${(s.totalFreight * 10 || 50000).toLocaleString()}`,
          challanNo: `CHL-${4000 + i}`
        },
        trackingHistory: [
          { id: '1', title: 'Vehicle Assigned', location: `${s.consignor?.city || "Warehouse"} Depot`, time: '08:00 AM', status: 'completed' },
          { id: '2', title: 'Shipment Loaded', location: `${s.consignor?.city || "Warehouse"} Warehouse`, time: '10:30 AM', status: 'completed' },
          { id: '3', title: 'Dispatched', location: `${s.consignor?.city || "Warehouse"} Bypass`, time: '01:00 PM', status: 'completed' },
          { id: '4', title: 'In Transit', location: 'NH-48 Highway', time: '04:30 PM', status: 'active' },
          { id: '5', title: 'Reached Destination Hub', location: `${s.consignee?.city || "Destination"} Hub`, time: '-', status: 'pending' }
        ]
      };
    });
    responseData = { success: true, data: trackingList };
  }

  // 4. VEHICLES ENDPOINTS
  else if (resource === "vehicles") {
    const list = getCollection("skrt_vehicles", initialVehicles);
    if (method === "get") {
      responseData = { success: true, data: list };
    } else if (method === "post") {
      const newItem = {
        _id: parsedData._id || `mock_veh_${Date.now()}`,
        ...parsedData,
        capacity: Number(parsedData.capacity) || 15000,
        status: parsedData.status || "available",
        lastServiceDate: new Date().toISOString()
      };
      list.unshift(newItem);
      saveCollection("skrt_vehicles", list);
      responseData = { success: true, data: newItem };
    }
  }

  // 5. DRIVERS ENDPOINTS
  else if (resource === "drivers") {
    const list = getCollection("skrt_drivers", initialDrivers);
    if (method === "get") {
      responseData = { success: true, data: list };
    } else if (method === "post") {
      const newItem = {
        _id: parsedData._id || `mock_drv_${Date.now()}`,
        ...parsedData,
        rating: 5.0,
        experience: "5 Years"
      };
      list.unshift(newItem);
      saveCollection("skrt_drivers", list);
      responseData = { success: true, data: newItem };
    }
  }

  // 6. CLIENTS ENDPOINTS
  else if (resource === "clients") {
    const list = getCollection("skrt_clients", initialClients);
    if (method === "get") {
      responseData = { success: true, data: list };
    } else if (method === "post") {
      const newItem = {
        _id: parsedData._id || `mock_cli_${Date.now()}`,
        ...parsedData,
        status: "Active",
        totalShipments: 0
      };
      list.unshift(newItem);
      saveCollection("skrt_clients", list);
      responseData = { success: true, data: newItem };
    }
  }

  // 7. INVOICES ENDPOINTS
  else if (resource === "invoices") {
    const list = getCollection("skrt_invoices", initialInvoices);
    if (method === "get") {
      responseData = { success: true, data: list };
    } else if (method === "post") {
      const tax = Math.round(Number(parsedData.amount || parsedData.total || 10000) * 0.18);
      const total = Number(parsedData.amount || parsedData.total || 10000) + tax;
      const newItem = {
        _id: parsedData._id || `mock_invc_${Date.now()}`,
        invoiceNo: parsedData.invoiceNo || `INV-${Date.now().toString().slice(-4)}`,
        shipment: parsedData.shipment || { consignmentNumber: parsedData.shipmentId || "SKRT-TEMP" },
        client: parsedData.client || { name: parsedData.clientName || "Walk-in Client" },
        amount: parsedData.amount || total,
        tax,
        total,
        status: parsedData.status || "unpaid",
        createdAt: new Date().toISOString()
      };
      list.unshift(newItem);
      saveCollection("skrt_invoices", list);
      responseData = { success: true, data: newItem };
    }
  }

  // 8. EXPENSES ENDPOINTS
  else if (resource === "expenses") {
    const list = getCollection("skrt_expenses", initialExpenses);
    if (method === "get") {
      responseData = { success: true, data: list };
    } else if (method === "post") {
      const newItem = {
        _id: parsedData._id || `mock_exp_${Date.now()}`,
        ...parsedData,
        amount: Number(parsedData.amount) || 0,
        date: parsedData.date || new Date().toISOString(),
        status: parsedData.status || "paid"
      };
      list.unshift(newItem);
      saveCollection("skrt_expenses", list);
      responseData = { success: true, data: newItem };
    }
  }

  // 9. DETAILED ANALYTICS
  else if (resource === "analytics" && parts[1] === "detailed") {
    const shipmentsList = getCollection("skrt_shipments", initialShipments);
    const invoicesList = getCollection("skrt_invoices", initialInvoices);
    
    const totalPaidRevenue = invoicesList.filter((inv: any) => inv.status === 'paid').reduce((sum: number, inv: any) => sum + inv.total, 0);
    const activeShipmentsCount = shipmentsList.filter((s: any) => s.status === 'In Transit').length;

    const routeCounts: Record<string, number> = {};
    shipmentsList.forEach((s: any) => {
      const route = `${s.consignor?.city || "Warehouse"} - ${s.consignee?.city || s.toBranch || "Destination"}`;
      routeCounts[route] = (routeCounts[route] || 0) + 1;
    });
    const topRoutes = Object.keys(routeCounts).map(route => ({
      route,
      shipments: routeCounts[route]
    })).sort((a, b) => b.shipments - a.shipments).slice(0, 4);

    const revenueCosts = Array.from({ length: 5 }, (_, i) => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May'];
      const baseRev = 240000 + (i * 55000);
      return {
        month: months[i],
        revenue: baseRev,
        cost: Math.round(baseRev * 0.72)
      };
    });

    responseData = {
      success: true,
      data: {
        stats: {
          activeShipments: activeShipmentsCount,
          totalShipments: shipmentsList.length,
          monthlyRevenue: totalPaidRevenue,
          fleetUtilization: 84.5
        },
        revenueCosts,
        topRoutes,
        vehicleUtilization: [
          { date: 'May 18', rate: 78 },
          { date: 'May 19', rate: 82 },
          { date: 'May 20', rate: 88 },
          { date: 'May 21', rate: 85 },
          { date: 'May 22', rate: 92 }
        ],
        deliverySuccess: 98.7
      }
    };
  }

  // 10. DASHBOARD ANALYTICS
  else if (resource === "analytics" && parts[1] === "dashboard") {
    const shipmentsList = getCollection("skrt_shipments", initialShipments);
    const invoicesList = getCollection("skrt_invoices", initialInvoices);
    const vehiclesList = getCollection("skrt_vehicles", initialVehicles);
    
    const totalShipments = shipmentsList.length;
    const activeTrips = shipmentsList.filter((s: any) => s.status === 'In Transit').length;
    const totalRevenue = invoicesList.filter((inv: any) => inv.status === 'paid').reduce((sum: number, inv: any) => sum + inv.total, 0);
    const availableVehicles = vehiclesList.filter((v: any) => v.status === 'available').length;
    
    responseData = {
      success: true,
      data: {
        totalShipments,
        activeTrips,
        totalRevenue,
        availableVehicles
      }
    };
  }

  return {
    data: responseData,
    status: 200,
    statusText: "OK",
    headers: {},
    config
  };
};

const virtualDBAdapter = (config: any) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(handleVirtualDB(config));
    }, 50); // slight simulated delay for premium UX feel
  });
};

// Add a request interceptor for JWT & Vercel Short-Circuit
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Auto-pilot Virtual Database mode when hosted on Vercel (or when explicitly requested)
      const isVercel = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
      const forceDemo = localStorage.getItem("force_demo") === "true";
      
      if (isVercel || forceDemo) {
        config.adapter = virtualDBAdapter as any;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for fallback on localhost when backend is down
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const config = error.config;
    
    // If it's a network refusal/timeout (backend server is not running on localhost)
    if (config && (!error.response || error.code === 'ERR_NETWORK' || error.message === 'Network Error')) {
      console.warn("⚠️ Local server unreachable. Switching this request to Virtual DB fallback.");
      return Promise.resolve(handleVirtualDB(config));
    }
    
    if (error.response) {
      if (error.response.status === 429) {
        console.error('❌ Rate Limit Error: Too many requests.');
        if (typeof window !== 'undefined') {
          import('sonner').then(({ toast }) => {
            toast.error('Too many requests. Please wait a moment.');
          });
        }
      } else {
        console.error('❌ API Error:', error.response.data.message || error.response.statusText);
      }
    } else if (error.request) {
      console.error('❌ Network Error: Backend might be down.');
    } else {
      console.error('❌ Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
