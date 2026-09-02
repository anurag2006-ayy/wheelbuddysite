const Student = require('../models/Student');
const AttendanceRecord = require('../models/AttendanceRecord');

// @route GET /api/students
exports.getStudents = async (req, res, next) => {
  try {
    const filter = {};
    if (req.user.role === 'parent') filter.parentId = req.user._id;
    else filter.schoolId = req.user.schoolId;
    if (req.query.busId) filter.busId = req.query.busId;

    const students = await Student.find(filter).populate('busId stopId');
    res.json(students);
  } catch (err) {
    next(err);
  }
};

// @route POST /api/students  (admin only)
exports.createStudent = async (req, res, next) => {
  try {
    const student = await Student.create({ ...req.body, schoolId: req.user.schoolId });
    res.status(201).json(student);
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/students/:id  (admin only)
exports.updateStudent = async (req, res, next) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (err) {
    next(err);
  }
};

// @route DELETE /api/students/:id  (admin only)
exports.deleteStudent = async (req, res, next) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: 'Student deleted' });
  } catch (err) {
    next(err);
  }
};

// @route PATCH /api/students/:id/attendance  (driver only - mark boarded/absent)
exports.markAttendance = async (req, res, next) => {
  try {
    const { status } = req.body; // 'boarded' | 'not-boarded' | 'absent'
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { attendanceStatus: status },
      { new: true }
    );
    if (!student) return res.status(404).json({ message: 'Student not found' });

    await AttendanceRecord.create({
      studentId: student._id,
      busId: student.busId,
      date: new Date(),
      boardedAt: status === 'boarded' ? new Date() : undefined,
      status,
    });

    const io = req.app.get('io');
    if (io) io.to(`bus:${student.busId}`).emit('attendanceUpdate', student);

    res.json(student);
  } catch (err) {
    next(err);
  }
};
