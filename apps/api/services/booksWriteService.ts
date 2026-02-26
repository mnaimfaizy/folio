import { UTApi } from 'uploadthing/server';
import { connectDatabase } from '../db/database';
import type { DbClient } from '../db/types';
import {
  addUserCollectionEntry,
  deleteBook,
  deleteUserCollectionEntry,
  findBookAuthors,
  findBookByAnyIsbn,
  findBookById,
  findBookByIsbnCandidates,
  findDuplicateBookByIsbnCandidates,
  findUserCollectionBooks,
  findUserCollectionEntry,
  insertBook,
  insertBookFromIsbn,
  linkAuthorsToBook,
  linkAuthorStringToBook,
  updateBook,
} from '../repositories/booksRepository';
import { fetchOpenLibraryBookByIsbn } from './openLibraryBookProvider';
import { autoFulfillRequestsForBook } from './requestMatchingService';

type ServiceBook = Record<string, unknown> & {
  id: number;
  authors?: Array<Record<string, unknown>>;
  cover?: unknown;
  coverKey?: unknown;
  cover_key?: unknown;
  featured?: unknown;
  available_copies?: unknown;
  availableCopies?: unknown;
};

type ServiceError = Error & { status?: number };

const createServiceError = (message: string, status: number): ServiceError => {
  const error = new Error(message) as ServiceError;
  error.status = status;
  return error;
};

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
    return normalized;
  }

  return normalized;
}

async function addBookToUserCollection(
  db: DbClient,
  userId: number,
  bookId: number,
): Promise<void> {
  const existingEntry = await findUserCollectionEntry(userId, bookId, db);

  if (existingEntry) {
    return;
  }

  await addUserCollectionEntry(userId, bookId, db);
}

export const createBookManuallyService = async (
  payload: Record<string, unknown>,
  userId?: number,
): Promise<{ status: number; message: string; book: ServiceBook }> => {
  const {
    title,
    isbn,
    isbn10,
    isbn13,
    publishYear,
    pages,
    genre,
    author,
    cover,
    coverKey,
    description,
    authors,
    addToCollection,
    featured,
    availableCopies,
  } = payload;

  const db = await connectDatabase();
  const canonicalGenre = await resolveCanonicalGenre(db, genre);

  const isbnCandidates = [isbn, isbn10, isbn13].filter(Boolean);
  if (isbnCandidates.length > 0) {
    const existingBook = await findBookByIsbnCandidates(isbnCandidates, db);

    if (existingBook) {
      if (userId) {
        await addBookToUserCollection(db, userId, existingBook.id as number);
        const bookAuthors = await findBookAuthors(existingBook.id as number);
        existingBook.authors = bookAuthors;

        return {
          status: 200,
          message: 'Book already exists and has been added to your collection',
          book: existingBook,
        };
      }

      return {
        status: 200,
        message: 'Book already exists',
        book: existingBook,
      };
    }
  }

  await db.run('BEGIN TRANSACTION');

  try {
    const primaryIsbn = isbn13 || isbn10 || isbn || null;
    const bookId = await insertBook(
      {
        title,
        isbn: primaryIsbn,
        isbn10,
        isbn13,
        publishYear,
        pages,
        genre: canonicalGenre,
        author,
        cover,
        coverKey,
        description,
        featured: typeof featured === 'boolean' ? featured : false,
        availableCopies:
          typeof availableCopies === 'number' && availableCopies >= 0
            ? Math.floor(availableCopies)
            : 1,
      },
      db,
    );

    if (Array.isArray(authors) && authors.length > 0) {
      await linkAuthorsToBook(
        bookId,
        (authors as Array<{ name?: string; id?: number }>).map((item) => ({
          id: item.id,
          name: item.name,
        })),
        false,
        db,
      );
    } else if (typeof author === 'string' && author.trim()) {
      await linkAuthorStringToBook(bookId, author, false, db);
    }

    await db.run('COMMIT');

    const newBook = await findBookById(String(bookId), db);
    const bookAuthors = await findBookAuthors(bookId);
    if (!newBook) {
      throw createServiceError('Book not found', 404);
    }
    newBook.authors = bookAuthors;

    try {
      await autoFulfillRequestsForBook(db, bookId);
    } catch (matchError) {
      console.warn('Failed to auto-fulfill matching requests', matchError);
    }

    if (addToCollection && userId) {
      await addBookToUserCollection(db, userId, bookId);
      return {
        status: 201,
        message: 'Book created successfully and added to your collection',
        book: newBook,
      };
    }

    return {
      status: 201,
      message: 'Book created successfully',
      book: newBook,
    };
  } catch (error) {
    await db.run('ROLLBACK');
    throw error;
  }
};

export const createBookByIsbnService = async (
  isbn: string,
  addToCollection: unknown,
  userId?: number,
): Promise<{ status: number; message: string; book: ServiceBook }> => {
  const db = await connectDatabase();

  const existingBook = await findBookByAnyIsbn(isbn, db);

  if (existingBook) {
    if (addToCollection && userId) {
      await addBookToUserCollection(db, userId, existingBook.id as number);
      const bookAuthors = await findBookAuthors(existingBook.id as number);
      existingBook.authors = bookAuthors;
    }

    return {
      status: 200,
      message: 'Book already exists',
      book: existingBook,
    };
  }

  const openLibraryBook = await fetchOpenLibraryBookByIsbn(isbn);
  if (!openLibraryBook) {
    throw createServiceError('Book not found with this ISBN', 404);
  }

  const {
    title,
    publishYear,
    pages,
    cover,
    description,
    genre,
    isbn10,
    isbn13,
    primaryIsbn,
    authors,
    authorString,
  } = openLibraryBook;

  const canonicalGenre = await resolveCanonicalGenre(db, genre);

  await db.run('BEGIN TRANSACTION');

  try {
    const bookId = await insertBookFromIsbn(
      {
        title,
        isbn: primaryIsbn,
        isbn10,
        isbn13,
        publishYear,
        pages,
        genre: canonicalGenre,
        author: authorString,
        cover,
        description,
      },
      db,
    );

    await linkAuthorsToBook(
      bookId,
      authors.map((item) => ({ name: item.name })),
      false,
      db,
    );

    await db.run('COMMIT');

    const newBook = await findBookById(String(bookId), db);
    const bookAuthors = await findBookAuthors(bookId);
    if (!newBook) {
      throw createServiceError('Book not found', 404);
    }
    newBook.authors = bookAuthors;

    try {
      await autoFulfillRequestsForBook(db, bookId);
    } catch (matchError) {
      console.warn('Failed to auto-fulfill matching requests', matchError);
    }

    if (addToCollection && userId) {
      await addBookToUserCollection(db, userId, bookId);
      return {
        status: 201,
        message:
          'Book created successfully from ISBN and added to your collection',
        book: newBook,
      };
    }

    return {
      status: 201,
      message: 'Book created successfully from ISBN',
      book: newBook,
    };
  } catch (error) {
    await db.run('ROLLBACK');
    throw error;
  }
};

export const updateBookService = async (
  id: string,
  payload: Record<string, unknown>,
): Promise<{ message: string; book: ServiceBook }> => {
  const {
    title,
    isbn,
    isbn10,
    isbn13,
    publishYear,
    pages,
    genre,
    author,
    cover,
    coverKey,
    description,
    authors,
    featured,
    availableCopies,
  } = payload;

  const normalizedCover: string | null =
    typeof cover === 'string'
      ? cover.trim() === ''
        ? null
        : cover
      : ((cover as string | null) ?? null);
  const normalizedCoverKey: string | null =
    typeof coverKey === 'string'
      ? coverKey.trim() === ''
        ? null
        : coverKey
      : ((coverKey as string | null) ?? null);

  const db = await connectDatabase();
  const canonicalGenre = await resolveCanonicalGenre(db, genre);

  const book = await findBookById(id, db);
  if (!book) {
    throw createServiceError('Book not found', 404);
  }

  const previousCoverUrl: string | null =
    typeof book.cover === 'string' ? book.cover : null;
  const previousCoverKey: string | null =
    typeof book.coverKey === 'string'
      ? book.coverKey
      : typeof book.cover_key === 'string'
        ? book.cover_key
        : null;

  const shouldDeletePreviousCover =
    !!previousCoverKey &&
    ((normalizedCover === null && normalizedCoverKey === null) ||
      (normalizedCoverKey !== null &&
        normalizedCoverKey !== previousCoverKey) ||
      (normalizedCoverKey === null && normalizedCover !== previousCoverUrl));

  const isbnCandidates = [isbn, isbn10, isbn13].filter(Boolean);
  if (isbnCandidates.length > 0) {
    const existingBook = await findDuplicateBookByIsbnCandidates(
      id,
      isbnCandidates,
      db,
    );
    if (existingBook) {
      throw createServiceError('Book with this ISBN already exists', 400);
    }
  }

  await db.run('BEGIN TRANSACTION');

  try {
    await updateBook(
      id,
      {
        title,
        isbn,
        isbn10,
        isbn13,
        publishYear,
        pages,
        genre: canonicalGenre,
        author,
        cover: normalizedCover,
        coverKey: normalizedCoverKey,
        description,
        featured: typeof featured === 'boolean' ? featured : undefined,
        availableCopies:
          typeof availableCopies === 'number' && availableCopies >= 0
            ? Math.floor(availableCopies)
            : undefined,
      },
      book.featured ?? false,
      book.available_copies ?? book.availableCopies ?? 1,
      db,
    );

    if (Array.isArray(authors)) {
      await linkAuthorsToBook(
        id,
        (authors as Array<{ name?: string; id?: number }>).map((item) => ({
          id: item.id,
          name: item.name,
        })),
        true,
        db,
      );
    } else if (typeof author === 'string' && author.trim()) {
      await linkAuthorStringToBook(id, author, true, db);
    }

    await db.run('COMMIT');

    if (shouldDeletePreviousCover && previousCoverKey) {
      try {
        const utapi = new UTApi();
        await utapi.deleteFiles(previousCoverKey);
      } catch (cleanupError) {
        console.warn(
          'Failed to delete previous cover from UploadThing',
          cleanupError,
        );
      }
    }

    const updatedBook = await findBookById(id, db);
    const bookAuthors = await findBookAuthors(id);
    if (!updatedBook) {
      throw createServiceError('Book not found', 404);
    }
    updatedBook.authors = bookAuthors;

    try {
      await autoFulfillRequestsForBook(db, Number(id));
    } catch (matchError) {
      console.warn('Failed to auto-fulfill matching requests', matchError);
    }

    return {
      message: 'Book updated successfully',
      book: updatedBook,
    };
  } catch (error) {
    await db.run('ROLLBACK');
    throw error;
  }
};

export const deleteBookService = async (id: string): Promise<void> => {
  const db = await connectDatabase();
  const book = await findBookById(id, db);

  if (!book) {
    throw createServiceError('Book not found', 404);
  }

  const coverKey: string | null =
    typeof book.coverKey === 'string'
      ? book.coverKey
      : typeof book.cover_key === 'string'
        ? book.cover_key
        : null;

  if (coverKey) {
    try {
      const utapi = new UTApi();
      await utapi.deleteFiles(coverKey);
    } catch (cleanupError) {
      console.warn('Failed to delete cover from UploadThing', cleanupError);
    }
  }

  await deleteBook(id, db);
};

export const addToUserCollectionService = async (
  userId: number,
  bookId: number,
): Promise<void> => {
  const db = await connectDatabase();
  const book = await findBookById(bookId, db);

  if (!book) {
    throw createServiceError('Book not found', 404);
  }

  await addBookToUserCollection(db, userId, bookId);
};

export const removeFromUserCollectionService = async (
  userId: number,
  bookId: string,
): Promise<void> => {
  const db = await connectDatabase();
  const userBook = await findUserCollectionEntry(userId, bookId, db);

  if (!userBook) {
    throw createServiceError('Book not found in your collection', 404);
  }

  await deleteUserCollectionEntry(userId, bookId, db);
};

export const getUserCollectionService = async (
  userId: number,
): Promise<ServiceBook[]> => {
  const db = await connectDatabase();
  const books = await findUserCollectionBooks(userId, db);

  for (const book of books as ServiceBook[]) {
    const authors = await findBookAuthors(book.id);
    book.authors = authors;
  }

  return books as ServiceBook[];
};
