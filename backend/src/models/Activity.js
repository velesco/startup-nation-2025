const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Activity must have an actor']
    },
    actorName: {
      type: String
    },
    action: {
      type: String,
      required: [true, 'Activity must have an action description'],
      trim: true
    },
    type: {
      type: String,
      enum: [
        'meeting_create', 
        'meeting_update', 
        'meeting_delete', 
        'participant_add', 
        'participant_remove', 
        'group_create', 
        'group_update', 
        'email_send', 
        'document_upload', 
        'comment_add',
        'client_create',
        'client_update',
        'client_status',
        'user_login',
        'user_create',
        'system_event'
      ],
      required: [true, 'Activity must have a type']
    },
    details: {
      type: String,
      trim: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    relatedTo: {
      modelType: {
        type: String,
        enum: ['Meeting', 'Client', 'Group', 'Document', 'User']
      },
      modelId: {
        type: mongoose.Schema.Types.ObjectId
      },
      modelName: {
        type: String
      }
    },
    visibility: {
      type: String,
      enum: ['Public', 'Private', 'Admin'],
      default: 'Public'
    },
    ipAddress: {
      type: String
    },
    userAgent: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

// Index for faster querying
ActivitySchema.index({ actor: 1 });
ActivitySchema.index({ type: 1 });
ActivitySchema.index({ timestamp: -1 });
ActivitySchema.index({ 'relatedTo.modelType': 1, 'relatedTo.modelId': 1 });

module.exports = mongoose.model('Activity', ActivitySchema);
