import {
  autoFulfillRequestsForBook,
  createRequestKey,
  findMatchingBookForRequest,
  normalizeIsbn,
  normalizeText,
} from '../../services/requestMatchingService';

describe('requestMatchingService', () => {
  describe('normalize helpers', () => {
    it('normalizes text consistently', () => {
      expect(normalizeText('  Cien años de soledad!  ')).toBe(
        'cien anos de soledad',
      );
    });

    it('normalizes isbn consistently', () => {
      expect(normalizeIsbn('ISBN 978-0-1234-5678-x')).toBe('978012345678X');
    });
  });

  describe('createRequestKey', () => {
    it('creates isbn-based key when isbn exists', () => {
      const result = createRequestKey({ requestedIsbn: '978-1-4028-9462-6' });

      expect(result).toEqual({
        requestKey: 'isbn:9781402894626',
        normalizedTitle: null,
        normalizedAuthor: null,
        normalizedIsbn: '9781402894626',
      });
    });

    it('creates title+author key when isbn not provided', () => {
      const result = createRequestKey({
        requestedTitle: 'The Pragmatic Programmer',
        requestedAuthor: 'Andrew Hunt',
      });

      expect(result.requestKey).toBe(
        'title_author:the pragmatic programmer|andrew hunt',
      );
    });

    it('throws for invalid inputs without isbn or title+author', () => {
      expect(() =>
        createRequestKey({ requestedTitle: 'Only title without author' }),
      ).toThrow('Request must include ISBN or both title and author');
    });
  });

  describe('findMatchingBookForRequest', () => {
    it('matches by normalized isbn first', async () => {
      const db = {
        get: jest.fn().mockResolvedValueOnce({
          id: 5,
          isbn: '9781402894626',
          isbn10: null,
          isbn13: '9781402894626',
          title: 'Domain-Driven Design',
          author: 'Eric Evans',
          available_copies: 2,
        }),
        all: jest.fn(),
      } as any;

      const matched = await findMatchingBookForRequest(db, {
        requestedIsbn: '978-1-4028-9462-6',
      });

      expect(matched?.id).toBe(5);
      expect(db.all).not.toHaveBeenCalled();
    });

    it('falls back to title+author normalization matching', async () => {
      const db = {
        get: jest.fn().mockResolvedValueOnce(undefined),
        all: jest.fn().mockResolvedValueOnce([
          {
            id: 10,
            isbn: null,
            isbn10: null,
            isbn13: null,
            title: 'Clean Code',
            author: 'Robert C. Martin',
            available_copies: 1,
          },
        ]),
      } as any;

      const matched = await findMatchingBookForRequest(db, {
        requestedTitle: 'clean  code',
        requestedAuthor: 'Robert C Martin',
      });

      expect(matched?.id).toBe(10);
    });
  });

  describe('autoFulfillRequestsForBook', () => {
    it('returns zero when target book is unavailable', async () => {
      const db = {
        get: jest.fn().mockResolvedValueOnce({
          id: 1,
          title: 'Unavailable',
          author: 'Nobody',
          isbn: null,
          isbn10: null,
          isbn13: null,
          available_copies: 0,
        }),
        all: jest.fn(),
        run: jest.fn(),
      } as any;

      const fulfilled = await autoFulfillRequestsForBook(db, 1);

      expect(fulfilled).toBe(0);
      expect(db.run).not.toHaveBeenCalled();
    });

    it('fulfills matching isbn and title/author open requests', async () => {
      const db = {
        get: jest.fn().mockResolvedValueOnce({
          id: 7,
          isbn: '9781402894626',
          isbn10: null,
          isbn13: null,
          title: 'The Hobbit',
          author: 'J.R.R. Tolkien',
          available_copies: 3,
        }),
        all: jest.fn().mockResolvedValueOnce([
          {
            id: 1,
            requested_isbn: '9781402894626',
            normalized_isbn: '9781402894626',
            normalized_title: null,
            normalized_author: null,
          },
          {
            id: 2,
            requested_isbn: null,
            normalized_isbn: null,
            normalized_title: 'the hobbit',
            normalized_author: 'j r r tolkien',
          },
          {
            id: 3,
            requested_isbn: null,
            normalized_isbn: null,
            normalized_title: 'different title',
            normalized_author: 'different author',
          },
        ]),
        run: jest.fn().mockResolvedValue({}),
      } as any;

      const fulfilled = await autoFulfillRequestsForBook(db, 7);

      expect(fulfilled).toBe(2);
      expect(db.run).toHaveBeenCalledTimes(2);
    });
  });
});
