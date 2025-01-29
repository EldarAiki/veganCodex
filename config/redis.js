const redis = require('redis');

// Create Redis client (version 4.x+ syntax)
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

// Connect to Redis
(async () => {
  await redisClient.connect();
})();

// Error handling
redisClient.on('error', (err) => {
  console.error('Redis connection error:', err);
});

module.exports = redisClient;