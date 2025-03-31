const mongoose = require('mongoose');

const PasswordResetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    required: true
  },
  expires: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600 // automatically delete document after 1 hour
  }
});

// Index for faster lookups
PasswordResetSchema.index({ user: 1 });
PasswordResetSchema.index({ token: 1 });
PasswordResetSchema.index({ expires: 1 });

module.exports = mongoose.model('PasswordReset', PasswordResetSchema);