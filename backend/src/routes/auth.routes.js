const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const { authRateLimiter, apiRateLimiter } = require('../utils/security');
const { 
  register, 
  login, 
  logout, 
  getMe, 
  updateDetails, 
  updatePassword, 
  forgotPassword, 
  resetPassword,
  refreshToken,
  checkEmail,
  updateIdCard
} = require('../controllers/auth.controller');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resettoken', resetPassword);
router.post('/check-email', checkEmail); // Nou endpoint pentru verificarea existenței emailului

// Protected routes
router.get('/logout', protect, apiRateLimiter, logout);
router.get('/me', protect, apiRateLimiter, getMe);
router.put('/update-details', protect, apiRateLimiter, updateDetails);
router.put('/update-password', protect, apiRateLimiter, updatePassword);
router.put('/update-id-card', protect, apiRateLimiter, updateIdCard);

module.exports = router;