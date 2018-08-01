
const request = require('supertest');
const messengerApi = require('../messenger-api');

describe('messenger-api.js', () => {
  test('the root path should respond to GET method', async () => {
    const response = await request(messengerApi).get('/');
    expect(response.statusCode).toBe(200);
  });
});
