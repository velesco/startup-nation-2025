const User = require('../models/user.model');
const { ApiError } = require('../utils/ApiError');
const { deleteFile } = require('../utils/fileHelper');

/**
 * Get all users (admin only)
 */
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user by ID
 */
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      throw new ApiError(404, 'Utilizator negăsit');
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update current user profile
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email, phone } = req.body;
    
    // Check if email is already used by another user
    if (email !== req.user.email) {
      const existingUser = await User.findOne({
        email,
        _id: { $ne: req.user.id }
      });
      
      if (existingUser) {
        throw new ApiError(400, 'Acest email este deja folosit de alt utilizator');
      }
    }
    
    // Update user
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, email, phone },
      { new: true, runValidators: true }
    ).select('-password');
    
    res.json({
      success: true,
      message: 'Profil actualizat cu succes',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update current user password
 */
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Get user
    const user = await User.findById(req.user.id);
    
    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new ApiError(401, 'Parola curentă este incorectă');
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.json({
      success: true,
      message: 'Parola a fost actualizată cu succes'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload profile picture
 */
exports.uploadProfilePicture = async (req, res, next) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      throw new ApiError(400, 'Niciun fișier încărcat');
    }
    
    // Get current user
    const user = await User.findById(req.user.id);
    
    // Delete old profile picture if exists
    if (user.profilePicture) {
      try {
        await deleteFile(user.profilePicture);
      } catch (err) {
        console.error(`Error deleting old profile picture: ${err.message}`);
      }
    }
    
    // Update user with new profile picture
    user.profilePicture = req.file.path;
    await user.save();
    
    res.json({
      success: true,
      message: 'Imagine de profil încărcată cu succes',
      data: {
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    // Delete uploaded file if an error occurs
    if (req.file && req.file.path) {
      await deleteFile(req.file.path);
    }
    next(error);
  }
};

/**
 * Update user (admin only)
 */
exports.updateUser = async (req, res, next) => {
  try {
    const { name, email, phone, role, isActive } = req.body;
    
    // Check if email is already used by another user
    if (email) {
      const existingUser = await User.findOne({
        email,
        _id: { $ne: req.params.id }
      });
      
      if (existingUser) {
        throw new ApiError(400, 'Acest email este deja folosit de alt utilizator');
      }
    }
    
    // Prevent admin from deactivating themselves
    if (req.params.id === req.user.id && isActive === false) {
      throw new ApiError(400, 'Nu vă puteți dezactiva propriul cont');
    }
    
    // Update user
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, role, isActive },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      throw new ApiError(404, 'Utilizator negăsit');
    }
    
    res.json({
      success: true,
      message: 'Utilizator actualizat cu succes',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete user (admin only)
 */
exports.deleteUser = async (req, res, next) => {
  try {
    // Prevent admin from deleting themselves
    if (req.params.id === req.user.id) {
      throw new ApiError(400, 'Nu vă puteți șterge propriul cont');
    }
    
    // Delete user
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      throw new ApiError(404, 'Utilizator negăsit');
    }
    
    // Delete profile picture if exists
    if (user.profilePicture) {
      try {
        await deleteFile(user.profilePicture);
      } catch (err) {
        console.error(`Error deleting profile picture: ${err.message}`);
      }
    }
    
    res.json({
      success: true,
      message: 'Utilizator șters cu succes'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user status (admin only)
 */
exports.updateUserStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    
    // Prevent admin from deactivating themselves
    if (req.params.id === req.user.id && isActive === false) {
      throw new ApiError(400, 'Nu vă puteți dezactiva propriul cont');
    }
    
    // Update user status
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      throw new ApiError(404, 'Utilizator negăsit');
    }
    
    res.json({
      success: true,
      message: `Utilizator ${isActive ? 'activat' : 'dezactivat'} cu succes`,
      data: user
    });
  } catch (error) {
    next(error);
  }
};
