import axios from 'axios';
import { Request, Response } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { UTApi } from 'uploadthing/server';
import { connectDatabase } from '../db/database';
import type { DbClient } from '../db/types';
import { User } from '../models/User';

// Define interface for Request with user property
interface UserRequest extends Request {
  user?:
    | {
        id: number;
        isAdmin?: boolean;
      }
    | JwtPayload;
}

// OpenLibrary API interfaces
interface OpenLibraryAuthor {
  name: string;
  url?: string;
}

interface OpenLibraryBookData {
  title?: string;
  authors?: OpenLibraryAuthor[];
  publish_date?: string;
  cover?: {
    small?: string;
    medium?: string;
    large?: string;
  };
  description?: string | { value: string };
  publishers?: string[];
  subjects?: Array<string | { name: string }>;
  url?: string;
}

interface OpenLibrarySearchResult {
  title?: string;
  author_name?: string[];
  first_publish_year?: number;
  isbn?: string[];
  cover_i?: number;
  key?: string;
  language?: string[];
  publisher?: string[];
}

interface OpenLibraryWork {
  title?: string;
  key?: string;
  covers?: number[];
  first_publish_year?: number;
  description?: string | { value: string };
}

// Rate limiting implementation
const rateLimitWindow = 60 * 1000; // 1 minute window
const maxRequests = 5; // Max 5 requests per minute to be respectful
let requestTimestamps: number[] = [];

// For unit testing, make it easier to mock
export const rateLimiter = {
  isLimited: (): boolean => {
    const now = Date.now();
    // Clean up old timestamps
    requestTimestamps = requestTimestamps.filter(
      (timestamp) => now - timestamp < rateLimitWindow,
    );

    // Check if we've reached the rate limit
    if (requestTimestamps.length >= maxRequests) {
      return true;
    }

    // Log this request
    requestTimestamps.push(now);
    return false;
  },
};

/**
 * Simple rate limiter function
 * @returns Whether the request is allowed or not
 */
export function isRateLimited(): boolean {
  return rateLimiter.isLimited();
}

// User agent for OpenLibrary API requests
const USER_AGENT =
  'LibraryManagementSystem/1.0 (https://example.com; library@example.com)';

// Common headers for all OpenLibrary API requests
const commonHeaders = {
  'User-Agent': USER_AGENT,
  Accept: 'application/json',
};

/**
 * Get a user's ID safely from the request object
 * @param req The user request object
 * @returns The user ID or undefined if not available
 */
function getUserId(req: UserRequest): number | undefined {
  if (!req.user) return undefined;

  // Handle our custom UserRequest type
  if ('id' in req.user) {
    const id = req.user.id;
    if (typeof id === 'number') {
      return id;
    }
    if (typeof id === 'string') {
      const parsedId = parseInt(id, 10);
      return isNaN(parsedId) ? undefined : parsedId;
    }
  }

  // For tests that might use a simple object with id
  if (req.user && 'id' in (req.user as User)) {
    const id = (req.user as User).id;
    if (typeof id === 'number') return id;
    if (typeof id === 'string') {
      const parsedId = parseInt(id, 10);
      return isNaN(parsedId) ? undefined : parsedId;
    }
  }

  // Try to get id from JwtPayload if it exists
  if ('sub' in req.user && req.user.sub) {
    return parseInt(req.user.sub.toString(), 10);
  }

  return undefined;
}

async function resolveCanonicalGenre(
  db: DbClient,
  value: unknown,
): Promise<string | null> {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().replace(/\s+/g, ' ');
  if (!normalized) return null;

  try {
    const existing = await db.get<{ genre: string | null }>(
      'SELECT genre FROM books WHERE genre IS NOT NULL AND LOWER(TRIM(genre)) = LOWER(TRIM(?)) LIMIT 1',
      [normalized],
    );
    if (
      existing?.genre &&
      typeof existing.genre === 'string' &&
      existing.genre.trim()
    ) {
      return existing.genre.trim();
    }
  } catch {
    // Ignore lookup failures; fall back to normalized input.
  }

  return normalized;
}

/**
 * Get all books with their authors
 */
export const getAllBooks = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const db = await connectDatabase();

    // Get filter parameters from query
    const { genre, year, sortBy = 'title', sortOrder = 'asc' } = req.query;

    // Build the WHERE clause based on filters
    const conditions: string[] = [];
    const params: any[] = [];

    if (genre && typeof genre === 'string') {
      conditions.push('LOWER(genre) = LOWER(?)');
      params.push(genre);
    }

    if (year && typeof year === 'string') {
      const yearNum = parseInt(year, 10);
      if (!isNaN(yearNum)) {
        if (yearNum < 2000) {
          conditions.push('publishYear < 2000');
        } else {
          conditions.push('publishYear >= ?');
          params.push(yearNum);
        }
      }
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Build ORDER BY clause
    let orderByClause = 'ORDER BY title ASC';
    const validSortBy = ['title', 'author', 'publishYear'];
    const validSortOrder = ['asc', 'desc'];
    
    if (typeof sortBy === 'string' && validSortBy.includes(sortBy.toLowerCase())) {
      const column = sortBy;
      const order = typeof sortOrder === 'string' && validSortOrder.includes(sortOrder.toLowerCase()) 
        ? sortOrder.toUpperCase() 
        : 'ASC';
      orderByClause = `ORDER BY ${column} ${order}`;
    }

    // Get all books with filters
    const booksQuery = `SELECT * FROM books ${whereClause} ${orderByClause}`;
    const books =
      params.length > 0
        ? await db.all(booksQuery, params)
        : await db.all(booksQuery);

    // For each book, get its authors
    for (const book of books) {
      const authors = await db.all(
        `
        SELECT a.* 
        FROM authors a
        JOIN author_books ab ON a.id = ab.author_id
        WHERE ab.book_id = ?
        ORDER BY ab.is_primary DESC, a.name
      `,
        [book.id],
      );

      book.authors = authors;
    }

    res.status(200).json({ books });
  } catch (error: Error | unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching books:', errorMessage);
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
};

/**
 * Get featured books for the landing page
 */
export const getFeaturedBooks = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const db = await connectDatabase();

    const books = await db.all(
      'SELECT * FROM books WHERE featured = true ORDER BY updated_at DESC',
    );

    // For each book, get its authors
    for (const book of books) {
      const authors = await db.all(
        `
        SELECT a.*
        FROM authors a
        JOIN author_books ab ON a.id = ab.author_id
        WHERE ab.book_id = ?
        ORDER BY ab.is_primary DESC, a.name
      `,
        [book.id],
      );

      book.authors = authors;
    }

    res.status(200).json({ books });
  } catch (error: Error | unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching featured books:', errorMessage);
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
};

/**
 * Toggle the featured status of a book (admin only)
 */
export const toggleFeaturedBook = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { featured } = req.body;

    if (typeof featured !== 'boolean') {
      res
        .status(400)
        .json({ message: 'featured field must be a boolean value' });
      return;
    }

    const db = await connectDatabase();

    const book = await db.get('SELECT * FROM books WHERE id = ?', [id]);
    if (!book) {
      res.status(404).json({ message: 'Book not found' });
      return;
    }

    await db.run(
      'UPDATE books SET featured = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [featured, id],
    );

    res.status(200).json({
      message: `Book ${featured ? 'marked as' : 'removed from'} featured`,
      book: { ...book, featured },
    });
  } catch (error: Error | unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Error toggling featured status:', errorMessage);
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
};

/**
 * Get a single book by ID with its authors
 */
export const getBookById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    const db = await connectDatabase();
    const book = await db.get('SELECT * FROM books WHERE id = ?', [id]);

    if (!book) {
      res.status(404).json({ message: 'Book not found' });
      return;
    }

    // Get the book's authors
    const authors = await db.all(
      `
      SELECT a.*, ab.is_primary 
      FROM authors a
      JOIN author_books ab ON a.id = ab.author_id
      WHERE ab.book_id = ?
      ORDER BY ab.is_primary DESC, a.name
    `,
      [id],
    );

    book.authors = authors;

    res.status(200).json({ book });
  } catch (error: Error | unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching book:', errorMessage);
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
};

/**
 * Create a book manually with provided details and optionally add to user collection
 */
export const createBookManually = async (
  req: UserRequest,
  res: Response,
): Promise<void> => {
  try {
    const {
      title,
      isbn,
      isbn10,
      isbn13,
      publishYear,
      pages,
      genre,
      author, // For backward compatibility
      cover,
      coverKey,
      description,
      authors, // New field for multiple authors
      addToCollection,
      featured,
    } = req.body;
    const userId = req.user?.id;

    // Validate input
    if (!title) {
      res.status(400).json({ message: 'Title is required' });
      return;
    }

    if (coverKey && !cover) {
      res
        .status(400)
        .json({ message: 'Cover URL is required when coverKey is provided' });
      return;
    }

    const db = await connectDatabase();
    const canonicalGenre = await resolveCanonicalGenre(db, genre);

    // Check if book already exists by ISBN
    let existingBook = null;
    const isbnCandidates = [isbn, isbn10, isbn13].filter(Boolean);
    if (isbnCandidates.length > 0) {
      const placeholders = isbnCandidates.map(() => '?').join(', ');
      existingBook = await db.get(
        `SELECT * FROM books WHERE isbn IN (${placeholders}) OR isbn10 IN (${placeholders}) OR isbn13 IN (${placeholders})`,
        [...isbnCandidates, ...isbnCandidates, ...isbnCandidates],
      );
      if (existingBook) {
        // If book exists and user wants to add to collection, add it directly
        if (userId) {
          await addBookToUserCollection(db, userId, existingBook.id);

          // Get the book authors for the response
          const bookAuthors = await db.all(
            `SELECT a.*, ab.is_primary 
             FROM authors a
             JOIN author_books ab ON a.id = ab.author_id
             WHERE ab.book_id = ?
             ORDER BY ab.is_primary DESC, a.name`,
            [existingBook.id],
          );

          existingBook.authors = bookAuthors;

          res.status(200).json({
            message:
              'Book already exists and has been added to your collection',
            book: existingBook,
          });
        } else {
          res.status(200).json({
            message: 'Book already exists',
            book: existingBook,
          });
        }
        return;
      }
    }

    // Start a transaction
    await db.run('BEGIN TRANSACTION');

    try {
      // Create new book
      const primaryIsbn = isbn13 || isbn10 || isbn || null;
      const result = await db.run(
        `INSERT INTO books (title, isbn, isbn10, isbn13, publishYear, pages, genre, author, cover, cover_key, description, featured) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          title,
          primaryIsbn,
          isbn10 || null,
          isbn13 || null,
          publishYear || null,
          typeof pages === 'number' ? pages : null,
          canonicalGenre,
          author || null, // Keep author field for backward compatibility
          cover || null,
          coverKey || null,
          description || null,
          typeof featured === 'boolean' ? featured : false,
        ],
      );

      const bookId = result.lastID;

      // Process authors
      if (authors && Array.isArray(authors) && authors.length > 0) {
        for (let i = 0; i < authors.length; i++) {
          const authorName = authors[i].name;

          if (!authorName) continue;

          // Check if author already exists
          let authorId;
          const existingAuthor = await db.get(
            'SELECT id FROM authors WHERE LOWER(name) = LOWER(?)',
            [authorName],
          );

          if (existingAuthor) {
            authorId = existingAuthor.id;
          } else {
            // Create new author
            const authorResult = await db.run(
              'INSERT INTO authors (name) VALUES (?)',
              [authorName],
            );
            authorId = authorResult.lastID;
          }

          // Create author-book relationship
          await db.run(
            'INSERT INTO author_books (author_id, book_id, is_primary) VALUES (?, ?, ?)',
            [authorId, bookId, i === 0 ? 1 : 0], // First author is primary
          );
        }
      }
      // If no authors array but author string is provided (backward compatibility)
      else if (author) {
        // Split author string in case it contains multiple names
        const authorNames = author
          .split(/,\s*/)
          .filter((name: string) => name.trim() !== '');

        for (let i = 0; i < authorNames.length; i++) {
          const authorName = authorNames[i].trim();

          // Check if author already exists
          let authorId;
          const existingAuthor = await db.get(
            'SELECT id FROM authors WHERE LOWER(name) = LOWER(?)',
            [authorName],
          );

          if (existingAuthor) {
            authorId = existingAuthor.id;
          } else {
            // Create new author
            const authorResult = await db.run(
              'INSERT INTO authors (name) VALUES (?)',
              [authorName],
            );
            authorId = authorResult.lastID;
          }

          // Create author-book relationship
          await db.run(
            'INSERT INTO author_books (author_id, book_id, is_primary) VALUES (?, ?, ?)',
            [authorId, bookId, i === 0 ? 1 : 0], // First author is primary
          );
        }
      }

      // Commit transaction
      await db.run('COMMIT');

      // Get the complete book with authors
      const newBook = await db.get('SELECT * FROM books WHERE id = ?', [
        bookId,
      ]);
      const bookAuthors = await db.all(
        `
        SELECT a.*, ab.is_primary 
        FROM authors a
        JOIN author_books ab ON a.id = ab.author_id
        WHERE ab.book_id = ?
        ORDER BY ab.is_primary DESC, a.name
      `,
        [bookId],
      );

      newBook.authors = bookAuthors;

      // Add to user collection if requested
      if (addToCollection && userId && bookId) {
        await addBookToUserCollection(db, userId, bookId);
        res.status(201).json({
          message: 'Book created successfully and added to your collection',
          book: newBook,
        });
      } else {
        res.status(201).json({
          message: 'Book created successfully',
          book: newBook,
        });
      }
    } catch (error) {
      // Rollback transaction on error
      await db.run('ROLLBACK');
      throw error;
    }
  } catch (error: Error | unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Error creating book:', errorMessage);
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
};

/**
 * Create a book using ISBN and Open Library API and optionally add to user collection
 */
export const createBookByIsbn = async (
  req: UserRequest,
  res: Response,
): Promise<void> => {
  try {
    const { isbn, addToCollection } = req.body;
    const userId = getUserId(req);

    if (!isbn) {
      res.status(400).json({ message: 'ISBN is required' });
      return;
    }

    // Apply rate limiting
    if (isRateLimited()) {
      res.status(429).json({
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: Math.ceil(rateLimitWindow / 1000),
      });
      return;
    }

    const db = await connectDatabase();

    // Check if book with ISBN already exists
    const existingBook = await db.get(
      'SELECT * FROM books WHERE isbn = ? OR isbn10 = ? OR isbn13 = ?',
      [isbn, isbn, isbn],
    );

    if (existingBook) {
      // If book exists and user wants to add to collection, add it directly
      if (addToCollection && userId) {
        await addBookToUserCollection(db, userId, existingBook.id);

        // Get the book's authors
        const bookAuthors = await db.all(
          `
          SELECT a.* 
          FROM authors a
          JOIN author_books ab ON a.id = ab.author_id
          WHERE ab.book_id = ?
        `,
          [existingBook.id],
        );

        existingBook.authors = bookAuthors;

        res.status(200).json({
          message: 'Book already exists',
          book: existingBook,
        });
      } else {
        res.status(200).json({
          message: 'Book already exists',
          book: existingBook,
        });
      }
      return;
    }

    try {
      // Fetch book details from Open Library API
      const response = await axios.get(
        `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`,
        {
          headers: commonHeaders,
        },
      );

      const bookKey = `ISBN:${isbn}`;
      if (!response.data[bookKey]) {
        res.status(404).json({ message: 'Book not found with this ISBN' });
        return;
      }

      const bookData = response.data[bookKey];

      // Extract relevant data
      const title = bookData.title || 'Unknown Title';
      const publishYear = bookData.publish_date
        ? parseInt(bookData.publish_date.slice(-4))
        : null;
      const pages =
        typeof (bookData as any).number_of_pages === 'number'
          ? (bookData as any).number_of_pages
          : null;
      const cover = bookData.cover?.medium || null;
      const description =
        bookData.description?.value || bookData.description || null;
      const genre = Array.isArray((bookData as any).subjects)
        ? ((bookData as any).subjects
            .map((subject: any) =>
              typeof subject === 'string'
                ? subject
                : subject && typeof subject.name === 'string'
                  ? subject.name
                  : null,
            )
            .find((value: string | null) =>
              typeof value === 'string' && value.trim() ? true : false,
            ) as string | undefined)
        : undefined;

      const canonicalGenre = await resolveCanonicalGenre(db, genre);

      const identifierData = (bookData as any).identifiers || {};
      const isbn10 = Array.isArray(identifierData.isbn_10)
        ? identifierData.isbn_10[0]
        : (bookData as any).isbn_10?.[0] || null;
      const isbn13 = Array.isArray(identifierData.isbn_13)
        ? identifierData.isbn_13[0]
        : (bookData as any).isbn_13?.[0] || null;
      const primaryIsbn = isbn13 || isbn10 || isbn;

      // Extract authors data
      const authors = bookData.authors
        ? bookData.authors.map((author: OpenLibraryAuthor) => ({
            name: author.name,
            url: author.url,
          }))
        : [{ name: 'Unknown Author' }];

      // Convert authors to string for backward compatibility
      const authorString = authors
        .map((a: { name: string }) => a.name)
        .join(', ');

      // Start a transaction
      await db.run('BEGIN TRANSACTION');

      try {
        // Create book in database
        const result = await db.run(
          `INSERT INTO books (title, isbn, isbn10, isbn13, publishYear, pages, genre, author, cover, cover_key, description) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            title,
            primaryIsbn,
            isbn10,
            isbn13,
            publishYear,
            pages,
            canonicalGenre,
            authorString,
            cover,
            null,
            description,
          ],
        );

        const bookId = result.lastID;

        // Process authors
        if (authors && authors.length > 0) {
          for (let i = 0; i < authors.length; i++) {
            const authorName = authors[i].name;

            // Check if author already exists
            let authorId;
            const existingAuthor = await db.get(
              'SELECT id FROM authors WHERE LOWER(name) = LOWER(?)',
              [authorName],
            );

            if (existingAuthor) {
              authorId = existingAuthor.id;
            } else {
              // Create new author
              const authorResult = await db.run(
                'INSERT INTO authors (name) VALUES (?)',
                [authorName],
              );
              authorId = authorResult.lastID;
            }

            // Create author-book relationship
            await db.run(
              'INSERT INTO author_books (author_id, book_id, is_primary) VALUES (?, ?, ?)',
              [authorId, bookId, i === 0 ? 1 : 0], // First author is primary
            );
          }
        }

        // Commit transaction
        await db.run('COMMIT');

        // Get the complete book with authors
        const newBook = await db.get('SELECT * FROM books WHERE id = ?', [
          bookId,
        ]);
        const bookAuthors = await db.all(
          `
          SELECT a.*, ab.is_primary 
          FROM authors a
          JOIN author_books ab ON a.id = ab.author_id
          WHERE ab.book_id = ?
          ORDER BY ab.is_primary DESC, a.name
        `,
          [bookId],
        );

        newBook.authors = bookAuthors;

        // Add to user collection if requested
        if (addToCollection && userId && bookId) {
          await addBookToUserCollection(db, userId, bookId);
          res.status(201).json({
            message:
              'Book created successfully from ISBN and added to your collection',
            book: newBook,
          });
        } else {
          res.status(201).json({
            message: 'Book created successfully from ISBN',
            book: newBook,
          });
        }
      } catch (error) {
        // Rollback transaction on error
        await db.run('ROLLBACK');
        throw error;
      }
    } catch (error: unknown) {
      // If an axios error occurred while fetching book data
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error('Error fetching book data:', errorMessage);
      res.status(500).json({
        message: 'Error fetching book data from Open Library',
        error: errorMessage,
      });
    }
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Error creating book by ISBN:', errorMessage);
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
};

/**
 * Update a book, including its author relationships
 */
export const updateBook = async (
  req: UserRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      title,
      isbn,
      isbn10,
      isbn13,
      publishYear,
      pages,
      genre,
      author, // For backward compatibility
      cover,
      coverKey,
      description,
      authors, // New field for multiple authors
      featured,
    } = req.body;

    const normalizedCover: string | null =
      typeof cover === 'string'
        ? cover.trim() === ''
          ? null
          : cover
        : (cover ?? null);
    const normalizedCoverKey: string | null =
      typeof coverKey === 'string'
        ? coverKey.trim() === ''
          ? null
          : coverKey
        : (coverKey ?? null);

    // Validate input
    if (!title) {
      res.status(400).json({ message: 'Title is required' });
      return;
    }

    if (normalizedCoverKey && !normalizedCover) {
      res
        .status(400)
        .json({ message: 'Cover URL is required when coverKey is provided' });
      return;
    }

    const db = await connectDatabase();
    const canonicalGenre = await resolveCanonicalGenre(db, genre);

    // Check if book exists
    const book = await db.get('SELECT * FROM books WHERE id = ?', [id]);
    if (!book) {
      res.status(404).json({ message: 'Book not found' });
      return;
    }

    const previousCoverUrl: string | null =
      typeof (book as any).cover === 'string' ? (book as any).cover : null;
    const previousCoverKey: string | null =
      typeof (book as any).coverKey === 'string'
        ? (book as any).coverKey
        : typeof (book as any).cover_key === 'string'
          ? (book as any).cover_key
          : null;

    const shouldDeletePreviousCover =
      !!previousCoverKey &&
      // Explicit remove
      ((normalizedCover === null && normalizedCoverKey === null) ||
        // Replaced with a different UploadThing file
        (normalizedCoverKey !== null &&
          normalizedCoverKey !== previousCoverKey) ||
        // Replaced with a different URL (e.g., external cover) while key cleared
        (normalizedCoverKey === null && normalizedCover !== previousCoverUrl));

    // Check if ISBN values are unique (if provided)
    const isbnCandidates = [isbn, isbn10, isbn13].filter(Boolean);
    if (isbnCandidates.length > 0) {
      const placeholders = isbnCandidates.map(() => '?').join(', ');
      const existingBook = await db.get(
        `SELECT * FROM books WHERE id != ? AND (isbn IN (${placeholders}) OR isbn10 IN (${placeholders}) OR isbn13 IN (${placeholders}))`,
        [id, ...isbnCandidates, ...isbnCandidates, ...isbnCandidates],
      );
      if (existingBook) {
        res.status(400).json({ message: 'Book with this ISBN already exists' });
        return;
      }
    }

    // Start a transaction
    await db.run('BEGIN TRANSACTION');

    try {
      // Update book
      const primaryIsbn = isbn13 || isbn10 || isbn || null;
      await db.run(
        `UPDATE books 
         SET title = ?, isbn = ?, isbn10 = ?, isbn13 = ?, publishYear = ?, pages = ?, genre = ?, author = ?, cover = ?, cover_key = ?, description = ?, featured = ?, updatedAt = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [
          title,
          primaryIsbn,
          isbn10 || null,
          isbn13 || null,
          publishYear || null,
          typeof pages === 'number' ? pages : null,
          canonicalGenre,
          author || null, // Keep author field for backward compatibility
          normalizedCover,
          normalizedCoverKey,
          description || null,
          typeof featured === 'boolean'
            ? featured
            : ((book as any).featured ?? false),
          id,
        ],
      );

      // Handle author relationships
      if (authors && Array.isArray(authors)) {
        // Remove existing author-book relationships
        await db.run('DELETE FROM author_books WHERE book_id = ?', [id]);

        // Create new author-book relationships
        for (let i = 0; i < authors.length; i++) {
          const authorName = authors[i].name;
          const authorId = authors[i].id;

          if (!authorName) continue;

          let dbAuthorId = authorId;

          // If no ID provided, check if author already exists by name
          if (!dbAuthorId) {
            const existingAuthor = await db.get(
              'SELECT id FROM authors WHERE LOWER(name) = LOWER(?)',
              [authorName],
            );

            if (existingAuthor) {
              dbAuthorId = existingAuthor.id;
            } else {
              // Create new author
              const authorResult = await db.run(
                'INSERT INTO authors (name) VALUES (?)',
                [authorName],
              );
              dbAuthorId = authorResult.lastID;
            }
          }

          // Create author-book relationship
          await db.run(
            'INSERT INTO author_books (author_id, book_id, is_primary) VALUES (?, ?, ?)',
            [dbAuthorId, id, i === 0 ? 1 : 0], // First author is primary
          );
        }
      }
      // If no authors array but author string is provided (backward compatibility)
      else if (author) {
        // Remove existing author-book relationships
        await db.run('DELETE FROM author_books WHERE book_id = ?', [id]);

        // Split author string in case it contains multiple names
        const authorNames = author
          .split(/,\s*/)
          .filter((name: string) => name.trim() !== '');

        for (let i = 0; i < authorNames.length; i++) {
          const authorName = authorNames[i].trim();

          // Check if author already exists
          let authorId;
          const existingAuthor = await db.get(
            'SELECT id FROM authors WHERE LOWER(name) = LOWER(?)',
            [authorName],
          );

          if (existingAuthor) {
            authorId = existingAuthor.id;
          } else {
            // Create new author
            const authorResult = await db.run(
              'INSERT INTO authors (name) VALUES (?)',
              [authorName],
            );
            authorId = authorResult.lastID;
          }

          // Create author-book relationship
          await db.run(
            'INSERT INTO author_books (author_id, book_id, is_primary) VALUES (?, ?, ?)',
            [authorId, id, i === 0 ? 1 : 0], // First author is primary
          );
        }
      }

      // Commit transaction
      await db.run('COMMIT');

      if (shouldDeletePreviousCover) {
        try {
          const utapi = new UTApi();
          await utapi.deleteFiles(previousCoverKey as string);
        } catch (cleanupError) {
          // Cleanup failures shouldn't block the update.
          console.warn(
            'Failed to delete previous cover from UploadThing',
            cleanupError,
          );
        }
      }

      // Get the updated book with authors
      const updatedBook = await db.get('SELECT * FROM books WHERE id = ?', [
        id,
      ]);
      const bookAuthors = await db.all(
        `
        SELECT a.*, ab.is_primary 
        FROM authors a
        JOIN author_books ab ON a.id = ab.author_id
        WHERE ab.book_id = ?
        ORDER BY ab.is_primary DESC, a.name
      `,
        [id],
      );

      updatedBook.authors = bookAuthors;

      res.status(200).json({
        message: 'Book updated successfully',
        book: updatedBook,
      });
    } catch (error) {
      // Rollback transaction on error
      await db.run('ROLLBACK');
      throw error;
    }
  } catch (error: Error | unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Error updating book:', errorMessage);
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
};

/**
 * Delete a book
 */
export const deleteBook = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    const db = await connectDatabase();

    // Check if book exists
    const book = await db.get('SELECT * FROM books WHERE id = ?', [id]);
    if (!book) {
      res.status(404).json({ message: 'Book not found' });
      return;
    }

    const coverKey: string | null =
      typeof (book as any).coverKey === 'string'
        ? (book as any).coverKey
        : typeof (book as any).cover_key === 'string'
          ? (book as any).cover_key
          : null;

    if (coverKey) {
      try {
        const utapi = new UTApi();
        await utapi.deleteFiles(coverKey);
      } catch (cleanupError) {
        // Cleanup failures shouldn't block the delete.
        console.warn('Failed to delete cover from UploadThing', cleanupError);
      }
    }

    // Delete book - this will also cascade delete entries in author_books and user_collections
    await db.run('DELETE FROM books WHERE id = ?', [id]);

    res.status(200).json({ message: 'Book deleted successfully' });
  } catch (error: Error | unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Error deleting book:', errorMessage);
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
};

/**
 * Search books in our database
 */
export const searchBooks = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { q } = req.query;

    if (!q) {
      res.status(400).json({ message: 'Search query is required' });
      return;
    }

    const searchQuery = `%${q}%`;

    const db = await connectDatabase();

    // Search books by title, description, or via authors
    const books = await db.all(
      `
      SELECT DISTINCT b.* 
      FROM books b
      LEFT JOIN author_books ab ON b.id = ab.book_id
      LEFT JOIN authors a ON ab.author_id = a.id
      WHERE 
        b.title LIKE ? OR 
        b.description LIKE ? OR
        b.author LIKE ? OR
        a.name LIKE ?
      ORDER BY b.title
    `,
      [searchQuery, searchQuery, searchQuery, searchQuery],
    );

    // Get authors for each book
    for (const book of books) {
      const authors = await db.all(
        `
        SELECT a.*, ab.is_primary 
        FROM authors a
        JOIN author_books ab ON a.id = ab.author_id
        WHERE ab.book_id = ?
        ORDER BY ab.is_primary DESC, a.name
      `,
        [book.id],
      );

      book.authors = authors;
    }

    res.status(200).json({ books });
  } catch (error: Error | unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Error searching books:', errorMessage);
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
};

/**
 * Get available filter options (genres and years) from the database
 */
export const getFilterOptions = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const db = await connectDatabase();

    // Get distinct genres
    const genresResult = await db.all(
      `
      SELECT DISTINCT genre 
      FROM books 
      WHERE genre IS NOT NULL AND genre != ''
      ORDER BY genre
    `
    );
    const genres = genresResult.map((row: any) => row.genre);

    // Get distinct publication years
    const yearsResult = await db.all(
      `
      SELECT DISTINCT publishYear 
      FROM books 
      WHERE publishYear IS NOT NULL
      ORDER BY publishYear DESC
    `
    );
    const years = yearsResult.map((row: any) => row.publishYear);

    res.status(200).json({ genres, years });
  } catch (error: Error | unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching filter options:', errorMessage);
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
};

// ... the rest of the file remains mostly the same

/**
 * Search Open Library for books by ISBN, title, or author
 */
export const searchOpenLibrary = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { query, type } = req.query;

    if (!query) {
      res.status(400).json({ message: 'Search query is required' });
      return;
    }

    // Apply rate limiting
    if (isRateLimited()) {
      res.status(429).json({
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: Math.ceil(rateLimitWindow / 1000),
      });
      return;
    }

    let searchUrl: string;
    const searchType = type?.toString().toLowerCase() || '';
    const searchQuery = encodeURIComponent(query.toString());

    // Determine which endpoint to use based on search type
    if (searchType === 'isbn') {
      // ISBN search - should return a single book with exact match
      searchUrl = `https://openlibrary.org/api/books?bibkeys=ISBN:${searchQuery}&format=json&jscmd=data`;

      const response = await axios.get(searchUrl, { headers: commonHeaders });

      const bookKey = `ISBN:${searchQuery}`;
      if (!response.data[bookKey]) {
        res.status(404).json({ message: 'Book not found with this ISBN' });
        return;
      }

      // Format the book data for our API
      const bookData = response.data[bookKey] as OpenLibraryBookData;
      const description =
        typeof bookData.description === 'string'
          ? bookData.description
          : bookData.description?.value || null;

      const identifierData = (bookData as any).identifiers || {};
      const isbn10 = Array.isArray(identifierData.isbn_10)
        ? identifierData.isbn_10[0]
        : (bookData as any).isbn_10?.[0] || null;
      const isbn13 = Array.isArray(identifierData.isbn_13)
        ? identifierData.isbn_13[0]
        : (bookData as any).isbn_13?.[0] || null;
      const primaryIsbn = isbn13 || isbn10 || searchQuery;

      const book = {
        title: bookData.title || 'Unknown Title',
        author: bookData.authors
          ? bookData.authors.map((a: OpenLibraryAuthor) => a.name).join(', ')
          : 'Unknown Author',
        publishYear: bookData.publish_date
          ? parseInt(bookData.publish_date.slice(-4))
          : null,
        isbn: primaryIsbn,
        isbn10,
        isbn13,
        cover: bookData.cover?.medium || null,
        description: description,
        publisher: bookData.publishers?.[0] || null,
        subjects:
          bookData.subjects?.map((s) =>
            typeof s === 'string' ? s : s.name || '',
          ) || [],
        url: bookData.url || `https://openlibrary.org/isbn/${searchQuery}`,
      };

      res.status(200).json({ book });
    } else if (searchType === 'author') {
      // Author search - returns multiple books by the author
      searchUrl = `https://openlibrary.org/search/authors.json?q=${searchQuery}`;

      const authorsResponse = await axios.get(searchUrl, {
        headers: commonHeaders,
      });

      if (
        !authorsResponse.data.docs ||
        authorsResponse.data.docs.length === 0
      ) {
        res
          .status(404)
          .json({ message: 'No authors found matching the query' });
        return;
      }

      // Get the first matching author's key
      const authorKey = authorsResponse.data.docs[0].key;

      // Get works by this author
      const worksUrl = `https://openlibrary.org/authors/${authorKey}/works.json?limit=20`;
      const worksResponse = await axios.get(worksUrl, {
        headers: commonHeaders,
      });

      if (
        !worksResponse.data.entries ||
        worksResponse.data.entries.length === 0
      ) {
        res.status(404).json({ message: 'No books found for this author' });
        return;
      }

      // Format the books data
      const books = worksResponse.data.entries.map((work: OpenLibraryWork) => {
        const description =
          typeof work.description === 'string'
            ? work.description
            : work.description?.value || null;

        return {
          title: work.title || 'Unknown Title',
          author: authorsResponse.data.docs[0].name || 'Unknown Author',
          workKey: work.key,
          coverId: work.covers?.[0] || null,
          cover: work.covers?.[0]
            ? `https://covers.openlibrary.org/b/id/${work.covers[0]}-M.jpg`
            : null,
          firstPublishYear: work.first_publish_year || null,
          url: `https://openlibrary.org${work.key}`,
          description: description,
        };
      });

      res.status(200).json({
        author: authorsResponse.data.docs[0].name,
        books,
        total: worksResponse.data.size || books.length,
      });
    } else {
      // Default to title search - returns multiple books matching the title
      searchUrl = `https://openlibrary.org/search.json?title=${searchQuery}&limit=20`;

      const response = await axios.get(searchUrl, { headers: commonHeaders });

      if (!response.data.docs || response.data.docs.length === 0) {
        res.status(404).json({ message: 'No books found matching the query' });
        return;
      }

      // Format the books data
      const books = response.data.docs.map((book: OpenLibrarySearchResult) => {
        const isbn10 = book.isbn?.find((value) => value.length === 10) || null;
        const isbn13 = book.isbn?.find((value) => value.length === 13) || null;
        return {
          title: book.title || 'Unknown Title',
          author: book.author_name
            ? book.author_name.join(', ')
            : 'Unknown Author',
          firstPublishYear: book.first_publish_year || null,
          isbn: isbn13 || isbn10 || book.isbn?.[0] || null,
          isbn10,
          isbn13,
          coverId: book.cover_i || null,
          cover: book.cover_i
            ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
            : null,
          key: book.key,
          url: `https://openlibrary.org${book.key}`,
          languages: book.language || [],
          publishers: book.publisher || [],
        };
      });

      res.status(200).json({
        books,
        total: response.data.numFound,
        offset: response.data.start,
        limit: books.length,
      });
    }
  } catch (error: Error | unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Error searching Open Library:', errorMessage);
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
};

/**
 * Add a book to a user's collection
 */
export const addToUserCollection = async (
  req: UserRequest,
  res: Response,
): Promise<void> => {
  try {
    const { bookId } = req.body;
    const userId = getUserId(req);

    if (!userId) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    if (!bookId) {
      res.status(400).json({ message: 'Book ID is required' });
      return;
    }

    const db = await connectDatabase();

    // Check if book exists
    const book = await db.get('SELECT * FROM books WHERE id = ?', [bookId]);
    if (!book) {
      res.status(404).json({ message: 'Book not found' });
      return;
    }

    // Add to user collection
    await addBookToUserCollection(db, userId, bookId);

    res.status(201).json({
      message: 'Book added to your collection successfully',
    });
  } catch (error: Error | unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Error adding book to collection:', errorMessage);
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
};

/**
 * Remove a book from a user's collection
 */
export const removeFromUserCollection = async (
  req: UserRequest,
  res: Response,
): Promise<void> => {
  try {
    const { bookId } = req.params;
    const userId = getUserId(req);

    if (!userId) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const db = await connectDatabase();

    // Check if the book is in the user's collection
    const userBook = await db.get(
      'SELECT * FROM user_collections WHERE userId = ? AND bookId = ?',
      [userId, bookId],
    );

    if (!userBook) {
      res.status(404).json({ message: 'Book not found in your collection' });
      return;
    }

    // Remove from user collection
    await db.run(
      'DELETE FROM user_collections WHERE userId = ? AND bookId = ?',
      [userId, bookId],
    );

    res.status(200).json({
      message: 'Book removed from your collection successfully',
    });
  } catch (error: Error | unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Error removing book from collection:', errorMessage);
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
};

/**
 * Get a user's book collection
 */
export const getUserCollection = async (
  req: UserRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const db = await connectDatabase();

    // Get all books in the user's collection
    const books = await db.all(
      `
      SELECT b.* 
      FROM books b
      JOIN user_collections uc ON b.id = uc.bookId
      WHERE uc.userId = ?
      ORDER BY b.title
    `,
      [userId],
    );

    // Get authors for each book
    for (const book of books) {
      const authors = await db.all(
        `
        SELECT a.*, ab.is_primary 
        FROM authors a
        JOIN author_books ab ON a.id = ab.author_id
        WHERE ab.book_id = ?
        ORDER BY ab.is_primary DESC, a.name
      `,
        [book.id],
      );

      book.authors = authors;
    }

    res.status(200).json({ books });
  } catch (error: Error | unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching user collection:', errorMessage);
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
};

/**
 * Helper function to add a book to a user's collection
 */
async function addBookToUserCollection(
  db: DbClient,
  userId: number,
  bookId: number,
): Promise<void> {
  try {
    // Check if the book is already in the user's collection
    const existingEntry = await db.get(
      'SELECT * FROM user_collections WHERE userId = ? AND bookId = ?',
      [userId, bookId],
    );

    if (existingEntry) {
      return; // Book is already in the collection, no need to add again
    }

    // Add to user collection
    await db.run(
      `INSERT INTO user_collections (userId, bookId) VALUES (?, ?)`,
      [userId, bookId],
    );
  } catch (error) {
    console.error('Error in addBookToUserCollection:', error);
    throw error;
  }
}
