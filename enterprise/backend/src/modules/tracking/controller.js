const Tracking = require('./model');
const Vehicle = require('../vehicles/model');
const Shipment = require('../shipments/model');
const Inventory = require('../inventory/model');
const User = require('../auth/model');
const sendResponse = require('../../utils/response');

const getDefaultVehicles = () => [
  {
    _id: "mock-1",
    vehicleNo: "MH12AB1234",
    type: "Container Truck",
    driverName: "Rakesh Sharma",
    driverPhone: "9876543210",
    status: "in-transit",
    statusLabel: "In Transit",
    currentLocation: { lat: 18.7500, lng: 73.4000, address: "On Mumbai - Pune Expressway" },
    lastUpdate: new Date(Date.now() - 10 * 60 * 1000),
    distance: "120 km",
    shipment: {
      lrNo: "LR1234567890",
      origin: "Pune Warehouse",
      destination: "Mumbai Branch",
      sender: "Ratan Tata Mfg",
      receiver: "Mahindra Logistics",
      cargoType: "Electronics",
      packages: 24,
      weight: "3,450 kg",
      value: "₹2,45,000",
      challanNo: "CHL9876543210"
    },
    trackingHistory: [
      { title: "Vehicle Assigned", location: "Pune Warehouse", time: "04 Sep 2025 - 09:30 AM", status: "completed" },
      { title: "Shipment Picked from Warehouse", location: "Pune Warehouse", time: "04 Sep 2025 - 10:15 AM", status: "completed" },
      { title: "Reached Hub", location: "Lonavala Hub", time: "04 Sep 2025 - 12:45 PM", status: "completed" },
      { title: "In Transit", location: "On Route to Mumbai", time: "04 Sep 2025 - 02:30 PM", status: "active" },
      { title: "Out for Delivery", location: "Mumbai Branch", time: "-", status: "pending" },
      { title: "Delivered", location: "Mumbai Branch", time: "-", status: "pending" }
    ]
  },
  {
    _id: "mock-2",
    vehicleNo: "MH14CD5678",
    type: "Heavy Truck",
    driverName: "Suresh Patil",
    driverPhone: "9823456781",
    status: "active",
    statusLabel: "Active",
    currentLocation: { lat: 19.9975, lng: 73.7898, address: "Nashik Hub" },
    lastUpdate: new Date(Date.now() - 15 * 60 * 1000),
    distance: "85 km",
    shipment: {
      lrNo: "LR9876543210",
      origin: "Nashik Hub",
      destination: "Delhi Depot",
      sender: "Nashik Grape Growers",
      receiver: "Azadpur Mandi Wholesalers",
      cargoType: "Produce",
      packages: 150,
      weight: "12,000 kg",
      value: "₹8,50,000",
      challanNo: "CHL1122334455"
    },
    trackingHistory: [
      { title: "Vehicle Assigned", location: "Nashik Warehouse", time: "04 Sep 2025 - 08:00 AM", status: "completed" },
      { title: "Shipment Picked from Warehouse", location: "Nashik Warehouse", time: "04 Sep 2025 - 09:15 AM", status: "completed" },
      { title: "Reached Hub", location: "Nashik Hub", time: "04 Sep 2025 - 11:00 AM", status: "active" },
      { title: "In Transit", location: "On Route to Indore", time: "-", status: "pending" },
      { title: "Out for Delivery", location: "Delhi Depot", time: "-", status: "pending" },
      { title: "Delivered", location: "Delhi Depot", time: "-", status: "pending" }
    ]
  },
  {
    _id: "mock-3",
    vehicleNo: "MH01EF9012",
    type: "Trailer",
    driverName: "Amit Kumar",
    driverPhone: "9765432109",
    status: "delivered",
    statusLabel: "Delivered",
    currentLocation: { lat: 18.9820, lng: 72.8340, address: "Mumbai Branch" },
    lastUpdate: new Date(Date.now() - 2 * 3600 * 1000),
    distance: "0 km",
    shipment: {
      lrNo: "LR5566778899",
      origin: "Mumbai Port",
      destination: "Jaipur Yard",
      sender: "Bombay Spares Ltd",
      receiver: "Jaipur Solar Tech",
      cargoType: "Solar Panels",
      packages: 40,
      weight: "8,500 kg",
      value: "₹15,00,000",
      challanNo: "CHL9988776655"
    },
    trackingHistory: [
      { title: "Vehicle Assigned", location: "Mumbai Port", time: "02 Sep 2025 - 10:00 AM", status: "completed" },
      { title: "Shipment Picked from Warehouse", location: "Mumbai Port", time: "02 Sep 2025 - 11:30 AM", status: "completed" },
      { title: "Reached Hub", location: "Surat Hub", time: "03 Sep 2025 - 02:00 PM", status: "completed" },
      { title: "In Transit", location: "On Route to Jaipur", time: "03 Sep 2025 - 09:00 PM", status: "completed" },
      { title: "Out for Delivery", location: "Jaipur Yard", time: "04 Sep 2025 - 11:00 AM", status: "completed" },
      { title: "Delivered", location: "Mumbai Branch", time: "04 Sep 2025 - 01:00 PM", status: "completed" }
    ]
  },
  {
    _id: "mock-4",
    vehicleNo: "GJ05GH3456",
    type: "Van",
    driverName: "Vikram Singh",
    driverPhone: "9687456123",
    status: "idle",
    statusLabel: "Idle",
    currentLocation: { lat: 23.0225, lng: 72.5714, address: "Ahmedabad Warehouse" },
    lastUpdate: new Date(Date.now() - 3600 * 1000),
    distance: "450 km",
    shipment: {
      lrNo: "LR4433221100",
      origin: "Ahmedabad Warehouse",
      destination: "Udaipur Hub",
      sender: "Gujarat Pharma Ltd",
      receiver: "Rajasthan Meds",
      cargoType: "Pharmaceuticals",
      packages: 15,
      weight: "1,200 kg",
      value: "₹5,50,000",
      challanNo: "CHL4455667788"
    },
    trackingHistory: [
      { title: "Vehicle Assigned", location: "Ahmedabad Warehouse", time: "04 Sep 2025 - 07:00 AM", status: "completed" },
      { title: "Shipment Picked from Warehouse", location: "Ahmedabad Warehouse", time: "04 Sep 2025 - 08:30 AM", status: "active" },
      { title: "Reached Hub", location: "Waiting at Warehouse", time: "-", status: "pending" },
      { title: "In Transit", location: "-", time: "-", status: "pending" },
      { title: "Out for Delivery", location: "-", time: "-", status: "pending" },
      { title: "Delivered", location: "-", time: "-", status: "pending" }
    ]
  },
  {
    _id: "mock-5",
    vehicleNo: "RJ14IJ7890",
    type: "Truck",
    driverName: "Manoj Yadav",
    driverPhone: "9543210987",
    status: "offline",
    statusLabel: "Offline",
    currentLocation: { lat: 26.9124, lng: 75.7873, address: "Jaipur Yard" },
    lastUpdate: new Date(Date.now() - 5 * 3600 * 1000),
    distance: "280 km",
    shipment: {
      lrNo: "LR7788990011",
      origin: "Jaipur Yard",
      destination: "Gurugram Hub",
      sender: "Royal Carpets",
      receiver: "Haryana Exports",
      cargoType: "Textiles",
      packages: 60,
      weight: "4,200 kg",
      value: "₹3,80,000",
      challanNo: "CHL7788990011"
    },
    trackingHistory: [
      { title: "Vehicle Assigned", location: "Jaipur Yard", time: "03 Sep 2025 - 06:00 PM", status: "completed" },
      { title: "Shipment Picked from Warehouse", location: "Jaipur Yard", time: "03 Sep 2025 - 07:30 PM", status: "completed" },
      { title: "Reached Hub", location: "Alwar Hub", time: "03 Sep 2025 - 11:00 PM", status: "completed" },
      { title: "In Transit", location: "GPS Signal Lost", time: "04 Sep 2025 - 02:00 AM", status: "active" },
      { title: "Out for Delivery", location: "-", time: "-", status: "pending" },
      { title: "Delivered", location: "-", time: "-", status: "pending" }
    ]
  }
];

const buildUnifiedTrackingData = async () => {
  const dbVehicles = await Vehicle.find();
  const dbShipments = await Shipment.find().populate('sender receiver assignedDriver');
  const dbInventory = await Inventory.find();
  const dbDrivers = await User.find({ role: 'driver' });
  const dbTrackings = await Tracking.find();

  let results = [];

  // 1. Process DB Vehicles
  for (const v of dbVehicles) {
    const normV = (v.vehicleNo || '').toLowerCase().replace(/[- ]/g, '');
    const tracking = dbTrackings.find(t => t.vehicle && t.vehicle.toString() === v._id.toString());
    const shipment = dbShipments.find(s => s.assignedVehicle && s.assignedVehicle.toString() === v._id.toString());
    const inventory = dbInventory.find(inv => inv.challanData && (inv.challanData.vehicleNumber || '').toLowerCase().replace(/[- ]/g, '') === normV);
    
    let driverName = inventory?.challanData?.driverName || shipment?.assignedDriver?.name;
    let driverPhone = inventory?.challanData?.driverPhone || shipment?.assignedDriver?.phone;

    if (!driverName || !driverPhone) {
      const driver = dbDrivers.find(d => v.owner && (d.name === v.owner.name || d.phone === v.owner.phone)) || dbDrivers[0];
      if (!driverName) driverName = driver?.name || 'Rajesh Kumar';
      if (!driverPhone) driverPhone = driver?.phone || '9876543210';
    }

    let finalStatus = 'idle';
    let finalStatusLabel = 'Idle';

    const invStatus = (inventory?.status || '').toLowerCase();
    const invChallanStatus = (inventory?.challanData?.status || inventory?.challanStatus || '').toLowerCase();
    const shipStatus = (shipment?.status || '').toLowerCase();

    if ((shipment && shipStatus === 'delivered') || (inventory && invStatus === 'delivered')) {
      finalStatus = 'delivered';
      finalStatusLabel = 'Delivered';
    } else if (shipment && ['dispatched', 'in-transit', 'booked'].includes(shipStatus)) {
      finalStatus = 'in-transit';
      finalStatusLabel = 'In Transit';
    } else if (inventory && ['outgoing', 'dispatched', 'in-transit'].includes(invStatus)) {
      finalStatus = 'in-transit';
      finalStatusLabel = 'In Transit';
    } else if (inventory?.challanData || invChallanStatus === 'created' || invChallanStatus === 'dispatched') {
      finalStatus = 'in-transit';
      finalStatusLabel = 'In Transit';
    } else if (v.status === 'on-trip') {
      finalStatus = 'in-transit';
      finalStatusLabel = 'In Transit';
    } else if (v.status === 'maintenance' || v.status === 'inactive' || v.status === 'offline') {
      finalStatus = 'offline';
      finalStatusLabel = 'Offline';
    } else {
      finalStatus = 'idle';
      finalStatusLabel = 'Idle';
    }

    const loc = tracking?.currentLocation || { lat: 25.3500, lng: 74.6330, address: 'Bhilwara Hub' };
    const lastUp = tracking?.lastUpdate || v.createdAt || new Date();

    const originStr = shipment ? shipment.origin : (inventory ? inventory.origin : 'Bhilwara Hub');
    const destStr = shipment ? shipment.destination : (inventory ? inventory.destination : 'Ahmedabad Depot');

    const shipDetails = {
      lrNo: shipment ? shipment.shipmentId : (inventory ? inventory.lrNo : `LR-${v.vehicleNo}`),
      origin: originStr,
      destination: destStr,
      sender: shipment ? (typeof shipment.sender === 'object' ? shipment.sender.name : shipment.sender) : (inventory ? inventory.senderName : 'Aditya Spinners Ltd'),
      receiver: shipment ? (typeof shipment.receiver === 'object' ? shipment.receiver.name : shipment.receiver) : (inventory ? inventory.receiverName : 'Gujarat Textile Mills'),
      cargoType: inventory ? inventory.cargoName : (shipment?.items?.[0]?.description || 'Textile Goods'),
      packages: inventory ? inventory.packages : (shipment?.packages || 50),
      weight: `${inventory ? inventory.weight : (shipment?.weight || 2500)} kg`,
      value: `₹${inventory ? inventory.totalFreight : (shipment?.totalFreight || 45000)}`,
      challanNo: inventory?.challanData?.challanNo || `CHL-${v.vehicleNo}`
    };

    const history = [
      { title: "Vehicle Assigned", location: shipDetails.origin, time: "04 Sep 2025 - 09:30 AM", status: "completed" },
      { title: "Shipment Picked from Warehouse", location: shipDetails.origin, time: "04 Sep 2025 - 10:15 AM", status: "completed" },
      { title: "Reached Hub", location: "Lonavala Hub", time: "04 Sep 2025 - 12:45 PM", status: "completed" },
      { title: "In Transit", location: "On Route to " + shipDetails.destination, time: "04 Sep 2025 - 02:30 PM", status: finalStatus === 'delivered' ? 'completed' : 'active' },
      { title: "Out for Delivery", location: shipDetails.destination, time: finalStatus === 'delivered' ? "04 Sep 2025 - 06:00 PM" : "-", status: finalStatus === 'delivered' ? 'completed' : 'pending' },
      { title: "Delivered", location: shipDetails.destination, time: finalStatus === 'delivered' ? "04 Sep 2025 - 08:00 PM" : "-", status: finalStatus === 'delivered' ? 'completed' : 'pending' }
    ];

    results.push({
      _id: v._id,
      vehicleNo: v.vehicleNo,
      type: v.type || 'Truck',
      capacity: v.capacity || 25000,
      driverName,
      driverPhone,
      status: finalStatus,
      statusLabel: finalStatusLabel,
      finalStatus,
      currentLocation: loc,
      lastUpdate: lastUp,
      distance: "150 km",
      shipment: shipDetails,
      trackingHistory: history
    });
  }

  // 2. Process any Inventory items with Challan vehicles not yet in results
  for (const inv of dbInventory) {
    if (inv.challanData && inv.challanData.vehicleNumber) {
      const vNo = inv.challanData.vehicleNumber;
      if (!results.some(r => (r.vehicleNo || '').toLowerCase().replace(/[- ]/g, '') === (vNo || '').toLowerCase().replace(/[- ]/g, ''))) {
        const invStat = (inv.status || '').toLowerCase();
        const finalStatus = invStat === 'delivered' ? 'delivered' : 'in-transit';
        const finalStatusLabel = invStat === 'delivered' ? 'Delivered' : 'In Transit';

        results.push({
          _id: inv._id,
          vehicleNo: vNo,
          type: 'Container',
          capacity: inv.weight || 18000,
          driverName: inv.challanData.driverName || 'Ramesh Singh',
          driverPhone: inv.challanData.driverPhone || '9876512345',
          status: finalStatus,
          statusLabel: finalStatusLabel,
          finalStatus,
          currentLocation: { lat: 19.0760, lng: 72.8777, address: inv.challanData.fromLocation || 'Mumbai Hub' },
          lastUpdate: inv.updatedAt || new Date(),
          distance: "80 km",
          shipment: {
            lrNo: inv.lrNo || `LR-${vNo}`,
            origin: inv.origin || inv.challanData.fromLocation || 'Mumbai',
            destination: inv.destination || inv.challanData.toLocation || 'Pune',
            sender: inv.senderName || 'L&T Heavy Engg',
            receiver: inv.receiverName || 'Tata Motors',
            cargoType: inv.cargoName || 'Industrial Spares',
            packages: inv.packages || inv.challanData.packages || 12,
            weight: `${inv.weight || inv.challanData.weight || 1200} kg`,
            value: `₹${inv.totalFreight || 30000}`,
            challanNo: inv.challanData.challanNo || `CHL-${vNo}`
          },
          trackingHistory: [
            { title: "Vehicle Assigned", location: inv.origin || 'Mumbai', time: "04 Sep 2025 - 08:30 AM", status: "completed" },
            { title: "Shipment Picked from Warehouse", location: inv.origin || 'Mumbai', time: "04 Sep 2025 - 09:45 AM", status: "completed" },
            { title: "Reached Hub", location: "Panvel Hub", time: "04 Sep 2025 - 11:30 AM", status: "completed" },
            { title: "In Transit", location: "On Route to " + (inv.destination || 'Pune'), time: "04 Sep 2025 - 01:15 PM", status: "active" },
            { title: "Out for Delivery", location: inv.destination || 'Pune', time: "-", status: "pending" },
            { title: "Delivered", location: inv.destination || 'Pune', time: "-", status: "pending" }
          ]
        });
      }
    }
  }

  // 3. Merge Default/Dummy Vehicles to guarantee no empty states
  const defaults = getDefaultVehicles();
  for (const def of defaults) {
    if (!results.some(r => (r.vehicleNo || '').toLowerCase().replace(/[- ]/g, '') === (def.vehicleNo || '').toLowerCase().replace(/[- ]/g, ''))) {
      const normStatus = (def.status || 'idle').toLowerCase();
      let finalStatus = normStatus;
      if (normStatus === 'active') finalStatus = 'in-transit';
      results.push({ ...def, status: finalStatus, finalStatus });
    }
  }

  return results;
};

exports.getAllLocations = async (req, res) => {
  try {
    const data = await buildUnifiedTrackingData();
    return sendResponse(res, 200, true, 'All locations and fleet tracking fetched successfully', data);
  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};

exports.getVehicleLocation = async (req, res) => {
  try {
    const data = await buildUnifiedTrackingData();
    const vehicle = data.find(v => v._id.toString() === req.params.vehicleId || v.vehicleNo.toLowerCase() === req.params.vehicleId.toLowerCase());
    if (!vehicle) {
      return sendResponse(res, 404, false, 'No tracking data found for this vehicle');
    }
    return sendResponse(res, 200, true, 'Vehicle tracking fetched successfully', vehicle);
  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};

exports.updateLocation = async (req, res) => {
  try {
    const { vehicleId, lat, lng, address } = req.body;
    
    let tracking = await Tracking.findOne({ vehicle: vehicleId });
    
    if (tracking) {
      tracking.currentLocation = { lat, lng, address };
      tracking.lastUpdate = new Date();
      tracking.history.push({ lat, lng });
      if (tracking.history.length > 100) tracking.history.shift();
      await tracking.save();
    } else {
      tracking = await Tracking.create({
        vehicle: vehicleId,
        currentLocation: { lat, lng, address },
        history: [{ lat, lng }]
      });
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('location_updated', { vehicleId, lat, lng, address });
    }

    return sendResponse(res, 200, true, 'Location updated successfully', tracking);
  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};

