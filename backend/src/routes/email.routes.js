const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const { sendEmailToUser, sendBulkEmails } = require('../controllers/email.controller');

// Toate rutele de aici sunt protejate și necesită autentificare
// Doar administratorii pot trimite email-uri
router.use(protect);
router.use(authorize('admin', 'super-admin'));

// Rută pentru trimiterea unui email către un utilizator specific
router.post('/user/:id', sendEmailToUser);

// Rută pentru trimiterea de email-uri în masă către mai mulți utilizatori
router.post('/bulk', sendBulkEmails);

module.exports = router;
