const express = require('express');
const router = express.Router();
const {
  getRoutes, createRoute, updateRoute, deleteRoute,
} = require('../controllers/routeController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', getRoutes);
router.post('/', authorize('admin'), createRoute);
router.put('/:id', authorize('admin'), updateRoute);
router.delete('/:id', authorize('admin'), deleteRoute);

module.exports = router;
