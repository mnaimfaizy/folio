import express, { Router } from 'express';
import {
  adminCreateLoan,
  adminDeleteLoan,
  adminMarkLoanReturned,
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
 * /admin/loans:
 *   post:
 *     summary: Create an active loan on behalf of a user (admin)
 *     tags: [Admin Loans]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - bookId
 *               - dueDate
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: ID of the user to loan the book to
 *               bookId:
 *                 type: integer
 *                 description: ID of the book to loan
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 description: ISO date-time the loan is due
 *     responses:
 *       201:
 *         description: Loan created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 loanId:
 *                   type: integer
 *       400:
 *         description: Missing or invalid parameters
 *       404:
 *         description: User or book not found
 *       409:
 *         description: No available copies, concurrent loan limit reached, or loan already exists
 */
router.post('/', adminCreateLoan as express.RequestHandler);

/**
 * @swagger
 * /admin/loans/{loanId}:
 *   delete:
 *     summary: Delete a loan record (admin)
 *     description: Permanently removes the loan. Restores available_copies if the book was checked out (ACTIVE or OVERDUE).
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
 *         description: Loan deleted successfully
 *       400:
 *         description: Invalid loan id
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Loan not found
 */
router.delete('/:loanId', adminDeleteLoan as express.RequestHandler);

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
 * /admin/loans/{loanId}/return:
 *   post:
 *     summary: Mark an active or overdue loan as returned (admin)
 *     description: Marks the loan as RETURNED, restores available_copies, and sends a confirmation email to the borrower.
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
 *               returnDate:
 *                 type: string
 *                 format: date-time
 *                 description: ISO date-time of the return. Defaults to now if omitted.
 *     responses:
 *       200:
 *         description: Loan marked as returned and user notified
 *       400:
 *         description: Invalid loan id or returnDate
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Loan not found
 *       409:
 *         description: Loan is not in a returnable state
 */
router.post('/:loanId/return', adminMarkLoanReturned as express.RequestHandler);

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
