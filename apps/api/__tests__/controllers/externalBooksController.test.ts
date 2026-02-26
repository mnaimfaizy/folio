import { Request, Response } from 'express';
import { searchExternalBooksHandler } from '../../controllers/externalBooksController';
import * as externalSearchService from '../../services/externalSearchService';

jest.mock('../../services/externalSearchService');

describe('External Books Controller', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = {
      query: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();
  });

  it('returns results on successful external search', async () => {
    req.query = {
      source: 'openlibrary',
      query: 'The Hobbit',
      type: 'title',
    };

    const mockResults = [
      {
        source: 'openlibrary' as const,
        title: 'The Hobbit',
        authors: ['J.R.R. Tolkien'],
        isbn13: '9780547928227',
      },
    ];

    (
      externalSearchService.searchExternalBooksService as jest.Mock
    ).mockResolvedValue(mockResults);

    await searchExternalBooksHandler(req as Request, res as Response);

    expect(
      externalSearchService.searchExternalBooksService,
    ).toHaveBeenCalledWith('openlibrary', 'The Hobbit', 'title');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ results: mockResults });
  });

  it('returns typed client errors from service', async () => {
    req.query = {
      source: 'invalid',
      query: 'Book',
      type: 'title',
    };

    const badRequestError = Object.assign(new Error('Invalid source'), {
      status: 400,
    });

    (
      externalSearchService.searchExternalBooksService as jest.Mock
    ).mockRejectedValue(badRequestError);

    await searchExternalBooksHandler(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid source' });
  });

  it('uses fallback message for typed client error without message', async () => {
    req.query = {
      source: 'openlibrary',
      query: 'Book',
      type: 'title',
    };

    (
      externalSearchService.searchExternalBooksService as jest.Mock
    ).mockRejectedValue({ status: 422 });

    await searchExternalBooksHandler(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({ message: 'Bad request' });
  });

  it('returns 500 for unexpected service errors', async () => {
    req.query = {
      source: 'openlibrary',
      query: 'Book',
      type: 'title',
    };

    (
      externalSearchService.searchExternalBooksService as jest.Mock
    ).mockRejectedValue(new Error('External API unavailable'));

    await searchExternalBooksHandler(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'External search failed',
      error: 'External API unavailable',
    });
  });

  it('returns Unknown error for non-Error throwables', async () => {
    req.query = {
      source: 'openlibrary',
      query: 'Book',
      type: 'title',
    };

    (
      externalSearchService.searchExternalBooksService as jest.Mock
    ).mockRejectedValue('failure');

    await searchExternalBooksHandler(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'External search failed',
      error: 'Unknown error',
    });
  });
});
