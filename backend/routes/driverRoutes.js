const express = require('express');
const router = express.Router();
const {
  getDrivers, updateDriver, deleteDriver, setTripStatus,
} = require('../controllers/driverController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', authorize('admin'), getDrivers);
router.put('/:id', authorize('admin'), updateDriver);
router.delete('/:id', authorize('admin'), deleteDriver);
router.patch('/:id/trip', authorize('driver'), setTripStatus);

module.exports = router;
