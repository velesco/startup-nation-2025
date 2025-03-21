const fs = require('fs').promises;
const path = require('path');
const { ApiError } = require('./ApiError');

/**
 * Delete a file from the filesystem
 * @param {string} filePath - Path to the file to be deleted
 * @returns {Promise<void>}
 */
const deleteFile = async (filePath) => {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw new ApiError(500, `Error deleting file: ${error.message}`);
    }
  }
};

/**
 * Create a directory if it doesn't exist
 * @param {string} dirPath - Path to the directory
 * @returns {Promise<void>}
 */
const createDirectoryIfNotExists = async (dirPath) => {
  try {
    await fs.access(dirPath);
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.mkdir(dirPath, { recursive: true });
    } else {
      throw new ApiError(500, `Error creating directory: ${error.message}`);
    }
  }
};

/**
 * Generate a unique filename
 * @param {string} originalFilename - Original filename
 * @returns {string} - Unique filename
 */
const generateUniqueFilename = (originalFilename) => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 12);
  const extension = path.extname(originalFilename);
  const basename = path.basename(originalFilename, extension);
  
  return `${basename}-${timestamp}-${randomString}${extension}`;
};

/**
 * Check if file type is allowed
 * @param {string} mimeType - File MIME type
 * @param {Array<string>} allowedTypes - Array of allowed MIME types
 * @returns {boolean} - True if file type is allowed
 */
const isAllowedFileType = (mimeType, allowedTypes) => {
  return allowedTypes.includes(mimeType);
};

/**
 * Check if file size is within limits
 * @param {number} fileSize - File size in bytes
 * @param {number} maxSizeInMB - Maximum allowed file size in MB
 * @returns {boolean} - True if file size is within limits
 */
const isWithinSizeLimit = (fileSize, maxSizeInMB) => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return fileSize <= maxSizeInBytes;
};

module.exports = {
  deleteFile,
  createDirectoryIfNotExists,
  generateUniqueFilename,
  isAllowedFileType,
  isWithinSizeLimit
};
