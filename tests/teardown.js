const mongoose = require('mongoose');
const redis = require('../config/redis');

module.exports = async () => {
  // Disconnect but leave Docker containers running
  await mongoose.disconnect();
  await redis.quit();
  if (app.listening) {
    await new Promise((resolve) => {
      app.listening.close(resolve);
    });
  }
};