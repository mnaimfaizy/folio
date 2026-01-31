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
import { Bookmark, Eye, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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
    } catch (error) {
      console.error("Error fetching user collection:", error);
      toast.error("Failed to load your book collection.");
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
      toast.success("Book removed from your collection.");
    } catch (error) {
      toast.error("Failed to remove book from collection.");
      console.error("Error removing book from collection:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">Loading your collection...</div>
    );
  }

  if (!books || books.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <Bookmark className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-2xl font-semibold">Your collection is empty</h3>
        <p className="text-muted-foreground mt-2">
          Browse the book catalog and add books to your collection.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {books.map((book) => (
        <Card key={book.id} className="overflow-hidden flex flex-col">
          <div className="h-40 overflow-hidden">
            <img
              src={
                book.coverImage ||
                book.cover ||
                "https://via.placeholder.com/200x300?text=No+Cover"
              }
              alt={`${book.title} cover`}
              className="w-full h-full object-cover"
            />
          </div>
          <CardHeader className="p-4 pb-2">
            <div className="flex justify-between">
              <Badge variant="secondary" className="mb-2">
                In Your Collection
              </Badge>
            </div>
            <CardTitle className="text-lg line-clamp-2">{book.title}</CardTitle>
            <CardDescription>{book.author}</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-sm text-muted-foreground line-clamp-3">
              {book.description || "No description available."}
            </p>
          </CardContent>
          <CardFooter className="p-4 pt-0 mt-auto">
            <div className="flex space-x-2 w-full">
              <Button variant="outline" size="sm" className="flex-1">
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="flex-1"
                onClick={() => handleRemoveFromCollection(book.id!)}
              >
                <Trash className="h-4 w-4 mr-1" />
                Remove
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
