const Driver = require('../models/Driver');

// @route GET /api/drivers  (admin only)
exports.getDrivers = async (req, res, next) => {
  try {
    const drivers = await Driver.find({ schoolId: req.user.schoolId }).populate('busId');
    res.json(drivers);
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/drivers/:id  (admin only)
exports.updateDriver = async (req, res, next) => {
  try {
    const driver = await Driver.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!driver) return res.status(404).json({ message: 'Driver not found' });
    res.json(driver);
  } catch (err) {
    next(err);
  }
};

// @route DELETE /api/drivers/:id  (admin only)
exports.deleteDriver = async (req, res, next) => {
  try {
    await Driver.findByIdAndDelete(req.params.id);
    res.json({ message: 'Driver deleted' });
  } catch (err) {
    next(err);
  }
};

// @route PATCH /api/drivers/:id/trip  (driver only - start/end trip)
exports.setTripStatus = async (req, res, next) => {
  try {
    const { status } = req.body; // 'active' | 'off-duty'
    const driver = await Driver.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(driver);
  } catch (err) {
    next(err);
  }
};
