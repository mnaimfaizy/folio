import api from "./api";

export interface Author {
  id?: number;
  name: string;
  biography?: string;
  birth_date?: string;
  photo_url?: string;
  is_primary?: boolean; // Indicates if this is the primary author for a book
}

export interface Book {
  id?: number;
  title: string;
  author?: string; // Keep for backward compatibility
  authors?: Author[]; // New field for multiple authors
  isbn: string;
  publishYear?: number; // Changed from publishedDate to match backend
  publishedDate?: string; // Keep for backward compatibility
  genre?: string;
  description?: string;
  cover?: string; // Changed from coverImage to match backend
  coverImage?: string; // Keep for backward compatibility
}

// Open Library search result interfaces
export interface OpenLibraryBookResult {
  title: string;
  author: string;
  authors?: Array<{ name: string; url?: string }>;
  publishYear?: number;
  isbn?: string;
  cover?: string;
  description?: string;
  publisher?: string;
  subjects?: string[];
  url?: string;
  firstPublishYear?: number;
  workKey?: string;
  coverId?: number;
  languages?: string[];
  publishers?: string[];
}

export interface OpenLibrarySearchResponse {
  book?: OpenLibraryBookResult;
  books?: OpenLibraryBookResult[];
  author?: string;
  total?: number;
  offset?: number;
  limit?: number;
}

interface BookResponse {
  book: Book;
  message?: string;
}

interface BooksResponse {
  books: Book[];
}

const BookService = {
  // Get all books
  getAllBooks: async (): Promise<Book[]> => {
    const response = await api.get<BooksResponse>("/api/books");
    return response.data.books || [];
  },

  // Get book by ID
  getBookById: async (id: number): Promise<Book | null> => {
    try {
      const response = await api.get<BookResponse>(`/api/books/${id}`);
      return response.data.book;
    } catch (error) {
      console.error("Error fetching book:", error);
      return null;
    }
  },

  // Check if book exists in collection by ISBN or title+author
  checkBookExists: async (book: OpenLibraryBookResult): Promise<boolean> => {
    try {
      const allBooks = await BookService.getAllBooks();

      if (book.isbn) {
        // Check by ISBN if available
        return allBooks.some(
          (existingBook) =>
            existingBook.isbn && existingBook.isbn.trim() === book.isbn?.trim()
        );
      } else {
        // First check if the book has authors array
        if (book.authors && book.authors.length > 0) {
          // Get primary author name
          const primaryAuthorName = book.authors[0].name.toLowerCase();
          // Check if any book has this primary author
          return allBooks.some(
            (existingBook) =>
              existingBook.title.toLowerCase() === book.title.toLowerCase() &&
              // Check in authors array if available
              ((existingBook.authors &&
                existingBook.authors.some(
                  (a) => a.name.toLowerCase() === primaryAuthorName
                )) ||
                // Fallback to legacy author string
                (existingBook.author &&
                  existingBook.author
                    .toLowerCase()
                    .includes(primaryAuthorName)))
          );
        } else {
          // Fallback to original logic for backward compatibility
          return allBooks.some(
            (existingBook) =>
              existingBook.title.toLowerCase() === book.title.toLowerCase() &&
              existingBook.author?.toLowerCase() ===
                book.author.toString().toLowerCase()
          );
        }
      }
    } catch (error) {
      console.error("Error checking if book exists:", error);
      return false;
    }
  },

  // Create new book
  createBook: async (
    bookData: Book,
    addToCollection: boolean = false
  ): Promise<Book | null> => {
    try {
      const response = await api.post<BookResponse>("/api/books", {
        ...bookData,
        addToCollection,
      });
      return response.data.book;
    } catch (error) {
      console.error("Error creating book:", error);
      return null;
    }
  },

  // Update existing book
  updateBook: async (
    id: number,
    bookData: Partial<Book>
  ): Promise<Book | null> => {
    try {
      const response = await api.put<BookResponse>(
        `/api/books/${id}`,
        bookData
      );
      return response.data.book;
    } catch (error) {
      console.error("Error updating book:", error);
      return null;
    }
  },

  // Delete book
  deleteBook: async (id: number): Promise<boolean> => {
    try {
      await api.delete(`/api/books/${id}`);
      return true;
    } catch (error) {
      console.error("Error deleting book:", error);
      return false;
    }
  },

  // Search books
  searchBooks: async (query: string): Promise<Book[]> => {
    try {
      const response = await api.get<BooksResponse>(
        `/api/books/search?q=${encodeURIComponent(query)}`
      );
      return response.data.books || [];
    } catch (error) {
      console.error("Error searching books:", error);
      return [];
    }
  },

  // Search Open Library
  searchOpenLibrary: async (
    query: string,
    type: "isbn" | "title" | "author"
  ): Promise<OpenLibrarySearchResponse> => {
    const response = await api.get<OpenLibrarySearchResponse>(
      `/api/books/search/openlibrary?query=${encodeURIComponent(
        query
      )}&type=${type}`
    );
    return response.data;
  },

  // Add book from Open Library to collection
  addBookFromOpenLibrary: async (
    bookData: OpenLibraryBookResult,
    addToCollection: boolean = false
  ): Promise<Book | null> => {
    try {
      // Helper function to safely process potentially complex values
      const safeProcess = (value: unknown): string => {
        if (typeof value === "string") return value;
        if (typeof value === "number") return value.toString();
        if (value === null || value === undefined) return "";
        if (typeof value === "object") {
          // If it's an object with a name property (common in OpenLibrary API)
          if (value && "name" in value && typeof value.name === "string")
            return value.name;
          try {
            return JSON.stringify(value);
          } catch {
            return "";
          }
        }
        return String(value);
      };

      // Get publish year from either publishYear or firstPublishYear
      const publishYear = bookData.publishYear || bookData.firstPublishYear;

      // Default author name if neither authors array nor author string is provided
      const defaultAuthorName = "Unknown Author";

      // Process authors: either use the authors array or create from author string
      let authors = [];
      if (bookData.authors && bookData.authors.length > 0) {
        authors = bookData.authors.map((a) => ({ name: a.name }));
      } else if (bookData.author && bookData.author.trim()) {
        authors = [{ name: safeProcess(bookData.author) }];
      } else {
        authors = [{ name: defaultAuthorName }];
      }

      // For backward compatibility, also include the author string
      const authorString = authors.map((a) => a.name).join(", ");

      // Convert OpenLibraryBookResult to backend Book model format
      const book = {
        title: bookData.title,
        author: authorString,
        authors: authors,
        isbn: bookData.isbn || "",
        publishYear: publishYear || null,
        cover: bookData.cover || "",
        description: safeProcess(bookData.description),
        addToCollection: addToCollection,
      };

      const response = await api.post<BookResponse>("/api/books", book);
      return response.data.book;
    } catch (error) {
      console.error("Error adding book from Open Library:", error);
      return null;
    }
  },

  // User Collection Methods

  // Get user's book collection
  getUserCollection: async (): Promise<Book[]> => {
    try {
      const response = await api.get<BooksResponse>(
        "/api/books/user/collection"
      );
      return response.data.books || [];
    } catch (error) {
      console.error("Error fetching user collection:", error);
      return [];
    }
  },

  // Add book to user collection
  addToUserCollection: async (bookId: number): Promise<boolean> => {
    try {
      await api.post("/api/books/user/collection", { bookId });
      return true;
    } catch (error) {
      console.error("Error adding book to collection:", error);
      return false;
    }
  },

  // Remove book from user collection
  removeFromUserCollection: async (bookId: number): Promise<boolean> => {
    try {
      await api.delete(`/api/books/user/collection/${bookId}`);
      return true;
    } catch (error) {
      console.error("Error removing book from collection:", error);
      return false;
    }
  },

  // Check if a book is in user's collection
  isBookInUserCollection: async (bookId: number): Promise<boolean> => {
    try {
      const collection = await BookService.getUserCollection();
      return collection.some((book) => book.id === bookId);
    } catch (error) {
      console.error("Error checking if book is in user collection:", error);
      return false;
    }
  },
};

export default BookService;
