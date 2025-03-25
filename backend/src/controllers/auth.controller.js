const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const logger = require('../utils/logger');
const sendEmail = require('../utils/sendEmail');
const fs = require('fs');
const path = require('path');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone, organization, position } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create user
    user = await User.create({
      name,
      email,
      password,
      phone,
      organization,
      position,
      role: req.body.role || 'client' // Default to client if not specified
    });

    // Log the new user registration in the activity log
    logActivity('REGISTER', user, `New ${user.role} registration`);
    
    // Set the lastLogin to now for all users since they will be auto-logged in
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    // Send response with token
    sendTokenResponse(user, 201, res);
  } catch (error) {
    logger.error(`Registration error: ${error.message}`);
    next(error);
  }
};

// @desc    Check if email exists
// @route   POST /api/auth/check-email
// @access  Public
exports.checkEmail = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email'
      });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    
    return res.status(200).json({
      success: true,
      exists: !!user // convert to boolean
    });
  } catch (error) {
    logger.error(`Check email error: ${error.message}`);
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login timestamp
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    // Log the successful login to the activity log
    logActivity('LOGIN', user, `User logged in - Role: ${user.role}`);

    // Send response with token
    sendTokenResponse(user, 200, res);
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    next(error);
  }
};

// @desc    Logout user / clear cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = (req, res) => {
  // Log the logout activity
  logActivity('LOGOUT', req.user, 'User logged out');
  
  res.status(200).json({
    success: true,
    message: 'User logged out successfully'
  });
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user details
// @route   PUT /api/auth/update-details
// @access  Private
exports.updateDetails = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      organization: req.body.organization,
      position: req.body.position
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(
      key => fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update password
// @route   PUT /api/auth/update-password
// @access  Private
exports.updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isMatch = await user.matchPassword(req.body.currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = req.body.newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'There is no user with that email'
      });
    }

    // Get reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // Create reset url
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const message = `
      Ați solicitat resetarea parolei. Vă rugăm să accesați următorul link pentru a vă seta o nouă parolă:
      \n\n${resetUrl}\n\n
      Acest link este valabil 10 minute. Dacă nu ați solicitat resetarea parolei, vă rugăm să ignorați acest email.
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Resetare parolă Startup Nation 2025',
        message
      });

      res.status(200).json({
        success: true,
        message: 'Email sent'
      });
    } catch (error) {
      logger.error(`Error sending email: ${error.message}`);
      
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        success: false,
        message: 'Email could not be sent'
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:resettoken
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: resetPasswordToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid token or token has expired'
      });
    }

    // Set new password
    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// Helper function to log activity to a file
const logActivity = (action, user, details) => {
  const logDir = path.join(__dirname, '../../logs');
  
  // Create logs directory if it doesn't exist
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  
  const logFile = path.join(logDir, 'activity.log');
  const timestamp = new Date().toISOString();
  const userId = user?._id || user?.id || 'unknown';
  const userEmail = user?.email || 'unknown';
  
  const logMessage = `[${timestamp}] ${action.toUpperCase()} - User: ${userId} (${userEmail}) - ${details || ''} \n`;
  
  fs.appendFileSync(logFile, logMessage, 'utf8');
};

// Helper function to send token response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();
  const refreshToken = user.getSignedRefreshToken();

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    success: true,
    token,
    refreshToken,
    user
  });
};

// @desc    Refresh token
// @route   POST /api/auth/refresh-token
// @access  Public (with refresh token)
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'No refresh token provided'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Get user
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    // Generate new access token
    const newToken = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token: newToken
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
    next(error);
  }
};
