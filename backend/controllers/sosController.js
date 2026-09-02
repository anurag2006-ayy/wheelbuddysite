const SOSAlert = require('../models/SOSAlert');
const Student = require('../models/Student');
const { pushNotification } = require('./notificationController');

// @route POST /api/sos  (driver only) - triggers emergency alert
exports.triggerSOS = async (req, res, next) => {
  try {
    const { busId, driverId, lat, lng } = req.body;
    const alert = await SOSAlert.create({
      busId,
      driverId,
      location: { lat, lng },
      status: 'active',
    });

    const io = req.app.get('io');
    if (io) io.to(`school:${req.user.schoolId}`).emit('sosAlert', alert);

    // notify all parents whose children are on this bus
    const students = await Student.find({ busId });
    await Promise.all(
      students.map((s) =>
        pushNotification(io, {
          userId: s.parentId,
          type: 'sos',
          message: `Emergency alert on your child's bus. School staff have been notified.`,
        })
      )
    );

    res.status(201).json(alert);
  } catch (err) {
    next(err);
  }
};

// @route PATCH /api/sos/:id/resolve  (admin only)
exports.resolveSOS = async (req, res, next) => {
  try {
    const alert = await SOSAlert.findByIdAndUpdate(
      req.params.id,
      { status: 'resolved', resolvedAt: new Date() },
      { new: true }
    );
    res.json(alert);
  } catch (err) {
    next(err);
  }
};

// @route GET /api/sos  (admin only)
exports.getActiveAlerts = async (req, res, next) => {
  try {
    const alerts = await SOSAlert.find({ status: 'active' }).populate('busId driverId');
    res.json(alerts);
  } catch (err) {
    next(err);
  }
};
