const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const { convertToPdf } = require('../utils/documentConverter');
const User = require('../models/User');
const logger = require('../utils/logger');
const nodemailer = require('nodemailer');

// Funcție pentru înlocuirea diacriticelor cu caracterele fără diacritice
const removeDiacritics = (str) => {
  if (!str) return str;
  return str
    .replace(/[ăâ]/g, 'a')
    .replace(/[î]/g, 'i')
    .replace(/[șş]/g, 's')
    .replace(/[țţ]/g, 't')
    .replace(/[ĂÂ]/g, 'A')
    .replace(/[Î]/g, 'I')
    .replace(/[ȘŞ]/g, 'S')
    .replace(/[ȚŢ]/g, 'T');
};

// Utility function to send email with attachment
const sendContractEmail = async (user, attachmentPath, attachmentName, isDocx = false, isConsultingContract = false, customSubject = null, documentType = null) => {
  try {
    const config = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    };
    
    // Log email configuration (without password)
    logger.info(`Attempting to send email with SMTP: ${config.host}:${config.port}, user: ${config.auth.user}`);
    
    if (!config.auth.user || !config.auth.pass) {
      logger.warn('Email sending skipped: SMTP credentials not properly configured');
      return { success: false, error: 'SMTP credentials not configured' };
    }

    const transporter = nodemailer.createTransport(config);
    
    // Read file for attachment
    const attachment = fs.readFileSync(attachmentPath);
    
    // Create email content
    const docType = documentType || (isConsultingContract ? 'contractul de consultanță' : 'contractul');
    const subject = customSubject || (isConsultingContract ? 'Contract de Consultanță Start-Up Nation 2025' : 'Contract Start-Up Nation 2025');
    const text = `Bună ziua, ${user.name || 'utilizator Start-Up Nation'},\n\nAtașat veți găsi ${docType} generat pentru programul Start-Up Nation 2025.\n\nCu stimă,\nEchipa Start-Up Nation 2025`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(to right, #4F46E5, #7C3AED); padding: 20px; text-align: center; color: white;">
          <h2>Start-Up Nation 2025</h2>
        </div>
        <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
          <p>Bună ziua, <strong>${user.name || 'utilizator Start-Up Nation'}</strong>,</p>
          <p>Atașat veți găsi ${docType} generat pentru programul Start-Up Nation 2025.</p>
          <p>Pentru orice întrebări suplimentare, nu ezitați să ne contactați.</p>
          <p style="margin-top: 30px;">Cu stimă,<br>Echipa Start-Up Nation 2025</p>
        </div>
        <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280;">
          <p>&copy; 2025 Start-Up Nation. Toate drepturile rezervate.</p>
        </div>
      </div>
    `;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || `\"Start-Up Nation 2025\" <${config.auth.user}>`,
      to: [user.email, 'contact@aplica-startup.ro'],
      subject,
      text,
      html,
      attachments: [{
        filename: attachmentName,
        content: attachment,
        contentType: isDocx ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : 'application/pdf'
      }]
    };
    
    // Send the email
    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent to ${user.email} and contact@aplica-startup.ro: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error(`Error sending email: ${error.message}`);
    return { success: false, error: error.message };
  }
};

// @desc    Generate authorization document for a specific user (admin function)
// @route   POST /api/contracts/admin/generate-authority/:userId
// @access  Private (Admin, super-admin)
const generateAuthorityDocumentForUser = async (req, res, next) => {
  try {
    logger.info('Generating authorization document for user - admin function');
    const userId = req.params.userId;
    const user = await User.findById(userId);
    
    if (!user) {
      logger.error('User not found:', userId);
      return res.status(404).json({ success: false, message: 'Utilizator negăsit' });
    }
    
    logger.info('User found:', userId);

    // Initialize documents object if it doesn't exist
    if (!user.documents) user.documents = {};
    
    // Update user document status
    user.documents.authorityDocumentGenerated = true;
    user.documents.authorityDocumentFormat = 'pdf'; // Set a default format
    await user.save();
    
    logger.info(`Document de împuternicire generat pentru user ${userId}`);
    logger.info('User document state after update:', user.documents);

    // Prepare data to send to the API
    const formData = new FormData();
    
    // Add user data
    formData.append('userId', userId);
    formData.append('fullName', user.idCard?.fullName || user.name || 'Utilizator');
    formData.append('email', user.email || 'email@example.com');
    formData.append('phone', user.phone || '');
    formData.append('CNP', user.idCard?.CNP || '');
    
    // Add signature if available
    if (user.signature) {
      const cleanSignature = user.signature.replace(/\\s+/g, '');
      formData.append('signature', cleanSignature);
    }
    
    logger.info('Sending data to external API for authorization document...');
    
    let apiResponse;
    let useBackupTemplate = false;
    
    try {
      // Call the API to generate the authorization document
      logger.info('Trying API endpoint for authorization document...');
      apiResponse = await axios.post('https://pnrr.digitalizarefirme.com/api/startup/imputernicire', formData, {
        headers: {
          ...formData.getHeaders(), 
          'Accept': 'application/json'
        },
        responseType: 'arraybuffer',
        timeout: 5000
      });
      
      if (apiResponse.status !== 200) {
        logger.warn(`API responded with non-200 status: ${apiResponse.status}`);
        useBackupTemplate = true;
      }
    } catch (apiError) {
      logger.error(`API call failed: ${apiError.message}. Using backup template.`);
      useBackupTemplate = true;
    }
    
    // If API call failed, use a local backup template
    if (useBackupTemplate) {
      logger.info('Using local backup template for authorization document');
      
      // Path to backup template file
      const backupTemplatePath = path.join(__dirname, '../../templates/authority_document_template.docx');
      
      if (!fs.existsSync(backupTemplatePath)) {
        throw new Error('Backup authorization document template not found');
      }
      
      // Read the backup template
      apiResponse = { 
        data: await fs.promises.readFile(backupTemplatePath),
        status: 200
      };
      logger.info('Successfully loaded backup authorization document template');
    }
    
    logger.info('Received DOCX document from API for authorization document');
    
    // Save the received DOCX document
    const uploadsDir = path.join(__dirname, '../../../uploads/contracts');
    await fs.promises.mkdir(uploadsDir, { recursive: true });
    
    const docxFilename = `imputernicire_${userId}.docx`;
    const docxPath = path.join(uploadsDir, docxFilename);
    
    // Save the DOCX document
    fs.writeFileSync(docxPath, apiResponse.data);
    logger.info(`Authorization document DOCX saved at: ${docxPath}`);
    
    // Update database information
    user.documents.authorityDocumentFormat = 'docx';
    user.documents.authorityDocumentPath = `/uploads/contracts/${docxFilename}`;
    await user.save();
    
    // Convert DOCX to PDF
    let pdfBuffer;
    let conversionSuccessful = false;
    try {
      pdfBuffer = await convertToPdf(apiResponse.data);
      logger.info('Conversion to PDF successful for authorization document');
      
      // Save the PDF
      const pdfFilename = `imputernicire_${userId}.pdf`;
      const pdfPath = path.join(uploadsDir, pdfFilename);
      fs.writeFileSync(pdfPath, pdfBuffer);
      
      // Update database path
      user.documents.authorityDocumentFormat = 'pdf';
      user.documents.authorityDocumentPath = `/uploads/contracts/${pdfFilename}`;
      await user.save();
      
      // Send email with the PDF document if requested
      if (req.body.sendEmail) {
        try {
          const emailResult = await sendContractEmail(
            user, 
            pdfPath, 
            `imputernicire_${user.name || userId}.pdf`, 
            false, // not DOCX
            false, // not consulting contract
            'Împuternicire Start-Up Nation 2025', // custom subject
            'Împuternicire' // document type
          );
          
          if (emailResult.success) {
            logger.info(`Email sent successfully: ${emailResult.messageId}`);
          } else {
            logger.warn(`Email sending failed: ${emailResult.error}`);
          }
        } catch (emailError) {
          logger.error(`Error sending email with authorization document: ${emailError.message}`);
        }
      }
      
      // Return success JSON response
      return res.status(200).json({
        success: true,
        message: 'Documentul de împuternicire a fost generat cu succes',
        documentPath: user.documents.authorityDocumentPath,
        format: 'pdf'
      });
    } catch (conversionError) {
      logger.error(`PDF conversion error for authorization document: ${conversionError.message}`);
      conversionSuccessful = false;
    }
    
    // If conversion to PDF failed, send DOCX path in JSON
    
    // Send email with DOCX if requested
    if (req.body.sendEmail) {
      try {
        const emailResult = await sendContractEmail(
          user, 
          docxPath, 
          `imputernicire_${user.name || userId}.docx`, 
          true, // is DOCX
          false, // not consulting contract
          'Împuternicire Start-Up Nation 2025', // custom subject
          'Împuternicire' // document type
        );
        
        if (emailResult.success) {
          logger.info(`Email with DOCX attachment sent successfully: ${emailResult.messageId}`);
        } else {
          logger.warn(`Email with DOCX attachment sending failed: ${emailResult.error}`);
        }
      } catch (emailError) {
        logger.error(`Error sending email with DOCX authorization document: ${emailError.message}`);
      }
    }
    
    return res.status(200).json({
      success: true,
      message: 'Documentul de împuternicire a fost generat cu succes (format docx)',
      documentPath: user.documents.authorityDocumentPath,
      format: 'docx'
    });
    
  } catch (error) {
    logger.error(`Admin authorization document generation error: ${error.message}`);
    
    return res.status(500).json({
      success: false,
      message: 'A apărut o eroare la generarea documentului de împuternicire. Vă rugăm să încercați din nou.',
      error: error.message
    });
  }
};

// @desc    Download authorization document for a specific user (admin function)
// @route   GET /api/admin/users/:userId/download-authority
// @access  Private (Admin, super-admin)
const downloadAuthorityDocument = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilizator negăsit'
      });
    }
    
    if (!user.documents) {
      user.documents = {};
    }
    
    logger.info(`Download authorization document requested for user: ${userId}`);
    logger.info(`User document state: ${JSON.stringify(user.documents)}`);
    
    let documentFullPath = null;
    
    if (user.documents.authorityDocumentPath) {
      const documentRelativePath = user.documents.authorityDocumentPath;
      logger.info(`Authorization document relative path from user document: ${documentRelativePath}`);
      
      documentFullPath = path.join(__dirname, `../../../${documentRelativePath.substring(1)}`);
      logger.info(`Constructed full path: ${documentFullPath}`);
      
      if (!fs.existsSync(documentFullPath)) {
        logger.error(`Authorization document file not found at path: ${documentFullPath}`);
        
        const alternativeFilename = `imputernicire_${userId}.pdf`;
        const alternativePath = path.join(__dirname, `../../../uploads/contracts/${alternativeFilename}`);
        logger.info(`Checking alternative path: ${alternativePath}`);
        
        if (fs.existsSync(alternativePath)) {
          logger.info(`Found authorization document at alternative path: ${alternativePath}`);
          documentFullPath = alternativePath;
          
          user.documents.authorityDocumentPath = `/uploads/contracts/${alternativeFilename}`;
          await user.save();
        } else {
          // Check for DOCX as well
          const docxAlternativeFilename = `imputernicire_${userId}.docx`;
          const docxAlternativePath = path.join(__dirname, `../../../uploads/contracts/${docxAlternativeFilename}`);
          logger.info(`Checking DOCX alternative path: ${docxAlternativePath}`);
          
          if (fs.existsSync(docxAlternativePath)) {
            logger.info(`Found DOCX authorization document at alternative path: ${docxAlternativePath}`);
            documentFullPath = docxAlternativePath;
            
            user.documents.authorityDocumentPath = `/uploads/contracts/${docxAlternativeFilename}`;
            user.documents.authorityDocumentFormat = 'docx';
            await user.save();
          } else {
            logger.error(`No authorization document file found for user at any path`);
            documentFullPath = null;
          }
        }
      }
    } else {
      logger.info(`No authorization document path set for user: ${userId}`);
      
      // Try both PDF and DOCX
      const defaultPdfFilename = `imputernicire_${userId}.pdf`;
      const defaultPdfPath = path.join(__dirname, `../../../uploads/contracts/${defaultPdfFilename}`);
      logger.info(`Checking default PDF path: ${defaultPdfPath}`);
      
      if (fs.existsSync(defaultPdfPath)) {
        logger.info(`Found authorization document at default PDF path: ${defaultPdfPath}`);
        documentFullPath = defaultPdfPath;
        
        user.documents.authorityDocumentPath = `/uploads/contracts/${defaultPdfFilename}`;
        user.documents.authorityDocumentFormat = 'pdf';
        await user.save();
      } else {
        // Check for DOCX
        const defaultDocxFilename = `imputernicire_${userId}.docx`;
        const defaultDocxPath = path.join(__dirname, `../../../uploads/contracts/${defaultDocxFilename}`);
        logger.info(`Checking default DOCX path: ${defaultDocxPath}`);
        
        if (fs.existsSync(defaultDocxPath)) {
          logger.info(`Found authorization document at default DOCX path: ${defaultDocxPath}`);
          documentFullPath = defaultDocxPath;
          
          user.documents.authorityDocumentPath = `/uploads/contracts/${defaultDocxFilename}`;
          user.documents.authorityDocumentFormat = 'docx';
          await user.save();
        }
      }
    }
    
    if (!documentFullPath) {
      logger.error(`Authorization document not found. User state: authorityDocumentGenerated=${user.documents.authorityDocumentGenerated}, authorityDocumentPath=${user.documents.authorityDocumentPath}`);
      return res.status(404).json({
        success: false,
        message: 'Documentul de împuternicire nu a fost găsit. Te rugăm să generezi mai întâi documentul.',
        error: 'authority_document_not_found',
        shouldGenerate: true
      });
    }
    
    try {
      logger.info(`Reading authorization document file from: ${documentFullPath}`);
      const fileBuffer = fs.readFileSync(documentFullPath);
      logger.info(`Successfully read authorization document file, size: ${fileBuffer.length} bytes`);
      
      const isDocx = user.documents.authorityDocumentFormat === 'docx' || documentFullPath.toLowerCase().endsWith('.docx');
      
      let displayName = user.idCard?.fullName;
      if (!displayName || displayName === 'test') {
        displayName = user.name || userId;
      }
      displayName = removeDiacritics(displayName).replace(/\\s+/g, '_');
      const fileName = `imputernicire_${displayName}${isDocx ? '.docx' : '.pdf'}`;
      
      logger.info(`Using display name for authorization document: ${displayName}`);
      
      if (isDocx) {
        logger.info(`Sending a DOCX authorization document file: ${fileName}`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      } else {
        logger.info(`Sending a PDF authorization document file: ${fileName}`);
        res.setHeader('Content-Type', 'application/pdf');
      }
      
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      
      if (req.files) {
        delete req.files;
      }
      
      logger.info(`Sending authorization document file to client...`);
      return res.send(fileBuffer);
    } catch (readError) {
      logger.error(`Error reading authorization document file: ${readError.message}`);
      return res.status(500).json({
        success: false,
        message: 'Eroare la citirea fișierului document de împuternicire. Te rugăm să încerci din nou.',
        error: readError.message
      });
    }
  } catch (error) {
    logger.error(`Authorization document download error: ${error.message}`);
    next(error);
  }
};

// Exportăm funcțiile modulului
module.exports = {
  generateAuthorityDocumentForUser,
  downloadAuthorityDocument
};