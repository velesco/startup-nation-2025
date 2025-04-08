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
      verified: {
        type: Boolean,
        default: false
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
