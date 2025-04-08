const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const { 
  sendEmailToUser, 
  sendEmailToClient, 
  sendBulkEmails,
  sendBulkEmailsToClients 
} = require('../controllers/email.controller');

// Toate rutele de aici sunt protejate și necesită autentificare
router.use(protect);

// Rute pentru trimiterea unui email către un utilizator (doar pentru admini)
router.post('/user/:id', authorize('admin', 'super-admin'), sendEmailToUser);

// Rute pentru trimiterea unui email către un client (pentru admini și parteneri)
router.post('/client/:id', authorize('admin', 'super-admin', 'partner'), sendEmailToClient);

// Rută pentru trimiterea de email-uri în masă către mai mulți utilizatori (doar pentru admini)
router.post('/bulk', authorize('admin', 'super-admin'), sendBulkEmails);

// Rută pentru trimiterea de email-uri în masă către mai mulți clienți (pentru admini și parteneri)
router.post('/bulk-clients', authorize('admin', 'super-admin', 'partner'), sendBulkEmailsToClients);

module.exports = router;
