const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const {
  getActivities,
  getRecentActivities,
  getResourceActivities,
  logActivity,
  getActivityStats,
  deleteActivity,
  getUserActivities
} = require('../controllers/activity.controller');

// Routes
router.route('/')
  .get(protect, authorize('admin', 'partner', 'super-admin'), getActivities)
  .post(protect, logActivity);

router.route('/recent')
  .get(protect, getRecentActivities);

router.route('/stats')
  .get(protect, authorize('admin', 'super-admin'), getActivityStats);

router.route('/resource/:modelType/:modelId')
  .get(protect, getResourceActivities);

router.route('/user/:userId')
  .get(protect, getUserActivities);

router.route('/:id')
  .delete(protect, authorize('admin', 'super-admin'), deleteActivity);

module.exports = router;