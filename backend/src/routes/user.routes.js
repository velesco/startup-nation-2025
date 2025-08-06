const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const { updateDocumentFlags } = require('../controllers/documentFlags.controller');
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateProfile,
  updatePassword,
  uploadProfilePicture,
  updateUserStatus,
  importUsers,
  getUsersStats,
  uploadIDCard,
  extractIDCardData,
  getProfile
} = require('../controllers/user.controller');

// Public routes (no auth required)

// Protected routes (logged in users)
router.route('/profile')
  .get(protect, getProfile)
  .put(protect, updateProfile);

router.route('/password')
  .put(protect, updatePassword);

router.route('/profile-picture')
  .post(protect, uploadProfilePicture);

router.route('/id-card')
  .post(protect, uploadIDCard);

router.route('/id-card/extract')
  .post(protect, extractIDCardData);

// Admin and partner routes
router.route('/')
  .get(protect, authorize('admin', 'partner'), getUsers)
  .post(protect, authorize('admin', 'partner'), createUser);

router.route('/:id')
  .get(protect, authorize('admin', 'partner'), getUserById)
  .put(protect, authorize('admin', 'partner'), updateUser)
  .delete(protect, authorize('admin', 'partner'), deleteUser);

router.route('/:id/status')
  .put(protect, authorize('admin'), updateUserStatus);

// Statistics route
router.get('/statistics', protect, authorize('admin', 'partner'), getUsersStats);

// Import users route
router.post('/import', protect, authorize('admin', 'partner'), importUsers);

// Rută pentru actualizarea flag-urilor de documente
router.post('/update-document-flags', protect, authorize('admin'), updateDocumentFlags);

module.exports = router;