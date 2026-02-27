import express from 'express';
import request from 'supertest';
import adminLoanRoutes from '../../routes/admin/loanRoutes';

jest.mock('../../controllers/loansController', () => ({
  getAllLoansForAdmin: jest.fn((req, res) =>
    res.status(200).json({ loans: [], message: 'Mocked get all loans' }),
  ),
  adminCreateLoan: jest.fn((req, res) =>
    res.status(201).json({ message: 'Loan created successfully', loanId: 42 }),
  ),
  approveLoanRequest: jest.fn((req, res) =>
    res.status(200).json({ message: 'Mocked approve loan' }),
  ),
  rejectLoanRequest: jest.fn((req, res) =>
    res.status(200).json({ message: 'Mocked reject loan' }),
  ),
  markLoanAsLost: jest.fn((req, res) =>
    res.status(200).json({ message: 'Mocked mark lost' }),
  ),
  processLoanRemindersNow: jest.fn((req, res) =>
    res.status(200).json({ message: 'Mocked process reminders' }),
  ),
}));

jest.mock('../../middleware/auth', () => ({
  authenticate: jest.fn((req, res, next) => {
    req.user = { id: 99, email: 'admin@example.com', role: 'admin' };
    next();
  }),
  isAdmin: jest.fn((req, res, next) => next()),
}));

describe('Admin Loan Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/admin/loans', adminLoanRoutes);
  });

  describe('GET /api/admin/loans', () => {
    it('should route to getAllLoansForAdmin controller', async () => {
      const response = await request(app).get('/api/admin/loans').send();

      expect(response.status).toBe(200);
      expect(response.body.loans).toBeDefined();
    });
  });

  describe('POST /api/admin/loans', () => {
    it('should route to adminCreateLoan controller and return 201', async () => {
      const payload = {
        userId: 5,
        bookId: 3,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const response = await request(app)
        .post('/api/admin/loans')
        .send(payload);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Loan created successfully');
      expect(response.body.loanId).toBe(42);
    });

    it('should call adminCreateLoan with the request body', async () => {
      const { adminCreateLoan } = jest.requireMock(
        '../../controllers/loansController',
      );
      adminCreateLoan.mockClear();

      const payload = {
        userId: 5,
        bookId: 3,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };

      await request(app).post('/api/admin/loans').send(payload);

      expect(adminCreateLoan).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST /api/admin/loans/:loanId/approve', () => {
    it('should route to approveLoanRequest controller', async () => {
      const response = await request(app)
        .post('/api/admin/loans/1/approve')
        .send();

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Mocked approve loan');
    });
  });

  describe('POST /api/admin/loans/:loanId/reject', () => {
    it('should route to rejectLoanRequest controller', async () => {
      const response = await request(app)
        .post('/api/admin/loans/1/reject')
        .send({ reason: 'Book not available' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Mocked reject loan');
    });
  });

  describe('POST /api/admin/loans/:loanId/lost', () => {
    it('should route to markLoanAsLost controller', async () => {
      const response = await request(app)
        .post('/api/admin/loans/1/lost')
        .send();

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Mocked mark lost');
    });
  });

  describe('POST /api/admin/loans/process-reminders', () => {
    it('should route to processLoanRemindersNow controller', async () => {
      const response = await request(app)
        .post('/api/admin/loans/process-reminders')
        .send();

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Mocked process reminders');
    });
  });
});
