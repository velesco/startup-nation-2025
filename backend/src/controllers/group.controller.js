const Group = require('../models/Group');
const Client = require('../models/Client');
const User = require('../models/User');
const mongoose = require('mongoose');
const logger = require('../utils/logger');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');

/**
 * @desc    Get all groups with pagination and filtering
 * @route   GET /api/groups
 * @access  Private (Admin, Partner)
 */
exports.getGroups = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      status = '', 
      sortBy = 'startDate', 
      sortOrder = 'desc' 
    } = req.query;
    
    // Build query
    const query = { isArchived: false };
    
    // Handle user role-based access
    if (req.user.role === 'partner') {
      // Partners can only see groups they've created
      query.instructor = req.user._id;
    }
    
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
    
    // Get groups with population
    const groups = await Group.find(query)
      .populate('instructor', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get client count for each group
    const groupsWithClientCount = await Promise.all(
      groups.map(async (group) => {
        const clientCount = await Client.countDocuments({ 
          group: group._id,
          isArchived: false
        });
        
        const groupObj = group.toObject();
        groupObj.clientCount = clientCount;
        
        return groupObj;
      })
    );
    
    // Count total documents for pagination
    const total = await Group.countDocuments(query);
    
    // Return group list with pagination
    res.status(200).json({
      success: true,
      data: groupsWithClientCount,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error(`Error getting groups: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Get group by ID
 * @route   GET /api/groups/:id
 * @access  Private (Admin, Partner)
 */
exports.getGroupById = async (req, res, next) => {
  try {
    const groupId = req.params.id;
    
    // Get group with populated instructor
    const group = await Group.findById(groupId)
      .populate('instructor', 'name email');
    
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }
    
    // Check if user has access to this group (admin or the instructor)
    if (req.user.role === 'partner' && 
       (!group.instructor || group.instructor._id.toString() !== req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this group'
      });
    }
    
    // Get client count
    const clientCount = await Client.countDocuments({ 
      group: group._id,
      isArchived: false 
    });
    
    // Add client count to group data
    const groupData = group.toObject();
    groupData.clientCount = clientCount;
    
    // Return group data
    res.status(200).json({
      success: true,
      data: groupData
    });
  } catch (error) {
    logger.error(`Error getting group: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Create new group
 * @route   POST /api/groups
 * @access  Private (Admin, Partner)
 */
exports.createGroup = async (req, res, next) => {
  try {
    const { 
      name, 
      description, 
      startDate, 
      endDate, 
      capacity, 
      status, 
      instructor 
    } = req.body;
    
    // Check if group with this name already exists
    const existingGroup = await Group.findOne({ name, isArchived: false });
    if (existingGroup) {
      return res.status(400).json({
        success: false,
        message: 'A group with this name already exists'
      });
    }
    
    // Create new group
    const newGroup = await Group.create({
      name,
      description,
      startDate,
      endDate,
      capacity: capacity || 25,
      status: status || 'Planned',
      instructor: instructor || req.user._id
    });
    
    // Return created group
    res.status(201).json({
      success: true,
      data: newGroup
    });
  } catch (error) {
    logger.error(`Error creating group: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Update group
 * @route   PUT /api/groups/:id
 * @access  Private (Admin, Partner)
 */
exports.updateGroup = async (req, res, next) => {
  try {
    const groupId = req.params.id;
    const updateData = req.body;
    
    // Get group
    const group = await Group.findById(groupId);
    
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }
    
    // Check if user has access to update this group
    if (req.user.role === 'partner' && 
       (!group.instructor || group.instructor.toString() !== req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this group'
      });
    }
    
    // Check for name uniqueness
    if (updateData.name && updateData.name !== group.name) {
      const existingGroup = await Group.findOne({ 
        name: updateData.name, 
        isArchived: false,
        _id: { $ne: groupId }
      });
      
      if (existingGroup) {
        return res.status(400).json({
          success: false,
          message: 'A group with this name already exists'
        });
      }
    }
    
    // Update group
    const updatedGroup = await Group.findByIdAndUpdate(
      groupId,
      updateData,
      { new: true, runValidators: true }
    ).populate('instructor', 'name email');
    
    // Return updated group
    res.status(200).json({
      success: true,
      data: updatedGroup
    });
  } catch (error) {
    logger.error(`Error updating group: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Delete group
 * @route   DELETE /api/groups/:id
 * @access  Private (Admin, Partner)
 */
exports.deleteGroup = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const groupId = req.params.id;
    
    // Get group
    const group = await Group.findById(groupId);
    
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }
    
    // Check if user has access to delete this group
    if (req.user.role === 'partner' && 
       (!group.instructor || group.instructor.toString() !== req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this group'
      });
    }
    
    // Check if group has clients
    const clientCount = await Client.countDocuments({ 
      group: groupId,
      isArchived: false 
    });
    
    if (clientCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Group has clients. Please remove all clients before deleting.'
      });
    }
    
    // Delete (archive) group
    await Group.findByIdAndUpdate(
      groupId,
      { isArchived: true },
      { session }
    );
    
    await session.commitTransaction();
    
    // Return success
    res.status(200).json({
      success: true,
      message: 'Group deleted successfully'
    });
  } catch (error) {
    await session.abortTransaction();
    logger.error(`Error deleting group: ${error.message}`);
    next(error);
  } finally {
    session.endSession();
  }
};

/**
 * @desc    Get clients in a group
 * @route   GET /api/groups/:id/clients
 * @access  Private (Admin, Partner)
 */
exports.getGroupClients = async (req, res, next) => {
  try {
    const groupId = req.params.id;
    
    // Get group
    const group = await Group.findById(groupId);
    
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }
    
    // Check if user has access to this group
    if (req.user.role === 'partner' && 
       (!group.instructor || group.instructor.toString() !== req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this group'
      });
    }
    
    // Get clients in this group
    const clients = await Client.find({ 
      group: groupId,
      isArchived: false 
    }).select('name email phone status registrationDate');
    
    // Return clients
    res.status(200).json({
      success: true,
      data: clients
    });
  } catch (error) {
    logger.error(`Error getting group clients: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Add clients to group
 * @route   POST /api/groups/:id/clients
 * @access  Private (Admin, Partner)
 */
exports.addClientsToGroup = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const groupId = req.params.id;
    const { clientIds } = req.body;
    
    if (!clientIds || !Array.isArray(clientIds) || clientIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid client IDs'
      });
    }
    
    // Get group
    const group = await Group.findById(groupId);
    
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }
    
    // Check if user has access to this group
    if (req.user.role === 'partner' && 
       (!group.instructor || group.instructor.toString() !== req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to modify this group'
      });
    }
    
    // Check if group is full
    const currentClientCount = await Client.countDocuments({ 
      group: groupId,
      isArchived: false 
    });
    
    if (group.capacity && currentClientCount + clientIds.length > group.capacity) {
      return res.status(400).json({
        success: false,
        message: `Group capacity (${group.capacity}) would be exceeded by adding ${clientIds.length} more clients`
      });
    }
    
    // Get list of valid clients
    const clients = await Client.find({ 
      _id: { $in: clientIds },
      isArchived: false 
    });
    
    if (clients.length !== clientIds.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more client IDs are invalid'
      });
    }
    
    // Add clients to group and update their status
    await Client.updateMany(
      { _id: { $in: clientIds } },
      { 
        group: groupId,
        status: 'În progres'
      },
      { session }
    );
    
    await session.commitTransaction();
    
    // Return success
    res.status(200).json({
      success: true,
      message: `${clientIds.length} clients added to group successfully`
    });
  } catch (error) {
    await session.abortTransaction();
    logger.error(`Error adding clients to group: ${error.message}`);
    next(error);
  } finally {
    session.endSession();
  }
};

/**
 * @desc    Remove client from group
 * @route   DELETE /api/groups/:id/clients/:clientId
 * @access  Private (Admin, Partner)
 */
exports.removeClientFromGroup = async (req, res, next) => {
  try {
    const groupId = req.params.id;
    const clientId = req.params.clientId;
    
    // Get group
    const group = await Group.findById(groupId);
    
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }
    
    // Check if user has access to this group
    if (req.user.role === 'partner' && 
       (!group.instructor || group.instructor.toString() !== req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to modify this group'
      });
    }
    
    // Get client
    const client = await Client.findById(clientId);
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }
    
    if (!client.group || client.group.toString() !== groupId) {
      return res.status(400).json({
        success: false,
        message: 'Client is not in this group'
      });
    }
    
    // Remove client from group
    client.group = null;
    await client.save();
    
    // Return success
    res.status(200).json({
      success: true,
      message: 'Client removed from group successfully'
    });
  } catch (error) {
    logger.error(`Error removing client from group: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Get group meetings
 * @route   GET /api/groups/:id/meetings
 * @access  Private (Admin, Partner)
 */
exports.getGroupMeetings = async (req, res, next) => {
  try {
    const groupId = req.params.id;
    
    // Get group
    const group = await Group.findById(groupId);
    
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }
    
    // Check if user has access to this group
    if (req.user.role === 'partner' && 
       (!group.instructor || group.instructor.toString() !== req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this group'
      });
    }
    
    // Return meetings
    res.status(200).json({
      success: true,
      data: group.meetings || []
    });
  } catch (error) {
    logger.error(`Error getting group meetings: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Create group meeting
 * @route   POST /api/groups/:id/meetings
 * @access  Private (Admin, Partner)
 */
exports.createGroupMeeting = async (req, res, next) => {
  try {
    const groupId = req.params.id;
    const { date, duration, location, topic, description } = req.body;
    
    // Get group
    const group = await Group.findById(groupId);
    
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }
    
    // Check if user has access to this group
    if (req.user.role === 'partner' && 
       (!group.instructor || group.instructor.toString() !== req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to modify this group'
      });
    }
    
    // Create meeting
    const meeting = {
      _id: new mongoose.Types.ObjectId(),
      date,
      duration: duration || 120,
      location,
      topic,
      description,
      materials: []
    };
    
    group.meetings.push(meeting);
    await group.save();
    
    // Return created meeting
    res.status(201).json({
      success: true,
      data: meeting
    });
  } catch (error) {
    logger.error(`Error creating group meeting: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Update group meeting
 * @route   PUT /api/groups/:id/meetings/:meetingId
 * @access  Private (Admin, Partner)
 */
exports.updateGroupMeeting = async (req, res, next) => {
  try {
    const groupId = req.params.id;
    const meetingId = req.params.meetingId;
    const updateData = req.body;
    
    // Get group
    const group = await Group.findById(groupId);
    
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }
    
    // Check if user has access to this group
    if (req.user.role === 'partner' && 
       (!group.instructor || group.instructor.toString() !== req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to modify this group'
      });
    }
    
    // Find meeting index
    const meetingIndex = group.meetings.findIndex(
      m => m._id.toString() === meetingId
    );
    
    if (meetingIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found in this group'
      });
    }
    
    // Update meeting fields
    if (updateData.date) group.meetings[meetingIndex].date = updateData.date;
    if (updateData.duration) group.meetings[meetingIndex].duration = updateData.duration;
    if (updateData.location) group.meetings[meetingIndex].location = updateData.location;
    if (updateData.topic) group.meetings[meetingIndex].topic = updateData.topic;
    if (updateData.description) group.meetings[meetingIndex].description = updateData.description;
    
    await group.save();
    
    // Return updated meeting
    res.status(200).json({
      success: true,
      data: group.meetings[meetingIndex]
    });
  } catch (error) {
    logger.error(`Error updating group meeting: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Delete group meeting
 * @route   DELETE /api/groups/:id/meetings/:meetingId
 * @access  Private (Admin, Partner)
 */
exports.deleteGroupMeeting = async (req, res, next) => {
  try {
    const groupId = req.params.id;
    const meetingId = req.params.meetingId;
    
    // Get group
    const group = await Group.findById(groupId);
    
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }
    
    // Check if user has access to this group
    if (req.user.role === 'partner' && 
       (!group.instructor || group.instructor.toString() !== req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to modify this group'
      });
    }
    
    // Find meeting index
    const meetingIndex = group.meetings.findIndex(
      m => m._id.toString() === meetingId
    );
    
    if (meetingIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found in this group'
      });
    }
    
    // Check for material files to delete
    const materials = group.meetings[meetingIndex].materials || [];
    
    if (materials.length > 0) {
      // Delete associated files
      materials.forEach(material => {
        if (material.path) {
          const filePath = path.join(__dirname, '../../', material.path);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
      });
    }
    
    // Remove meeting
    group.meetings.splice(meetingIndex, 1);
    await group.save();
    
    // Return success
    res.status(200).json({
      success: true,
      message: 'Meeting deleted successfully'
    });
  } catch (error) {
    logger.error(`Error deleting group meeting: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Send email to group members
 * @route   POST /api/groups/:id/send-email
 * @access  Private (Admin, Partner)
 */
exports.sendEmailToGroupMembers = async (req, res, next) => {
  try {
    const groupId = req.params.id;
    const { subject, message, recipients } = req.body;
    
    if (!subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email subject and message'
      });
    }
    
    // Get group
    const group = await Group.findById(groupId);
    
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }
    
    // Check if user has access to this group
    if (req.user.role === 'partner' && 
       (!group.instructor || group.instructor.toString() !== req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to send emails to this group'
      });
    }
    
    let emailList = [];
    
    // If specific recipients are provided, use them
    if (recipients && Array.isArray(recipients) && recipients.length > 0) {
      const clients = await Client.find({ 
        _id: { $in: recipients },
        group: groupId,
        isArchived: false 
      }).select('email');
      
      emailList = clients.map(client => client.email);
    } else {
      // Get all clients in this group
      const clients = await Client.find({ 
        group: groupId,
        isArchived: false 
      }).select('email');
      
      emailList = clients.map(client => client.email);
    }
    
    if (emailList.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid recipients found'
      });
    }
    
    // Check if email service is configured
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_PORT || 
        !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(500).json({
        success: false,
        message: 'Email service is not configured'
      });
    }
    
    // Set up email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_PORT === '465',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    
    // Prepare email data
    const mailOptions = {
      from: `"${req.user.name}" <${process.env.EMAIL_USER}>`,
      bcc: emailList.join(','), // Use BCC for privacy
      subject: subject,
      html: message
    };
    
    // Send email
    await transporter.sendMail(mailOptions);
    
    // Return success
    res.status(200).json({
      success: true,
      message: `Email sent to ${emailList.length} recipients`
    });
  } catch (error) {
    logger.error(`Error sending email to group members: ${error.message}`);
    next(error);
  }
};
