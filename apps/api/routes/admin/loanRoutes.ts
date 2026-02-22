import express, { Router } from 'express';
import {
  approveLoanRequest,
  getAllLoansForAdmin,
  markLoanAsLost,
  processLoanRemindersNow,
  rejectLoanRequest,
} from '../../controllers/loansController';
import { authenticate, isAdmin } from '../../middleware/auth';

/**
 * @swagger
 * tags:
 *   name: Admin Loans
 *   description: Admin tools for loan monitoring and loss/reminder actions
 */

const router: Router = express.Router();

router.use(authenticate);
router.use(isAdmin);

/**
 * @swagger
 * /admin/loans:
 *   get:
 *     summary: Get all loans (admin)
 *     tags: [Admin Loans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Optional status filter (PENDING, ACTIVE, OVERDUE, RETURNED, LOST, REJECTED)
 *     responses:
 *       200:
 *         description: Loans retrieved successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 */
router.get('/', getAllLoansForAdmin as express.RequestHandler);

/**
 * @swagger
 * /admin/loans/{loanId}/approve:
 *   post:
 *     summary: Approve a pending loan request
 *     tags: [Admin Loans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: loanId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Loan request approved
 *       404:
 *         description: Loan request not found
 *       409:
 *         description: Invalid state or no available inventory
 */
router.post('/:loanId/approve', approveLoanRequest as express.RequestHandler);

/**
 * @swagger
 * /admin/loans/{loanId}/reject:
 *   post:
 *     summary: Reject a pending loan request
 *     tags: [Admin Loans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: loanId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Loan request rejected
 *       404:
 *         description: Loan request not found
 *       409:
 *         description: Invalid loan state transition
 */
router.post('/:loanId/reject', rejectLoanRequest as express.RequestHandler);

/**
 * @swagger
 * /admin/loans/{loanId}/lost:
 *   post:
 *     summary: Mark a loan as lost
 *     tags: [Admin Loans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: loanId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               penaltyAmount:
 *                 type: number
 *               note:
 *                 type: string
 *     responses:
 *       200:
 *         description: Loan marked as lost
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Loan not found
 *       409:
 *         description: Invalid loan state transition
 */
router.post('/:loanId/lost', markLoanAsLost as express.RequestHandler);

/**
 * @swagger
 * /admin/loans/process-reminders:
 *   post:
 *     summary: Manually trigger loan reminder processing
 *     tags: [Admin Loans]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reminder processing finished
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 */
router.post(
  '/process-reminders',
  processLoanRemindersNow as express.RequestHandler,
);

export default router;
