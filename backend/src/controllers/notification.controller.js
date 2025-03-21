const Notification = require('../models/Notification');
const User = require('../models/User');
const logger = require('../utils/logger');

// @desc    Get all notifications for user
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res, next) => {
  try {
    // Prepare filter options
    const filter = {
      recipient: req.user.id
    };
    
    // Filter by read status if provided
    if (req.query.read !== undefined) {
      filter.read = req.query.read === 'true';
    }
    
    // Filter by type if provided
    if (req.query.type) {
      filter.type = req.query.type;
    }
    
    // Filter by priority if provided
    if (req.query.priority) {
      filter.priority = req.query.priority;
    }
    
    // Remove expired notifications
    await Notification.deleteMany({
      expiresAt: { $lt: new Date() }
    });
    
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    // Execute query with pagination
    const notifications = await Notification.find(filter)
      .populate('sender', 'name')
      .skip(startIndex)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    // Get total count for pagination
    const total = await Notification.countDocuments(filter);
    
    // Get unread count
    const unreadCount = await Notification.countDocuments({
      recipient: req.user.id,
      read: false
    });
    
    res.status(200).json({
      success: true,
      count: notifications.length,
      unreadCount,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      },
      data: notifications
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a notification
// @route   GET /api/notifications/:id
// @access  Private
exports.getNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    // Check if user is authorized to view this notification
    if (notification.recipient.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this notification'
      });
    }
    
    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a notification
// @route   POST /api/notifications
// @access  Private (Admin/Partner)
exports.createNotification = async (req, res, next) => {
  try {
    const { title, message, type, priority, recipient, relatedTo, actionLink, expiresAt } = req.body;
    
    // Check if required fields are provided
    if (!title || !message || !recipient) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, message, and recipient'
      });
    }
    
    // Check if recipient exists
    const user = await User.findById(recipient);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Recipient not found'
      });
    }
    
    // Create notification
    const notification = await Notification.create({
      title,
      message,
      type: type || 'info',
      priority: priority || 'Medium',
      recipient,
      sender: req.user.id,
      relatedTo,
      actionLink,
      expiresAt
    });
    
    res.status(201).json({
      success: true,
      data: notification
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    // Check if user is authorized
    if (notification.recipient.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this notification'
      });
    }
    
    // Update read status
    notification.read = true;
    notification.readAt = new Date();
    await notification.save();
    
    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, read: false },
      { read: true, readAt: new Date() }
    );
    
    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    // Check if user is authorized
    if (notification.recipient.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this notification'
      });
    }
    
    await notification.remove();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create notification for multiple recipients
// @route   POST /api/notifications/batch
// @access  Private (Admin/Partner)
exports.createBatchNotifications = async (req, res, next) => {
  try {
    const { title, message, type, priority, recipients, relatedTo, actionLink, expiresAt } = req.body;
    
    // Check if required fields are provided
    if (!title || !message || !recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, message, and array of recipient IDs'
      });
    }
    
    // Check if all recipients exist
    const users = await User.find({ _id: { $in: recipients } });
    if (users.length !== recipients.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more recipients not found'
      });
    }
    
    // Create notifications
    const notifications = await Promise.all(
      recipients.map(recipient => {
        return Notification.create({
          title,
          message,
          type: type || 'info',
          priority: priority || 'Medium',
          recipient,
          sender: req.user.id,
          relatedTo,
          actionLink,
          expiresAt
        });
      })
    );
    
    res.status(201).json({
      success: true,
      count: notifications.length,
      data: notifications
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create notification for all users with a specific role
// @route   POST /api/notifications/role
// @access  Private (Admin)
exports.createRoleNotifications = async (req, res, next) => {
  try {
    const { title, message, type, priority, role, relatedTo, actionLink, expiresAt } = req.body;
    
    // Check if required fields are provided
    if (!title || !message || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, message, and role'
      });
    }
    
    // Get all users with the specified role
    const users = await User.find({ role });
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No users found with the specified role'
      });
    }
    
    // Create notifications for all users
    const notificationPromises = users.map(user => {
      return Notification.create({
        title,
        message,
        type: type || 'info',
        priority: priority || 'Medium',
        recipient: user._id,
        sender: req.user.id,
        relatedTo,
        actionLink,
        expiresAt
      });
    });
    
    const notifications = await Promise.all(notificationPromises);
    
    res.status(201).json({
      success: true,
      count: notifications.length,
      message: `Sent notification to ${notifications.length} users`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get notification count
// @route   GET /api/notifications/count
// @access  Private
exports.getNotificationCount = async (req, res, next) => {
  try {
    // Get unread count
    const unreadCount = await Notification.countDocuments({
      recipient: req.user.id,
      read: false
    });
    
    res.status(200).json({
      success: true,
      unreadCount
    });
  } catch (error) {
    next(error);
  }
};
