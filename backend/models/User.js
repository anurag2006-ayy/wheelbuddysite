const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ['parent', 'driver', 'admin'], required: true },
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
    // role-specific optional links
    driverProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
    studentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }], // for parents
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);
