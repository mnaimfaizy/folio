import express, { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  borrowBook,
  getMyLoans,
  returnLoan,
} from '../controllers/loansController';

/**
 * @swagger
 * tags:
 *   name: Loans
 *   description: Borrowing lifecycle for authenticated users
 */

const router: Router = express.Router();

router.use(authenticate);

/**
 * @swagger
 * /loans/me:
 *   get:
 *     summary: Get current user's loan history
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User loans retrieved successfully
 *       401:
 *         description: Authentication required
 */
router.get('/me', getMyLoans as express.RequestHandler);

/**
 * @swagger
 * /loans:
 *   post:
 *     summary: Request a book loan (manual admin approval)
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [bookId]
 *             properties:
 *               bookId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Loan request submitted
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Loan system disabled by admin
 *       404:
 *         description: Book not found
 *       409:
 *         description: Borrowing rule conflict
 */
router.post('/', borrowBook as express.RequestHandler);

/**
 * @swagger
 * /loans/{loanId}/return:
 *   post:
 *     summary: Return an active loan
 *     tags: [Loans]
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
 *         description: Loan returned successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Loan not found
 *       409:
 *         description: Loan state conflict
 */
router.post('/:loanId/return', returnLoan as express.RequestHandler);

export default router;
