import express, { Router } from "express";
import {
  deleteReview,
  getBookReviews,
  updateReview,
} from "../../controllers/reviewsController";
import { connectDatabase } from "../../db/database";
import { authenticate, isAdmin } from "../../middleware/auth";

const router: Router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin-Reviews
 *   description: Admin review management API
 */

// Apply auth middleware to all routes
router.use(authenticate, isAdmin);

/**
 * @swagger
 * /api/admin/reviews:
 *   get:
 *     summary: Get all reviews (Admin only)
 *     tags: [Admin-Reviews]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all reviews
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 allOf:
 *                   - $ref: '#/components/schemas/Review'
 *                   - type: object
 *                     properties:
 *                       user_name:
 *                         type: string
 *                         description: Name of the user who created the review
 *                       book_title:
 *                         type: string
 *                         description: Title of the book being reviewed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin
 *       500:
 *         description: Server error
 */
// Get all reviews (admin only)
router.get("/", async (req, res) => {
  try {
    const db = await connectDatabase();
    const reviews = await db.all(
      `SELECT r.*, u.name as user_name, b.title as book_title
       FROM reviews r
       LEFT JOIN users u ON r.userId = u.id
       LEFT JOIN books b ON r.bookId = b.id
       ORDER BY r.createdAt DESC`
    );
    res.status(200).json(reviews);
  } catch (error: Error | unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Error fetching all reviews:", errorMessage);
    res.status(500).json({ message: "Server error", error: errorMessage });
  }
});

/**
 * @swagger
 * /api/admin/reviews/book/{bookId}:
 *   get:
 *     summary: Get all reviews for a specific book (Admin only)
 *     tags: [Admin-Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The book ID
 *     responses:
 *       200:
 *         description: List of reviews for the book
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Review'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin
 *       404:
 *         description: Book not found
 *       500:
 *         description: Server error
 */
router.get("/book/:bookId", getBookReviews);

/**
 * @swagger
 * /api/admin/reviews/{reviewId}:
 *   put:
 *     summary: Update a review (Admin only)
 *     tags: [Admin-Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The review ID
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
 *         description: Review updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Review'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin
 *       404:
 *         description: Review not found
 *       500:
 *         description: Server error
 */
router.put("/:reviewId", updateReview);

/**
 * @swagger
 * /api/admin/reviews/{reviewId}:
 *   delete:
 *     summary: Delete a review (Admin only)
 *     tags: [Admin-Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The review ID
 *     responses:
 *       200:
 *         description: Review deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin
 *       404:
 *         description: Review not found
 *       500:
 *         description: Server error
 */
router.delete("/:reviewId", deleteReview);

export default router;
