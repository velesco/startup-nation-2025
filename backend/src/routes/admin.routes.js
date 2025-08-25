const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

// Importăm controllere separate 
const { getDashboardStats, getUsersStatistics, getClientStatistics } = require('../controllers/stats.controller');
const { getUsers, getUserById, updateUser, addUser, generateUserToken, sendUserDataToExternalAPI, updateSubmissionStatus, updateIneligibleStatus } = require('../controllers/users.controller');
const { 
  getClientDocuments, uploadClientDocument, 
  getUserDocuments, uploadUserDocument,
  downloadDocument, deleteDocument, 
  downloadUserContract, downloadUserConsultingContract, downloadUserAuthorityDocument,
  updateDocumentFlags
} = require('../controllers/documents.controller');
const { 
  updateAllContracts,
  getContractInfo,
  getContractsCounts
} = require('../controllers/contracts.controller');

// Importăm controllerul pentru împuterniciri
const { generateAuthorityDocumentForUser } = require('../controllers/contract.controller.authority');
const {
  getClients,
  getGroups,
  addClient,
  addGroup,
  getClientById,
  updateClient,
  addClientNote,
  assignClientToGroup
} = require('../controllers/admin.controller');

// Notification controllers
const {
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

// User statistics route
router.get('/users/statistics', authorize('admin', 'partner'), getUsersStatistics);

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

// User routes - restricted to admin and partner
router.route('/users')
  .get(authorize('admin', 'partner'), getUsers)
  .post(authorize('admin', 'partner'), addUser);

router.route('/users/:id')
  .get(authorize('admin', 'partner'), getUserById)
  .put(authorize('admin', 'partner'), updateUser);

// User Contract Download  
router.get('/users/:id/download-contract', authorize('admin', 'partner', 'super-admin'), downloadUserContract);

// User Consulting Contract Download
router.get('/users/:id/download-consulting-contract', authorize('admin', 'partner', 'super-admin'), downloadUserConsultingContract);

// User Authority Document Download
router.get('/users/:id/download-authority-document', authorize('admin', 'partner', 'super-admin'), downloadUserAuthorityDocument);

// Generate Authority Document for User
router.post('/contracts/admin/generate-authority/:userId', authorize('admin', 'partner', 'super-admin'), generateAuthorityDocumentForUser);

// Update user submission status
router.post('/users/:id/update-submission', authorize('admin', 'partner', 'super-admin'), updateSubmissionStatus);

// Update user ineligible status
router.post('/users/:id/update-ineligible', authorize('admin', 'partner', 'super-admin'), updateIneligibleStatus);

// Send user data to external API
router.post('/users/:id/send-data', authorize('admin', 'super-admin'), sendUserDataToExternalAPI);

// Update document flags for all users and clients
router.post('/update-document-flags', authorize('admin', 'super-admin'), updateDocumentFlags);

// Update contract status for all users
router.post('/update-contracts', authorize('admin', 'super-admin'), updateAllContracts);

// Get contract info for a user
router.get('/users/:id/contract-info', authorize('admin', 'super-admin'), getContractInfo);

// Get counts of contracts
router.get('/contracts/counts', authorize('admin', 'super-admin'), getContractsCounts);

// User Document routes
router.route('/users/:id/documents')
  .get(authorize('admin', 'partner', 'super-admin'), getUserDocuments)
  .post(authorize('admin', 'partner', 'super-admin'), uploadUserDocument);

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