const Activity = require('../models/Activity');
const logger = require('../utils/logger');

// @desc    Get all activities
// @route   GET /api/activities
// @access  Private (Admin)
exports.getActivities = async (req, res, next) => {
  try {
    // Prepare filter options
    const filter = {};
    
    // Filter by actor (user) if provided
    if (req.query.actor) {
      filter.actor = req.query.actor;
    }
    
    // Filter by type if provided
    if (req.query.type) {
      filter.type = req.query.type;
    }
    
    // Filter by visibility
    if (req.user.role !== 'admin') {
      filter.visibility = { $ne: 'Admin' };
      
      if (req.user.role !== 'partner') {
        filter.visibility = 'Public';
      }
    }
    
    // Filter by related model type and ID if provided
    if (req.query.modelType && req.query.modelId) {
      filter['relatedTo.modelType'] = req.query.modelType;
      filter['relatedTo.modelId'] = req.query.modelId;
    } else if (req.query.modelType) {
      filter['relatedTo.modelType'] = req.query.modelType;
    }
    
    // Date range filter
    if (req.query.startDate && req.query.endDate) {
      filter.timestamp = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    } else if (req.query.startDate) {
      filter.timestamp = { $gte: new Date(req.query.startDate) };
    } else if (req.query.endDate) {
      filter.timestamp = { $lte: new Date(req.query.endDate) };
    }
    
    // Handle search query
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { actorName: searchRegex },
        { action: searchRegex },
        { details: searchRegex },
        { 'relatedTo.modelName': searchRegex }
      ];
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;
    
    // Execute query with pagination
    const activities = await Activity.find(filter)
      .populate('actor', 'name')
      .skip(startIndex)
      .limit(limit)
      .sort({ timestamp: -1 });
    
    // Get total count for pagination
    const total = await Activity.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      count: activities.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      },
      data: activities
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recent activities
// @route   GET /api/activities/recent
// @access  Private
exports.getRecentActivities = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    
    // Prepare filter based on user role
    const filter = {};
    
    if (req.user.role !== 'admin') {
      filter.visibility = { $ne: 'Admin' };
      
      if (req.user.role !== 'partner') {
        filter.visibility = 'Public';
      }
    }
    
    // Get recent activities
    const activities = await Activity.find(filter)
      .populate('actor', 'name')
      .sort({ timestamp: -1 })
      .limit(limit);
    
    res.status(200).json({
      success: true,
      count: activities.length,
      data: activities
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get activities for a specific resource
// @route   GET /api/activities/resource/:modelType/:modelId
// @access  Private
exports.getResourceActivities = async (req, res, next) => {
  try {
    const { modelType, modelId } = req.params;
    
    if (!modelType || !modelId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide model type and ID'
      });
    }
    
    // Prepare filter based on user role
    const filter = {
      'relatedTo.modelType': modelType,
      'relatedTo.modelId': modelId
    };
    
    if (req.user.role !== 'admin') {
      filter.visibility = { $ne: 'Admin' };
      
      if (req.user.role !== 'partner') {
        filter.visibility = 'Public';
      }
    }
    
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    // Get activities
    const activities = await Activity.find(filter)
      .populate('actor', 'name')
      .skip(startIndex)
      .limit(limit)
      .sort({ timestamp: -1 });
    
    // Get total count for pagination
    const total = await Activity.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      count: activities.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      },
      data: activities
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Log an activity
// @route   POST /api/activities
// @access  Private
exports.logActivity = async (req, res, next) => {
  try {
    const { action, type, details, relatedTo, visibility } = req.body;
    
    if (!action || !type) {
      return res.status(400).json({
        success: false,
        message: 'Please provide action and type'
      });
    }
    
    // Create activity
    const activity = await Activity.create({
      actor: req.user.id,
      actorName: req.user.name,
      action,
      type,
      details,
      relatedTo,
      visibility: visibility || 'Public',
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });
    
    res.status(201).json({
      success: true,
      data: activity
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get activity statistics
// @route   GET /api/activities/stats
// @access  Private (Admin)
exports.getActivityStats = async (req, res, next) => {
  try {
    // Activities by type
    const byType = await Activity.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);
    
    // Activities by user (top 5)
    const byUser = await Activity.aggregate([
      { $group: { _id: '$actor', actorName: { $first: '$actorName' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    // Activities by day (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const byDay = await Activity.aggregate([
      { $match: { timestamp: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        byType: byType.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
        byUser,
        byDay: byDay.map(item => ({
          date: item._id,
          count: item.count
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an activity
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
    
    await activity.remove();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
