const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Request Logger
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.url}`);
  next();
});

// Security Middleware
app.use(helmet());

// CORS Configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://skrt-corp-dashboard.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    // Allow any skrt-corp-dashboard vercel preview/production URL
    if (origin.includes('skrt-corp-dashboard') && origin.includes('vercel.app')) {
      return callback(null, true);
    }
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(express.json());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000 // limit each IP to 1000 requests per windowMs (relaxed for dev)
});
app.use('/api/', limiter);

// Basic Route
app.get('/', (req, res) => {
  res.json({ message: 'SKRT Logistics API is running...' });
});

// API Root - shows available endpoints
app.get('/api', (req, res) => {
  res.json({
    name: 'SKRT Corp Logistics API',
    version: '2.0.0',
    status: 'running',
    endpoints: [
      '/api/health', '/api/auth', '/api/inventory', '/api/shipments',
      '/api/vehicles', '/api/drivers', '/api/clients', '/api/expenses',
      '/api/invoices', '/api/analytics', '/api/tracking'
    ]
  });
});

// Health + Debug routes BEFORE mock middleware so they are never intercepted
app.get('/api/health', (req, res) => {
  const mongoose = require('mongoose');
  const dbState = mongoose.connection.readyState;
  const dbStateMap = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  res.json({ 
    status: 'ok', 
    database: dbStateMap[dbState] || 'unknown',
    mode: dbState === 1 ? 'live' : 'mock',
    env: process.env.NODE_ENV || 'unknown',
    mongoUri: process.env.MONGODB_URI ? process.env.MONGODB_URI.replace(/:([^@]+)@/, ':***@').substring(0, 80) + '...' : 'NOT SET',
    timestamp: new Date().toISOString() 
  });
});

app.get('/api/debug-db', async (req, res) => {
  const mongoose = require('mongoose');
  const state = mongoose.connection.readyState;
  const stateMap = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  // Try a fresh connect attempt to get real error
  let testError = null;
  if (state !== 1) {
    try {
      await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000, bufferCommands: false });
    } catch (e) {
      testError = e.message;
    }
  }
  res.json({
    dbState: stateMap[mongoose.connection.readyState] || 'unknown',
    error: testError,
    mongoUri: process.env.MONGODB_URI ? process.env.MONGODB_URI.replace(/:([^@]+)@/, ':***@') : 'NOT SET'
  });
});

// Database Disconnected Mock Interceptor
const mockDbMiddleware = require('./middleware/mockDbMiddleware');
app.use('/api', mockDbMiddleware);

// Load Modules
app.use('/api/auth', require('./modules/auth/routes'));
app.use('/api/inventory', require('./modules/inventory/routes'));
app.use('/api/shipments', require('./modules/shipments/routes'));
app.use('/api/contacts', require('./modules/contacts/routes'));
app.use('/api/vehicles', require('./modules/vehicles/routes'));
app.use('/api/drivers', require('./modules/drivers/routes'));
app.use('/api/invoices', require('./modules/invoices/routes'));
app.use('/api/analytics', require('./modules/analytics/routes'));
app.use('/api/clients', require('./modules/clients/routes'));
app.use('/api/expenses', require('./modules/expenses/routes'));
app.use('/api/tracking', require('./modules/tracking/routes'));
app.use('/api/notifications', require('./modules/notifications/routes'));
app.use('/api/cash-memo', require('./modules/cash-memo/routes'));
app.use('/api/entry', require('./modules/entry/routes'));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(`❌ Error: ${err.message}`);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;

// Note: app.listen moved to server.js to support Socket.io

module.exports = app;
