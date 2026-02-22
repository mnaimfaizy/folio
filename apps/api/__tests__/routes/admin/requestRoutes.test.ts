import express from 'express';
import request from 'supertest';
import * as requestsController from '../../../controllers/requestsController';
import { authenticate, isAdmin } from '../../../middleware/auth';
import requestRoutes from '../../../routes/admin/requestRoutes';

jest.mock('../../../middleware/auth', () => ({
  authenticate: jest.fn((req, res, next) => {
    req.user = { id: 1, isAdmin: true };
    next();
  }),
  isAdmin: jest.fn((req, res, next) => next()),
}));

jest.mock('../../../controllers/requestsController');

describe('Admin Request Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/admin/requests', requestRoutes);

    jest.clearAllMocks();

    (
      requestsController.getAllBookRequestsForAdmin as jest.Mock
    ).mockImplementation((req, res) => {
      res.status(200).json({ requests: [] });
    });

    (
      requestsController.getBookRequestAnalytics as jest.Mock
    ).mockImplementation((req, res) => {
      res.status(200).json({ items: [] });
    });

    (
      requestsController.markRequestFulfilledManually as jest.Mock
    ).mockImplementation((req, res) => {
      res.status(200).json({ message: 'Request marked as fulfilled manually' });
    });

    (
      requestsController.autoFulfillRequestsByBook as jest.Mock
    ).mockImplementation((req, res) => {
      res
        .status(200)
        .json({
          message: 'Matching open requests processed',
          fulfilledCount: 1,
        });
    });
  });

  it('GET /api/admin/requests routes correctly', async () => {
    const response = await request(app).get('/api/admin/requests');

    expect(response.status).toBe(200);
    expect(authenticate).toHaveBeenCalled();
    expect(isAdmin).toHaveBeenCalled();
    expect(requestsController.getAllBookRequestsForAdmin).toHaveBeenCalled();
  });

  it('GET /api/admin/requests/analytics routes correctly', async () => {
    const response = await request(app).get('/api/admin/requests/analytics');

    expect(response.status).toBe(200);
    expect(requestsController.getBookRequestAnalytics).toHaveBeenCalled();
  });

  it('POST /api/admin/requests/:requestId/fulfill routes correctly', async () => {
    const response = await request(app)
      .post('/api/admin/requests/2/fulfill')
      .send({ bookId: 10, note: 'Purchased and cataloged' });

    expect(response.status).toBe(200);
    expect(requestsController.markRequestFulfilledManually).toHaveBeenCalled();
  });

  it('POST /api/admin/requests/fulfill-by-book/:bookId routes correctly', async () => {
    const response = await request(app)
      .post('/api/admin/requests/fulfill-by-book/12')
      .send();

    expect(response.status).toBe(200);
    expect(requestsController.autoFulfillRequestsByBook).toHaveBeenCalled();
  });
});
