const Bus = require('../models/Bus');

// @route GET /api/buses  (admin: all buses in school; parent: filter by ?busNumber=)
exports.getBuses = async (req, res, next) => {
  try {
    const filter = {};
    if (req.user.role !== 'admin') filter.schoolId = req.user.schoolId;
    else filter.schoolId = req.user.schoolId;
    if (req.query.busNumber) filter.busNumber = req.query.busNumber;

    const buses = await Bus.find(filter).populate('driverId routeId');
    res.json(buses);
  } catch (err) {
    next(err);
  }
};

// @route GET /api/buses/:id
exports.getBus = async (req, res, next) => {
  try {
    const bus = await Bus.findById(req.params.id).populate('driverId routeId');
    if (!bus) return res.status(404).json({ message: 'Bus not found' });
    res.json(bus);
  } catch (err) {
    next(err);
  }
};

// @route POST /api/buses  (admin only)
exports.createBus = async (req, res, next) => {
  try {
    const bus = await Bus.create({ ...req.body, schoolId: req.user.schoolId });
    res.status(201).json(bus);
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/buses/:id  (admin only)
exports.updateBus = async (req, res, next) => {
  try {
    const bus = await Bus.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!bus) return res.status(404).json({ message: 'Bus not found' });
    res.json(bus);
  } catch (err) {
    next(err);
  }
};

// @route DELETE /api/buses/:id  (admin only)
exports.deleteBus = async (req, res, next) => {
  try {
    await Bus.findByIdAndDelete(req.params.id);
    res.json({ message: 'Bus deleted' });
  } catch (err) {
    next(err);
  }
};

// @route PATCH /api/buses/:id/location  (driver only - live GPS ping)
// Also emits a socket.io event so parent/admin dashboards update in real time.
exports.updateLocation = async (req, res, next) => {
  try {
    const { lat, lng, speed } = req.body;
    const bus = await Bus.findByIdAndUpdate(
      req.params.id,
      {
        currentLocation: { lat, lng, timestamp: new Date() },
        speed,
      },
      { new: true }
    );
    if (!bus) return res.status(404).json({ message: 'Bus not found' });

    const io = req.app.get('io');
    if (io) io.to(`bus:${bus._id}`).emit('locationUpdate', bus);

    res.json(bus);
  } catch (err) {
    next(err);
  }
};
