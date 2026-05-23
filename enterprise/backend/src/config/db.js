const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Use global connection caching for Vercel serverless (prevents multiple connections)
let isConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.warn('⚠️ MONGODB_URI is not defined. Running in database-disconnected mode.');
    return;
  }

  if (isConnected && mongoose.connection.readyState === 1) {
    console.log('✅ Using existing MongoDB connection');
    return;
  }

  try {
    await mongoose.connect(uri, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 20000,
      maxPoolSize: 5,
    });
    isConnected = true;
    console.log(`🚀 MongoDB Connected: ${mongoose.connection.host}`);
  } catch (error) {
    isConnected = false;
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.log('⚠️ Server running without database connection. Falling back to mock data.');
  }
};

module.exports = connectDB;
