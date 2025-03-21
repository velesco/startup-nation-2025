const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { ApiError } = require('../utils/ApiError');
const { generateUniqueFilename, createDirectoryIfNotExists } = require('../utils/fileHelper');

// Get upload directory from environment variable or use default
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
const maxFileSize = (process.env.MAX_FILE_SIZE || 10) * 1024 * 1024; // Default: 10MB

// Ensure upload directory exists
try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (error) {
  console.error('Error creating upload directory:', error);
}

// Define storage
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      // Create subdirectories based on file type
      let targetDir = uploadDir;
      
      if (file.fieldname === 'document') {
        targetDir = path.join(uploadDir, 'documents');
      } else if (file.fieldname === 'profilePicture') {
        targetDir = path.join(uploadDir, 'profile-pictures');
      }
      
      await createDirectoryIfNotExists(targetDir);
      cb(null, targetDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueFilename = generateUniqueFilename(file.originalname);
    cb(null, uniqueFilename);
  }
});

// File filter for documents
const documentFilter = (req, file, cb) => {
  cb(null, true);
};

// File filter for profile pictures
const imageFilter = (req, file, cb) => {
  cb(null, true);
};

// Create multer instances
const upload = multer({
  storage,
  limits: {
    fileSize: maxFileSize
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'document') {
      documentFilter(req, file, cb);
    } else if (file.fieldname === 'profilePicture') {
      imageFilter(req, file, cb);
    } else {
      cb(null, true);
    }
  }
});

// Handle multer errors
const handleMulterErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(new ApiError(400, `Fișierul este prea mare. Dimensiunea maximă este ${maxFileSize / (1024 * 1024)}MB.`));
    }
    return next(new ApiError(400, err.message));
  }
  next(err);
};

module.exports = {
  upload,
  handleMulterErrors
};
