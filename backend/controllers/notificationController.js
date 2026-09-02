const Notification = require('../models/Notification');

// @route GET /api/notifications
exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id }).sort('-createdAt');
    res.json(notifications);
  } catch (err) {
    next(err);
  }
};

// @route PATCH /api/notifications/:id/read
exports.markRead = async (req, res, next) => {
  try {
    const notif = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    res.json(notif);
  } catch (err) {
    next(err);
  }
};

// Internal helper (used by other controllers/socket events) to push + emit a notification
exports.pushNotification = async (io, { userId, type, message }) => {
  const notif = await Notification.create({ userId, type, message });
  if (io) io.to(`user:${userId}`).emit('notification', notif);
  return notif;
};
