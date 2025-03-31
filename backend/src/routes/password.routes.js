const express = require('express');
const router = express.Router();
const passwordController = require('../controllers/password.controller');

// Route for handling forgot password request
router.post('/forgot-password', passwordController.forgotPassword);

// Route for verifying a reset token
router.post('/verify-reset-token', passwordController.verifyResetToken);

// Route for resetting password
router.post('/reset-password', passwordController.resetPassword);

module.exports = router;