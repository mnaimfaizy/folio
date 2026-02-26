import {
  ExternalAuthorResult,
  getExternalAuthorDetails,
  searchExternalAuthors,
} from './externalAuthorProviders';
import {
  ExternalBookResult,
  searchExternalBooks,
} from './externalBookProviders';

type ExternalAuthorSource = 'openlibrary' | 'wikidata' | 'googlebooks';

type ExternalBookSource =
  | 'openlibrary'
  | 'googlebooks'
  | 'isbndb'
  | 'loc'
  | 'wikidata'
  | 'worldcat';

type ExternalBookSearchType = 'title' | 'author' | 'isbn';

type ServiceError = Error & { status?: number };

const createServiceError = (message: string, status: number): ServiceError => {
  const error = new Error(message) as ServiceError;
  error.status = status;
  return error;
};

const isExternalAuthorSource = (
  value: string,
): value is ExternalAuthorSource => {
  return ['openlibrary', 'wikidata', 'googlebooks'].includes(value);
};

const isExternalBookSource = (value: string): value is ExternalBookSource => {
  return [
    'openlibrary',
    'googlebooks',
    'isbndb',
    'loc',
    'wikidata',
    'worldcat',
  ].includes(value);
};

const isExternalBookSearchType = (
  value: string,
): value is ExternalBookSearchType => {
  return ['title', 'author', 'isbn'].includes(value);
};

export const searchExternalAuthorsService = async (
  sourceValue: unknown,
  queryValue: unknown,
): Promise<ExternalAuthorResult[]> => {
  const source = String(sourceValue || '').toLowerCase();
  const query = String(queryValue || '').trim();

  if (!source || !isExternalAuthorSource(source)) {
    throw createServiceError(
      'Invalid source. Must be one of: openlibrary, wikidata, googlebooks',
      400,
    );
  }

  if (!query) {
    throw createServiceError('Query is required', 400);
  }

  return searchExternalAuthors(source, query);
};

export const getExternalAuthorDetailsService = async (
  sourceValue: unknown,
  authorIdValue: unknown,
): Promise<ExternalAuthorResult | null> => {
  const source = String(sourceValue || '').toLowerCase();
  const authorId = String(authorIdValue || '').trim();

  if (!source || !isExternalAuthorSource(source)) {
    throw createServiceError(
      'Invalid source. Must be one of: openlibrary, wikidata, googlebooks',
      400,
    );
  }

  if (!authorId) {
    throw createServiceError('Author ID is required', 400);
  }

  return getExternalAuthorDetails(source, authorId);
};

export const searchExternalBooksService = async (
  sourceValue: unknown,
  queryValue: unknown,
  typeValue: unknown,
): Promise<ExternalBookResult[]> => {
  const source = String(sourceValue || '').toLowerCase();
  const query = String(queryValue || '').trim();
  const type = String(typeValue || 'title').toLowerCase();

  if (!source || !isExternalBookSource(source)) {
    throw createServiceError('Invalid source', 400);
  }

  if (!query) {
    throw createServiceError('Query is required', 400);
  }

  if (!isExternalBookSearchType(type)) {
    throw createServiceError('Invalid search type', 400);
  }

  return searchExternalBooks(source, query, type);
};
