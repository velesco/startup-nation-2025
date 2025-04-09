const mongoose = require('mongoose');

const DeviceTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    token: {
      type: String,
      required: true,
      trim: true
    },
    deviceType: {
      type: String,
      enum: ['iOS', 'Android', 'web', 'Unknown'],
      default: 'Unknown'
    },
    deviceName: {
      type: String,
      trim: true
    },
    deviceModel: {
      type: String,
      trim: true
    },
    osVersion: {
      type: String,
      trim: true
    },
    appVersion: {
      type: String,
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    lastUsed: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Asigură-te că un singur token per dispozitiv per utilizator
DeviceTokenSchema.index({ userId: 1, token: 1 }, { unique: true });

module.exports = mongoose.model('DeviceToken', DeviceTokenSchema);
