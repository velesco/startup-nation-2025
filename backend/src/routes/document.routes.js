const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const { 
  uploadDocument, 
  getUserDocuments, 
  deleteDocument 
} = require('../controllers/document.controller');

// Protected routes
router.post('/upload', protect, uploadDocument);
router.get('/', protect, getUserDocuments);
router.delete('/:id', protect, deleteDocument);

module.exports = router;