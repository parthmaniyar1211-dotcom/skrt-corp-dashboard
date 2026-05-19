/**
 * TTC Logistics Backend
 * Express + Session Auth + LowDB (JSON file database)
 */

const express = require('express');
const session = require('express-session');
const bcrypt  = require('bcryptjs');
const cors    = require('cors');
const path    = require('path');
const fs      = require('fs');
const { v4: uuidv4 } = require('uuid');
const low     = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

// ─── DB Setup ────────────────────────────────────────────────────────────────
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

const db = low(new FileSync(path.join(dataDir, 'ttc.json')));

db.defaults({
  users: [],
  consignments: [],
  lorries: [],
  trips: [],
  challans: [],
  incoming_trips: []
}).write();

// Seed default admin user if none exists
if (db.get('users').size().value() === 0) {
  const hash = bcrypt.hashSync('ttc@1234', 10);
  db.get('users').push({
    id: uuidv4(),
    username: 'ttc_bhilwara',
    password: hash,
    name: 'TTC Bhilwara',
    role: 'admin',
    created_at: new Date().toISOString()
  }).write();
  console.log('✅  Default user created: ttc_bhilwara / ttc@1234');
}

// ─── App Setup ────────────────────────────────────────────────────────────────
const app = express();

app.use(cors({
  origin: true,          // allow all origins (update in production)
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend files
app.use(express.static(path.join(__dirname, 'public')));

// ─── Session ─────────────────────────────────────────────────────────────────
app.use(session({
  secret: 'ttc-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,       // set true if using HTTPS
    httpOnly: true,
    maxAge: 8 * 60 * 60 * 1000   // 8 hours
  }
}));

// ─── Auth Middleware ──────────────────────────────────────────────────────────
function requireAuth(req, res, next) {
  if (req.session && req.session.userId) return next();
  return res.status(401).json({ error: 'Not authenticated. Please login.' });
}

// ─── Helper: generate CN number ──────────────────────────────────────────────
function nextCnNo() {
  const count = db.get('consignments').size().value();
  return 'TTC' + String(count + 1001).padStart(6, '0');
}

// ═══════════════════════════════════════════════════════════════════════════════
//  AUTH ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

// POST /api/auth/login
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ error: 'Username and password are required.' });

  const user = db.get('users').find({ username: username.trim() }).value();
  if (!user)
    return res.status(401).json({ error: 'Invalid username or password.' });

  const valid = bcrypt.compareSync(password, user.password);
  if (!valid)
    return res.status(401).json({ error: 'Invalid username or password.' });

  // Save session
  req.session.userId   = user.id;
  req.session.username = user.username;
  req.session.name     = user.name;
  req.session.role     = user.role;
  req.session.loginAt  = new Date().toISOString();

  // Update last_login in DB
  db.get('users').find({ id: user.id }).assign({ last_login: new Date().toISOString() }).write();

  res.json({
    success: true,
    user: { username: user.username, name: user.name, role: user.role }
  });
});

// POST /api/auth/logout
app.post('/api/auth/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ error: 'Logout failed.' });
    res.clearCookie('connect.sid');
    res.json({ success: true });
  });
});

// GET /api/auth/me  — check current session
app.get('/api/auth/me', requireAuth, (req, res) => {
  const user = db.get('users').find({ id: req.session.userId }).value();
  if (!user) return res.status(401).json({ error: 'Session invalid.' });
  res.json({
    username: user.username,
    name: user.name,
    role: user.role,
    last_login: user.last_login || null
  });
});

// POST /api/auth/change-password
app.post('/api/auth/change-password', requireAuth, (req, res) => {
  const { current_password, new_password } = req.body;
  if (!current_password || !new_password)
    return res.status(400).json({ error: 'Both fields are required.' });
  if (new_password.length < 6)
    return res.status(400).json({ error: 'New password must be at least 6 characters.' });

  const user = db.get('users').find({ id: req.session.userId }).value();
  if (!bcrypt.compareSync(current_password, user.password))
    return res.status(401).json({ error: 'Current password is incorrect.' });

  const hash = bcrypt.hashSync(new_password, 10);
  db.get('users').find({ id: req.session.userId }).assign({ password: hash }).write();
  res.json({ success: true, message: 'Password changed successfully.' });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  DASHBOARD STATS
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/dashboard/stats
app.get('/api/dashboard/stats', requireAuth, (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const thisMonth = new Date().toISOString().slice(0, 7);

  const all = db.get('consignments').value();
  const inventory = all.filter(c => ['booked', 'inventory'].includes(c.status));

  const monthlyBookings = all.filter(c => c.created_at && c.created_at.startsWith(thisMonth));
  const todayBookings   = all.filter(c => c.created_at && c.created_at.startsWith(today));
  const monthlyTrips    = db.get('trips').filter(t => t.created_at && t.created_at.startsWith(thisMonth)).value();

  res.json({
    inventory: {
      consignments: inventory.length,
      packages: inventory.reduce((s, c) => s + (c.packages || 0), 0),
      weight: parseFloat(inventory.reduce((s, c) => s + (c.weight || 0), 0).toFixed(2))
    },
    monthly: {
      bookings: monthlyBookings.length,
      freight: parseFloat(monthlyBookings.reduce((s, c) => s + (c.freight || 0), 0).toFixed(2)),
      trips: monthlyTrips.length
    },
    today: {
      bookings: todayBookings.length,
      freight: parseFloat(todayBookings.reduce((s, c) => s + (c.freight || 0), 0).toFixed(2)),
      weight: parseFloat(todayBookings.reduce((s, c) => s + (c.weight || 0), 0).toFixed(2))
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  CONSIGNMENTS
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/consignments — list all (optional ?status=booked&q=TTC001)
app.get('/api/consignments', requireAuth, (req, res) => {
  let list = db.get('consignments').value();
  if (req.query.status) list = list.filter(c => c.status === req.query.status);
  if (req.query.q)      list = list.filter(c => c.cn_no.toLowerCase().includes(req.query.q.toLowerCase()));
  res.json(list);
});

// GET /api/consignments/:cnNo — single consignment
app.get('/api/consignments/:cnNo', requireAuth, (req, res) => {
  const c = db.get('consignments').find(c =>
    c.cn_no.toLowerCase() === req.params.cnNo.toLowerCase()
  ).value();
  if (!c) return res.status(404).json({ error: 'Consignment not found.' });
  res.json(c);
});

// POST /api/consignments — create new
app.post('/api/consignments', requireAuth, (req, res) => {
  const { sender_name, receiver_name, sender_phone, receiver_phone,
          origin, destination, packages, weight, rate, payment_mode, remarks } = req.body;

  if (!sender_name || !receiver_name || !origin || !destination)
    return res.status(400).json({ error: 'sender_name, receiver_name, origin, destination are required.' });

  const w = parseFloat(weight) || 0;
  const r = parseFloat(rate) || 0;

  const consignment = {
    id:            uuidv4(),
    cn_no:         nextCnNo(),
    sender_name:   sender_name.trim(),
    receiver_name: receiver_name.trim(),
    sender_phone:  (sender_phone || '').trim(),
    receiver_phone:(receiver_phone || '').trim(),
    origin:        origin.trim(),
    destination:   destination.trim(),
    packages:      parseInt(packages) || 1,
    weight:        w,
    rate:          r,
    freight:       parseFloat((w * r).toFixed(2)),
    payment_mode:  payment_mode || 'ToPay',
    remarks:       (remarks || '').trim(),
    status:        'booked',
    created_by:    req.session.username,
    created_at:    new Date().toISOString(),
    updated_at:    new Date().toISOString()
  };

  db.get('consignments').push(consignment).write();
  res.status(201).json({ success: true, consignment });
});

// PATCH /api/consignments/:cnNo/status — update status
app.patch('/api/consignments/:cnNo/status', requireAuth, (req, res) => {
  const { status } = req.body;
  const allowed = ['booked', 'inventory', 'dispatched', 'in-transit', 'delivered', 'cancelled'];
  if (!allowed.includes(status))
    return res.status(400).json({ error: `Status must be one of: ${allowed.join(', ')}` });

  const c = db.get('consignments').find(c => c.cn_no === req.params.cnNo.toUpperCase());
  if (!c.value()) return res.status(404).json({ error: 'Consignment not found.' });

  c.assign({ status, updated_at: new Date().toISOString() }).write();
  res.json({ success: true, consignment: c.value() });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  LORRIES
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/lorries
app.get('/api/lorries', requireAuth, (req, res) => {
  res.json(db.get('lorries').value());
});

// POST /api/lorries — add lorry
app.post('/api/lorries', requireAuth, (req, res) => {
  const { vehicle_no, vehicle_type, owner_name, owner_phone, driver_name, driver_phone, capacity_kg } = req.body;
  if (!vehicle_no)
    return res.status(400).json({ error: 'vehicle_no is required.' });

  const exists = db.get('lorries').find(l => l.vehicle_no.toUpperCase() === vehicle_no.toUpperCase()).value();
  if (exists) return res.status(409).json({ error: 'Vehicle number already exists.' });

  const lorry = {
    id:            uuidv4(),
    vehicle_no:    vehicle_no.toUpperCase().trim(),
    vehicle_type:  vehicle_type || 'Truck',
    owner_name:    (owner_name || '').trim(),
    owner_phone:   (owner_phone || '').trim(),
    driver_name:   (driver_name || '').trim(),
    driver_phone:  (driver_phone || '').trim(),
    capacity_kg:   parseFloat(capacity_kg) || 0,
    status:        'available',
    created_at:    new Date().toISOString()
  };

  db.get('lorries').push(lorry).write();
  res.status(201).json({ success: true, lorry });
});

// DELETE /api/lorries/:id
app.delete('/api/lorries/:id', requireAuth, (req, res) => {
  const exists = db.get('lorries').find({ id: req.params.id }).value();
  if (!exists) return res.status(404).json({ error: 'Lorry not found.' });
  db.get('lorries').remove({ id: req.params.id }).write();
  res.json({ success: true });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  TRIPS (Outgoing)
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/trips
app.get('/api/trips', requireAuth, (req, res) => {
  res.json(db.get('trips').value());
});

// POST /api/trips — create outgoing trip
app.post('/api/trips', requireAuth, (req, res) => {
  const { vehicle_no, driver_name, destination, consignment_ids, departure_date, remarks } = req.body;
  if (!vehicle_no || !destination)
    return res.status(400).json({ error: 'vehicle_no and destination are required.' });

  const cnIds = Array.isArray(consignment_ids) ? consignment_ids : [];

  const trip = {
    id:              uuidv4(),
    trip_no:         'TRIP' + String(db.get('trips').size().value() + 1001).padStart(4, '0'),
    vehicle_no:      vehicle_no.toUpperCase().trim(),
    driver_name:     (driver_name || '').trim(),
    destination:     destination.trim(),
    consignment_ids: cnIds,
    departure_date:  departure_date || new Date().toISOString().slice(0, 10),
    remarks:         (remarks || '').trim(),
    status:          'scheduled',
    created_by:      req.session.username,
    created_at:      new Date().toISOString()
  };

  db.get('trips').push(trip).write();

  // Mark linked consignments as dispatched
  cnIds.forEach(cnNo => {
    db.get('consignments').find({ cn_no: cnNo })
      .assign({ status: 'dispatched', updated_at: new Date().toISOString() }).write();
  });

  res.status(201).json({ success: true, trip });
});

// PATCH /api/trips/:id/status
app.patch('/api/trips/:id/status', requireAuth, (req, res) => {
  const { status } = req.body;
  const allowed = ['scheduled', 'in-transit', 'arrived', 'completed'];
  if (!allowed.includes(status))
    return res.status(400).json({ error: `Status must be one of: ${allowed.join(', ')}` });

  const t = db.get('trips').find({ id: req.params.id });
  if (!t.value()) return res.status(404).json({ error: 'Trip not found.' });

  t.assign({ status, updated_at: new Date().toISOString() }).write();
  res.json({ success: true, trip: t.value() });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  CHALLANS
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/challans
app.get('/api/challans', requireAuth, (req, res) => {
  res.json(db.get('challans').value());
});

// POST /api/challans/by-id — create challan by CN numbers
app.post('/api/challans/by-id', requireAuth, (req, res) => {
  const { vehicle_no, consignment_nos, destination } = req.body;
  if (!vehicle_no || !Array.isArray(consignment_nos) || !consignment_nos.length)
    return res.status(400).json({ error: 'vehicle_no and consignment_nos[] are required.' });

  const found = consignment_nos.map(cn => db.get('consignments').find({ cn_no: cn.toUpperCase() }).value()).filter(Boolean);
  if (!found.length) return res.status(404).json({ error: 'No valid consignments found.' });

  const challan = {
    id:               uuidv4(),
    challan_no:       'CH' + String(db.get('challans').size().value() + 1001).padStart(5, '0'),
    vehicle_no:       vehicle_no.toUpperCase().trim(),
    destination:      (destination || '').trim(),
    consignment_nos:  found.map(c => c.cn_no),
    total_packages:   found.reduce((s, c) => s + (c.packages || 0), 0),
    total_weight:     parseFloat(found.reduce((s, c) => s + (c.weight || 0), 0).toFixed(2)),
    total_freight:    parseFloat(found.reduce((s, c) => s + (c.freight || 0), 0).toFixed(2)),
    status:           'created',
    created_by:       req.session.username,
    created_at:       new Date().toISOString()
  };

  db.get('challans').push(challan).write();
  res.status(201).json({ success: true, challan });
});

// POST /api/challans/by-filter — create challan by destination filter
app.post('/api/challans/by-filter', requireAuth, (req, res) => {
  const { vehicle_no, destination, status_filter } = req.body;
  if (!vehicle_no || !destination)
    return res.status(400).json({ error: 'vehicle_no and destination are required.' });

  let filtered = db.get('consignments').filter(c =>
    c.destination.toLowerCase().includes(destination.toLowerCase())
  ).value();
  if (status_filter) filtered = filtered.filter(c => c.status === status_filter);
  if (!filtered.length) return res.status(404).json({ error: 'No consignments match the filter.' });

  const challan = {
    id:               uuidv4(),
    challan_no:       'CH' + String(db.get('challans').size().value() + 1001).padStart(5, '0'),
    vehicle_no:       vehicle_no.toUpperCase().trim(),
    destination:      destination.trim(),
    consignment_nos:  filtered.map(c => c.cn_no),
    total_packages:   filtered.reduce((s, c) => s + (c.packages || 0), 0),
    total_weight:     parseFloat(filtered.reduce((s, c) => s + (c.weight || 0), 0).toFixed(2)),
    total_freight:    parseFloat(filtered.reduce((s, c) => s + (c.freight || 0), 0).toFixed(2)),
    status:           'created',
    created_by:       req.session.username,
    created_at:       new Date().toISOString()
  };

  db.get('challans').push(challan).write();
  res.status(201).json({ success: true, challan });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  INCOMING TRIPS
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/incoming-trips
app.get('/api/incoming-trips', requireAuth, (req, res) => {
  res.json(db.get('incoming_trips').value());
});

// POST /api/incoming-trips
app.post('/api/incoming-trips', requireAuth, (req, res) => {
  const { vehicle_no, driver_name, origin, arrival_date, remarks } = req.body;
  if (!vehicle_no || !origin)
    return res.status(400).json({ error: 'vehicle_no and origin are required.' });

  const trip = {
    id:            uuidv4(),
    trip_no:       'INC' + String(db.get('incoming_trips').size().value() + 1001).padStart(4, '0'),
    vehicle_no:    vehicle_no.toUpperCase().trim(),
    driver_name:   (driver_name || '').trim(),
    origin:        origin.trim(),
    arrival_date:  arrival_date || new Date().toISOString().slice(0, 10),
    remarks:       (remarks || '').trim(),
    status:        'expected',
    created_by:    req.session.username,
    created_at:    new Date().toISOString()
  };

  db.get('incoming_trips').push(trip).write();
  res.status(201).json({ success: true, trip });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  USER MANAGEMENT (admin only)
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/users
app.get('/api/users', requireAuth, (req, res) => {
  if (req.session.role !== 'admin')
    return res.status(403).json({ error: 'Admin access required.' });
  const users = db.get('users').value().map(u => ({ ...u, password: undefined }));
  res.json(users);
});

// POST /api/users — create user (admin only)
app.post('/api/users', requireAuth, (req, res) => {
  if (req.session.role !== 'admin')
    return res.status(403).json({ error: 'Admin access required.' });

  const { username, password, name, role } = req.body;
  if (!username || !password || !name)
    return res.status(400).json({ error: 'username, password, name are required.' });

  const exists = db.get('users').find({ username: username.trim() }).value();
  if (exists) return res.status(409).json({ error: 'Username already exists.' });

  const user = {
    id:         uuidv4(),
    username:   username.trim(),
    password:   bcrypt.hashSync(password, 10),
    name:       name.trim(),
    role:       role || 'operator',
    created_at: new Date().toISOString()
  };

  db.get('users').push(user).write();
  res.status(201).json({ success: true, user: { ...user, password: undefined } });
});

// DELETE /api/users/:id
app.delete('/api/users/:id', requireAuth, (req, res) => {
  if (req.session.role !== 'admin')
    return res.status(403).json({ error: 'Admin access required.' });
  if (req.session.userId === req.params.id)
    return res.status(400).json({ error: 'Cannot delete your own account.' });

  const exists = db.get('users').find({ id: req.params.id }).value();
  if (!exists) return res.status(404).json({ error: 'User not found.' });
  db.get('users').remove({ id: req.params.id }).write();
  res.json({ success: true });
});

// ─── Catch-all: serve frontend ────────────────────────────────────────────────
app.get('/{*path}', (req, res) => {
  const indexPath = path.join(__dirname, 'public', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.json({ message: 'TTC Backend is running. Place your frontend in /public/.' });
  }
});

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚚  TTC Backend running on http://localhost:${PORT}`);
  console.log(`📦  Database: ${path.join(dataDir, 'ttc.json')}`);
  console.log(`👤  Default login: ttc_bhilwara / ttc@1234\n`);
});
