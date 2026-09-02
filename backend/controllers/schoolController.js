const School = require('../models/School');

// @route POST /api/schools  (super-admin/setup only - creates a school + code for signup)
exports.createSchool = async (req, res, next) => {
  try {
    const school = await School.create(req.body);
    res.status(201).json(school);
  } catch (err) {
    next(err);
  }
};

// @route GET /api/schools/:id
exports.getSchool = async (req, res, next) => {
  try {
    const school = await School.findById(req.params.id);
    if (!school) return res.status(404).json({ message: 'School not found' });
    res.json(school);
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/schools/:id  (admin only)
exports.updateSchool = async (req, res, next) => {
  try {
    const school = await School.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(school);
  } catch (err) {
    next(err);
  }
};
