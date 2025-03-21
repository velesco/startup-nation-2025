const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');

// For now, just stub routes
router.get('/', protect, authorize('admin', 'super-admin'), (req, res) => {
  res.status(200).json({ success: true, message: 'User routes are being implemented' });
});

module.exports = router;
