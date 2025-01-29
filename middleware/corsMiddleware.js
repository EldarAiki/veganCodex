
// TODO - edit production domain list

const ErrorResponse = require('../utils/errorResponse');

const allowedOrigins = [
  process.env.NODE_ENV === 'development' && 'http://localhost:3000', // React web dev
  process.env.NODE_ENV === 'development' && 'http://localhost:19006', // Expo dev
  'https://your-production-app.com', // Production domains
  'https://*.your-production-app.com' // All subdomains
].filter(Boolean); // Remove false values

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
        callback(new ErrorResponse('Not allowed by CORS', 403));;
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept'
  ],
  credentials: true, // Allow cookies/authentication headers
  preflightContinue: false,
  optionsSuccessStatus: 204
};

module.exports = { corsOptions };