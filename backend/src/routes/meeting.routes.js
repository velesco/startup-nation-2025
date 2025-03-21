const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect, authorize } = require('../middlewares/auth');
const {
  getMeetings,
  getMeeting,
  createMeeting,
  updateMeeting,
  deleteMeeting,
  updateStatus,
  updateAttendance,
  addMaterial,
  deleteMaterial,
  getUpcomingMeetings,
  getMeetingStats
} = require('../controllers/meeting.controller');

// Set up file upload for meeting materials
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.env.UPLOAD_DIR, 'meeting-materials');
    
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
  const allowedExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.jpg', '.jpeg', '.png', '.txt'];
  
  // Check extension
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowedExtensions.includes(ext)) {
    return cb(new Error('Only document and image files are allowed!'), false);
  }
  
  cb(null, true);
};

// Initialize upload
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: process.env.MAX_FILE_SIZE * 1024 * 1024 } // MB to bytes
});

// Routes
router.route('/')
  .get(protect, getMeetings)
  .post(protect, authorize('admin', 'partner'), createMeeting);

router.route('/upcoming')
  .get(protect, getUpcomingMeetings);

router.route('/stats')
  .get(protect, authorize('admin', 'partner'), getMeetingStats);

router.route('/:id')
  .get(protect, getMeeting)
  .put(protect, authorize('admin', 'partner'), updateMeeting)
  .delete(protect, authorize('admin'), deleteMeeting);

router.route('/:id/status')
  .put(protect, authorize('admin', 'partner'), updateStatus);

router.route('/:id/attendance/:clientId')
  .put(protect, authorize('admin', 'partner'), updateAttendance);

router.route('/:id/materials')
  .post(protect, authorize('admin', 'partner'), upload.single('material'), addMaterial);

router.route('/:id/materials/:materialId')
  .delete(protect, authorize('admin', 'partner'), deleteMaterial);

module.exports = router;
