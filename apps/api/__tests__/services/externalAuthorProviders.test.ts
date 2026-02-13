import axios from 'axios';
import {
  searchExternalAuthors,
  getExternalAuthorDetails,
  ExternalAuthorResult,
} from '../../services/externalAuthorProviders';
import config from '../../config/config';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('External Author Providers Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('searchExternalAuthors - OpenLibrary', () => {
    it('should search for authors in OpenLibrary', async () => {
      const mockResponse = {
        data: {
          docs: [
            {
              name: 'Stephen King',
              key: '/authors/OL23919A',
              birth_date: '1947-09-21',
              top_work: 'The Shining',
              work_count: 500,
              photos: [12345],
              alternate_names: ['Richard Bachman'],
            },
          ],
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const results = await searchExternalAuthors(
        'openlibrary',
        'Stephen King',
      );

      expect(results).toHaveLength(1);
      expect(results[0]).toMatchObject({
        source: 'openlibrary',
        name: 'Stephen King',
        key: '/authors/OL23919A',
        birthDate: '1947',
        workCount: 500,
      });
      expect(results[0].photoUrl).toContain('covers.openlibrary.org');
      expect(results[0].alternateNames).toContain('Richard Bachman');
    });

    it('should handle empty results from OpenLibrary', async () => {
      const mockResponse = {
        data: {
          docs: [],
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const results = await searchExternalAuthors(
        'openlibrary',
        'NonexistentAuthor',
      );

      expect(results).toHaveLength(0);
    });

    it('should handle authors without photos', async () => {
      const mockResponse = {
        data: {
          docs: [
            {
              name: 'Unknown Author',
              key: '/authors/OL99999A',
              work_count: 5,
            },
          ],
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const results = await searchExternalAuthors(
        'openlibrary',
        'Unknown Author',
      );

      expect(results[0].photoUrl).toBeUndefined();
    });
  });

  describe('searchExternalAuthors - Wikidata', () => {
    it('should search for authors in Wikidata', async () => {
      const mockResponse = {
        data: {
          results: {
            bindings: [
              {
                author: {
                  value: 'http://www.wikidata.org/entity/Q34660',
                },
                authorLabel: {
                  value: 'J. K. Rowling',
                },
                birthDate: {
                  value: '1965-07-31T00:00:00Z',
                },
                description: {
                  value: 'British author and philanthropist',
                },
                image: {
                  value: 'https://example.com/rowling.jpg',
                },
              },
            ],
          },
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const results = await searchExternalAuthors('wikidata', 'J.K. Rowling');

      expect(results).toHaveLength(1);
      expect(results[0]).toMatchObject({
        source: 'wikidata',
        name: 'J. K. Rowling',
        key: 'Q34660',
        biography: 'British author and philanthropist',
        photoUrl: 'https://example.com/rowling.jpg',
      });
      expect(results[0].links?.wikidata).toBe(
        'https://www.wikidata.org/wiki/Q34660',
      );
    });

    it('should handle Wikidata search errors gracefully', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Wikidata API error'));

      const results = await searchExternalAuthors('wikidata', 'Test Author');

      expect(results).toHaveLength(0);
    });

    it('should handle empty Wikidata results', async () => {
      const mockResponse = {
        data: {
          results: {
            bindings: [],
          },
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const results = await searchExternalAuthors(
        'wikidata',
        'NonexistentAuthor',
      );

      expect(results).toHaveLength(0);
    });
  });

  describe('searchExternalAuthors - Google Books', () => {
    it('should search for authors in Google Books', async () => {
      const mockResponse = {
        data: {
          items: [
            {
              volumeInfo: {
                title: 'Murder on the Orient Express',
                authors: ['Agatha Christie'],
              },
            },
            {
              volumeInfo: {
                title: 'And Then There Were None',
                authors: ['Agatha Christie'],
              },
            },
          ],
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const results = await searchExternalAuthors(
        'googlebooks',
        'Agatha Christie',
      );

      expect(results).toHaveLength(1);
      expect(results[0]).toMatchObject({
        source: 'googlebooks',
        name: 'Agatha Christie',
      });
    });

    it('should throw error if Google Books API key is not configured', async () => {
      const originalApiKey = config.externalBooks.googleBooks.apiKey;
      config.externalBooks.googleBooks.apiKey = '';

      await expect(
        searchExternalAuthors('googlebooks', 'Test Author'),
      ).rejects.toThrow('Google Books API key is not configured');

      config.externalBooks.googleBooks.apiKey = originalApiKey;
    });

    it('should handle empty Google Books results', async () => {
      const mockResponse = {
        data: {
          items: [],
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const results = await searchExternalAuthors(
        'googlebooks',
        'NonexistentAuthor',
      );

      expect(results).toHaveLength(0);
    });
  });

  describe('getExternalAuthorDetails - OpenLibrary', () => {
    it('should get detailed author information from OpenLibrary', async () => {
      const mockAuthorResponse = {
        data: {
          name: 'Stephen King',
          key: '/authors/OL23919A',
          birth_date: '1947-09-21',
          bio: 'Stephen Edwin King is an American author of horror...',
          photos: [12345],
          alternate_names: ['Richard Bachman'],
          links: [
            {
              title: 'Wikipedia',
              url: 'https://en.wikipedia.org/wiki/Stephen_King',
            },
          ],
        },
      };

      const mockWorksResponse = {
        data: {
          size: 500,
          entries: [
            { title: 'The Shining' },
            { title: 'It' },
            { title: 'The Stand' },
          ],
        },
      };

      mockedAxios.get
        .mockResolvedValueOnce(mockAuthorResponse)
        .mockResolvedValueOnce(mockWorksResponse);

      const result = await getExternalAuthorDetails(
        'openlibrary',
        '/authors/OL23919A',
      );

      expect(result).not.toBeNull();
      expect(result).toMatchObject({
        source: 'openlibrary',
        name: 'Stephen King',
        key: '/authors/OL23919A',
        biography: 'Stephen Edwin King is an American author of horror...',
        birthDate: '1947',
        workCount: 500,
      });
      expect(result?.topWorks).toContain('The Shining');
      expect(result?.links?.wikipedia).toBe(
        'https://en.wikipedia.org/wiki/Stephen_King',
      );
    });

    it('should handle author bio as object', async () => {
      const mockResponse = {
        data: {
          name: 'Test Author',
          key: '/authors/OL99999A',
          bio: {
            value: 'This is a biography',
          },
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await getExternalAuthorDetails('openlibrary', 'OL99999A');

      expect(result?.biography).toBe('This is a biography');
    });

    it('should return null if author not found', async () => {
      mockedAxios.get.mockRejectedValue({ response: { status: 404 } });

      const result = await getExternalAuthorDetails(
        'openlibrary',
        'OL99999999A',
      );

      expect(result).toBeNull();
    });

    it('should clean author key properly', async () => {
      const mockResponse = {
        data: {
          name: 'Test Author',
          key: '/authors/OL23919A',
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      await getExternalAuthorDetails('openlibrary', '/authors/OL23919A');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/authors/OL23919A.json'),
        expect.any(Object),
      );
    });
  });

  describe('getExternalAuthorDetails - Wikidata', () => {
    it('should get detailed author information from Wikidata', async () => {
      const mockResponse = {
        data: {
          results: {
            bindings: [
              {
                authorLabel: {
                  value: 'J. K. Rowling',
                },
                birthDate: {
                  value: '1965-07-31T00:00:00Z',
                },
                description: {
                  value: 'British author and philanthropist',
                },
                image: {
                  value: 'https://example.com/rowling.jpg',
                },
                website: {
                  value: 'https://www.jkrowling.com',
                },
              },
            ],
          },
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await getExternalAuthorDetails('wikidata', 'Q34660');

      expect(result).not.toBeNull();
      expect(result).toMatchObject({
        source: 'wikidata',
        name: 'J. K. Rowling',
        key: 'Q34660',
        biography: 'British author and philanthropist',
        photoUrl: 'https://example.com/rowling.jpg',
      });
      expect(result?.links?.wikidata).toBe(
        'https://www.wikidata.org/wiki/Q34660',
      );
      expect(result?.links?.website).toBe('https://www.jkrowling.com');
    });

    it('should return null if Wikidata author not found', async () => {
      const mockResponse = {
        data: {
          results: {
            bindings: [],
          },
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await getExternalAuthorDetails('wikidata', 'Q99999999');

      expect(result).toBeNull();
    });

    it('should handle Wikidata errors', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Wikidata error'));

      const result = await getExternalAuthorDetails('wikidata', 'Q34660');

      expect(result).toBeNull();
    });
  });

  describe('getExternalAuthorDetails - Google Books', () => {
    it('should return null for Google Books (not supported)', async () => {
      const result = await getExternalAuthorDetails(
        'googlebooks',
        'some-author-id',
      );

      expect(result).toBeNull();
    });
  });

  describe('Edge cases', () => {
    it('should return empty array for empty query', async () => {
      const result = await searchExternalAuthors('openlibrary', '');

      expect(result).toHaveLength(0);
    });

    it('should return null for empty author ID', async () => {
      const result = await getExternalAuthorDetails('openlibrary', '');

      expect(result).toBeNull();
    });

    it('should handle whitespace-only queries', async () => {
      const result = await searchExternalAuthors('openlibrary', '   ');

      expect(result).toHaveLength(0);
    });
  });
});
