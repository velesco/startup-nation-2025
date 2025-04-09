const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide client name'],
      trim: true,
      maxlength: [100, 'Name cannot be more than 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email'
      ],
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: [true, 'Please provide a phone number'],
      match: [/^[0-9]{10,15}$/, 'Please provide a valid phone number']
    },
    status: {
      type: String,
      enum: ['Nou', 'În progres', 'Complet', 'Respins'],
      default: 'Nou'
    },
    registrationDate: {
      type: Date,
      default: Date.now
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group'
    },
    businessDetails: {
      companyName: {
        type: String,
        trim: true
      },
      cui: {
        type: String,
        trim: true
      },
      registrationNumber: {
        type: String,
        trim: true
      },
      address: {
        type: String,
        trim: true
      },
      businessType: {
        type: String,
        trim: true
      },
      businessField: {
        type: String,
        trim: true
      }
    },
    applicationDetails: {
      applicationType: {
        type: String,
        enum: ['Start-up', 'Dezvoltare afacere', 'Inovație', 'Alt tip'],
        default: 'Start-up'
      },
      requestedAmount: {
        type: Number,
        min: [0, 'Amount cannot be negative']
      },
      ownContribution: {
        type: Number,
        min: [0, 'Amount cannot be negative']
      },
      projectDescription: {
        type: String,
        trim: true
      },
      estimatedJobs: {
        type: Number,
        min: [0, 'Jobs cannot be negative']
      }
    },
    documents: [
      {
        name: {
          type: String,
          required: true
        },
        path: {
          type: String,
          required: true
        },
        mimeType: {
          type: String
        },
        size: {
          type: Number
        },
        uploadDate: {
          type: Date,
          default: Date.now
        },
        category: {
          type: String,
          enum: ['Identitate', 'Business Plan', 'Financiar', 'Altele'],
          default: 'Altele'
        }
      }
    ],
    notes: [
      {
        text: {
          type: String,
          required: true
        },
        createdBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    isArchived: {
      type: Boolean,
      default: false
    },
    contractSigned: {
      type: Boolean,
      default: false
    },
    contractSignedAt: {
      type: Date
    },
    // Flag pentru a marca dacă documentele au fost verificate și validate
    documentsVerified: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Create a virtual for the initials
ClientSchema.virtual('initials').get(function() {
  if (!this.name) return '';
  
  // Split the name on spaces and get the first letter of each part
  const parts = this.name.split(' ');
  let initials = '';
  
  // Get up to first two parts
  for (let i = 0; i < Math.min(parts.length, 2); i++) {
    if (parts[i].length > 0) {
      initials += parts[i][0].toUpperCase();
    }
  }
  
  return initials;
});

// Ensure virtuals are included when document is converted to JSON
ClientSchema.set('toJSON', { virtuals: true });
ClientSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Client', ClientSchema);
