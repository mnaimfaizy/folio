import { Button } from '@/components/ui/button';
import { BookCard } from '@/components/ui/book-card';
import BookService, { Book } from '@/services/bookService';
import { BookOpen, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export function BooksCatalogComponent() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [userCollection, setUserCollection] = useState<number[]>([]);

  useEffect(() => {
    fetchBooks();
    fetchUserCollection();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await BookService.getAllBooks();

      // Handle the response properly
      if (Array.isArray(response)) {
        setBooks(response);
      } else {
        console.error('Unexpected API response format:', response);
        setBooks([]);
        toast.error('Received invalid data format from API');
      }
    } catch (error) {
      console.error('Error fetching books:', error);
      toast.error('Failed to load books catalog.');
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserCollection = async () => {
    try {
      const response = await BookService.getUserCollection();
      if (Array.isArray(response)) {
        const bookIds = response
          .map((book) => book.id)
          .filter(Boolean) as number[];
        setUserCollection(bookIds);
      }
    } catch (error) {
      console.error('Error fetching user collection:', error);
      setUserCollection([]);
    }
  };

  const handleAddToCollection = async (bookId: number) => {
    try {
      await BookService.addToUserCollection(bookId);
      setUserCollection((prev) => [...prev, bookId]);
      toast.success('Book added to your collection.');
    } catch (error) {
      console.error('Error adding book to collection:', error);
      toast.error('Failed to add book to collection.');
    }
  };

  const handleRemoveFromCollection = async (bookId: number) => {
    try {
      await BookService.removeFromUserCollection(bookId);
      setUserCollection((prev) => prev.filter((id) => id !== bookId));
      toast.success('Book removed from your collection.');
    } catch (error) {
      console.error('Error removing book from collection:', error);
      toast.error('Failed to remove book from collection.');
    }
  };

  const isInCollection = (bookId: number) => userCollection.includes(bookId);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <span className="text-lg text-gray-600 dark:text-gray-300">
          Loading books catalog...
        </span>
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
          <BookOpen className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          No books found
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md">
          Add some books to the catalog to get started.
        </p>
        <Button asChild className="mt-6">
          <Link to="/books/create">Add Your First Book</Link>
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
          isInCollection={isInCollection(book.id!)}
          showCollectionButton={true}
          onAddToCollection={handleAddToCollection}
          onRemoveFromCollection={handleRemoveFromCollection}
        />
      ))}
    </div>
  );
}
