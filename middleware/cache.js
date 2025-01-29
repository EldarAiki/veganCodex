const redisClient = require('../config/redis');

const cacheMiddleware = (cacheDuration = 60) => async (req, res, next) => {
  const cacheKey = `vegancodex:${req.originalUrl}`;

  try {
    // Check cache
    const cachedData = await redisClient.get(cacheKey);
    
    if (cachedData) {
      console.log('Serving from cache');
      return res.json(JSON.parse(cachedData));
    }
  } catch (err) {
    console.error('Cache read error:', err);
  }

  // Override response method
  const originalJson = res.json;
  res.json = async (body) => {
    try {
      await redisClient.set(cacheKey, JSON.stringify(body), {
        EX: cacheDuration // Set expiration in seconds
      });
    } catch (err) {
      console.error('Cache write error:', err);
    }
    originalJson.call(res, body);
  };

  next();
};

module.exports = cacheMiddleware;