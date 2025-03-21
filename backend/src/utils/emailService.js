const nodemailer = require('nodemailer');
const { ApiError } = require('./ApiError');

// Create transporter
let transporter;
if (process.env.NODE_ENV === 'production') {
  // Production transporter using environment variables
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_PORT === '465',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
} else {
  // Development transporter using Ethereal
  // This will be initialized later in initEmailTransporter function
  transporter = null;
}

/**
 * Initialize email transporter (for development environment)
 */
const initEmailTransporter = async () => {
  if (process.env.NODE_ENV !== 'production' && !transporter) {
    try {
      // Create Ethereal test account
      const testAccount = await nodemailer.createTestAccount();
      
      // Create transporter
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      
      console.log('Ethereal email account created for testing:');
      console.log(`- User: ${testAccount.user}`);
      console.log(`- Password: ${testAccount.pass}`);
      console.log(`- Preview URL: https://ethereal.email/login`);
    } catch (error) {
      console.error('Failed to create test email account:', error);
      // Fallback to a mock transporter
      transporter = {
        sendMail: async () => {
          console.log('Email would be sent in production');
          return { messageId: 'mock-id' };
        },
      };
    }
  }
};

/**
 * Send email
 * @param {Object} options - Email options
 * @returns {Promise<Object>} - Sent message info
 */
const sendEmail = async (options) => {
  try {
    if (!transporter) {
      await initEmailTransporter();
    }
    
    // Set default from
    const from = options.from || process.env.EMAIL_FROM || 'Startup Nation 2025 <noreply@example.com>';
    
    // Send email
    const info = await transporter.sendMail({
      from,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });
    
    // Log Ethereal URL in development
    if (process.env.NODE_ENV !== 'production' && info.messageId !== 'mock-id') {
      console.log('Email preview URL:', nodemailer.getTestMessageUrl(info));
    }
    
    return info;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new ApiError(500, 'Failed to send email');
  }
};

/**
 * Send welcome email
 * @param {string} email - Recipient email
 * @param {string} name - Recipient name
 * @returns {Promise<Object>} - Sent message info
 */
const sendWelcomeEmail = async (email, name) => {
  const subject = 'Bine ai venit la Startup Nation 2025';
  const text = `Bună ${name},\n\nÎți mulțumim pentru înregistrarea în platforma Startup Nation 2025. Suntem bucuroși să te avem alături.\n\nCu stimă,\nEchipa Startup Nation 2025`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Bine ai venit la Startup Nation 2025</h2>
      <p>Bună ${name},</p>
      <p>Îți mulțumim pentru înregistrarea în platforma Startup Nation 2025. Suntem bucuroși să te avem alături.</p>
      <p>Cu stimă,<br>Echipa Startup Nation 2025</p>
    </div>
  `;
  
  return sendEmail({ to: email, subject, text, html });
};

/**
 * Send password reset email
 * @param {string} email - Recipient email
 * @param {string} name - Recipient name
 * @param {string} resetUrl - Password reset URL
 * @returns {Promise<Object>} - Sent message info
 */
const sendPasswordResetEmail = async (email, name, resetUrl) => {
  const subject = 'Resetare parolă - Startup Nation 2025';
  const text = `Bună ${name},\n\nAi solicitat resetarea parolei pentru contul tău. Accesează următorul link pentru a-ți reseta parola:\n\n${resetUrl}\n\nAcest link va expira în 1 oră.\n\nDacă nu ai solicitat resetarea parolei, te rugăm să ignori acest email.\n\nCu stimă,\nEchipa Startup Nation 2025`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Resetare parolă - Startup Nation 2025</h2>
      <p>Bună ${name},</p>
      <p>Ai solicitat resetarea parolei pentru contul tău. Accesează butonul de mai jos pentru a-ți reseta parola:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #2e5bb0; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Resetează parola</a>
      </div>
      <p>Sau copiază și accesează următorul link:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>Acest link va expira în 1 oră.</p>
      <p>Dacă nu ai solicitat resetarea parolei, te rugăm să ignori acest email.</p>
      <p>Cu stimă,<br>Echipa Startup Nation 2025</p>
    </div>
  `;
  
  return sendEmail({ to: email, subject, text, html });
};

/**
 * Send notification email
 * @param {string} email - Recipient email
 * @param {string} name - Recipient name
 * @param {string} subject - Email subject
 * @param {string} message - Email message
 * @returns {Promise<Object>} - Sent message info
 */
const sendNotificationEmail = async (email, name, subject, message) => {
  const text = `Bună ${name},\n\n${message}\n\nCu stimă,\nEchipa Startup Nation 2025`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>${subject}</h2>
      <p>Bună ${name},</p>
      <p>${message}</p>
      <p>Cu stimă,<br>Echipa Startup Nation 2025</p>
    </div>
  `;
  
  return sendEmail({ to: email, subject, text, html });
};

module.exports = {
  initEmailTransporter,
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendNotificationEmail
};
