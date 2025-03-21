const Client = require('../models/Client');
const Group = require('../models/Group');
const User = require('../models/User');
const Document = require('../models/Document');
const mongoose = require('mongoose');
const logger = require('../utils/logger');

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
      const fs = require('fs');
      const path = require('path');
      const { v4: uuidv4 } = require('uuid');
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
        const fs = require('fs');
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
    const fs = require('fs');
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
    const fs = require('fs');
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
      limit = 10, 
      search = '', 
      role, 
      sortBy = 'createdAt', 
      sortOrder = 'desc' 
    } = req.query;
    
    // Build query
    const query = { isActive: true };
    
    // Check user role for access restrictions
    if (req.user.role !== 'admin' && req.user.role !== 'super-admin') {
      // Regular partners can only see clients
      query.role = 'client';
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
      .select('name email role organization position lastLogin createdAt')
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
