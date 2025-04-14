const fs = require('fs');
const nodemailer = require('nodemailer');
const logger = require('./logger');

/**
 * Send an email with a contract attachment
 * @param {Object} user - User object
 * @param {String} attachmentPath - Path to the attachment file
 * @param {String} attachmentName - Name of the attachment
 * @param {Boolean} isDocx - Whether the attachment is a DOCX file
 * @param {Boolean} isConsultingContract - Whether it's a consulting contract
 * @param {String} customSubject - Custom email subject (optional)
 * @param {String} documentType - Document type description (optional)
 * @returns {Promise<Object>} - Success status and messageId or error
 */
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
    
    // Determine document type for text
    const docType = documentType || (isConsultingContract ? 'contractul de consultanță' : 'contractul');
    
    // Create email content
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
    logger.info(`${docType} email sent to ${user.email} and contact@aplica-startup.ro: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error(`Error sending email with document attachment: ${error.message}`);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendContractEmail
};
