const express = require('express');
const router = express.Router();
const {
  getBuses, getBus, createBus, updateBus, deleteBus, updateLocation,
} = require('../controllers/busController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', getBuses);
router.get('/:id', getBus);
router.post('/', authorize('admin'), createBus);
router.put('/:id', authorize('admin'), updateBus);
router.delete('/:id', authorize('admin'), deleteBus);
router.patch('/:id/location', authorize('driver'), updateLocation);

module.exports = router;
