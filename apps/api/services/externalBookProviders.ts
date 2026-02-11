import axios from 'axios';
import config from '../config/config';

type ExternalSource =
  | 'openlibrary'
  | 'googlebooks'
  | 'isbndb'
  | 'loc'
  | 'wikidata'
  | 'worldcat';

type SearchType = 'title' | 'author' | 'isbn';

export interface ExternalBookResult {
  source: ExternalSource;
  title: string;
  authors: string[];
  isbn?: string;
  isbn10?: string;
  isbn13?: string;
  publishYear?: number;
  pages?: number;
  genre?: string;
  cover?: string;
  description?: string;
}

const USER_AGENT =
  'LibraryManagementSystem/1.0 (https://example.com; library@example.com)';
const OPEN_LIBRARY_DEBUG = process.env.OPENLIBRARY_DEBUG === 'true';

const normalizeYear = (value?: string | number | null): number | undefined => {
  if (!value) return undefined;
  if (typeof value === 'number') return value;
  const match = value.match(/\d{4}/);
  return match ? parseInt(match[0], 10) : undefined;
};

const normalizeString = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
};

const extractGenreFromOpenLibrarySubjects = (
  subjects: unknown,
): string | undefined => {
  if (!Array.isArray(subjects)) return undefined;
  for (const subject of subjects) {
    if (typeof subject === 'string') return normalizeString(subject);
    if (subject && typeof (subject as any).name === 'string') {
      return normalizeString((subject as any).name);
    }
  }
  return undefined;
};

const extractIsbns = (
  identifiers?: Array<{ type?: string; identifier?: string }>,
) => {
  if (!identifiers) return { isbn10: undefined, isbn13: undefined };
  const isbn13 = identifiers.find((id) => id.type === 'ISBN_13')?.identifier;
  const isbn10 = identifiers.find((id) => id.type === 'ISBN_10')?.identifier;
  return { isbn10, isbn13 };
};

const extractIsbnsFromList = (values?: string[]) => {
  if (!values || values.length === 0) {
    return { isbn10: undefined, isbn13: undefined };
  }
  const isbn10 = values.find((value) => value.length === 10);
  const isbn13 = values.find((value) => value.length === 13);
  return { isbn10, isbn13 };
};

const fetchOpenLibraryEditionIsbns = async (editionKey?: string) => {
  if (!editionKey) return { isbn10: undefined, isbn13: undefined };
  const response = await axios.get(
    `${config.externalBooks.openLibrary.baseUrl}/books`,
    {
      params: {
        bibkeys: `OLID:${editionKey}`,
        format: 'json',
        jscmd: 'data',
      },
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'application/json',
      },
    },
  );

  const data = response.data || {};
  if (OPEN_LIBRARY_DEBUG) {
    console.debug(
      'OpenLibrary edition response:',
      JSON.stringify(data[`OLID:${editionKey}`] || {}),
    );
  }

  const edition = data[`OLID:${editionKey}`];
  const identifiers = edition?.identifiers || {};
  const isbn10 = Array.isArray(identifiers.isbn_10)
    ? identifiers.isbn_10[0]
    : undefined;
  const isbn13 = Array.isArray(identifiers.isbn_13)
    ? identifiers.isbn_13[0]
    : undefined;

  return { isbn10, isbn13 };
};

const ensureWorldCatConfig = (): void => {
  if (!config.externalBooks.worldCat.baseUrl) {
    throw new Error('WorldCat base URL is not configured');
  }
  if (!config.externalBooks.worldCat.wsKey) {
    throw new Error('WorldCat WSKey is not configured');
  }
};

const searchOpenLibrary = async (
  query: string,
  type: SearchType,
): Promise<ExternalBookResult[]> => {
  if (type === 'isbn') {
    const response = await axios.get(
      `${config.externalBooks.openLibrary.baseUrl}/books`,
      {
        params: {
          bibkeys: `ISBN:${query}`,
          format: 'json',
          jscmd: 'data',
        },
        headers: {
          'User-Agent': USER_AGENT,
          Accept: 'application/json',
        },
      },
    );

    const data = response.data || {};
    if (OPEN_LIBRARY_DEBUG) {
      console.debug('OpenLibrary ISBN response:', JSON.stringify(data));
    }
    const book = data[`ISBN:${query}`];
    if (!book) return [];

    const isbn10Candidates =
      book.identifiers?.isbn_10 || book.isbn_10 || book.isbn10 || [];
    const isbn13Candidates =
      book.identifiers?.isbn_13 || book.isbn_13 || book.isbn13 || [];
    const isbn10 = extractIsbnsFromList(isbn10Candidates).isbn10;
    const isbn13 = extractIsbnsFromList(isbn13Candidates).isbn13;

    return [
      {
        source: 'openlibrary',
        title: book.title || 'Unknown Title',
        authors: book.authors?.map(
          (author: { name: string }) => author.name,
        ) || ['Unknown Author'],
        isbn: isbn13 || isbn10 || query,
        isbn10: isbn10 || (query.length === 10 ? query : undefined),
        isbn13: isbn13 || (query.length === 13 ? query : undefined),
        publishYear: normalizeYear(book.publish_date),
        pages:
          typeof (book as any).number_of_pages === 'number'
            ? (book as any).number_of_pages
            : undefined,
        genre: extractGenreFromOpenLibrarySubjects((book as any).subjects),
        cover: book.cover?.medium || book.cover?.large || book.cover?.small,
        description:
          typeof book.description === 'string'
            ? book.description
            : book.description?.value,
      },
    ];
  }

  const params: Record<string, string> = { limit: '10' };
  if (type === 'title') params.title = query;
  if (type === 'author') params.author = query;

  const response = await axios.get(
    `${config.externalBooks.openLibrary.searchUrl}`,
    {
      params,
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'application/json',
      },
    },
  );

  if (OPEN_LIBRARY_DEBUG) {
    console.debug(
      'OpenLibrary search response:',
      JSON.stringify(response.data?.docs?.slice(0, 3) || []),
    );
  }

  const docs = response.data?.docs || [];
  const slicedDocs = docs.slice(0, 10);
  return Promise.all(
    slicedDocs.map(async (doc: any) => {
      const { isbn10, isbn13 } = extractIsbnsFromList(doc.isbn);
      let finalIsbn10 = isbn10;
      let finalIsbn13 = isbn13;

      if (!finalIsbn10 && !finalIsbn13) {
        const editionKey = doc.cover_edition_key || doc.lending_edition_s;
        const editionIsbns = await fetchOpenLibraryEditionIsbns(editionKey);
        finalIsbn10 = editionIsbns.isbn10;
        finalIsbn13 = editionIsbns.isbn13;
      }

      return {
        source: 'openlibrary',
        title: doc.title || 'Unknown Title',
        authors: doc.author_name || ['Unknown Author'],
        isbn: finalIsbn13 || finalIsbn10 || doc.isbn?.[0],
        isbn10: finalIsbn10,
        isbn13: finalIsbn13,
        publishYear: doc.first_publish_year,
        pages:
          typeof doc.number_of_pages_median === 'number'
            ? doc.number_of_pages_median
            : undefined,
        genre:
          normalizeString(
            Array.isArray(doc.subject)
              ? doc.subject[0]
              : Array.isArray(doc.subject_facet)
                ? doc.subject_facet[0]
                : undefined,
          ) || undefined,
        cover: doc.cover_i
          ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
          : undefined,
      };
    }),
  );
};

const searchGoogleBooks = async (
  query: string,
  type: SearchType,
): Promise<ExternalBookResult[]> => {
  const apiKey = config.externalBooks.googleBooks.apiKey;
  if (!apiKey) {
    throw new Error('Google Books API key is not configured');
  }

  const q =
    type === 'isbn'
      ? `isbn:${query}`
      : type === 'author'
        ? `inauthor:${query}`
        : `intitle:${query}`;

  const response = await axios.get(
    `${config.externalBooks.googleBooks.baseUrl}/volumes`,
    {
      params: {
        q,
        maxResults: 10,
        key: apiKey,
      },
    },
  );

  const items = response.data?.items || [];
  return items.map((item: any) => {
    const { isbn10, isbn13 } = extractIsbns(
      item.volumeInfo?.industryIdentifiers,
    );
    return {
      source: 'googlebooks',
      title: item.volumeInfo?.title || 'Unknown Title',
      authors: item.volumeInfo?.authors || ['Unknown Author'],
      isbn: isbn13 || isbn10,
      isbn10,
      isbn13,
      publishYear: normalizeYear(item.volumeInfo?.publishedDate),
      pages:
        typeof item.volumeInfo?.pageCount === 'number'
          ? item.volumeInfo.pageCount
          : undefined,
      genre: Array.isArray(item.volumeInfo?.categories)
        ? normalizeString(item.volumeInfo.categories[0])
        : undefined,
      cover: item.volumeInfo?.imageLinks?.thumbnail,
      description: item.volumeInfo?.description,
    };
  });
};

const searchIsbnDb = async (
  query: string,
  type: SearchType,
): Promise<ExternalBookResult[]> => {
  const apiKey = config.externalBooks.isbnDb.apiKey;
  if (!apiKey) {
    throw new Error('ISBNdb API key is not configured');
  }

  const baseUrl = config.externalBooks.isbnDb.baseUrl;
  const headers = {
    Authorization: apiKey,
    Accept: 'application/json',
  };

  if (type === 'isbn') {
    const response = await axios.get(`${baseUrl}/book/${query}`, { headers });
    const book = response.data?.book;
    if (!book) return [];

    const isbn10 =
      book.isbn10 || (book.isbn?.length === 10 ? book.isbn : undefined);
    const isbn13 =
      book.isbn13 || (book.isbn?.length === 13 ? book.isbn : undefined);

    return [
      {
        source: 'isbndb',
        title: book.title || 'Unknown Title',
        authors: book.authors || ['Unknown Author'],
        isbn: isbn13 || isbn10 || query,
        isbn10,
        isbn13,
        publishYear: normalizeYear(book.date_published),
        cover: book.image,
        description: book.synopsis,
      },
    ];
  }

  const response = await axios.get(
    `${baseUrl}/books/${encodeURIComponent(query)}`,
    {
      headers,
    },
  );

  const books = response.data?.books || [];
  return books.slice(0, 10).map((book: any) => {
    const isbn10 =
      book.isbn10 || (book.isbn?.length === 10 ? book.isbn : undefined);
    const isbn13 =
      book.isbn13 || (book.isbn?.length === 13 ? book.isbn : undefined);
    return {
      source: 'isbndb',
      title: book.title || 'Unknown Title',
      authors: book.authors || ['Unknown Author'],
      isbn: isbn13 || isbn10 || book.isbn,
      isbn10,
      isbn13,
      publishYear: normalizeYear(book.date_published),
      cover: book.image,
      description: book.synopsis,
    };
  });
};

const searchLibraryOfCongress = async (
  query: string,
  type: SearchType,
): Promise<ExternalBookResult[]> => {
  const baseUrl = config.externalBooks.loc.baseUrl;
  const params: Record<string, string> = {
    fo: 'json',
    q: query,
  };

  if (type === 'author') {
    params.fa = `contributor:${query}`;
  }

  const response = await axios.get(baseUrl, { params });
  const results = response.data?.results || [];

  return results.slice(0, 10).map((item: any) => ({
    source: 'loc',
    title: item.title || 'Unknown Title',
    authors:
      item.creator && Array.isArray(item.creator)
        ? item.creator
        : item.creator
          ? [item.creator]
          : ['Unknown Author'],
    isbn: undefined,
    publishYear: normalizeYear(item.date),
    cover: Array.isArray(item.image_url) ? item.image_url[0] : undefined,
    description: item.description,
  }));
};

const searchWikidata = async (
  query: string,
  type: SearchType,
): Promise<ExternalBookResult[]> => {
  const endpoint = config.externalBooks.wikidata.endpoint;
  const escaped = query.replace(/"/g, '\\"');

  const filter =
    type === 'isbn'
      ? `FILTER(?isbn = "${escaped}")`
      : type === 'author'
        ? `FILTER(CONTAINS(LCASE(?authorLabel), LCASE("${escaped}")))`
        : `FILTER(CONTAINS(LCASE(?itemLabel), LCASE("${escaped}")))`;

  const sparql = `
    SELECT ?itemLabel ?authorLabel ?isbn ?pubYear WHERE {
      ?item wdt:P31/wdt:P279* wd:Q571.
      OPTIONAL { ?item wdt:P50 ?author. }
      OPTIONAL { ?item wdt:P212 ?isbn. }
      OPTIONAL { ?item wdt:P577 ?pubDate. }
      BIND(YEAR(?pubDate) AS ?pubYear)
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
      ${filter}
    }
    LIMIT 10
  `;

  const response = await axios.get(endpoint, {
    params: {
      format: 'json',
      query: sparql,
    },
    headers: {
      Accept: 'application/sparql-results+json',
    },
  });

  const bindings = response.data?.results?.bindings || [];
  return bindings.map((binding: any) => ({
    source: 'wikidata',
    title: binding.itemLabel?.value || 'Unknown Title',
    authors: binding.authorLabel?.value
      ? [binding.authorLabel.value]
      : ['Unknown Author'],
    isbn: binding.isbn?.value,
    publishYear: binding.pubYear?.value
      ? parseInt(binding.pubYear.value, 10)
      : undefined,
  }));
};

const searchWorldCat = async (
  query: string,
  type: SearchType,
): Promise<ExternalBookResult[]> => {
  ensureWorldCatConfig();

  const baseUrl = config.externalBooks.worldCat.baseUrl;
  const wsKey = config.externalBooks.worldCat.wsKey;
  const q = type === 'isbn' ? `bn:${query}` : query;

  const response = await axios.get(`${baseUrl}/search/worldcat/opensearch`, {
    params: {
      q,
      wskey: wsKey,
    },
    headers: {
      Accept: 'application/json',
    },
  });

  const entries = response.data?.entries || response.data?.feed?.entry || [];
  if (!Array.isArray(entries)) return [];

  return entries.slice(0, 10).map((entry: any) => ({
    source: 'worldcat',
    title: entry.title?.[0]?._ || entry.title || 'Unknown Title',
    authors: entry.author?.[0]?.name
      ? [entry.author[0].name]
      : ['Unknown Author'],
    isbn: undefined,
    publishYear: undefined,
  }));
};

export const searchExternalBooks = async (
  source: ExternalSource,
  query: string,
  type: SearchType,
): Promise<ExternalBookResult[]> => {
  switch (source) {
    case 'openlibrary':
      return searchOpenLibrary(query, type);
    case 'googlebooks':
      return searchGoogleBooks(query, type);
    case 'isbndb':
      return searchIsbnDb(query, type);
    case 'loc':
      return searchLibraryOfCongress(query, type);
    case 'wikidata':
      return searchWikidata(query, type);
    case 'worldcat':
      return searchWorldCat(query, type);
    default:
      return [];
  }
};
