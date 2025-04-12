const Document = require('../models/Document');
const User = require('../models/User');
const Client = require('../models/Client');
const logger = require('../utils/logger');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// @desc    Get user documents
// @route   GET /api/admin/users/:id/documents
// @access  Private (Admin, Partner, Super Admin)
exports.getUserDocuments = async (req, res, next) => {
  try {
    const userId = req.params.id;
    
    // Find user
    const user = await User.findById(userId);
    
    // Check if user exists
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if partner is trying to access a user they didn't add
    if (req.user.role === 'partner' && 
        user.added_by && 
        user.added_by.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this user\'s documents'
      });
    }
    
    // Find documents for this user
    const documents = await Document.find({ uploadedBy: userId })
      .sort({ createdAt: -1 });
    
    // Return documents
    res.status(200).json({
      success: true,
      data: documents
    });
  } catch (error) {
    logger.error(`Error getting user documents: ${error.message}`);
    next(error);
  }
};

// @desc    Upload user document
// @route   POST /api/admin/users/:id/documents
// @access  Private (Admin, Partner, Super Admin)
exports.uploadUserDocument = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const { type, name } = req.body;
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if partner is trying to upload documents for a user they didn't add
    if (req.user.role === 'partner' && 
        user.added_by && 
        user.added_by.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to upload documents for this user'
      });
    }
    
    // Process uploaded file
    let file;
    
    if (req.file) {
      // Multer approach
      file = req.file;
      file.path = file.path.replace(/\\/g, '/'); // Normalize path for Windows
    } else if (req.files && (req.files.document || req.files.documents)) {
      // Express-fileupload approach
      const uploadedFile = req.files.document || req.files.documents;
      
      // Handle both single file and array of files
      const filesToProcess = Array.isArray(uploadedFile) ? uploadedFile : [uploadedFile];
      const processedFiles = [];
      
      for (const currentFile of filesToProcess) {
        // Create directory for user if it doesn't exist
        const uploadDir = path.join(__dirname, '../../uploads/users', userId);
        
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        // Generate unique filename
        const extension = path.extname(currentFile.name);
        const filename = uuidv4() + extension;
        const filePath = path.join(uploadDir, filename);
        
        // Save file
        await currentFile.mv(filePath);
        
        // Create document record
        const documentType = type || 'other';
        const documentName = name || currentFile.name;
        
        const document = await Document.create({
          uploadedBy: userId,
          type: documentType,
          name: documentName,
          fileName: filename,
          originalName: currentFile.name,
          mimeType: currentFile.mimetype,
          size: currentFile.size,
          path: filePath.replace(/\\/g, '/'), // Normalize path for Windows
          status: 'pending'
        });
        
        processedFiles.push(document);
      }
      
      // Return created documents
      return res.status(201).json({
        success: true,
        data: processedFiles,
        message: `${processedFiles.length} document(s) uploaded successfully`
      });
    }
    
    // Handle single file upload through Multer
    if (file) {
      const document = await Document.create({
        uploadedBy: userId,
        type: type || 'other',
        name: name || file.originalname,
        fileName: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        path: file.path,
        status: 'pending'
      });
      
      return res.status(201).json({
        success: true,
        data: document
      });
    }
    
    // If no file was processed
    return res.status(400).json({
      success: false,
      message: 'No file uploaded or file upload failed'
    });
  } catch (error) {
    logger.error(`Error uploading user document: ${error.message}`);
    next(error);
  }
};

// @desc    Get client documents
// @route   GET /api/admin/clients/:id/documents
// @access  Private (Admin, Partner)
exports.getClientDocuments = async (req, res, next) => {
  try {
    const clientId = req.params.id;
    
    // Find client
    const client = await Client.findById(clientId);
    
    // Check if client exists
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }
    
    // Find documents for this client
    const documents = await Document.find({ clientId: client._id })
      .sort({ createdAt: -1 });
    
    // Return documents
    res.status(200).json({
      success: true,
      data: documents
    });
  } catch (error) {
    logger.error(`Error getting client documents: ${error.message}`);
    next(error);
  }
};

// @desc    Upload client document
// @route   POST /api/admin/clients/:id/documents
// @access  Private (Admin, Partner)
exports.uploadClientDocument = async (req, res, next) => {
  try {
    const clientId = req.params.id;
    const { type, name } = req.body;
    
    // Verificăm dacă avem un fișier încărcat (fie prin multer, fie prin express-fileupload)
    let file;
    
    if (req.file) {
      // Varianta multer
      file = req.file;
      file.path = file.path.replace(/\\/g, '/'); // Normalizare path pentru Windows
    } else if (req.files && req.files.document) {
      // Varianta express-fileupload
      const uploadedFile = req.files.document;
      
      // Crearea directorului pentru client dacă nu există
      const uploadDir = path.join(__dirname, '../../uploads', clientId);
      
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      // Generare nume unic pentru fișier
      const extension = path.extname(uploadedFile.name);
      const filename = uuidv4() + extension;
      const filePath = path.join(uploadDir, filename);
      
      // Salvare fișier
      await uploadedFile.mv(filePath);
      
      // Creare obiect file similar cu cel returnat de multer
      file = {
        filename,
        originalname: uploadedFile.name,
        mimetype: uploadedFile.mimetype,
        size: uploadedFile.size,
        path: filePath.replace(/\\/g, '/') // Normalizare path pentru Windows
      };
    }
    
    // Validare - trebuie să avem un fișier
    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }
    
    // Find client
    const client = await Client.findById(clientId);
    
    // Check if client exists
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }
    
    try {
      // If file exists, create document record
      const document = await Document.create({
        clientId: client._id,
        type: type || 'other',
        name: name || file.originalname,
        fileName: file.filename, // De la multer sau generat manual
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        path: file.path,
        uploadedBy: req.user._id,
        uploadedAt: Date.now()
      });
      
      // Return created document
      return res.status(201).json({
        success: true,
        data: document
      });
    } catch (err) {
      logger.error(`Error creating document record: ${err.message}`);
      // Dacă apare o eroare la crearea documentului în baza de date, ștergem fișierul
      if (file && file.path) {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      }
      throw err;
    }
    
    // Return error if we reached here without a file
    return res.status(400).json({
      success: false,
      message: 'File upload failed or no file was provided'
    });
  } catch (error) {
    logger.error(`Error uploading client document: ${error.message}`);
    next(error);
  }
};

// @desc    Download document
// @route   GET /api/admin/documents/:id/download
// @access  Private (Admin, Partner)
exports.downloadDocument = async (req, res, next) => {
  try {
    const documentId = req.params.id;
    
    // Find document
    const document = await Document.findById(documentId);
    
    // Check if document exists
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }
    
    // Verificăm dacă fișierul există pe disc
    if (!fs.existsSync(document.path)) {
      return res.status(404).json({
        success: false,
        message: 'Document file not found on disk'
      });
    }
    
    // Return file for download
    res.download(document.path, document.originalName, (err) => {
      if (err) {
        logger.error(`Error downloading document: ${err.message}`);
        // Nu putem trimite un răspuns aici pentru că res.download deja a început să trimită date
      }
    });
  } catch (error) {
    logger.error(`Error downloading document: ${error.message}`);
    next(error);
  }
};

// @desc    Delete document
// @route   DELETE /api/admin/documents/:id
// @access  Private (Admin, Partner)
exports.deleteDocument = async (req, res, next) => {
  try {
    const documentId = req.params.id;
    
    // Find document
    const document = await Document.findById(documentId);
    
    // Check if document exists
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }
    
    // Delete file from storage
    if (fs.existsSync(document.path)) {
      fs.unlinkSync(document.path);
    }
    
    // Delete document from database
    await Document.deleteOne({ _id: documentId });
    
    // Return success response
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    logger.error(`Error deleting document: ${error.message}`);
    next(error);
  }
};

// @desc    Download user contract
// @route   GET /api/admin/users/:id/download-contract
// @access  Private (Admin, Partner, Super Admin)
exports.downloadUserContract = async (req, res, next) => {
  try {
    const userId = req.params.id;
    
    // Găsim utilizatorul
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilizator negăsit'
      });
    }
    
    // Check if partner is trying to download a contract for a user they didn't add
    if (req.user.role === 'partner' && 
        user.added_by && 
        user.added_by.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Nu aveți permisiunea să descărcați contractul acestui utilizator'
      });
    }
    
    // Importăm utilitarul de verificare a contractelor
    const { findContractFile, updateUserDocumentStatus } = require('./contracts.controller');
    
    // Actualizăm mai întâi statusul documentelor pentru a fi siguri că înregistrările sunt corecte
    await updateUserDocumentStatus(user);
    
    console.log(`Download contract requested for user: ${userId}`);
    console.log(`User document state after update: ${JSON.stringify(user.documents)}`);
    
    // Căutăm fișierul contractului
    const contractResult = await findContractFile(userId, 'standard');
    
    if (!contractResult.exists) {
      console.error(`Contract not found for user: ${userId}`);
      return res.status(404).json({
        success: false,
        message: 'Contractul nu a fost găsit. Te rugăm să generezi mai întâi contractul.',
        error: 'contract_not_found',
        shouldGenerate: true
      });
    }
    
    try {
      console.log(`Reading contract file from: ${contractResult.path}`);
      const fileBuffer = fs.readFileSync(contractResult.path);
      console.log(`Successfully read contract file, size: ${fileBuffer.length} bytes`);
      
      const isDocx = contractResult.format === 'docx';
      
      let displayName = user.idCard?.fullName;
      if (!displayName || displayName === 'test') {
        displayName = user.name || userId;
      }
      displayName = displayName.replace(/[ăâîșțĂÂÎȘȚ]/g, c => {
        const diacritics = {'ă':'a', 'â':'a', 'î':'i', 'ș':'s', 'ț':'t', 'Ă':'A', 'Â':'A', 'Î':'I', 'Ș':'S', 'Ț':'T'};
        return diacritics[c] || c;
      }).replace(/\s+/g, '_');
      
      const fileName = `contract_${displayName}${isDocx ? '.docx' : '.pdf'}`;
      
      console.log(`Using display name for contract: ${displayName}`);
      
      if (isDocx) {
        console.log(`Sending a DOCX file: ${fileName}`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      } else {
        console.log(`Sending a PDF file: ${fileName}`);
        res.setHeader('Content-Type', 'application/pdf');
      }
      
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      console.log(`Set headers for download, filename: ${fileName}`);
      
      if (req.files) {
        delete req.files;
      }
      
      console.log(`Sending file to client...`);
      return res.send(fileBuffer);
    } catch (readError) {
      logger.error(`Error reading contract file: ${readError.message}`);
      console.error(`Failed to read contract file: ${readError.message}`);
      return res.status(500).json({
        success: false,
        message: 'Eroare la citirea fișierului contract. Te rugăm să încerci din nou.',
        error: readError.message
      });
    }
  } catch (error) {
    logger.error(`Contract download error: ${error.message}`);
    next(error);
  }
};

// @desc    Download user consulting contract
// @route   GET /api/admin/users/:id/download-consulting-contract
// @access  Private (Admin, Partner, Super Admin)
exports.downloadUserConsultingContract = async (req, res, next) => {
  try {
    const userId = req.params.id;
    
    // Găsim utilizatorul
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilizator negăsit'
      });
    }
    
    // Check if partner is trying to download a contract for a user they didn't add
    if (req.user.role === 'partner' && 
        user.added_by && 
        user.added_by.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Nu aveți permisiunea să descărcați contractul de consultanță al acestui utilizator'
      });
    }
    
    // Importăm utilitarul de verificare a contractelor
    const { findContractFile, updateUserDocumentStatus } = require('./contracts.controller');
    
    // Actualizăm mai întâi statusul documentelor pentru a fi siguri că înregistrările sunt corecte
    await updateUserDocumentStatus(user);
    
    console.log(`Download consulting contract requested for user: ${userId}`);
    console.log(`User document state after update: ${JSON.stringify(user.documents)}`);
    
    // Căutăm fișierul contractului de consultanță
    const contractResult = await findContractFile(userId, 'consultanta');
    
    if (!contractResult.exists) {
      console.error(`Consulting contract not found for user: ${userId}`);
      return res.status(404).json({
        success: false,
        message: 'Contractul de consultanță nu a fost găsit. Te rugăm să generezi mai întâi contractul.',
        error: 'consulting_contract_not_found',
        shouldGenerate: true
      });
    }
    
    try {
      console.log(`Reading consulting contract file from: ${contractResult.path}`);
      const fileBuffer = fs.readFileSync(contractResult.path);
      console.log(`Successfully read consulting contract file, size: ${fileBuffer.length} bytes`);
      
      const isDocx = contractResult.format === 'docx';
      
      let displayName = user.idCard?.fullName;
      if (!displayName || displayName === 'test') {
        displayName = user.name || userId;
      }
      displayName = displayName.replace(/[ăâîșțĂÂÎȘȚ]/g, c => {
        const diacritics = {'ă':'a', 'â':'a', 'î':'i', 'ș':'s', 'ț':'t', 'Ă':'A', 'Â':'A', 'Î':'I', 'Ș':'S', 'Ț':'T'};
        return diacritics[c] || c;
      }).replace(/\s+/g, '_');
      
      const fileName = `contract_consultanta_${displayName}${isDocx ? '.docx' : '.pdf'}`;
      
      console.log(`Using display name for consulting contract: ${displayName}`);
      
      if (isDocx) {
        console.log(`Sending a DOCX file: ${fileName}`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      } else {
        console.log(`Sending a PDF file: ${fileName}`);
        res.setHeader('Content-Type', 'application/pdf');
      }
      
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      console.log(`Set headers for download, filename: ${fileName}`);
      
      if (req.files) {
        delete req.files;
      }
      
      console.log(`Sending file to client...`);
      return res.send(fileBuffer);
    } catch (readError) {
      logger.error(`Error reading consulting contract file: ${readError.message}`);
      console.error(`Failed to read consulting contract file: ${readError.message}`);
      return res.status(500).json({
        success: false,
        message: 'Eroare la citirea fișierului contract de consultanță. Te rugăm să încerci din nou.',
        error: readError.message
      });
    }
  } catch (error) {
    logger.error(`Consulting contract download error: ${error.message}`);
    next(error);
  }
};

// @desc    Run document flags update for existing users
// @route   POST /api/admin/update-document-flags
// @access  Private (Super Admin only)
exports.updateDocumentFlags = async (req, res, next) => {
  try {
    // Această rută este limitată doar la super-admin
    if (req.user.role !== 'super-admin' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Nu aveți permisiunea de a executa această acțiune'
      });
    }

    const fs = require('fs');
    const path = require('path');
    
    console.log('Începerea procesului de actualizare a flag-urilor de documente...');
    
    // Funcție pentru verificarea existenței fișierelor de contract
    const checkContractFile = async (userId) => {
      // Verificăm dacă există contract în diverse locații posibile
      const possiblePaths = [
        path.join(__dirname, `../../../uploads/contracts/contract_${userId}.pdf`),
        path.join(__dirname, `../../../uploads/contracts/contract_${userId}.docx`),
        path.join(__dirname, `../../../public/contracts/contract_${userId}.pdf`),
        path.join(__dirname, `../../../public/contracts/contract_${userId}.docx`)
      ];

      for (const filePath of possiblePaths) {
        if (fs.existsSync(filePath)) {
          console.log(`Contract găsit pentru user ${userId} la calea: ${filePath}`);
          return {
            exists: true,
            path: filePath,
            format: filePath.endsWith('.docx') ? 'docx' : 'pdf'
          };
        }
      }

      return { exists: false };
    };
    
    // Funcție pentru verificarea existenței fișierelor de contract de consultanță
    const checkConsultingContractFile = async (userId) => {
      // Verificăm dacă există contract de consultanță în diverse locații posibile
      const possiblePaths = [
        path.join(__dirname, `../../../uploads/contracts/contract_consultanta_${userId}.pdf`),
        path.join(__dirname, `../../../uploads/contracts/contract_consultanta_${userId}.docx`),
        path.join(__dirname, `../../../public/contracts/contract_consultanta_${userId}.pdf`),
        path.join(__dirname, `../../../public/contracts/contract_consultanta_${userId}.docx`)
      ];

      for (const filePath of possiblePaths) {
        if (fs.existsSync(filePath)) {
          console.log(`Contract de consultanță găsit pentru user ${userId} la calea: ${filePath}`);
          return {
            exists: true,
            path: filePath,
            format: filePath.endsWith('.docx') ? 'docx' : 'pdf'
          };
        }
      }

      return { exists: false };
    };
    
    // 1. Actualizăm utilizatorii
    const users = await User.find({});
    console.log(`Verificăm ${users.length} utilizatori...`);
    
    let updatedUsersCount = 0;
    let updatedUsers = [];
    
    for (const user of users) {
      let needsUpdate = false;
      
      // Verificăm dacă utilizatorul are documente
      const userDocuments = await Document.find({ uploadedBy: user._id });
      
      // Verificăm dacă există documente de identitate
      const idDocuments = userDocuments.filter(doc => 
        doc.type === 'identity' || doc.name.toLowerCase().includes('buletin') || 
        doc.name.toLowerCase().includes('card') || doc.name.toLowerCase().includes('identitate')
      );
      
      if (idDocuments.length > 0 && (!user.documents || !user.documents.id_cardUploaded)) {
        console.log(`Utilizatorul ${user.name} (${user._id}) are documente de identitate încărcate, dar flag-ul nu este setat`);
        if (!user.documents) {
          user.documents = {};
        }
        user.documents.id_cardUploaded = true;
        needsUpdate = true;
      }
      
      // Verificăm existența contractului
      const contractResult = await checkContractFile(user._id);
      if (contractResult.exists && (!user.documents || !user.documents.contractGenerated)) {
        console.log(`Utilizatorul ${user.name} (${user._id}) are contract generat, dar flag-ul nu este setat`);
        if (!user.documents) {
          user.documents = {};
        }
        user.documents.contractGenerated = true;
        user.documents.contractPath = `/uploads/contracts/contract_${user._id}.${contractResult.format}`;
        user.documents.contractFormat = contractResult.format;
        needsUpdate = true;
      }
      
      // Verificăm existența contractului de consultanță
      const consultingContractResult = await checkConsultingContractFile(user._id);
      if (consultingContractResult.exists && (!user.documents || !user.documents.consultingContractGenerated)) {
        console.log(`Utilizatorul ${user.name} (${user._id}) are contract de consultanță generat, dar flag-ul nu este setat`);
        if (!user.documents) {
          user.documents = {};
        }
        user.documents.consultingContractGenerated = true;
        user.documents.consultingContractPath = `/uploads/contracts/contract_consultanta_${user._id}.${consultingContractResult.format}`;
        user.documents.consultingContractFormat = consultingContractResult.format;
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        await user.save();
        updatedUsersCount++;
        updatedUsers.push({
          id: user._id,
          name: user.name,
          email: user.email,
          documents: user.documents
        });
      }
    }
    
    // 2. Actualizăm clienții
    const clients = await Client.find({});
    console.log(`Verificăm ${clients.length} clienți...`);
    
    let updatedClientsCount = 0;
    let updatedClients = [];
    
    for (const client of clients) {
      let needsUpdate = false;
      
      // Verificăm dacă clientul are documente
      const clientDocuments = await Document.find({ clientId: client._id });
      
      // Verificăm dacă există documente de identitate
      const idDocuments = clientDocuments.filter(doc => 
        doc.type === 'identity' || doc.name.toLowerCase().includes('buletin') || 
        doc.name.toLowerCase().includes('card') || doc.name.toLowerCase().includes('identitate')
      );
      
      if (idDocuments.length > 0 && !client.documentsVerified) {
        console.log(`Clientul ${client.name} (${client._id}) are documente de identitate încărcate`);
        client.documentsVerified = true;
        needsUpdate = true;
      }
      
      // Verificăm utilizatorul asociat clientului
      if (client.userId) {
        const associatedUser = await User.findById(client.userId);
        
        if (associatedUser) {
          if (associatedUser.documents && associatedUser.documents.contractGenerated) {
            console.log(`Clientul ${client.name} (${client._id}) are contract generat prin utilizatorul asociat`);
            needsUpdate = true;
          }
          
          if (associatedUser.contractSigned && !client.contractSigned) {
            console.log(`Clientul ${client.name} (${client._id}) are contract semnat prin utilizatorul asociat`);
            client.contractSigned = true;
            client.contractSignedAt = associatedUser.contractSignedAt;
            needsUpdate = true;
          }
        }
      }
      
      if (needsUpdate) {
        await client.save();
        updatedClientsCount++;
        updatedClients.push({
          id: client._id,
          name: client.name,
          email: client.email,
          documentsVerified: client.documentsVerified,
          contractSigned: client.contractSigned
        });
      }
    }
    
    return res.status(200).json({
      success: true,
      message: `Actualizare finalizată cu succes. S-au actualizat ${updatedUsersCount} utilizatori și ${updatedClientsCount} clienți.`,
      data: {
        updatedUsersCount,
        updatedClientsCount,
        updatedUsers,
        updatedClients
      }
    });
    
  } catch (error) {
    logger.error(`Eroare la actualizarea flag-urilor de documente: ${error.message}`);
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Eroare la actualizarea flag-urilor de documente',
      error: error.message
    });
  }
};