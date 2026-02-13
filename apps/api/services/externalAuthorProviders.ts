import axios from 'axios';
import config from '../config/config';

type ExternalSource = 'openlibrary' | 'wikidata' | 'googlebooks';

export interface ExternalAuthorResult {
  source: ExternalSource;
  name: string;
  key?: string;
  externalId?: string;
  biography?: string;
  birthDate?: string;
  deathDate?: string;
  photoUrl?: string;
  alternateNames?: string[];
  topWorks?: string[];
  workCount?: number;
  links?: {
    wikipedia?: string;
    website?: string;
    [key: string]: string | undefined;
  };
}

const USER_AGENT =
  'LibraryManagementSystem/1.0 (https://example.com; library@example.com)';

const normalizeString = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
};

const normalizeDate = (value: unknown): string | undefined => {
  if (!value) return undefined;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return undefined;

    // Keep historical/special formats as-is (e.g., "6th cent. B.C.", "c. 1564")
    if (
      /\d+(st|nd|rd|th)\s+(cent|century)/i.test(trimmed) || // "6th century", "2nd cent."
      /^c\.?\s*\d{4}/.test(trimmed) || // "c. 1564", "c.1564"
      /B\.?C\.?|A\.?D\.?|BCE|CE/i.test(trimmed) // BC, AD, BCE, CE
    ) {
      return trimmed;
    }

    // Extract year from ISO date format (YYYY-MM-DD)
    const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) return isoMatch[1];

    // Extract 4-digit year from other formats
    const yearMatch = trimmed.match(/\d{4}/);
    if (yearMatch) return yearMatch[0];

    // Return as-is if it doesn't match known patterns
    return trimmed;
  }
  return undefined;
};

/**
 * Search for authors in OpenLibrary
 */
const searchOpenLibrary = async (
  query: string,
): Promise<ExternalAuthorResult[]> => {
  const searchUrl = `https://openlibrary.org/search/authors.json`;

  const response = await axios.get(searchUrl, {
    params: {
      q: query,
      limit: 10,
    },
    headers: {
      'User-Agent': USER_AGENT,
      Accept: 'application/json',
    },
  });

  const docs = response.data?.docs || [];

  return docs.map((author: any) => {
    // Process alternate names - filter and deduplicate
    const alternateNames = Array.isArray(author.alternate_names)
      ? author.alternate_names
          .filter((n: unknown) => typeof n === 'string' && n.trim())
          .filter(
            (name: string, index: number, self: string[]) =>
              self.indexOf(name) === index, // Remove duplicates
          )
          .slice(0, 15) // Limit to 15 most relevant alternate names
      : undefined;

    const result: ExternalAuthorResult = {
      source: 'openlibrary',
      name: author.name || 'Unknown Author',
      key: author.key,
      externalId: author.key,
      birthDate: normalizeDate(author.birth_date),
      deathDate: normalizeDate(author.death_date),
      topWorks: author.top_work ? [author.top_work] : undefined,
      workCount: typeof author.work_count === 'number' ? author.work_count : 0,
      alternateNames,
    };

    // Add photo URL if available
    if (author.photos && Array.isArray(author.photos) && author.photos[0]) {
      result.photoUrl = `https://covers.openlibrary.org/a/id/${author.photos[0]}-L.jpg`;
    }

    return result;
  });
};

/**
 * Get detailed author information from OpenLibrary by key
 */
const getOpenLibraryAuthorDetails = async (
  authorKey: string,
): Promise<ExternalAuthorResult | null> => {
  try {
    // Clean the author key
    const cleanKey = authorKey.replace('/authors/', '');
    const authorUrl = `https://openlibrary.org/authors/${cleanKey}.json`;

    const response = await axios.get(authorUrl, {
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'application/json',
      },
    });

    const author = response.data;
    if (!author) return null;

    const result: ExternalAuthorResult = {
      source: 'openlibrary',
      name: author.name || 'Unknown Author',
      key: author.key,
      externalId: author.key,
      birthDate: normalizeDate(author.birth_date),
      deathDate: normalizeDate(author.death_date),
      alternateNames: Array.isArray(author.alternate_names)
        ? author.alternate_names
        : undefined,
      links: {},
    };

    // Extract biography
    if (author.bio) {
      result.biography =
        typeof author.bio === 'string'
          ? author.bio
          : typeof author.bio === 'object' && author.bio.value
            ? author.bio.value
            : undefined;
    }

    // Add photo URL if available
    if (Array.isArray(author.photos) && author.photos[0]) {
      result.photoUrl = `https://covers.openlibrary.org/a/id/${author.photos[0]}-L.jpg`;
    }

    // Add links
    if (author.links && Array.isArray(author.links)) {
      author.links.forEach((link: any) => {
        if (link.url && link.title) {
          if (result.links) {
            result.links[link.title.toLowerCase()] = link.url;
          }
        }
      });
    }

    // Add Wikipedia link if available
    if (author.wikipedia) {
      if (result.links) {
        result.links.wikipedia = author.wikipedia;
      }
    }

    // Fetch works count
    try {
      const worksUrl = `https://openlibrary.org/authors/${cleanKey}/works.json?limit=1`;
      const worksResponse = await axios.get(worksUrl, {
        headers: {
          'User-Agent': USER_AGENT,
          Accept: 'application/json',
        },
      });
      result.workCount = worksResponse.data?.size || 0;

      // Get top works
      if (
        worksResponse.data?.entries &&
        Array.isArray(worksResponse.data.entries)
      ) {
        result.topWorks = worksResponse.data.entries
          .slice(0, 5)
          .map((work: any) => work.title)
          .filter(Boolean);
      }
    } catch (error) {
      // Ignore errors fetching works
    }

    return result;
  } catch (error) {
    console.error('Error fetching OpenLibrary author details:', error);
    return null;
  }
};

/**
 * Search for authors in Wikidata
 */
const searchWikidata = async (
  query: string,
): Promise<ExternalAuthorResult[]> => {
  const endpoint = config.externalBooks.wikidata.endpoint;
  const escaped = query.replace(/"/g, '\\"');

  const sparql = `
    SELECT DISTINCT ?author ?authorLabel ?birthDate ?deathDate ?description ?image WHERE {
      ?author wdt:P31 wd:Q5.  # instance of human
      ?author wdt:P106/wdt:P279* wd:Q36180.  # occupation: writer or subclass
      ?author rdfs:label ?authorLabel.
      FILTER(LANG(?authorLabel) = "en")
      FILTER(CONTAINS(LCASE(?authorLabel), LCASE("${escaped}")))
      
      OPTIONAL { ?author wdt:P569 ?birthDate. }
      OPTIONAL { ?author wdt:P570 ?deathDate. }
      OPTIONAL { ?author schema:description ?description. FILTER(LANG(?description) = "en") }
      OPTIONAL { ?author wdt:P18 ?image. }
      
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
    }
    LIMIT 10
  `;

  try {
    const response = await axios.get(endpoint, {
      params: {
        format: 'json',
        query: sparql,
      },
      headers: {
        Accept: 'application/sparql-results+json',
        'User-Agent': USER_AGENT,
      },
    });

    const bindings = response.data?.results?.bindings || [];

    return bindings.map((binding: any) => {
      const result: ExternalAuthorResult = {
        source: 'wikidata',
        name: binding.authorLabel?.value || 'Unknown Author',
        externalId: binding.author?.value,
        biography: normalizeString(binding.description?.value),
        birthDate: normalizeDate(binding.birthDate?.value),
        deathDate: normalizeDate(binding.deathDate?.value),
        photoUrl: binding.image?.value,
      };

      // Extract Wikidata ID
      const wikidataId = binding.author?.value?.split('/').pop();
      if (wikidataId) {
        result.key = wikidataId;
        result.links = {
          wikidata: `https://www.wikidata.org/wiki/${wikidataId}`,
        };
      }

      return result;
    });
  } catch (error) {
    console.error('Error searching Wikidata:', error);
    return [];
  }
};

/**
 * Get detailed author information from Wikidata by ID
 */
const getWikidataAuthorDetails = async (
  wikidataId: string,
): Promise<ExternalAuthorResult | null> => {
  const endpoint = config.externalBooks.wikidata.endpoint;

  const sparql = `
    SELECT ?authorLabel ?birthDate ?deathDate ?description ?image ?birthPlace ?deathPlace ?website WHERE {
      BIND(wd:${wikidataId} AS ?author)
      
      OPTIONAL { ?author wdt:P569 ?birthDate. }
      OPTIONAL { ?author wdt:P570 ?deathDate. }
      OPTIONAL { ?author schema:description ?description. FILTER(LANG(?description) = "en") }
      OPTIONAL { ?author wdt:P18 ?image. }
      OPTIONAL { ?author wdt:P19 ?birthPlaceEntity. ?birthPlaceEntity rdfs:label ?birthPlace. FILTER(LANG(?birthPlace) = "en") }
      OPTIONAL { ?author wdt:P20 ?deathPlaceEntity. ?deathPlaceEntity rdfs:label ?deathPlace. FILTER(LANG(?deathPlace) = "en") }
      OPTIONAL { ?author wdt:P856 ?website. }
      
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
    }
    LIMIT 1
  `;

  try {
    const response = await axios.get(endpoint, {
      params: {
        format: 'json',
        query: sparql,
      },
      headers: {
        Accept: 'application/sparql-results+json',
        'User-Agent': USER_AGENT,
      },
    });

    const bindings = response.data?.results?.bindings;
    if (!bindings || bindings.length === 0) return null;

    const author = bindings[0];

    const result: ExternalAuthorResult = {
      source: 'wikidata',
      name: author.authorLabel?.value || 'Unknown Author',
      key: wikidataId,
      externalId: `http://www.wikidata.org/entity/${wikidataId}`,
      biography: normalizeString(author.description?.value),
      birthDate: normalizeDate(author.birthDate?.value),
      deathDate: normalizeDate(author.deathDate?.value),
      photoUrl: author.image?.value,
      links: {
        wikidata: `https://www.wikidata.org/wiki/${wikidataId}`,
      },
    };

    if (author.website?.value && result.links) {
      result.links.website = author.website.value;
    }

    return result;
  } catch (error) {
    console.error('Error fetching Wikidata author details:', error);
    return null;
  }
};

/**
 * Search for authors via Google Books API
 * Note: Google Books API doesn't have dedicated author endpoints,
 * so we aggregate author info from book volumes
 */
const searchGoogleBooks = async (
  query: string,
): Promise<ExternalAuthorResult[]> => {
  const apiKey = config.externalBooks.googleBooks.apiKey;
  if (!apiKey) {
    throw new Error('Google Books API key is not configured');
  }

  try {
    const response = await axios.get(
      `${config.externalBooks.googleBooks.baseUrl}/volumes`,
      {
        params: {
          q: `inauthor:${query}`,
          maxResults: 20, // Increased to get more author data
          key: apiKey,
        },
      },
    );

    const items = response.data?.items || [];

    // Aggregate unique authors with metadata from their books
    const authorMap = new Map<
      string,
      ExternalAuthorResult & { books: any[] }
    >();

    items.forEach((item: any) => {
      const volumeInfo = item.volumeInfo || {};
      const authors = volumeInfo.authors || [];

      authors.forEach((authorName: string) => {
        const key = authorName.toLowerCase();

        if (!authorMap.has(key)) {
          authorMap.set(key, {
            source: 'googlebooks',
            name: authorName,
            externalId: authorName, // Google Books doesn't provide author IDs
            topWorks: [],
            workCount: 0,
            books: [],
          });
        }

        const authorData = authorMap.get(key)!;
        authorData.workCount = (authorData.workCount || 0) + 1;
        authorData.books.push(volumeInfo);

        // Collect top works (by title)
        if (
          volumeInfo.title &&
          !authorData.topWorks?.includes(volumeInfo.title)
        ) {
          authorData.topWorks = authorData.topWorks || [];
          if (authorData.topWorks.length < 5) {
            authorData.topWorks.push(volumeInfo.title);
          }
        }
      });
    });

    // Convert map to array and add aggregated biography from book descriptions
    return Array.from(authorMap.values()).map((author) => {
      // Try to find a good description from the books
      const bookWithDescription = author.books.find(
        (book) => book.description && book.description.length > 50,
      );

      if (bookWithDescription?.description) {
        // Extract author bio if description mentions the author
        const desc = bookWithDescription.description;
        // This is a simple heuristic - Google Books descriptions often include author info
        author.biography =
          desc.substring(0, 300) + (desc.length > 300 ? '...' : '');
      }

      // Remove the temporary books array before returning
      const { books, ...result } = author;
      return result;
    });
  } catch (error) {
    console.error('Error searching Google Books:', error);
    return [];
  }
};

/**
 * Search for authors across external sources
 */
export const searchExternalAuthors = async (
  source: ExternalSource,
  query: string,
): Promise<ExternalAuthorResult[]> => {
  if (!query || !query.trim()) {
    return [];
  }

  switch (source) {
    case 'openlibrary':
      return searchOpenLibrary(query);
    case 'wikidata':
      return searchWikidata(query);
    case 'googlebooks':
      return searchGoogleBooks(query);
    default:
      return [];
  }
};

/**
 * Get detailed author information by ID from a specific source
 */
export const getExternalAuthorDetails = async (
  source: ExternalSource,
  authorId: string,
): Promise<ExternalAuthorResult | null> => {
  if (!authorId || !authorId.trim()) {
    return null;
  }

  switch (source) {
    case 'openlibrary':
      return getOpenLibraryAuthorDetails(authorId);
    case 'wikidata':
      return getWikidataAuthorDetails(authorId);
    case 'googlebooks':
      // Google Books doesn't support direct author lookup by ID
      return null;
    default:
      return null;
  }
};
