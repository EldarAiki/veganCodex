const rateLimit = require('express-rate-limit');

// Global rate limiter (for all requests)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,
  message: 'Too many requests, please try again later'
});

// Auth-specific limiter (stricter for login/register)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit auth endpoints to 20 requests per IP
  message: 'Too many login attempts, please try again later'
});

module.exports = { globalLimiter, authLimiter };