require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');
const { globalLimiter, authLimiter } = require('./middleware/rateLimiter');
const helmet = require('helmet');

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
      scriptSrc: ["'self'", "trusted-cdn.com"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
      styleSrc: ["'self'", "'unsafe-inline'"], // Only if using inline styles
      fontSrc: ["'self'", "https://fonts.gstatic.com"]
    }
  })
);
// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
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