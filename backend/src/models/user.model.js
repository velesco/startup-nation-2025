const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    added_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      // Allow any string format including '+' character
    },
    role: {
      type: String,
      enum: ['admin', 'partner', 'client'],
      default: 'client',
    },
    company: {
      type: String,
      trim: true,
    },
    profilePicture: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    idCard: {
      CNP: String,
      fullName: String,
      address: String,
      series: String,
      number: String,
      issuedBy: String,
      birthDate: Date,
      issueDate: Date, // Adăugat câmpul pentru data eliberării
      expiryDate: Date,
      verified: { type: Boolean, default: false }
    },
    contractSigned: {
      type: Boolean,
      default: false,
    },
    contractSignedAt: Date,
    signature: String,
    documents: {
      id_cardUploaded: { type: Boolean, default: false },
      contractGenerated: { type: Boolean, default: false },
      contractPath: String,
      contractFormat: { type: String, enum: ['pdf', 'docx'] }
    },
    passwordResetToken: String,
    passwordResetExpires: Date
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate and hash password reset token
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  // Set expiry to 10 minutes
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  
  return resetToken;
};

// Get signed JWT token
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// Get signed refresh token
userSchema.methods.getSignedRefreshToken = function () {
  return jwt.sign(
    { id: this._id },
    process.env.JWT_REFRESH_SECRET || 'refreshsecretkey123',
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
  );
};

// Get user's initials for UI
userSchema.methods.getInitials = function () {
  return this.name
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

// Try to get the model first, or create it if it doesn't exist
const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User;
