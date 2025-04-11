/**
 * Serviciu pentru trimiterea notificărilor push către dispozitive mobile 
 * folosind Expo Push Notifications API
 */

const axios = require('axios');
const logger = require('../utils/logger');
const DeviceToken = require('../models/DeviceToken');

// URL-ul API-ului Expo pentru push notifications
const EXPO_PUSH_ENDPOINT = 'https://exp.host/--/api/v2/push/send';

/**
 * Trimite o notificare push către un singur token Expo
 * 
 * @param {string} expoPushToken - Token-ul Expo al dispozitivului
 * @param {string} title - Titlul notificării
 * @param {string} body - Conținutul notificării
 * @param {Object} data - Date adiționale pentru notificare (opțional)
 * @param {Object} options - Opțiuni suplimentare (sound, badge, etc.)
 * @returns {Promise<Object>} - Răspunsul de la API-ul Expo
 */
const sendPushNotification = async (expoPushToken, title, body, data = {}, options = {}) => {
  try {
    // Validare token
    if (!expoPushToken || !expoPushToken.includes('ExponentPushToken[')) {
      logger.warn(`Invalid Expo push token format: ${expoPushToken}`);
      return {
        success: false,
        error: 'Invalid push token format'
      };
    }

    // Pregătim mesajul pentru Expo
    const message = {
      to: expoPushToken,
      title,
      body,
      data,
      sound: options.sound || 'default',
      badge: options.badge || 1,
      // Alte opțiuni posibile
      channelId: options.channelId || 'default',
      priority: options.priority || 'default', // 'default' | 'normal' | 'high'
    };

    // Trimitem notificarea
    const response = await axios.post(EXPO_PUSH_ENDPOINT, message, {
      headers: {
        'Accept': 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
    });

    // Logăm rezultatul
    if (response.data.errors && response.data.errors.length > 0) {
      logger.error(`Error sending push notification: ${JSON.stringify(response.data.errors)}`);
      return {
        success: false,
        data: response.data
      };
    }

    logger.info(`Push notification sent successfully to: ${expoPushToken}`);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    logger.error(`Error sending push notification: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Trimite notificări push către mai multe token-uri Expo
 * 
 * @param {Array<string>} expoPushTokens - Array de token-uri Expo
 * @param {string} title - Titlul notificării
 * @param {string} body - Conținutul notificării
 * @param {Object} data - Date adiționale pentru notificare (opțional)
 * @param {Object} options - Opțiuni suplimentare (sound, badge, etc.)
 * @returns {Promise<Object>} - Răspunsul de la API-ul Expo
 */
const sendBulkPushNotifications = async (expoPushTokens, title, body, data = {}, options = {}) => {
  try {
    // Validăm dacă avem tokens
    if (!expoPushTokens || !Array.isArray(expoPushTokens) || expoPushTokens.length === 0) {
      logger.warn('No push tokens provided for bulk notification');
      return {
        success: false,
        error: 'No push tokens provided'
      };
    }

    // Filtrăm doar token-urile valide
    const validTokens = expoPushTokens.filter(token => 
      token && typeof token === 'string' && token.includes('ExponentPushToken[')
    );

    if (validTokens.length === 0) {
      logger.warn('No valid push tokens found for bulk notification');
      return {
        success: false,
        error: 'No valid push tokens found'
      };
    }

    // Pregătim mesajele pentru Expo
    const messages = validTokens.map(token => ({
      to: token,
      title,
      body,
      data,
      sound: options.sound || 'default',
      badge: options.badge || 1,
      channelId: options.channelId || 'default',
      priority: options.priority || 'default',
    }));

    // Trimitem notificările
    const response = await axios.post(EXPO_PUSH_ENDPOINT, messages, {
      headers: {
        'Accept': 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
    });

    // Logăm rezultatul
    const successCount = response.data.data.filter(item => !item.error).length;
    const errorCount = response.data.data.filter(item => item.error).length;

    logger.info(`Bulk push notification result: ${successCount} successes, ${errorCount} errors`);
    
    return {
      success: true,
      data: response.data,
      stats: {
        total: validTokens.length,
        success: successCount,
        error: errorCount
      }
    };
  } catch (error) {
    logger.error(`Error sending bulk push notifications: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Trimite o notificare push către toate dispozitivele unui utilizator
 * 
 * @param {string} userId - ID-ul utilizatorului
 * @param {string} title - Titlul notificării
 * @param {string} body - Conținutul notificării
 * @param {Object} data - Date adiționale pentru notificare (opțional)
 * @param {Object} options - Opțiuni suplimentare (sound, badge, etc.)
 * @returns {Promise<Object>} - Rezultatul operațiunii
 */
const sendPushToUser = async (userId, title, body, data = {}, options = {}) => {
  try {
    // Găsim toate token-urile active ale utilizatorului
    const devices = await DeviceToken.find({
      userId,
      isActive: true
    });

    if (!devices || devices.length === 0) {
      logger.info(`No active devices found for user: ${userId}`);
      return {
        success: false,
        message: 'No active devices found for this user'
      };
    }

    // Extragem tokenurile
    const tokens = devices.map(device => device.token);

    // Trimitem notificările
    const result = await sendBulkPushNotifications(tokens, title, body, data, options);

    return {
      success: result.success,
      data: result.data,
      stats: {
        devicesFound: devices.length,
        ...result.stats
      }
    };
  } catch (error) {
    logger.error(`Error sending push notification to user (${userId}): ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Trimite notificări push către toți utilizatorii cu un anumit rol
 * 
 * @param {string} role - Rolul utilizatorilor (client, admin, etc.)
 * @param {string} title - Titlul notificării
 * @param {string} body - Conținutul notificării
 * @param {Object} data - Date adiționale pentru notificare (opțional)
 * @param {Object} options - Opțiuni suplimentare (sound, badge, etc.)
 * @returns {Promise<Object>} - Rezultatul operațiunii
 */
const sendPushToRole = async (role, title, body, data = {}, options = {}) => {
  try {
    // Găsim toate token-urile active ale utilizatorilor cu rolul specificat
    const devices = await DeviceToken.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $match: {
          isActive: true,
          'user.role': role
        }
      }
    ]);

    if (!devices || devices.length === 0) {
      logger.info(`No active devices found for users with role: ${role}`);
      return {
        success: false,
        message: `No active devices found for users with role: ${role}`
      };
    }

    // Extragem tokenurile
    const tokens = devices.map(device => device.token);

    // Trimitem notificările
    const result = await sendBulkPushNotifications(tokens, title, body, data, options);

    return {
      success: result.success,
      data: result.data,
      stats: {
        devicesFound: devices.length,
        ...result.stats
      }
    };
  } catch (error) {
    logger.error(`Error sending push notification to role (${role}): ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Verifică starea token-urilor Expo (dacă sunt valide, expirate etc.)
 * 
 * @param {Array<string>} tokens - Array de token-uri Expo pentru verificare
 * @returns {Promise<Object>} - Rezultatul verificărilor
 */
const checkPushTokens = async (tokens) => {
  try {
    // Aceasta este o implementare simplificată
    // Expo nu oferă direct un endpoint de verificare a token-urilor
    // În implementarea reală, am putea trimite o notificare silențioasă și verifica răspunsul
    
    // Vom testa trimiterea unor notificări "phantom" pentru a verifica valid-ul tokenurilor
    const testNotification = {
      title: 'Token Verification',
      body: 'This is a test notification to verify token validity.',
      data: { type: 'verify' },
      _displayInForeground: false // Această notificare nu va fi afișată utilizatorului
    };
    
    const result = await sendBulkPushNotifications(tokens, 
      testNotification.title, 
      testNotification.body, 
      testNotification.data
    );
    
    // Analizăm rezultatul
    if (result.success && result.data && result.data.data) {
      const validTokens = [];
      const invalidTokens = [];
      
      result.data.data.forEach((response, index) => {
        if (response.status === 'ok') {
          validTokens.push(tokens[index]);
        } else {
          invalidTokens.push({
            token: tokens[index],
            error: response.message || 'Unknown error'
          });
        }
      });
      
      return {
        success: true,
        validTokens,
        invalidTokens,
        stats: {
          total: tokens.length,
          valid: validTokens.length,
          invalid: invalidTokens.length
        }
      };
    }
    
    return {
      success: false,
      error: 'Failed to check tokens',
      data: result.data
    };
  } catch (error) {
    logger.error(`Error checking push tokens: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  sendPushNotification,
  sendBulkPushNotifications,
  sendPushToUser,
  sendPushToRole,
  checkPushTokens
};
