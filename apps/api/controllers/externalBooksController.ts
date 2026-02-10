import { Request, Response } from 'express';
import {
  ExternalBookResult,
  searchExternalBooks,
} from '../services/externalBookProviders';

type ExternalSource =
  | 'openlibrary'
  | 'googlebooks'
  | 'isbndb'
  | 'loc'
  | 'wikidata'
  | 'worldcat';

type SearchType = 'title' | 'author' | 'isbn';

const isValidSource = (source: string): source is ExternalSource => {
  return [
    'openlibrary',
    'googlebooks',
    'isbndb',
    'loc',
    'wikidata',
    'worldcat',
  ].includes(source);
};

const isValidSearchType = (value: string): value is SearchType => {
  return ['title', 'author', 'isbn'].includes(value);
};

export const searchExternalBooksHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const source = String(req.query.source || '').toLowerCase();
    const query = String(req.query.query || '').trim();
    const type = String(req.query.type || 'title').toLowerCase();

    if (!source || !isValidSource(source)) {
      res.status(400).json({ message: 'Invalid source' });
      return;
    }

    if (!query) {
      res.status(400).json({ message: 'Query is required' });
      return;
    }

    if (!isValidSearchType(type)) {
      res.status(400).json({ message: 'Invalid search type' });
      return;
    }

    const results: ExternalBookResult[] = await searchExternalBooks(
      source,
      query,
      type,
    );

    res.status(200).json({ results });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ message: 'External search failed', error: message });
  }
};
