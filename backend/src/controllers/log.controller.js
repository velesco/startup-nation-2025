const Log = require('../models/Log');
const fs = require('fs');
const path = require('path');

// @desc    Create a new log entry
// @route   POST /api/logs
// @access  Private
exports.createLog = async (req, res, next) => {
  try {
    const { action, type, details } = req.body;
    
    // Create log in database
    const log = await Log.create({
      user: req.user ? req.user.id : null,
      action,
      type: type || 'other',
      details,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    // Also write to text file log
    const logDir = path.join(__dirname, '../../logs');
    
    // Ensure the logs directory exists
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    // Format the log message
    const logMessage = `[${new Date().toISOString()}] ${type?.toUpperCase() || 'OTHER'}: ${action} - User: ${req.user?.id || 'N/A'} - Details: ${details || 'N/A'} - IP: ${req.ip || 'N/A'}\n`;
    
    // Append to the log file
    const logFile = path.join(logDir, 'activity.log');
    fs.appendFileSync(logFile, logMessage, 'utf8');
    
    res.status(201).json({
      success: true,
      data: log
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all logs
// @route   GET /api/logs
// @access  Private (Admin only)
exports.getLogs = async (req, res, next) => {
  try {
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const startIndex = (page - 1) * limit;
    
    // Filter by type if provided
    const filter = {};
    if (req.query.type) {
      filter.type = req.query.type;
    }
    
    // If user ID provided, filter by user
    if (req.query.user) {
      filter.user = req.query.user;
    }
    
    const logs = await Log.find(filter)
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit)
      .populate('user', 'name email');
    
    const total = await Log.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      count: logs.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      },
      data: logs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get log file content
// @route   GET /api/logs/file
// @access  Private (Admin only)
exports.getLogFile = async (req, res, next) => {
  try {
    const logFile = path.join(__dirname, '../../logs/activity.log');
    
    // Check if log file exists
    if (!fs.existsSync(logFile)) {
      return res.status(404).json({
        success: false,
        message: 'Log file not found'
      });
    }
    
    // Get the last n lines (default 100)
    const lines = parseInt(req.query.lines, 10) || 100;
    
    // Read log file
    const data = fs.readFileSync(logFile, 'utf8');
    
    // Split by lines and get the last n lines
    const allLines = data.split('\n').filter(line => line.trim() !== '');
    const lastLines = allLines.slice(-lines);
    
    res.status(200).json({
      success: true,
      data: lastLines
    });
  } catch (error) {
    next(error);
  }
};
