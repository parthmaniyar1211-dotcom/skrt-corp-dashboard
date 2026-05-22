const mongoose = require('mongoose');

// Mock Data Memory Store
const mockStore = {
  vehicles: [
    { _id: 'mock_veh_1', vehicleNo: 'RJ-06-GB-2101', type: 'Truck', capacity: 25000, status: 'available' },
    { _id: 'mock_veh_2', vehicleNo: 'RJ-06-GB-4421', type: 'Container', capacity: 18000, status: 'available' },
    { _id: 'mock_veh_3', vehicleNo: 'MH-12-Q-4567', type: 'Trailer', capacity: 35000, status: 'in-service' }
  ],
  drivers: [
    { _id: 'mock_drv_1', name: 'Ramesh Singh', phone: '9876512345', license: 'DL-1234567890', status: 'available', experience: 8, rating: 4.8 },
    { _id: 'mock_drv_2', name: 'Suresh Kumar', phone: '9876512346', license: 'DL-1234567891', status: 'busy', experience: 5, rating: 4.5 }
  ],
  clients: [
    { _id: 'mock_cli_1', name: 'Aditya Textiles', email: 'aditya@textiles.com', phone: '9876543210', address: 'Bhilwara', status: 'active' },
    { _id: 'mock_cli_2', name: 'Gujarat Fabrics', email: 'gujarat@fabrics.com', phone: '9123456780', address: 'Ahmedabad', status: 'active' },
    { _id: 'mock_cli_3', name: 'Global Logistics', email: 'global@logistics.com', phone: '9811122334', address: 'Jaipur', status: 'active' }
  ],
  inventory: [
    {
      _id: 'mock_inv_1',
      inventoryId: 'INV001001',
      lrNo: 'LR982341',
      cargoName: 'Cotton Bales (Grade A)',
      senderName: 'Aditya Spinners Ltd',
      senderPhone: '9876543210',
      receiverName: 'Gujarat Textile Mills',
      receiverPhone: '9876543211',
      origin: 'Bhilwara',
      destination: 'Ahmedabad',
      packages: 50,
      weight: 2500,
      rate: 18,
      totalFreight: 45000,
      paymentMode: 'To Pay',
      warehouseLocation: 'Bay 4, Bhilwara Hub',
      incomingStatus: 'Checked In',
      outgoingStatus: 'Pending',
      status: 'In Inventory',
      challanStatus: 'Not Created',
      remarks: 'Handle with care - Keep dry',
      createdAt: new Date().toISOString()
    },
    {
      _id: 'mock_inv_2',
      inventoryId: 'INV001002',
      lrNo: 'LR982342',
      cargoName: 'Industrial Machinery Spares',
      senderName: 'L&T Heavy Engg',
      senderPhone: '9123456789',
      receiverName: 'Tata Motors Assembly',
      receiverPhone: '9123456790',
      origin: 'Mumbai',
      destination: 'Pune',
      packages: 12,
      weight: 1200,
      rate: 25,
      totalFreight: 30000,
      paymentMode: 'Paid',
      warehouseLocation: 'Heavy Cargo Bay, Mumbai',
      incomingStatus: 'Checked In',
      outgoingStatus: 'Dispatched',
      status: 'Outgoing',
      challanStatus: 'Created',
      challanData: {
        challanNo: 'CH-2026-001',
        vehicleNumber: 'MH-12-Q-4567',
        driverName: 'Ramesh Singh',
        driverPhone: '9876512345',
        fromLocation: 'Mumbai Hub',
        toLocation: 'Pune Assembly Hub',
        dispatchDate: new Date().toISOString(),
        packages: 12,
        weight: 1200,
        remarks: 'Urgent Delivery'
      },
      remarks: 'Fragile precision parts',
      createdAt: new Date().toISOString()
    },
    {
      _id: 'mock_inv_3',
      inventoryId: 'INV001003',
      lrNo: 'LR982343',
      cargoName: 'Polyester Yarn Cartons',
      senderName: 'Reliance Industries',
      senderPhone: '9988776655',
      receiverName: 'Surat Weaving Co',
      receiverPhone: '9988776656',
      origin: 'Surat',
      destination: 'Bhilwara',
      packages: 100,
      weight: 4000,
      rate: 15,
      totalFreight: 60000,
      paymentMode: 'Credit',
      warehouseLocation: 'Bay 2, Surat Depot',
      incomingStatus: 'Arrived at Warehouse',
      outgoingStatus: 'Pending',
      status: 'Incoming',
      challanStatus: 'Not Created',
      remarks: 'Standard transit',
      createdAt: new Date().toISOString()
    }
  ],
  shipments: [
    {
      _id: 'mock_ship_1',
      consignmentNumber: 'SKRT-1001',
      toBranch: 'Ahmedabad',
      consignor: {
        gst: '08AIMPG1878N1ZL',
        name: 'Aditya Textiles',
        phoneNumber: '9876543210',
        state: 'Rajasthan',
        city: 'Bhilwara'
      },
      consignee: {
        gst: '24BBBBB2222B2Z2',
        name: 'Gujarat Fabrics',
        phoneNumber: '9123456780',
        state: 'Gujarat',
        city: 'Ahmedabad'
      },
      invoiceValue: 500000,
      description: 'Cotton Yarn Bales',
      quantity: 50,
      packageType: 'Bale',
      privateNumber: 'P-9874',
      actualWeight: 2500,
      chargedWeight: 2500,
      rateType: 'Kg',
      rate: 18,
      paymentMode: 'Paid',
      totalFreight: 45000,
      totalPayable: 45000,
      status: 'In Transit',
      outgoingStatus: 'In Transit',
      vehicleNumber: 'RJ-06-GB-2101',
      createdAt: new Date().toISOString()
    },
    {
      _id: 'mock_ship_2',
      consignmentNumber: 'SKRT-1002',
      toBranch: 'Delhi',
      consignor: {
        gst: '08AIMPG1878N1ZL',
        name: 'Global Logistics',
        phoneNumber: '9811122334',
        state: 'Rajasthan',
        city: 'Jaipur'
      },
      consignee: {
        gst: '07CCCCC3333C3Z3',
        name: 'Delhi Depot',
        phoneNumber: '9711223344',
        state: 'Delhi',
        city: 'Delhi'
      },
      invoiceValue: 350000,
      description: 'Machine Parts',
      quantity: 15,
      packageType: 'Box',
      privateNumber: 'P-5521',
      actualWeight: 1800,
      chargedWeight: 1800,
      rateType: 'Kg',
      rate: 15,
      paymentMode: 'ToPay',
      totalFreight: 27000,
      totalPayable: 27000,
      status: 'Booked',
      outgoingStatus: 'Pending',
      createdAt: new Date().toISOString()
    }
  ],
  invoices: [
    {
      _id: 'mock_invc_1',
      invoiceNo: 'INV-001',
      shipment: { _id: 'mock_ship_1', consignmentNumber: 'SKRT-1001' },
      client: { name: 'Aditya Textiles', email: 'aditya@textiles.com', phone: '9876543210' },
      amount: 45000,
      tax: 0,
      total: 45000,
      status: 'paid',
      paidDate: new Date().toISOString(),
      createdAt: new Date().toISOString()
    }
  ],
  expenses: [
    { _id: 'mock_exp_1', type: 'Fuel', amount: 15000, description: 'Fuel RJ-06-GB-2101', date: new Date().toISOString(), status: 'Paid', createdAt: new Date().toISOString() },
    { _id: 'mock_exp_2', type: 'Toll', amount: 2500, description: 'Toll NH-48', date: new Date().toISOString(), status: 'Paid', createdAt: new Date().toISOString() }
  ],
  notifications: [
    { _id: 'mock_not_1', title: 'New Shipment Booked', message: 'Shipment SKRT-1002 has been successfully booked.', type: 'info', read: false, createdAt: new Date().toISOString() },
    { _id: 'mock_not_2', title: 'Service Scheduled', message: 'Vehicle MH-12-Q-4567 scheduled for maintenance.', type: 'warning', read: false, createdAt: new Date().toISOString() }
  ]
};

// Analytics Mock Responses
const mockAnalytics = {
  dashboard: {
    stats: {
      activeShipments: 2,
      totalShipments: 12,
      monthlyRevenue: 72000,
      fleetUtilization: 66.7
    },
    revenueCosts: [
      { month: 'Jan', revenue: 50000, cost: 35000 },
      { month: 'Feb', revenue: 60000, cost: 42000 },
      { month: 'Mar', revenue: 55000, cost: 38000 },
      { month: 'Apr', revenue: 70000, cost: 48000 },
      { month: 'May', revenue: 72000, cost: 49000 }
    ],
    topRoutes: [
      { route: 'Bhilwara - Ahmedabad', shipments: 24, revenue: 432000 },
      { route: 'Jaipur - Delhi', shipments: 18, revenue: 270000 },
      { route: 'Mumbai - Pune', shipments: 15, revenue: 225000 }
    ],
    vehicleUtilization: [
      { date: 'May 18', rate: 75 },
      { date: 'May 19', rate: 80 },
      { date: 'May 20', rate: 85 },
      { date: 'May 21', rate: 85 },
      { date: 'May 22', rate: 90 }
    ],
    deliverySuccess: 98.4
  }
};

const mockDbMiddleware = (req, res, next) => {
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    return next();
  }

  // Bypass auth endpoints as they are explicitly handled in auth controller
  if (req.path.startsWith('/auth') || req.path.startsWith('/api/auth')) {
    return next();
  }

  console.log(`🔌 [Mock DB Interceptor] ${req.method} ${req.path}`);

  // Extract resource key from path, supporting both direct and /api prefixed routes
  const match = req.path.match(/^(\/api)?\/([a-zA-Z0-9-]+)/);
  if (!match) {
    return next();
  }

  const resource = match[2];

  // Specific Analytics Handling
  if (resource === 'analytics') {
    if (req.path.includes('/dashboard')) {
      return res.json({ success: true, data: mockAnalytics.dashboard });
    }
    return res.json({ success: true, data: mockAnalytics.dashboard });
  }

  // Health Check Endpoint
  if (resource === 'health') {
    return res.json({ status: 'ok', database: 'disconnected', mode: 'mock', timestamp: new Date().toISOString() });
  }

  // Fetch standard memory store key (plural)
  const storeKey = resource === 'cash-memo' || resource === 'entry' ? 'inventory' : resource;
  const store = mockStore[storeKey];

  if (!store) {
    // If not found in mock store, return generic success so frontend works
    return res.json({ success: true, message: `Operation succeeded on ${resource} (Mock Mode)`, data: req.body });
  }

  // GET Requests - Return list or specific item
  if (req.method === 'GET') {
    const idParam = req.path.split('/').pop();
    if (idParam && idParam !== resource) {
      const item = store.find(i => i._id === idParam || (i.inventoryId && i.inventoryId === idParam) || (i.consignmentNumber && i.consignmentNumber === idParam));
      if (item) {
        return res.json({ success: true, data: item });
      }
      return res.status(404).json({ success: false, message: 'Resource not found in Mock Store' });
    }
    return res.json({ success: true, data: store });
  }

  // POST Requests - Simulate creation
  if (req.method === 'POST') {
    const newItem = {
      _id: `mock_${resource}_${Date.now()}`,
      ...req.body,
      createdAt: new Date().toISOString()
    };
    store.unshift(newItem);
    console.log(`➕ Added mock item to ${storeKey} store.`);
    return res.status(201).json({ success: true, message: 'Created successfully (Mock Mode)', data: newItem });
  }

  // PUT / PATCH Requests - Simulate update
  if (req.method === 'PUT' || req.method === 'PATCH') {
    const idParam = req.path.split('/').pop();
    const index = store.findIndex(i => i._id === idParam || (i.inventoryId && i.inventoryId === idParam) || (i.consignmentNumber && i.consignmentNumber === idParam));
    if (index !== -1) {
      store[index] = { ...store[index], ...req.body, updatedAt: new Date().toISOString() };
      console.log(`✏️ Updated mock item in ${storeKey} store.`);
      return res.json({ success: true, message: 'Updated successfully (Mock Mode)', data: store[index] });
    }
    return res.status(404).json({ success: false, message: 'Resource to update not found in Mock Store' });
  }

  // DELETE Requests - Simulate deletion
  if (req.method === 'DELETE') {
    const idParam = req.path.split('/').pop();
    const index = store.findIndex(i => i._id === idParam);
    if (index !== -1) {
      const deleted = store.splice(index, 1);
      console.log(`❌ Deleted mock item from ${storeKey} store.`);
      return res.json({ success: true, message: 'Deleted successfully (Mock Mode)', data: deleted[0] });
    }
    return res.status(404).json({ success: false, message: 'Resource to delete not found in Mock Store' });
  }

  return next();
};

module.exports = mockDbMiddleware;
