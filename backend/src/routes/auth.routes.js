const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
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
  checkEmail
} = require('../controllers/auth.controller');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resettoken', resetPassword);
router.post('/check-email', checkEmail); // Nou endpoint pentru verificarea existenței emailului

// Protected routes
router.get('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/update-details', protect, updateDetails);
router.put('/update-password', protect, updatePassword);

module.exports = router;