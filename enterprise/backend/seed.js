const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load models
const Shipment = require('./src/modules/shipments/model');
const Vehicle  = require('./src/modules/vehicles/model');
const User     = require('./src/modules/auth/model');
const Invoice  = require('./src/modules/invoices/model');
const Inventory = require('./src/modules/inventory/model');
const Client   = require('./src/modules/clients/model');
const Expense  = require('./src/modules/expenses/model');

dotenv.config();

const clientsList = [
  { name: 'Aditya Textiles', email: 'aditya@textiles.com', phone: '9876543210', address: 'Bhilwara', gstin: '08AIMPG1878N1ZL' },
  { name: 'Gujarat Fabrics', email: 'gujarat@fabrics.com', phone: '9123456780', address: 'Ahmedabad', gstin: '24BBBBB2222B2Z2' },
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
  { name: 'Ahmedabad Chemicals', email: 'chem@ahmedabad.com', phone: '9966778899', address: 'Ahmedabad', gstin: '24PPPPP6666P6Z6' }
];

const cities = ['Ahmedabad', 'Surat', 'Mumbai', 'Pune', 'Delhi', 'Jaipur', 'Indore', 'Rajkot', 'Bhilwara'];

const cargoTypes = [
  'Cotton Bales', 'Industrial Machinery', 'Textile Cartons', 'Steel Pipes', 'Electronics', 
  'FMCG Goods', 'Ceramic Tiles', 'Polyester Yarn', 'Copper Wires', 'Chemical Drums', 
  'Auto Parts', 'Garment Boxes', 'Plastic Raw Material', 'Paper Rolls', 'Agro Products'
];

const vehicleTypes = ['Truck', 'Container', 'Trailer', 'Van'];

const driverNames = [
  'Ramesh Singh', 'Suresh Kumar', 'Manoj Yadav', 'Rajesh Sharma', 'Amit Patel', 
  'Vijay Rathore', 'Dinesh Choudhary', 'Sunil Verma', 'Sanjay Mishra', 'Anil Gupta', 
  'Vikram Jhala', 'Satish Nehra', 'Mahendra Singh', 'Harpreet Singh', 'Gurpreet Singh', 
  'Baldev Raj'
];

const seedData = async () => {
  try {
    // ── Connect ──────────────────────────────────────────────────────────────
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI env var is not defined!');
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected for seeding...');

    // ── Clear database ───────────────────────────────────────────────────────
    await mongoose.connection.db.dropDatabase();
    console.log('🗑️ Clear existing database and all indexes.');

    // ── Create Admin User ────────────────────────────────────────────────────
    const plainPassword = 'password123';
    const salt          = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);

    const admin = await User.create({
      name:      'Admin User',
      email:     'admin@ttc.com',
      phone:     '9999999999',
      password:  hashedPassword,
      role:      'admin'
    });
    console.log('👤 Admin inserted, _id:', admin._id);

    // ── Create Clients ───────────────────────────────────────────────────────
    const clients = await Client.create(
      clientsList.map((c, i) => ({
        name: c.name,
        email: c.email,
        phone: c.phone,
        address: c.address,
        gstin: c.gstin,
        status: 'active',
        createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      }))
    );
    console.log(`🏢 Created ${clients.length} clients.`);

    // ── Create Vehicles ──────────────────────────────────────────────────────
    const vehicles = await Vehicle.create(
      Array.from({ length: 16 }, (_, i) => {
        const states = ['GJ', 'MH', 'RJ', 'DL', 'MP'];
        const state = states[i % states.length];
        const code = String((i * 3 + 1) % 90).padStart(2, '0');
        const series = 'AB';
        const num = String(1000 + i).slice(1);
        const vehicleNo = `${state}-${code}-${series}-${num}`;
        const type = vehicleTypes[i % vehicleTypes.length];
        const capacities = { Truck: 25000, Container: 18000, Trailer: 35000, Van: 5000 };
        return {
          vehicleNo,
          type,
          capacity: capacities[type],
          status: i % 5 === 0 ? 'maintenance' : i % 3 === 0 ? 'on-trip' : 'available',
          model: `${type === 'Truck' ? 'Tata' : type === 'Container' ? 'Mahindra' : type === 'Trailer' ? 'Ashok Leyland' : 'Eicher'} ${2020 + (i % 6)}`,
          owner: { name: 'SKRT Logistics Ltd', phone: '9898989898' },
          lastServiceDate: new Date(Date.now() - (i * 5 + 10) * 24 * 60 * 60 * 1000),
          insuranceExpiry: new Date(Date.now() + (i * 15 + 30) * 24 * 60 * 60 * 1000)
        };
      })
    );
    console.log(`🚛 Created ${vehicles.length} vehicles.`);

    // ── Create Drivers (Users with role = driver) ────────────────────────────
    const drivers = await User.create(
      driverNames.map((name, i) => ({
        name,
        phone: `98765${String(10000 + i).slice(1)}`,
        email: `${name.toLowerCase().replace(' ', '.')}@skrt.com`,
        password: hashedPassword, // Uses same pre-hashed password
        role: 'driver',
        experience: 3 + (i % 15),
        rating: Number((4.0 + (i % 10) * 0.1).toFixed(1))
      }))
    );
    console.log(`👷 Created ${drivers.length} drivers.`);

    // ── Create Inventory Records ─────────────────────────────────────────────
    const inventory = await Inventory.create(
      Array.from({ length: 30 }, (_, i) => {
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
            dispatchDate: new Date(Date.now() - (i % 5) * 24 * 60 * 60 * 1000),
            packages,
            weight,
            remarks: 'Direct Warehouse Dispatch'
          };
        }

        return {
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
          createdBy: admin._id,
          createdAt: new Date(Date.now() - i * 12 * 60 * 60 * 1000)
        };
      })
    );
    console.log(`📦 Created ${inventory.length} inventory records.`);

    // ── Create Shipments ─────────────────────────────────────────────────────
    const shipments = await Shipment.create(
      Array.from({ length: 30 }, (_, i) => {
        const sender = clients[i % clients.length];
        const receiver = clients[(i + 5) % clients.length];
        const origin = cities[i % cities.length];
        const destination = cities[(i + 3) % cities.length];
        const cargoName = cargoTypes[i % cargoTypes.length];
        const qty = 20 + (i * 3);
        const weight = qty * 45;
        const rate = 12 + (i % 12);
        const totalFreight = weight * rate;
        const assignedVehicle = vehicles[i % vehicles.length];
        
        return {
          consignmentNumber: `SKRT-${1000 + i}`,
          toBranch: destination,
          consignor: {
            gst: sender.gstin || '08AIMPG1878N1ZL',
            name: sender.name,
            phoneNumber: sender.phone,
            state: origin === 'Bhilwara' || origin === 'Jaipur' ? 'Rajasthan' : origin === 'Ahmedabad' || origin === 'Surat' || origin === 'Rajkot' ? 'Gujarat' : origin === 'Mumbai' || origin === 'Pune' ? 'Maharashtra' : origin === 'Delhi' ? 'Delhi' : 'Madhya Pradesh',
            city: origin
          },
          consignee: {
            gst: receiver.gstin || '24BBBBB2222B2Z2',
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
          createdBy: admin._id,
          createdAt: new Date(Date.now() - i * 18 * 60 * 60 * 1000)
        };
      })
    );
    console.log(`🚚 Created ${shipments.length} shipments.`);

    // ── Create Invoices ──────────────────────────────────────────────────────
    const invoices = await Invoice.create(
      shipments.map((s, i) => {
        const tax = Math.round(s.totalFreight * 0.18);
        const total = s.totalFreight + tax;
        return {
          invoiceNo: `INV-${String(100 + i)}`,
          shipment: s._id,
          client: { name: s.consignor.name, email: `${s.consignor.name.toLowerCase().replace(/ /g, '')}@gmail.com`, phone: s.consignor.phoneNumber },
          amount: s.totalFreight,
          tax,
          total,
          status: i % 4 === 0 ? 'cancelled' : i % 2 === 0 ? 'paid' : 'unpaid',
          dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
          paidDate: i % 2 === 0 ? new Date(Date.now() - (i % 5) * 24 * 60 * 60 * 1000) : null,
          createdAt: s.createdAt
        };
      })
    );
    console.log(`🧾 Created ${invoices.length} invoices.`);

    // ── Create Expenses ──────────────────────────────────────────────────────
    const expenses = await Expense.create(
      Array.from({ length: 30 }, (_, i) => {
        const assignedVehicle = vehicles[i % vehicles.length];
        const category = ['Fuel', 'Maintenance', 'Toll', 'Driver Payment', 'Other'][i % 5];
        const amounts = { Fuel: 12000, Maintenance: 8500, Toll: 1800, 'Driver Payment': 5000, Other: 1500 };
        const amount = amounts[category] + (i * 100);
        return {
          category,
          amount,
          description: `${category} for ${assignedVehicle.vehicleNo} at toll/station #${i + 1}`,
          date: new Date(Date.now() - (i * 8) * 60 * 60 * 1000),
          vehicle: assignedVehicle._id,
          status: i % 4 === 0 ? 'pending' : 'paid',
          createdBy: admin._id
        };
      })
    );
    console.log(`💸 Created ${expenses.length} expenses.`);

    // ── Summary ──────────────────────────────────────────────────────────────
    console.log('\n✅ Database seeded successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('   Admin Login:');
    console.log('   Email   : admin@ttc.com');
    console.log('   Password: password123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seeding error:', error.message);
    if (error.errors) {
      Object.entries(error.errors).forEach(([field, err]) => {
        console.error(`   ↳ Field "${field}": ${err.message}`);
      });
    }
    process.exit(1);
  }
};

seedData();
