const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const {
  getDashboardStats,
  getClients,
  getGroups,
  getUsers,
  addClient,
  addGroup,
  getClientById,
  updateClient,
  addClientNote,
  assignClientToGroup,
  getClientStatistics,
  getClientDocuments,
  uploadClientDocument,
  downloadDocument,
  deleteDocument
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
router.get('/users', authorize('admin', 'super-admin'), getUsers);

module.exports = router;