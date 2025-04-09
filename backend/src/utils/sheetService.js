const axios = require('axios');
const logger = require('./logger');

/**
 * Service to send data to Google Sheets via a webhook or API
 */
class SheetService {
  /**
   * Send client data to Google Sheets
   * @param {Object} userData - User data to send to sheets
   * @returns {Promise<Object>} - Result of the operation
   */
  static async sendUserToSheet(userData) {
    try {
      // Use the Google Sheets API URL or a webhook URL like Zapier, Make.com, etc.
      const sheetApiUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;
      
      if (!sheetApiUrl) {
        logger.warn('Google Sheet webhook URL not configured');
        return { success: false, message: 'Sheet webhook URL not configured' };
      }

      // Prepare data to send to sheets
      const sheetData = {
        timestamp: new Date().toISOString(),
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        organization: userData.organization || '',
        position: userData.position || '',
        role: userData.role,
        registeredAt: userData.createdAt,
        idCardUploaded: userData.documents?.id_cardUploaded ? 'Yes' : 'No',
        idCardCNP: userData.idCard?.CNP || '',
        idCardFullName: userData.idCard?.fullName || '',
        idCardAddress: userData.idCard?.address || '',
        lastLogin: userData.lastLogin ? new Date(userData.lastLogin).toISOString() : ''
      };

      // Send data to the webhook/API
      const response = await axios.post(sheetApiUrl, sheetData);
      
      if (response.status >= 200 && response.status < 300) {
        logger.info(`User data sent to sheet successfully: ${userData._id}`);
        return { success: true, data: response.data };
      } else {
        logger.error(`Failed to send user data to sheet: ${response.status} ${JSON.stringify(response.data)}`);
        return { success: false, message: 'Failed to send data to sheet', error: response.data };
      }
    } catch (error) {
      logger.error(`Error sending user to sheet: ${error.message}`);
      return { success: false, message: error.message };
    }
  }
}

module.exports = SheetService;