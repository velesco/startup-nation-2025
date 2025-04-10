const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const { createRateLimiter } = require('../utils/security');
const contractController = require('../controllers/contract.controller');

// Crează un rate limiter special pentru contracte - mai permisiv
const contractRateLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minute
  50, // 50 de încercări în 15 minute
  'Prea multe încercări de descărcare a contractului. Vă rugăm să încercați mai târziu.'
);

// Protected routes
router.get('/generate', protect, contractRateLimiter, contractController.generateContract);
router.get('/template', protect, contractRateLimiter, contractController.downloadTemplate);
router.get('/download', protect, contractRateLimiter, contractController.downloadContract);
router.post('/sign', protect, contractRateLimiter, contractController.signContract);
router.post('/save-signature', protect, contractRateLimiter, contractController.saveSignature);
router.post('/reset', protect, contractRateLimiter, contractController.resetContract);
router.post('/validate-id-card', protect, contractRateLimiter, contractController.validateIdCard);

// Consulting Contract routes
router.post('/generate-consulting', protect, contractRateLimiter, contractController.generateConsultingContract);
router.get('/download-consulting', protect, contractRateLimiter, contractController.downloadConsultingContract);
router.post('/reset-consulting', protect, contractRateLimiter, contractController.resetConsultingContract);

module.exports = router;