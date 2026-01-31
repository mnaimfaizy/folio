import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import BookService, {
  OpenLibraryBookResult,
  OpenLibrarySearchResponse,
} from "@/services/bookService";
import {
  Barcode,
  BookOpen,
  BookPlus,
  Check,
  ChevronLeft,
  ChevronRight,
  FileText,
  Library,
  Loader2,
  Search,
  User,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

// Number of items to show per page
const ITEMS_PER_PAGE = 10;

export function BookSearchComponent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"title" | "author" | "isbn">(
    "title"
  );
  const [isSearching, setIsSearching] = useState(false);
  const [allSearchResults, setAllSearchResults] =
    useState<OpenLibrarySearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [addingBooks, setAddingBooks] = useState<Record<string, boolean>>({});
  const [booksInCollection, setBooksInCollection] = useState<
    Record<string, boolean>
  >({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isCheckingCollection, setIsCheckingCollection] = useState(false);

  // Client-side pagination
  const [displayedItems, totalItems] = useMemo(() => {
    if (!allSearchResults) {
      return [[], 0];
    }

    if (searchType === "isbn" && allSearchResults.book) {
      // ISBN searches return a single book, so no pagination needed
      return [[allSearchResults.book], 1];
    }

    const items = allSearchResults.books || [];
    const total = items.length;

    // Calculate slice of items for current page
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const itemsForCurrentPage = items.slice(startIndex, endIndex);

    return [itemsForCurrentPage, total];
  }, [allSearchResults, currentPage, searchType]);

  // Calculate total pages
  const totalPages = useMemo(() => {
    if (searchType === "isbn" || !allSearchResults || !allSearchResults.books) {
      return 1;
    }
    return Math.ceil(totalItems / ITEMS_PER_PAGE);
  }, [totalItems, searchType, allSearchResults]);

  const navigate = useNavigate();

  // Reset to first page when search type changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchType]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Check if displayed books are in the collection
  useEffect(() => {
    const checkBooksInCollection = async () => {
      if (!displayedItems.length) return;

      setIsCheckingCollection(true);

      try {
        const booksStatus: Record<string, boolean> = {};

        // Check each displayed book
        for (const book of displayedItems as OpenLibraryBookResult[]) {
          const bookKey = getBookKey(book);
          const exists = await BookService.checkBookExists(book);
          booksStatus[bookKey] = exists;
        }

        setBooksInCollection((prev) => ({ ...prev, ...booksStatus }));
      } catch (error) {
        console.error("Error checking books in collection:", error);
      } finally {
        setIsCheckingCollection(false);
      }
    };

    checkBooksInCollection();
  }, [displayedItems]);

  // Generate a unique key for a book
  const getBookKey = (book: OpenLibraryBookResult): string => {
    return book.isbn || book.workKey || `${book.title}-${book.author}`;
  };

  // Handle search form submission
  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();

    if (!searchQuery.trim()) {
      setError("Please enter a search term");
      return;
    }

    setError(null);
    setAllSearchResults(null);
    setIsSearching(true);
    setCurrentPage(1); // Reset to first page on new search
    setBooksInCollection({}); // Reset collection status

    try {
      const results = await BookService.searchOpenLibrary(
        searchQuery,
        searchType
      );
      setAllSearchResults(results);
      if (
        (!results.book && (!results.books || results.books.length === 0)) ||
        (searchType === "isbn" && !results.book)
      ) {
        setError(`No books found for this ${searchType} search.`);
      }
    } catch (err: unknown) {
      console.error("Search error:", err);
      setError(
        err &&
          typeof err === "object" &&
          "response" in err &&
          err.response &&
          typeof err.response === "object" &&
          "data" in err.response &&
          err.response.data &&
          typeof err.response.data === "object" &&
          "message" in err.response.data
          ? (err.response.data.message as string)
          : "An error occurred while searching. Please try again."
      );
    } finally {
      setIsSearching(false);
    }
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    // Ensure page is within valid range
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);

    // Scroll back to top of results
    const resultsElement = document.getElementById("search-results");
    if (resultsElement) {
      resultsElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Add a book to collection
  const addBookToCollection = async (book: OpenLibraryBookResult) => {
    // Generate a unique key for this book
    const bookKey = getBookKey(book);

    // Check if book is already in collection
    if (booksInCollection[bookKey]) {
      setSuccessMessage(`"${book.title}" is already in your collection.`);
      return;
    }

    setAddingBooks((prev) => ({ ...prev, [bookKey]: true }));
    try {
      await BookService.addBookFromOpenLibrary(book);
      setSuccessMessage(`"${book.title}" has been added to your collection.`);

      // Mark book as in collection
      setBooksInCollection((prev) => ({ ...prev, [bookKey]: true }));
    } catch (err: unknown) {
      console.error("Error adding book:", err);

      // Handle case where book already exists on the server
      if (
        err &&
        typeof err === "object" &&
        "response" in err &&
        err.response &&
        typeof err.response === "object" &&
        "status" in err.response &&
        err.response.status === 400 &&
        "data" in err.response &&
        err.response.data &&
        typeof err.response.data === "object" &&
        "message" in err.response.data &&
        typeof err.response.data.message === "string" &&
        err.response.data.message.includes("already exists")
      ) {
        setSuccessMessage(`"${book.title}" is already in your collection.`);
        setBooksInCollection((prev) => ({ ...prev, [bookKey]: true }));
      } else {
        setError(
          err &&
            typeof err === "object" &&
            "response" in err &&
            err.response &&
            typeof err.response === "object" &&
            "data" in err.response &&
            err.response.data &&
            typeof err.response.data === "object" &&
            "message" in err.response.data
            ? (err.response.data.message as string)
            : "Failed to add book to your collection."
        );
      }
    } finally {
      // Keep the loading state for a bit to show the animation
      setTimeout(() => {
        setAddingBooks((prev) => ({ ...prev, [bookKey]: false }));
      }, 1000);
    }
  };

  // Render pagination controls
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex justify-center items-center gap-2 mt-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous Page</span>
        </Button>

        <div className="text-sm">
          Page {currentPage} of {totalPages}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="cursor-pointer"
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next Page</span>
        </Button>
      </div>
    );
  };

  // Render add to collection button
  const renderAddButton = (book: OpenLibraryBookResult) => {
    const bookKey = getBookKey(book);
    const isAdding = addingBooks[bookKey];
    const isInCollection = booksInCollection[bookKey];

    if (isInCollection) {
      return (
        <Button
          size="sm"
          variant="outline"
          disabled={true}
          className="whitespace-nowrap cursor-not-allowed"
        >
          <Library className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">In Collection</span>
          <span className="sm:hidden">Added</span>
        </Button>
      );
    }

    return (
      <Button
        size="sm"
        variant="outline"
        onClick={() => addBookToCollection(book)}
        disabled={isAdding}
        className="whitespace-nowrap cursor-pointer"
      >
        {isAdding ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <span>Adding...</span>
          </>
        ) : (
          <>
            <BookPlus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Add to Collection</span>
            <span className="sm:hidden">Add</span>
          </>
        )}
      </Button>
    );
  };

  // Render title search results
  const renderTitleSearchResults = () => {
    const books = displayedItems as OpenLibraryBookResult[];
    if (books.length === 0) return null;

    return (
      <div className="w-full overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24">Cover</TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="hidden md:table-cell">Author</TableHead>
              <TableHead className="hidden md:table-cell">Year</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {books.map((book, index) => {
              return (
                <TableRow key={getBookKey(book) + "-" + index}>
                  <TableCell className="p-2">
                    {book.cover ? (
                      <img
                        src={book.cover}
                        alt={`Cover for ${book.title}`}
                        className="w-16 h-auto object-cover rounded"
                      />
                    ) : (
                      <div className="w-16 h-24 bg-gray-200 flex items-center justify-center rounded">
                        <BookOpen className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    {book.title}
                    {/* Show author on mobile only */}
                    <div className="text-xs text-gray-500 md:hidden">
                      by {book.author}
                    </div>
                    {/* Show year on mobile only */}
                    <div className="text-xs text-gray-400 md:hidden">
                      {book.firstPublishYear || "Year unknown"}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {book.author}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {book.firstPublishYear || "Unknown"}
                  </TableCell>
                  <TableCell>{renderAddButton(book)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {isCheckingCollection && (
          <div className="flex justify-center mt-4">
            <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
            <span className="ml-2 text-gray-500">Checking collection...</span>
          </div>
        )}

        {renderPagination()}
      </div>
    );
  };

  // Render author search results
  const renderAuthorSearchResults = () => {
    const books = displayedItems as OpenLibraryBookResult[];
    const author = allSearchResults?.author;

    if (books.length === 0) return null;

    return (
      <div>
        {author && (
          <h2 className="text-xl font-bold mb-4">Books by {author}</h2>
        )}
        <div className="w-full overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Cover</TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="hidden md:table-cell">Year</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {books.map((book, index) => {
                return (
                  <TableRow key={getBookKey(book) + "-" + index}>
                    <TableCell className="p-2">
                      {book.cover ? (
                        <img
                          src={book.cover}
                          alt={`Cover for ${book.title}`}
                          className="w-16 h-auto object-cover rounded"
                        />
                      ) : (
                        <div className="w-16 h-24 bg-gray-200 flex items-center justify-center rounded">
                          <BookOpen className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {book.title}
                      {/* Show year on mobile only */}
                      <div className="text-xs text-gray-400 md:hidden">
                        {book.firstPublishYear || "Year unknown"}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {book.firstPublishYear || "Unknown"}
                    </TableCell>
                    <TableCell>{renderAddButton(book)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {isCheckingCollection && (
            <div className="flex justify-center mt-4">
              <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
              <span className="ml-2 text-gray-500">Checking collection...</span>
            </div>
          )}

          {renderPagination()}
        </div>
      </div>
    );
  };

  // Render ISBN search result
  const renderIsbnSearchResult = () => {
    const book = allSearchResults?.book;
    if (!book) return null;

    const bookKey = getBookKey(book);
    const isAdding = addingBooks[bookKey];
    const isInCollection = booksInCollection[bookKey];

    // Helper function to safely render potentially complex values
    const safeRender = (value: unknown): string => {
      if (typeof value === "string") return value;
      if (typeof value === "number") return value.toString();
      if (value === null || value === undefined) return "Not available";
      if (typeof value === "object") {
        // If it's an object with a name property (common in OpenLibrary API)
        if (value !== null && "name" in value && typeof value.name === "string")
          return value.name;
        return JSON.stringify(value);
      }
      return String(value);
    };

    return (
      <div className="bg-white p-4 md:p-6 rounded-lg shadow-md flex flex-col md:flex-row gap-6">
        <div className="flex-shrink-0 flex justify-center md:block">
          {book.cover ? (
            <img
              src={book.cover}
              alt={`Cover for ${book.title}`}
              className="w-32 h-auto object-cover rounded"
            />
          ) : (
            <div className="w-32 h-48 bg-gray-200 flex items-center justify-center rounded">
              <BookOpen className="w-12 h-12 text-gray-400" />
            </div>
          )}
        </div>

        <div className="flex-grow">
          <h2 className="text-2xl font-bold mb-2">{book.title}</h2>
          <p className="text-lg text-gray-700 mb-4">
            by {safeRender(book.author)}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
            <div>
              <span className="text-sm text-gray-500">ISBN:</span>
              <p>{book.isbn || "Not available"}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Published:</span>
              <p>{book.publishYear || "Unknown"}</p>
            </div>
            {book.publisher && (
              <div>
                <span className="text-sm text-gray-500">Publisher:</span>
                <p>{safeRender(book.publisher)}</p>
              </div>
            )}
          </div>

          {book.description && (
            <div className="mb-4">
              <h3 className="text-md font-semibold mb-1">Description:</h3>
              <p className="text-gray-700">{safeRender(book.description)}</p>
            </div>
          )}

          {isInCollection ? (
            <Button
              className="mt-2 cursor-not-allowed"
              variant="outline"
              disabled={true}
            >
              <Library className="mr-2 h-4 w-4" />
              Already In Collection
            </Button>
          ) : (
            <Button
              onClick={() => addBookToCollection(book)}
              className="mt-2 cursor-pointer"
              disabled={isAdding}
            >
              {isAdding ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding to Collection...
                </>
              ) : (
                <>
                  <BookPlus className="mr-2 h-4 w-4" />
                  Add to Collection
                </>
              )}
            </Button>
          )}

          {isCheckingCollection && (
            <div className="mt-4 flex items-center">
              <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
              <span className="ml-2 text-sm text-gray-500">
                Checking collection status...
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Search Open Library</h1>
        <p className="text-gray-600">
          Find books from the Open Library database and add them to your
          collection.
        </p>
      </div>

      {successMessage && (
        <Alert className="mb-6 bg-green-50 border-green-200 text-green-800">
          <Check className="h-4 w-4 mr-2" />
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert className="mb-6 bg-red-50 border-red-200 text-red-800">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="bg-white p-4 md:p-6 rounded-lg shadow-md mb-8">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-1/4">
              <Select
                value={searchType}
                onValueChange={(value: "title" | "author" | "isbn") =>
                  setSearchType(value)
                }
              >
                <SelectTrigger className="cursor-pointer">
                  <SelectValue placeholder="Search by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="title" className="cursor-pointer">
                    <div className="flex items-center">
                      <FileText className="mr-2 h-4 w-4" />
                      <span>Title</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="author" className="cursor-pointer">
                    <div className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Author</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="isbn" className="cursor-pointer">
                    <div className="flex items-center">
                      <Barcode className="mr-2 h-4 w-4" />
                      <span>ISBN</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-grow relative">
              <Input
                placeholder={`Search by ${searchType}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  onClick={() => setSearchQuery("")}
                >
                  ×
                </button>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSearching}
              className="shrink-0 cursor-pointer"
            >
              {isSearching ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Search className="mr-2 h-4 w-4" />
              )}
              Search
            </Button>
          </div>
        </form>
      </div>

      {isSearching ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          <span className="ml-2 text-lg text-gray-500">Searching...</span>
        </div>
      ) : allSearchResults ? (
        <div
          id="search-results"
          className="bg-white p-4 md:p-6 rounded-lg shadow-md"
        >
          {searchType === "isbn"
            ? renderIsbnSearchResult()
            : searchType === "author"
            ? renderAuthorSearchResults()
            : renderTitleSearchResults()}

          {allSearchResults.books && allSearchResults.books.length > 0 && (
            <div className="mt-4 text-center text-gray-500">
              {searchType !== "isbn" && (
                <span>
                  Showing{" "}
                  {Math.min(displayedItems.length, ITEMS_PER_PAGE) *
                    currentPage -
                    displayedItems.length +
                    1}
                  -{Math.min(displayedItems.length * currentPage, totalItems)}{" "}
                  of {totalItems} results
                </span>
              )}
            </div>
          )}
        </div>
      ) : null}

      <div className="mt-6 flex justify-center">
        <Button
          variant="outline"
          onClick={() => navigate("/books")}
          className="mr-3 cursor-pointer"
        >
          View My Collection
        </Button>
      </div>
    </div>
  );
}
