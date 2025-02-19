// tests/comment.profanity.test.js
const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../server'); // Adjust path based on your structure
const getAuthToken = require('../tests/helpers');

// Test user credentials
const testUser = {
  email: 'testprofanity@example.com',
  password: 'test1234',
};

let authToken;

beforeAll(async () => {
  // Connect to test DB and create a user
  await mongoose.connect(process.env.MONGODB_URI);
  // login with user and get JWT
  
  authToken = await getAuthToken();
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('POST /api/v1/comments - Profanity Filter', () => {
  it('should block comment with profanity', async () => {
    const res = await request(app)
      .post('/api/products/648a3b1e5f1d8a2e24567894/comments')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        content: 'This product is absolute bullshit!', // Contains profanity
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toMatch(/inappropriate language/i);
  });

  it('should allow clean comment', async () => {
    const res = await request(app)
      .post('/api/products/648a3b1e5f1d8a2e24567894/comments')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        content: 'This vegan cheese is amazing!',
        product: '648a3b1e5f1d8a2e24567894'
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.content).toBe('This vegan cheese is amazing!');
  });
});