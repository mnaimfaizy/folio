import { connectDatabase } from '../db/database';
import type { DbClient } from '../db/types';

export type BookRow = Record<string, unknown> & {
  id: number;
  authors?: Array<Record<string, unknown>>;
};

export type AuthorRow = Record<string, unknown>;

type BookAuthorInput = { id?: number; name?: string };

type BookWriteInput = {
  title: unknown;
  isbn: unknown;
  isbn10: unknown;
  isbn13: unknown;
  publishYear: unknown;
  pages: unknown;
  genre: string | null;
  author: unknown;
  cover: unknown;
  coverKey: unknown;
  description: unknown;
  featured?: boolean;
  availableCopies?: number;
};

const getDb = async (db?: DbClient): Promise<DbClient> =>
  db ?? connectDatabase();

export const findBooks = async (
  sql: string,
  params?: unknown[],
): Promise<BookRow[]> => {
  const db = await getDb();
  return params ? db.all<BookRow>(sql, params) : db.all<BookRow>(sql);
};

export const findBookById = async (
  id: string | number,
  db?: DbClient,
): Promise<BookRow | undefined> => {
  const dbClient = await getDb(db);
  return dbClient.get<BookRow>('SELECT * FROM books WHERE id = ?', [id]);
};

export const findBookByAnyIsbn = async (
  isbn: string,
  db?: DbClient,
): Promise<BookRow | undefined> => {
  const dbClient = await getDb(db);
  return dbClient.get<BookRow>(
    'SELECT * FROM books WHERE isbn = ? OR isbn10 = ? OR isbn13 = ?',
    [isbn, isbn, isbn],
  );
};

export const findBookByIsbnCandidates = async (
  candidates: unknown[],
  db?: DbClient,
): Promise<BookRow | undefined> => {
  if (candidates.length === 0) {
    return undefined;
  }

  const dbClient = await getDb(db);
  const placeholders = candidates.map(() => '?').join(', ');
  return dbClient.get<BookRow>(
    `SELECT * FROM books WHERE isbn IN (${placeholders}) OR isbn10 IN (${placeholders}) OR isbn13 IN (${placeholders})`,
    [...candidates, ...candidates, ...candidates],
  );
};

export const findDuplicateBookByIsbnCandidates = async (
  id: string,
  candidates: unknown[],
  db?: DbClient,
): Promise<BookRow | undefined> => {
  if (candidates.length === 0) {
    return undefined;
  }

  const dbClient = await getDb(db);
  const placeholders = candidates.map(() => '?').join(', ');
  return dbClient.get<BookRow>(
    `SELECT * FROM books WHERE id != ? AND (isbn IN (${placeholders}) OR isbn10 IN (${placeholders}) OR isbn13 IN (${placeholders}))`,
    [id, ...candidates, ...candidates, ...candidates],
  );
};

export const insertBook = async (
  input: BookWriteInput,
  db?: DbClient,
): Promise<number> => {
  const dbClient = await getDb(db);
  const primaryIsbn = input.isbn13 || input.isbn10 || input.isbn || null;
  const result = await dbClient.run(
    `INSERT INTO books (title, isbn, isbn10, isbn13, publishYear, pages, genre, author, cover, cover_key, description, featured, available_copies)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      input.title,
      primaryIsbn,
      input.isbn10 || null,
      input.isbn13 || null,
      input.publishYear || null,
      typeof input.pages === 'number' ? input.pages : null,
      input.genre,
      input.author || null,
      input.cover || null,
      input.coverKey || null,
      input.description || null,
      input.featured ?? false,
      input.availableCopies ?? 1,
    ],
  );
  return result.lastID as number;
};

export const insertBookFromIsbn = async (
  input: Omit<BookWriteInput, 'featured' | 'availableCopies' | 'coverKey'>,
  db?: DbClient,
): Promise<number> => {
  const dbClient = await getDb(db);
  const primaryIsbn = input.isbn13 || input.isbn10 || input.isbn || null;
  const result = await dbClient.run(
    `INSERT INTO books (title, isbn, isbn10, isbn13, publishYear, pages, genre, author, cover, cover_key, description)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      input.title,
      primaryIsbn,
      input.isbn10 || null,
      input.isbn13 || null,
      input.publishYear || null,
      typeof input.pages === 'number' ? input.pages : null,
      input.genre,
      input.author || null,
      input.cover || null,
      null,
      input.description || null,
    ],
  );
  return result.lastID as number;
};

export const updateBook = async (
  id: string,
  input: BookWriteInput,
  fallbackFeatured: unknown,
  fallbackAvailableCopies: unknown,
  db?: DbClient,
): Promise<void> => {
  const dbClient = await getDb(db);
  const primaryIsbn = input.isbn13 || input.isbn10 || input.isbn || null;

  await dbClient.run(
    `UPDATE books
     SET title = ?, isbn = ?, isbn10 = ?, isbn13 = ?, publishYear = ?, pages = ?, genre = ?, author = ?, cover = ?, cover_key = ?, description = ?, featured = ?, available_copies = ?, updatedAt = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [
      input.title,
      primaryIsbn,
      input.isbn10 || null,
      input.isbn13 || null,
      input.publishYear || null,
      typeof input.pages === 'number' ? input.pages : null,
      input.genre,
      input.author || null,
      input.cover || null,
      input.coverKey || null,
      input.description || null,
      typeof input.featured === 'boolean' ? input.featured : fallbackFeatured,
      typeof input.availableCopies === 'number'
        ? input.availableCopies
        : fallbackAvailableCopies,
      id,
    ],
  );
};

export const deleteBook = async (id: string, db?: DbClient): Promise<void> => {
  const dbClient = await getDb(db);
  await dbClient.run('DELETE FROM books WHERE id = ?', [id]);
};

const getOrCreateAuthorId = async (
  name: string,
  db: DbClient,
): Promise<number> => {
  const existingAuthor = await db.get<{ id: number }>(
    'SELECT id FROM authors WHERE LOWER(name) = LOWER(?)',
    [name],
  );

  if (existingAuthor?.id) {
    return existingAuthor.id;
  }

  const authorResult = await db.run('INSERT INTO authors (name) VALUES (?)', [
    name,
  ]);
  return authorResult.lastID as number;
};

export const linkAuthorsToBook = async (
  bookId: number | string,
  authors: BookAuthorInput[],
  replaceExisting: boolean,
  db?: DbClient,
): Promise<void> => {
  const dbClient = await getDb(db);

  if (replaceExisting) {
    await dbClient.run('DELETE FROM author_books WHERE book_id = ?', [bookId]);
  }

  for (let i = 0; i < authors.length; i++) {
    const authorName = authors[i].name;
    if (!authorName) continue;

    const dbAuthorId =
      authors[i].id && Number.isFinite(authors[i].id)
        ? (authors[i].id as number)
        : await getOrCreateAuthorId(authorName, dbClient);

    await dbClient.run(
      'INSERT INTO author_books (author_id, book_id, is_primary) VALUES (?, ?, ?)',
      [dbAuthorId, bookId, i === 0 ? 1 : 0],
    );
  }
};

export const linkAuthorStringToBook = async (
  bookId: number | string,
  authorValue: string,
  replaceExisting: boolean,
  db?: DbClient,
): Promise<void> => {
  const dbClient = await getDb(db);
  const names = authorValue
    .split(/,\s*/)
    .filter((name: string) => name.trim() !== '');

  if (replaceExisting) {
    await dbClient.run('DELETE FROM author_books WHERE book_id = ?', [bookId]);
  }

  for (let i = 0; i < names.length; i++) {
    const authorName = names[i].trim();
    const authorId = await getOrCreateAuthorId(authorName, dbClient);
    await dbClient.run(
      'INSERT INTO author_books (author_id, book_id, is_primary) VALUES (?, ?, ?)',
      [authorId, bookId, i === 0 ? 1 : 0],
    );
  }
};

export const findUserCollectionEntry = async (
  userId: number,
  bookId: number | string,
  db?: DbClient,
): Promise<Record<string, unknown> | undefined> => {
  const dbClient = await getDb(db);
  return dbClient.get(
    'SELECT * FROM user_collections WHERE userId = ? AND bookId = ?',
    [userId, bookId],
  );
};

export const addUserCollectionEntry = async (
  userId: number,
  bookId: number,
  db?: DbClient,
): Promise<void> => {
  const dbClient = await getDb(db);
  await dbClient.run(
    'INSERT INTO user_collections (userId, bookId) VALUES (?, ?)',
    [userId, bookId],
  );
};

export const deleteUserCollectionEntry = async (
  userId: number,
  bookId: number | string,
  db?: DbClient,
): Promise<void> => {
  const dbClient = await getDb(db);
  await dbClient.run(
    'DELETE FROM user_collections WHERE userId = ? AND bookId = ?',
    [userId, bookId],
  );
};

export const findUserCollectionBooks = async (
  userId: number,
  db?: DbClient,
): Promise<BookRow[]> => {
  const dbClient = await getDb(db);
  return dbClient.all<BookRow>(
    `
      SELECT b.*
      FROM books b
      JOIN user_collections uc ON b.id = uc.bookId
      WHERE uc.userId = ?
      ORDER BY b.title
    `,
    [userId],
  );
};

export const findBookAuthors = async (
  bookId: number | string,
  db?: DbClient,
): Promise<AuthorRow[]> => {
  const dbClient = await getDb(db);
  return dbClient.all<AuthorRow>(
    `
      SELECT a.*, ab.is_primary
      FROM authors a
      JOIN author_books ab ON a.id = ab.author_id
      WHERE ab.book_id = ?
      ORDER BY ab.is_primary DESC, a.name
    `,
    [bookId],
  );
};

export const searchBooksByText = async (
  searchQuery: string,
): Promise<BookRow[]> => {
  const db = await getDb();
  return db.all<BookRow>(
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
};
