const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const { convertToPdf } = require('../utils/documentConverter');
const User = require('../models/User');
const logger = require('../utils/logger');
const nodemailer = require('nodemailer');

// Utility function to send email with attachment
const sendDocumentEmail = async (user, attachmentPath, attachmentName, isDocx = false) => {
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
    const subject = 'Împuternicire Start-Up Nation 2025';
    const text = `Bună ziua, ${user.name || 'utilizator Start-Up Nation'},\n\nAtașat veți găsi documentul de împuternicire generat pentru programul Start-Up Nation 2025.\n\nCu stimă,\nEchipa Start-Up Nation 2025`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(to right, #4F46E5, #7C3AED); padding: 20px; text-align: center; color: white;">
          <h2>Start-Up Nation 2025</h2>
        </div>
        <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
          <p>Bună ziua, <strong>${user.name || 'utilizator Start-Up Nation'}</strong>,</p>
          <p>Atașat veți găsi documentul de împuternicire generat pentru programul Start-Up Nation 2025.</p>
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

// @desc    Generate authorization document
// @route   GET /api/authority/generate
// @access  Private
const generateAuthorityDocument = async (req, res) => {
  try {
    logger.info('Generating authorization document');
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      logger.error('User not found:', userId);
      return res.status(404).json({ success: false, message: 'Utilizator negăsit' });
    }
    
    logger.info('User found:', userId);

    // Initialize documents object if it doesn't exist
    if (!user.documents) user.documents = {};
    
    // Prepare data to send to the API
    const formData = new FormData();
    
    // Add user data
    formData.append('userId', userId);
    formData.append('fullName', user.idCard?.fullName || user.name || 'Utilizator');
    formData.append('email', user.email || 'email@example.com');
    formData.append('phone', user.phone || '');
    formData.append('CNP', user.idCard?.CNP || '');
    formData.append('address', user.idCard.address || '');
    formData.append('idSeries', user.idCard.series);
    formData.append('idNumber', user.idCard.number);
    
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
    const uploadsDir = path.join(__dirname, '../../../uploads/authorization');
    await fs.promises.mkdir(uploadsDir, { recursive: true });
    const docxFilename = `imputernicire_${userId}.docx`;
    const docxPath = path.join(uploadsDir, docxFilename);
    console.log('Saving DOCX file to:', docxPath);
    
    // Save the DOCX document
    fs.writeFileSync(docxPath, apiResponse.data);
    logger.info(`Authorization document DOCX saved at: ${docxPath}`);
    
    // Convert DOCX to PDF
    try {
      const pdfBuffer = await convertToPdf(apiResponse.data);
      logger.info('Conversion to PDF successful for authorization document');
      
      // Save the PDF
      const pdfFilename = `imputernicire_${userId}.pdf`;
      const pdfPath = path.join(uploadsDir, pdfFilename);
      fs.writeFileSync(pdfPath, pdfBuffer);
      
      // Update database information
      user.documents.authorityDocumentGenerated = true;
      user.documents.authorityDocumentFormat = 'pdf';
      user.documents.authorityDocumentPath = `/uploads/authorization/${pdfFilename}`;
      console.log('Updated user document path:', user.documents.authorityDocumentPath);
      await user.save();

      // Try to send an email with the document
      try {
        const emailResult = await sendDocumentEmail(
          user, 
          pdfPath, 
          `imputernicire_${user.name || userId}.pdf`, 
          false // not DOCX
        );
        
        if (emailResult.success) {
          logger.info(`Email sent successfully: ${emailResult.messageId}`);
        } else {
          logger.warn(`Email sending failed: ${emailResult.error}`);
        }
      } catch (emailError) {
        logger.error(`Error sending email with authority document: ${emailError.message}`);
      }

      // Return the PDF to the client
      return res.sendFile(pdfPath);
    } catch (conversionError) {
      logger.error(`PDF conversion error for authorization document: ${conversionError.message}`);
      
      // Update database information with DOCX instead
      user.documents.authorityDocumentGenerated = true;
      user.documents.authorityDocumentFormat = 'docx';
      user.documents.authorityDocumentPath = `/uploads/authorization/${docxFilename}`;
      console.log('Updated user document path (DOCX):', user.documents.authorityDocumentPath);
      await user.save();
      
      // Try to send an email with the DOCX document
      try {
        const emailResult = await sendDocumentEmail(
          user, 
          docxPath, 
          `imputernicire_${user.name || userId}.docx`, 
          true // is DOCX
        );
        
        if (emailResult.success) {
          logger.info(`Email with DOCX attachment sent successfully: ${emailResult.messageId}`);
        } else {
          logger.warn(`Email with DOCX attachment sending failed: ${emailResult.error}`);
        }
      } catch (emailError) {
        logger.error(`Error sending email with DOCX authority document: ${emailError.message}`);
      }
      
      // Return the DOCX to the client
      return res.sendFile(docxPath);
    }
    
  } catch (error) {
    logger.error(`Authorization document generation error: ${error.message}`);
    
    return res.status(500).json({
      success: false,
      message: 'A apărut o eroare la generarea documentului de împuternicire. Vă rugăm să încercați din nou.',
      error: error.message
    });
  }
};

// @desc    Download authorization document
// @route   GET /api/authority/download
// @access  Private
const downloadAuthorityDocument = async (req, res) => {
  logger.info('Attempting to download authority document');
  
  // List all files in the uploads/authorization directory for debugging
  try {
    const uploadsDir = path.join(__dirname, '../../../uploads/authorization');
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      logger.info(`Files in uploads/authorization: ${JSON.stringify(files)}`);
    } else {
      logger.info('Uploads directory does not exist');
    }
  } catch (err) {
    logger.error(`Error listing files: ${err.message}`);
  }
  try {
    const userId = req.user.id;
    logger.info(`Looking for user with ID: ${userId}`);
    const user = await User.findById(userId);
    logger.info(`User found: ${user ? 'Yes' : 'No'}`);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilizator negăsit'
      });
    }
    
    if (!user.documents) {
      user.documents = {};
    }
    
    if (!user.documents.authorityDocumentPath) {
      // If no document path is set, look for standard names
      const userIdStr = userId.toString();
      logger.info(`User ID string: ${userIdStr}`);
      const pdfPath = path.join(__dirname, `../../../uploads/authorization/imputernicire_${userIdStr}.pdf`);
      const docxPath = path.join(__dirname, `../../../uploads/authorization/imputernicire_${userIdStr}.docx`);
      logger.info(`Looking for files at: ${pdfPath} and ${docxPath}`);
      
      if (fs.existsSync(pdfPath)) {
        user.documents.authorityDocumentPath = `/uploads/authorization/imputernicire_${userId}.pdf`;
        user.documents.authorityDocumentFormat = 'pdf';
        await user.save();
      } else if (fs.existsSync(docxPath)) {
        user.documents.authorityDocumentPath = `/uploads/authorization/imputernicire_${userId}.docx`;
        user.documents.authorityDocumentFormat = 'docx';
        await user.save();
      } else {
        return res.status(404).json({
          success: false,
          message: 'Documentul de împuternicire nu a fost generat încă.',
          shouldGenerate: true
        });
      }
    }
    
    // Get the file path
    let filePath = path.join(__dirname, `../../../${user.documents.authorityDocumentPath.substring(1)}`);
    logger.info(`Attempting to download file from: ${filePath}`);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      logger.info('File not found at the expected path, searching for alternatives');
      
      // Check all files in the uploads/authorization directory
      const uploadsDir = path.join(__dirname, '../../../uploads/authorization');
      const userIdStr = userId.toString();
      
      if (fs.existsSync(uploadsDir)) {
        const files = fs.readdirSync(uploadsDir);
        logger.info(`Found ${files.length} files in the directory`);
        
        // Look for any file that might match this user
        const matchingFile = files.find(file => 
          file.startsWith('imputernicire_') && 
          (file.includes(userIdStr) || file.includes(userId))
        );
        
        if (matchingFile) {
          logger.info(`Found matching file: ${matchingFile}`);
          filePath = path.join(uploadsDir, matchingFile);
          
          // Update the user document path
          user.documents.authorityDocumentPath = `/uploads/authorization/${matchingFile}`;
          user.documents.authorityDocumentFormat = matchingFile.endsWith('.pdf') ? 'pdf' : 'docx';
          await user.save();
          logger.info(`Updated user document path to: ${user.documents.authorityDocumentPath}`);
        }
      }
      
      // If we still haven't found a file, try alternate approaches
      if (!fs.existsSync(filePath)) {
        logger.info('Trying more alternate paths');
        
        // Try with user._id if available
        if (user._id) {
          const user_IdStr = user._id.toString();
          logger.info(`Trying with user._id: ${user_IdStr}`);
          const altPath1 = path.join(__dirname, `../../../uploads/authorization/imputernicire_${user_IdStr}.pdf`);
          const altPath2 = path.join(__dirname, `../../../uploads/authorization/imputernicire_${user_IdStr}.docx`);
          
          if (fs.existsSync(altPath1)) {
            logger.info(`Found file at alternate path (PDF): ${altPath1}`);
            filePath = altPath1;
            user.documents.authorityDocumentPath = `/uploads/authorization/imputernicire_${user_IdStr}.pdf`;
            user.documents.authorityDocumentFormat = 'pdf';
            await user.save();
          } else if (fs.existsSync(altPath2)) {
            logger.info(`Found file at alternate path (DOCX): ${altPath2}`);
            filePath = altPath2;
            user.documents.authorityDocumentPath = `/uploads/authorization/imputernicire_${user_IdStr}.docx`;
            user.documents.authorityDocumentFormat = 'docx';
            await user.save();
          }
        }
        
        // If we still don't have a file
        if (!fs.existsSync(filePath)) {
          // Try to find any file that might be related to this user
          const uploadsDir = path.join(__dirname, '../../../uploads/authorization');
          
          if (fs.existsSync(uploadsDir)) {
            const files = fs.readdirSync(uploadsDir);
            
            // If there's only one file in the directory and we're dealing with only one user
            if (files.length === 1 && files[0].startsWith('imputernicire_')) {
              logger.info(`Only one file in directory, using it: ${files[0]}`);
              filePath = path.join(uploadsDir, files[0]);
              user.documents.authorityDocumentPath = `/uploads/authorization/${files[0]}`;
              user.documents.authorityDocumentFormat = files[0].endsWith('.pdf') ? 'pdf' : 'docx';
              await user.save();
            }
          }
          
          // If we still can't find a file
          if (!fs.existsSync(filePath)) {
            logger.error('All attempts to find the document failed');
            return res.status(404).json({
              success: false,
              message: 'Documentul de împuternicire nu a fost găsit. Vă rugăm să îl generați din nou.',
              shouldGenerate: true
            });
          }
        }
      }
    }
    
    // Determine file type
    const isDocx = user.documents.authorityDocumentFormat === 'docx' || filePath.toLowerCase().endsWith('.docx');
    
    // Set proper content type
    if (isDocx) {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    } else {
      res.setHeader('Content-Type', 'application/pdf');
    }
    
    // Set filename for download
    let displayName = user.name || user.idCard?.fullName || userId;
    displayName = removeDiacritics(displayName).replace(/\s+/g, '_');
    const fileName = `imputernicire_${displayName}${isDocx ? '.docx' : '.pdf'}`;
    
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    
    // Double check file exists before sending
    if (fs.existsSync(filePath)) {
      logger.info(`Sending file: ${filePath}`);
      return res.sendFile(filePath);
    } else {
      logger.error(`Final file path does not exist: ${filePath}`);
      return res.status(404).json({
        success: false,
        message: 'Documentul de împuternicire nu a fost găsit. Vă rugăm să îl generați din nou.',
        shouldGenerate: true
      });
    }
    
  } catch (error) {
    logger.error(`Authorization document download error: ${error.message}`);
    
    return res.status(500).json({
      success: false,
      message: 'A apărut o eroare la descărcarea documentului de împuternicire. Vă rugăm să încercați din nou.',
      error: error.message
    });
  }
};

// @desc    Sign authorization document
// @route   POST /api/authority/sign
// @access  Private
const signAuthorityDocument = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilizator negăsit'
      });
    }
    
    // Initialize documents object if it doesn't exist
    if (!user.documents) user.documents = {};
    
    // Update user document status
    user.documents.authorityDocumentSigned = true;
    await user.save();
    
    // Optional: Store the signature data if provided
    if (req.body.signatureData) {
      user.authoritySignature = req.body.signatureData;
      await user.save();
    }
    
    return res.status(200).json({
      success: true,
      message: 'Documentul de împuternicire a fost semnat cu succes'
    });
    
  } catch (error) {
    logger.error(`Authorization document signing error: ${error.message}`);
    
    return res.status(500).json({
      success: false,
      message: 'A apărut o eroare la semnarea documentului de împuternicire. Vă rugăm să încercați din nou.',
      error: error.message
    });
  }
};

// @desc    Reset authorization document status
// @route   POST /api/authority/reset
// @access  Private
const resetAuthorityDocument = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilizator negăsit'
      });
    }
    
    // Initialize documents object if it doesn't exist
    if (!user.documents) user.documents = {};
    
    // Reset authorization document status
    user.documents.authorityDocumentGenerated = false;
    user.documents.authorityDocumentSigned = false;
    user.documents.authorityDocumentPath = null;
    await user.save();
    
    return res.status(200).json({
      success: true,
      message: 'Starea documentului de împuternicire a fost resetată cu succes'
    });
    
  } catch (error) {
    logger.error(`Authorization document reset error: ${error.message}`);
    
    return res.status(500).json({
      success: false,
      message: 'A apărut o eroare la resetarea stării documentului de împuternicire. Vă rugăm să încercați din nou.',
      error: error.message
    });
  }
};

module.exports = {
  generateAuthorityDocument,
  downloadAuthorityDocument,
  signAuthorityDocument,
  resetAuthorityDocument
};