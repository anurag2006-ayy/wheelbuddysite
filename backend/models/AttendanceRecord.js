const mongoose = require('mongoose');

const attendanceRecordSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    busId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus', required: true },
    date: { type: Date, required: true, default: Date.now },
    boardedAt: { type: Date },
    alightedAt: { type: Date },
    status: {
      type: String,
      enum: ['boarded', 'not-boarded', 'absent'],
      required: true,
    },
  },
  { timestamps: true }
);

attendanceRecordSchema.index({ studentId: 1, date: 1 });

module.exports = mongoose.model('AttendanceRecord', attendanceRecordSchema);
