import express, { Request, Response, Router } from 'express';
import {
  createBookByIsbn,
  createBookManually,
  deleteBook,
  getAllBooks,
  getBookById,
  updateBook,
} from '../../controllers/booksController';
import { searchExternalBooksHandler } from '../../controllers/externalBooksController';
import { connectDatabase } from '../../db/database';
import { authenticate, isAdmin } from '../../middleware/auth';
import { UTApi } from 'uploadthing/server';

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
 * /api/admin/books/external/search:
 *   get:
 *     summary: Search external book providers (Admin only)
 *     tags: [Admin-Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: source
 *         required: true
 *         schema:
 *           type: string
 *           enum: [openlibrary, googlebooks, isbndb, loc, wikidata, worldcat]
 *         description: External provider source
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [title, author, isbn]
 *         description: Search type
 *     responses:
 *       200:
 *         description: External provider search results
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin
 *       500:
 *         description: Server error
 */
router.get('/external/search', searchExternalBooksHandler);

/**
 * @swagger
 * /api/admin/books/genres:
 *   get:
 *     summary: Get unique book genres (Admin only)
 *     tags: [Admin-Books]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unique genres
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 genres:
 *                   type: array
 *                   items:
 *                     type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin
 *       500:
 *         description: Server error
 */
router.get('/genres', async (_req: Request, res: Response) => {
  try {
    const db = await connectDatabase();
    const rows = await db.all<{ genre: string | null }>(
      `SELECT DISTINCT genre
       FROM books
       WHERE genre IS NOT NULL AND TRIM(genre) <> ''
       ORDER BY genre`,
    );

    const seen = new Set<string>();
    const genres: string[] = [];

    for (const row of rows) {
      const value = typeof row.genre === 'string' ? row.genre.trim() : '';
      if (!value) continue;
      const key = value.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      genres.push(value);
    }

    res.status(200).json({ genres });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching genres:', errorMessage);
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
});

/**
 * @swagger
 * /api/admin/books/cover:
 *   delete:
 *     summary: Delete an uploaded book cover file (Admin only)
 *     tags: [Admin-Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: UploadThing file key
 *     responses:
 *       204:
 *         description: Deleted
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin
 *       500:
 *         description: Server error
 */
router.delete('/cover', async (req: Request, res: Response) => {
  const keyParam = req.query.key;
  const key = typeof keyParam === 'string' ? keyParam.trim() : '';

  if (!key) {
    res.status(400).json({ message: 'Missing cover key' });
    return;
  }

  try {
    const utapi = new UTApi();
    await utapi.deleteFiles(key);
    res.status(204).send();
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Error deleting cover upload:', errorMessage);
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
});

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
router.get('/', getAllBooks);

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
router.get('/:id', getBookById);

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
 *               cover:
 *                 type: string
 *                 description: UploadThing URL for the book cover image
 *               coverKey:
 *                 type: string
 *                 description: UploadThing file key for the book cover image
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
router.post('/', (req: Request, res: Response) =>
  createBookManually(req as UserRequest, res),
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
router.post('/isbn', (req: Request, res: Response) =>
  createBookByIsbn(req as UserRequest, res),
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
 *               cover:
 *                 type: string
 *                 description: UploadThing URL for the book cover image
 *               coverKey:
 *                 type: string
 *                 description: UploadThing file key for the book cover image
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
router.put('/:id', (req: Request, res: Response) =>
  updateBook(req as UserRequest, res),
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
router.delete('/:id', deleteBook);

export default router;
