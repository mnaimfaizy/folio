import express from "express";
import {
  createReview,
  deleteReview,
  getBookReviews,
  updateReview,
} from "../controllers/reviewsController";
import { authenticateOptional } from "../middleware/auth";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Review:
 *       type: object
 *       required:
 *         - bookId
 *         - rating
 *         - comment
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the review
 *         bookId:
 *           type: integer
 *           description: ID of the book being reviewed
 *         userId:
 *           type: integer
 *           description: ID of the user who created the review (null for anonymous)
 *         rating:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *           description: Rating from 1 to 5
 *         comment:
 *           type: string
 *           description: Review comment text
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date the review was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date the review was last updated
 *       example:
 *         id: 1
 *         bookId: 5
 *         userId: 3
 *         rating: 4
 *         comment: Really enjoyed this book, great character development!
 *         createdAt: 2023-01-15T14:30:00.000Z
 *         updatedAt: 2023-01-15T14:30:00.000Z
 */

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Book reviews API
 */

/**
 * @swagger
 * /api/books/{bookId}/reviews:
 *   get:
 *     summary: Get all reviews for a book
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: bookId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The book id
 *     responses:
 *       200:
 *         description: List of reviews for the book
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Review'
 *       404:
 *         description: Book not found
 *       500:
 *         description: Server error
 */
router.get("/books/:bookId/reviews", getBookReviews);

/**
 * @swagger
 * /api/books/{bookId}/reviews:
 *   post:
 *     summary: Create a new review for a book
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The book id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *               - comment
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Rating from 1 to 5
 *               comment:
 *                 type: string
 *                 description: Review comment text
 *     responses:
 *       201:
 *         description: The review was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Review'
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Book not found
 *       500:
 *         description: Server error
 */
router.post("/books/:bookId/reviews", authenticateOptional, createReview);

/**
 * @swagger
 * /api/reviews/{reviewId}:
 *   put:
 *     summary: Update a review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The review id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Rating from 1 to 5
 *               comment:
 *                 type: string
 *                 description: Review comment text
 *     responses:
 *       200:
 *         description: The review was updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Review'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authorized to update this review
 *       404:
 *         description: Review not found
 *       500:
 *         description: Server error
 */
router.put("/reviews/:reviewId", authenticateOptional, updateReview);

/**
 * @swagger
 * /api/reviews/{reviewId}:
 *   delete:
 *     summary: Delete a review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The review id
 *     responses:
 *       200:
 *         description: The review was deleted
 *       401:
 *         description: Not authorized to delete this review
 *       404:
 *         description: Review not found
 *       500:
 *         description: Server error
 */
router.delete("/reviews/:reviewId", authenticateOptional, deleteReview);

export default router;
