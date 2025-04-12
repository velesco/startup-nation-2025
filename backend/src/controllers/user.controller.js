const User = require('../models/User');
const { ApiError } = require('../utils/ApiError');
const { deleteFile } = require('../utils/fileHelper');
const logger = require('../utils/logger');
const fs = require('fs');
const path = require('path');

/**
 * Get all users (admin sees all users, partners see only users they added)
 */
exports.getUsers = async (req, res, next) => {
  try {
    // Prepare filter options
    const filter = {};
    
    // Handle user role-based access
    if (req.user.role === 'partner') {
      // Partners can only see users they've added
      filter.added_by = req.user._id;
    }
    // Admins can see all users
    
    // Add filter by role if provided
    if (req.query.role) {
      filter.role = req.query.role;
    }
    
    // Add filter for active/inactive users
    if (req.query.isActive) {
      filter.isActive = req.query.isActive === 'true';
    }
    
    // Handle search query
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { company: searchRegex }
      ];
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    // Execute query with pagination
    const users = await User.find(filter)
      .populate('added_by', 'name')
      .select('-password')
      .skip(startIndex)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    // Get total count for pagination
    const total = await User.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      count: users.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      },
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
 * Update user (admin can update any user, partner can update only users they added)
 */
exports.updateUser = async (req, res, next) => {
  try {
    const userToUpdate = await User.findById(req.params.id);
    if (!userToUpdate) {
      throw new ApiError(404, 'Utilizator negăsit');
    }
    
    // Check if partner is trying to update a user they didn't add
    if (req.user.role === 'partner' && 
        userToUpdate.added_by && 
        userToUpdate.added_by.toString() !== req.user.id) {
      throw new ApiError(403, 'Nu aveți permisiunea de a actualiza acest utilizator');
    }
    
    // Prevent users from deactivating themselves
    if (req.params.id === req.user.id && req.body.isActive === false) {
      throw new ApiError(400, 'Nu vă puteți dezactiva propriul cont');
    }
    
    // Partners can update all fields for their own users, just like admins
    // Email uniqueness check
    if (req.body.email) {
      const existingUser = await User.findOne({
        email: req.body.email,
        _id: { $ne: req.params.id }
      });
      
      if (existingUser) {
        throw new ApiError(400, 'Acest email este deja folosit de alt utilizator');
      }
    }
    
    // Update the user with all provided fields
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');
    
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
 * Create new user
 * @description Both admin and partner can create users. Partners can only see users they've added.
 */
exports.createUser = async (req, res, next) => {
  try {
    // Check if user with this email already exists
    const existingUser = await User.findOne({ email: req.body.email.toLowerCase() });
    if (existingUser) {
      throw new ApiError(400, 'Un utilizator cu acest email există deja');
    }
    
    // Set the added_by field to the current user's ID (as string pentru consistență)
    req.body.added_by = req.user.id.toString();
    
    // Hash the password in the model using pre-save hook
    
    // Create user
    const user = await User.create(req.body);
    
    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.status(201).json({
      success: true,
      data: userResponse
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete user (admin can delete any user, partner can delete only users they added)
 */
exports.deleteUser = async (req, res, next) => {
  try {
    // Prevent users from deleting themselves
    if (req.params.id === req.user.id) {
      throw new ApiError(400, 'Nu vă puteți șterge propriul cont');
    }
    
    // Get the user to check permissions
    const userToDelete = await User.findById(req.params.id);
    if (!userToDelete) {
      throw new ApiError(404, 'Utilizator negăsit');
    }
    
    // Check if partner is trying to delete a user they didn't add
    if (req.user.role === 'partner' && 
        userToDelete.added_by && 
        userToDelete.added_by.toString() !== req.user.id) {
      throw new ApiError(403, 'Nu aveți permisiunea de a șterge acest utilizator');
    }
    
    // Delete user
    const user = await User.findByIdAndDelete(req.params.id);
    
    // Delete profile picture if exists
    if (user.profilePicture) {
      try {
        await deleteFile(user.profilePicture);
      } catch (err) {
        logger.error(`Error deleting profile picture: ${err.message}`);
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
 * Import multiple users
 * @description Create multiple users from imported data with automatic password set to phone number
 */
exports.importUsers = async (req, res, next) => {
  try {
    const { users, forceAssign = false } = req.body;
    
    // Logare informații despre utilizatorul care face importul
    console.log('Import users request received from:');
    console.log('- User ID:', req.user.id);
    console.log('- User Role:', req.user.role);
    console.log('- User Email:', req.user.email);
    console.log('- Users to import:', users?.length);
    console.log('- Force assign option:', forceAssign ? 'Yes' : 'No');
    
    // Validate input
    if (!users || !Array.isArray(users) || users.length === 0) {
      console.error('Import users error: Invalid input');
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid list of users to import'
      });
    }
    
    // Log the first user to help with debugging
    if (users.length > 0) {
      console.log(`Sample user data: ${JSON.stringify(users[0])}`);
    }
    
    const results = {
      success: [],
      errors: [],
      usersCreated: [], // Track created accounts
      usersUpdated: [] // Track updated accounts
    };
    
    // Process each user
    for (const userData of users) {
      try {
        // Basic validation
        if (!userData.name || !userData.email) {
          results.errors.push({
            data: userData,
            message: 'Missing required fields (name and email)'
          });
          continue;
        }
        
        // Check for duplicate email
        const existingUser = await User.findOne({ email: userData.email.toLowerCase() });
        if (existingUser) {
          console.log(`User with email ${userData.email} already exists. Updating added_by field.`);
          
          // Verificăm dacă utilizatorul are deja un added_by
          // Dacă nu are sau este null, îi atribuim partenerul curent
          const hasAddedBy = existingUser.added_by && 
                           ((typeof existingUser.added_by === 'string' && existingUser.added_by.trim().length > 0) ||
                            (typeof existingUser.added_by === 'object' && existingUser.added_by._id));
          
          if (!hasAddedBy) {
            // Actualizăm câmpul added_by cu ID-ul partenerului care face importul
            // Convertim ID-ul utilizatorului curent la string pentru consistență
            const currentUserIdString = req.user.id.toString();
            
            const updatedUser = await User.findByIdAndUpdate(
              existingUser._id,
              { added_by: currentUserIdString },
              { new: true }
            );
            
            results.success.push(updatedUser);
            
            // Adaugă la lista de utilizatori actualizați
            results.usersUpdated.push({
              id: updatedUser._id,
              email: updatedUser.email,
              name: updatedUser.name,
              updated: 'added_by field'
            });
            
            console.log(`Added partner ID ${req.user.id} to user ${existingUser._id}`);
          } else {
            // Verifică dacă utilizatorul aparține altui partener sau este deja al partenerului curent
            const existingAddedBy = existingUser.added_by;
            let isOwnedByCurrentPartner = false;
            
            if (typeof existingAddedBy === 'string') {
              isOwnedByCurrentPartner = existingAddedBy === req.user.id.toString();
            } else if (typeof existingAddedBy === 'object' && existingAddedBy._id) {
              isOwnedByCurrentPartner = existingAddedBy._id.toString() === req.user.id.toString();
            }
            
            if (isOwnedByCurrentPartner) {
              // Deja aparține acestui partener, nu este nevoie de actualizare
              console.log(`User ${existingUser._id} already belongs to current partner ${req.user.id}`);
              results.usersUpdated.push({
                id: existingUser._id,
                email: existingUser.email,
                name: existingUser.name,
                updated: 'none (already assigned)'
              });
              
              // Adăugăm și la lista de succes pentru calculul total corect
              results.success.push(existingUser);
            } else if (forceAssign && req.user.role === 'admin') {
              // Admin-ul poate forța reatribuirea utilizatorilor către un partener
              console.log(`Admin is forcing reassignment of user ${existingUser._id} to partner ${req.user.id}`);
              
              // Convertim ID-ul utilizatorului curent la string pentru consistență
              const currentUserIdString = req.user.id.toString();
              
              const updatedUser = await User.findByIdAndUpdate(
                existingUser._id,
                { added_by: currentUserIdString },
                { new: true }
              );
              
              results.success.push(updatedUser);
              results.usersUpdated.push({
                id: updatedUser._id,
                email: updatedUser.email,
                name: updatedUser.name,
                updated: 'forced reassignment'
              });
            } else {
              // Aparține altui partener și nu se poate reatribui
              console.log(`User ${existingUser._id} already has added_by: ${existingUser.added_by}`);
              results.errors.push({
                data: userData,
                message: 'A user with this email already exists and is assigned to another partner'
              });
            }
          }
          
          continue;
        }
        
        // Verify and format phone number if present or set a default valid number
        let phoneNumber = '0000000000'; // Default valid phone
        
        if (userData.phone) {
          // Clean up phone - remove any non-digit characters
          const cleanPhone = userData.phone.toString().replace(/\D/g, '');
          
          // If still valid after cleaning, use it
          if (cleanPhone.match(/^[0-9]{10,15}$/)) {
            phoneNumber = cleanPhone;
          } else {
            console.warn(`Invalid phone format for user: ${userData.name}. Using default.`);
          }
        }
        
        // Use phone as password or default to phone number if not set
        const password = phoneNumber;
        
        // Convertim ID-ul utilizatorului curent la string pentru consistență
        const currentUserIdString = req.user.id.toString();
        
        // Set default values
        const newUserData = {
          name: userData.name,
          email: userData.email.toLowerCase(),
          phone: phoneNumber,
          password: password,
          role: userData.role || 'client',
          organization: userData.company || '',
          added_by: currentUserIdString // Set current user as the creator
        };
        
        console.log('Creating user with data:', newUserData);
        
        // Create the user
        const user = await User.create(newUserData);
        console.log('User created successfully:', user._id);
        
        results.success.push(user);
        
        // Add to usersCreated list with password for display
        results.usersCreated.push({
          id: user._id,
          email: user.email,
          password: password
        });
      } catch (error) {
        console.error(`Error importing individual user: ${error.message}`);
        console.error(`User data: ${JSON.stringify(userData)}`);
        console.error(`Error details: ${error.stack}`);
        results.errors.push({
          data: userData,
          message: error.message
        });
      }
    }
    
    // Return response
    const responseMessage = `Processed ${results.success.length} users (${results.usersCreated.length} created, ${results.usersUpdated.length} updated) with ${results.errors.length} errors.`;
    console.log(responseMessage);
    console.log('Users created:', results.usersCreated.length);
    console.log('Users updated:', results.usersUpdated.length);
    
    res.status(200).json({
      success: true,
      message: responseMessage,
      summary: {
        total: results.success.length + results.errors.length,
        created: results.usersCreated.length,
        updated: results.usersUpdated.length,
        errors: results.errors.length,
        forceAssign: forceAssign
      },
      data: {
        successful: results.success.length,
        failed: results.errors.length,
        usersCreated: results.usersCreated,
        usersUpdated: results.usersUpdated,
        errors: results.errors
      }
    });
  } catch (error) {
    console.error(`Failed to import users: ${error.message}`);
    console.error(`Error stack: ${error.stack}`);
    return res.status(500).json({
      success: false,
      message: `Failed to import users: ${error.message}`
    });
  }
};

/**
 * Get user statistics
 * @route   GET /api/admin/users/statistics
 * @access  Private (Admin, Partner)
 */
exports.getUsersStats = async (req, res, next) => {
  try {
    // Prepare filter for partners to only see users they've added
    const filter = {};
    if (req.user.role === 'partner') {
      filter.added_by = req.user._id;
    }
    
    // Total users count
    const totalUsers = await User.countDocuments(filter);
    
    // Users by role
    const usersByRole = await User.aggregate([
      { $match: filter },
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
    
    // New users this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const newUsersThisMonth = await User.countDocuments({
      ...filter,
      createdAt: { $gte: startOfMonth }
    });
    
    // Active vs. inactive users
    const activeUsers = await User.countDocuments({ ...filter, isActive: true });
    const inactiveUsers = await User.countDocuments({ ...filter, isActive: false });
    
    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        byRole: usersByRole.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
        newUsersThisMonth,
        activeUsers,
        inactiveUsers
      }
    });
  } catch (error) {
    console.error('Error fetching user statistics:', error);
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
