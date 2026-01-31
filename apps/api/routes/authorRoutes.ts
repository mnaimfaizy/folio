import express, { Router } from "express";
import {
  addBookToAuthor,
  createAuthor,
  deleteAuthor,
  getAllAuthors,
  getAuthorById,
  getAuthorByName,
  getAuthorInfo,
  removeBookFromAuthor,
  updateAuthor,
} from "../controllers/authorsController";
import { authenticate } from "../middleware/auth";

const router: Router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Author:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the author
 *         name:
 *           type: string
 *           description: The author's full name
 *         biography:
 *           type: string
 *           description: Author biography
 *         birthDate:
 *           type: string
 *           format: date
 *           description: Author's date of birth
 *         nationality:
 *           type: string
 *           description: Author's nationality
 *         photoUrl:
 *           type: string
 *           description: URL to author's photo
 *         createdAt:
 *           type: string
 *           format: date
 *           description: Date the author was added
 *         updatedAt:
 *           type: string
 *           format: date
 *           description: Date the author was last updated
 *       example:
 *         id: 1
 *         name: Ernest Hemingway
 *         biography: American novelist, short-story writer, and journalist
 *         birthDate: 1899-07-21
 *         nationality: American
 *         photoUrl: https://example.com/hemingway.jpg
 *         createdAt: 2023-01-01T00:00:00.000Z
 *         updatedAt: 2023-01-01T00:00:00.000Z
 */

/**
 * @swagger
 * tags:
 *   name: Authors
 *   description: Author management API
 */

/**
 * @swagger
 * /api/authors:
 *   get:
 *     summary: Returns the list of all authors
 *     tags: [Authors]
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
 *       500:
 *         description: Server error
 */
router.get("/", getAllAuthors as express.RequestHandler);

/**
 * @swagger
 * /api/authors/id/{id}:
 *   get:
 *     summary: Get an author by ID
 *     tags: [Authors]
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
 *       404:
 *         description: Author not found
 *       500:
 *         description: Server error
 */
router.get("/id/:id", getAuthorById as express.RequestHandler);

/**
 * @swagger
 * /api/authors/name/{name}:
 *   get:
 *     summary: Get an author by name
 *     tags: [Authors]
 *     parameters:
 *       - in: path
 *         name: name
 *         schema:
 *           type: string
 *         required: true
 *         description: The author name
 *     responses:
 *       200:
 *         description: Author details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Author'
 *       404:
 *         description: Author not found
 *       500:
 *         description: Server error
 */
router.get("/name/:name", getAuthorByName as express.RequestHandler);

/**
 * @swagger
 * /api/authors/info:
 *   get:
 *     summary: Get author information from external API
 *     tags: [Authors]
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         required: true
 *         description: Author name to search for
 *     responses:
 *       200:
 *         description: Author information from external source
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Server error
 */
router.get("/info", getAuthorInfo as express.RequestHandler);

/**
 * @swagger
 * /api/authors:
 *   post:
 *     summary: Create a new author
 *     tags: [Authors]
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
 *               biography:
 *                 type: string
 *               birthDate:
 *                 type: string
 *                 format: date
 *               nationality:
 *                 type: string
 *               photoUrl:
 *                 type: string
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
 *       500:
 *         description: Server error
 */
router.post("/", authenticate, createAuthor as express.RequestHandler);

/**
 * @swagger
 * /api/authors/{id}:
 *   put:
 *     summary: Update an author
 *     tags: [Authors]
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
 *               biography:
 *                 type: string
 *               birthDate:
 *                 type: string
 *                 format: date
 *               nationality:
 *                 type: string
 *               photoUrl:
 *                 type: string
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
 *       404:
 *         description: Author not found
 *       500:
 *         description: Server error
 */
router.put("/:id", authenticate, updateAuthor as express.RequestHandler);

/**
 * @swagger
 * /api/authors/{id}:
 *   delete:
 *     summary: Delete an author
 *     tags: [Authors]
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
 *       404:
 *         description: Author not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", authenticate, deleteAuthor as express.RequestHandler);

/**
 * @swagger
 * /api/authors/book:
 *   post:
 *     summary: Add a book to an author
 *     tags: [Authors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - authorId
 *               - bookId
 *             properties:
 *               authorId:
 *                 type: integer
 *                 description: Author ID
 *               bookId:
 *                 type: integer
 *                 description: Book ID
 *     responses:
 *       200:
 *         description: Book added to author successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Author or book not found
 *       500:
 *         description: Server error
 */
router.post("/book", authenticate, addBookToAuthor as express.RequestHandler);

/**
 * @swagger
 * /api/authors/{authorId}/book/{bookId}:
 *   delete:
 *     summary: Remove a book from an author
 *     tags: [Authors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: authorId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The author ID
 *       - in: path
 *         name: bookId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The book ID
 *     responses:
 *       200:
 *         description: Book removed from author successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Author, book or association not found
 *       500:
 *         description: Server error
 */
router.delete(
  "/:authorId/book/:bookId",
  authenticate,
  removeBookFromAuthor as express.RequestHandler
);

export default router;
