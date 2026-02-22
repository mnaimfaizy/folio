import express, { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  createBookRequest,
  getMyBookRequests,
} from '../controllers/requestsController';

/**
 * @swagger
 * tags:
 *   name: Book Requests
 *   description: User-submitted requests for unavailable books
 */

const router: Router = express.Router();

router.use(authenticate);

/**
 * @swagger
 * /requests/me:
 *   get:
 *     summary: Get current user's book requests
 *     tags: [Book Requests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User requests retrieved successfully
 *       401:
 *         description: Authentication required
 */
router.get('/me', getMyBookRequests as express.RequestHandler);

/**
 * @swagger
 * /requests:
 *   post:
 *     summary: Create a book request
 *     tags: [Book Requests]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               author:
 *                 type: string
 *               isbn:
 *                 type: string
 *               note:
 *                 type: string
 *             description: Provide either ISBN, or both title and author.
 *     responses:
 *       201:
 *         description: Request created
 *       400:
 *         description: Missing ISBN or title+author
 *       401:
 *         description: Authentication required
 *       409:
 *         description: Duplicate open request for same normalized key
 */
router.post('/', createBookRequest as express.RequestHandler);

export default router;
