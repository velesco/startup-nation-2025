const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const {
  getNotifications,
  getNotification,
  createNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createBatchNotifications,
  createRoleNotifications,
  getNotificationCount,
  registerDevice,
  unregisterDevice,
  testPushNotification
} = require('../controllers/notification.controller');

// Routes
router.route('/')
  .get(protect, getNotifications)
  .post(protect, authorize('admin', 'partner'), createNotification);

router.route('/count')
  .get(protect, getNotificationCount);

router.route('/register-device')
  .post(protect, registerDevice);

router.route('/unregister-device')
  .delete(protect, unregisterDevice);

router.route('/test-push')
  .post(protect, testPushNotification);

router.route('/read-all')
  .put(protect, markAllAsRead);

router.route('/batch')
  .post(protect, authorize('admin', 'partner'), createBatchNotifications);

router.route('/role')
  .post(protect, authorize('admin'), createRoleNotifications);

router.route('/:id')
  .get(protect, getNotification)
  .delete(protect, deleteNotification);

router.route('/:id/read')
  .put(protect, markAsRead);

module.exports = router;
