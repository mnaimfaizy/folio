import { Request, Response } from 'express';
import { connectDatabase } from '../db/database';
import {
  autoFulfillRequestsForBook,
  createRequestKey,
  findMatchingBookForRequest,
} from '../services/requestMatchingService';

interface AuthenticatedRequest extends Request {
  user?: {
    id?: number;
    role?: string;
  };
}

function toNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export const createBookRequest = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = toNumber(req.user?.id);

    if (!userId) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const requestedTitle =
      typeof req.body?.title === 'string' ? req.body.title.trim() : '';
    const requestedAuthor =
      typeof req.body?.author === 'string' ? req.body.author.trim() : '';
    const requestedIsbn =
      typeof req.body?.isbn === 'string' ? req.body.isbn.trim() : '';
    const note = typeof req.body?.note === 'string' ? req.body.note.trim() : '';

    if (!requestedIsbn && (!requestedTitle || !requestedAuthor)) {
      res.status(400).json({
        message:
          'Please provide either ISBN, or both title and author to request a book',
      });
      return;
    }

    const normalized = createRequestKey({
      requestedIsbn: requestedIsbn || null,
      requestedTitle: requestedTitle || null,
      requestedAuthor: requestedAuthor || null,
    });

    const db = await connectDatabase();

    const settings = await db.get<{
      minimum_credit_balance: number;
      credit_currency: string;
    }>(
      'SELECT minimum_credit_balance, credit_currency FROM site_settings WHERE id = 1',
    );

    const borrower = await db.get<{ credit_balance: number }>(
      'SELECT credit_balance FROM users WHERE id = ?',
      [userId],
    );

    const minCredit = Number(settings?.minimum_credit_balance ?? 50);
    const currentCredit = Number(borrower?.credit_balance ?? 0);
    const currency = (settings?.credit_currency ?? 'USD').toUpperCase();

    if (currentCredit < minCredit) {
      res.status(409).json({
        message: `Book requests require at least ${currency} ${minCredit.toFixed(2)} credit. Your current balance is ${currency} ${currentCredit.toFixed(2)}.`,
      });
      return;
    }

    const duplicate = await db.get<{ id: number }>(
      `SELECT id FROM book_requests
       WHERE requested_by_user_id = ?
         AND request_key = ?
         AND status = 'OPEN'
       LIMIT 1`,
      [userId, normalized.requestKey],
    );

    if (duplicate) {
      res
        .status(409)
        .json({ message: 'You already have an open request for this book' });
      return;
    }

    const matchingBook = await findMatchingBookForRequest(db, {
      requestedIsbn: requestedIsbn || null,
      requestedTitle: requestedTitle || null,
      requestedAuthor: requestedAuthor || null,
    });

    const status = matchingBook ? 'FULFILLED_AUTO' : 'OPEN';
    const fulfillmentNote = matchingBook
      ? 'Automatically marked as fulfilled because this book is already available.'
      : null;

    const insert = await db.run(
      `INSERT INTO book_requests (
        requested_by_user_id,
        requested_title,
        requested_author,
        requested_isbn,
        normalized_title,
        normalized_author,
        normalized_isbn,
        request_key,
        note,
        status,
        matched_book_id,
        fulfilled_at,
        fulfillment_note
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        requestedTitle || null,
        requestedAuthor || null,
        requestedIsbn || null,
        normalized.normalizedTitle,
        normalized.normalizedAuthor,
        normalized.normalizedIsbn,
        normalized.requestKey,
        note || null,
        status,
        matchingBook?.id ?? null,
        matchingBook ? new Date().toISOString() : null,
        fulfillmentNote,
      ],
    );

    const createdRequest = await db.get(
      `SELECT r.*, b.title AS matched_book_title
       FROM book_requests r
       LEFT JOIN books b ON b.id = r.matched_book_id
       WHERE r.id = ?`,
      [insert.lastID],
    );

    res.status(201).json({
      message: matchingBook
        ? 'Request submitted and marked as available'
        : 'Book request submitted successfully',
      request: createdRequest,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Error creating book request:', errorMessage);
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
};

export const getMyBookRequests = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = toNumber(req.user?.id);

    if (!userId) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const db = await connectDatabase();

    const requests = await db.all(
      `SELECT r.*, b.title AS matched_book_title
       FROM book_requests r
       LEFT JOIN books b ON b.id = r.matched_book_id
       WHERE r.requested_by_user_id = ?
       ORDER BY r.created_at DESC`,
      [userId],
    );

    res.status(200).json({ requests });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching user requests:', errorMessage);
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
};

export const getAllBookRequestsForAdmin = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const db = await connectDatabase();

    const requests = await db.all(
      `SELECT r.*, u.name AS requested_by_name, u.email AS requested_by_email, b.title AS matched_book_title
       FROM book_requests r
       JOIN users u ON u.id = r.requested_by_user_id
       LEFT JOIN books b ON b.id = r.matched_book_id
       ORDER BY r.created_at DESC`,
    );

    res.status(200).json({ requests });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching admin requests:', errorMessage);
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
};

export const getBookRequestAnalytics = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const db = await connectDatabase();

    const rows = await db.all(
      `SELECT
          request_key,
          COALESCE(MAX(requested_title), MAX(requested_isbn), 'Unknown') AS label,
          MAX(requested_title) AS requested_title,
          MAX(requested_author) AS requested_author,
          MAX(requested_isbn) AS requested_isbn,
          COUNT(*)::int AS total_requests,
          SUM(CASE WHEN status = 'OPEN' THEN 1 ELSE 0 END)::int AS open_requests,
          SUM(CASE WHEN status LIKE 'FULFILLED%' THEN 1 ELSE 0 END)::int AS fulfilled_requests
        FROM book_requests
        GROUP BY request_key
        ORDER BY total_requests DESC, label ASC
        LIMIT 20`,
    );

    res.status(200).json({ items: rows });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching request analytics:', errorMessage);
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
};

export const markRequestFulfilledManually = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const adminUserId = toNumber(req.user?.id);
    const requestId = toNumber(req.params.requestId);
    const matchedBookId = toNumber(req.body?.bookId);
    const note =
      typeof req.body?.note === 'string' ? req.body.note.trim() : null;

    if (!adminUserId) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    if (!requestId) {
      res.status(400).json({ message: 'Invalid request id' });
      return;
    }

    const db = await connectDatabase();

    const requestRow = await db.get<{ id: number; status: string }>(
      'SELECT id, status FROM book_requests WHERE id = ?',
      [requestId],
    );

    if (!requestRow) {
      res.status(404).json({ message: 'Request not found' });
      return;
    }

    if (requestRow.status !== 'OPEN') {
      res
        .status(409)
        .json({ message: 'Only open requests can be fulfilled manually' });
      return;
    }

    await db.run(
      `UPDATE book_requests
       SET status = 'FULFILLED_MANUAL',
           matched_book_id = ?,
           fulfilled_at = CURRENT_TIMESTAMP,
           fulfilled_by_user_id = ?,
           fulfillment_note = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [matchedBookId, adminUserId, note, requestId],
    );

    res.status(200).json({ message: 'Request marked as fulfilled manually' });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Error marking request fulfilled manually:', errorMessage);
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
};

export const autoFulfillRequestsByBook = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const bookId = toNumber(req.params.bookId);

    if (!bookId) {
      res.status(400).json({ message: 'Invalid book id' });
      return;
    }

    const db = await connectDatabase();
    const fulfilledCount = await autoFulfillRequestsForBook(db, bookId);

    res.status(200).json({
      message: 'Matching open requests processed',
      fulfilledCount,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Error auto-fulfilling requests by book:', errorMessage);
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
};
