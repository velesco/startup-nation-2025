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
const sendContractEmail = async (user, attachmentPath, attachmentName, isDocx = false, isConsultingContract = false) => {
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
    const subject = isConsultingContract ? 'Contract de Consultanță Start-Up Nation 2025' : 'Contract Start-Up Nation 2025';
    const text = `Bună ziua, ${user.name || 'utilizator Start-Up Nation'},\n\nAtașat veți găsi ${isConsultingContract ? 'contractul de consultanță' : 'contractul'} generat pentru programul Start-Up Nation 2025.\n\nCu stimă,\nEchipa Start-Up Nation 2025`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(to right, #4F46E5, #7C3AED); padding: 20px; text-align: center; color: white;">
          <h2>Start-Up Nation 2025</h2>
        </div>
        <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
          <p>Bună ziua, <strong>${user.name || 'utilizator Start-Up Nation'}</strong>,</p>
          <p>Atașat veți găsi ${isConsultingContract ? 'contractul de consultanță' : 'contractul'} generat pentru programul Start-Up Nation 2025.</p>
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
    logger.info(`${isConsultingContract ? 'Consulting contract' : 'Contract'} email sent to ${user.email} and contact@aplica-startup.ro: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error(`Error sending ${isConsultingContract ? 'consulting contract' : 'contract'} email: ${error.message}`);
    return { success: false, error: error.message };
  }
};

// @desc    Generate a consulting contract
// @route   POST /api/contracts/generate-consulting
// @access  Private
const generateConsultingContract = async (req, res, next) => {
  try {
    console.log('Generating consulting contract - start');
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      console.log('User not found:', userId);
      return res.status(404).json({ success: false, message: 'Utilizator negăsit' });
    }
    
    console.log('User found:', userId);

    // Extract data from request
    const { doresc_consultanta_completa } = req.body || {};
    console.log('Request body:', req.body);

    if (!user.documents) user.documents = {};
    user.documents.consultingContractGenerated = true;
    user.documents.consultingContractSigned = true; // Automatically signed
    user.documents.contractSigned = true; // Mark the participation contract as signed as well
    user.documents.contractGenerated = true; // Mark participation contract as generated too
    await user.save();
    
    console.log(`Contract Consultanta generat pentru user ${userId}`);
    console.log(`Contract Participare marcat ca semnat pentru user ${userId}`);
    logger.info(`Contract Consultanta generat pentru user ${userId} si contract participare marcat ca semnat`);

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
    
    logger.info('Sending data to external API for consulting contract...');
    
    let apiResponse;
    let useBackupTemplate = false;
    
    try {
      // Try to call the primary API first
      logger.info('Trying primary API endpoint for consulting contract...');
      apiResponse = await axios.post('https://pnrr.digitalizarefirme.com/api/startup/consultanta', formData, {
        headers: {
          ...formData.getHeaders(), 
          'Accept': 'application/json'
        },
        responseType: 'arraybuffer',  // Important for receiving binary file
        timeout: 5000  // Add a timeout to fail fast if the endpoint is down
      });
      
      if (apiResponse.status !== 200) {
        logger.warn(`Primary API responded with non-200 status: ${apiResponse.status}`);
        useBackupTemplate = true;
      }
    } catch (apiError) {
      // Try the original endpoint as fallback
      logger.warn(`Primary API call failed: ${apiError.message}. Trying fallback endpoint...`);
      try {
        apiResponse = await axios.post('https://pnrr.digitalizarefirme.com/api/startup/consultanta', formData, {
          headers: {
            ...formData.getHeaders(), 
            'Accept': 'application/json'
          },
          responseType: 'arraybuffer',
          timeout: 5000
        });
        
        if (apiResponse.status !== 200) {
          logger.warn(`Fallback API responded with non-200 status: ${apiResponse.status}`);
          useBackupTemplate = true;
        }
      } catch (fallbackError) {
        logger.error(`Both API endpoints failed. Using backup template. Error: ${fallbackError.message}`);
        useBackupTemplate = true;
      }
    }
    
    // If both API calls failed, use a local backup template
    if (useBackupTemplate) {
      logger.info('Using local backup template for consulting contract');
      
      // Path to backup template file
      const backupTemplatePath = path.join(__dirname, '../../templates/consulting_contract_template.docx');
      
      if (!fs.existsSync(backupTemplatePath)) {
        throw new Error('Backup consulting contract template not found');
      }
      
      // Read the backup template
      apiResponse = { 
        data: await fs.promises.readFile(backupTemplatePath),
        status: 200
      };
      logger.info('Successfully loaded backup consulting contract template');
    }
    
    logger.info('Received DOCX document from external API for consulting contract');
    
    // Save the received DOCX document
    const uploadsDir = path.join(__dirname, '../../../uploads/contracts');
    await fs.promises.mkdir(uploadsDir, { recursive: true });
    
    const docxFilename = `contract_consultanta_${userId}.docx`;
    const docxPath = path.join(uploadsDir, docxFilename);
    
    // Save the DOCX document
    fs.writeFileSync(docxPath, apiResponse.data);
    logger.info(`Consulting contract DOCX saved at: ${docxPath}`);
    
    // Update database information
    user.documents.consultingContractFormat = 'docx';
    user.documents.consultingContractPath = `/uploads/contracts/${docxFilename}`;
    await user.save();
    
    // Convert DOCX to PDF
    let pdfBuffer;
    let conversionSuccessful = false;
    try {
      pdfBuffer = await convertToPdf(apiResponse.data);
      logger.info('Conversion to PDF successful for consulting contract');
      
      // Save the PDF
      const pdfFilename = `contract_consultanta_${userId}.pdf`;
      const pdfPath = path.join(uploadsDir, pdfFilename);
      fs.writeFileSync(pdfPath, pdfBuffer);
      
      // Update database path
      user.documents.consultingContractFormat = 'pdf';
      user.documents.consultingContractPath = `/uploads/contracts/${pdfFilename}`;
      user.documents.contractSigned = true; // Mark the participation contract as signed as well
      user.documents.contractGenerated = true; // Mark the participation contract as generated
      await user.save();
      
      // Return success JSON response
      return res.status(200).json({
        success: true,
        message: 'Contractul de consultanță a fost generat cu succes',
        documentPath: user.documents.consultingContractPath
      });
    } catch (conversionError) {
      logger.error(`PDF conversion error for consulting contract: ${conversionError.message}`);
      conversionSuccessful = false;
    }
    
    // If we got here, conversion to PDF failed, so send DOCX path in JSON
    return res.status(200).json({
      success: true,
      message: 'Contractul de consultanță a fost generat cu succes (formatat docx)',
      documentPath: user.documents.consultingContractPath,
      format: 'docx'
    });
  } catch (error) {
    logger.error(`Consulting contract generation error: ${error.message}`);
    logger.error(`Request URL: ${error.config?.url || req.originalUrl}`);
    logger.error(`Request Method: ${error.config?.method?.toUpperCase() || req.method}`);
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      logger.error(`Response status: ${error.response.status}`);
      logger.error(`Response headers: ${JSON.stringify(error.response.headers)}`);
      logger.error(`Response data: ${JSON.stringify(error.response.data)}`);
    }
    
    return res.status(500).json({
      success: false,
      message: 'A apărut o eroare la generarea contractului de consultanță. Vă rugăm să încercați din nou.',
      error: error.message
    });
  }
};

// @desc    Download existing consulting contract
// @route   GET /api/contracts/download-consulting
// @access  Private
const downloadConsultingContract = async (req, res, next) => {
  try {
    const userId = req.user.id;
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
    
    logger.info(`Download consulting contract requested for user: ${userId}`);
    logger.info(`User document state: ${JSON.stringify(user.documents)}`);
    
    let contractFullPath = null;
    
    if (user.documents.consultingContractPath) {
      const contractRelativePath = user.documents.consultingContractPath;
      logger.info(`Consulting contract relative path from user document: ${contractRelativePath}`);
      
      contractFullPath = path.join(__dirname, `../../../${contractRelativePath.substring(1)}`);
      logger.info(`Constructed full path: ${contractFullPath}`);
      
      if (!fs.existsSync(contractFullPath)) {
        logger.error(`Consulting contract file not found at path: ${contractFullPath}`);
        
        const alternativeFilename = `contract_consultanta_${userId}.pdf`;
        const alternativePath = path.join(__dirname, `../../../uploads/contracts/${alternativeFilename}`);
        logger.info(`Checking alternative path: ${alternativePath}`);
        
        if (fs.existsSync(alternativePath)) {
          logger.info(`Found consulting contract at alternative path: ${alternativePath}`);
          contractFullPath = alternativePath;
          
          user.documents.consultingContractPath = `/uploads/contracts/${alternativeFilename}`;
          await user.save();
        } else {
          // Check for DOCX as well
          const docxAlternativeFilename = `contract_consultanta_${userId}.docx`;
          const docxAlternativePath = path.join(__dirname, `../../../uploads/contracts/${docxAlternativeFilename}`);
          logger.info(`Checking DOCX alternative path: ${docxAlternativePath}`);
          
          if (fs.existsSync(docxAlternativePath)) {
            logger.info(`Found DOCX consulting contract at alternative path: ${docxAlternativePath}`);
            contractFullPath = docxAlternativePath;
            
            user.documents.consultingContractPath = `/uploads/contracts/${docxAlternativeFilename}`;
            user.documents.consultingContractFormat = 'docx';
            await user.save();
          } else {
            logger.error(`No consulting contract file found for user at any path`);
            contractFullPath = null;
          }
        }
      }
    } else {
      logger.info(`No consulting contract path set for user: ${userId}`);
      
      // Try both PDF and DOCX
      const defaultPdfFilename = `contract_consultanta_${userId}.pdf`;
      const defaultPdfPath = path.join(__dirname, `../../../uploads/contracts/${defaultPdfFilename}`);
      logger.info(`Checking default PDF path: ${defaultPdfPath}`);
      
      if (fs.existsSync(defaultPdfPath)) {
        logger.info(`Found consulting contract at default PDF path: ${defaultPdfPath}`);
        contractFullPath = defaultPdfPath;
        
        user.documents.consultingContractPath = `/uploads/contracts/${defaultPdfFilename}`;
        user.documents.consultingContractFormat = 'pdf';
        await user.save();
      } else {
        // Check for DOCX
        const defaultDocxFilename = `contract_consultanta_${userId}.docx`;
        const defaultDocxPath = path.join(__dirname, `../../../uploads/contracts/${defaultDocxFilename}`);
        logger.info(`Checking default DOCX path: ${defaultDocxPath}`);
        
        if (fs.existsSync(defaultDocxPath)) {
          logger.info(`Found consulting contract at default DOCX path: ${defaultDocxPath}`);
          contractFullPath = defaultDocxPath;
          
          user.documents.consultingContractPath = `/uploads/contracts/${defaultDocxFilename}`;
          user.documents.consultingContractFormat = 'docx';
          await user.save();
        }
      }
    }
    
    if (!contractFullPath) {
      logger.error(`Consulting contract not found. User state: consultingContractGenerated=${user.documents.consultingContractGenerated}, consultingContractPath=${user.documents.consultingContractPath}`);
      return res.status(404).json({
        success: false,
        message: 'Contractul de consultanță nu a fost găsit. Te rugăm să generezi mai întâi contractul.',
        error: 'consulting_contract_not_found',
        shouldGenerate: true
      });
    }
    
    try {
      logger.info(`Reading consulting contract file from: ${contractFullPath}`);
      const fileBuffer = fs.readFileSync(contractFullPath);
      logger.info(`Successfully read consulting contract file, size: ${fileBuffer.length} bytes`);
      
      const isDocx = user.documents.consultingContractFormat === 'docx' || contractFullPath.toLowerCase().endsWith('.docx');
      
      let displayName = user.idCard?.fullName;
      if (!displayName || displayName === 'test') {
        displayName = user.name || userId;
      }
      displayName = removeDiacritics(displayName).replace(/\\s+/g, '_');
      const fileName = `contract_consultanta_${displayName}${isDocx ? '.docx' : '.pdf'}`;
      
      logger.info(`Using display name for consulting contract: ${displayName}`);
      
      if (isDocx) {
        logger.info(`Sending a DOCX consulting contract file: ${fileName}`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      } else {
        logger.info(`Sending a PDF consulting contract file: ${fileName}`);
        res.setHeader('Content-Type', 'application/pdf');
      }
      
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      
      if (req.files) {
        delete req.files;
      }
      
      logger.info(`Sending consulting contract file to client...`);
      return res.send(fileBuffer);
    } catch (readError) {
      logger.error(`Error reading consulting contract file: ${readError.message}`);
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

// @desc    Reset consulting contract status
// @route   POST /api/contracts/reset-consulting
// @access  Private
const resetConsultingContract = async (req, res, next) => {
  try {
    const userId = req.user.id;
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
    
    // Reset consulting contract flags
    user.documents.consultingContractGenerated = false;
    user.documents.consultingContractSigned = false;
    user.documents.consultingContractPath = null;
    
    await user.save();
    
    // Check if contract files exist for this user and delete them
    const contractsDir = path.join(__dirname, '../../../uploads/contracts');
    logger.info(`Checking consulting contract files for deletion from: ${contractsDir}`);
    
    if (!fs.existsSync(contractsDir)) {
      logger.info(`Contracts directory doesn't exist, creating: ${contractsDir}`);
      await fs.promises.mkdir(contractsDir, { recursive: true });
    }
    
    const pdfFilename = `contract_consultanta_${userId}.pdf`;
    const pdfPath = path.join(contractsDir, pdfFilename);
    logger.info(`Looking for PDF consulting contract file: ${pdfPath}`);
    
    // Delete PDF file if it exists
    try {
      if (fs.existsSync(pdfPath)) {
        logger.info(`Deleting PDF consulting contract file: ${pdfPath}`);
        fs.unlinkSync(pdfPath);
        logger.info(`PDF file deleted`);
      } else {
        logger.info(`No PDF consulting contract file found for deletion`);
      }
    } catch (deleteError) {
      logger.error(`Error deleting PDF consulting contract: ${deleteError.message}`);
    }
    
    // Check for DOCX file
    const docxPath = path.join(contractsDir, `contract_consultanta_${userId}.docx`);
    logger.info(`Looking for DOCX consulting contract file: ${docxPath}`);
    
    try {
      if (fs.existsSync(docxPath)) {
        logger.info(`Deleting DOCX consulting contract file: ${docxPath}`);
        fs.unlinkSync(docxPath);
        logger.info(`DOCX file deleted`);
      } else {
        logger.info(`No DOCX consulting contract file found for deletion`);
      }
    } catch (deleteError) {
      logger.error(`Error deleting DOCX consulting contract: ${deleteError.message}`);
    }
    
    logger.info(`Consulting contract reset and associated files deletion completed.`);
    
    return res.status(200).json({
      success: true,
      message: 'Statusul contractului de consultanță a fost resetat cu succes. Poți genera acum un nou contract.'
    });
  } catch (error) {
    logger.error(`Consulting contract reset error: ${error.message}`);
    next(error);
  }
};

// Exportăm funcțiile modulului pentru a putea fi folosite în alte module
module.exports = {
  generateConsultingContract,
  downloadConsultingContract,
  resetConsultingContract
};