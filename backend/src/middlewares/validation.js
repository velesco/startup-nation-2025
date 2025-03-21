const { body, validationResult } = require('express-validator');
const { ApiError } = require('../utils/ApiError');

/**
 * Validation middleware for login
 */
const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Email invalid')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Parola este obligatorie'),
  validate
];

/**
 * Validation middleware for registration
 */
const validateRegister = [
  body('name')
    .notEmpty()
    .withMessage('Numele este obligatoriu')
    .trim(),
  body('email')
    .isEmail()
    .withMessage('Email invalid')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Parola trebuie să aibă minim 6 caractere')
    .matches(/\d/)
    .withMessage('Parola trebuie să conțină cel puțin un număr'),
  body('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Număr de telefon invalid'),
  validate
];

/**
 * Validation middleware for user update
 */
const validateUserUpdate = [
  body('name')
    .optional()
    .notEmpty()
    .withMessage('Numele nu poate fi gol')
    .trim(),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Email invalid')
    .normalizeEmail(),
  body('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Număr de telefon invalid'),
  validate
];

/**
 * Validation middleware for password change
 */
const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Parola curentă este obligatorie'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Parola nouă trebuie să aibă minim 6 caractere')
    .matches(/\d/)
    .withMessage('Parola nouă trebuie să conțină cel puțin un număr'),
  validate
];

/**
 * Validation middleware for client
 */
const validateClient = [
  body('name')
    .notEmpty()
    .withMessage('Numele este obligatoriu')
    .trim(),
  body('email')
    .isEmail()
    .withMessage('Email invalid')
    .normalizeEmail(),
  body('phone')
    .notEmpty()
    .withMessage('Telefonul este obligatoriu'),
  body('businessDetails.companyName')
    .optional()
    .trim(),
  body('businessDetails.cui')
    .optional()
    .trim(),
  body('businessDetails.registrationNumber')
    .optional()
    .trim(),
  body('businessDetails.address')
    .optional()
    .trim(),
  body('businessDetails.activityDomain')
    .optional()
    .trim(),
  body('applicationDetails.projectValue')
    .optional()
    .isNumeric()
    .withMessage('Valoarea proiectului trebuie să fie un număr'),
  body('applicationDetails.fundingAmount')
    .optional()
    .isNumeric()
    .withMessage('Valoarea finanțării trebuie să fie un număr'),
  body('applicationDetails.ownContribution')
    .optional()
    .isNumeric()
    .withMessage('Contribuția proprie trebuie să fie un număr'),
  body('applicationDetails.expectedJobsCreated')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Numărul de locuri de muncă create trebuie să fie un număr întreg pozitiv'),
  validate
];

/**
 * Validation middleware for group
 */
const validateGroup = [
  body('name')
    .notEmpty()
    .withMessage('Numele este obligatoriu')
    .trim(),
  body('description')
    .optional()
    .trim(),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Data de început trebuie să fie o dată validă'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('Data de sfârșit trebuie să fie o dată validă')
    .custom((value, { req }) => {
      if (value && req.body.startDate && new Date(value) <= new Date(req.body.startDate)) {
        throw new Error('Data de sfârșit trebuie să fie după data de început');
      }
      return true;
    }),
  body('maxClients')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Numărul maxim de clienți trebuie să fie un număr întreg pozitiv'),
  validate
];

/**
 * Generic validation result handler
 */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  
  const extractedErrors = errors.array().map(err => err.msg);
  next(new ApiError(400, extractedErrors.join(', ')));
}

module.exports = {
  validateLogin,
  validateRegister,
  validateUserUpdate,
  validatePasswordChange,
  validateClient,
  validateGroup
};
