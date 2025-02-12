const request = require('supertest');
const app = require('../server');
const getAuthToken = require('../tests/helpers');

describe('Authentication', () => {
  test('Register new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'test-user',
        email: 'test-register@example.com',
        password: 'Testpass123!'
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('token');
  });

  test('Login with invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'wrong@example.com',
        password: 'invalid'
      });

    expect(res.statusCode).toEqual(401);
  });
});