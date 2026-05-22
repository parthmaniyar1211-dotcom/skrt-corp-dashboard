const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load models
const Shipment = require('./src/modules/shipments/model');
const Vehicle  = require('./src/modules/vehicles/model');
const User     = require('./src/modules/auth/model');
const Invoice  = require('./src/modules/invoices/model');
const Inventory = require('./src/modules/inventory/model');

dotenv.config();

const seedData = async () => {
  try {
    // ── Connect ──────────────────────────────────────────────────────────────
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected for seeding...');

    // ── Clear database ───────────────────────────────────────────────────────
    await mongoose.connection.db.dropDatabase();
    console.log('🗑️  Cleared existing database and all indexes.');

    // ── Create Admin User ────────────────────────────────────────────────────
    // Pre-hash the password and bypass Mongoose middleware via collection.insertOne
    // to guarantee exactly ONE hash round (no double-hash risk).
    const plainPassword = 'password123';
    const salt          = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);

    const adminInsert = await User.collection.insertOne({
      name:      'Admin User',
      email:     'admin@ttc.com',
      phone:     '9999999999',
      password:  hashedPassword,
      role:      'admin',
      createdAt: new Date()
    });
    console.log('👤 Admin inserted, _id:', adminInsert.insertedId);

    // Verify the hash is correct immediately after insert
    const savedAdmin = await User.findOne({ email: 'admin@ttc.com' }).select('+password');
    if (!savedAdmin) throw new Error('Admin user not found after insert!');

    const passwordOk = await bcrypt.compare(plainPassword, savedAdmin.password);
    console.log('🔑 Password verification:', passwordOk ? '✅ PASS' : '❌ FAIL');
    if (!passwordOk) throw new Error('bcrypt verification failed — check hashing logic!');

    // ── Create Vehicles ──────────────────────────────────────────────────────
    // Valid type enum: 'Truck' | 'Trailer' | 'Container' | 'Van'
    const vehicles = await Vehicle.create([
      {
        vehicleNo: 'RJ-06-GB-2101',
        type:      'Truck',          // ← was '12-Wheeler', not a valid enum
        capacity:  25000,
        status:    'available'
      },
      {
        vehicleNo: 'RJ-06-GB-4421',
        type:      'Container',
        capacity:  18000,
        status:    'available'
      }
    ]);
    console.log(`🚛 Created ${vehicles.length} vehicles.`);

    // ── Create Shipments ─────────────────────────────────────────────────────
    // Shipment model requires: sender.phone, receiver, weight, rate,
    // totalFreight, createdBy
    const shipments = await Shipment.create([
      {
        consignmentNumber: 'SKRT-1001',
        toBranch:          'Ahmedabad',
        consignor: {
          gst:         '08AIMPG1878N1ZL',
          name:        'Aditya Textiles',
          phoneNumber: '9876543210',
          state:       'Rajasthan',
          city:        'Bhilwara'
        },
        consignee: {
          gst:         '24BBBBB2222B2Z2',
          name:        'Gujarat Fabrics',
          phoneNumber: '9123456780',
          state:       'Gujarat',
          city:        'Ahmedabad'
        },
        invoiceValue: 500000,
        description:  'Cotton Yarn Bales',
        quantity:     50,
        packageType:  'Bale',
        privateNumber: 'P-9874',
        actualWeight: 2500,
        chargedWeight: 2500,
        rateType:     'Kg',
        rate:         18,
        paymentMode:  'Paid',
        totalFreight: 45000,
        totalPayable: 45000,
        status:       'In Transit',
        outgoingStatus: 'In Transit',
        vehicleNumber: 'RJ-06-GB-2101',
        createdBy:    savedAdmin._id
      },
      {
        consignmentNumber: 'SKRT-1002',
        toBranch:          'Delhi',
        consignor: {
          gst:         '08AIMPG1878N1ZL',
          name:        'Global Logistics',
          phoneNumber: '9811122334',
          state:       'Rajasthan',
          city:        'Jaipur'
        },
        consignee: {
          gst:         '07CCCCC3333C3Z3',
          name:        'Delhi Depot',
          phoneNumber: '9711223344',
          state:       'Delhi',
          city:        'Delhi'
        },
        invoiceValue: 350000,
        description:  'Machine Parts',
        quantity:     15,
        packageType:  'Box',
        privateNumber: 'P-5521',
        actualWeight: 1800,
        chargedWeight: 1800,
        rateType:     'Kg',
        rate:         15,
        paymentMode:  'ToPay',
        totalFreight: 27000,
        totalPayable: 27000,
        status:       'Booked',
        outgoingStatus: 'Pending',
        createdBy:    savedAdmin._id
      }
    ]);
    console.log(`📦 Created ${shipments.length} shipments.`);

    // ── Create Invoices ──────────────────────────────────────────────────────
    await Invoice.create([
      {
        invoiceNo: 'INV-001',
        shipment:  shipments[0]._id,
        client:    { name: 'Aditya Textiles', email: 'aditya@textiles.com', phone: '9876543210' },
        amount:    45000,
        tax:       0,
        total:     45000,
        status:    'paid',
        paidDate:  new Date()
      }
    ]);
    console.log('🧾 Created 1 invoice.');

    // ── Create Inventory Records ─────────────────────────────────────────────
    const adminUser = await User.findOne({ email: 'admin@ttc.com' });
    await Inventory.create([
      {
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
        createdBy: adminUser ? adminUser._id : undefined
      },
      {
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
          dispatchDate: new Date(),
          packages: 12,
          weight: 1200,
          remarks: 'Urgent Delivery'
        },
        remarks: 'Fragile precision parts',
        createdBy: adminUser ? adminUser._id : undefined
      },
      {
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
        createdBy: adminUser ? adminUser._id : undefined
      }
    ]);
    console.log('📦 Created 3 inventory records.');

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
    // Surface Mongoose field-level validation errors
    if (error.errors) {
      Object.entries(error.errors).forEach(([field, err]) => {
        console.error(`   ↳ Field "${field}": ${err.message}`);
      });
    }
    process.exit(1);
  }
};

seedData();
