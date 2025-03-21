const Client = require('../models/Client');
const Group = require('../models/Group');
const logger = require('../utils/logger');
const path = require('path');
const fs = require('fs');

// @desc    Get all clients
// @route   GET /api/clients
// @access  Private
exports.getClients = async (req, res, next) => {
  try {
    // Prepare filter options
    const filter = {};
    
    // Handle user role-based access
    if (req.user.role === 'partner') {
      // Partners can only see clients they've added
      filter.assignedTo = req.user._id;
    }
    // Admins can see all clients
    
    // Add filter by status if provided
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    // Add filter by group if provided
    if (req.query.group) {
      filter.group = req.query.group;
    }
    
    // Add filter by assigned user if provided
    if (req.query.assignedTo) {
      filter.assignedTo = req.query.assignedTo;
    }
    
    // Add filter for archived clients
    if (req.query.archived === 'true') {
      filter.isArchived = true;
    } else {
      filter.isArchived = false; // Default to non-archived
    }
    
    // Handle search query
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { 'businessDetails.companyName': searchRegex }
      ];
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    // Execute query with pagination
    const clients = await Client.find(filter)
      .populate('group', 'name')
      .populate('assignedTo', 'name')
      .skip(startIndex)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    // Get total count for pagination
    const total = await Client.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      count: clients.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      },
      data: clients
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single client
// @route   GET /api/clients/:id
// @access  Private
exports.getClient = async (req, res, next) => {
  try {
    const client = await Client.findById(req.params.id)
      .populate('group', 'name startDate')
      .populate('assignedTo', 'name email')
      .populate('notes.createdBy', 'name');
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: client
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new client
// @route   POST /api/clients
// @access  Private
exports.createClient = async (req, res, next) => {
  try {
    // Check if client with this email already exists
    const existingClient = await Client.findOne({ email: req.body.email });
    if (existingClient) {
      return res.status(400).json({
        success: false,
        message: 'Client with this email already exists'
      });
    }
    
    // Set the assigned user to the current user if not specified
    if (!req.body.assignedTo) {
      req.body.assignedTo = req.user.id;
    }
    
    // Create client
    const client = await Client.create(req.body);
    
    res.status(201).json({
      success: true,
      data: client
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update client
// @route   PUT /api/clients/:id
// @access  Private
exports.updateClient = async (req, res, next) => {
  try {
    let client = await Client.findById(req.params.id);
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }
    
    // Update the client
    client = await Client.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: client
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete client
// @route   DELETE /api/clients/:id
// @access  Private
exports.deleteClient = async (req, res, next) => {
  try {
    const client = await Client.findById(req.params.id);
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }
    
    // Instead of deleting, mark as archived
    client.isArchived = true;
    await client.save();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add note to client
// @route   POST /api/clients/:id/notes
// @access  Private
exports.addNote = async (req, res, next) => {
  try {
    const client = await Client.findById(req.params.id);
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }
    
    // Add note
    client.notes.push({
      text: req.body.text,
      createdBy: req.user.id
    });
    
    await client.save();
    
    // Return the newly added note
    const newNote = client.notes[client.notes.length - 1];
    
    res.status(200).json({
      success: true,
      data: newNote
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update client status
// @route   PUT /api/clients/:id/status
// @access  Private
exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a status'
      });
    }
    
    const client = await Client.findById(req.params.id);
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }
    
    // Update status
    client.status = status;
    await client.save();
    
    res.status(200).json({
      success: true,
      data: client
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign client to group
// @route   PUT /api/clients/:id/group
// @access  Private
exports.assignToGroup = async (req, res, next) => {
  try {
    const { groupId } = req.body;
    
    // Validate group if provided
    if (groupId) {
      const group = await Group.findById(groupId);
      
      if (!group) {
        return res.status(404).json({
          success: false,
          message: 'Group not found'
        });
      }
      
      // Check if group is active
      if (group.status !== 'Active' && group.status !== 'Planned') {
        return res.status(400).json({
          success: false,
          message: 'Cannot assign client to a completed or cancelled group'
        });
      }
      
      // Check if group is full
      const clientsInGroup = await Client.countDocuments({ group: groupId });
      if (clientsInGroup >= group.capacity) {
        return res.status(400).json({
          success: false,
          message: 'Group is at full capacity'
        });
      }
    }
    
    // Update client
    const client = await Client.findByIdAndUpdate(
      req.params.id,
      { group: groupId || null },
      { new: true }
    );
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: client
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload document for client
// @route   POST /api/clients/:id/documents
// @access  Private
exports.uploadDocument = async (req, res, next) => {
  try {
    const client = await Client.findById(req.params.id);
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }
    
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }
    
    // Add document to client
    client.documents.push({
      name: req.body.name || req.file.originalname,
      path: req.file.path,
      mimeType: req.file.mimetype,
      size: req.file.size,
      category: req.body.category || 'Altele'
    });
    
    await client.save();
    
    // Return the newly added document
    const newDoc = client.documents[client.documents.length - 1];
    
    res.status(200).json({
      success: true,
      data: newDoc
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete document from client
// @route   DELETE /api/clients/:id/documents/:docId
// @access  Private
exports.deleteDocument = async (req, res, next) => {
  try {
    const client = await Client.findById(req.params.id);
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }
    
    // Find document
    const document = client.documents.id(req.params.docId);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }
    
    // Delete file from filesystem
    try {
      fs.unlinkSync(document.path);
    } catch (err) {
      logger.error(`Failed to delete file: ${err.message}`);
      // Continue even if file deletion fails
    }
    
    // Remove document from client
    document.remove();
    await client.save();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get client statistics
// @route   GET /api/clients/stats
// @access  Private
exports.getStats = async (req, res, next) => {
  try {
    // Total clients
    const totalClients = await Client.countDocuments({ isArchived: false });
    
    // Clients by status
    const byStatus = await Client.aggregate([
      { $match: { isArchived: false } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    // Clients created in current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const newClientsThisMonth = await Client.countDocuments({
      createdAt: { $gte: startOfMonth },
      isArchived: false
    });
    
    // Clients with complete status
    const completedClients = await Client.countDocuments({
      status: 'Complet',
      isArchived: false
    });
    
    res.status(200).json({
      success: true,
      data: {
        totalClients,
        byStatus: byStatus.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
        newClientsThisMonth,
        completedClients,
        conversionRate: totalClients > 0 
          ? Math.round((completedClients / totalClients) * 100) 
          : 0
      }
    });
  } catch (error) {
    next(error);
  }
};
// @desc    Import multiple clients
// @route   POST /api/clients/import
// @access  Private
exports.importClients = async (req, res, next) => {
  try {
    const { clients } = req.body;
    
    // Validate input
    if (!clients || !Array.isArray(clients) || clients.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid list of clients to import'
      });
    }
    
    const results = {
      success: [],
      errors: []
    };
    
    // Process each client
    for (const clientData of clients) {
      try {
        // Basic validation
        if (!clientData.name || !clientData.email) {
          results.errors.push({
            data: clientData,
            message: 'Missing required fields (name and email)'
          });
          continue;
        }
        
        // Check for duplicate email
        const existingClient = await Client.findOne({ email: clientData.email });
        if (existingClient) {
          results.errors.push({
            data: clientData,
            message: 'A client with this email already exists'
          });
          continue;
        }
        
        // Set default values
        const newClientData = {
          name: clientData.name,
          email: clientData.email.toLowerCase(),
          phone: clientData.phone || '',
          status: clientData.status || 'Nou',
          assignedTo: req.user.id, // Assign to current user
          businessDetails: {}
        };
        
        // Handle the company if provided
        if (clientData.businessDetails?.companyName || clientData.company) {
          newClientData.businessDetails.companyName = clientData.businessDetails?.companyName || clientData.company;
        }
        
        // Handle the group if provided
        if (clientData.group) {
          // Try to find group by name first
          let group = await Group.findOne({ name: clientData.group });
          
          // If not found by name, try to find by ID (if it looks like an ID)
          if (!group && clientData.group.match(/^[0-9a-fA-F]{24}$/)) {
            group = await Group.findById(clientData.group);
          }
          
          if (group) {
            newClientData.group = group._id;
          }
        }
        
        // Create the client
        const client = await Client.create(newClientData);
        results.success.push(client);
      } catch (error) {
        results.errors.push({
          data: clientData,
          message: error.message
        });
      }
    }
    
    // Return response
    res.status(200).json({
      success: true,
      message: `Imported ${results.success.length} clients with ${results.errors.length} errors`,
      data: {
        successful: results.success.length,
        failed: results.errors.length,
        errors: results.errors
      }
    });
  } catch (error) {
    logger.error(`Failed to import clients: ${error.message}`);
    next(error);
  }
};
