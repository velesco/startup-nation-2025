const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const { updateDocumentFlags } = require('../controllers/documentFlags.controller');

// Toate rutele sunt protejate
router.use(protect);

// Actualizare flag-uri documente
router.post('/update', authorize('admin', 'super-admin'), updateDocumentFlags);

module.exports = router;