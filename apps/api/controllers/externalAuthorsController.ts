import { Request, Response } from 'express';
import {
  ExternalAuthorResult,
  searchExternalAuthors,
  getExternalAuthorDetails,
} from '../services/externalAuthorProviders';

type ExternalSource = 'openlibrary' | 'wikidata' | 'googlebooks';

const isValidSource = (source: string): source is ExternalSource => {
  return ['openlibrary', 'wikidata', 'googlebooks'].includes(source);
};

/**
 * Search for authors across external sources
 */
export const searchExternalAuthorsHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const source = String(req.query.source || '').toLowerCase();
    const query = String(req.query.query || '').trim();

    if (!source || !isValidSource(source)) {
      res.status(400).json({
        message:
          'Invalid source. Must be one of: openlibrary, wikidata, googlebooks',
      });
      return;
    }

    if (!query) {
      res.status(400).json({ message: 'Query is required' });
      return;
    }

    const results: ExternalAuthorResult[] = await searchExternalAuthors(
      source,
      query,
    );

    res.status(200).json({ results });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      message: 'External author search failed',
      error: message,
    });
  }
};

/**
 * Get detailed author information from an external source
 */
export const getExternalAuthorDetailsHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const source = String(req.params.source || '').toLowerCase();
    const authorId = String(req.params.authorId || '').trim();

    if (!source || !isValidSource(source)) {
      res.status(400).json({
        message:
          'Invalid source. Must be one of: openlibrary, wikidata, googlebooks',
      });
      return;
    }

    if (!authorId) {
      res.status(400).json({ message: 'Author ID is required' });
      return;
    }

    const result: ExternalAuthorResult | null = await getExternalAuthorDetails(
      source,
      authorId,
    );

    if (!result) {
      res.status(404).json({ message: 'Author not found' });
      return;
    }

    res.status(200).json({ author: result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      message: 'Failed to fetch author details',
      error: message,
    });
  }
};
