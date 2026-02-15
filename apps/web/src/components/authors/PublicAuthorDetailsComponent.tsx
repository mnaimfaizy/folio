import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'sonner';
import authorService, { type AuthorWithBooks } from '@/services/authorService';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft,
  Book as BookIcon,
  Star,
  Loader2,
  Calendar,
  Scroll,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function PublicAuthorDetailsComponent() {
  const { id } = useParams<{ id: string }>();
  const [author, setAuthor] = useState<AuthorWithBooks | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchAuthorData(id);
    }
  }, [id]);

  const fetchAuthorData = async (authorId: string) => {
    setLoading(true);
    setError(null);

    try {
      const authorData = await authorService.getAuthorById(Number(authorId));
      setAuthor(authorData);
    } catch (error) {
      console.error('Error fetching author details:', error);
      setError('Failed to load author details. Please try again later.');
      toast.error('Failed to load author details');
    } finally {
      setLoading(false);
    }
  };

  // Format birth date for display
  const formatBirthDate = (date?: string) => {
    if (!date) return '';

    // If it's a historical date like "6th cent. B.C.", return as-is
    if (
      date.includes('cent.') ||
      date.includes('B.C.') ||
      date.includes('A.D.')
    ) {
      return date;
    }

    // For standard dates, extract year
    try {
      const year = new Date(date).getFullYear();
      return isNaN(year) ? date : year.toString();
    } catch {
      return date;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col justify-center items-center h-64 gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-amber-600" />
          <span className="text-lg text-gray-600 dark:text-gray-300">
            Loading author information...
          </span>
        </div>
      </div>
    );
  }

  if (error || !author) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
            Author Not Found
          </h2>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            {error || "The author you're looking for could not be found."}
          </p>
          <Button asChild variant="outline">
            <Link to="/authors">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Authors
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const avatarUrl =
    author.photo_url ||
    `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(author.name)}`;

  const rating = 4.7; // Default rating - can be calculated from reviews if available

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Back button */}
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm">
          <Link to="/authors">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Authors
          </Link>
        </Button>
      </div>

      {/* Main Scroll Container */}
      <div className="relative max-w-4xl mx-auto">
        {/* Scroll Top Roller */}
        <div className="relative h-5 mb-3">
          <div className="absolute inset-0 bg-linear-to-b from-amber-800 to-amber-700 dark:from-amber-900 dark:to-amber-800 rounded-full shadow-xl" />
          <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-1.5 bg-amber-900 dark:bg-amber-950 opacity-30" />
          {/* Decorative knobs */}
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-amber-950 dark:bg-amber-900 rounded-full shadow-md" />
          <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-amber-950 dark:bg-amber-900 rounded-full shadow-md" />
        </div>

        {/* Main Scroll Paper */}
        <Card
          className={cn(
            'relative overflow-visible flex flex-col',
            // Parchment/vintage paper effect
            'bg-linear-to-br from-amber-50 via-yellow-50 to-amber-100',
            'dark:from-amber-950 dark:via-yellow-950 dark:to-amber-900',
            'border-x-8 border-amber-700 dark:border-amber-800',
            'border-y-0',
            'shadow-[8px_0_16px_rgba(120,53,15,0.25),-8px_0_16px_rgba(120,53,15,0.25)]',
          )}
        >
          {/* Decorative scroll top edge */}
          <div className="absolute -top-1 left-0 right-0 h-2 bg-linear-to-r from-transparent via-amber-600 dark:via-amber-800 to-transparent" />

          {/* Content */}
          <div className="relative px-8 py-12 md:px-12 md:py-16">
            {/* Header Section */}
            <div className="flex flex-col items-center mb-10">
              {/* Ornamental top divider */}
              <div className="w-full flex items-center justify-center mb-8">
                <div className="flex-1 h-px bg-linear-to-r from-transparent via-amber-500 dark:via-amber-700 to-transparent" />
                <Scroll className="mx-4 w-6 h-6 text-amber-600 dark:text-amber-500" />
                <div className="flex-1 h-px bg-linear-to-r from-transparent via-amber-500 dark:via-amber-700 to-transparent" />
              </div>

              {/* Author Image */}
              <div className="relative mb-6">
                <div className="w-40 h-40 rounded-full overflow-hidden border-[6px] border-amber-600 dark:border-amber-700 shadow-2xl bg-white dark:bg-gray-800">
                  <img
                    src={avatarUrl}
                    alt={author.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(author.name)}`;
                    }}
                  />
                </div>
              </div>

              {/* Author Name */}
              <h1
                className="text-4xl md:text-5xl font-bold text-center text-amber-950 dark:text-amber-50 mb-4 tracking-wide leading-tight"
                style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}
              >
                {author.name}
              </h1>

              {/* Birth Date */}
              {author.birth_date && (
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                  <p
                    className="text-base text-amber-800 dark:text-amber-300"
                    style={{ fontFamily: "'Merriweather', 'Georgia', serif" }}
                  >
                    Born: {formatBirthDate(author.birth_date)}
                  </p>
                </div>
              )}

              {/* Star Rating */}
              <div className="flex items-center gap-2 mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'w-6 h-6',
                      i < Math.floor(rating)
                        ? 'fill-amber-500 text-amber-500'
                        : 'fill-none text-amber-400 dark:text-amber-600',
                    )}
                  />
                ))}
              </div>
              <p
                className="text-3xl font-semibold text-amber-900 dark:text-amber-100"
                style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}
              >
                {rating.toFixed(1)}/5
              </p>
            </div>

            {/* Biography Section */}
            {author.biography && (
              <div className="mb-10">
                <div className="w-32 h-px bg-amber-400 dark:bg-amber-700 mx-auto mb-6" />
                <h2
                  className="text-2xl font-bold text-amber-900 dark:text-amber-100 mb-4 text-center"
                  style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}
                >
                  About the Author
                </h2>
                <p
                  className="text-base text-amber-900 dark:text-amber-100 leading-relaxed text-center max-w-3xl mx-auto italic"
                  style={{ fontFamily: "'Merriweather', 'Georgia', serif" }}
                >
                  {author.biography}
                </p>
              </div>
            )}

            {/* Published Books Section */}
            <div className="mb-8">
              <div className="w-full flex items-center justify-center mb-6">
                <div className="flex-1 h-px bg-linear-to-r from-transparent via-amber-500 dark:via-amber-700 to-transparent" />
                <div className="mx-4 flex items-center gap-2">
                  <div className="w-3 h-3 rotate-45 bg-amber-500 dark:bg-amber-600" />
                  <BookIcon className="w-5 h-5 text-amber-600 dark:text-amber-500" />
                  <div className="w-3 h-3 rotate-45 bg-amber-500 dark:bg-amber-600" />
                </div>
                <div className="flex-1 h-px bg-linear-to-r from-transparent via-amber-500 dark:via-amber-700 to-transparent" />
              </div>

              <h2
                className="text-2xl font-bold text-amber-900 dark:text-amber-100 mb-6 text-center"
                style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}
              >
                Published Works
              </h2>

              {author.books && author.books.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
                  {author.books.map((book) => (
                    <Link
                      key={book.id}
                      to={`/books/${book.id}`}
                      className="group"
                    >
                      <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-100/50 dark:bg-amber-900/20 border-2 border-amber-300 dark:border-amber-700 hover:border-amber-500 dark:hover:border-amber-500 transition-all duration-200 hover:shadow-md">
                        <BookIcon className="w-5 h-5 mt-0.5 shrink-0 text-amber-600 dark:text-amber-500" />
                        <div className="flex-1 min-w-0">
                          <h3
                            className="font-semibold text-amber-950 dark:text-amber-50 group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors line-clamp-2"
                            style={{
                              fontFamily: "'Merriweather', 'Georgia', serif",
                            }}
                          >
                            {book.title}
                          </h3>
                          {book.published_date && (
                            <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                              Published:{' '}
                              {new Date(book.published_date).getFullYear()}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p
                  className="text-center text-amber-700 dark:text-amber-400 italic"
                  style={{ fontFamily: "'Merriweather', 'Georgia', serif" }}
                >
                  No published books available yet
                </p>
              )}

              {author.books && author.books.length > 0 && (
                <div className="text-center mt-6">
                  <Badge
                    variant="secondary"
                    className="bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 px-4 py-2"
                  >
                    <BookIcon className="w-4 h-4 mr-2" />
                    {author.books.length} Published{' '}
                    {author.books.length === 1 ? 'Book' : 'Books'}
                  </Badge>
                </div>
              )}
            </div>

            {/* Bottom ornamental divider */}
            <div className="w-full flex items-center justify-center mt-10">
              <div className="flex-1 h-px bg-linear-to-r from-transparent via-amber-500 dark:via-amber-700 to-transparent" />
              <Scroll className="mx-4 w-6 h-6 text-amber-600 dark:text-amber-500" />
              <div className="flex-1 h-px bg-linear-to-r from-transparent via-amber-500 dark:via-amber-700 to-transparent" />
            </div>
          </div>

          {/* Decorative scroll bottom edge */}
          <div className="absolute -bottom-1 left-0 right-0 h-2 bg-linear-to-r from-transparent via-amber-600 dark:via-amber-800 to-transparent" />

          {/* Subtle paper texture overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-10"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`,
            }}
          />
        </Card>

        {/* Scroll Bottom Roller */}
        <div className="relative h-5 mt-3">
          <div className="absolute inset-0 bg-linear-to-t from-amber-800 to-amber-700 dark:from-amber-900 dark:to-amber-800 rounded-full shadow-xl" />
          <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-1.5 bg-amber-900 dark:bg-amber-950 opacity-30" />
          {/* Decorative knobs */}
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-amber-950 dark:bg-amber-900 rounded-full shadow-md" />
          <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-amber-950 dark:bg-amber-900 rounded-full shadow-md" />
        </div>
      </div>
    </div>
  );
}
