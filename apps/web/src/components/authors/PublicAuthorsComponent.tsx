import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PublicAuthorCard } from '@/components/ui/public-author-card';
import { authorService, type Author } from '@/services/authorService';
import { Loader2, Search, UserCircle } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export function PublicAuthorsComponent() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLetter, setSelectedLetter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [authorsPerPage] = useState<number>(12);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        setIsLoading(true);
        const response = await authorService.getAuthors();
        setAuthors(response);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error('Failed to fetch authors'),
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchAuthors();
  }, []);

  const filterAuthors = useCallback(
    (authors: Author[]) => {
      let filtered = authors;

      // Filter by selected letter
      if (selectedLetter) {
        filtered = filtered.filter((author) =>
          author.name.toUpperCase().startsWith(selectedLetter),
        );
      }

      // Filter by search query
      const query = searchQuery.toLowerCase().trim();
      if (query) {
        filtered = filtered.filter(
          (author) =>
            author.name.toLowerCase().includes(query) ||
            author.biography?.toLowerCase().includes(query),
        );
      }

      return filtered;
    },
    [searchQuery, selectedLetter],
  );

  const filteredAuthors = useMemo(
    () => filterAuthors(authors),
    [filterAuthors, authors],
  );
  const totalPages = Math.ceil(filteredAuthors.length / authorsPerPage);
  const indexOfLastAuthor = currentPage * authorsPerPage;
  const indexOfFirstAuthor = indexOfLastAuthor - authorsPerPage;
  const currentAuthors = filteredAuthors.slice(
    indexOfFirstAuthor,
    indexOfLastAuthor,
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleLetterFilter = (letter: string) => {
    if (selectedLetter === letter) {
      setSelectedLetter('');
    } else {
      setSelectedLetter(letter);
    }
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedLetter('');
    setCurrentPage(1);
  };

  // Get count of authors per letter for the filter
  const letterCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    ALPHABET.forEach((letter) => {
      counts[letter] = authors.filter((author) =>
        author.name.toUpperCase().startsWith(letter),
      ).length;
    });
    return counts;
  }, [authors]);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <span className="text-lg text-gray-600 dark:text-gray-300">
          Loading authors catalog...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <h3 className="text-2xl font-semibold text-red-600">Error</h3>
        <p className="text-muted-foreground mt-2">
          Failed to load authors. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
              Authors Catalog
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Discover talented authors and their works
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search authors..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10 w-full rounded-full border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Alphabetic Filter */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Filter by Letter
            </h3>
            {(selectedLetter || searchQuery) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-xs"
              >
                Clear Filters
              </Button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {ALPHABET.map((letter) => (
              <button
                key={letter}
                onClick={() => handleLetterFilter(letter)}
                disabled={letterCounts[letter] === 0}
                className={`
                  w-10 h-10 rounded-lg font-semibold text-sm transition-all duration-200
                  ${
                    selectedLetter === letter
                      ? 'bg-blue-600 text-white shadow-md scale-105'
                      : letterCounts[letter] > 0
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        : 'bg-gray-50 dark:bg-gray-900 text-gray-300 dark:text-gray-700 cursor-not-allowed'
                  }
                `}
                title={
                  letterCounts[letter] > 0
                    ? `${letterCounts[letter]} author${letterCounts[letter] !== 1 ? 's' : ''}`
                    : 'No authors'
                }
              >
                {letter}
              </button>
            ))}
          </div>
        </div>

        {/* Active Filters Display */}
        {(selectedLetter || searchQuery) && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span>Active filters:</span>
            {selectedLetter && (
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full">
                Letter: {selectedLetter}
              </span>
            )}
            {searchQuery && (
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full">
                Search: {searchQuery}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Authors Grid */}
      {currentAuthors.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
            <UserCircle className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            No authors found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md">
            {selectedLetter || searchQuery
              ? 'Try adjusting your filters or search criteria.'
              : 'No authors available at the moment.'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {currentAuthors.map((author) => (
              <PublicAuthorCard
                key={author.id}
                id={author.id}
                name={author.name}
                biography={author.biography}
                birthDate={author.birth_date}
                photoUrl={author.photo_url}
                bookCount={author.book_count || 0}
              />
            ))}
          </div>

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="join">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="mr-1"
                >
                  &laquo; Previous
                </Button>

                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? 'default' : 'outline'}
                      onClick={() => handlePageChange(pageNum)}
                      className="mx-1"
                    >
                      {pageNum}
                    </Button>
                  );
                })}

                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="ml-1"
                >
                  Next &raquo;
                </Button>
              </div>
            </div>
          )}

          {/* Results Summary */}
          <div className="text-center mt-4 text-sm text-gray-500 dark:text-gray-400">
            Showing {indexOfFirstAuthor + 1} to{' '}
            {Math.min(indexOfLastAuthor, filteredAuthors.length)} of{' '}
            {filteredAuthors.length} author
            {filteredAuthors.length !== 1 ? 's' : ''}
          </div>
        </>
      )}
    </div>
  );
}
