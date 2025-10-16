import { body, param, query, validationResult } from 'express-validator';

/**
 * Middleware to check validation results and return errors
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

/**
 * Sanitize HTML to prevent XSS attacks
 */
const sanitizeHTML = (str) => {
  if (!str) return str;
  return str
    .replace(/<[^>]*>/g, '') // Remove all HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers (onclick, onerror, etc.)
    .trim();
};

/**
 * Custom sanitizer for text fields
 */
const sanitizeText = (value) => {
  if (!value) return value;
  return sanitizeHTML(value);
};

// ==============================================
// PROFILE VALIDATION
// ==============================================
export const validateProfile = [
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be 3-20 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  
  body('full_name')
    .optional()
    .trim()
    .customSanitizer(sanitizeText)
    .isLength({ max: 100 })
    .withMessage('Full name must be under 100 characters'),
  
  body('bio')
    .optional()
    .trim()
    .customSanitizer(sanitizeText)
    .isLength({ max: 500 })
    .withMessage('Bio must be under 500 characters'),
  
  body('location')
    .optional()
    .trim()
    .customSanitizer(sanitizeText)
    .isLength({ max: 100 })
    .withMessage('Location must be under 100 characters'),
  
  body('favorite_cigar')
    .optional()
    .trim()
    .customSanitizer(sanitizeText)
    .isLength({ max: 100 })
    .withMessage('Favorite cigar must be under 100 characters'),
  
  validate
];

// ==============================================
// POST VALIDATION
// ==============================================
export const validatePost = [
  body('caption')
    .optional()
    .trim()
    .customSanitizer(sanitizeText)
    .isLength({ max: 2000 })
    .withMessage('Caption must be under 2000 characters'),
  
  body('image_url')
    .notEmpty()
    .withMessage('Image URL is required')
    .isURL()
    .withMessage('Must be a valid URL'),
  
  validate
];

// ==============================================
// COMMENT VALIDATION
// ==============================================
export const validateComment = [
  body('content')
    .notEmpty()
    .withMessage('Comment content is required')
    .trim()
    .customSanitizer(sanitizeText)
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment must be 1-1000 characters'),
  
  body('parent_comment_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Parent comment ID must be a positive integer'),
  
  validate
];

// ==============================================
// REVIEW VALIDATION
// ==============================================
export const validateReview = [
  body('rating')
    .notEmpty()
    .withMessage('Rating is required')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  
  body('content')
    .optional()
    .trim()
    .customSanitizer(sanitizeText)
    .isLength({ max: 2000 })
    .withMessage('Review content must be under 2000 characters'),
  
  body('flavorNotes')
    .optional()
    .customSanitizer(sanitizeText)
    .isLength({ max: 500 })
    .withMessage('Flavor notes must be under 500 characters'),
  
  body('smokingDuration')
    .optional()
    .isInt({ min: 1, max: 300 })
    .withMessage('Smoking duration must be between 1 and 300 minutes'),
  
  body('title')
    .optional()
    .trim()
    .customSanitizer(sanitizeText)
    .isLength({ max: 200 })
    .withMessage('Title must be under 200 characters'),
  
  body('smokingDate')
    .optional()
    .isISO8601()
    .withMessage('Smoking date must be a valid date'),
  
  body('location')
    .optional()
    .trim()
    .customSanitizer(sanitizeText)
    .isLength({ max: 200 })
    .withMessage('Location must be under 200 characters'),
  
  validate
];

// ==============================================
// HUMIDOR VALIDATION
// ==============================================
export const validateHumidorEntry = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['owned', 'wishlist', 'smoked'])
    .withMessage('Status must be owned, wishlist, or smoked'),
  
  body('quantity')
    .optional()
    .isInt({ min: 0, max: 10000 })
    .withMessage('Quantity must be between 0 and 10000'),
  
  body('purchase_price')
    .optional()
    .isFloat({ min: 0, max: 100000 })
    .withMessage('Purchase price must be between 0 and 100000'),
  
  body('personal_notes')
    .optional()
    .trim()
    .customSanitizer(sanitizeText)
    .isLength({ max: 1000 })
    .withMessage('Personal notes must be under 1000 characters'),
  
  validate
];

// ==============================================
// SMOKING SESSION VALIDATION
// ==============================================
export const validateSmokingSession = [
  body('latitude')
    .notEmpty()
    .withMessage('Latitude is required')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Invalid latitude'),
  
  body('longitude')
    .notEmpty()
    .withMessage('Longitude is required')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Invalid longitude'),
  
  body('location_name')
    .optional()
    .trim()
    .customSanitizer(sanitizeText)
    .isLength({ max: 200 })
    .withMessage('Location name must be under 200 characters'),
  
  body('notes')
    .optional()
    .trim()
    .customSanitizer(sanitizeText)
    .isLength({ max: 1000 })
    .withMessage('Notes must be under 1000 characters'),
  
  body('cigar_name')
    .optional()
    .trim()
    .customSanitizer(sanitizeText)
    .isLength({ max: 200 })
    .withMessage('Cigar name must be under 200 characters'),
  
  validate
];

// ==============================================
// SEARCH VALIDATION
// ==============================================
export const validateSearch = [
  query('q')
    .optional()
    .trim()
    .customSanitizer(sanitizeText)
    .isLength({ max: 200 })
    .withMessage('Search query must be under 200 characters'),
  
  query('page')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Page must be between 1 and 1000'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  validate
];

// ==============================================
// ID VALIDATION (for route parameters)
// ==============================================
export const validateId = [
  param('id')
    .notEmpty()
    .withMessage('ID is required')
    .isInt({ min: 1 })
    .withMessage('ID must be a positive integer'),
  
  validate
];

export const validateUUID = [
  param('id')
    .notEmpty()
    .withMessage('ID is required')
    .isUUID()
    .withMessage('ID must be a valid UUID'),
  
  validate
];

// ==============================================
// CIGAR VALIDATION (for AI-identified cigars)
// ==============================================
export const validateCigar = [
  body('brand')
    .optional()
    .trim()
    .customSanitizer(sanitizeText)
    .isLength({ min: 1, max: 100 })
    .withMessage('Brand must be 1-100 characters'),
  
  body('line')
    .optional()
    .trim()
    .customSanitizer(sanitizeText)
    .isLength({ max: 100 })
    .withMessage('Line must be under 100 characters'),
  
  body('vitola')
    .optional()
    .trim()
    .customSanitizer(sanitizeText)
    .isLength({ max: 100 })
    .withMessage('Vitola must be under 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .customSanitizer(sanitizeText)
    .isLength({ max: 2000 })
    .withMessage('Description must be under 2000 characters'),
  
  validate
];

