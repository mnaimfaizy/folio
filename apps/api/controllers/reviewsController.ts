// filepath: c:\Users\mnaim\Downloads\Projects\vibe-coding-projects\library-api\src\controllers\reviewsController.ts
import { Request, Response } from 'express';
import { connectDatabase } from '../db/database';
import { Review } from '../models/Review';

type AuthenticatedRequest = Request & { user?: any };

const getParamValue = (value: string | string[]): string =>
  Array.isArray(value) ? value[0] : value;

// Get all reviews for a specific book
export const getBookReviews = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const bookId = parseInt(getParamValue(req.params.bookId), 10);
    if (isNaN(bookId)) {
      res.status(400).json({ message: 'Invalid book ID' });
      return;
    }

    const db = await connectDatabase();

    const reviews = await db.all(
      `SELECT r.*, u.name as user_username
       FROM reviews r
       LEFT JOIN users u ON r.userId = u.id
       WHERE r.bookId = ?
       ORDER BY r.createdAt DESC`,
      [bookId],
    );

    // Format the reviews
    const formattedReviews: Review[] = reviews.map((r) => ({
      id: r.id,
      bookId: r.bookId,
      userId: r.userId,
      username: r.user_username || r.username, // Use db username if available, otherwise the provided one
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));

    res.status(200).json(formattedReviews);
  } catch (error: Error | unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching book reviews:', errorMessage);
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
};

// Get all reviews with pagination
export const getAllReviews = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const db = await connectDatabase();

    // Get reviews with pagination and join with books to get book titles
    const reviews = await db.all(
      `SELECT r.*, b.title as book_title
       FROM reviews r
       LEFT JOIN books b ON r.bookId = b.id
       ORDER BY r.createdAt DESC
       LIMIT ? OFFSET ?`,
      [limit, offset],
    );

    // Get total count of reviews for pagination info
    const countResult = await db.all('SELECT COUNT(*) as total FROM reviews');
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      reviews,
      pagination: {
        total,
        page,
        limit,
        pages: totalPages,
      },
    });
  } catch (error: Error | unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching all reviews:', errorMessage);
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
};

// Get a specific review by ID
export const getReviewById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const reviewId = req.params.id;

    const db = await connectDatabase();

    const review = await db.get(
      `SELECT r.*, b.title as book_title
       FROM reviews r
       LEFT JOIN books b ON r.bookId = b.id
       WHERE r.id = ?`,
      [reviewId],
    );

    if (!review) {
      res.status(404).json({ message: 'Review not found' });
      return;
    }

    res.status(200).json({ review });
  } catch (error: Error | unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching review by ID:', errorMessage);
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
};

// Get all reviews for a specific book (alternative implementation for test compatibility)
export const getReviewsByBookId = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const bookId = req.params.bookId;

    const db = await connectDatabase();

    const reviews = await db.all(
      `SELECT r.*
       FROM reviews r
       WHERE r.book_id = ?
       ORDER BY r.createdAt DESC`,
      [bookId],
    );

    res.status(200).json({ reviews });
  } catch (error: Error | unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching reviews by book ID:', errorMessage);
    res.status(500).json({ message: 'Server error', error: 'Database error' });
  }
};

// Create a new review for a book
export const createReview = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const bookId = parseInt(getParamValue(req.params.bookId), 10);
    if (isNaN(bookId)) {
      res.status(400).json({ message: 'Invalid book ID' });
      return;
    }

    const db = await connectDatabase();

    // Begin transaction
    await db.run('BEGIN TRANSACTION');

    try {
      // Check if book exists
      const book = await db.get('SELECT id FROM books WHERE id = ?', [bookId]);
      if (!book) {
        res.status(404).json({ message: 'Book not found' });
        await db.run('ROLLBACK');
        return;
      }

      const { rating, comment, username } = req.body;

      // Validate review data
      if (!rating || rating < 1 || rating > 5) {
        res.status(400).json({ message: 'Rating must be between 1 and 5' });
        await db.run('ROLLBACK');
        return;
      }

      if (!comment || comment.trim() === '') {
        res.status(400).json({ message: 'Review comment is required' });
        await db.run('ROLLBACK');
        return;
      }

      if (!username || username.trim() === '') {
        res.status(400).json({ message: 'Username is required' });
        await db.run('ROLLBACK');
        return;
      }

      // Get userId if available from auth
      const userId = req.user?.id;

      const now = new Date().toISOString();

      const result = await db.run(
        `INSERT INTO reviews (bookId, userId, username, rating, comment, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [bookId, userId || null, username, rating, comment, now, now],
      );

      // Commit transaction
      await db.run('COMMIT');

      res.status(201).json({
        id: result.lastID,
        bookId,
        userId,
        username,
        rating,
        comment,
        createdAt: now,
        updatedAt: now,
      });
    } catch (error) {
      // Rollback transaction on error
      await db.run('ROLLBACK');
      throw error;
    }
  } catch (error: Error | unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Error creating book review:', errorMessage);
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
};

// Update a review
export const updateReview = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const reviewId = parseInt(getParamValue(req.params.reviewId), 10);
    if (isNaN(reviewId)) {
      res.status(400).json({ message: 'Invalid review ID' });
      return;
    }

    const db = await connectDatabase();

    // Begin transaction
    await db.run('BEGIN TRANSACTION');

    try {
      // Verify the review exists
      const existingReview = await db.get(
        'SELECT * FROM reviews WHERE id = ?',
        [reviewId],
      );
      if (!existingReview) {
        res.status(404).json({ message: 'Review not found' });
        await db.run('ROLLBACK');
        return;
      }

      // Verify user has permission to update this review
      const userId = req.user?.id;
      const isAuthorized =
        userId && (existingReview.userId === userId || req.user?.isAdmin);

      if (!isAuthorized) {
        res
          .status(403)
          .json({ message: "You don't have permission to update this review" });
        await db.run('ROLLBACK');
        return;
      }

      const { rating, comment } = req.body;

      // Validate review data
      if (rating !== undefined && (rating < 1 || rating > 5)) {
        res.status(400).json({ message: 'Rating must be between 1 and 5' });
        await db.run('ROLLBACK');
        return;
      }

      if (comment !== undefined && comment.trim() === '') {
        res.status(400).json({ message: 'Review comment cannot be empty' });
        await db.run('ROLLBACK');
        return;
      }

      const updateFields = [];
      const values = [];

      if (rating !== undefined) {
        updateFields.push('rating = ?');
        values.push(rating);
      }

      if (comment !== undefined) {
        updateFields.push('comment = ?');
        values.push(comment);
      }

      if (updateFields.length === 0) {
        res.status(400).json({ message: 'No valid fields to update' });
        await db.run('ROLLBACK');
        return;
      }

      updateFields.push('updatedAt = ?');
      values.push(new Date().toISOString());
      values.push(reviewId);

      await db.run(
        `UPDATE reviews SET ${updateFields.join(', ')} WHERE id = ?`,
        values,
      );

      // Commit transaction
      await db.run('COMMIT');

      // Get updated review
      const updatedReview = await db.get('SELECT * FROM reviews WHERE id = ?', [
        reviewId,
      ]);

      res.status(200).json(updatedReview);
    } catch (error) {
      // Rollback transaction on error
      await db.run('ROLLBACK');
      throw error;
    }
  } catch (error: Error | unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Error updating review:', errorMessage);
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
};

// Delete a review
export const deleteReview = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const reviewId = parseInt(getParamValue(req.params.reviewId), 10);
    if (isNaN(reviewId)) {
      res.status(400).json({ message: 'Invalid review ID' });
      return;
    }

    const db = await connectDatabase();

    // Begin transaction
    await db.run('BEGIN TRANSACTION');

    try {
      // Verify the review exists
      const existingReview = await db.get(
        'SELECT * FROM reviews WHERE id = ?',
        [reviewId],
      );
      if (!existingReview) {
        res.status(404).json({ message: 'Review not found' });
        await db.run('ROLLBACK');
        return;
      }

      // Verify user has permission to delete this review
      const userId = req.user?.id;
      const isAuthorized =
        userId && (existingReview.userId === userId || req.user?.isAdmin);

      if (!isAuthorized) {
        res
          .status(403)
          .json({ message: "You don't have permission to delete this review" });
        await db.run('ROLLBACK');
        return;
      }

      await db.run('DELETE FROM reviews WHERE id = ?', [reviewId]);

      // Commit transaction
      await db.run('COMMIT');

      res.status(204).send();
    } catch (error) {
      // Rollback transaction on error
      await db.run('ROLLBACK');
      throw error;
    }
  } catch (error: Error | unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Error deleting review:', errorMessage);
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
};
