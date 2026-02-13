import { Button } from '@/components/ui/button';
import { BookCard } from '@/components/ui/book-card';
import BookService, { Book } from '@/services/bookService';
import { Bookmark, BookOpen, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export function UserCollectionComponent() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch user's collection on component mount
  useEffect(() => {
    fetchUserCollection();
  }, []);

  const fetchUserCollection = async () => {
    try {
      setLoading(true);
      const response = await BookService.getUserCollection();

      // BookService.getUserCollection returns Book[] directly
      setBooks(response);
    } catch (error: any) {
      console.error('Error fetching user collection:', error);

      // Provide specific error message for auth errors
      if (error?.response?.status === 401) {
        toast.error('Please log in to view your collection.');
      } else {
        toast.error('Failed to load your book collection.');
      }
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromCollection = async (bookId: number) => {
    try {
      await BookService.removeFromUserCollection(bookId);
      // Remove book from local state
      setBooks(books.filter((book) => book.id !== bookId));
      toast.success('Book removed from your collection.');
    } catch (error) {
      toast.error('Failed to remove book from collection.');
      console.error('Error removing book from collection:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <span className="text-lg text-gray-600 dark:text-gray-300">
          Loading your collection...
        </span>
      </div>
    );
  }

  if (!books || books.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
        <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
          <Bookmark className="h-10 w-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Your collection is empty
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md">
          Browse the book catalog and add books to your collection.
        </p>
        <Button asChild className="mt-6">
          <Link to="/my-books">
            <BookOpen className="h-4 w-4 mr-2" />
            Browse Books
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {books.map((book) => (
        <BookCard
          key={book.id}
          id={book.id}
          title={book.title}
          author={book.author}
          genre={book.genre}
          publishYear={
            book.publishYear ||
            (book.publishedDate
              ? new Date(book.publishedDate).getFullYear()
              : undefined)
          }
          description={book.description}
          coverImage={book.coverImage}
          cover={book.cover}
          rating={4.5}
          isInCollection={true}
          showCollectionButton={true}
          onRemoveFromCollection={handleRemoveFromCollection}
        />
      ))}
    </div>
  );
}
