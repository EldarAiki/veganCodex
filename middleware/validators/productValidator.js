const { body, param } = require('express-validator');
const DOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

const window = new JSDOM('').window;
const dompurify = DOMPurify(window);

const sanitizeInput = (value) => dompurify.sanitize(value).trim();

const productValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Product name is required')
    .isLength({ max: 100 }).withMessage('Name must be less than 100 characters')
    .escape(),
  
  body('category')
    .trim()
    .notEmpty().withMessage('Category is required')
    .isIn(['Local dish', 'street food', 'snack', 'dessert', 'drink'])
    .withMessage('Invalid product category'),
  
  body('country')
    .trim()
    .notEmpty().withMessage('Country is required')
    .isLength({ min: 2, max: 50 }).withMessage('Country must be between 2-50 characters')
    .escape(),
  
  body('description')
    .optional()
    .customSanitizer(sanitizeInput)
    .trim()
    .isLength({ max: 1000 }).withMessage('Description too long (max 1000 chars)')
    .escape()
];

const commentValidation = [
  body('text')
    .trim()
    .notEmpty().withMessage('Comment text is required')
    .customSanitizer(sanitizeInput)
    .isLength({ max: 500 }).withMessage('Comment must be less than 500 characters')
    .escape(),
  body('rating')
    .notEmpty().withMessage('Rating is required')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5')
];

const objectIdValidation = [
  param('id')
    .isMongoId().withMessage('Invalid ID format')
];

module.exports = {
  productValidation,
  commentValidation,
  objectIdValidation
};