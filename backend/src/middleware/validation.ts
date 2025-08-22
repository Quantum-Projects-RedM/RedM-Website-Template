import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import DOMPurify from 'isomorphic-dompurify';

// Middleware to handle validation errors
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.type === 'field' ? (err as any).path : 'unknown',
        message: err.msg
      }))
    });
  }
  next();
};

// Sanitize HTML content
export const sanitizeHTML = (text: string): string => {
  return DOMPurify.sanitize(text, { 
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: []
  });
};

// Auth validation rules
export const validateRegister = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('username')
    .isLength({ min: 3, max: 20 })
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username must be 3-20 characters, alphanumeric with _ or -'),
  body('password')
    .isLength({ min: 6, max: 128 })
    .matches(/^(?=.*[a-zA-Z])(?=.*\d)/)
    .withMessage('Password must be 6+ characters with at least one letter and number'),
  handleValidationErrors
];

export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 1, max: 128 })
    .withMessage('Password is required'),
  handleValidationErrors
];

export const validateProfileUpdate = [
  body('username')
    .optional()
    .isLength({ min: 3, max: 20 })
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username must be 3-20 characters, alphanumeric with _ or -'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  handleValidationErrors
];

// Forum validation rules
export const validateForumPost = [
  body('title')
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be 3-100 characters')
    .customSanitizer((value) => sanitizeHTML(value)),
  body('content')
    .isLength({ min: 10, max: 5000 })
    .withMessage('Content must be 10-5000 characters')
    .customSanitizer((value) => sanitizeHTML(value)),
  body('category')
    .isNumeric()
    .withMessage('Valid category ID is required'),
  body('imageUrl')
    .optional()
    .isURL({ protocols: ['http', 'https'] })
    .withMessage('Invalid image URL'),
  handleValidationErrors
];

export const validateForumReply = [
  body('content')
    .isLength({ min: 3, max: 2000 })
    .withMessage('Reply must be 3-2000 characters')
    .customSanitizer((value) => sanitizeHTML(value)),
  handleValidationErrors
];

export const validateForumCategory = [
  body('name')
    .isLength({ min: 3, max: 50 })
    .withMessage('Category name must be 3-50 characters')
    .customSanitizer((value) => sanitizeHTML(value)),
  body('description')
    .isLength({ min: 10, max: 200 })
    .withMessage('Description must be 10-200 characters')
    .customSanitizer((value) => sanitizeHTML(value)),
  body('icon')
    .matches(/^\/assets\/[a-zA-Z0-9_.-]+\.(png|jpg|jpeg|gif)$/)
    .withMessage('Invalid icon path'),
  handleValidationErrors
];

// Event validation rules
export const validateEvent = [
  body('title')
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be 3-100 characters')
    .customSanitizer((value) => sanitizeHTML(value)),
  body('description')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be 10-1000 characters')
    .customSanitizer((value) => sanitizeHTML(value)),
  body('date')
    .isISO8601()
    .withMessage('Valid date is required'),
  body('maxParticipants')
    .isInt({ min: 1, max: 100 })
    .withMessage('Max participants must be 1-100'),
  handleValidationErrors
];

// Rules validation
export const validateRule = [
  body('title')
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be 3-100 characters')
    .customSanitizer((value) => sanitizeHTML(value)),
  body('description')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be 10-2000 characters')
    .customSanitizer((value) => sanitizeHTML(value)),
  body('category')
    .isIn(['GENERAL', 'ROLEPLAY', 'PVP', 'ECONOMY'])
    .withMessage('Invalid rule category'),
  handleValidationErrors
];