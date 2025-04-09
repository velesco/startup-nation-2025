const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const {
  getDashboardStats,
  getClients,
  getGroups,
  getUsers,
  getUserById,
  updateUser,
  addUser,
  addClient,
  addGroup,
  getClientById,
  updateClient,
  addClientNote,
  assignClientToGroup,
  getClientStatistics,
  getClientDocuments,
  uploadClientDocument,
  getUserDocuments,
  uploadUserDocument,
  downloadDocument,
  deleteDocument,
  generateUserToken,
  // Notification controllers
  getNotifications,
  deleteNotification,
  createSystemNotification,
  generatePushToken,
  getNotificationStats
} = require('../controllers/admin.controller');

// Apply protection middleware to all routes
router.use(protect);

// Dashboard routes
router.get('/dashboard', authorize('admin', 'partner'), getDashboardStats);

// Client routes
router.route('/clients')
  .get(authorize('admin', 'partner'), getClients)
  .post(authorize('admin', 'partner'), addClient);

router.get('/clients/statistics', authorize('admin', 'partner'), getClientStatistics);

router.route('/clients/:id')
  .get(authorize('admin', 'partner'), getClientById)
  .put(authorize('admin', 'partner'), updateClient);

router.post('/clients/:id/notes', authorize('admin', 'partner'), addClientNote);
router.put('/clients/:id/assign-group', authorize('admin', 'partner'), assignClientToGroup);

// Client Document routes
router.route('/clients/:id/documents')
  .get(authorize('admin', 'partner'), getClientDocuments)
  .post(authorize('admin', 'partner'), uploadClientDocument); // Am eliminat upload.single('file') pentru a permite și express-fileupload

router.get('/documents/:id/download', authorize('admin', 'partner'), downloadDocument);
router.delete('/documents/:id', authorize('admin', 'partner'), deleteDocument);

// Group routes
router.route('/groups')
  .get(authorize('admin', 'partner'), getGroups)
  .post(authorize('admin'), addGroup);

// User routes - restricted to admin only
router.route('/users')
  .get(authorize('admin', 'super-admin'), getUsers)
  .post(authorize('admin', 'super-admin'), addUser);

router.route('/users/:id')
  .get(authorize('admin', 'super-admin'), getUserById)
  .put(authorize('admin', 'super-admin'), updateUser);

// User Document routes
router.route('/users/:id/documents')
  .get(authorize('admin', 'super-admin'), getUserDocuments)
  .post(authorize('admin', 'super-admin'), uploadUserDocument);

// User Token Generation for Contract Download
router.post('/generate-user-token', authorize('admin', 'partner', 'super-admin'), generateUserToken);

// Notification routes
router.route('/notifications')
  .get(authorize('admin', 'super-admin'), getNotifications)
  .post(authorize('admin', 'super-admin'), createSystemNotification);

router.get('/notifications/stats', authorize('admin', 'super-admin'), getNotificationStats);
router.post('/notifications/push-token', authorize('admin', 'super-admin'), generatePushToken);
router.delete('/notifications/:id', authorize('admin', 'super-admin'), deleteNotification);

module.exports = router;