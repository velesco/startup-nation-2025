const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    partnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    maxClients: {
      type: Number,
    },
    status: {
      type: String,
      enum: ['Activ', 'Inactiv', 'Arhivat'],
      default: 'Activ',
    },
  },
  {
    timestamps: true,
  }
);

const Group = mongoose.model('Group', groupSchema);

module.exports = Group;
