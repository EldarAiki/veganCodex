const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {

  if (err instanceof ErrorResponse && err.statusCode === 403) {
    return res.status(403).json({
      success: false,
      error: 'Forbidden by CORS policy'
    });
  }

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: err.errors
    });
  }

  // Handle express-validator errors
  if (err.name === 'Result') {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: err.array().map(e => ({
        param: e.param,
        message: e.msg
      }))
    });
  }

  res.status(statusCode).json({
    success: false,
    error: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

module.exports = { errorHandler };