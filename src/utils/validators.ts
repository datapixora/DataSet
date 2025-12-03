import { body, param, query, ValidationChain } from 'express-validator';

// Auth validators
export const signupValidation: ValidationChain[] = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and number'),
  body('fullName').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('countryCode').optional().isISO31661Alpha2().withMessage('Invalid country code'),
];

export const loginValidation: ValidationChain[] = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

// Campaign validators
export const createCampaignValidation: ValidationChain[] = [
  body('title').trim().isLength({ min: 5, max: 255 }).withMessage('Title must be 5-255 characters'),
  body('description').optional().trim(),
  body('tags').isArray({ min: 1 }).withMessage('At least one tag is required'),
  body('basePayout').isFloat({ min: 0.01 }).withMessage('Base payout must be positive'),
  body('bonusPayout').optional().isFloat({ min: 0 }),
  body('targetQuantity').optional().isInt({ min: 1 }),
];

// Upload validators
export const uploadCompleteValidation: ValidationChain[] = [
  body('uploadId').isUUID().withMessage('Valid upload ID is required'),
  body('campaignId').isUUID().withMessage('Valid campaign ID is required'),
  body('userTags').isArray({ min: 1 }).withMessage('At least one tag is required'),
  body('gpsCoordinates').optional().isObject(),
  body('gpsCoordinates.latitude').optional().isFloat({ min: -90, max: 90 }),
  body('gpsCoordinates.longitude').optional().isFloat({ min: -180, max: 180 }),
];

// Common validators
export const uuidParam = param('id').isUUID().withMessage('Invalid ID format');

export const paginationValidation: ValidationChain[] = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be at least 1'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100'),
];
