import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import BookService, { Book } from "@/services/bookService";
import { BookmarkCheck, BookmarkPlus, Eye, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

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
        console.error("Unexpected API response format:", response);
        setBooks([]);
        toast.error("Received invalid data format from API");
      }
    } catch (error) {
      console.error("Error fetching books:", error);
      toast.error("Failed to load books catalog.");
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
      console.error("Error fetching user collection:", error);
      setUserCollection([]);
    }
  };

  const handleAddToCollection = async (bookId: number) => {
    try {
      await BookService.addToUserCollection(bookId);
      setUserCollection((prev) => [...prev, bookId]);
      toast.success("Book added to your collection.");
    } catch (error) {
      console.error("Error adding book to collection:", error);
      toast.error("Failed to add book to collection.");
    }
  };

  const handleRemoveFromCollection = async (bookId: number) => {
    try {
      await BookService.removeFromUserCollection(bookId);
      setUserCollection((prev) => prev.filter((id) => id !== bookId));
      toast.success("Book removed from your collection.");
    } catch (error) {
      console.error("Error removing book from collection:", error);
      toast.error("Failed to remove book from collection.");
    }
  };

  const isInCollection = (bookId: number) => userCollection.includes(bookId);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <span className="ml-4 text-lg">Loading books catalog...</span>
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <h3 className="text-2xl font-semibold">No books found</h3>
        <p className="text-muted-foreground mt-2">
          Add some books to the catalog to get started.
        </p>
        <Button asChild className="mt-4">
          <Link to="/books/create">Add Your First Book</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {books.map((book) => (
        <Card
          key={book.id}
          className="overflow-hidden flex flex-col py-0 gap-1"
        >
          <div className="h-40 overflow-hidden">
            <img
              src={
                book.coverImage ||
                book.cover ||
                "https://via.placeholder.com/200x300?text=No+Cover"
              }
              alt={`${book.title} cover`}
              className="w-full h-full object-cover transition-transform hover:scale-105"
            />
          </div>
          <CardHeader className="p-4 pb-0">
            <div className="flex justify-between items-center">
              {isInCollection(book.id!) && (
                <Badge variant="secondary" className="mb-2">
                  In Your Collection
                </Badge>
              )}
              <Badge variant="outline">{book.genre || "Uncategorized"}</Badge>
            </div>
            <CardTitle className="text-lg line-clamp-2">{book.title}</CardTitle>
            <CardDescription>
              {book.author}{" "}
              {book.publishedDate
                ? `(${new Date(book.publishedDate).getFullYear()})`
                : book.publishYear
                ? `(${book.publishYear})`
                : ""}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
              {book.description || "No description available."}
            </p>
          </CardContent>
          <CardFooter className="p-4 pt-0 mt-auto">
            <div className="flex space-x-2 w-full">
              <Button variant="outline" size="sm" className="flex-1" asChild>
                <Link to={`/books/${book.id}`}>
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Link>
              </Button>

              {isInCollection(book.id!) ? (
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleRemoveFromCollection(book.id!)}
                >
                  <BookmarkCheck className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleAddToCollection(book.id!)}
                >
                  <BookmarkPlus className="h-4 w-4 mr-1" />
                  Collect
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
