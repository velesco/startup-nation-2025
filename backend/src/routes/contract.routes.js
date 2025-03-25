const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const { 
  generateContract,
  downloadTemplate,
  signContract
} = require('../controllers/contract.controller');

// Protected routes
router.get('/generate', protect, generateContract);
router.get('/template', protect, downloadTemplate);
router.post('/sign', protect, signContract);

module.exports = router;