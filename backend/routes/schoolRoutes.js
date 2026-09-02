const express = require('express');
const router = express.Router();
const { createSchool, getSchool, updateSchool } = require('../controllers/schoolController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', createSchool);
router.get('/:id', getSchool);
router.put('/:id', protect, authorize('admin'), updateSchool);

module.exports = router;
