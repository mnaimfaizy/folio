import {
  BookRow,
  findBookAuthors,
  findBookById,
  findBooks,
  searchBooksByText,
} from '../repositories/booksRepository';

interface GetAllBooksOptions {
  genre?: unknown;
  year?: unknown;
  sortBy?: unknown;
  sortOrder?: unknown;
}

const attachAuthors = async (books: BookRow[]): Promise<BookRow[]> => {
  for (const book of books) {
    const authors = await findBookAuthors(book.id);
    book.authors = authors;
  }

  return books;
};

export const getAllBooksService = async (
  options: GetAllBooksOptions,
): Promise<BookRow[]> => {
  const { genre, year, sortBy = 'title', sortOrder = 'asc' } = options;

  const conditions: string[] = [];
  const params: unknown[] = [];

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

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  let orderByClause = 'ORDER BY title ASC';
  const validSortBy = ['title', 'author', 'publishYear'];
  const validSortOrder = ['asc', 'desc'];

  if (
    typeof sortBy === 'string' &&
    validSortBy.includes(sortBy.toLowerCase())
  ) {
    const column = sortBy;
    const order =
      typeof sortOrder === 'string' &&
      validSortOrder.includes(sortOrder.toLowerCase())
        ? sortOrder.toUpperCase()
        : 'ASC';
    orderByClause = `ORDER BY ${column} ${order}`;
  }

  const booksQuery = `SELECT * FROM books ${whereClause} ${orderByClause}`;
  const books =
    params.length > 0
      ? await findBooks(booksQuery, params)
      : await findBooks(booksQuery);

  return attachAuthors(books);
};

export const getFeaturedBooksService = async (): Promise<BookRow[]> => {
  const books = await findBooks(
    'SELECT * FROM books WHERE featured = true ORDER BY updated_at DESC',
  );

  return attachAuthors(books);
};

export const getBookByIdService = async (
  id: string,
): Promise<BookRow | undefined> => {
  const book = await findBookById(id);

  if (!book) {
    return undefined;
  }

  book.authors = await findBookAuthors(id);
  return book;
};

export const searchBooksService = async (query: string): Promise<BookRow[]> => {
  const books = await searchBooksByText(`%${query}%`);
  return attachAuthors(books);
};
