const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const {
  getActivities,
  getRecentActivities,
  getResourceActivities,
  logActivity,
  getActivityStats,
  deleteActivity
} = require('../controllers/activity.controller');

// Routes
router.route('/')
  .get(protect, authorize('admin', 'partner'), getActivities)
  .post(protect, logActivity);

router.route('/recent')
  .get(protect, getRecentActivities);

router.route('/stats')
  .get(protect, authorize('admin'), getActivityStats);

router.route('/resource/:modelType/:modelId')
  .get(protect, getResourceActivities);

router.route('/:id')
  .delete(protect, authorize('admin'), deleteActivity);

module.exports = router;
