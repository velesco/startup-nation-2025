const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const { 
  createLog,
  getLogs,
  getLogFile
} = require('../controllers/log.controller');

// All log routes are protected
router.post('/', protect, createLog);

// Admin-only routes
router.get('/', protect, authorize('admin', 'super-admin'), getLogs);
router.get('/file', protect, authorize('admin', 'super-admin'), getLogFile);

module.exports = router;