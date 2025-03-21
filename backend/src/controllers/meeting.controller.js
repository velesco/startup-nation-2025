const Meeting = require('../models/Meeting');
const Group = require('../models/Group');
const Client = require('../models/Client');
const Activity = require('../models/Activity');
const logger = require('../utils/logger');
const path = require('path');
const fs = require('fs');

// @desc    Get all meetings
// @route   GET /api/meetings
// @access  Private
exports.getMeetings = async (req, res, next) => {
  try {
    // Prepare filter options
    const filter = {};
    
    // Add filter by group if provided
    if (req.query.group) {
      filter.group = req.query.group;
    }
    
    // Add filter by organizer if provided
    if (req.query.organizer) {
      filter.organizer = req.query.organizer;
    }
    
    // Add filter by status
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    // Add filter for archived meetings
    if (req.query.archived === 'true') {
      filter.isArchived = true;
    } else {
      filter.isArchived = false; // Default to non-archived
    }
    
    // Date filter for upcoming meetings
    if (req.query.upcoming === 'true') {
      filter.date = { $gte: new Date() };
    }
    
    // Date filter for past meetings
    if (req.query.past === 'true') {
      filter.date = { $lt: new Date() };
    }
    
    // Date range filter
    if (req.query.startDate && req.query.endDate) {
      filter.date = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }
    
    // Handle search query
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { location: searchRegex }
      ];
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    // Execute query with pagination
    const meetings = await Meeting.find(filter)
      .populate('group', 'name')
      .populate('organizer', 'name')
      .skip(startIndex)
      .limit(limit)
      .sort({ date: 1 });
    
    // Get total count for pagination
    const total = await Meeting.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      count: meetings.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      },
      data: meetings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single meeting
// @route   GET /api/meetings/:id
// @access  Private
exports.getMeeting = async (req, res, next) => {
  try {
    const meeting = await Meeting.findById(req.params.id)
      .populate('group', 'name startDate')
      .populate('organizer', 'name email')
      .populate('attendance.client', 'name email businessDetails.companyName');
    
    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: meeting
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new meeting
// @route   POST /api/meetings
// @access  Private
exports.createMeeting = async (req, res, next) => {
  try {
    // Set the organizer to the current user if not specified
    if (!req.body.organizer) {
      req.body.organizer = req.user.id;
    }
    
    // Check if group exists
    const group = await Group.findById(req.body.group);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }
    
    // Calculate endDate based on date and duration if not provided
    if (!req.body.endDate && req.body.date && req.body.duration) {
      const startDate = new Date(req.body.date);
      req.body.endDate = new Date(startDate.getTime() + req.body.duration * 60000);
    }
    
    // Create meeting
    const meeting = await Meeting.create(req.body);
    
    // Add clients from group to meeting attendance
    const groupClients = await Client.find({ group: req.body.group });
    
    if (groupClients.length > 0) {
      const attendanceEntries = groupClients.map(client => ({
        client: client._id,
        status: 'Confirmed'
      }));
      
      meeting.attendance = attendanceEntries;
      await meeting.save();
    }
    
    // Log activity
    await Activity.create({
      actor: req.user.id,
      actorName: req.user.name,
      action: 'a creat o întâlnire nouă',
      type: 'meeting_create',
      details: `Întâlnire: ${meeting.title} pentru grupa ${group.name}`,
      relatedTo: {
        modelType: 'Meeting',
        modelId: meeting._id,
        modelName: meeting.title
      }
    });
    
    res.status(201).json({
      success: true,
      data: meeting
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update meeting
// @route   PUT /api/meetings/:id
// @access  Private
exports.updateMeeting = async (req, res, next) => {
  try {
    let meeting = await Meeting.findById(req.params.id);
    
    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found'
      });
    }
    
    // Calculate endDate based on date and duration if not provided
    if (!req.body.endDate && req.body.date && req.body.duration) {
      const startDate = new Date(req.body.date);
      req.body.endDate = new Date(startDate.getTime() + req.body.duration * 60000);
    }
    
    // Update the meeting
    meeting = await Meeting.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    // Log activity
    await Activity.create({
      actor: req.user.id,
      actorName: req.user.name,
      action: 'a actualizat o întâlnire',
      type: 'meeting_update',
      details: `Întâlnire: ${meeting.title}`,
      relatedTo: {
        modelType: 'Meeting',
        modelId: meeting._id,
        modelName: meeting.title
      }
    });
    
    res.status(200).json({
      success: true,
      data: meeting
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete meeting
// @route   DELETE /api/meetings/:id
// @access  Private
exports.deleteMeeting = async (req, res, next) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    
    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found'
      });
    }
    
    // Instead of deleting, mark as archived
    meeting.isArchived = true;
    await meeting.save();
    
    // Log activity
    await Activity.create({
      actor: req.user.id,
      actorName: req.user.name,
      action: 'a arhivat o întâlnire',
      type: 'meeting_delete',
      details: `Întâlnire: ${meeting.title}`,
      relatedTo: {
        modelType: 'Meeting',
        modelId: meeting._id,
        modelName: meeting.title
      }
    });
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update meeting status
// @route   PUT /api/meetings/:id/status
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
    
    const meeting = await Meeting.findById(req.params.id);
    
    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found'
      });
    }
    
    // Update status
    meeting.status = status;
    await meeting.save();
    
    // Log activity
    await Activity.create({
      actor: req.user.id,
      actorName: req.user.name,
      action: `a schimbat statusul întâlnirii la ${status}`,
      type: 'meeting_update',
      details: `Întâlnire: ${meeting.title}, Status: ${status}`,
      relatedTo: {
        modelType: 'Meeting',
        modelId: meeting._id,
        modelName: meeting.title
      }
    });
    
    res.status(200).json({
      success: true,
      data: meeting
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update attendance for a client
// @route   PUT /api/meetings/:id/attendance/:clientId
// @access  Private
exports.updateAttendance = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const { id, clientId } = req.params;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an attendance status'
      });
    }
    
    const meeting = await Meeting.findById(id);
    
    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found'
      });
    }
    
    // Find the client in attendance
    const attendanceIndex = meeting.attendance.findIndex(a => a.client.toString() === clientId);
    
    if (attendanceIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Client not found in meeting attendance'
      });
    }
    
    // Update attendance
    meeting.attendance[attendanceIndex].status = status;
    
    if (notes) {
      meeting.attendance[attendanceIndex].notes = notes;
    }
    
    if (status === 'Attended' && !meeting.attendance[attendanceIndex].checkinTime) {
      meeting.attendance[attendanceIndex].checkinTime = new Date();
    }
    
    await meeting.save();
    
    // Get client details for activity log
    const client = await Client.findById(clientId);
    
    // Log activity
    await Activity.create({
      actor: req.user.id,
      actorName: req.user.name,
      action: `a marcat ${client.name} ca ${status === 'Attended' ? 'prezent' : status === 'Absent' ? 'absent' : status === 'Excused' ? 'absent motivat' : status}`,
      type: 'meeting_update',
      details: `Întâlnire: ${meeting.title}, Participant: ${client.name}`,
      relatedTo: {
        modelType: 'Meeting',
        modelId: meeting._id,
        modelName: meeting.title
      }
    });
    
    res.status(200).json({
      success: true,
      data: meeting.attendance[attendanceIndex]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add material to meeting
// @route   POST /api/meetings/:id/materials
// @access  Private
exports.addMaterial = async (req, res, next) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    
    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found'
      });
    }
    
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }
    
    // Add material to meeting
    meeting.materials.push({
      name: req.body.name || req.file.originalname,
      description: req.body.description || '',
      path: req.file.path,
      mimeType: req.file.mimetype,
      size: req.file.size,
      uploadedBy: req.user.id,
      uploadDate: new Date()
    });
    
    await meeting.save();
    
    // Return the newly added material
    const newMaterial = meeting.materials[meeting.materials.length - 1];
    
    // Log activity
    await Activity.create({
      actor: req.user.id,
      actorName: req.user.name,
      action: 'a încărcat un material nou',
      type: 'document_upload',
      details: `Material: ${newMaterial.name} pentru întâlnirea "${meeting.title}"`,
      relatedTo: {
        modelType: 'Meeting',
        modelId: meeting._id,
        modelName: meeting.title
      }
    });
    
    res.status(200).json({
      success: true,
      data: newMaterial
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete material from meeting
// @route   DELETE /api/meetings/:id/materials/:materialId
// @access  Private
exports.deleteMaterial = async (req, res, next) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    
    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found'
      });
    }
    
    // Find material
    const material = meeting.materials.id(req.params.materialId);
    
    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }
    
    // Delete file from filesystem
    try {
      fs.unlinkSync(material.path);
    } catch (err) {
      logger.error(`Failed to delete file: ${err.message}`);
      // Continue even if file deletion fails
    }
    
    // Remove material from meeting
    material.remove();
    await meeting.save();
    
    // Log activity
    await Activity.create({
      actor: req.user.id,
      actorName: req.user.name,
      action: 'a șters un material',
      type: 'meeting_update',
      details: `Material: ${material.name} pentru întâlnirea "${meeting.title}"`,
      relatedTo: {
        modelType: 'Meeting',
        modelId: meeting._id,
        modelName: meeting.title
      }
    });
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get upcoming meetings
// @route   GET /api/meetings/upcoming
// @access  Private
exports.getUpcomingMeetings = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 5;
    
    // Get upcoming meetings
    const meetings = await Meeting.find({
      date: { $gte: new Date() },
      isArchived: false
    })
      .populate('group', 'name')
      .populate('organizer', 'name')
      .sort({ date: 1 })
      .limit(limit);
    
    res.status(200).json({
      success: true,
      count: meetings.length,
      data: meetings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get meeting stats
// @route   GET /api/meetings/stats
// @access  Private
exports.getMeetingStats = async (req, res, next) => {
  try {
    // Total meetings
    const totalMeetings = await Meeting.countDocuments({ isArchived: false });
    
    // Upcoming meetings
    const upcomingMeetings = await Meeting.countDocuments({
      date: { $gte: new Date() },
      isArchived: false
    });
    
    // Past meetings
    const pastMeetings = await Meeting.countDocuments({
      date: { $lt: new Date() },
      isArchived: false
    });
    
    // Meetings by status
    const byStatus = await Meeting.aggregate([
      { $match: { isArchived: false } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    // Average attendance percentage
    const meetingsWithAttendance = await Meeting.find({
      status: 'Completed',
      'attendance.0': { $exists: true }
    });
    
    let avgAttendance = 0;
    if (meetingsWithAttendance.length > 0) {
      const totalAttendancePercentage = meetingsWithAttendance.reduce((acc, meeting) => {
        const attended = meeting.attendance.filter(a => a.status === 'Attended').length;
        const total = meeting.attendance.length;
        return acc + (total > 0 ? (attended / total) * 100 : 0);
      }, 0);
      
      avgAttendance = totalAttendancePercentage / meetingsWithAttendance.length;
    }
    
    res.status(200).json({
      success: true,
      data: {
        totalMeetings,
        upcomingMeetings,
        pastMeetings,
        byStatus: byStatus.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
        avgAttendance: Math.round(avgAttendance * 10) / 10 // Round to 1 decimal place
      }
    });
  } catch (error) {
    next(error);
  }
};
