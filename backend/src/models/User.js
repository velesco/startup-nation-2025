const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters']
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email'
      ],
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false // Don't return password in queries by default
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'super-admin', 'client', 'partner', 'trainer'],
      default: 'user'
    },
    phone: {
      type: String,
      required: [true, 'Please provide a phone number'],
    },
    organization: {
      type: String,
      trim: true,
      maxlength: [100, 'Organization name cannot be more than 100 characters']
    },
    position: {
      type: String,
      trim: true,
      maxlength: [50, 'Position cannot be more than 50 characters']
    },
    added_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    profileImage: {
      type: String
    },
    lastLogin: {
      type: Date
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    isActive: {
      type: Boolean,
      default: true
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client'
    },
    documents: {
      id_cardUploaded: {
        type: Boolean,
        default: false
      },
      courseSelected: {
        type: Boolean,
        default: false
      },
      appDownloaded: {
        type: Boolean,
        default: false
      },
      contractGenerated: {
        type: Boolean,
        default: false
      },
      contractPath: {
        type: String,
        default: null
      },
      contractFormat: {
        type: String,
        enum: ['pdf', 'docx'],
        default: 'pdf'
      },
      consultingContractGenerated: {
        type: Boolean,
        default: false
      },
      consultingContractPath: {
        type: String,
        default: null
      },
      consultingContractFormat: {
        type: String,
        enum: ['pdf', 'docx', null],
        default: 'pdf'
      },
      consultingContractSigned: {
        type: Boolean,
        default: false
      }
    },
    contractSigned: {
      type: Boolean,
      default: false
    },
    contractSignedAt: {
      type: Date
    },
    signature: {
      type: String
    },
    idCard: {
      CNP: {
        type: String,
        trim: true
      },
      fullName: {
        type: String,
        trim: true
      },
      address: {
        type: String,
        trim: true
      },
      series: {
        type: String,
        trim: true
      },
      number: {
        type: String,
        trim: true
      },
      issuedBy: {
        type: String,
        trim: true
      },
      birthDate: {
        type: Date
      },
      issueDate: {
        type: Date
      },
      expiryDate: {
        type: Date
      },
      imagePath: {
        type: String,
        trim: true
      },
      verified: {
        type: Boolean,
        default: false
      },
      extractedAt: {
        type: Date
      }
    },
    dataSentToSheet: {
      type: Boolean,
      default: false
    },
    dataSentToSheetAt: {
      type: Date
    },
    submitted: {
      status: {
        type: Boolean,
        default: false
      },
      updated_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      updated_at: {
        type: Date
      }
    }
  },
  {
    timestamps: true
  }
);

// Encrypt password using bcrypt before saving
UserSchema.pre('save', async function(next) {
  // Only hash the password if it's modified (or new)
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Ensure document flag consistency before saving
UserSchema.pre('save', function(next) {
  // If we have documents object
  if (this.documents) {
    // If consultingContractSigned is true, then contractSigned should also be true
    if (this.documents.consultingContractSigned && !this.documents.contractSigned) {
      console.log(`Correcting inconsistency for user ${this._id}: consultingContractSigned=true but contractSigned=false`);
      this.documents.contractSigned = true;
      this.documents.contractGenerated = true;
    }
    
    // If contractSigned is true, ensure id_cardUploaded is also true
    if (this.documents.contractSigned && !this.documents.id_cardUploaded) {
      console.log(`Correcting inconsistency for user ${this._id}: contractSigned=true but id_cardUploaded=false`);
      this.documents.id_cardUploaded = true;
    }
    
    // Log the updated document flags
    console.log(`Document flags for user ${this._id} after consistency check:`, this.documents);
  }
  
  // Also ensure main contractSigned flag matches documents.contractSigned
  if (this.documents && this.documents.contractSigned && !this.contractSigned) {
    console.log(`Updating main contractSigned flag for user ${this._id}`);
    this.contractSigned = true;
    this.contractSignedAt = this.contractSignedAt || new Date();
  }
  
  next();
});

// Also add a pre-update hook for findOneAndUpdate operations
UserSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate();
  
  // If we're updating documents
  if (update.documents) {
    // If consultingContractSigned is true, then contractSigned should also be true
    if (update.documents.consultingContractSigned && !update.documents.contractSigned) {
      console.log('Correcting inconsistency in update: consultingContractSigned=true but contractSigned=false');
      update.documents.contractSigned = true;
      update.documents.contractGenerated = true;
    }
    
    // If contractSigned is true, ensure id_cardUploaded is also true
    if (update.documents.contractSigned && !update.documents.id_cardUploaded) {
      console.log('Correcting inconsistency in update: contractSigned=true but id_cardUploaded=false');
      update.documents.id_cardUploaded = true;
    }
    
    // Log the updated document flags
    console.log('Document flags after consistency check:', update.documents);
  }
  
  // Also ensure main contractSigned flag matches documents.contractSigned
  if (update.documents && update.documents.contractSigned && !update.contractSigned) {
    console.log('Updating main contractSigned flag in update');
    update.contractSigned = true;
    update.contractSignedAt = new Date();
  }
  
  next();
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id, role: this.role }, 
    process.env.JWT_SECRET, 
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// Sign refresh token and return
UserSchema.methods.getSignedRefreshToken = function() {
  return jwt.sign(
    { id: this._id }, 
    process.env.JWT_REFRESH_SECRET, 
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
  );
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Create password reset token
UserSchema.methods.createPasswordResetToken = function() {
  // Generate a random token
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expiration (10 minutes)
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

module.exports = mongoose.model('User', UserSchema);
