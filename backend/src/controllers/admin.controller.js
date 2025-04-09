const Client = require('../models/Client');
const Group = require('../models/Group');
const User = require('../models/User');
const Document = require('../models/Document');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');
const logger = require('../utils/logger');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private (Admin, Partner)
exports.getDashboardStats = async (req, res, next) => {
  try {
    // Get current month and year
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    // Format month name
    const monthNames = ['Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie', 
                        'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'];
    const currentMonthName = monthNames[currentMonth];
    
    // Start of current and previous month
    const startOfCurrentMonth = new Date(currentYear, currentMonth, 1);
    const startOfPreviousMonth = new Date(previousMonthYear, previousMonth, 1);
    
    // Calculate total clients
    const totalClients = await Client.countDocuments({ isArchived: false });
    
    // Calculate clients from current month
    const newClientsCurrentMonth = await Client.countDocuments({
      registrationDate: { $gte: startOfCurrentMonth },
      isArchived: false
    });
    
    // Calculate clients from previous month
    const newClientsPreviousMonth = await Client.countDocuments({
      registrationDate: { 
        $gte: startOfPreviousMonth,
        $lt: startOfCurrentMonth
      },
      isArchived: false
    });
    
    // Calculate percentage change for new clients
    const newClientsPercentChange = newClientsPreviousMonth === 0 
      ? 100 
      : Math.round(((newClientsCurrentMonth - newClientsPreviousMonth) / newClientsPreviousMonth) * 100);
    
    // Get clients enrolled in courses
    const clientsEnrolled = await Client.countDocuments({
      group: { $ne: null },
      isArchived: false
    });
    
    // Calculate enrollment rate
    const enrollmentRate = totalClients === 0 
      ? 0 
      : Math.round((clientsEnrolled / totalClients) * 100);
    
    // Get active groups
    const activeGroups = await Group.countDocuments({ 
      status: 'Active',
      isArchived: false
    });
    
    // Get total partners/instructors
    const totalPartners = await User.countDocuments({ 
      role: 'partner',
      isActive: true
    });
    
    // Return dashboard statistics
    res.status(200).json({
      success: true,
      data: {
        totalClients,
        newClientsCurrentMonth,
        newClientsPercentChange,
        clientsEnrolled,
        enrollmentRate,
        activeGroups,
        totalPartners,
        currentMonthName
      }
    });
  } catch (error) {
    logger.error(`Error getting dashboard stats: ${error.message}`);
    next(error);
  }
};

// @desc    Get client documents
// @route   GET /api/admin/clients/:id/documents
// @access  Private (Admin, Partner)
exports.getClientDocuments = async (req, res, next) => {
  try {
    const clientId = req.params.id;
    
    // Find client
    const client = await Client.findById(clientId);
    
    // Check if client exists
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }
    
    // Find documents for this client
    const documents = await Document.find({ clientId: client._id })
      .sort({ createdAt: -1 });
    
    // Return documents
    res.status(200).json({
      success: true,
      data: documents
    });
  } catch (error) {
    logger.error(`Error getting client documents: ${error.message}`);
    next(error);
  }
};

// @desc    Upload client document
// @route   POST /api/admin/clients/:id/documents
// @access  Private (Admin, Partner)
exports.uploadClientDocument = async (req, res, next) => {
  try {
    const clientId = req.params.id;
    const { type, name } = req.body;
    
    // Verificăm dacă avem un fișier încărcat (fie prin multer, fie prin express-fileupload)
    let file;
    
    if (req.file) {
      // Varianta multer
      file = req.file;
      file.path = file.path.replace(/\\/g, '/'); // Normalizare path pentru Windows
    } else if (req.files && req.files.document) {
      // Varianta express-fileupload
      const uploadedFile = req.files.document;
      
      // Crearea directorului pentru client dacă nu există
      const uploadDir = path.join(__dirname, '../../uploads', clientId);
      
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      // Generare nume unic pentru fișier
      const extension = path.extname(uploadedFile.name);
      const filename = uuidv4() + extension;
      const filePath = path.join(uploadDir, filename);
      
      // Salvare fișier
      await uploadedFile.mv(filePath);
      
      // Creare obiect file similar cu cel returnat de multer
      file = {
        filename,
        originalname: uploadedFile.name,
        mimetype: uploadedFile.mimetype,
        size: uploadedFile.size,
        path: filePath.replace(/\\/g, '/') // Normalizare path pentru Windows
      };
    }
    
    // Validare - trebuie să avem un fișier
    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }
    
    // Find client
    const client = await Client.findById(clientId);
    
    // Check if client exists
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }
    
    try {
      // If file exists, create document record
      const document = await Document.create({
        clientId: client._id,
        type: type || 'other',
        name: name || file.originalname,
        fileName: file.filename, // De la multer sau generat manual
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        path: file.path,
        uploadedBy: req.user._id,
        uploadedAt: Date.now()
      });
      
      // Return created document
      return res.status(201).json({
        success: true,
        data: document
      });
    } catch (err) {
      logger.error(`Error creating document record: ${err.message}`);
      // Dacă apare o eroare la crearea documentului în baza de date, ștergem fișierul
      if (file && file.path) {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      }
      throw err;
    }
    
    // Return error if we reached here without a file
    return res.status(400).json({
      success: false,
      message: 'File upload failed or no file was provided'
    });
  } catch (error) {
    logger.error(`Error uploading client document: ${error.message}`);
    next(error);
  }
};

// @desc    Download document
// @route   GET /api/admin/documents/:id/download
// @access  Private (Admin, Partner)
exports.downloadDocument = async (req, res, next) => {
  try {
    const documentId = req.params.id;
    
    // Find document
    const document = await Document.findById(documentId);
    
    // Check if document exists
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }
    
    // Verificăm dacă fișierul există pe disc
    if (!fs.existsSync(document.path)) {
      return res.status(404).json({
        success: false,
        message: 'Document file not found on disk'
      });
    }
    
    // Return file for download
    res.download(document.path, document.originalName, (err) => {
      if (err) {
        logger.error(`Error downloading document: ${err.message}`);
        // Nu putem trimite un răspuns aici pentru că res.download deja a început să trimită date
      }
    });
  } catch (error) {
    logger.error(`Error downloading document: ${error.message}`);
    next(error);
  }
};

// @desc    Delete document
// @route   DELETE /api/admin/documents/:id
// @access  Private (Admin, Partner)
exports.deleteDocument = async (req, res, next) => {
  try {
    const documentId = req.params.id;
    
    // Find document
    const document = await Document.findById(documentId);
    
    // Check if document exists
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }
    
    // Delete file from storage
    if (fs.existsSync(document.path)) {
      fs.unlinkSync(document.path);
    }
    
    // Delete document from database
    await Document.deleteOne({ _id: documentId });
    
    // Return success response
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    logger.error(`Error deleting document: ${error.message}`);
    next(error);
  }
};

// @desc    Get client list with pagination, filtering and sorting
// @route   GET /api/admin/clients
// @access  Private (Admin, Partner)
exports.getClients = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      status, 
      group, 
      sortBy = 'registrationDate', 
      sortOrder = 'desc' 
    } = req.query;
    
    // Build query
    const query = { isArchived: false };
    
    // Handle user role-based access
    if (req.user.role === 'partner') {
      // Partners can only see clients they've added
      query.assignedTo = req.user._id;
    }
    // Admins can see all clients
    
    // Add search filter (name, email, phone)
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Add status filter
    if (status) {
      query.status = status;
    }
    
    // Add group filter
    if (group) {
      query.group = mongoose.Types.ObjectId(group);
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Determine sort order
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Execute query with pagination
    const clients = await Client.find(query)
      .select('name email phone status registrationDate group')
      .populate('group', 'name')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));
    
    // Count total documents for pagination
    const total = await Client.countDocuments(query);
    
    // Return client list with pagination info
    res.status(200).json({
      success: true,
      data: clients,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error(`Error getting client list: ${error.message}`);
    next(error);
  }
};

// @desc    Get group list with pagination, filtering and sorting
// @route   GET /api/admin/groups
// @access  Private (Admin, Partner)
exports.getGroups = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      status, 
      sortBy = 'startDate', 
      sortOrder = 'desc' 
    } = req.query;
    
    // Build query
    const query = { isArchived: false };
    
    // Add search filter
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    // Add status filter
    if (status) {
      query.status = status;
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Determine sort order
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Execute query with pagination
    const groups = await Group.find(query)
      .select('name status startDate endDate capacity instructor')
      .populate('instructor', 'name')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));
    
    // Add client count to each group
    for (let group of groups) {
      const clientCount = await Client.countDocuments({ 
        group: group._id,
        isArchived: false
      });
      
      group._doc.clientCount = clientCount;
    }
    
    // Count total documents for pagination
    const total = await Group.countDocuments(query);
    
    // Return group list with pagination info
    res.status(200).json({
      success: true,
      data: groups,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error(`Error getting group list: ${error.message}`);
    next(error);
  }
};

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
      .select('name email role organization position lastLogin createdAt phone')
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

// @desc    Get user documents
// @route   GET /api/admin/users/:id/documents
// @access  Private (Admin, Super Admin)
exports.getUserDocuments = async (req, res, next) => {
  try {
    const userId = req.params.id;
    
    // Find user
    const user = await User.findById(userId);
    
    // Check if user exists
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Find documents for this user
    const documents = await Document.find({ uploadedBy: userId })
      .sort({ createdAt: -1 });
    
    // Return documents
    res.status(200).json({
      success: true,
      data: documents
    });
  } catch (error) {
    logger.error(`Error getting user documents: ${error.message}`);
    next(error);
  }
};

// @desc    Upload user document
// @route   POST /api/admin/users/:id/documents
// @access  Private (Admin, Super Admin)
exports.uploadUserDocument = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const { type, name } = req.body;
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Process uploaded file
    let file;
    
    if (req.file) {
      // Multer approach
      file = req.file;
      file.path = file.path.replace(/\\/g, '/'); // Normalize path for Windows
    } else if (req.files && (req.files.document || req.files.documents)) {
      // Express-fileupload approach
      const uploadedFile = req.files.document || req.files.documents;
      
      // Handle both single file and array of files
      const filesToProcess = Array.isArray(uploadedFile) ? uploadedFile : [uploadedFile];
      const processedFiles = [];
      
      for (const currentFile of filesToProcess) {
        // Create directory for user if it doesn't exist
        const uploadDir = path.join(__dirname, '../../uploads/users', userId);
        
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        // Generate unique filename
        const extension = path.extname(currentFile.name);
        const filename = uuidv4() + extension;
        const filePath = path.join(uploadDir, filename);
        
        // Save file
        await currentFile.mv(filePath);
        
        // Create document record
        const documentType = type || 'other';
        const documentName = name || currentFile.name;
        
        const document = await Document.create({
          uploadedBy: userId,
          type: documentType,
          name: documentName,
          fileName: filename,
          originalName: currentFile.name,
          mimeType: currentFile.mimetype,
          size: currentFile.size,
          path: filePath.replace(/\\/g, '/'), // Normalize path for Windows
          status: 'pending'
        });
        
        processedFiles.push(document);
      }
      
      // Return created documents
      return res.status(201).json({
        success: true,
        data: processedFiles,
        message: `${processedFiles.length} document(s) uploaded successfully`
      });
    }
    
    // Handle single file upload through Multer
    if (file) {
      const document = await Document.create({
        uploadedBy: userId,
        type: type || 'other',
        name: name || file.originalname,
        fileName: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        path: file.path,
        status: 'pending'
      });
      
      return res.status(201).json({
        success: true,
        data: document
      });
    }
    
    // If no file was processed
    return res.status(400).json({
      success: false,
      message: 'No file uploaded or file upload failed'
    });
  } catch (error) {
    logger.error(`Error uploading user document: ${error.message}`);
    next(error);
  }
};

// @desc    Add new client
// @route   POST /api/admin/clients
// @access  Private (Admin, Partner)
exports.addClient = async (req, res, next) => {
  try {
    const { name, email, phone, status, group } = req.body;
    
    // Check if client with this email already exists
    const existingClient = await Client.findOne({ email });
    if (existingClient) {
      return res.status(400).json({
        success: false,
        message: 'Client with this email already exists'
      });
    }
    
    // Create new client
    const client = await Client.create({
      name,
      email,
      phone,
      status: status || 'Nou',
      group: group || null,
      assignedTo: req.user._id
    });
    
    // Create a user account for the client
    // Use phone number as password
    const user = await User.create({
      name,
      email,
      password: phone, // Using phone as password
      role: 'client',
      isActive: true,
      clientId: client._id
    });
    
    // Link the user to the client
    client.userId = user._id;
    await client.save();
    
    // Return new client
    res.status(201).json({
      success: true,
      data: client
    });
  } catch (error) {
    logger.error(`Error adding client: ${error.message}`);
    next(error);
  }
};

// @desc    Add new group
// @route   POST /api/admin/groups
// @access  Private (Admin)
exports.addGroup = async (req, res, next) => {
  try {
    const { name, description, startDate, endDate, capacity, status, instructor } = req.body;
    
    // Check if group with this name already exists
    const existingGroup = await Group.findOne({ name });
    if (existingGroup) {
      return res.status(400).json({
        success: false,
        message: 'Group with this name already exists'
      });
    }
    
    // Create new group
    const group = await Group.create({
      name,
      description,
      startDate,
      endDate,
      capacity: capacity || 25,
      status: status || 'Planned',
      instructor: instructor || null
    });
    
    // Return new group
    res.status(201).json({
      success: true,
      data: group
    });
  } catch (error) {
    logger.error(`Error adding group: ${error.message}`);
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

// @desc    Get client by ID with full details
// @route   GET /api/admin/clients/:id
// @access  Private (Admin, Partner)
exports.getClientById = async (req, res, next) => {
  try {
    const clientId = req.params.id;
    
    // Find client with populated references
    const client = await Client.findById(clientId)
      .populate('group', 'name startDate endDate')
      .populate('assignedTo', 'name email')
      .populate('notes.createdBy', 'name');
    
    // Check if client exists
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }
    
    // Return client details
    res.status(200).json({
      success: true,
      data: client
    });
  } catch (error) {
    logger.error(`Error getting client details: ${error.message}`);
    next(error);
  }
};

// @desc    Update client
// @route   PUT /api/admin/clients/:id
// @access  Private (Admin, Partner)
exports.updateClient = async (req, res, next) => {
  try {
    const clientId = req.params.id;
    const updateData = req.body;
    
    // Ensure email uniqueness when updating
    if (updateData.email) {
      const existingClient = await Client.findOne({ 
        email: updateData.email,
        _id: { $ne: clientId }
      });
      
      if (existingClient) {
        return res.status(400).json({
          success: false,
          message: 'Another client with this email already exists'
        });
      }
    }
    
    // Find and update client
    const client = await Client.findByIdAndUpdate(
      clientId,
      updateData,
      { new: true, runValidators: true }
    );
    
    // Check if client exists
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }
    
    // Return updated client
    res.status(200).json({
      success: true,
      data: client
    });
  } catch (error) {
    logger.error(`Error updating client: ${error.message}`);
    next(error);
  }
};

// @desc    Add note to client
// @route   POST /api/admin/clients/:id/notes
// @access  Private (Admin, Partner)
exports.addClientNote = async (req, res, next) => {
  try {
    const clientId = req.params.id;
    const { text } = req.body;
    
    // Validate required fields
    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Please provide note text'
      });
    }
    
    // Find client
    const client = await Client.findById(clientId);
    
    // Check if client exists
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }
    
    // Add note to client
    const note = {
      text,
      createdBy: req.user._id,
      createdAt: Date.now()
    };
    
    client.notes.push(note);
    await client.save();
    
    // Return success response
    res.status(201).json({
      success: true,
      data: note
    });
  } catch (error) {
    logger.error(`Error adding client note: ${error.message}`);
    next(error);
  }
};

// @desc    Assign client to group
// @route   PUT /api/admin/clients/:id/assign-group
// @access  Private (Admin, Partner)
exports.assignClientToGroup = async (req, res, next) => {
  try {
    const clientId = req.params.id;
    const { groupId } = req.body;
    
    // Validate required fields
    if (!groupId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide group ID'
      });
    }
    
    // Check if group exists
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }
    
    // Check group capacity
    const clientsInGroup = await Client.countDocuments({ group: groupId });
    if (clientsInGroup >= group.capacity) {
      return res.status(400).json({
        success: false,
        message: 'Group has reached maximum capacity'
      });
    }
    
    // Assign client to group
    const client = await Client.findByIdAndUpdate(
      clientId,
      { 
        group: groupId,
        status: 'În progres'  // Update status when assigned to group
      },
      { new: true }
    );
    
    // Check if client exists
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }
    
    // Return updated client
    res.status(200).json({
      success: true,
      data: client
    });
  } catch (error) {
    logger.error(`Error assigning client to group: ${error.message}`);
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

// @desc    Get client statistics and summary
// @route   GET /api/admin/clients/statistics
// @access  Private (Admin, Partner)
exports.getClientStatistics = async (req, res, next) => {
  try {
    // Get client status distribution
    const statusDistribution = await Client.aggregate([
      { $match: { isArchived: false } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    // Convert to object for easier frontend consumption
    const statusCounts = {};
    statusDistribution.forEach(item => {
      statusCounts[item._id] = item.count;
    });
    
    // Get registrations by month
    const registrationsByMonth = await Client.aggregate([
      { 
        $match: { 
          isArchived: false,
          registrationDate: { 
            $gte: new Date(new Date().getFullYear(), 0, 1) // Start of current year
          }
        } 
      },
      {
        $group: {
          _id: { 
            month: { $month: "$registrationDate" },
            year: { $year: "$registrationDate" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);
    
    // Format registration data for chart display
    const monthNames = ['Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie', 
                        'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'];
    
    const formattedRegistrations = registrationsByMonth.map(item => ({
      month: monthNames[item._id.month - 1],
      year: item._id.year,
      count: item.count
    }));
    
    // Get recent clients
    const recentClients = await Client.find({ isArchived: false })
      .select('name email phone status registrationDate')
      .sort({ registrationDate: -1 })
      .limit(5);
    
    // Return client statistics
    res.status(200).json({
      success: true,
      data: {
        statusCounts,
        registrationsByMonth: formattedRegistrations,
        recentClients
      }
    });
  } catch (error) {
    logger.error(`Error getting client statistics: ${error.message}`);
    next(error);
  }
};

// NOTIFICATIONS MANAGEMENT CONTROLLERS

// @desc    Get all notifications (admin view)
// @route   GET /api/admin/notifications
// @access  Private (Admin)
exports.getNotifications = async (req, res, next) => {
  try {
    // Pregătim opțiunile de filtrare
    let filter = {};
    
    // Filtru pentru tip de notificare
    if (req.query.type && req.query.type !== 'all') {
      filter.type = req.query.type;
    }
    
    // Căutare în titlu sau mesaj
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { message: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    // Opțiuni paginare
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Opțiuni sortare
    const sort = { createdAt: -1 }; // Sortare implicită după data creării (descendent)
    
    // Executăm query pentru notificări cu paginare
    const notifications = await Notification.find(filter)
      .populate('recipient', 'name email')
      .populate('sender', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    // Obține numărul total pentru paginare
    const total = await Notification.countDocuments(filter);
    
    // Trimite răspunsul
    res.status(200).json({
      success: true,
      count: notifications.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      },
      data: notifications
    });
  } catch (error) {
    logger.error(`Error getting admin notifications: ${error.message}`);
    next(error);
  }
};

// @desc    Delete notification (admin)
// @route   DELETE /api/admin/notifications/:id
// @access  Private (Admin)
exports.deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    await notification.remove();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    logger.error(`Error deleting notification: ${error.message}`);
    next(error);
  }
};

// @desc    Create system notification for multiple recipients
// @route   POST /api/admin/notifications
// @access  Private (Admin)
exports.createSystemNotification = async (req, res, next) => {
  try {
    const { title, message, type, recipients, recipientRole, priority, actionLink, expiresAt } = req.body;
    
    // Validăm datele de intrare
    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title and message'
      });
    }
    
    // Pregătim array-ul pentru destinatari
    let userIds = [];
    
    // Determinăm lista de utilizatori destinatari
    if (recipientRole) {
      // Trimitem notificări către toți utilizatorii cu un anumit rol
      const users = await User.find({ role: recipientRole, isActive: true });
      userIds = users.map(user => user._id);
    } else if (recipients && Array.isArray(recipients) && recipients.length > 0) {
      // Trimitem notificări către lista specifică de utilizatori
      userIds = recipients;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Please provide either recipients array or recipientRole'
      });
    }
    
    // Verificăm dacă avem destinatari
    if (userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No recipients found'
      });
    }
    
    // Trimitem notificările către toți destinatarii
    const notificationPromises = userIds.map(userId => {
      return Notification.create({
        title,
        message,
        type: type || 'info',
        recipient: userId,
        sender: req.user._id,
        priority: priority || 'Medium',
        actionLink,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined
      });
    });
    
    await Promise.all(notificationPromises);
    
    // Trimitem răspunsul
    res.status(201).json({
      success: true,
      message: `Sent notifications to ${userIds.length} users`,
      count: userIds.length
    });
  } catch (error) {
    logger.error(`Error creating system notifications: ${error.message}`);
    next(error);
  }
};

// @desc    Generate a temporary token for mobile app push notifications
// @route   POST /api/admin/notifications/push-token
// @access  Private (Admin)
exports.generatePushToken = async (req, res, next) => {
  try {
    // Generăm un token special pentru integrarea cu sistemul de notificări push
    // Acest token va fi folosit de serverul de notificări push pentru autentificare
    
    const token = jwt.sign(
      { 
        id: req.user._id,
        role: req.user.role,
        purpose: 'push-notifications' 
      },
      process.env.JWT_SECRET,
      { 
        expiresIn: '30d' // Token valabil 30 de zile
      }
    );
    
    // Returnăm token-ul
    res.status(200).json({
      success: true,
      token,
      expiresIn: '30 days'
    });
  } catch (error) {
    logger.error(`Error generating push token: ${error.message}`);
    next(error);
  }
};

// @desc    Get notification statistics
// @route   GET /api/admin/notifications/stats
// @access  Private (Admin)
exports.getNotificationStats = async (req, res, next) => {
  try {
    // Total notificări
    const totalCount = await Notification.countDocuments();
    
    // Notificări grupate după tip
    const typeStats = await Notification.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Notificări active (necitite)
    const unreadCount = await Notification.countDocuments({ read: false });
    
    // Notificări trimise astăzi
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCount = await Notification.countDocuments({ createdAt: { $gte: today } });
    
    // Notificări grupate după prioritate
    const priorityStats = await Notification.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Top 5 utilizatori care primesc cele mai multe notificări
    const topRecipients = await Notification.aggregate([
      { $group: { _id: '$recipient', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { 
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { 
        $project: {
          _id: 1,
          count: 1,
          user: { $arrayElemAt: ['$user', 0] }
        }
      },
      {
        $project: {
          _id: 1,
          count: 1,
          'user.name': 1,
          'user.email': 1
        }
      }
    ]);
    
    // Returnăm statisticile
    res.status(200).json({
      success: true,
      data: {
        totalCount,
        unreadCount,
        todayCount,
        typeStats,
        priorityStats,
        topRecipients
      }
    });
  } catch (error) {
    logger.error(`Error getting notification stats: ${error.message}`);
    next(error);
  }
};