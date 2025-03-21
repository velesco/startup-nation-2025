const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide notification title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters']
    },
    message: {
      type: String,
      required: [true, 'Please provide notification message'],
      trim: true
    },
    type: {
      type: String,
      enum: ['meeting', 'participant', 'group', 'document', 'success', 'warning', 'error', 'info'],
      default: 'info'
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Notification must have a recipient']
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    read: {
      type: Boolean,
      default: false
    },
    readAt: {
      type: Date
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium'
    },
    relatedTo: {
      modelType: {
        type: String,
        enum: ['Meeting', 'Client', 'Group', 'Document', 'User']
      },
      modelId: {
        type: mongoose.Schema.Types.ObjectId
      }
    },
    actionLink: {
      type: String
    },
    expiresAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Index for faster querying by user and read status
NotificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);
