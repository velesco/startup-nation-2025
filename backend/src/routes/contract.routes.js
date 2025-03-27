const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const { createRateLimiter } = require('../utils/security');
const { 
  generateContract,
  downloadTemplate,
  signContract,
  downloadContract,
  resetContract,
  validateIdCard,
  saveSignature
} = require('../controllers/contract.controller');

// Crează un rate limiter special pentru contracte - mai permisiv
const contractRateLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minute
  50, // 50 de încercări în 15 minute
  'Prea multe încercări de descărcare a contractului. Vă rugăm să încercați mai târziu.'
);

// Protected routes
router.get('/generate', protect, contractRateLimiter, generateContract);
router.get('/template', protect, contractRateLimiter, downloadTemplate);
router.get('/download', protect, contractRateLimiter, downloadContract);
router.post('/sign', protect, contractRateLimiter, signContract);
router.post('/save-signature', protect, contractRateLimiter, saveSignature);
router.post('/reset', protect, contractRateLimiter, resetContract);
router.post('/validate-id-card', protect, contractRateLimiter, validateIdCard);

module.exports = router;