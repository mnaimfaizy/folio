import express, { Router } from 'express';
import {
  autoFulfillRequestsByBook,
  getAllBookRequestsForAdmin,
  getBookRequestAnalytics,
  markRequestFulfilledManually,
} from '../../controllers/requestsController';
import { authenticate, isAdmin } from '../../middleware/auth';

/**
 * @swagger
 * tags:
 *   name: Admin Book Requests
 *   description: Admin reporting and fulfillment actions for book requests
 */

const router: Router = express.Router();

router.use(authenticate);
router.use(isAdmin);

/**
 * @swagger
 * /admin/requests:
 *   get:
 *     summary: Get all user book requests
 *     tags: [Admin Book Requests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Requests retrieved successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 */
router.get('/', getAllBookRequestsForAdmin as express.RequestHandler);

/**
 * @swagger
 * /admin/requests/analytics:
 *   get:
 *     summary: Get grouped request analytics for top requested books
 *     tags: [Admin Book Requests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics retrieved successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 */
router.get('/analytics', getBookRequestAnalytics as express.RequestHandler);

/**
 * @swagger
 * /admin/requests/{requestId}/fulfill:
 *   post:
 *     summary: Mark an open request fulfilled manually
 *     tags: [Admin Book Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
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
 *               bookId:
 *                 type: integer
 *               note:
 *                 type: string
 *     responses:
 *       200:
 *         description: Request marked as fulfilled manually
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Request not found
 *       409:
 *         description: Only OPEN requests can be fulfilled
 */
router.post(
  '/:requestId/fulfill',
  markRequestFulfilledManually as express.RequestHandler,
);

/**
 * @swagger
 * /admin/requests/fulfill-by-book/{bookId}:
 *   post:
 *     summary: Auto-fulfill matching open requests for a specific available book
 *     tags: [Admin Book Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Matching requests processed
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 *       400:
 *         description: Invalid book id
 */
router.post(
  '/fulfill-by-book/:bookId',
  autoFulfillRequestsByBook as express.RequestHandler,
);

export default router;
