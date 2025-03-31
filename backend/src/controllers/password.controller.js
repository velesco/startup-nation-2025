const crypto = require('crypto');
const User = require('../models/User');
const PasswordReset = require('../models/PasswordReset');
const logger = require('../utils/logger');
const nodemailer = require('nodemailer');

// Utility function to send email
const sendEmail = async (options) => {
  try {
    // Check if SMTP credentials are actually configured
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    
    if (!smtpUser || !smtpPass || smtpUser === 'your-email@gmail.com') {
      logger.warn('Email sending skipped: SMTP credentials not properly configured');
      return { success: false, error: 'SMTP credentials not configured' };
    }
    
    const config = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    };

    const transporter = nodemailer.createTransport(config);
    
    const mailOptions = {
      from: `\"Start-Up Nation 2025\" <${config.auth.user}>`,
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

// Generate a random token
const generateToken = () => {
  return crypto.randomBytes(20).toString('hex');
};

// Controller for handling forgot password request
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Te rugăm să furnizezi o adresă de email'
      });
    }
    
    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    
    // If user doesn't exist, still return success (for security reasons)
    if (!user) {
      logger.info(`Forgot password attempt for non-existent email: ${email}`);
      return res.status(200).json({
        success: true,
        message: 'Dacă această adresă de email există în baza noastră de date, vei primi un email cu instrucțiuni pentru resetarea parolei.'
      });
    }
    
    // Generate reset token
    const resetToken = generateToken();
    const resetExpires = Date.now() + 3600000; // Token expires in 1 hour
    
    // Save token to database
    let passwordReset = await PasswordReset.findOne({ user: user._id });
    
    if (passwordReset) {
      // Update existing record
      passwordReset.token = resetToken;
      passwordReset.expires = resetExpires;
    } else {
      // Create new record
      passwordReset = new PasswordReset({
        user: user._id,
        token: resetToken,
        expires: resetExpires
      });
    }
    
    await passwordReset.save();
    
    // Frontend reset URL
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
    
    // Send email with reset link
    const emailResult = await sendEmail({
      to: email,
      subject: 'Start-Up Nation 2025 - Resetare Parolă',
      text: `Bună ziua,\n\nAi solicitat resetarea parolei tale pentru contul Start-Up Nation 2025. Te rugăm să accesezi următorul link pentru a reseta parola: ${resetUrl}\n\nAcest link este valabil timp de 1 oră. Dacă nu ai solicitat resetarea parolei, te rugăm să ignori acest email.\n\nCu stimă,\nEchipa Start-Up Nation 2025`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(to right, #4F46E5, #7C3AED); padding: 20px; text-align: center; color: white;">
            <h2>Start-Up Nation 2025</h2>
          </div>
          <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
            <p>Bună ziua,</p>
            <p>Ai solicitat resetarea parolei tale pentru contul Start-Up Nation 2025.</p>
            <p>Te rugăm să accesezi următorul link pentru a reseta parola:</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Resetează parola</a>
            </p>
            <p>Sau copiază și lipește următorul link în browser-ul tău:</p>
            <p style="background-color: #f3f4f6; padding: 10px; border-radius: 4px; word-break: break-all;"><a href="${resetUrl}">${resetUrl}</a></p>
            <p><strong>Notă:</strong> Acest link este valabil timp de 1 oră.</p>
            <p>Dacă nu ai solicitat resetarea parolei, te rugăm să ignori acest email.</p>
            <p style="margin-top: 30px;">Cu stimă,<br>Echipa Start-Up Nation 2025</p>
          </div>
          <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280;">
            <p>&copy; 2025 Start-Up Nation. Toate drepturile rezervate.</p>
          </div>
        </div>
      `
    });
    
    if (!emailResult.success) {
      logger.error(`Failed to send password reset email to ${email}: ${emailResult.error}`);
      return res.status(500).json({
        success: false,
        message: 'A apărut o eroare la trimiterea email-ului. Te rugăm să încerci din nou.'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Un email cu instrucțiuni pentru resetarea parolei a fost trimis la adresa furnizată.'
    });
  } catch (error) {
    logger.error(`Forgot password error: ${error.message}`);
    next(error);
  }
};

// Controller for verifying a reset token
exports.verifyResetToken = async (req, res, next) => {
  try {
    const { token, email } = req.body;
    
    if (!token || !email) {
      return res.status(400).json({
        success: false,
        message: 'Token-ul și email-ul sunt obligatorii'
      });
    }
    
    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Link-ul de resetare este invalid sau a expirat'
      });
    }
    
    // Find password reset record
    const passwordReset = await PasswordReset.findOne({
      user: user._id,
      token,
      expires: { $gt: Date.now() }
    });
    
    if (!passwordReset) {
      return res.status(400).json({
        success: false,
        message: 'Link-ul de resetare este invalid sau a expirat'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Token-ul este valid'
    });
  } catch (error) {
    logger.error(`Verify reset token error: ${error.message}`);
    next(error);
  }
};

// Controller for resetting password
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, email, password } = req.body;
    
    if (!token || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Toate câmpurile sunt obligatorii'
      });
    }
    
    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Link-ul de resetare este invalid sau a expirat'
      });
    }
    
    // Find password reset record
    const passwordReset = await PasswordReset.findOne({
      user: user._id,
      token,
      expires: { $gt: Date.now() }
    });
    
    if (!passwordReset) {
      return res.status(400).json({
        success: false,
        message: 'Link-ul de resetare este invalid sau a expirat'
      });
    }
    
    // Update user's password
    user.password = password;
    await user.save();
    
    // Delete password reset record
    await passwordReset.deleteOne();
    
    // Send confirmation email
    const emailResult = await sendEmail({
      to: email,
      subject: 'Start-Up Nation 2025 - Parolă Resetată cu Succes',
      text: `Bună ziua,\n\nParola contului tău Start-Up Nation 2025 a fost resetată cu succes.\n\nDacă nu ai solicitat această modificare, te rugăm să contactezi echipa de suport imediat.\n\nCu stimă,\nEchipa Start-Up Nation 2025`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(to right, #4F46E5, #7C3AED); padding: 20px; text-align: center; color: white;">
            <h2>Start-Up Nation 2025</h2>
          </div>
          <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
            <p>Bună ziua,</p>
            <p>Parola contului tău Start-Up Nation 2025 a fost resetată cu succes.</p>
            <p>Dacă nu ai solicitat această modificare, te rugăm să contactezi echipa de suport imediat.</p>
            <p style="margin-top: 30px;">Cu stimă,<br>Echipa Start-Up Nation 2025</p>
          </div>
          <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280;">
            <p>&copy; 2025 Start-Up Nation. Toate drepturile rezervate.</p>
          </div>
        </div>
      `
    });
    
    if (!emailResult.success) {
      logger.warn(`Failed to send password reset confirmation email to ${email}: ${emailResult.error}`);
    }
    
    return res.status(200).json({
      success: true,
      message: 'Parola a fost resetată cu succes'
    });
  } catch (error) {
    logger.error(`Reset password error: ${error.message}`);
    next(error);
  }
};