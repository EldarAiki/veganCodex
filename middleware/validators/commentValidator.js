const { body } = require('express-validator');

exports.reportCommentValidation = [
  body('reason')
    .trim()
    .notEmpty().withMessage('Reason is required')
    .isIn(['spam', 'inappropriate', 'false_info', 'other'])
    .withMessage('Invalid report reason')
];