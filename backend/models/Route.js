const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    stops: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Stop' }],
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    distanceKm: { type: Number },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Route', routeSchema);
