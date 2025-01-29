require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');
const { globalLimiter, authLimiter } = require('./middleware/validators/rateLimiter');
const { corsOptions } = require('./middleware/corsMiddleware')
const helmet = require('helmet');
const xssResponseSanitizer = require('./middleware/sanitizeResponse');

// Initialize Express
const app = express();

// Connect to MongoDB
connectDB();

// helmet security middleware
app.use(helmet());
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'", 
        "'unsafe-inline'", // Remove this in production
        "trusted-scripts.com"
      ],
      styleSrc: ["'self'", "'unsafe-inline'"], // Tighten later
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"], // Disallow plugins (Flash, etc.)
      upgradeInsecureRequests: [] // Force HTTPS
    }
  })
);
// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan('dev'));
app.use(xssResponseSanitizer);
app.use(globalLimiter);
app.use('/api/auth', authLimiter);
// Error Handling Middleware
app.use(errorHandler);

// Basic Route
app.get('/api/health', (req, res) => {
  res.json({ status: 'active', timestamp: new Date() });
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});