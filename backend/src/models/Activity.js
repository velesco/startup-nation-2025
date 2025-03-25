const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: [
        'LOGIN', 
        'LOGOUT', 
        'REGISTER', 
        'UPDATE_PROFILE', 
        'UPDATE_PASSWORD',
        'UPDATE_ID_CARD',
        'CLIENT_CREATED',
        'CLIENT_UPDATED',
        'CLIENT_DELETED',
        'GROUP_CREATED',
        'GROUP_UPDATED',
        'GROUP_DELETED',
        'DOCUMENT_UPLOADED',
        'DOCUMENT_DELETED',
        'MEETING_CREATED',
        'MEETING_UPDATED',
        'MEETING_DELETED',
        'CONTRACT_GENERATED',
        'CONTRACT_SIGNED',
        'FORGOT_PASSWORD'
      ]
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    details: {
      type: String
    },
    ipAddress: {
      type: String
    },
    userAgent: {
      type: String
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed
    }
  },
  {
    timestamps: true
  }
);

// Add index for faster querying
ActivitySchema.index({ user: 1, createdAt: -1 });
ActivitySchema.index({ action: 1, createdAt: -1 });

module.exports = mongoose.model('Activity', ActivitySchema);
