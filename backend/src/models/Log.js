const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const LogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  action: {
    type: String,
    required: [true, 'Action is required']
  },
  type: {
    type: String,
    enum: ['login', 'logout', 'register', 'password_reset', 'profile_update', 'client_registration', 'document_upload', 'other'],
    default: 'other'
  },
  details: {
    type: String
  },
  ip: {
    type: String
  },
  userAgent: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware to also save logs to a text file
LogSchema.post('save', function(doc) {
  const logDir = path.join(__dirname, '../../logs');
  
  // Ensure the logs directory exists
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  
  // Format the log message
  const logMessage = `[${new Date(doc.createdAt).toISOString()}] ${doc.type.toUpperCase()}: ${doc.action} - User: ${doc.user || 'N/A'} - Details: ${doc.details || 'N/A'} - IP: ${doc.ip || 'N/A'}\n`;
  
  // Append to the log file
  const logFile = path.join(logDir, 'activity.log');
  fs.appendFileSync(logFile, logMessage, 'utf8');
});

module.exports = mongoose.model('Log', LogSchema);
