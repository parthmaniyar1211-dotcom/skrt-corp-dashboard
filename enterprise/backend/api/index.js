const app = require('../src/app');
const connectDB = require('../src/config/db');
const mongoose = require('mongoose');

// Store connection error for debug endpoint
let lastDbError = null;

// Attempt DB connection immediately on cold start
const dbReady = connectDB().catch(err => {
  lastDbError = err.message;
});

// Expose a debug endpoint to check real DB error
app.get('/api/debug', async (req, res) => {
  await dbReady;
  const state = mongoose.connection.readyState;
  const stateMap = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  res.json({
    dbState: stateMap[state] || 'unknown',
    lastError: lastDbError,
    mongoUri: process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 60) + '...' : 'NOT SET',
    nodeEnv: process.env.NODE_ENV
  });
});

module.exports = app;
