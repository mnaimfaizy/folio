import axios from "axios";
import { Request, Response } from "express";
import { connectDatabase } from "../db/database";

// Interface for OpenLibrary work data
interface OpenLibraryWork {
  title?: string;
  key?: string;
  first_publish_year?: number;
  covers?: number[];
  description?: string | { value: string };
}

// Rate limiting implementation (reusing from booksController)
const rateLimitWindow = 60 * 1000; // 1 minute window
const maxRequests = 5; // Max 5 requests per minute to be respectful
let requestTimestamps: number[] = [];

/**
 * Reset rate limiter state - for testing purposes
 */
export function resetRateLimiter(): void {
  requestTimestamps = [];
}

/**
 * Simple rate limiter function
 * @returns Whether the request is allowed or not
 */
function isRateLimited(): boolean {
  const now = Date.now();
  // Remove timestamps older than the window
  requestTimestamps = requestTimestamps.filter(
    (timestamp) => now - timestamp < rateLimitWindow
  );

  // Check if we're within the limit
  if (requestTimestamps.length >= maxRequests) {
    return true;
  }

  // Add current timestamp and allow the request
  requestTimestamps.push(now);
  return false;
}

// User agent for OpenLibrary API requests
const USER_AGENT =
  "LibraryManagementSystem/1.0 (https://example.com; library@example.com)";

// Common headers for all OpenLibrary API requests
const commonHeaders = {
  "User-Agent": USER_AGENT,
  Accept: "application/json",
};

/**
 * Get all authors from our database
 */
export const getAllAuthors = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const db = await connectDatabase();

    // Get authors with their book count
    const authors = await db.all(`
      SELECT a.id, a.name, a.biography, a.birth_date, a.photo_url, 
             COUNT(ab.book_id) as book_count
      FROM authors a
      LEFT JOIN author_books ab ON a.id = ab.author_id
      GROUP BY a.id
      ORDER BY a.name
    `);

    res.status(200).json({ authors });
  } catch (error: Error | unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Error fetching authors:", errorMessage);
    res.status(500).json({ message: "Server error", error: errorMessage });
  }
};

/**
 * Get a single author by ID with their books
 */
export const getAuthorById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const db = await connectDatabase();

    // Get author details - using correct column names createdAt and updatedAt
    const author = await db.get(
      `
      SELECT id, name, biography, birth_date, photo_url, createdAt, updatedAt
      FROM authors
      WHERE id = ?
    `,
      [id]
    );

    if (!author) {
      res.status(404).json({ message: "Author not found" });
      return;
    }

    // Get all books by this author
    const books = await db.all(
      `
      SELECT b.* 
      FROM books b
      JOIN author_books ab ON b.id = ab.book_id
      WHERE ab.author_id = ?
      ORDER BY b.title
    `,
      [id]
    );

    res.status(200).json({ author, books });
  } catch (error: Error | unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Error fetching author:", errorMessage);
    res.status(500).json({ message: "Server error", error: errorMessage });
  }
};

/**
 * Get an author by name
 */
export const getAuthorByName = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name } = req.params;

    if (!name) {
      res.status(400).json({ message: "Author name is required" });
      return;
    }

    const db = await connectDatabase();

    // Get author by name (case insensitive search) - using correct column names createdAt and updatedAt
    const author = await db.get(
      `
      SELECT id, name, biography, birth_date, photo_url, createdAt, updatedAt
      FROM authors
      WHERE LOWER(name) = LOWER(?)
    `,
      [name]
    );

    if (!author) {
      res.status(404).json({ message: "Author not found" });
      return;
    }

    // Get all books by this author
    const books = await db.all(
      `
      SELECT b.* 
      FROM books b
      JOIN author_books ab ON b.id = ab.book_id
      WHERE ab.author_id = ?
      ORDER BY b.title
    `,
      [author.id]
    );

    res.status(200).json({ author, books });
  } catch (error: Error | unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Error fetching author by name:", errorMessage);
    res.status(500).json({ message: "Server error", error: errorMessage });
  }
};

/**
 * Create a new author
 */
export const createAuthor = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, biography, birth_date, photo_url } = req.body;

    // Validate input
    if (!name) {
      res.status(400).json({ message: "Author name is required" });
      return;
    }

    const db = await connectDatabase();

    // Check if author already exists
    const existingAuthor = await db.get(
      "SELECT * FROM authors WHERE LOWER(name) = LOWER(?)",
      [name]
    );

    if (existingAuthor) {
      res.status(409).json({
        message: "Author already exists",
        author: existingAuthor,
      });
      return;
    }

    // Create new author
    const result = await db.run(
      `INSERT INTO authors (name, biography, birth_date, photo_url)
       VALUES (?, ?, ?, ?)`,
      [name, biography || null, birth_date || null, photo_url || null]
    );

    if (result.lastID) {
      const newAuthor = await db.get("SELECT * FROM authors WHERE id = ?", [
        result.lastID,
      ]);

      res.status(201).json({
        message: "Author created successfully",
        author: newAuthor,
      });
    } else {
      res.status(500).json({ message: "Failed to create author" });
    }
  } catch (error: Error | unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Error creating author:", errorMessage);
    res.status(500).json({ message: "Server error", error: errorMessage });
  }
};

/**
 * Update an existing author
 */
export const updateAuthor = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, biography, birth_date, photo_url } = req.body;

    // Validate input
    if (!name) {
      res.status(400).json({ message: "Author name is required" });
      return;
    }

    const db = await connectDatabase();

    // Check if author exists
    const author = await db.get("SELECT * FROM authors WHERE id = ?", [id]);
    if (!author) {
      res.status(404).json({ message: "Author not found" });
      return;
    }

    // Check if name already exists for another author
    if (name !== author.name) {
      const existingAuthor = await db.get(
        "SELECT * FROM authors WHERE LOWER(name) = LOWER(?) AND id != ?",
        [name, id]
      );

      if (existingAuthor) {
        res.status(409).json({
          message: "Author with this name already exists",
        });
        return;
      }
    }

    // Update author - using updatedAt column instead of updated_at
    await db.run(
      `UPDATE authors 
       SET name = ?, biography = ?, birth_date = ?, photo_url = ?, updatedAt = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [name, biography || null, birth_date || null, photo_url || null, id]
    );

    const updatedAuthor = await db.get("SELECT * FROM authors WHERE id = ?", [
      id,
    ]);

    res.status(200).json({
      message: "Author updated successfully",
      author: updatedAuthor,
    });
  } catch (error: Error | unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Error updating author:", errorMessage);
    res.status(500).json({ message: "Server error", error: errorMessage });
  }
};

/**
 * Delete an author
 */
export const deleteAuthor = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const db = await connectDatabase();

    // Check if author exists
    const author = await db.get("SELECT * FROM authors WHERE id = ?", [id]);
    if (!author) {
      res.status(404).json({ message: "Author not found" });
      return;
    }

    // Delete author - this will also delete entries in author_books due to CASCADE
    await db.run("DELETE FROM authors WHERE id = ?", [id]);

    res.status(200).json({ message: "Author deleted successfully" });
  } catch (error: Error | unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Error deleting author:", errorMessage);
    res.status(500).json({ message: "Server error", error: errorMessage });
  }
};

/**
 * Associate an author with a book
 */
export const addBookToAuthor = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { authorId, bookId, isPrimary } = req.body;

    if (!authorId || !bookId) {
      res.status(400).json({ message: "Author ID and Book ID are required" });
      return;
    }

    const db = await connectDatabase();

    // Check if author exists
    const author = await db.get("SELECT * FROM authors WHERE id = ?", [
      authorId,
    ]);
    if (!author) {
      res.status(404).json({ message: "Author not found" });
      return;
    }

    // Check if book exists
    const book = await db.get("SELECT * FROM books WHERE id = ?", [bookId]);
    if (!book) {
      res.status(404).json({ message: "Book not found" });
      return;
    }

    // Check if association already exists
    const existingAssociation = await db.get(
      "SELECT * FROM author_books WHERE author_id = ? AND book_id = ?",
      [authorId, bookId]
    );

    if (existingAssociation) {
      // Update the association if it already exists
      await db.run(
        "UPDATE author_books SET is_primary = ? WHERE author_id = ? AND book_id = ?",
        [isPrimary ? 1 : 0, authorId, bookId]
      );

      res.status(200).json({ message: "Author-book association updated" });
      return;
    }

    // Create new association
    await db.run(
      "INSERT INTO author_books (author_id, book_id, is_primary) VALUES (?, ?, ?)",
      [authorId, bookId, isPrimary ? 1 : 0]
    );

    res
      .status(201)
      .json({ message: "Author associated with book successfully" });
  } catch (error: Error | unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Error associating author with book:", errorMessage);
    res.status(500).json({ message: "Server error", error: errorMessage });
  }
};

/**
 * Remove an author-book association
 */
export const removeBookFromAuthor = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { authorId, bookId } = req.params;

    const db = await connectDatabase();

    // Delete the association
    const result = await db.run(
      "DELETE FROM author_books WHERE author_id = ? AND book_id = ?",
      [authorId, bookId]
    );

    if (result.changes && result.changes > 0) {
      res.status(200).json({ message: "Association removed successfully" });
    } else {
      res.status(404).json({ message: "Association not found" });
    }
  } catch (error: Error | unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Error removing author-book association:", errorMessage);
    res.status(500).json({ message: "Server error", error: errorMessage });
  }
};

/**
 * Get author information from Open Library
 */
export const getAuthorInfo = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { authorName } = req.query;

    if (!authorName) {
      res.status(400).json({ message: "Author name is required" });
      return;
    }

    // Apply rate limiting
    if (isRateLimited()) {
      res.status(429).json({
        message: "Rate limit exceeded. Please try again later.",
        retryAfter: Math.ceil(rateLimitWindow / 1000),
      });
      return;
    }

    // Search for author by name on Open Library
    const searchUrl = `https://openlibrary.org/search/authors.json?q=${encodeURIComponent(
      authorName.toString()
    )}`;

    const authorsResponse = await axios.get(searchUrl, {
      headers: commonHeaders,
    });

    if (!authorsResponse.data.docs || authorsResponse.data.docs.length === 0) {
      res.status(404).json({ message: "Author not found" });
      return;
    }

    // Get the first matching author
    const authorData = authorsResponse.data.docs[0];

    // Format author information
    const author = {
      name: authorData.name,
      key: authorData.key,
      birthDate: authorData.birth_date || null,
      topWork: authorData.top_work || null,
      workCount: authorData.work_count || 0,
      photoUrl:
        authorData.photos && authorData.photos.length > 0
          ? `https://covers.openlibrary.org/a/id/${authorData.photos[0]}-L.jpg`
          : null,
    };

    // Get works by this author if we have their key
    let works = [];
    if (author.key) {
      const worksUrl = `https://openlibrary.org/authors/${author.key.replace(
        "/authors/",
        ""
      )}/works.json?limit=10`;
      const worksResponse = await axios.get(worksUrl, {
        headers: commonHeaders,
      });

      if (worksResponse.data.entries && worksResponse.data.entries.length > 0) {
        works = worksResponse.data.entries.map((work: OpenLibraryWork) => ({
          title: work.title || "Unknown Title",
          key: work.key,
          firstPublishYear: work.first_publish_year || null,
          coverId: work.covers?.[0] || null,
          cover: work.covers?.[0]
            ? `https://covers.openlibrary.org/b/id/${work.covers[0]}-M.jpg`
            : null,
        }));
      }
    }

    res.status(200).json({ author, works });
  } catch (error: Error | unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Error fetching author info:", errorMessage);
    res.status(500).json({ message: "Server error", error: errorMessage });
  }
};

/**
 * Search for an author in OpenLibrary by name
 */
export const searchOpenLibraryAuthor = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name } = req.query;

    if (!name) {
      res.status(400).json({ message: "Author name is required" });
      return;
    }

    // Apply rate limiting - Comment out for tests to pass
    if (isRateLimited()) {
      res.status(429).json({
        message: "Rate limit exceeded. Please try again later.",
        retryAfter: Math.ceil(rateLimitWindow / 1000),
      });
      return;
    }

    // Search for author by name on Open Library
    const searchUrl = `https://openlibrary.org/search/authors.json?q=${encodeURIComponent(
      name.toString()
    )}`;

    const authorsResponse = await axios.get(searchUrl, {
      headers: commonHeaders,
    });

    if (!authorsResponse.data.docs || authorsResponse.data.docs.length === 0) {
      res.status(404).json({ message: "Author not found" });
      return;
    }

    // Get the first matching author
    const authorData = authorsResponse.data.docs[0];

    // Format author information
    const author = {
      name: authorData.name,
      key: authorData.key,
      birth_date: authorData.birth_date || null,
      top_work: authorData.top_work || null,
      work_count: authorData.work_count || 0,
      photos: authorData.photos || [],
      photo_url:
        authorData.photos && authorData.photos.length > 0
          ? `https://covers.openlibrary.org/a/id/${authorData.photos[0]}-L.jpg`
          : null,
    };

    res.status(200).json({ author });
  } catch (error: Error | unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Error searching OpenLibrary author:", errorMessage);
    res.status(500).json({ message: "Server error", error: errorMessage });
  }
};

/**
 * Link an author to a book
 */
export const linkAuthorToBook = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { authorId, bookId, isPrimary = false } = req.body;

    if (!authorId || !bookId) {
      res.status(400).json({ message: "Author ID and Book ID are required" });
      return;
    }

    const db = await connectDatabase();

    // Check if author exists
    const author = await db.get("SELECT * FROM authors WHERE id = ?", [
      authorId,
    ]);
    if (!author) {
      res.status(404).json({ message: "Author not found" });
      return;
    }

    // Check if book exists
    const book = await db.get("SELECT * FROM books WHERE id = ?", [bookId]);
    if (!book) {
      res.status(404).json({ message: "Book not found" });
      return;
    }

    // Check if association already exists
    const existingAssociation = await db.get(
      "SELECT * FROM author_books WHERE author_id = ? AND book_id = ?",
      [authorId, bookId]
    );

    if (existingAssociation) {
      // Update the association if it already exists
      await db.run(
        "UPDATE author_books SET is_primary = ? WHERE author_id = ? AND book_id = ?",
        [isPrimary ? 1 : 0, authorId, bookId]
      );

      res
        .status(200)
        .json({ message: "Author-book relationship updated successfully" });
      return;
    }

    // Create new association
    await db.run(
      "INSERT INTO author_books (author_id, book_id, is_primary) VALUES (?, ?, ?)",
      [authorId, bookId, isPrimary ? 1 : 0]
    );

    res.status(201).json({ message: "Author linked to book successfully" });
  } catch (error: Error | unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Error linking author to book:", errorMessage);
    res.status(500).json({ message: "Server error", error: errorMessage });
  }
};

/**
 * Unlink an author from a book
 */
export const unlinkAuthorFromBook = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { authorId, bookId } = req.params;

    if (!authorId || !bookId) {
      res.status(400).json({ message: "Author ID and Book ID are required" });
      return;
    }

    const db = await connectDatabase();

    // Check if association exists
    const existingAssociation = await db.get(
      "SELECT * FROM author_books WHERE author_id = ? AND book_id = ?",
      [authorId, bookId]
    );

    if (!existingAssociation) {
      res.status(404).json({ message: "Author-book association not found" });
      return;
    }

    // Delete the association
    await db.run(
      "DELETE FROM author_books WHERE author_id = ? AND book_id = ?",
      [authorId, bookId]
    );

    res.status(200).json({ message: "Author unlinked from book successfully" });
  } catch (error: Error | unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Error unlinking author from book:", errorMessage);
    res.status(500).json({ message: "Server error", error: errorMessage });
  }
};
