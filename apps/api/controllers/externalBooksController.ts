import { Request, Response } from 'express';
import { ExternalBookResult } from '../services/externalBookProviders';
import { searchExternalBooksService } from '../services/externalSearchService';

export const searchExternalBooksHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const results: ExternalBookResult[] = await searchExternalBooksService(
      req.query.source,
      req.query.query,
      req.query.type,
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
    res.status(500).json({ message: 'External search failed', error: message });
  }
};
