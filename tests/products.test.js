const request = require('supertest');
const app = require('../server');
const getAuthToken = require('../tests/helpers');

describe('Product Routes', () => {
  let authToken;

  beforeAll(async () => {
    authToken = await getAuthToken();
  });

  test('Create new product', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'test-vegan-pizza',
        category: 'Local dish',
        country: 'Italy'
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('_id');
  });

  test('Prevent duplicate products', async () => {
    // First creation
    await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'test-unique-product',
        category: 'snack',
        country: 'Japan'
      });

    // Second attempt
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'test-unique-product',
        category: 'snack',
        country: 'Japan'
      });

    expect(res.statusCode).toEqual(409);
  });
});