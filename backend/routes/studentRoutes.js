const express = require('express');
const router = express.Router();
const {
  getStudents, createStudent, updateStudent, deleteStudent, markAttendance,
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', getStudents);
router.post('/', authorize('admin'), createStudent);
router.put('/:id', authorize('admin'), updateStudent);
router.delete('/:id', authorize('admin'), deleteStudent);
router.patch('/:id/attendance', authorize('driver'), markAttendance);

module.exports = router;
