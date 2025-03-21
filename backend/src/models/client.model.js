const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema(
  {
    partnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Nou', 'În progres', 'Complet', 'Anulat'],
      default: 'Nou',
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
    },
    notes: {
      type: String,
    },
    documents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document',
      },
    ],
    registrationDate: {
      type: Date,
      default: Date.now,
    },
    businessDetails: {
      companyName: String,
      cui: String,
      registrationNumber: String,
      address: String,
      activityDomain: String,
    },
    applicationDetails: {
      projectValue: Number,
      fundingAmount: Number,
      ownContribution: Number,
      expectedJobsCreated: Number,
      region: String,
    },
  },
  {
    timestamps: true,
  }
);

// Get formatted registration date (DD.MM.YYYY)
clientSchema.methods.getFormattedRegistrationDate = function () {
  const date = this.registrationDate;
  return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
};

// Get client initials for UI
clientSchema.methods.getInitials = function () {
  return this.name
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

const Client = mongoose.model('Client', clientSchema);

module.exports = Client;
