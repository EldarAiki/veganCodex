const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');


// Reusable authentication helper
const getAuthToken = async () => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'loshinas@gmail.com',
      password: 'Marmazon5!'
    });
  return res.body.token;
};

// Clean test data after each test

afterEach(async () => {
  const db = mongoose.connection;
  const collections = await db.db.listCollections().toArray();

  for (const collection of collections) {
    const result = await db.collection(collection.name).deleteMany({
      $or: [
        { name: { $regex: /test-/, $options: 'i' } },
        { email: { $regex: /test-/, $options: 'i' } }
      ]
    });
  }
});

module.exports = getAuthToken;

