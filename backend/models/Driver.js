const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    licenseNo: { type: String, required: true },
    busId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus' },
    status: { type: String, enum: ['active', 'off-duty'], default: 'off-duty' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Driver', driverSchema);
