import { useState, useEffect, useMemo } from 'react';
import authorService, { Author } from '@/services/authorService';
import { toast } from 'sonner';
import { AuthorCard } from '@/components/ui/author-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, BookOpen, Search, ArrowUpDown, Loader2 } from 'lucide-react';

interface AuthorWithBooks extends Author {
  book_count?: number;
  books?: Array<{
    id: number;
    title: string;
    cover: string;
  }>;
}

export function AuthorsListComponent() {
  const [authors, setAuthors] = useState<AuthorWithBooks[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeAlphabet, setActiveAlphabet] = useState<string>('ALL');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Generate alphabet array for filtering
  const alphabetArray = useMemo(() => {
    return 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  }, []);

  useEffect(() => {
    fetchAuthors();
  }, []);

  const fetchAuthors = async () => {
    try {
      setLoading(true);

      // Fetch authors from our backend
      const authorsList = await authorService.getAuthors();

      // For each author, get their books
      const authorsWithDetails = await Promise.all(
        authorsList.map(async (author) => {
          try {
            // Get author details with books
            const authorDetails = await authorService.getAuthorById(author.id!);

            // If the author has no photo, generate a placeholder
            if (!authorDetails.photo_url) {
              authorDetails.photo_url = `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(
                authorDetails.name,
              )}`;
            }

            // Format books for display
            const formattedBooks = authorDetails.books?.map((book) => ({
              id: book.id,
              title: book.title,
              cover: book.cover_image_url,
            }));

            // Map book count
            return {
              ...authorDetails,
              book_count: author.book_count || authorDetails.books?.length,
              books: formattedBooks?.slice(0, 3), // Take up to 3 books
            };
          } catch (error) {
            console.error(
              `Error fetching details for author ${author.name}:`,
              error,
            );
            // Return basic info if we can't get details
            return {
              ...author,
              book_count: author.book_count || 0,
              photo_url: `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(
                author.name,
              )}`,
              books: [],
            };
          }
        }),
      );

      setAuthors(authorsWithDetails);
    } catch (error) {
      console.error('Error fetching authors:', error);
      toast.error('Failed to load authors catalog.');
    } finally {
      setLoading(false);
    }
  };

  // Filter authors based on search query and active alphabet
  const filteredAuthors = useMemo(() => {
    return authors
      .filter((author) => {
        const matchesSearch =
          searchQuery.trim() === '' ||
          author.name.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesAlphabet =
          activeAlphabet === 'ALL' ||
          author.name.charAt(0).toUpperCase() === activeAlphabet;

        return matchesSearch && matchesAlphabet;
      })
      .sort((a, b) => {
        const nameA = a.name.toUpperCase();
        const nameB = b.name.toUpperCase();

        return sortOrder === 'asc'
          ? nameA.localeCompare(nameB)
          : nameB.localeCompare(nameA);
      });
  }, [authors, searchQuery, activeAlphabet, sortOrder]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-20 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <span className="text-lg text-gray-600 dark:text-gray-300">
          Loading authors...
        </span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
              Authors Directory
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              {filteredAuthors.length} authors found
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          className="flex items-center gap-2 rounded-full px-4"
        >
          <ArrowUpDown className="h-4 w-4" />
          {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
        </Button>
      </div>

      {/* Search Box */}
      <div className="relative max-w-md mx-auto mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          type="search"
          placeholder="Search authors..."
          className="pl-12 h-12 rounded-full border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 shadow-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Alphabet Filter */}
      <div className="bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800 rounded-2xl mb-8 overflow-x-auto">
        <div className="flex p-3 gap-1 min-w-max">
          <Button
            variant={activeAlphabet === 'ALL' ? 'default' : 'ghost'}
            className="rounded-full px-4 py-2 text-sm font-medium"
            onClick={() => setActiveAlphabet('ALL')}
          >
            ALL
          </Button>

          {alphabetArray.map((letter) => (
            <Button
              key={letter}
              variant={activeAlphabet === letter ? 'default' : 'ghost'}
              className="rounded-full px-4 py-2 text-sm font-medium"
              onClick={() => setActiveAlphabet(letter)}
            >
              {letter}
            </Button>
          ))}
        </div>
      </div>

      {filteredAuthors.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
            <BookOpen className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            No authors found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md">
            Try adjusting your search or filter criteria
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAuthors.map((author) => (
            <AuthorCard
              key={author.id}
              id={author.id}
              name={author.name}
              photoUrl={author.photo_url}
              biography={author.biography}
              birthDate={author.birth_date}
              bookCount={author.book_count || 0}
              books={author.books?.map((book) => ({
                id: book.id,
                title: book.title,
                cover: book.cover,
              }))}
            />
          ))}
        </div>
      )}
    </div>
  );
}
