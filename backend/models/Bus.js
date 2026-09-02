const mongoose = require('mongoose');

const busSchema = new mongoose.Schema(
  {
    busNumber: { type: String, required: true, unique: true },
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
    routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route' },
    currentLocation: {
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 },
      timestamp: { type: Date },
    },
    status: {
      type: String,
      enum: ['on-time', 'delayed', 'idle', 'offline'],
      default: 'idle',
    },
    speed: { type: Number, default: 0 }, // km/h
    capacity: { type: Number, required: true },
    studentsOnboard: { type: Number, default: 0 },
    harshBrakingEventsToday: { type: Number, default: 0 },
    avgSpeedToday: { type: Number, default: 0 },
    delaysToday: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Bus', busSchema);
