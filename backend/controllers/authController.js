const User = require('../models/User');
const Driver = require('../models/Driver');
const School = require('../models/School');
const generateToken = require('../utils/generateToken');

// @route POST /api/auth/signup
exports.signup = async (req, res, next) => {
  try {
    const { name, email, phone, password, role, schoolCode, licenseNo } = req.body;

    if (!name || !email || !phone || !password || !role) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Email already registered' });

    let schoolId;
    if (role !== 'parent') {
      const school = await School.findOne({ schoolCode });
      if (!school) return res.status(404).json({ message: 'Invalid school code' });
      schoolId = school._id;
    }

    const user = await User.create({ name, email, phone, password, role, schoolId });

    if (role === 'driver') {
      const driver = await Driver.create({
        userId: user._id,
        schoolId,
        name,
        phone,
        licenseNo: licenseNo || 'PENDING',
      });
      user.driverProfile = driver._id;
      await user.save();
    }

    const token = generateToken(user._id);
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;
    const user = await User.findOne({ email, role }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = generateToken(user._id);
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/auth/me
exports.getMe = async (req, res, next) => {
  res.json({ user: req.user });
};
