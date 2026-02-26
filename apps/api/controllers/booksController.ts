import { Request, Response } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { connectDatabase } from '../db/database';
import { User } from '../models/User';
import {
  getAllBooksService,
  getBookByIdService,
  getFeaturedBooksService,
  searchBooksService,
} from '../services/booksService';
import {
  addToUserCollectionService,
  createBookByIsbnService,
  createBookManuallyService,
  deleteBookService,
  getUserCollectionService,
  removeFromUserCollectionService,
  updateBookService,
} from '../services/booksWriteService';
import {
  fetchOpenLibraryBookByIsbn,
  searchOpenLibraryByAuthor,
  searchOpenLibraryByTitle,
} from '../services/openLibraryBookProvider';
import { autoFulfillRequestsForBook } from '../services/requestMatchingService';
import { createSlidingWindowRateLimiter } from '../utils/rateLimiter';

// Define interface for Request with user property
interface UserRequest extends Request {
  user?:
    | {
        id: number;
        isAdmin?: boolean;
      }
    | JwtPayload;
}

// Rate limiting implementation
const rateLimitWindow = 60 * 1000; // 1 minute window
const maxRequests = 5; // Max 5 requests per minute to be respectful
const openLibraryRateLimiter = createSlidingWindowRateLimiter({
  windowMs: rateLimitWindow,
  maxRequests,
  stateKey: 'requestTimestamps',
});

// For unit testing, make it easier to mock
export const rateLimiter = {
  isLimited: (): boolean => {
    return openLibraryRateLimiter.isLimited();
  },
};

/**
 * Simple rate limiter function
 * @returns Whether the request is allowed or not
 */
export function isRateLimited(): boolean {
  return rateLimiter.isLimited();
}

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

/**
 * Get all books with their authors
 */
export const getAllBooks = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const books = await getAllBooksService(req.query);

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
    const books = await getFeaturedBooksService();

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
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!id) {
      res.status(400).json({ message: 'Book ID is required' });
      return;
    }

    const book = await getBookByIdService(id);

    if (!book) {
      res.status(404).json({ message: 'Book not found' });
      return;
    }

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
      availableCopies,
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

    const result = await createBookManuallyService(req.body, userId);
    res
      .status(result.status)
      .json({ message: result.message, book: result.book });
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

    const result = await createBookByIsbnService(
      String(isbn),
      addToCollection,
      userId,
    );

    res
      .status(result.status)
      .json({ message: result.message, book: result.book });
  } catch (error: unknown) {
    if (
      (error as { status?: number }).status === 404 &&
      error instanceof Error &&
      error.message === 'Book not found with this ISBN'
    ) {
      res.status(404).json({ message: 'Book not found with this ISBN' });
      return;
    }

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Error creating book by ISBN:', errorMessage);
    res.status(500).json({
      message: `Error fetching book data: ${errorMessage}`,
      error: errorMessage,
    });
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
      availableCopies,
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

    const result = await updateBookService(String(id), {
      title,
      isbn,
      isbn10,
      isbn13,
      publishYear,
      pages,
      genre,
      author,
      cover: normalizedCover,
      coverKey: normalizedCoverKey,
      description,
      authors,
      featured,
      availableCopies,
    });

    res.status(200).json(result);
  } catch (error: Error | unknown) {
    const status = (error as { status?: number }).status;
    if (status === 404 || status === 400) {
      res
        .status(status)
        .json({
          message: error instanceof Error ? error.message : 'Request failed',
        });
      return;
    }

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
    await deleteBookService(String(id));

    res.status(200).json({ message: 'Book deleted successfully' });
  } catch (error: Error | unknown) {
    if ((error as { status?: number }).status === 404) {
      res.status(404).json({ message: 'Book not found' });
      return;
    }

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

    const books = await searchBooksService(String(q));

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
    `,
    );
    const genres = genresResult.map((row: any) => row.genre);

    // Get distinct publication years
    const yearsResult = await db.all(
      `
      SELECT DISTINCT publishYear 
      FROM books 
      WHERE publishYear IS NOT NULL
      ORDER BY publishYear DESC
    `,
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

      const bookData = await fetchOpenLibraryBookByIsbn(searchQuery);
      if (!bookData) {
        res.status(404).json({ message: 'Book not found with this ISBN' });
        return;
      }

      const book = {
        title: bookData.title || 'Unknown Title',
        author: bookData.authorString || 'Unknown Author',
        publishYear: bookData.publishYear,
        isbn: bookData.primaryIsbn,
        isbn10: bookData.isbn10,
        isbn13: bookData.isbn13,
        cover: bookData.cover,
        description: bookData.description,
        publisher: bookData.publisher,
        subjects: bookData.subjects,
        url: `https://openlibrary.org/isbn/${searchQuery}`,
      };

      res.status(200).json({ book });
    } else if (searchType === 'author') {
      const authorSearchResult = await searchOpenLibraryByAuthor(searchQuery);

      if (authorSearchResult.kind === 'no-authors') {
        res
          .status(404)
          .json({ message: 'No authors found matching the query' });
        return;
      }

      if (authorSearchResult.kind === 'no-books') {
        res.status(404).json({ message: 'No books found for this author' });
        return;
      }

      res.status(200).json({
        author: authorSearchResult.author,
        books: authorSearchResult.books,
        total: authorSearchResult.total,
      });
    } else {
      const titleSearchResult = await searchOpenLibraryByTitle(searchQuery);

      if (!titleSearchResult) {
        res.status(404).json({ message: 'No books found matching the query' });
        return;
      }

      res.status(200).json({
        books: titleSearchResult.books,
        total: titleSearchResult.total,
        offset: titleSearchResult.offset,
        limit: titleSearchResult.limit,
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

    await addToUserCollectionService(userId, Number(bookId));

    res.status(201).json({
      message: 'Book added to your collection successfully',
    });
  } catch (error: Error | unknown) {
    if ((error as { status?: number }).status === 404) {
      res.status(404).json({ message: 'Book not found' });
      return;
    }

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

    await removeFromUserCollectionService(userId, String(bookId));

    res.status(200).json({
      message: 'Book removed from your collection successfully',
    });
  } catch (error: Error | unknown) {
    if ((error as { status?: number }).status === 404) {
      res.status(404).json({ message: 'Book not found in your collection' });
      return;
    }

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

    const books = await getUserCollectionService(userId);

    res.status(200).json({ books });
  } catch (error: Error | unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching user collection:', errorMessage);
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
};
