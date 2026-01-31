import express, { Router } from "express";
import {
  createAuthor,
  deleteAuthor,
  getAllAuthors,
  getAuthorById,
  updateAuthor,
} from "../../controllers/authorsController";
import { authenticate, isAdmin } from "../../middleware/auth";

const router: Router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin-Authors
 *   description: Admin author management API
 */

// Apply auth middleware to all routes
router.use(authenticate);
router.use(isAdmin);

/**
 * @swagger
 * /api/admin/authors:
 *   get:
 *     summary: Get all authors (Admin only)
 *     tags: [Admin-Authors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: The page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of authors per page
 *     responses:
 *       200:
 *         description: The list of authors
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Author'
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin
 *       500:
 *         description: Server error
 */
router.get("/", getAllAuthors);

/**
 * @swagger
 * /api/admin/authors/{id}:
 *   get:
 *     summary: Get author by ID (Admin only)
 *     tags: [Admin-Authors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The author ID
 *     responses:
 *       200:
 *         description: Author details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Author'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin
 *       404:
 *         description: Author not found
 *       500:
 *         description: Server error
 */
router.get("/:id", getAuthorById);

/**
 * @swagger
 * /api/admin/authors:
 *   post:
 *     summary: Create a new author (Admin only)
 *     tags: [Admin-Authors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Author's full name
 *               biography:
 *                 type: string
 *                 description: Author biography
 *               birthDate:
 *                 type: string
 *                 format: date
 *                 description: Author's birth date
 *               nationality:
 *                 type: string
 *                 description: Author's nationality
 *               photoUrl:
 *                 type: string
 *                 description: URL to author's photo
 *     responses:
 *       201:
 *         description: Author created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Author'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin
 *       500:
 *         description: Server error
 */
router.post("/", createAuthor);

/**
 * @swagger
 * /api/admin/authors/{id}:
 *   put:
 *     summary: Update an author (Admin only)
 *     tags: [Admin-Authors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The author ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Author's full name
 *               biography:
 *                 type: string
 *                 description: Author biography
 *               birthDate:
 *                 type: string
 *                 format: date
 *                 description: Author's birth date
 *               nationality:
 *                 type: string
 *                 description: Author's nationality
 *               photoUrl:
 *                 type: string
 *                 description: URL to author's photo
 *     responses:
 *       200:
 *         description: Author updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Author'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin
 *       404:
 *         description: Author not found
 *       500:
 *         description: Server error
 */
router.put("/:id", updateAuthor);

/**
 * @swagger
 * /api/admin/authors/{id}:
 *   delete:
 *     summary: Delete an author (Admin only)
 *     tags: [Admin-Authors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The author ID
 *     responses:
 *       200:
 *         description: Author deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin
 *       404:
 *         description: Author not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", deleteAuthor);

export default router;
