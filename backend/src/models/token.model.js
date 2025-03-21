const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['refresh', 'reset'],
      required: true,
    },
    expiresAt: {
      type: Date,
      default: function() {
        // Default expiration: 30 days for refresh tokens, 1 hour for reset tokens
        const days = this.type === 'refresh' ? 30 : 0;
        const hours = this.type === 'reset' ? 1 : 0;
        
        const date = new Date();
        date.setDate(date.getDate() + days);
        date.setHours(date.getHours() + hours);
        
        return date;
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index to automatically expire tokens
tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Token = mongoose.model('Token', tokenSchema);

module.exports = Token;
