import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BookCard } from '@/components/ui/book-card';
import { BookShelfView } from './BookShelfView';
import BookService from '@/services/bookService';
import { Grid, Library, Loader2, Search } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface PublicBook {
  id?: number;
  title: string;
  author?: string;
  genre?: string;
  publishYear?: number;
  description?: string;
  coverImage?: string;
  cover?: string;
  availableCopies?: number;
  available_copies?: number;
}

export function PublicBooksComponent() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [booksPerPage] = useState<number>(12);
  const [books, setBooks] = useState<PublicBook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'shelf'>('grid');

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setIsLoading(true);
        const response = await BookService.getAllBooks();
        setBooks(response);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error('Failed to fetch books'),
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const filterBooks = useCallback(
    (books: PublicBook[]) => {
      const query = searchQuery.toLowerCase().trim();
      if (!query) return books;

      return books.filter(
        (book) =>
          book.title.toLowerCase().includes(query) ||
          book.author?.toLowerCase().includes(query) ||
          book.genre?.toLowerCase().includes(query),
      );
    },
    [searchQuery],
  );

  const filteredBooks = useMemo(() => filterBooks(books), [filterBooks, books]);
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <span className="text-lg text-gray-600 dark:text-gray-300">
          Loading books catalog...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <h3 className="text-2xl font-semibold text-red-600">Error</h3>
        <p className="text-muted-foreground mt-2">
          Failed to load books. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Full-width header banner */}
      <section className="bg-linear-to-br from-slate-900 via-indigo-950 to-slate-900 py-12">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                Book Catalog
              </h1>
              <p className="text-slate-300 mt-2">
                Discover your next favorite read
              </p>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              {/* View Toggle */}
              <div className="flex rounded-lg border border-white/20 overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white text-gray-900'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                  title="Grid View"
                >
                  <Grid className="h-4 w-4" />
                  <span className="hidden sm:inline">Grid</span>
                </button>
                <button
                  onClick={() => setViewMode('shelf')}
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors border-l border-white/20 ${
                    viewMode === 'shelf'
                      ? 'bg-white text-gray-900'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                  title="Shelf View"
                >
                  <Library className="h-4 w-4" />
                  <span className="hidden sm:inline">Shelf</span>
                </button>
              </div>

              <div className="relative flex-1 md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search by title, author, or genre..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-10 w-full rounded-full bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Body content */}
      <div className="container mx-auto px-4 py-8 max-w-screen-xl">
        {/* ── Shelf View ─────────────────────────── */}
        {viewMode === 'shelf' ? (
          <BookShelfView books={filteredBooks} />
        ) : (
          /* ── Grid View (original) ──────────────── */
          <>
            {currentBooks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  No books found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md">
                  Try adjusting your search criteria or browse our full
                  collection.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                  {currentBooks.map((book: PublicBook) => (
                    <BookCard
                      key={book.id}
                      id={book.id}
                      title={book.title}
                      author={book.author}
                      genre={book.genre}
                      publishYear={book.publishYear}
                      description={book.description}
                      coverImage={book.coverImage}
                      cover={book.cover}
                      availableCopies={
                        typeof book.availableCopies === 'number'
                          ? book.availableCopies
                          : typeof book.available_copies === 'number'
                            ? book.available_copies
                            : undefined
                      }
                      rating={4.5}
                    />
                  ))}
                </div>

                {/* Pagination controls */}
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
                          variant={
                            currentPage === pageNum ? 'default' : 'outline'
                          }
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
              </>
            )}
          </>
        )}
      </div>{' '}
      {/* end body container */}
    </div>
  );
}
