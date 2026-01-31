import express, { Router } from "express";
import {
  addToUserCollection,
  createBookByIsbn,
  createBookManually,
  deleteBook,
  getAllBooks,
  getBookById,
  getUserCollection,
  removeFromUserCollection,
  searchBooks,
  searchOpenLibrary,
  updateBook,
} from "../controllers/booksController";
import { authenticate, isAdmin } from "../middleware/auth";

const router: Router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Book:
 *       type: object
 *       required:
 *         - title
 *         - author
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the book
 *         title:
 *           type: string
 *           description: The title of the book
 *         author:
 *           type: string
 *           description: The book author
 *         isbn:
 *           type: string
 *           description: ISBN of the book
 *         publicationYear:
 *           type: integer
 *           description: Year the book was published
 *         genre:
 *           type: string
 *           description: Genre of the book
 *         description:
 *           type: string
 *           description: Brief description of the book
 *         coverImage:
 *           type: string
 *           description: URL to the book cover image
 *         createdAt:
 *           type: string
 *           format: date
 *           description: Date the book was added
 *         updatedAt:
 *           type: string
 *           format: date
 *           description: Date the book was last updated
 *       example:
 *         id: 1
 *         title: The Great Gatsby
 *         author: F. Scott Fitzgerald
 *         isbn: 9780743273565
 *         publicationYear: 1925
 *         genre: Fiction
 *         description: A novel about the American Dream
 *         coverImage: https://example.com/gatsby.jpg
 *         createdAt: 2023-01-01T00:00:00.000Z
 *         updatedAt: 2023-01-01T00:00:00.000Z
 */

/**
 * @swagger
 * tags:
 *   name: Books
 *   description: The books managing API
 */

// ---------- Static routes - these should be defined BEFORE dynamic routes like /:id ----------

/**
 * @swagger
 * /api/books:
 *   get:
 *     summary: Returns the list of all books
 *     tags: [Books]
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
 *         description: Number of books per page
 *     responses:
 *       200:
 *         description: The list of the books
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Book'
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *       500:
 *         description: Server error
 */
router.get("/", getAllBooks as express.RequestHandler);

/**
 * @swagger
 * /api/books:
 *   post:
 *     summary: Create a new book manually
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - author
 *             properties:
 *               title:
 *                 type: string
 *               author:
 *                 type: string
 *               isbn:
 *                 type: string
 *               publicationYear:
 *                 type: integer
 *               genre:
 *                 type: string
 *               description:
 *                 type: string
 *               coverImage:
 *                 type: string
 *     responses:
 *       201:
 *         description: The book was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/", authenticate, createBookManually as express.RequestHandler);

/**
 * @swagger
 * /api/books/isbn:
 *   post:
 *     summary: Create a book from ISBN
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isbn
 *             properties:
 *               isbn:
 *                 type: string
 *                 description: ISBN of the book to add
 *     responses:
 *       201:
 *         description: The book was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       400:
 *         description: Invalid ISBN
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/isbn", authenticate, createBookByIsbn as express.RequestHandler);

/**
 * @swagger
 * /api/books/search/open-library:
 *   get:
 *     summary: Search for books in OpenLibrary
 *     tags: [Books]
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Maximum number of results
 *     responses:
 *       200:
 *         description: Search results from OpenLibrary
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Server error
 */
router.get("/search/open-library", searchOpenLibrary as express.RequestHandler);

/**
 * @swagger
 * /api/books/search:
 *   get:
 *     summary: Search for books by query
 *     tags: [Books]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 books:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Book'
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Server error
 */
router.get("/search", searchBooks as express.RequestHandler);

/**
 * @swagger
 * /api/books/collection:
 *   get:
 *     summary: Get the current user's book collection
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The user's book collection
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get(
  "/collection",
  authenticate,
  getUserCollection as express.RequestHandler
);

/**
 * @swagger
 * /api/books/collection:
 *   post:
 *     summary: Add a book to user's collection
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bookId
 *             properties:
 *               bookId:
 *                 type: integer
 *                 description: ID of the book to add to collection
 *     responses:
 *       201:
 *         description: Book added to collection successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Book not found
 *       500:
 *         description: Server error
 */
router.post(
  "/collection",
  authenticate,
  addToUserCollection as express.RequestHandler
);

/**
 * @swagger
 * /api/books/collection/{bookId}:
 *   delete:
 *     summary: Remove a book from user's collection
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The book id to remove
 *     responses:
 *       200:
 *         description: Book removed from collection successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Book not found in collection
 *       500:
 *         description: Server error
 */
router.delete(
  "/collection/:bookId",
  authenticate,
  removeFromUserCollection as express.RequestHandler
);

// Keep the existing user/collection routes for backward compatibility
router.get(
  "/user/collection",
  authenticate,
  getUserCollection as express.RequestHandler
);

router.post(
  "/user/collection",
  authenticate,
  addToUserCollection as express.RequestHandler
);

router.delete(
  "/user/collection/:bookId",
  authenticate,
  removeFromUserCollection as express.RequestHandler
);

// ---------- Dynamic routes - these should be defined AFTER static routes ----------

/**
 * @swagger
 * /api/books/{id}:
 *   get:
 *     summary: Get a book by id
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The book id
 *     responses:
 *       200:
 *         description: The book description by id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       404:
 *         description: The book was not found
 *       500:
 *         description: Server error
 */
router.get("/:id", getBookById as express.RequestHandler);

/**
 * @swagger
 * /api/books/{id}:
 *   put:
 *     summary: Update a book by id
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *             properties:
 *               title:
 *                 type: string
 *               author:
 *                 type: string
 *               isbn:
 *                 type: string
 *               publicationYear:
 *                 type: integer
 *               genre:
 *                 type: string
 *               description:
 *                 type: string
 *               coverImage:
 *                 type: string
 *     responses:
 *       200:
 *         description: The book was updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: The book was not found
 *       500:
 *         description: Server error
 */
router.put("/:id", authenticate, updateBook as express.RequestHandler);

/**
 * @swagger
 * /api/books/{id}:
 *   delete:
 *     summary: Delete a book
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The book id
 *     responses:
 *       200:
 *         description: The book was deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: The book was not found
 *       500:
 *         description: Server error
 */
router.delete(
  "/:id",
  authenticate,
  isAdmin,
  deleteBook as express.RequestHandler
);

export default router;
