const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const { updateDocumentFlags } = require('../controllers/documentFlags.controller');

// For now, just stub routes
router.get('/', protect, authorize('admin', 'super-admin'), (req, res) => {
  res.status(200).json({ success: true, message: 'User routes are being implemented' });
});

// Rută pentru actualizarea flag-urilor de documente
router.post('/update-document-flags', protect, authorize('admin', 'super-admin'), updateDocumentFlags);

module.exports = router;