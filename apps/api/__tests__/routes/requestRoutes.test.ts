import express from 'express';
import request from 'supertest';
import requestRoutes from '../../routes/requestRoutes';

jest.mock('../../controllers/requestsController', () => ({
  getMyBookRequests: jest.fn((req, res) =>
    res.status(200).json({ requests: [], message: 'Mocked get my requests' }),
  ),
  createBookRequest: jest.fn((req, res) =>
    res.status(201).json({ message: 'Mocked create request' }),
  ),
}));

jest.mock('../../middleware/auth', () => ({
  authenticate: jest.fn((req, res, next) => {
    req.user = { id: 1, email: 'test@example.com' };
    next();
  }),
}));

describe('Request Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/requests', requestRoutes);
  });

  describe('GET /api/requests/me', () => {
    it('should route to getMyBookRequests controller', async () => {
      const response = await request(app).get('/api/requests/me').send();

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Mocked get my requests');
    });
  });

  describe('POST /api/requests', () => {
    it('should route to createBookRequest controller', async () => {
      const response = await request(app)
        .post('/api/requests')
        .send({ title: 'Dune', author: 'Frank Herbert' });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Mocked create request');
    });
  });
});
