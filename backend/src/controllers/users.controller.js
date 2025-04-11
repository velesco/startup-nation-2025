const User = require('../models/User');
const Client = require('../models/Client');
const mongoose = require('mongoose');
const logger = require('../utils/logger');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// @desc    Get partner/user list with pagination, filtering and sorting
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getUsers = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 100, // Setting a higher default limit
      search = '', 
      role, 
      sortBy = 'createdAt', 
      sortOrder = 'desc' 
    } = req.query;
    
    // Build query
    const query = { isActive: true };
    
    // Check user role for access restrictions
    if (req.user.role !== 'admin' && req.user.role !== 'super-admin') {
      // Regular partners can only see their own profile
      query._id = req.user._id;
    } else if (role) {
      // Admins can filter by role
      query.role = role;
    }
    
    // Add search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { organization: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Determine sort order
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Execute query with pagination
    const users = await User.find(query)
      .select('name email role organization position lastLogin createdAt phone documents contractSigned idCard')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));
    
    // Count total documents for pagination
    const total = await User.countDocuments(query);
    
    // Return user list with pagination info
    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error(`Error getting user list: ${error.message}`);
    next(error);
  }
};

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private (Admin, Super Admin)
exports.getUserById = async (req, res, next) => {
  try {
    const userId = req.params.id;
    
    // Find user
    const user = await User.findById(userId).select('-password');
    
    // Check if user exists
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Return user details
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    logger.error(`Error getting user details: ${error.message}`);
    next(error);
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private (Admin, Super Admin)
exports.updateUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const updateData = req.body;
    
    // Don't allow role update to super-admin unless current user is super-admin
    if (updateData.role === 'super-admin' && req.user.role !== 'super-admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to assign super-admin role'
      });
    }
    
    // Ensure email uniqueness when updating
    if (updateData.email) {
      const existingUser = await User.findOne({ 
        email: updateData.email,
        _id: { $ne: userId }
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Another user with this email already exists'
        });
      }
    }
    
    // If password is included, hash it
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }
    
    // Process ID card data if provided
    if (updateData.idCardSeries || updateData.idCardNumber || updateData.cnp || updateData.idCardIssuedBy || 
        updateData.idCardIssueDate || updateData.idCardExpiryDate || updateData.idCardAddress || updateData.idCardFullName) {
      logger.info(`Updating ID card data for user: ${userId}`);
      
      // Get current user to check existing data
      const currentUser = await User.findById(userId);
      if (!currentUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      // Create or update idCard field
      if (!updateData.idCard) {
        updateData.idCard = currentUser.idCard || {};
      }
      
      // Map frontend field names to backend model fields
      if (updateData.idCardFullName) {
        updateData.idCard.fullName = updateData.idCardFullName;
        delete updateData.idCardFullName;
      }
      
      if (updateData.idCardSeries) {
        updateData.idCard.series = updateData.idCardSeries;
        delete updateData.idCardSeries;
      }
      
      if (updateData.idCardNumber) {
        updateData.idCard.number = updateData.idCardNumber;
        delete updateData.idCardNumber;
      }
      
      if (updateData.cnp) {
        updateData.idCard.CNP = updateData.cnp;
        delete updateData.cnp;
      }
      
      if (updateData.idCardIssuedBy) {
        updateData.idCard.issuedBy = updateData.idCardIssuedBy;
        delete updateData.idCardIssuedBy;
      }
      
      if (updateData.idCardIssueDate) {
        updateData.idCard.issueDate = new Date(updateData.idCardIssueDate);
        delete updateData.idCardIssueDate;
      }
      
      if (updateData.idCardExpiryDate) {
        updateData.idCard.expiryDate = new Date(updateData.idCardExpiryDate);
        delete updateData.idCardExpiryDate;
      }
      
      if (updateData.idCardAddress) {
        updateData.idCard.address = updateData.idCardAddress;
        delete updateData.idCardAddress;
      }
      
      // Set idCard.verified flag if we have enough data
      if (updateData.idCard.CNP && updateData.idCard.series && updateData.idCard.number) {
        updateData.idCard.verified = true;
        
        // If we don't have a fullName set, use the user's name
        if (!updateData.idCard.fullName && currentUser.name) {
          updateData.idCard.fullName = currentUser.name;
        }
      }
      
      // If ID card data is verified, also set the documents.id_cardUploaded flag
      if (updateData.idCard.verified) {
        if (!updateData.documents) {
          updateData.documents = currentUser.documents || {};
        }
        updateData.documents.id_cardUploaded = true;
      }
    }
    
    // Find and update user
    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    // Check if user exists
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Return updated user
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    logger.error(`Error updating user: ${error.message}`);
    next(error);
  }
};

// @desc    Add new user
// @route   POST /api/admin/users
// @access  Private (Admin)
exports.addUser = async (req, res, next) => {
  try {
    const { name, email, password, role, organization, position, phone } = req.body;
    
    // Check if user with this email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Un utilizator cu acest email există deja'
      });
    }
    
    // Verificare rol valid
    const allowedRoles = ['user', 'client', 'partner', 'admin'];
    if (role && !allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Rol invalid. Rolurile permise sunt: ' + allowedRoles.join(', ')
      });
    }
    
    // Restricție pentru crearea de utilizatori admin
    if (role === 'admin' && req.user.role !== 'admin' && req.user.role !== 'super-admin') {
      return res.status(403).json({
        success: false,
        message: 'Nu aveți permisiunea de a crea utilizatori administratori'
      });
    }
    
    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user',
      organization,
      position,
      phone,
      isActive: true
    });
    
    // Return new user without password
    const userResponse = { ...user.toObject() };
    delete userResponse.password;
    
    res.status(201).json({
      success: true,
      data: userResponse
    });
  } catch (error) {
    logger.error(`Error adding user: ${error.message}`);
    next(error);
  }
};

// @desc    Generate a temporary user token for contract download
// @route   POST /api/admin/generate-user-token
// @access  Private (Admin, Partner)
exports.generateUserToken = async (req, res, next) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    // Find the user to ensure it exists
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Verifică dacă utilizatorul are contract generat
    if (!user.documents || !user.documents.contractGenerated) {
      return res.status(400).json({
        success: false,
        message: 'Utilizatorul nu are un contract generat'
      });
    }
    
    // Generate a new JWT token for this user (valid for short time)
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '15m' } // Token expires in 15 minutes
    );
    
    // Return the generated token
    return res.status(200).json({
      success: true,
      token,
      message: 'Token generated successfully'
    });
  } catch (error) {
    logger.error(`Error generating user token: ${error.message}`);
    next(error);
  }
};

// @desc    Send user data to external API (Google Sheet)
// @route   POST /api/admin/users/:id/send-data
// @access  Private (Admin, super-admin)
exports.sendUserDataToExternalAPI = async (req, res, next) => {
  try {
    const userId = req.params.id;
    
    // Găsim utilizatorul
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilizator negăsit'
      });
    }
    
    // Pregătim datele pentru API-ul extern
    const spreadsheetId = '1FaANFeivKVUB6LGp_4EN9OD8-6i1SGTM4w9yaDupXGg';
    const range = "'Startup Nation 2025'!A2";
    const values = [
      'aplica-startup.ro',
      user.name, // nume_prenume
      user.email,
      user.phone || '' // telefon (dacă este disponibil)
    ];
    
    // Facem cererea către API-ul extern
    const axios = require('axios');
    const response = await axios.post('https://aipro.ro/api/trimite_sheet', {
      spreadsheetId,
      range,
      values
    });
    
    // Actualizăm utilizatorul pentru a marca faptul că datele au fost trimise
    user.dataSentToSheet = true;
    user.dataSentToSheetAt = new Date();
    await user.save();
    
    // Returnam raspunsul
    res.status(200).json({
      success: true,
      message: 'Datele utilizatorului au fost trimise cu succes',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          dataSentToSheet: user.dataSentToSheet,
          dataSentToSheetAt: user.dataSentToSheetAt
        },
        apiResponse: response.data
      }
    });
  } catch (error) {
    logger.error(`Error sending user data to external API: ${error.message}`);
    console.error('Error details:', error);
    return res.status(500).json({
      success: false,
      message: 'Eroare la trimiterea datelor utilizatorului către API-ul extern',
      error: error.message
    });
  }
};