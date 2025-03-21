const Document = require('../models/Document');
const User = require('../models/User');
const logger = require('../utils/logger');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// @desc    Upload document
// @route   POST /api/documents/upload
// @access  Private
exports.uploadDocument = async (req, res, next) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0 || !req.files.document) {
      return res.status(400).json({
        success: false,
        message: 'No document uploaded'
      });
    }

    const file = req.files.document;
    const { type } = req.body;
    const userId = req.user.id;
    
    // Obținem utilizatorul pentru a avea acces la clientId
    const user = await User.findById(userId);
    
    // Definim clientId - poate fi null dacă utilizatorul nu are un client asociat
    const clientId = user.clientId || null;

    // Validate file type
    // Optional approach - only block potentially harmful file types
    const blockedMimeTypes = ['application/x-msdownload', 'application/x-msdos-program'];
    if (blockedMimeTypes.includes(file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'This file type is not allowed for security reasons'
      });
    }

    // Validate file size (5MB max)
    const maxSize = 12 * 1024 * 1024;
    if (file.size > maxSize) {
      return res.status(400).json({
        success: false,
        message: 'File is too large. Maximum file size is 5MB'
      });
    }

    // Create upload directory if it doesn't exist
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Generate a unique filename
    const fileExtension = path.extname(file.name);
    const fileName = `${type}_${uuidv4()}${fileExtension}`;
    const filePath = path.join(uploadDir, fileName);

    // Move the file to the upload directory
    await file.mv(filePath);

    // Pregătim datele pentru documentul nou
    const documentData = {
      uploadedBy: userId,
      type,
      name: file.name,
      fileName,
      originalName: file.name,
      mimeType: file.mimetype,
      size: file.size,
      path: `uploads/${fileName}`,
      status: 'pending'
    };
    
    // Adăugăm clientId doar dacă există
    if (clientId) {
      documentData.clientId = clientId;
    }
    
    // Create document record in database
    const document = await Document.create(documentData);

    // Update user's documents status
    // Mai întâi verificăm dacă tipul de document este valid pentru campul nostru
    if (type === 'identity' || type === 'id_card') {
      // Actualizăm starea documentelor utilizatorului
      await User.findByIdAndUpdate(userId, { 
        $set: { 'documents.id_cardUploaded': true } 
      });
    }

    // Send response
    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: {
        id: document._id,
        type: document.type,
        fileName: document.fileName,
        originalName: document.originalName,
        status: document.status,
        createdAt: document.createdAt
      }
    });
  } catch (error) {
    logger.error(`Document upload error: ${error.message}`);
    next(error);
  }
};

// @desc    Get all user documents
// @route   GET /api/documents
// @access  Private
exports.getUserDocuments = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Obținem utilizatorul pentru a avea acces la clientId
    const user = await User.findById(userId);
    const clientId = user.clientId;
    
    // Construim query-ul de căutare
    let query = { uploadedBy: userId };
    
    // Dacă utilizatorul are un client asociat, căutăm și după clientId
    if (clientId) {
      query = { $or: [{ clientId }, { uploadedBy: userId }] };
    }

    // Găsim toate documentele pentru utilizator
    const documents = await Document.find(query).sort({ createdAt: -1 });

    // Send response
    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents.map(doc => ({
        id: doc._id,
        type: doc.type,
        fileName: doc.fileName,
        originalName: doc.originalName,
        status: doc.status,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt
      }))
    });
  } catch (error) {
    logger.error(`Get user documents error: ${error.message}`);
    next(error);
  }
};

// @desc    Delete a document
// @route   DELETE /api/documents/:id
// @access  Private
exports.deleteDocument = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const documentId = req.params.id;

    // Find the document
    const document = await Document.findById(documentId);

    // Check if document exists
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Obținem utilizatorul pentru a avea acces la clientId
    const user = await User.findById(userId);
    const clientId = user.clientId;

    // Verificăm dacă documentul aparține utilizatorului
    const isOwner = 
      (clientId && document.clientId && document.clientId.toString() === clientId.toString()) || 
      (document.uploadedBy && document.uploadedBy.toString() === userId);
      
    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to delete this document'
      });
    }

    // Delete the file from the filesystem
    const filePath = path.join(__dirname, '../../', document.path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete the document from the database
    await Document.deleteOne({ _id: document._id });

    // Update user's documents status if needed
    // This is more complex as we need to check if there are other documents of the same type
    let query = { uploadedBy: userId, type: document.type, _id: { $ne: documentId } };
    
    if (clientId) {
      query = {
        $or: [
          { clientId, type: document.type, _id: { $ne: documentId } },
          { uploadedBy: userId, type: document.type, _id: { $ne: documentId } }
        ]
      };
    }
    
    const otherDocumentsOfSameType = await Document.findOne(query);

    if (!otherDocumentsOfSameType) {
      // Actualizarea depinde de tipul documentului
      if (document.type === 'id_card') {
        await User.findByIdAndUpdate(userId, {
          $set: { 'documents.id_cardUploaded': false }
        });
      }
    }

    // Send response
    res.status(200).json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    logger.error(`Delete document error: ${error.message}`);
    next(error);
  }
};
