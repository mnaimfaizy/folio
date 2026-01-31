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
import { Input } from "@/components/ui/input";
import BookService from "@/services/bookService";
import { Eye, Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

interface PublicBook {
  id?: number;
  title: string;
  author?: string;
  genre?: string;
  publishYear?: number;
  description?: string;
  coverImage?: string;
  cover?: string;
}

export function PublicBooksComponent() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [booksPerPage] = useState<number>(12);
  const [books, setBooks] = useState<PublicBook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setIsLoading(true);
        const response = await BookService.getAllBooks();
        setBooks(response);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to fetch books")
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
          book.genre?.toLowerCase().includes(query)
      );
    },
    [searchQuery]
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

  const renderRating = (rating?: number) => {
    if (!rating) return null;
    return (
      <div className="flex items-center gap-1">
        <span className="text-sm font-medium">{rating.toFixed(1)}</span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <span className="ml-4 text-lg">Loading books catalog...</span>
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Book Catalog</h1>
        <div className="search-container w-1/3">
          <Input
            type="text"
            placeholder="Search by title, author, or genre..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full"
          />
        </div>
      </div>

      {currentBooks.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <h3 className="text-2xl font-semibold">No books found</h3>
          <p className="text-muted-foreground mt-2">
            Try adjusting your search criteria.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
            {currentBooks.map((book: PublicBook) => (
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
                    <Badge variant="outline">
                      {book.genre || "Uncategorized"}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg line-clamp-2">
                    {book.title}
                  </CardTitle>
                  <CardDescription>
                    {book.author}{" "}
                    {book.publishYear ? `(${book.publishYear})` : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <div className="flex items-center">{renderRating(4.5)}</div>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {book.description || "No description available."}
                  </p>
                </CardContent>
                <CardFooter className="p-4 pt-0 mt-auto">
                  <div className="flex justify-center w-full">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      asChild
                    >
                      <Link to={`/books/${book.id}`}>
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Link>
                    </Button>
                  </div>
                </CardFooter>
              </Card>
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
                // Logic to always show current page and some adjacent pages
                let pageNum;
                if (totalPages <= 5) {
                  // If 5 or fewer total pages, show all
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  // Near the start
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  // Near the end
                  pageNum = totalPages - 4 + i;
                } else {
                  // Middle case
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
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
    </div>
  );
}
