const express = require('express');
const router = express.Router();
const { triggerSOS, resolveSOS, getActiveAlerts } = require('../controllers/sosController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.post('/', authorize('driver'), triggerSOS);
router.patch('/:id/resolve', authorize('admin'), resolveSOS);
router.get('/', authorize('admin'), getActiveAlerts);

module.exports = router;
