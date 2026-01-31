import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import authorService, { Author } from "@/services/authorService";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users,
  BookOpen,
  Search,
  ArrowUpDown,
  ChevronRight,
  Book as BookIcon,
  Loader2,
} from "lucide-react";

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
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeAlphabet, setActiveAlphabet] = useState<string>("ALL");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Generate alphabet array for filtering
  const alphabetArray = useMemo(() => {
    return "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
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
                authorDetails.name
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
              error
            );
            // Return basic info if we can't get details
            return {
              ...author,
              book_count: author.book_count || 0,
              photo_url: `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(
                author.name
              )}`,
              books: [],
            };
          }
        })
      );

      setAuthors(authorsWithDetails);
    } catch (error) {
      console.error("Error fetching authors:", error);
      toast.error("Failed to load authors catalog.");
    } finally {
      setLoading(false);
    }
  };

  // Filter authors based on search query and active alphabet
  const filteredAuthors = useMemo(() => {
    return authors
      .filter((author) => {
        const matchesSearch =
          searchQuery.trim() === "" ||
          author.name.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesAlphabet =
          activeAlphabet === "ALL" ||
          author.name.charAt(0).toUpperCase() === activeAlphabet;

        return matchesSearch && matchesAlphabet;
      })
      .sort((a, b) => {
        const nameA = a.name.toUpperCase();
        const nameB = b.name.toUpperCase();

        return sortOrder === "asc"
          ? nameA.localeCompare(nameB)
          : nameB.localeCompare(nameA);
      });
  }, [authors, searchQuery, activeAlphabet, sortOrder]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <span className="ml-4 text-lg">Loading authors...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center">
          <Users className="h-8 w-8 mr-3 text-blue-600" />
          <h1 className="text-3xl font-bold">Authors Directory</h1>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          className="flex items-center gap-2"
        >
          <ArrowUpDown className="h-4 w-4" />
          {sortOrder === "asc" ? "A-Z" : "Z-A"}
        </Button>
      </div>

      {/* Search Box */}
      <div className="relative max-w-md mx-auto mb-8">
        <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        <Input
          type="search"
          placeholder="Search authors..."
          className="pl-10 rounded-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Alphabet Filter */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg mb-8 overflow-x-auto">
        <div className="flex p-2 min-w-max">
          <Button
            variant={activeAlphabet === "ALL" ? "default" : "ghost"}
            className="rounded-full px-3 py-1 text-sm font-medium"
            onClick={() => setActiveAlphabet("ALL")}
          >
            ALL
          </Button>

          {alphabetArray.map((letter) => (
            <Button
              key={letter}
              variant={activeAlphabet === letter ? "default" : "ghost"}
              className="rounded-full px-3 py-1 text-sm font-medium"
              onClick={() => setActiveAlphabet(letter)}
            >
              {letter}
            </Button>
          ))}
        </div>
      </div>

      {filteredAuthors.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <BookOpen className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600" />
          <h3 className="mt-4 text-lg font-semibold">No authors found</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Try adjusting your search or filter criteria
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAuthors.map((author) => (
            <Card
              key={author.id}
              className="overflow-hidden flex flex-col h-full"
            >
              <div className="flex p-6 pb-4 items-center">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                  <img
                    src={
                      author.photo_url ||
                      `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(
                        author.name
                      )}`
                    }
                    alt={author.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.src = `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(
                        author.name
                      )}`;
                    }}
                  />
                </div>
                <div className="ml-4">
                  <CardTitle className="line-clamp-1 text-lg">
                    {author.name}
                  </CardTitle>
                  <CardDescription>
                    {author.book_count || 0} works
                    {author.birth_date ? ` · Born ${author.birth_date}` : ""}
                  </CardDescription>
                </div>
              </div>

              <CardContent className="pb-2 pt-0">
                {author.biography && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                    {author.biography}
                  </p>
                )}
              </CardContent>

              <CardFooter className="pt-4 mt-auto flex flex-col">
                {/* Books Display */}
                <div className="w-full mb-4">
                  <p className="text-xs font-medium text-gray-500 mb-2">
                    Books
                  </p>
                  <div className="flex space-x-2">
                    {author.books && author.books.length > 0
                      ? author.books.slice(0, 3).map((book, idx) => (
                          <Link
                            key={idx}
                            to={`/books/${book.id}`}
                            className="relative w-16 h-20 bg-gray-100 rounded overflow-hidden"
                            title={book.title}
                          >
                            {book.cover ? (
                              <img
                                src={book.cover}
                                alt={book.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  // Fallback if image fails to load
                                  const target = e.target as HTMLImageElement;
                                  target.src = `https://api.dicebear.com/7.x/abstract/svg?seed=${encodeURIComponent(
                                    book.title
                                  )}`;
                                }}
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full bg-gray-200">
                                <BookIcon className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </Link>
                        ))
                      : null}

                    {/* If there are less than 3 works, show placeholders */}
                    {author.books &&
                      [
                        ...Array(Math.max(0, 3 - (author.books?.length || 0))),
                      ].map((_, idx) => (
                        <div
                          key={`placeholder-${idx}`}
                          className="w-16 h-20 bg-gray-100 rounded overflow-hidden flex items-center justify-center"
                        >
                          <BookIcon className="h-6 w-6 text-gray-300" />
                        </div>
                      ))}
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full flex justify-between items-center"
                  asChild
                >
                  <Link to={`/authors/${author.id}`}>
                    View Profile
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
