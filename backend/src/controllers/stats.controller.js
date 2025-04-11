const User = require('../models/User');
const Client = require('../models/Client');
const Group = require('../models/Group');
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

// @desc    Get user statistics
// @route   GET /api/admin/users/statistics
// @access  Private (Admin)
exports.getUsersStatistics = async (req, res, next) => {
  try {
    // Data curentă
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Data de ieri
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Data pentru mâine (pentru a include toată ziua de azi în interval)
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Utilizatori înregistrați azi
    const appliedToday = await User.countDocuments({
      createdAt: {
        $gte: today,
        $lt: tomorrow
      }
    });
    
    // Utilizatori înregistrați ieri
    const appliedYesterday = await User.countDocuments({
      createdAt: {
        $gte: yesterday,
        $lt: today
      }
    });
    
    // Utilizatori care au încărcat buletinul
    const idCardUploaded = await User.countDocuments({
      $or: [
        { 'documents.id_cardUploaded': true },
        { 'idCard.verified': true }
      ]
    });
    
    // Utilizatori care au generat contractele
    const contractsGenerated = await User.countDocuments({
      'documents.contractGenerated': true
    });
    
    // Utilizatori care au generat contractele de consultanță
    const consultingContractsGenerated = await User.countDocuments({
      $or: [
        { 'documents.consultingContractGenerated': true },
        { 'documents.consultingContractPath': { $exists: true } }
      ]
    });
    
    // Număr total de utilizatori
    const totalUsers = await User.countDocuments();
    
    res.status(200).json({
      success: true,
      data: {
        appliedToday,
        appliedYesterday,
        idCardUploaded,
        contractsGenerated,
        consultingContractsGenerated,
        totalUsers
      }
    });
  } catch (error) {
    logger.error(`Error getting user statistics: ${error.message}`);
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