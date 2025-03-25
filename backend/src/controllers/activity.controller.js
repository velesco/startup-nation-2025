const Activity = require('../models/Activity');
const logger = require('../utils/logger');

// @desc    Log new activity
// @route   POST /api/activities
// @access  Private
exports.logActivity = async (req, res, next) => {
  try {
    const { action, details, metadata } = req.body;
    
    if (!action) {
      return res.status(400).json({
        success: false,
        message: 'Action field is required'
      });
    }
    
    const activity = await Activity.create({
      action,
      user: req.user.id,
      details: details || '',
      ipAddress: req.ip || req.connection?.remoteAddress,
      userAgent: req.headers?.['user-agent'],
      metadata: metadata || {}
    });
    
    res.status(201).json({
      success: true,
      data: activity
    });
  } catch (error) {
    logger.error(`Log activity error: ${error.message}`);
    next(error);
  }
};

// @desc    Get recent activities
// @route   GET /api/activities/recent
// @access  Private
exports.getRecentActivities = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;
    
    // Get recent activities
    const activities = await Activity.find()
      .sort('-createdAt')
      .limit(parseInt(limit, 10))
      .populate('user', 'name email role');
    
    res.status(200).json({
      success: true,
      count: activities.length,
      data: activities
    });
  } catch (error) {
    logger.error(`Get recent activities error: ${error.message}`);
    next(error);
  }
};

// @desc    Get activities related to a resource
// @route   GET /api/activities/resource/:modelType/:modelId
// @access  Private
exports.getResourceActivities = async (req, res, next) => {
  try {
    const { modelType, modelId } = req.params;
    const { limit = 20 } = req.query;
    
    // Build filter for resource-related activities
    const filter = {
      $or: [
        { 'metadata.modelType': modelType, 'metadata.modelId': modelId },
        { 'metadata.resourceType': modelType, 'metadata.resourceId': modelId }
      ]
    };
    
    // Get activities
    const activities = await Activity.find(filter)
      .sort('-createdAt')
      .limit(parseInt(limit, 10))
      .populate('user', 'name email role');
    
    res.status(200).json({
      success: true,
      count: activities.length,
      data: activities
    });
  } catch (error) {
    logger.error(`Get resource activities error: ${error.message}`);
    next(error);
  }
};

// @desc    Delete activity
// @route   DELETE /api/activities/:id
// @access  Private (Admin)
exports.deleteActivity = async (req, res, next) => {
  try {
    const activity = await Activity.findById(req.params.id);
    
    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }
    
    await activity.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    logger.error(`Delete activity error: ${error.message}`);
    next(error);
  }
};

// @desc    Get all activities with pagination and filters
// @route   GET /api/activities
// @access  Private (Admin)
exports.getActivities = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      user, 
      action, 
      startDate, 
      endDate,
      sort = '-createdAt'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (user) {
      filter.user = user;
    }
    
    if (action) {
      filter.action = action;
    }
    
    // Add date range if provided
    if (startDate || endDate) {
      filter.createdAt = {};
      
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      
      if (endDate) {
        // Set end date to end of day
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }
    
    // Calculate pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;
    
    // Execute query with pagination
    const activities = await Activity.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .populate('user', 'name email role');
      
    // Get total count
    const total = await Activity.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      count: activities.length,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      },
      data: activities
    });
  } catch (error) {
    logger.error(`Get activities error: ${error.message}`);
    next(error);
  }
};

// @desc    Get activities for a specific user
// @route   GET /api/activities/user/:userId
// @access  Private (Admin or User for own activities)
exports.getUserActivities = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20, action } = req.query;
    
    // Check if user has permission to view these activities
    if (req.user.role !== 'admin' && req.user.role !== 'super-admin' && req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view these activities'
      });
    }
    
    // Build filter
    const filter = { user: userId };
    
    if (action) {
      filter.action = action;
    }
    
    // Calculate pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;
    
    // Execute query
    const activities = await Activity.find(filter)
      .sort('-createdAt')
      .skip(skip)
      .limit(limitNum);
      
    // Get total count
    const total = await Activity.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      count: activities.length,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      },
      data: activities
    });
  } catch (error) {
    logger.error(`Get user activities error: ${error.message}`);
    next(error);
  }
};

// @desc    Get activity statistics
// @route   GET /api/activities/stats
// @access  Private (Admin)
exports.getActivityStats = async (req, res, next) => {
  try {
    // Get activity counts by type
    const activityCountsByType = await Activity.aggregate([
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Get activities by day (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const activitiesByDay = await Activity.aggregate([
      { 
        $match: { 
          createdAt: { $gte: thirtyDaysAgo } 
        } 
      },
      {
        $group: {
          _id: { 
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { 
        $project: {
          _id: 0,
          date: {
            $dateFromParts: {
              year: '$_id.year',
              month: '$_id.month',
              day: '$_id.day'
            }
          },
          count: 1
        }
      },
      { $sort: { date: 1 } }
    ]);
    
    // Get most active users
    const mostActiveUsers = await Activity.aggregate([
      { $group: { _id: '$user', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
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
          _id: 0,
          userId: '$_id',
          count: 1,
          user: { $arrayElemAt: ['$user', 0] }
        }
      },
      {
        $project: {
          userId: 1,
          count: 1,
          'user.name': 1,
          'user.email': 1,
          'user.role': 1
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        activityCountsByType,
        activitiesByDay,
        mostActiveUsers
      }
    });
  } catch (error) {
    logger.error(`Get activity stats error: ${error.message}`);
    next(error);
  }
};
