const User = require('../models/User');
const logger = require('../utils/logger');
const nodemailer = require('nodemailer');

/**
 * Utility function to send email
 */
const sendEmail = async (options) => {
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
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || `\"Start-Up Nation 2025\" <${config.auth.user}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html
    };
    
    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error(`Email sending error: ${error.message}`);
    return { success: false, error: error.message };
  }
};

/**
 * @desc    Send email to a user
 * @route   POST /api/admin/email/user/:id
 * @access  Private/Admin
 */
exports.sendEmailToUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { subject, message, htmlMessage } = req.body;

    // Validate input
    if (!subject || (!message && !htmlMessage)) {
      return res.status(400).json({
        success: false,
        message: 'Subiectul și mesajul sunt obligatorii'
      });
    }

    // Find user
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilizatorul nu a fost găsit'
      });
    }

    // Send email
    const emailResult = await sendEmail({
      to: user.email,
      subject,
      text: message || '',
      html: htmlMessage || message
    });

    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: `Eroare la trimiterea email-ului: ${emailResult.error}`
      });
    }

    // Log the email sending
    logger.info(`Email sent to user ${user._id} (${user.email}): ${subject}`);

    return res.status(200).json({
      success: true,
      message: 'Email trimis cu succes'
    });
  } catch (error) {
    logger.error(`Send email to user error: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Send bulk emails to users
 * @route   POST /api/admin/email/bulk
 * @access  Private/Admin
 */
exports.sendBulkEmails = async (req, res, next) => {
  try {
    const { userIds, subject, message, htmlMessage } = req.body;

    // Validate input
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Lista de utilizatori este obligatorie'
      });
    }

    if (!subject || (!message && !htmlMessage)) {
      return res.status(400).json({
        success: false,
        message: 'Subiectul și mesajul sunt obligatorii'
      });
    }

    // Find all users
    const users = await User.find({ _id: { $in: userIds } });
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Nu s-au găsit utilizatori'
      });
    }

    // Send emails
    const emailsCount = users.length;
    const emailPromises = users.map(user => 
      sendEmail({
        to: user.email,
        subject,
        text: message || '',
        html: htmlMessage || message
      })
    );

    const results = await Promise.allSettled(emailPromises);
    
    // Count successes and failures
    const successes = results.filter(result => result.value && result.value.success).length;
    const failures = emailsCount - successes;

    // Log the results
    logger.info(`Bulk email sent to ${successes} users. Failed: ${failures}`);

    return res.status(200).json({
      success: true,
      message: `Email-uri trimise: ${successes} din ${emailsCount} (eșuate: ${failures})`,
      details: {
        total: emailsCount,
        successful: successes,
        failed: failures
      }
    });
  } catch (error) {
    logger.error(`Send bulk emails error: ${error.message}`);
    next(error);
  }
};
