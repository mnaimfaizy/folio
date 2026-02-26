export const OPEN_LIBRARY_USER_AGENT =
  'LibraryManagementSystem/1.0 (https://example.com; library@example.com)';

export const openLibraryHeaders = {
  'User-Agent': OPEN_LIBRARY_USER_AGENT,
  Accept: 'application/json',
};

export const buildOpenLibraryIsbnLookupUrl = (isbn: string): string =>
  `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`;

export const buildOpenLibraryTitleSearchUrl = (query: string): string =>
  `https://openlibrary.org/search.json?title=${query}&limit=20`;

export const buildOpenLibraryAuthorSearchUrl = (query: string): string =>
  `https://openlibrary.org/search/authors.json?q=${query}`;

export const buildOpenLibraryAuthorWorksUrl = (
  authorKey: string,
  limit = 20,
): string =>
  `https://openlibrary.org/authors/${authorKey.replace('/authors/', '')}/works.json?limit=${limit}`;

export const buildOpenLibraryAuthorCoverUrl = (
  photoId: number | string,
): string => `https://covers.openlibrary.org/a/id/${photoId}-L.jpg`;

export const buildOpenLibraryBookCoverUrl = (
  coverId: number | string,
): string => `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`;
