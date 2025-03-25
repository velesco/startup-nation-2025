const Activity = require('../models/Activity');
const fs = require('fs');
const path = require('path');
const logger = require('./logger');

/**
 * Log an activity in database and append to log file
 * @param {string} action - Type of action
 * @param {object} user - User who performed the action
 * @param {string} details - Description of the action
 * @param {object} req - Express request object (optional)
 * @param {object} metadata - Additional data to store (optional)
 */
const logActivity = async (action, user, details, req = null, metadata = {}) => {
  try {
    // Prepare activity data
    const userId = user?._id || user?.id || 'unknown';
    const activityData = {
      action,
      user: userId,
      details: details || '',
      metadata
    };

    // Add request data if available
    if (req) {
      activityData.ipAddress = req.ip || req.connection?.remoteAddress;
      activityData.userAgent = req.headers?.['user-agent'];
    }

    // Log to database
    await Activity.create(activityData);

    // Also log to file for redundancy
    const logDir = path.join(__dirname, '../../logs');
    
    // Create logs directory if it doesn't exist
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    const logFile = path.join(logDir, 'activity.log');
    const timestamp = new Date().toISOString();
    const userEmail = user?.email || 'unknown';
    
    const logMessage = `[${timestamp}] ${action.toUpperCase()} - User: ${userId} (${userEmail}) - ${details || ''} \n`;
    
    fs.appendFileSync(logFile, logMessage, 'utf8');
  } catch (error) {
    logger.error(`Failed to log activity: ${error.message}`);
    // Don't throw error - logging should not interrupt normal flow
  }
};

module.exports = logActivity;
