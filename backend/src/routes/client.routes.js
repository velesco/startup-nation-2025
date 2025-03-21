const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect, authorize } = require('../middlewares/auth');
const { 
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
  addNote,
  updateStatus,
  assignToGroup,
  uploadDocument,
  deleteDocument,
  getStats,
  importClients
} = require('../controllers/client.controller');

// Set up file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.env.UPLOAD_DIR, 'client-docs');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Create a unique filename with original extension
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Allowed extensions
  const allowedExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.jpg', '.jpeg', '.png'];
  
  // Check extension
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowedExtensions.includes(ext)) {
    return cb(new Error('Only PDF, Word, Excel, and image files are allowed!'), false);
  }
  
  cb(null, true);
};

// Initialize upload
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: process.env.MAX_FILE_SIZE * 1024 * 1024 } // MB to bytes
});

// Protected routes
router.route('/')
  .get(protect, getClients)
  .post(protect, createClient);

router.route('/stats')
  .get(protect, getStats);

router.route('/import')
  .post(protect, importClients);

router.route('/:id')
  .get(protect, getClient)
  .put(protect, updateClient)
  .delete(protect, authorize('admin', 'super-admin'), deleteClient);

router.route('/:id/notes')
  .post(protect, addNote);

router.route('/:id/status')
  .put(protect, updateStatus);

router.route('/:id/group')
  .put(protect, assignToGroup);

router.route('/:id/documents')
  .post(protect, upload.single('document'), uploadDocument);

router.route('/:id/documents/:docId')
  .delete(protect, deleteDocument);

module.exports = router;
