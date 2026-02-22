import type { DbClient } from '../db/types';

interface RequestCandidate {
  id: number;
  requested_isbn: string | null;
  normalized_isbn: string | null;
  normalized_title: string | null;
  normalized_author: string | null;
}

interface BookMatchData {
  id: number;
  isbn: string | null;
  isbn10: string | null;
  isbn13: string | null;
  title: string;
  author: string | null;
  available_copies: number | null;
}

export function normalizeText(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizeIsbn(value: string): string {
  return value.replace(/[^0-9xX]/g, '').toUpperCase();
}

export function createRequestKey(input: {
  requestedIsbn?: string | null;
  requestedTitle?: string | null;
  requestedAuthor?: string | null;
}): {
  requestKey: string;
  normalizedTitle: string | null;
  normalizedAuthor: string | null;
  normalizedIsbn: string | null;
} {
  const normalizedIsbn = input.requestedIsbn
    ? normalizeIsbn(input.requestedIsbn)
    : null;

  if (normalizedIsbn) {
    return {
      requestKey: `isbn:${normalizedIsbn}`,
      normalizedTitle: null,
      normalizedAuthor: null,
      normalizedIsbn,
    };
  }

  const normalizedTitle = input.requestedTitle
    ? normalizeText(input.requestedTitle)
    : null;
  const normalizedAuthor = input.requestedAuthor
    ? normalizeText(input.requestedAuthor)
    : null;

  if (!normalizedTitle || !normalizedAuthor) {
    throw new Error('Request must include ISBN or both title and author');
  }

  return {
    requestKey: `title_author:${normalizedTitle}|${normalizedAuthor}`,
    normalizedTitle,
    normalizedAuthor,
    normalizedIsbn: null,
  };
}

export async function findMatchingBookForRequest(
  db: DbClient,
  input: {
    requestedIsbn?: string | null;
    requestedTitle?: string | null;
    requestedAuthor?: string | null;
  },
): Promise<BookMatchData | undefined> {
  const normalizedIsbn = input.requestedIsbn
    ? normalizeIsbn(input.requestedIsbn)
    : null;

  if (normalizedIsbn) {
    const byIsbn = await db.get<BookMatchData>(
      `SELECT * FROM books
       WHERE available_copies > 0
         AND (
           REPLACE(UPPER(COALESCE(isbn, '')), '-', '') = ?
           OR REPLACE(UPPER(COALESCE(isbn10, '')), '-', '') = ?
           OR REPLACE(UPPER(COALESCE(isbn13, '')), '-', '') = ?
         )
       ORDER BY id ASC
       LIMIT 1`,
      [normalizedIsbn, normalizedIsbn, normalizedIsbn],
    );

    if (byIsbn) return byIsbn;
  }

  if (!input.requestedTitle || !input.requestedAuthor) {
    return undefined;
  }

  const normalizedTitle = normalizeText(input.requestedTitle);
  const normalizedAuthor = normalizeText(input.requestedAuthor);

  const candidateBooks = await db.all<BookMatchData>(
    `SELECT * FROM books WHERE available_copies > 0 ORDER BY id ASC`,
  );

  return candidateBooks.find((book) => {
    const bookTitle = normalizeText(book.title || '');
    const bookAuthor = normalizeText(book.author || '');
    return bookTitle === normalizedTitle && bookAuthor === normalizedAuthor;
  });
}

export async function autoFulfillRequestsForBook(
  db: DbClient,
  bookId: number,
): Promise<number> {
  const book = await db.get<BookMatchData>('SELECT * FROM books WHERE id = ?', [
    bookId,
  ]);

  if (!book || !book.available_copies || book.available_copies <= 0) {
    return 0;
  }

  const bookIsbns = [book.isbn, book.isbn10, book.isbn13]
    .filter((value): value is string => !!value)
    .map((value) => normalizeIsbn(value));

  const normalizedBookTitle = normalizeText(book.title || '');
  const normalizedBookAuthor = normalizeText(book.author || '');

  const openRequests = await db.all<RequestCandidate>(
    `SELECT id, requested_isbn, normalized_isbn, normalized_title, normalized_author
     FROM book_requests
     WHERE status = 'OPEN'
     ORDER BY created_at ASC`,
  );

  let fulfilledCount = 0;

  for (const request of openRequests) {
    const isbnMatched =
      !!request.normalized_isbn && bookIsbns.includes(request.normalized_isbn);

    const titleAuthorMatched =
      !!request.normalized_title &&
      !!request.normalized_author &&
      request.normalized_title === normalizedBookTitle &&
      request.normalized_author === normalizedBookAuthor;

    if (!isbnMatched && !titleAuthorMatched) {
      continue;
    }

    await db.run(
      `UPDATE book_requests
       SET status = 'FULFILLED_AUTO',
           matched_book_id = ?,
           fulfilled_at = CURRENT_TIMESTAMP,
           fulfillment_note = 'Automatically marked as fulfilled because the requested book became available.',
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [bookId, request.id],
    );

    fulfilledCount += 1;
  }

  return fulfilledCount;
}
