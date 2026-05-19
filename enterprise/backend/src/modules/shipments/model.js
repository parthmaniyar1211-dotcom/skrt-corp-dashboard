const mongoose = require('mongoose');

const shipmentSchema = new mongoose.Schema({
  shipmentId: {
    type: String,
    required: true,
    unique: true
  },
  sender: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String }
  },
  receiver: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String }
  },
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  packages: { type: Number, default: 1 },
  weight: { type: Number, required: true },
  rate: { type: Number, required: true },
  totalFreight: { type: Number, required: true },
  paymentMode: {
    type: String,
    enum: ['ToPay', 'Paid', 'TBB'],
    default: 'ToPay'
  },
  items: [{
    description: String,
    quantity: Number,
    unit: String
  }],
  status: {
    type: String,
    enum: ['booked', 'inventory', 'dispatched', 'in-transit', 'delivered', 'cancelled'],
    default: 'booked'
  },
  trackingHistory: [{
    status: String,
    location: String,
    timestamp: { type: Date, default: Date.now },
    description: String
  }],
  currentLocation: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }
  },
  assignedVehicle: {
    type: mongoose.Schema.ObjectId,
    ref: 'Vehicle'
  },
  assignedDriver: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for geo-tracking
shipmentSchema.index({ currentLocation: '2dsphere' });

module.exports = mongoose.model('Shipment', shipmentSchema);
