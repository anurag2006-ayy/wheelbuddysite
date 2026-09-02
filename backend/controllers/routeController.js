const Route = require('../models/Route');
const Stop = require('../models/Stop');

// @route GET /api/routes
exports.getRoutes = async (req, res, next) => {
  try {
    const routes = await Route.find({ schoolId: req.user.schoolId }).populate('stops');
    res.json(routes);
  } catch (err) {
    next(err);
  }
};

// @route POST /api/routes  (admin only) - body includes stops[] to create
exports.createRoute = async (req, res, next) => {
  try {
    const { stops = [], ...routeData } = req.body;
    const route = await Route.create({ ...routeData, schoolId: req.user.schoolId });

    const createdStops = await Promise.all(
      stops.map((s, idx) =>
        Stop.create({ ...s, routeId: route._id, order: s.order ?? idx })
      )
    );
    route.stops = createdStops.map((s) => s._id);
    await route.save();

    res.status(201).json(route);
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/routes/:id  (admin only)
exports.updateRoute = async (req, res, next) => {
  try {
    const route = await Route.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!route) return res.status(404).json({ message: 'Route not found' });
    res.json(route);
  } catch (err) {
    next(err);
  }
};

// @route DELETE /api/routes/:id  (admin only)
exports.deleteRoute = async (req, res, next) => {
  try {
    await Route.findByIdAndDelete(req.params.id);
    res.json({ message: 'Route deleted' });
  } catch (err) {
    next(err);
  }
};
