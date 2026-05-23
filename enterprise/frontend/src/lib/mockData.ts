// Central Connected Mock/Demo Dataset for SKRT Dashboard

const clientsList = [
  { name: 'Aditya Spinners Ltd', email: 'aditya@spinners.com', phone: '9876543210', address: 'Bhilwara', gstin: '08AIMPG1878N1ZL' },
  { name: 'Gujarat Textile Mills', email: 'gujarat@fabrics.com', phone: '9123456780', address: 'Ahmedabad', gstin: '24BBBBB2222B2Z2' },
  { name: 'Jaipur Handicrafts', email: 'jaipur@handicrafts.com', phone: '9811122334', address: 'Jaipur', gstin: '08CCCCC3333C3Z3' },
  { name: 'Delhi Retailers', email: 'delhi@retailers.com', phone: '9711223344', address: 'Delhi', gstin: '07DDDDD4444D4Z4' },
  { name: 'Mumbai Auto Corp', email: 'mumbai@autocorp.com', phone: '9822334455', address: 'Mumbai', gstin: '27EEEEE5555E5Z5' },
  { name: 'Pune Tooling Ltd', email: 'pune@tooling.com', phone: '9833445566', address: 'Pune', gstin: '27FFFFF6666F6Z6' },
  { name: 'Surat Weaving Co', email: 'surat@weaving.com', phone: '9988776655', address: 'Surat', gstin: '24GGGGG7777G7Z7' },
  { name: 'Indore Agro Mills', email: 'indore@agro.com', phone: '9844556677', address: 'Indore', gstin: '23HHHHH8888H8Z8' },
  { name: 'Rajkot Castings', email: 'rajkot@castings.com', phone: '9855667788', address: 'Rajkot', gstin: '24IIIII9999I9Z9' },
  { name: 'Reliance Industries', email: 'reliance@ril.com', phone: '9900112233', address: 'Surat', gstin: '24JJJJJ0000J0Z0' },
  { name: 'Tata Motors', email: 'tata@motors.com', phone: '9911223344', address: 'Pune', gstin: '27KKKKK1111K1Z1' },
  { name: 'L&T Heavy Engg', email: 'lt@heavy.com', phone: '9922334455', address: 'Mumbai', gstin: '27LLLLL2222L2Z2' },
  { name: 'Vardhman Spinners', email: 'vardhman@spinners.com', phone: '9933445566', address: 'Bhilwara', gstin: '08MMMMM3333M3Z3' },
  { name: 'Surat Silk Mills', email: 'silk@surat.com', phone: '9944556677', address: 'Surat', gstin: '24NNNNN4444N4Z4' },
  { name: 'Indore Trading Co', email: 'trade@indore.com', phone: '9955667788', address: 'Indore', gstin: '23OOOOO5555O5Z5' },
  { name: 'Ahmedabad Chemicals', email: 'chem@ahmedabad.com', phone: '9966778899', address: 'Ahmedabad', gstin: '24PPPPP6666P6Z6' },
  { name: 'Shree Textiles Ltd', email: 'shree@textiles.com', phone: '9866778811', address: 'Bhilwara', gstin: '08QQQQQ7777Q7Z7' },
  { name: 'Bharat Traders', email: 'bharat@traders.com', phone: '9812345678', address: 'Delhi', gstin: '07RRRRR8888R8Z8' },
  { name: 'Vadodara Glass Ltd', email: 'vad@glass.com', phone: '9811223300', address: 'Vadodara', gstin: '24SSSSS9999S9Z9' },
  { name: 'Nashik Agro Co', email: 'nashik@agro.com', phone: '9877889900', address: 'Nashik', gstin: '27TTTTT0000T0Z0' },
  { name: 'Gwalior Alloys Ltd', email: 'gwalior@alloys.com', phone: '9822330011', address: 'Indore', gstin: '23UUUUU1111U1Z1' }
];

const cities = ['Ahmedabad', 'Surat', 'Mumbai', 'Pune', 'Delhi', 'Jaipur', 'Indore', 'Rajkot', 'Vadodara', 'Nashik', 'Bhilwara'];

const cargoTypes = [
  'Cotton Bales', 'Textile Cartons', 'Steel Pipes', 'FMCG Goods', 'Electronics', 'Machinery Parts',
  'Ceramic Tiles', 'Polyester Yarn', 'Copper Wires', 'Chemical Drums', 'Auto Parts', 'Garment Boxes'
];

const vehicleTypes = ['Truck', 'Container', 'Trailer', 'Van'];

const driverNames = [
  'Ramesh Singh', 'Suresh Kumar', 'Manoj Yadav', 'Rajesh Sharma', 'Amit Patel', 
  'Vijay Rathore', 'Dinesh Choudhary', 'Sunil Verma', 'Sanjay Mishra', 'Anil Gupta', 
  'Vikram Jhala', 'Satish Nehra', 'Mahendra Singh', 'Harpreet Singh', 'Gurpreet Singh', 
  'Baldev Raj', 'Karan Johar', 'Jaspreet Singh', 'Dalip Singh', 'Kartik Aryan', 
  'Ranveer Singh', 'Deepak Hooda'
];

const vendorsList = [
  "Indian Oil Corp", "Bharat Petroleum", "HP Fuel Station", "Highway Toll Authority",
  "Tata Motors Service", "Ashok Leyland Care", "MRF Tyre Zone", "National Insurance",
  "RTO Authority Office", "Highway Dhabha & Rest", "Surat Hub Maintenance"
];

// 1. Clients (21 records)
export const clients: any[] = clientsList.map((c, i) => ({
  _id: `mock_cli_${i + 1}`,
  name: c.name,
  email: c.email,
  phone: c.phone,
  address: c.address,
  gstin: c.gstin,
  status: 'active',
  createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString()
}));

// 2. Vehicles (21 records)
export const vehicles: any[] = Array.from({ length: 21 }, (_, i) => {
  const states = ['GJ', 'MH', 'RJ', 'DL', 'MP'];
  const state = states[i % states.length];
  const code = String((i * 3 + 1) % 90).padStart(2, '0');
  const series = 'AB';
  const num = String(1000 + i).slice(1);
  const vehicleNo = `${state}-${code}-${series}-${num}`;
  const type = vehicleTypes[i % vehicleTypes.length];
  const capacities: Record<string, number> = { Truck: 25000, Container: 18000, Trailer: 35000, Van: 5000 };
  return {
    _id: `mock_veh_${i + 1}`,
    vehicleNo,
    type,
    capacity: capacities[type],
    status: i % 6 === 0 ? 'maintenance' : i % 3 === 0 ? 'on-trip' : 'available',
    model: `${type === 'Truck' ? 'Tata' : type === 'Container' ? 'Mahindra' : type === 'Trailer' ? 'Ashok Leyland' : 'Eicher'} ${2020 + (i % 6)}`,
    owner: { name: 'SKRT Logistics Ltd', phone: '9898989898' },
    lastServiceDate: new Date(Date.now() - (i * 5 + 10) * 24 * 60 * 60 * 1000).toISOString(),
    insuranceExpiry: new Date(Date.now() + (i * 15 + 30) * 24 * 60 * 60 * 1000).toISOString()
  };
});

// 3. Drivers (22 records)
export const drivers: any[] = driverNames.map((name, i) => {
  const assignedVehicle = vehicles[i % vehicles.length];
  return {
    _id: `mock_drv_${i + 1}`,
    name,
    phone: `98765${String(10000 + i).slice(1)}`,
    license: `DL-${String(1000000000 + i).slice(1)}`,
    status: i % 3 === 0 ? 'busy' : 'available',
    experience: 3 + (i % 15),
    rating: Number((4.0 + (i % 10) * 0.1).toFixed(1)),
    email: `${name.toLowerCase().replace(' ', '.')}@skrt.com`,
    role: 'driver',
    assignedVehicle: {
      _id: assignedVehicle._id,
      vehicleNo: assignedVehicle.vehicleNo,
      type: assignedVehicle.type
    },
    trips: [
      { id: `t1_${i}`, route: `Bhilwara → Ahmedabad`, status: 'Completed', date: '2026-05-18' },
      { id: `t2_${i}`, route: `${assignedVehicle.type} Routing`, status: 'Active', date: '2026-05-23' }
    ]
  };
});

// 4. Inventory (31 records)
export const inventory: any[] = Array.from({ length: 31 }, (_, i) => {
  const sender = clientsList[i % clientsList.length];
  const receiver = clientsList[(i + 3) % clientsList.length];
  const origin = cities[i % cities.length];
  const destination = cities[(i + 4) % cities.length];
  const cargoName = cargoTypes[i % cargoTypes.length];
  const packages = 10 + (i * 4);
  const weight = packages * 50;
  const rate = 10 + (i % 15);
  const totalFreight = weight * rate;
  const paymentMode = ['To Pay', 'Paid', 'Credit'][i % 3];
  const incomingStatus = ['Pending', 'Received', 'Arrived at Warehouse', 'Checked In'][i % 4];
  const status = i % 3 === 0 ? 'Outgoing' : i % 3 === 1 ? 'Incoming' : 'In Inventory';
  const challanStatus = i % 2 === 0 ? 'Created' : 'Not Created';
  
  let challanData = null;
  if (challanStatus === 'Created') {
    const assignedVehicle = vehicles[i % vehicles.length];
    const assignedDriver = drivers[i % drivers.length];
    challanData = {
      challanNo: `CH-2026-${String(100 + i)}`,
      vehicleNumber: assignedVehicle.vehicleNo,
      driverName: assignedDriver.name,
      driverPhone: assignedDriver.phone,
      fromLocation: origin,
      toLocation: destination,
      dispatchDate: new Date(Date.now() - (i % 5) * 24 * 60 * 60 * 1000).toISOString(),
      packages,
      weight,
      remarks: 'Direct Warehouse Dispatch'
    };
  }

  return {
    _id: `mock_inv_${i + 1}`,
    inventoryId: `INV00${1000 + i}`,
    lrNo: `LR982${340 + i}`,
    cargoName,
    senderName: sender.name,
    senderPhone: sender.phone,
    receiverName: receiver.name,
    receiverPhone: receiver.phone,
    origin,
    destination,
    packages,
    weight,
    rate,
    totalFreight,
    paymentMode,
    warehouseLocation: `Bay ${1 + (i % 6)}, ${origin} Depot`,
    incomingStatus,
    outgoingStatus: challanStatus === 'Created' ? 'Dispatched' : 'Pending',
    status,
    challanStatus,
    challanData,
    remarks: 'Handle carefully',
    createdAt: new Date(Date.now() - i * 12 * 60 * 60 * 1000).toISOString()
  };
});

// 5. Shipments (31 records)
export const shipments: any[] = Array.from({ length: 31 }, (_, i) => {
  const sender = clientsList[i % clientsList.length];
  const receiver = clientsList[(i + 5) % clientsList.length];
  const origin = cities[i % cities.length];
  const destination = cities[(i + 3) % cities.length];
  const cargoName = cargoTypes[i % cargoTypes.length];
  const qty = 20 + (i * 3);
  const weight = qty * 45;
  const rate = 12 + (i % 12);
  const totalFreight = weight * rate;
  const assignedVehicle = vehicles[i % vehicles.length];
  const assignedDriver = drivers[i % drivers.length];
  
  return {
    _id: `mock_ship_${i + 1}`,
    consignmentNumber: `SKRT-${1000 + i}`,
    toBranch: destination,
    consignor: {
      gst: sender.gstin,
      name: sender.name,
      phoneNumber: sender.phone,
      state: origin === 'Bhilwara' || origin === 'Jaipur' ? 'Rajasthan' : origin === 'Ahmedabad' || origin === 'Surat' || origin === 'Rajkot' ? 'Gujarat' : origin === 'Mumbai' || origin === 'Pune' ? 'Maharashtra' : origin === 'Delhi' ? 'Delhi' : 'Madhya Pradesh',
      city: origin
    },
    consignee: {
      gst: receiver.gstin,
      name: receiver.name,
      phoneNumber: receiver.phone,
      state: destination === 'Bhilwara' || destination === 'Jaipur' ? 'Rajasthan' : destination === 'Ahmedabad' || destination === 'Surat' || destination === 'Rajkot' ? 'Gujarat' : destination === 'Mumbai' || destination === 'Pune' ? 'Maharashtra' : destination === 'Delhi' ? 'Delhi' : 'Madhya Pradesh',
      city: destination
    },
    invoiceValue: totalFreight * 10,
    description: cargoName,
    quantity: qty,
    packageType: ['Bale', 'Box', 'Carton', 'Roll', 'Drum'][i % 5],
    privateNumber: `P-${4000 + i}`,
    actualWeight: weight,
    chargedWeight: weight,
    rateType: 'Kg',
    rate,
    paymentMode: ['Paid', 'ToPay', 'Credit'][i % 3],
    totalFreight,
    totalPayable: totalFreight,
    status: i % 4 === 0 ? 'Delivered' : i % 3 === 0 ? 'Booked' : 'In Transit',
    outgoingStatus: i % 4 === 0 ? 'Delivered' : i % 3 === 0 ? 'Pending' : 'In Transit',
    vehicleNumber: assignedVehicle.vehicleNo,
    driver: {
      _id: assignedDriver._id,
      name: assignedDriver.name,
      phone: assignedDriver.phone
    },
    createdAt: new Date(Date.now() - i * 18 * 60 * 60 * 1000).toISOString()
  };
});

// 6. Invoices (31 records)
export const invoices: any[] = shipments.map((s, i) => {
  const tax = Math.round(s.totalFreight * 0.18);
  const total = s.totalFreight + tax;
  return {
    _id: `mock_invc_${i + 1}`,
    invoiceNo: `INV-${String(100 + i)}`,
    shipment: { _id: s._id, consignmentNumber: s.consignmentNumber, description: s.description, totalFreight: s.totalFreight, packageType: s.packageType },
    client: { name: s.consignor.name, email: `${s.consignor.name.toLowerCase().replace(/ /g, '')}@gmail.com`, phone: s.consignor.phoneNumber },
    amount: s.totalFreight,
    tax,
    total,
    status: i % 4 === 0 ? 'cancelled' : i % 2 === 0 ? 'paid' : 'unpaid',
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    paidDate: i % 2 === 0 ? new Date(Date.now() - (i % 5) * 24 * 60 * 60 * 1000).toISOString() : null,
    createdAt: s.createdAt
  };
});

// 7. Expenses (30 records)
export const expenses: any[] = Array.from({ length: 30 }, (_, i) => {
  const assignedVehicle = vehicles[i % vehicles.length];
  const category = ["Fuel", "Maintenance", "Toll", "Driver Allowance", "Loading/Unloading", "Office Expense", "Insurance", "Permit", "Tyre Repair"][i % 9];
  const driver = driverNames[i % driverNames.length];
  const vendor = category === 'Fuel' || category === 'Maintenance' || category === 'Tyre Repair' 
    ? vendorsList[i % vendorsList.length] 
    : "Highway Toll Plaza";
    
  const amounts: Record<string, number> = {
    Fuel: 12000,
    Maintenance: 8500,
    Toll: 1800,
    'Driver Allowance': 3500,
    'Loading/Unloading': 5000,
    'Office Expense': 2500,
    Insurance: 15000,
    Permit: 8000,
    'Tyre Repair': 1500
  };
  
  const amount = (amounts[category] || 2000) + (i * 120);
  const paymentMode = ['Cash', 'UPI', 'Fuel Card', 'Bank Transfer'][i % 4];
  const status = i % 5 === 0 ? 'pending' : 'paid';

  return {
    _id: `mock_exp_${i + 1}`,
    category,
    amount,
    date: new Date(Date.now() - (i * 1.5 * 24 * 60 * 60 * 1000)).toISOString(),
    vehicle: { vehicleNo: assignedVehicle.vehicleNo, _id: assignedVehicle._id },
    description: `${category} payment for vehicle ${assignedVehicle.vehicleNo}`,
    paidBy: driver,
    vendor: category === 'Office Expense' || category === 'Driver Allowance' ? 'N/A' : vendor,
    paymentMode,
    status
  };
});

// 8. Live Tracking (16 records)
export const tracking: any[] = shipments.filter(s => s.status === 'In Transit').slice(0, 16).map((s, i) => {
  const assignedVehicle = vehicles[i % vehicles.length];
  const assignedDriver = drivers[i % drivers.length];
  const baseLat = 22.3072 + (i * 0.15);
  const baseLng = 73.1812 - (i * 0.08);
  
  return {
    _id: `mock_track_${i + 1}`,
    consignmentNumber: s.consignmentNumber,
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
      lrNo: s.consignmentNumber,
      origin: s.consignor.city,
      destination: s.consignee.city,
      sender: s.consignor.name,
      receiver: s.consignee.name,
      cargoType: s.description,
      packages: s.quantity,
      weight: `${s.actualWeight} kg`,
      value: `₹${s.invoiceValue.toLocaleString()}`,
      challanNo: `CHL-${4000 + i}`
    },
    trackingHistory: [
      { id: '1', title: 'Vehicle Assigned', location: `${s.consignor.city} Depot`, time: '08:00 AM', status: 'completed' },
      { id: '2', title: 'Shipment Loaded', location: `${s.consignor.city} Warehouse`, time: '10:30 AM', status: 'completed' },
      { id: '3', title: 'Dispatched', location: `${s.consignor.city} Bypass`, time: '01:00 PM', status: 'completed' },
      { id: '4', title: 'In Transit', location: 'NH-48 Highway', time: '04:30 PM', status: 'active' },
      { id: '5', title: 'Reached Destination Hub', location: `${s.consignee.city} Hub`, time: '-', status: 'pending' }
    ]
  };
});

// 9. Dynamic Analytics
const totalPaidRevenue = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.total, 0);
const activeShipmentCount = shipments.filter(s => s.status === 'In Transit').length;

export const analytics = {
  stats: {
    activeShipments: activeShipmentCount,
    totalShipments: shipments.length,
    monthlyRevenue: totalPaidRevenue,
    fleetUtilization: 84.5
  },
  revenueCosts: Array.from({ length: 5 }, (_, i) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May'];
    const baseRev = 240000 + (i * 55000);
    return {
      month: months[i],
      revenue: baseRev,
      cost: Math.round(baseRev * 0.72)
    };
  }),
  topRoutes: [
    { route: 'Bhilwara - Ahmedabad', shipments: 35, revenue: 560000 },
    { route: 'Jaipur - Delhi', shipments: 28, revenue: 420000 },
    { route: 'Mumbai - Pune', shipments: 22, revenue: 310000 },
    { route: 'Surat - Bhilwara', shipments: 18, revenue: 270000 }
  ],
  vehicleUtilization: [
    { date: 'May 18', rate: 78 },
    { date: 'May 19', rate: 82 },
    { date: 'May 20', rate: 88 },
    { date: 'May 21', rate: 85 },
    { date: 'May 22', rate: 92 }
  ],
  deliverySuccess: 98.7
};
