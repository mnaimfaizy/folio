import axios from 'axios';
import {
  buildOpenLibraryAuthorSearchUrl,
  buildOpenLibraryAuthorWorksUrl,
  buildOpenLibraryBookCoverUrl,
  buildOpenLibraryIsbnLookupUrl,
  buildOpenLibraryTitleSearchUrl,
  openLibraryHeaders,
} from './openLibraryClient';

export interface OpenLibraryAuthor {
  name: string;
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
  description?: string | { value?: string };
}

interface OpenLibraryApiBook {
  title?: string;
  publish_date?: string;
  number_of_pages?: number;
  cover?: { medium?: string };
  description?: string | { value?: string };
  publishers?: string[];
  subjects?: Array<string | { name?: string }>;
  identifiers?: { isbn_10?: string[]; isbn_13?: string[] };
  isbn_10?: string[];
  isbn_13?: string[];
  authors?: Array<OpenLibraryAuthor>;
}

export interface OpenLibraryNormalizedBook {
  title: string;
  publishYear: number | null;
  pages: number | null;
  cover: string | null;
  description: string | null;
  subjects: string[];
  publisher: string | null;
  genre?: string;
  isbn10: string | null;
  isbn13: string | null;
  primaryIsbn: string;
  authors: OpenLibraryAuthor[];
  authorString: string;
}

export interface OpenLibraryTitleSearchBook {
  title: string;
  author: string;
  firstPublishYear: number | null;
  isbn: string | null;
  isbn10: string | null;
  isbn13: string | null;
  coverId: number | null;
  cover: string | null;
  key?: string;
  url: string;
  languages: string[];
  publishers: string[];
}

export interface OpenLibraryTitleSearchResponse {
  books: OpenLibraryTitleSearchBook[];
  total: number;
  offset?: number;
  limit: number;
}

export interface OpenLibraryAuthorWorkBook {
  title: string;
  author: string;
  workKey?: string;
  coverId: number | null;
  cover: string | null;
  firstPublishYear: number | null;
  url: string;
  description: string | null;
}

export type OpenLibraryAuthorSearchResponse =
  | { kind: 'no-authors' }
  | { kind: 'no-books' }
  | {
      kind: 'ok';
      author: string;
      books: OpenLibraryAuthorWorkBook[];
      total: number;
    };

export const fetchOpenLibraryBookByIsbn = async (
  isbn: string,
): Promise<OpenLibraryNormalizedBook | null> => {
  const response = await axios.get(buildOpenLibraryIsbnLookupUrl(isbn), {
    headers: openLibraryHeaders,
  });

  const bookKey = `ISBN:${isbn}`;
  if (!response.data[bookKey]) {
    return null;
  }

  const bookData = response.data[bookKey] as OpenLibraryApiBook;

  if (!bookData.title || !Array.isArray(bookData.authors)) {
    throw new Error('Invalid book data received from API');
  }

  const description =
    typeof bookData.description === 'string'
      ? bookData.description
      : bookData.description && typeof bookData.description.value === 'string'
        ? bookData.description.value
        : null;

  const subjects = Array.isArray(bookData.subjects)
    ? bookData.subjects
        .map((subject) =>
          typeof subject === 'string'
            ? subject
            : subject && typeof subject.name === 'string'
              ? subject.name
              : null,
        )
        .filter(
          (value): value is string =>
            typeof value === 'string' && value.trim() !== '',
        )
    : [];

  const genre = subjects[0];

  const identifierData = bookData.identifiers || {};
  const isbn10 = Array.isArray(identifierData.isbn_10)
    ? identifierData.isbn_10[0]
    : bookData.isbn_10?.[0] || null;
  const isbn13 = Array.isArray(identifierData.isbn_13)
    ? identifierData.isbn_13[0]
    : bookData.isbn_13?.[0] || null;

  const authors = bookData.authors.map((author) => ({
    name: author.name,
    url: author.url,
  }));

  return {
    title: bookData.title,
    publishYear: bookData.publish_date
      ? parseInt(bookData.publish_date.slice(-4))
      : null,
    pages:
      typeof bookData.number_of_pages === 'number'
        ? bookData.number_of_pages
        : null,
    cover: bookData.cover?.medium || null,
    description,
    subjects,
    publisher: bookData.publishers?.[0] || null,
    genre,
    isbn10,
    isbn13,
    primaryIsbn: isbn13 || isbn10 || isbn,
    authors,
    authorString: authors.map((a) => a.name).join(', '),
  };
};

export const searchOpenLibraryByTitle = async (
  searchQuery: string,
): Promise<OpenLibraryTitleSearchResponse | null> => {
  const response = await axios.get(
    buildOpenLibraryTitleSearchUrl(searchQuery),
    {
      headers: openLibraryHeaders,
    },
  );

  if (!response.data.docs || response.data.docs.length === 0) {
    return null;
  }

  const books = response.data.docs.map((book: OpenLibrarySearchResult) => {
    const isbn10 = book.isbn?.find((value) => value.length === 10) || null;
    const isbn13 = book.isbn?.find((value) => value.length === 13) || null;

    return {
      title: book.title || 'Unknown Title',
      author: book.author_name ? book.author_name.join(', ') : 'Unknown Author',
      firstPublishYear: book.first_publish_year || null,
      isbn: isbn13 || isbn10 || book.isbn?.[0] || null,
      isbn10,
      isbn13,
      coverId: book.cover_i || null,
      cover: book.cover_i ? buildOpenLibraryBookCoverUrl(book.cover_i) : null,
      key: book.key,
      url: `https://openlibrary.org${book.key}`,
      languages: book.language || [],
      publishers: book.publisher || [],
    };
  });

  return {
    books,
    total: response.data.numFound,
    offset: response.data.start,
    limit: books.length,
  };
};

export const searchOpenLibraryByAuthor = async (
  searchQuery: string,
): Promise<OpenLibraryAuthorSearchResponse> => {
  const authorsResponse = await axios.get(
    buildOpenLibraryAuthorSearchUrl(searchQuery),
    {
      headers: openLibraryHeaders,
    },
  );

  if (!authorsResponse.data.docs || authorsResponse.data.docs.length === 0) {
    return { kind: 'no-authors' };
  }

  const authorName = authorsResponse.data.docs[0].name || 'Unknown Author';
  const authorKey = authorsResponse.data.docs[0].key;
  const worksResponse = await axios.get(
    buildOpenLibraryAuthorWorksUrl(authorKey),
    {
      headers: openLibraryHeaders,
    },
  );

  if (!worksResponse.data.entries || worksResponse.data.entries.length === 0) {
    return { kind: 'no-books' };
  }

  const books = worksResponse.data.entries.map((work: OpenLibraryWork) => {
    const description =
      typeof work.description === 'string'
        ? work.description
        : work.description?.value || null;

    return {
      title: work.title || 'Unknown Title',
      author: authorName,
      workKey: work.key,
      coverId: work.covers?.[0] || null,
      cover: work.covers?.[0]
        ? buildOpenLibraryBookCoverUrl(work.covers[0])
        : null,
      firstPublishYear: work.first_publish_year || null,
      url: `https://openlibrary.org${work.key}`,
      description,
    };
  });

  return {
    kind: 'ok',
    author: authorName,
    books,
    total: worksResponse.data.size || books.length,
  };
};
