import bookService from '@/services/bookService';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

/* ================================================================
   Types
   ================================================================ */

export interface BookAuthor {
  id: number;
  name: string;
  biography?: string;
  photo_url?: string;
  is_primary: boolean;
}

export interface BookDetails {
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
  authors: BookAuthor[];
}

export interface SimilarBook {
  id: number;
  title: string;
  cover_image_url?: string;
}

/* ================================================================
   useBookDetails — fetch book, collection status, and loan actions
   ================================================================ */

export function useBookDetails(
  bookId: string | undefined,
  isAuthenticated: boolean,
) {
  const navigate = useNavigate();
  const [book, setBook] = useState<BookDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [similarBooks, setSimilarBooks] = useState<SimilarBook[]>([]);
  const [isInCollection, setIsInCollection] = useState(false);
  const [collectionLoading, setCollectionLoading] = useState(false);
  const [borrowLoading, setBorrowLoading] = useState(false);
  const [reviewRefreshTrigger, setReviewRefreshTrigger] = useState(0);

  useEffect(() => {
    if (bookId) {
      void fetchBookDetails(bookId);
      if (isAuthenticated) void checkIfInCollection(bookId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId, isAuthenticated]);

  const fetchBookDetails = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const data = await bookService.getBookById(Number(id));
      if (!data) {
        setError('Book not found');
        return;
      }

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
        rating: 0,
        genre: data.genre || '',
        authors: data.authors
          ? data.authors.map((author) => ({
              id: author.id || 0,
              name: author.name,
              biography: author.biography,
              photo_url: author.photo_url,
              is_primary: author.is_primary || false,
            }))
          : [],
      };

      setBook(bookDetails);

      // Fetch similar books
      try {
        const allBooks = await bookService.getAllBooks();
        const currentId = Number(id);

        const currentGenres = bookDetails.genre
          ? bookDetails.genre
              .split(',')
              .map((g) => g.trim().toLowerCase())
              .filter(Boolean)
          : [];
        const currentAuthorIds = new Set(bookDetails.authors.map((a) => a.id));
        const currentAuthorNames = new Set(
          bookDetails.authors.map((a) => a.name.toLowerCase()),
        );
        const descriptionKeywords = new Set(
          (bookDetails.description || '')
            .toLowerCase()
            .split(/\W+/)
            .filter((w) => w.length > 4),
        );

        const scoredBooks = allBooks
          .filter((b) => b.id != null && Number(b.id) !== currentId)
          .map((b) => {
            let score = 0;

            if (currentGenres.length > 0 && b.genre) {
              const bookGenres = b.genre
                .split(',')
                .map((g) => g.trim().toLowerCase());
              score +=
                bookGenres.filter((g) => currentGenres.includes(g)).length * 3;
            }

            if (
              (currentAuthorIds.size > 0 || currentAuthorNames.size > 0) &&
              b.authors
            ) {
              score +=
                b.authors.filter(
                  (a) =>
                    currentAuthorIds.has(a.id!) ||
                    currentAuthorNames.has(a.name.toLowerCase()),
                ).length * 5;
            }

            if (descriptionKeywords.size > 0 && b.description) {
              const bookWords = new Set(
                b.description
                  .toLowerCase()
                  .split(/\W+/)
                  .filter((w) => w.length > 4),
              );
              score += Math.min(
                [...bookWords].filter((w) => descriptionKeywords.has(w)).length,
                5,
              );
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
      }
    } catch (err) {
      console.error('Error fetching book details:', err);
      setError('Failed to load book details. Please try again later.');
      toast.error('Failed to load book details');
    } finally {
      setLoading(false);
    }
  };

  const checkIfInCollection = async (id: string) => {
    setCollectionLoading(true);
    try {
      const inCollection = await bookService.isBookInUserCollection(Number(id));
      setIsInCollection(inCollection);
    } catch (err) {
      console.error('Error checking collection status:', err);
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
      setIsInCollection((prev) => !prev);
    } catch (err) {
      console.error('Error updating collection:', err);
      toast.error('Failed to update collection');
    } finally {
      setCollectionLoading(false);
    }
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
    } catch (err) {
      console.error('Error borrowing book:', err);
      toast.error('Failed to borrow book');
    } finally {
      setBorrowLoading(false);
    }
  };

  const handleReviewSubmitted = () =>
    setReviewRefreshTrigger((prev) => prev + 1);

  return {
    book,
    loading,
    error,
    similarBooks,
    isInCollection,
    collectionLoading,
    borrowLoading,
    reviewRefreshTrigger,
    toggleCollection,
    handleBorrowBook,
    handleReviewSubmitted,
  };
}
