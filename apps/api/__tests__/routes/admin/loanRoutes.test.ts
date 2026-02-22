import express from 'express';
import request from 'supertest';
import * as loansController from '../../../controllers/loansController';
import { authenticate, isAdmin } from '../../../middleware/auth';
import loanRoutes from '../../../routes/admin/loanRoutes';

jest.mock('../../../middleware/auth', () => ({
  authenticate: jest.fn((req, res, next) => {
    req.user = { id: 1, isAdmin: true };
    next();
  }),
  isAdmin: jest.fn((req, res, next) => next()),
}));

jest.mock('../../../controllers/loansController');

describe('Admin Loan Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/admin/loans', loanRoutes);

    jest.clearAllMocks();

    (loansController.getAllLoansForAdmin as jest.Mock).mockImplementation(
      (req, res) => {
        res.status(200).json({ loans: [] });
      },
    );

    (loansController.markLoanAsLost as jest.Mock).mockImplementation(
      (req, res) => {
        res.status(200).json({ message: 'Loan marked as lost' });
      },
    );

    (loansController.approveLoanRequest as jest.Mock).mockImplementation(
      (req, res) => {
        res.status(200).json({ message: 'Loan request approved successfully' });
      },
    );

    (loansController.rejectLoanRequest as jest.Mock).mockImplementation(
      (req, res) => {
        res.status(200).json({ message: 'Loan request rejected successfully' });
      },
    );

    (loansController.processLoanRemindersNow as jest.Mock).mockImplementation(
      (req, res) => {
        res.status(200).json({ message: 'Loan reminders processed' });
      },
    );
  });

  it('GET /api/admin/loans routes correctly', async () => {
    const response = await request(app).get('/api/admin/loans');

    expect(response.status).toBe(200);
    expect(authenticate).toHaveBeenCalled();
    expect(isAdmin).toHaveBeenCalled();
    expect(loansController.getAllLoansForAdmin).toHaveBeenCalled();
  });

  it('POST /api/admin/loans/:loanId/lost routes correctly', async () => {
    const response = await request(app)
      .post('/api/admin/loans/11/lost')
      .send({ penaltyAmount: 10, note: 'Damaged and not recoverable' });

    expect(response.status).toBe(200);
    expect(loansController.markLoanAsLost).toHaveBeenCalled();
  });

  it('POST /api/admin/loans/:loanId/approve routes correctly', async () => {
    const response = await request(app)
      .post('/api/admin/loans/11/approve')
      .send();

    expect(response.status).toBe(200);
    expect(loansController.approveLoanRequest).toHaveBeenCalled();
  });

  it('POST /api/admin/loans/:loanId/reject routes correctly', async () => {
    const response = await request(app)
      .post('/api/admin/loans/11/reject')
      .send({ reason: 'No available inventory' });

    expect(response.status).toBe(200);
    expect(loansController.rejectLoanRequest).toHaveBeenCalled();
  });

  it('POST /api/admin/loans/process-reminders routes correctly', async () => {
    const response = await request(app)
      .post('/api/admin/loans/process-reminders')
      .send();

    expect(response.status).toBe(200);
    expect(loansController.processLoanRemindersNow).toHaveBeenCalled();
  });
});
