import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import BookService, { Book } from "@/services/bookService";
import { BookmarkCheck, BookmarkPlus, Edit, Eye, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export function BooksListComponent() {
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

      // Handle the response properly, ensuring it's an array
      if (Array.isArray(response)) {
        setBooks(response);
      } else if (
        response &&
        typeof response === "object" &&
        "books" in response
      ) {
        // If API returns {books: [...]} format
        setBooks(response as Book[]);
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

      // Handle the response properly, ensuring we get an array of books
      if (Array.isArray(response)) {
        const bookIds = response
          .map((book) => book.id as number)
          .filter(Boolean);
        setUserCollection(bookIds);
      } else if (
        response &&
        typeof response === "object" &&
        "books" in response
      ) {
        // If API returns {books: [...]} format
        const bookIds = (response as Book[])
          .map((book) => book.id as number)
          .filter(Boolean);
        setUserCollection(bookIds);
      } else {
        console.error(
          "Unexpected API response format for user collection:",
          response
        );
        setUserCollection([]);
      }
    } catch (error) {
      console.error("Error fetching user collection:", error);
      setUserCollection([]);
    }
  };

  const handleAddToCollection = async (bookId: number) => {
    try {
      await BookService.addToUserCollection(bookId);
      setUserCollection([...userCollection, bookId]);
      toast.success("Book added to your collection.");
    } catch (error) {
      toast.error("Failed to add book to collection.");
      console.error("Error adding book to collection:", error);
    }
  };

  const handleRemoveFromCollection = async (bookId: number) => {
    try {
      await BookService.removeFromUserCollection(bookId);
      setUserCollection(userCollection.filter((id) => id !== bookId));
      toast.success("Book removed from your collection.");
    } catch (error) {
      toast.error("Failed to remove book from collection.");
      console.error("Error removing book from collection:", error);
    }
  };

  const isInCollection = (bookId?: number) => {
    return bookId ? userCollection.includes(bookId) : false;
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading books...</div>;
  }

  if (!books || books.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <h3 className="text-2xl font-semibold">No books found</h3>
        <p className="text-muted-foreground mt-2">
          Add some books to the catalog to get started.
        </p>
        <Button className="mt-4" asChild>
          <Link to="/books/create">Add Your First Book</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Cover</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Author</TableHead>
            <TableHead>Collection</TableHead>
            <TableHead>Year</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {books.map((book) => (
            <TableRow key={book.id}>
              <TableCell>
                <img
                  src={
                    book.coverImage ||
                    book.cover ||
                    "https://via.placeholder.com/200x300?text=No+Cover"
                  }
                  alt={`${book.title} cover`}
                  className="w-16 h-20 object-cover rounded-sm"
                />
              </TableCell>
              <TableCell className="font-medium">{book.title}</TableCell>
              <TableCell>{book.author}</TableCell>
              <TableCell>
                {isInCollection(book.id) ? (
                  <Badge variant="secondary">In Collection</Badge>
                ) : (
                  <Badge variant="outline">Not Collected</Badge>
                )}
              </TableCell>
              <TableCell>
                {book.publishedDate
                  ? new Date(book.publishedDate).getFullYear()
                  : book.publishYear || "N/A"}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button size="icon" variant="ghost" asChild>
                    <Link to={`/books/${book.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                  {isInCollection(book.id) ? (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleRemoveFromCollection(book.id!)}
                    >
                      <BookmarkCheck className="h-4 w-4 text-primary" />
                    </Button>
                  ) : (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleAddToCollection(book.id!)}
                    >
                      <BookmarkPlus className="h-4 w-4" />
                    </Button>
                  )}
                  <Button size="icon" variant="ghost" asChild>
                    <Link to={`/books/edit/${book.id}`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="icon" variant="ghost" className="text-red-500">
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
