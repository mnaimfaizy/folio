import { Request, Response } from 'express';
import {
  searchExternalAuthorsHandler,
  getExternalAuthorDetailsHandler,
} from '../../controllers/externalAuthorsController';
import * as externalAuthorProviders from '../../services/externalAuthorProviders';

// Mock the external author providers service
jest.mock('../../services/externalAuthorProviders');

describe('External Authors Controller', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = {
      query: {},
      params: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();
  });

  describe('searchExternalAuthorsHandler', () => {
    it('should search for authors in OpenLibrary', async () => {
      req.query = {
        source: 'openlibrary',
        query: 'Stephen King',
      };

      const mockResults = [
        {
          source: 'openlibrary' as const,
          name: 'Stephen King',
          key: '/authors/OL23919A',
          externalId: '/authors/OL23919A',
          biography: 'American author of horror, supernatural fiction',
          birthDate: '1947',
          workCount: 500,
          photoUrl: 'https://covers.openlibrary.org/a/id/12345-L.jpg',
        },
      ];

      (
        externalAuthorProviders.searchExternalAuthors as jest.Mock
      ).mockResolvedValue(mockResults);

      await searchExternalAuthorsHandler(req as Request, res as Response);

      expect(
        externalAuthorProviders.searchExternalAuthors,
      ).toHaveBeenCalledWith('openlibrary', 'Stephen King');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ results: mockResults });
    });

    it('should search for authors in Wikidata', async () => {
      req.query = {
        source: 'wikidata',
        query: 'J.K. Rowling',
      };

      const mockResults = [
        {
          source: 'wikidata' as const,
          name: 'J. K. Rowling',
          key: 'Q34660',
          externalId: 'http://www.wikidata.org/entity/Q34660',
          biography: 'British author and philanthropist',
          birthDate: '1965',
          photoUrl: 'https://example.com/rowling.jpg',
        },
      ];

      (
        externalAuthorProviders.searchExternalAuthors as jest.Mock
      ).mockResolvedValue(mockResults);

      await searchExternalAuthorsHandler(req as Request, res as Response);

      expect(
        externalAuthorProviders.searchExternalAuthors,
      ).toHaveBeenCalledWith('wikidata', 'J.K. Rowling');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ results: mockResults });
    });

    it('should search for authors in Google Books', async () => {
      req.query = {
        source: 'googlebooks',
        query: 'Agatha Christie',
      };

      const mockResults = [
        {
          source: 'googlebooks' as const,
          name: 'Agatha Christie',
          externalId: 'Agatha Christie',
        },
      ];

      (
        externalAuthorProviders.searchExternalAuthors as jest.Mock
      ).mockResolvedValue(mockResults);

      await searchExternalAuthorsHandler(req as Request, res as Response);

      expect(
        externalAuthorProviders.searchExternalAuthors,
      ).toHaveBeenCalledWith('googlebooks', 'Agatha Christie');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ results: mockResults });
    });

    it('should return 400 if source is invalid', async () => {
      req.query = {
        source: 'invalid-source',
        query: 'Test Author',
      };

      await searchExternalAuthorsHandler(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message:
          'Invalid source. Must be one of: openlibrary, wikidata, googlebooks',
      });
    });

    it('should return 400 if source is missing', async () => {
      req.query = {
        query: 'Test Author',
      };

      await searchExternalAuthorsHandler(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message:
          'Invalid source. Must be one of: openlibrary, wikidata, googlebooks',
      });
    });

    it('should return 400 if query is missing', async () => {
      req.query = {
        source: 'openlibrary',
      };

      await searchExternalAuthorsHandler(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Query is required',
      });
    });

    it('should handle errors from external service', async () => {
      req.query = {
        source: 'openlibrary',
        query: 'Test Author',
      };

      const mockError = new Error('External API error');
      (
        externalAuthorProviders.searchExternalAuthors as jest.Mock
      ).mockRejectedValue(mockError);

      await searchExternalAuthorsHandler(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'External author search failed',
        error: 'External API error',
      });
    });

    it('should return empty results when no authors found', async () => {
      req.query = {
        source: 'openlibrary',
        query: 'NonexistentAuthor12345',
      };

      (
        externalAuthorProviders.searchExternalAuthors as jest.Mock
      ).mockResolvedValue([]);

      await searchExternalAuthorsHandler(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ results: [] });
    });
  });

  describe('getExternalAuthorDetailsHandler', () => {
    it('should get author details from OpenLibrary', async () => {
      req.params = {
        source: 'openlibrary',
        authorId: 'OL23919A',
      };

      const mockAuthor = {
        source: 'openlibrary' as const,
        name: 'Stephen King',
        key: '/authors/OL23919A',
        externalId: '/authors/OL23919A',
        biography:
          'Stephen Edwin King is an American author of horror, supernatural fiction...',
        birthDate: '1947-09-21',
        workCount: 500,
        photoUrl: 'https://covers.openlibrary.org/a/id/12345-L.jpg',
        topWorks: ['The Shining', 'It', 'The Stand'],
        links: {
          wikipedia: 'https://en.wikipedia.org/wiki/Stephen_King',
        },
      };

      (
        externalAuthorProviders.getExternalAuthorDetails as jest.Mock
      ).mockResolvedValue(mockAuthor);

      await getExternalAuthorDetailsHandler(req as Request, res as Response);

      expect(
        externalAuthorProviders.getExternalAuthorDetails,
      ).toHaveBeenCalledWith('openlibrary', 'OL23919A');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ author: mockAuthor });
    });

    it('should get author details from Wikidata', async () => {
      req.params = {
        source: 'wikidata',
        authorId: 'Q34660',
      };

      const mockAuthor = {
        source: 'wikidata' as const,
        name: 'J. K. Rowling',
        key: 'Q34660',
        externalId: 'http://www.wikidata.org/entity/Q34660',
        biography: 'British author and philanthropist',
        birthDate: '1965-07-31',
        photoUrl: 'https://example.com/rowling.jpg',
        links: {
          wikidata: 'https://www.wikidata.org/wiki/Q34660',
          website: 'https://www.jkrowling.com',
        },
      };

      (
        externalAuthorProviders.getExternalAuthorDetails as jest.Mock
      ).mockResolvedValue(mockAuthor);

      await getExternalAuthorDetailsHandler(req as Request, res as Response);

      expect(
        externalAuthorProviders.getExternalAuthorDetails,
      ).toHaveBeenCalledWith('wikidata', 'Q34660');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ author: mockAuthor });
    });

    it('should return 400 if source is invalid', async () => {
      req.params = {
        source: 'invalid-source',
        authorId: 'test123',
      };

      await getExternalAuthorDetailsHandler(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message:
          'Invalid source. Must be one of: openlibrary, wikidata, googlebooks',
      });
    });

    it('should return 400 if authorId is missing', async () => {
      req.params = {
        source: 'openlibrary',
        authorId: '',
      };

      await getExternalAuthorDetailsHandler(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Author ID is required',
      });
    });

    it('should return 404 if author not found', async () => {
      req.params = {
        source: 'openlibrary',
        authorId: 'OL99999999A',
      };

      (
        externalAuthorProviders.getExternalAuthorDetails as jest.Mock
      ).mockResolvedValue(null);

      await getExternalAuthorDetailsHandler(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Author not found',
      });
    });

    it('should handle errors from external service', async () => {
      req.params = {
        source: 'openlibrary',
        authorId: 'OL23919A',
      };

      const mockError = new Error('External API error');
      (
        externalAuthorProviders.getExternalAuthorDetails as jest.Mock
      ).mockRejectedValue(mockError);

      await getExternalAuthorDetailsHandler(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Failed to fetch author details',
        error: 'External API error',
      });
    });
  });
});
