const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    grade: { type: String, required: true },
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    busId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus' },
    stopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Stop' },
    attendanceStatus: {
      type: String,
      enum: ['boarded', 'not-boarded', 'absent'],
      default: 'not-boarded',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Student', studentSchema);
