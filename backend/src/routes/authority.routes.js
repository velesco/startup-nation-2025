const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const { createRateLimiter } = require('../utils/security');
const authorityController = require('../controllers/authority.controller');

// Crează un rate limiter special pentru documente de împuternicire - mai permisiv
const authorityRateLimiter = createRateLimiter(
  15 * 60 * 10, // 15 minute
  50, // 50 de încercări în 15 minute
  'Prea multe încercări. Vă rugăm să încercați mai târziu.'
);

// Protected routes for authorization document
router.get('/generate', protect, authorityRateLimiter, authorityController.generateAuthorityDocument);
router.get('/download', protect, authorityRateLimiter, authorityController.downloadAuthorityDocument);
router.post('/sign', protect, authorityRateLimiter, authorityController.signAuthorityDocument);
router.post('/reset', protect, authorityRateLimiter, authorityController.resetAuthorityDocument);

module.exports = router;