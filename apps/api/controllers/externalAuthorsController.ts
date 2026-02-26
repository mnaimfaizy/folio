import { Request, Response } from 'express';
import { ExternalAuthorResult } from '../services/externalAuthorProviders';
import {
  getExternalAuthorDetailsService,
  searchExternalAuthorsService,
} from '../services/externalSearchService';

/**
 * Search for authors across external sources
 */
export const searchExternalAuthorsHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const results: ExternalAuthorResult[] = await searchExternalAuthorsService(
      req.query.source,
      req.query.query,
    );

    res.status(200).json({ results });
  } catch (error: unknown) {
    const typedError = error as { status?: number; message?: string };
    if (typeof typedError.status === 'number' && typedError.status < 500) {
      res.status(typedError.status).json({
        message: typedError.message || 'Bad request',
      });
      return;
    }

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
    const result: ExternalAuthorResult | null =
      await getExternalAuthorDetailsService(
        req.params.source,
        req.params.authorId,
      );

    if (!result) {
      res.status(404).json({ message: 'Author not found' });
      return;
    }

    res.status(200).json({ author: result });
  } catch (error: unknown) {
    const typedError = error as { status?: number; message?: string };
    if (typeof typedError.status === 'number' && typedError.status < 500) {
      res.status(typedError.status).json({
        message: typedError.message || 'Bad request',
      });
      return;
    }

    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      message: 'Failed to fetch author details',
      error: message,
    });
  }
};
