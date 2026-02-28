import express from 'express';
import request from 'supertest';
import loanRoutes from '../../routes/loanRoutes';

jest.mock('../../controllers/loansController', () => ({
  getMyLoans: jest.fn((req, res) =>
    res.status(200).json({ loans: [], message: 'Mocked get my loans' }),
  ),
  borrowBook: jest.fn((req, res) =>
    res.status(201).json({ message: 'Mocked borrow book' }),
  ),
  borrowBooksBatch: jest.fn((req, res) =>
    res.status(201).json({ message: 'Mocked batch borrow' }),
  ),
  returnLoan: jest.fn((req, res) =>
    res.status(200).json({ message: 'Mocked return loan' }),
  ),
}));

jest.mock('../../middleware/auth', () => ({
  authenticate: jest.fn((req, res, next) => {
    req.user = { id: 1, email: 'test@example.com' };
    next();
  }),
}));

describe('Loan Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/loans', loanRoutes);
  });

  describe('GET /api/loans/me', () => {
    it('should route to getMyLoans controller', async () => {
      const response = await request(app).get('/api/loans/me').send();

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Mocked get my loans');
    });
  });

  describe('POST /api/loans', () => {
    it('should route to borrowBook controller', async () => {
      const response = await request(app)
        .post('/api/loans')
        .send({ bookId: 1 });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Mocked borrow book');
    });
  });

  describe('POST /api/loans/:loanId/return', () => {
    it('should route to returnLoan controller', async () => {
      const response = await request(app).post('/api/loans/10/return').send();

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Mocked return loan');
    });
  });

  describe('POST /api/loans/batch', () => {
    it('should route to borrowBooksBatch controller', async () => {
      const response = await request(app)
        .post('/api/loans/batch')
        .send({ bookIds: [1, 2] });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Mocked batch borrow');
    });
  });
});
