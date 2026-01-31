import express, { Request, Response, Router } from "express";
import {
  createBookByIsbn,
  createBookManually,
  deleteBook,
  getAllBooks,
  getBookById,
  updateBook,
} from "../../controllers/booksController";
import { authenticate, isAdmin } from "../../middleware/auth";

// Define UserRequest interface to match the one in booksController.ts
interface UserRequest extends Request {
  user?: {
    id: number;
    isAdmin?: boolean;
  };
}

const router: Router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin-Books
 *   description: Admin book management API
 */

// Apply auth middleware to all routes
router.use(authenticate);
router.use(isAdmin);

/**
 * @swagger
 * /api/admin/books:
 *   get:
 *     summary: Get all books (Admin only)
 *     tags: [Admin-Books]
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
 *         description: Number of books per page
 *     responses:
 *       200:
 *         description: The list of books
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
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin
 *       500:
 *         description: Server error
 */
router.get("/", getAllBooks);

/**
 * @swagger
 * /api/admin/books/{id}:
 *   get:
 *     summary: Get a book by ID (Admin only)
 *     tags: [Admin-Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The book ID
 *     responses:
 *       200:
 *         description: Book details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin
 *       404:
 *         description: Book not found
 *       500:
 *         description: Server error
 */
router.get("/:id", getBookById);

/**
 * @swagger
 * /api/admin/books:
 *   post:
 *     summary: Create a new book manually (Admin only)
 *     tags: [Admin-Books]
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
 *                 description: Book title
 *               author:
 *                 type: string
 *                 description: Book author name
 *               isbn:
 *                 type: string
 *                 description: Book ISBN
 *               publicationYear:
 *                 type: integer
 *                 description: Year the book was published
 *               genre:
 *                 type: string
 *                 description: Book genre
 *               description:
 *                 type: string
 *                 description: Book description
 *               coverImage:
 *                 type: string
 *                 description: URL to book cover image
 *     responses:
 *       201:
 *         description: Book created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin
 *       500:
 *         description: Server error
 */
router.post("/", (req: Request, res: Response) =>
  createBookManually(req as UserRequest, res)
);

/**
 * @swagger
 * /api/admin/books/isbn:
 *   post:
 *     summary: Create a book from ISBN (Admin only)
 *     tags: [Admin-Books]
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
 *         description: Book created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       400:
 *         description: Invalid ISBN
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin
 *       500:
 *         description: Server error
 */
router.post("/isbn", (req: Request, res: Response) =>
  createBookByIsbn(req as UserRequest, res)
);

/**
 * @swagger
 * /api/admin/books/{id}:
 *   put:
 *     summary: Update a book (Admin only)
 *     tags: [Admin-Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The book ID
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
 *         description: Book updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin
 *       404:
 *         description: Book not found
 *       500:
 *         description: Server error
 */
router.put("/:id", (req: Request, res: Response) =>
  updateBook(req as UserRequest, res)
);

/**
 * @swagger
 * /api/admin/books/{id}:
 *   delete:
 *     summary: Delete a book (Admin only)
 *     tags: [Admin-Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The book ID
 *     responses:
 *       200:
 *         description: Book deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin
 *       404:
 *         description: Book not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", deleteBook);

export default router;
