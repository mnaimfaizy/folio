import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'sonner';
import bookService from '@/services/bookService';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  BookOpen,
  BarChart4,
  Hash,
  ChevronLeft,
  Bookmark,
  BookMarked,
  Pencil,
  AlertTriangle,
  Loader2,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Library,
  FileText,
  Info,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReviewListComponent } from './ReviewListComponent';
import { ReviewFormComponent } from './ReviewFormComponent';
import { StarRating } from '@/components/ui/star-rating';
import { useSettings } from '@/context/SettingsContext';

// Define enhanced interface for book details from API
interface BookDetails {
  id: number;
  title: string;
  isbn: string;
  isbn10?: string;
  isbn13?: string;
  description: string;
  published_date: string;
  publish_year?: number;
  page_count?: number;
  cover_image_url: string;
  available_copies: number;
  rating: number;
  genre: string;
  authors: Array<{
    id: number;
    name: string;
    biography?: string;
    photo_url?: string;
    is_primary: boolean;
  }>;
}

// Interface for similar books
interface SimilarBook {
  id: number;
  title: string;
  cover_image_url?: string;
}

export function BookDetailsComponent() {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { settings } = useSettings();

  const [book, setBook] = useState<BookDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [similarBooks, setSimilarBooks] = useState<SimilarBook[]>([]);
  const [reviewRefreshTrigger, setReviewRefreshTrigger] = useState(0);

  // Check if the book is in the user's collection
  const [isInCollection, setIsInCollection] = useState<boolean>(false);
  const [collectionLoading, setCollectionLoading] = useState<boolean>(false);
  const [borrowLoading, setBorrowLoading] = useState<boolean>(false);

  useEffect(() => {
    if (bookId) {
      fetchBookDetails(bookId);
      if (isAuthenticated) {
        checkIfInCollection(bookId);
      }
    }
  }, [bookId, isAuthenticated]);

  const fetchBookDetails = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const data = await bookService.getBookById(Number(id));
      if (!data) {
        setError('Book not found');
        setLoading(false);
        return;
      }

      // Convert from Book format to BookDetails format
      const bookDetails: BookDetails = {
        id: data.id!,
        title: data.title,
        isbn: data.isbn || '',
        isbn10: data.isbn10 || undefined,
        isbn13: data.isbn13 || undefined,
        description: data.description || '',
        published_date: data.publishedDate || '',
        publish_year: data.publishYear || undefined,
        page_count: data.pages ?? undefined,
        cover_image_url: data.cover || data.coverImage || '',
        available_copies: Number(
          data.availableCopies ?? data.available_copies ?? 0,
        ),
        rating: 0, // Default if not provided
        genre: data.genre || '',
        authors: data.authors
          ? data.authors.map((author) => ({
              // Ensure id is always a number (not undefined)
              id: author.id || 0,
              name: author.name,
              biography: author.biography,
              photo_url: author.photo_url,
              is_primary: author.is_primary || false,
            }))
          : [],
      };

      setBook(bookDetails);

      // Fetch similar books based on genre, author, and description
      try {
        const allBooks = await bookService.getAllBooks();
        const currentId = Number(id);

        // Parse all genres for the current book (comma-separated)
        const currentGenres = bookDetails.genre
          ? bookDetails.genre
              .split(',')
              .map((g) => g.trim().toLowerCase())
              .filter(Boolean)
          : [];

        // Collect current book's author ids and names for matching
        const currentAuthorIds = new Set(bookDetails.authors.map((a) => a.id));
        const currentAuthorNames = new Set(
          bookDetails.authors.map((a) => a.name.toLowerCase()),
        );

        // Meaningful keywords from the description (words longer than 4 chars)
        const descriptionKeywords = new Set(
          (bookDetails.description || '')
            .toLowerCase()
            .split(/\W+/)
            .filter((w) => w.length > 4),
        );

        const scoredBooks = allBooks
          // Always exclude the book currently being viewed (coerce to number to
          // handle PostgreSQL BIGSERIAL IDs that pg returns as strings)
          .filter((b) => b.id != null && Number(b.id) !== currentId)
          .map((b) => {
            let score = 0;

            // Genre overlap: +3 per matching genre
            if (currentGenres.length > 0 && b.genre) {
              const bookGenres = b.genre
                .split(',')
                .map((g) => g.trim().toLowerCase());
              const genreMatches = bookGenres.filter((g) =>
                currentGenres.includes(g),
              ).length;
              score += genreMatches * 3;
            }

            // Author overlap: +5 per matching author
            if (
              (currentAuthorIds.size > 0 || currentAuthorNames.size > 0) &&
              b.authors
            ) {
              const authorMatches = b.authors.filter(
                (a) =>
                  currentAuthorIds.has(a.id) ||
                  currentAuthorNames.has(a.name.toLowerCase()),
              ).length;
              score += authorMatches * 5;
            }

            // Description keyword overlap: +1 per shared keyword (capped at 5)
            if (descriptionKeywords.size > 0 && b.description) {
              const bookWords = new Set(
                b.description
                  .toLowerCase()
                  .split(/\W+/)
                  .filter((w) => w.length > 4),
              );
              const wordMatches = [...bookWords].filter((w) =>
                descriptionKeywords.has(w),
              ).length;
              score += Math.min(wordMatches, 5);
            }

            return { book: b, score };
          })
          .sort((a, b) => b.score - a.score)
          .slice(0, 4)
          .map(({ book: b }) => ({
            id: Number(b.id!),
            title: b.title,
            cover_image_url: b.cover || b.coverImage || '',
          }));

        setSimilarBooks(scoredBooks);
      } catch (recError) {
        console.warn('Error fetching similar books:', recError);
        // Non-critical error, don't show to user
      }
    } catch (error) {
      console.error('Error fetching book details:', error);
      setError('Failed to load book details. Please try again later.');
      toast.error('Failed to load book details');
    } finally {
      setLoading(false);
    }
  };

  const checkIfInCollection = async (bookId: string) => {
    setCollectionLoading(true);
    try {
      const isInCollection = await bookService.isBookInUserCollection(
        Number(bookId),
      );
      setIsInCollection(isInCollection);
    } catch (error) {
      console.error('Error checking collection status:', error);
      // Don't show error to user as this is a secondary feature
    } finally {
      setCollectionLoading(false);
    }
  };

  const toggleCollection = async () => {
    if (!book) return;

    if (!isAuthenticated) {
      navigate(`/login?returnUrl=${encodeURIComponent(`/books/${book.id}`)}`);
      return;
    }

    setCollectionLoading(true);
    try {
      if (isInCollection) {
        await bookService.removeFromUserCollection(book.id);
        toast.success('Book removed from your collection');
      } else {
        await bookService.addToUserCollection(book.id);
        toast.success('Book added to your collection');
      }
      setIsInCollection(!isInCollection);
    } catch (error) {
      console.error('Error updating collection:', error);
      toast.error('Failed to update collection');
    } finally {
      setCollectionLoading(false);
    }
  };

  const handleReviewSubmitted = () => {
    // Trigger a refresh of the reviews list
    setReviewRefreshTrigger((prev) => prev + 1);
  };

  const handleBorrowBook = async () => {
    if (!book) return;

    if (!isAuthenticated) {
      navigate(`/login?returnUrl=${encodeURIComponent(`/books/${book.id}`)}`);
      return;
    }

    try {
      setBorrowLoading(true);
      const success = await bookService.borrowBook(book.id);

      if (!success) {
        toast.error('Unable to borrow this book right now');
        return;
      }

      toast.success('Loan request submitted. Track status in My Loans.');
    } catch (error) {
      console.error('Error borrowing book:', error);
      toast.error('Failed to borrow book');
    } finally {
      setBorrowLoading(false);
    }
  };

  const coverFallback = `https://placehold.co/400x600/1e293b/94a3b8?text=${encodeURIComponent(book?.title?.slice(0, 12) ?? 'Book')}`;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col justify-center items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
        <p className="text-lg text-gray-500 dark:text-gray-400 animate-pulse">
          Loading book details…
        </p>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-lg text-center">
        <div className="p-10 rounded-2xl bg-red-50 dark:bg-gray-800 border border-red-100 dark:border-gray-700 shadow-lg">
          <AlertTriangle className="h-14 w-14 text-red-400 mx-auto mb-5" />
          <h2 className="text-2xl font-bold mb-3">Book Not Found</h2>
          <p className="mb-7 text-gray-500 dark:text-gray-400">
            {error || "The book you're looking for couldn't be found."}
          </p>
          <Button asChild size="lg">
            <Link to="/my-books">Return to Books Catalog</Link>
          </Button>
        </div>
      </div>
    );
  }

  const coverUrl = book.cover_image_url || coverFallback;

  return (
    <div className="min-h-screen">
      {/* ── Hero Banner ─────────────────────────────────────────── */}
      <div className="relative h-72 md:h-80 overflow-hidden">
        {/* blurred backdrop */}
        <img
          src={coverUrl}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-40 dark:opacity-25 pointer-events-none select-none"
        />
        <div className="absolute inset-0 bg-linear-to-b from-black/30 via-black/20 to-background" />

        {/* Nav row inside hero */}
        <div className="relative z-10 container mx-auto px-4 pt-6 flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm border border-white/20 rounded-full px-4"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          {isAuthenticated && (
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm border border-white/20 rounded-full px-4"
            >
              <Link to="/my-books/collection">
                <Library className="h-4 w-4 mr-2" />
                My Collection
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* ── Main Content ─────────────────────────────────────────── */}
      <div className="container mx-auto px-4 -mt-40 md:-mt-44 relative z-10 pb-16">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* ── Left: Cover + Actions ──────────────────────────── */}
          <div className="w-full lg:w-64 xl:w-72 shrink-0 lg:sticky lg:top-24">
            {/* Cover */}
            <div className="relative group mx-auto w-48 lg:w-full">
              <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-blue-500/30 to-purple-500/20 blur-xl scale-95 opacity-70 group-hover:opacity-100 transition-opacity" />
              <img
                src={coverUrl}
                alt={`${book.title} cover`}
                className="relative w-full rounded-2xl object-cover shadow-2xl ring-1 ring-black/10 dark:ring-white/10 transition-transform duration-300 group-hover:-translate-y-1"
                style={{ aspectRatio: '2/3' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = coverFallback;
                }}
              />
            </div>

            {/* Availability pill */}
            <div className="mt-5 flex justify-center lg:justify-start">
              {book.available_copies > 0 ? (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  {book.available_copies}{' '}
                  {book.available_copies === 1 ? 'copy' : 'copies'} available
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1 rounded-full bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400">
                  <XCircle className="h-4 w-4" />
                  Not available
                </span>
              )}
            </div>

            {/* Action buttons */}
            <div className="mt-4 space-y-3">
              {settings.loans_enabled &&
                (book.available_copies > 0 ? (
                  <Button
                    className="w-full gap-2 rounded-xl h-11 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-lg shadow-blue-500/25"
                    onClick={handleBorrowBook}
                    disabled={borrowLoading}
                  >
                    {borrowLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <BookOpen className="h-4 w-4" />
                    )}
                    Request Loan
                  </Button>
                ) : (
                  <Button
                    className="w-full gap-2 rounded-xl h-11"
                    variant="secondary"
                    disabled
                  >
                    <BookOpen className="h-4 w-4" />
                    Not Available
                  </Button>
                ))}

              <Button
                variant={isInCollection ? 'secondary' : 'outline'}
                className={`w-full gap-2 rounded-xl h-11 transition-all ${
                  isInCollection
                    ? 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800'
                    : ''
                }`}
                onClick={toggleCollection}
                disabled={collectionLoading}
              >
                {collectionLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isInCollection ? (
                  <BookMarked className="h-4 w-4" />
                ) : (
                  <Bookmark className="h-4 w-4" />
                )}
                {isInCollection ? 'In My Collection' : 'Add to Collection'}
              </Button>

              {user?.role === 'ADMIN' && (
                <Button
                  variant="outline"
                  className="w-full gap-2 rounded-xl h-11 border-dashed"
                  asChild
                >
                  <Link to={`/books/edit/${book.id}`}>
                    <Pencil className="h-4 w-4" />
                    Edit Book
                  </Link>
                </Button>
              )}
            </div>

            {/* Quick stats */}
            {(book.page_count || book.publish_year || book.published_date) && (
              <div className="mt-6 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-800/60 backdrop-blur-sm divide-y divide-gray-200 dark:divide-gray-700 overflow-hidden">
                {book.page_count && book.page_count > 0 && (
                  <div className="flex items-center gap-3 px-4 py-3">
                    <BarChart4 className="h-4 w-4 text-blue-500 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Pages
                      </p>
                      <p className="text-sm font-semibold">{book.page_count}</p>
                    </div>
                  </div>
                )}
                {(book.publish_year || book.published_date) && (
                  <div className="flex items-center gap-3 px-4 py-3">
                    <Calendar className="h-4 w-4 text-blue-500 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Published
                      </p>
                      <p className="text-sm font-semibold">
                        {book.publish_year
                          ? book.publish_year
                          : format(
                              new Date(book.published_date),
                              'MMM d, yyyy',
                            )}
                      </p>
                    </div>
                  </div>
                )}
                {book.isbn && (
                  <div className="flex items-center gap-3 px-4 py-3">
                    <Hash className="h-4 w-4 text-blue-500 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        ISBN
                      </p>
                      <p className="text-sm font-semibold font-mono">
                        {book.isbn}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Right: Details ─────────────────────────────────── */}
          <div className="flex-1 min-w-0 mt-4 lg:mt-36">
            {/* Title block */}
            <div className="mb-6">
              {/* Genre badges */}
              {book.genre && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {book.genre.split(',').map((g, i) => (
                    <Badge
                      key={i}
                      variant="secondary"
                      className="rounded-full px-3 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-0"
                    >
                      {g.trim()}
                    </Badge>
                  ))}
                </div>
              )}

              <h1 className="text-3xl md:text-4xl xl:text-5xl font-bold tracking-tight leading-tight">
                {book.title}
              </h1>

              {book.rating > 0 && (
                <div className="flex items-center gap-2 mt-3">
                  <StarRating rating={book.rating} />
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {book.rating.toFixed(1)}
                  </span>
                </div>
              )}
            </div>

            {/* Authors */}
            {book.authors.length > 0 && (
              <div className="mb-8">
                <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
                  Authors
                </h2>
                <div className="flex flex-wrap gap-3">
                  {book.authors.map((author) => (
                    <Link
                      key={author.id}
                      to={`/authors/${encodeURIComponent(author.name)}`}
                      className="group flex items-center gap-3 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all"
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 ring-2 ring-white dark:ring-gray-800 shrink-0">
                        <img
                          src={
                            author.photo_url ||
                            `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(author.name)}`
                          }
                          alt={author.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {author.name}
                        </p>
                        {author.is_primary && (
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            Primary Author
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Divider */}
            <hr className="border-gray-200 dark:border-gray-700 mb-8" />

            {/* Tabs */}
            <Tabs defaultValue="description">
              <TabsList className="mb-6 h-10 rounded-xl bg-gray-100 dark:bg-gray-800/80 p-1 gap-1">
                <TabsTrigger
                  value="description"
                  className="rounded-lg gap-1.5 text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm"
                >
                  <FileText className="h-3.5 w-3.5" />
                  Description
                </TabsTrigger>
                <TabsTrigger
                  value="details"
                  className="rounded-lg gap-1.5 text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm"
                >
                  <Info className="h-3.5 w-3.5" />
                  Details
                </TabsTrigger>
                <TabsTrigger
                  value="reviews"
                  className="rounded-lg gap-1.5 text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  Reviews
                </TabsTrigger>
              </TabsList>

              {/* Description */}
              <TabsContent value="description">
                {book.description ? (
                  <div
                    className="prose prose-gray dark:prose-invert max-w-none leading-relaxed text-gray-700 dark:text-gray-300"
                    dangerouslySetInnerHTML={{ __html: book.description }}
                  />
                ) : (
                  <div className="flex flex-col items-center py-12 text-center text-gray-400 dark:text-gray-500">
                    <FileText className="h-10 w-10 mb-3 opacity-40" />
                    <p className="italic">
                      No description available for this book.
                    </p>
                  </div>
                )}
              </TabsContent>

              {/* Details */}
              <TabsContent value="details">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    {
                      icon: BookOpen,
                      label: 'ISBN',
                      value: book.isbn || 'N/A',
                    },
                    {
                      icon: Hash,
                      label: 'ISBN-10',
                      value: book.isbn10 || 'N/A',
                    },
                    {
                      icon: Hash,
                      label: 'ISBN-13',
                      value: book.isbn13 || 'N/A',
                    },
                    {
                      icon: Calendar,
                      label: 'Published',
                      value: book.publish_year
                        ? String(book.publish_year)
                        : book.published_date
                          ? format(
                              new Date(book.published_date),
                              'MMMM d, yyyy',
                            )
                          : 'Unknown',
                    },
                    {
                      icon: BarChart4,
                      label: 'Pages',
                      value:
                        typeof book.page_count === 'number' &&
                        book.page_count > 0
                          ? String(book.page_count)
                          : 'Unknown',
                    },
                  ].map(({ icon: Icon, label, value }) => (
                    <div
                      key={label}
                      className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700"
                    >
                      <div className="w-9 h-9 shrink-0 flex items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/40">
                        <Icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">
                          {label}
                        </p>
                        <p className="font-semibold text-sm mt-0.5">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Reviews */}
              <TabsContent value="reviews">
                <div className="space-y-8">
                  {isAuthenticated ? (
                    <ReviewFormComponent
                      bookId={book.id}
                      onReviewSubmitted={handleReviewSubmitted}
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-4 py-10 px-6 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-dashed border-gray-300 dark:border-gray-700 text-center">
                      <MessageSquare className="h-10 w-10 text-gray-300 dark:text-gray-600" />
                      <div>
                        <p className="font-semibold text-gray-700 dark:text-gray-300">
                          Share your thoughts
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Sign in to write a review for this book
                        </p>
                      </div>
                      <Button asChild size="sm" className="rounded-full px-6">
                        <Link
                          to={`/login?returnUrl=${encodeURIComponent(`/books/${book.id}`)}`}
                        >
                          Sign In to Review
                        </Link>
                      </Button>
                    </div>
                  )}

                  <ReviewListComponent
                    bookId={book.id}
                    key={`reviews-${reviewRefreshTrigger}`}
                    onReviewDeleted={handleReviewSubmitted}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* ── Similar Books ─────────────────────────────────── */}
        {similarBooks.length > 0 && (
          <div className="mt-16">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-500" />
              You may also like
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {similarBooks.map((simBook) => (
                <Link
                  key={simBook.id}
                  to={`/books/${simBook.id}`}
                  className="group"
                >
                  <div className="relative overflow-hidden rounded-xl aspect-2/3 bg-gray-200 dark:bg-gray-800 shadow-md group-hover:shadow-xl transition-all duration-300">
                    <img
                      src={
                        simBook.cover_image_url ||
                        `https://placehold.co/200x300/1e293b/94a3b8?text=${encodeURIComponent(simBook.title.slice(0, 10))}`
                      }
                      alt={simBook.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* overlay on hover */}
                    <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                      <p className="text-white text-sm font-semibold line-clamp-2 leading-tight">
                        {simBook.title}
                      </p>
                    </div>
                  </div>
                  <p className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300 line-clamp-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {simBook.title}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
