import { Request, Response } from "express";
import { Database } from "sqlite";
import {
  addBookToAuthor,
  createAuthor,
  deleteAuthor,
  getAllAuthors,
  getAuthorById,
  getAuthorByName,
  getAuthorInfo,
  linkAuthorToBook,
  removeBookFromAuthor,
  resetRateLimiter,
  searchOpenLibraryAuthor,
  unlinkAuthorFromBook,
  updateAuthor,
} from "../../controllers/authorsController";
import { connectDatabase } from "../../db/database";

// Mock dependencies
jest.mock("../../db/database");
jest.mock("axios");

// Import axios for mocking
import axios from "axios";

// Add global declaration for requestTimestamps
declare global {
  var requestTimestamps: number[];
}

describe("Authors Controller", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let mockDb: Partial<Database>;

  beforeEach(() => {
    mockDb = {
      run: jest.fn().mockResolvedValue({}),
      get: jest.fn(),
      all: jest.fn(),
      close: jest.fn(),
      exec: jest.fn(),
    };

    (connectDatabase as jest.Mock).mockResolvedValue(mockDb);

    req = {
      body: {},
      params: {},
      query: {},
      user: undefined,
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.spyOn(console, "error").mockImplementation(() => {});

    // Reset rate limiter state before each test using the exported function
    resetRateLimiter();

    // Ensure axios mock is reset
    (axios.get as jest.Mock).mockReset();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllAuthors", () => {
    it("should get all authors with their book count", async () => {
      const mockAuthors = [
        {
          id: 1,
          name: "Author One",
          biography: "Bio 1",
          birth_date: "1980-01-01",
          photo_url: "http://example.com/1.jpg",
          book_count: 3,
        },
        {
          id: 2,
          name: "Author Two",
          biography: "Bio 2",
          birth_date: "1990-01-01",
          photo_url: "http://example.com/2.jpg",
          book_count: 5,
        },
      ];

      mockDb.all = jest.fn().mockResolvedValue(mockAuthors);

      await getAllAuthors(req as Request, res as Response);

      expect(mockDb.all).toHaveBeenCalledWith(
        expect.stringContaining("COUNT(ab.book_id) as book_count")
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ authors: mockAuthors });
    });

    it("should handle database errors", async () => {
      const mockError = new Error("Database error");
      mockDb.all = jest.fn().mockRejectedValue(mockError);

      await getAllAuthors(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Server error",
        error: "Database error",
      });
    });
  });

  describe("getAuthorById", () => {
    it("should get an author by ID with their books", async () => {
      const authorId = "1";
      req.params = { id: authorId };

      const mockAuthor = {
        id: 1,
        name: "Test Author",
        biography: "Author biography",
        birth_date: "1980-01-01",
        photo_url: "http://example.com/photo.jpg",
        createdAt: "2023-01-01T12:00:00Z",
        updatedAt: "2023-01-02T12:00:00Z",
      };

      const mockBooks = [
        { id: 1, title: "Book 1", isbn: "1234567890" },
        { id: 2, title: "Book 2", isbn: "0987654321" },
      ];

      mockDb.get = jest.fn().mockResolvedValue(mockAuthor);
      mockDb.all = jest.fn().mockResolvedValue(mockBooks);

      await getAuthorById(req as Request, res as Response);

      expect(mockDb.get).toHaveBeenCalledWith(
        expect.stringContaining(
          "SELECT id, name, biography, birth_date, photo_url"
        ),
        [authorId]
      );

      expect(mockDb.all).toHaveBeenCalledWith(
        expect.stringContaining("JOIN author_books"),
        [authorId]
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        author: mockAuthor,
        books: mockBooks,
      });
    });

    it("should return 404 if author not found", async () => {
      req.params = { id: "999" };
      mockDb.get = jest.fn().mockResolvedValue(null);

      await getAuthorById(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Author not found" });
    });

    it("should handle database errors", async () => {
      req.params = { id: "1" };
      const mockError = new Error("Database error");
      mockDb.get = jest.fn().mockRejectedValue(mockError);

      await getAuthorById(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Server error",
        error: "Database error",
      });
    });
  });

  describe("getAuthorByName", () => {
    it("should get an author by name with their books", async () => {
      const authorName = "Test Author";
      req.params = { name: authorName };

      const mockAuthor = {
        id: 1,
        name: "Test Author",
        biography: "Author biography",
        birth_date: "1980-01-01",
        photo_url: "http://example.com/photo.jpg",
        createdAt: "2023-01-01T12:00:00Z",
        updatedAt: "2023-01-02T12:00:00Z",
      };

      const mockBooks = [
        { id: 1, title: "Book 1", isbn: "1234567890" },
        { id: 2, title: "Book 2", isbn: "0987654321" },
      ];

      mockDb.get = jest.fn().mockResolvedValue(mockAuthor);
      mockDb.all = jest.fn().mockResolvedValue(mockBooks);

      await getAuthorByName(req as Request, res as Response);

      expect(mockDb.get).toHaveBeenCalledWith(
        expect.stringContaining("LOWER(name) = LOWER(?)"),
        [authorName]
      );

      expect(mockDb.all).toHaveBeenCalledWith(
        expect.stringContaining("JOIN author_books"),
        [1] // The author ID
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        author: mockAuthor,
        books: mockBooks,
      });
    });

    it("should handle API errors", async () => {
      req.params = { name: "J.K. Rowling" };

      // Remove this as it's not relevant for getAuthorByName which doesn't use axios
      // (axios.get as jest.Mock).mockRejectedValueOnce(mockError);

      // Instead, test database error
      const mockError = new Error("API error");
      mockDb.get = jest.fn().mockRejectedValueOnce(mockError);

      await getAuthorByName(req as Request, res as Response);

      // Expect 500 for database errors
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Server error",
        error: "API error",
      });
    });

    it("should return 400 if author name is not provided", async () => {
      req.params = { name: "" };

      await getAuthorByName(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Author name is required",
      });
    });

    it("should return 404 if author not found", async () => {
      req.params = { name: "Nonexistent Author", id: "999" };
      mockDb.get = jest.fn().mockResolvedValue(null);

      await getAuthorByName(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Author not found" });
    });

    it("should handle database errors", async () => {
      req.params = { name: "Error Author" };
      const mockError = new Error("Database error");
      mockDb.get = jest.fn().mockRejectedValue(mockError);

      await getAuthorByName(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Server error",
        error: "Database error",
      });
    });
  });

  describe("createAuthor", () => {
    it("should create a new author successfully", async () => {
      req.body = {
        name: "New Author",
        biography: "New biography",
        birth_date: "1985-05-05",
        photo_url: "http://example.com/new.jpg",
      };

      const mockNewAuthor = {
        id: 5,
        name: "New Author",
        biography: "New biography",
        birth_date: "1985-05-05",
        photo_url: "http://example.com/new.jpg",
        createdAt: "2023-01-01T12:00:00Z",
        updatedAt: null,
      };

      mockDb.get = jest
        .fn()
        .mockResolvedValueOnce(null) // No existing author
        .mockResolvedValueOnce(mockNewAuthor); // The newly created author

      mockDb.run = jest.fn().mockResolvedValue({ lastID: 5 });

      await createAuthor(req as Request, res as Response);

      expect(mockDb.get).toHaveBeenCalledWith(
        "SELECT * FROM authors WHERE LOWER(name) = LOWER(?)",
        ["New Author"]
      );

      expect(mockDb.run).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO authors"),
        [
          "New Author",
          "New biography",
          "1985-05-05",
          "http://example.com/new.jpg",
        ]
      );

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Author created successfully",
        author: mockNewAuthor,
      });
    });

    it("should return 400 if name is not provided", async () => {
      req.body = {
        biography: "New biography",
        birth_date: "1985-05-05",
      };

      await createAuthor(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Author name is required",
      });
    });

    it("should return 409 if author already exists", async () => {
      req.body = {
        name: "Existing Author",
        biography: "Bio",
      };

      const existingAuthor = {
        id: 1,
        name: "Existing Author",
        biography: "Existing bio",
      };

      mockDb.get = jest.fn().mockResolvedValue(existingAuthor);

      await createAuthor(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        message: "Author already exists",
        author: existingAuthor,
      });
    });

    it("should handle database errors", async () => {
      req.body = { name: "New Author" };

      const mockError = new Error("Database error");
      mockDb.get = jest.fn().mockRejectedValue(mockError);

      await createAuthor(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Server error",
        error: "Database error",
      });
    });

    it("should handle failed creation when lastID is not provided", async () => {
      req.body = {
        name: "Failed Author",
        biography: "Biography that won't be saved",
      };

      mockDb.get = jest.fn().mockResolvedValue(null); // No existing author
      // Mock run with no lastID to trigger the failure branch
      mockDb.run = jest.fn().mockResolvedValue({ lastID: null });

      await createAuthor(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Failed to create author",
      });
    });
  });

  describe("updateAuthor", () => {
    it("should update an author successfully", async () => {
      req.params = { id: "1" };
      req.body = {
        name: "Updated Author",
        biography: "Updated bio",
        birth_date: "1990-10-10",
        photo_url: "http://example.com/updated.jpg",
      };

      const existingAuthor = {
        id: 1,
        name: "Original Author",
        biography: "Original bio",
      };

      const updatedAuthor = {
        id: 1,
        name: "Updated Author",
        biography: "Updated bio",
        birth_date: "1990-10-10",
        photo_url: "http://example.com/updated.jpg",
      };

      mockDb.get = jest
        .fn()
        .mockResolvedValueOnce(existingAuthor) // Author exists
        .mockResolvedValueOnce(null) // No other author with the same name
        .mockResolvedValueOnce(updatedAuthor); // The updated author

      await updateAuthor(req as Request, res as Response);

      expect(mockDb.get).toHaveBeenCalledWith(
        "SELECT * FROM authors WHERE id = ?",
        ["1"]
      );

      expect(mockDb.run).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE authors"),
        [
          "Updated Author",
          "Updated bio",
          "1990-10-10",
          "http://example.com/updated.jpg",
          "1",
        ]
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Author updated successfully",
        author: updatedAuthor,
      });
    });

    it("should return 404 if author not found", async () => {
      req.params = { id: "999" };
      req.body = { name: "Updated Author" };

      mockDb.get = jest.fn().mockResolvedValue(null);

      await updateAuthor(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Author not found" });
    });

    it("should return 400 if name is not provided", async () => {
      req.params = { id: "1" };
      req.body = {
        biography: "Updated bio",
      };

      await updateAuthor(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Author name is required",
      });
    });

    it("should return 409 if another author with the same name exists", async () => {
      req.params = { id: "1" };
      req.body = {
        name: "Duplicate Name",
        biography: "Updated bio",
      };

      const existingAuthor = {
        id: 1,
        name: "Original Author",
        biography: "Original bio",
      };

      const duplicateAuthor = {
        id: 2,
        name: "Duplicate Name",
        biography: "Another author's bio",
      };

      mockDb.get = jest
        .fn()
        .mockResolvedValueOnce(existingAuthor) // Current author
        .mockResolvedValueOnce(duplicateAuthor); // Another author with the same name

      await updateAuthor(req as Request, res as Response);

      expect(mockDb.get).toHaveBeenNthCalledWith(
        2,
        "SELECT * FROM authors WHERE LOWER(name) = LOWER(?) AND id != ?",
        ["Duplicate Name", "1"]
      );

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        message: "Author with this name already exists",
      });
    });

    it("should handle database errors", async () => {
      req.params = { id: "1" };
      req.body = { name: "Updated Author" };

      const mockError = new Error("Database error");
      mockDb.get = jest.fn().mockRejectedValue(mockError);

      await updateAuthor(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Server error",
        error: "Database error",
      });
    });
  });

  describe("deleteAuthor", () => {
    it("should delete an author successfully", async () => {
      req.params = { id: "1" };

      const existingAuthor = {
        id: 1,
        name: "Author to Delete",
      };

      mockDb.get = jest.fn().mockResolvedValue(existingAuthor);
      mockDb.run = jest.fn().mockResolvedValue({});

      await deleteAuthor(req as Request, res as Response);

      expect(mockDb.get).toHaveBeenCalledWith(
        "SELECT * FROM authors WHERE id = ?",
        ["1"]
      );

      expect(mockDb.run).toHaveBeenCalledWith(
        "DELETE FROM authors WHERE id = ?",
        ["1"]
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Author deleted successfully",
      });
    });

    it("should return 404 if author not found", async () => {
      req.params = { id: "999" };
      mockDb.get = jest.fn().mockResolvedValue(null);

      await deleteAuthor(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Author not found" });
    });

    it("should handle database errors", async () => {
      req.params = { id: "1" };

      const mockError = new Error("Database error");
      mockDb.get = jest.fn().mockRejectedValue(mockError);

      await deleteAuthor(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Server error",
        error: "Database error",
      });
    });
  });

  describe("addBookToAuthor", () => {
    it("should associate a book with an author successfully", async () => {
      req.body = {
        authorId: 1,
        bookId: 2,
        isPrimary: true,
      };

      const author = { id: 1, name: "Test Author" };
      const book = { id: 2, title: "Test Book" };

      mockDb.get = jest
        .fn()
        .mockResolvedValueOnce(author) // Author exists
        .mockResolvedValueOnce(book) // Book exists
        .mockResolvedValueOnce(null); // Association doesn't exist yet

      await addBookToAuthor(req as Request, res as Response);

      expect(mockDb.get).toHaveBeenNthCalledWith(
        1,
        "SELECT * FROM authors WHERE id = ?",
        [1]
      );

      expect(mockDb.get).toHaveBeenNthCalledWith(
        2,
        "SELECT * FROM books WHERE id = ?",
        [2]
      );

      expect(mockDb.get).toHaveBeenNthCalledWith(
        3,
        "SELECT * FROM author_books WHERE author_id = ? AND book_id = ?",
        [1, 2]
      );

      expect(mockDb.run).toHaveBeenCalledWith(
        "INSERT INTO author_books (author_id, book_id, is_primary) VALUES (?, ?, ?)",
        [1, 2, 1]
      );

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Author associated with book successfully",
      });
    });

    it("should update existing association if it already exists", async () => {
      req.body = {
        authorId: 1,
        bookId: 2,
        isPrimary: false,
      };

      const author = { id: 1, name: "Test Author" };
      const book = { id: 2, title: "Test Book" };
      const existingAssociation = {
        author_id: 1,
        book_id: 2,
        is_primary: true,
      };

      mockDb.get = jest
        .fn()
        .mockResolvedValueOnce(author) // Author exists
        .mockResolvedValueOnce(book) // Book exists
        .mockResolvedValueOnce(existingAssociation); // Association already exists

      await addBookToAuthor(req as Request, res as Response);

      expect(mockDb.run).toHaveBeenCalledWith(
        "UPDATE author_books SET is_primary = ? WHERE author_id = ? AND book_id = ?",
        [0, 1, 2]
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Author-book association updated",
      });
    });

    it("should return 400 if authorId or bookId is missing", async () => {
      req.body = {
        // Missing authorId
        bookId: 2,
      };

      await addBookToAuthor(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Author ID and Book ID are required",
      });
    });

    it("should return 404 if author not found", async () => {
      req.body = {
        authorId: 999,
        bookId: 2,
      };

      mockDb.get = jest.fn().mockResolvedValue(null); // Author not found

      await addBookToAuthor(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Author not found" });
    });

    it("should return 404 if book not found", async () => {
      req.body = {
        authorId: 1,
        bookId: 999,
      };

      mockDb.get = jest
        .fn()
        .mockResolvedValueOnce({ id: 1 }) // Author exists
        .mockResolvedValueOnce(null); // Book not found

      await addBookToAuthor(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Book not found" });
    });

    it("should handle database errors", async () => {
      req.body = {
        authorId: 1,
        bookId: 2,
      };

      const mockError = new Error("Database error");
      mockDb.get = jest.fn().mockRejectedValue(mockError);

      await addBookToAuthor(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Server error",
        error: "Database error",
      });
    });
  });

  describe("removeBookFromAuthor", () => {
    it("should remove a book from an author successfully", async () => {
      req.params = {
        authorId: "1",
        bookId: "2",
      };

      mockDb.run = jest.fn().mockResolvedValue({ changes: 1 });

      await removeBookFromAuthor(req as Request, res as Response);

      expect(mockDb.run).toHaveBeenCalledWith(
        "DELETE FROM author_books WHERE author_id = ? AND book_id = ?",
        ["1", "2"]
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Association removed successfully",
      });
    });

    it("should return 404 if association not found", async () => {
      req.params = {
        authorId: "1",
        bookId: "999",
      };

      mockDb.run = jest.fn().mockResolvedValue({ changes: 0 });

      await removeBookFromAuthor(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Association not found",
      });
    });

    it("should handle database errors", async () => {
      req.params = {
        authorId: "1",
        bookId: "2",
      };

      const mockError = new Error("Database error");
      mockDb.run = jest.fn().mockRejectedValue(mockError);

      await removeBookFromAuthor(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Server error",
        error: "Database error",
      });
    });
  });

  describe("getAuthorInfo", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      (axios.get as jest.Mock).mockReset();

      // Reset the rate limiting state
      if (typeof global === "object" && global) {
        global.requestTimestamps = []; // Use proper global typing
      }

      // Reset rate limiter explicitly
      resetRateLimiter();
    });

    it("should get author info from Open Library API", async () => {
      req.query = { authorName: "J.K. Rowling" };

      const mockAuthorResponse = {
        data: {
          docs: [
            {
              name: "J.K. Rowling",
              key: "/authors/OL23919A",
              birth_date: "1965-07-31",
              top_work: "Harry Potter and the Philosopher's Stone",
              work_count: 100,
              photos: [12345],
            },
          ],
        },
      };

      const mockWorksResponse = {
        data: {
          entries: [
            {
              title: "Harry Potter and the Philosopher's Stone",
              key: "/works/OL82563W",
              first_publish_year: 1997,
              covers: [9876],
            },
            {
              title: "Harry Potter and the Chamber of Secrets",
              key: "/works/OL82564W",
              first_publish_year: 1998,
              covers: [9877],
            },
          ],
        },
      };

      (axios.get as jest.Mock)
        .mockResolvedValueOnce(mockAuthorResponse) // Author search response
        .mockResolvedValueOnce(mockWorksResponse); // Works response

      await getAuthorInfo(req as Request, res as Response);

      expect(axios.get).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining("openlibrary.org/search/authors.json"),
        expect.any(Object)
      );

      expect(axios.get).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining("openlibrary.org/authors/OL23919A/works.json"),
        expect.any(Object)
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        author: expect.objectContaining({
          name: "J.K. Rowling",
          birthDate: "1965-07-31",
          photoUrl: expect.stringContaining("12345"),
        }),
        works: expect.arrayContaining([
          expect.objectContaining({
            title: "Harry Potter and the Philosopher's Stone",
            firstPublishYear: 1997,
          }),
        ]),
      });
    });

    it("should return 400 if author name is not provided", async () => {
      req.query = {}; // No author name

      await getAuthorInfo(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Author name is required",
      });
    });

    it("should return 404 if author not found in Open Library", async () => {
      req.query = { authorName: "Nonexistent Author" };

      const mockEmptyResponse = {
        data: {
          docs: [], // No authors found
        },
      };

      (axios.get as jest.Mock).mockResolvedValue(mockEmptyResponse);

      await getAuthorInfo(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Author not found" });
    });

    it("should handle API errors", async () => {
      req.query = { authorName: "Error Author" };

      // Explicitly ensure rate limit is not hit for this specific test
      if (typeof global === "object" && global) {
        global.requestTimestamps = []; // Use proper global typing without any cast
      }

      const mockError = new Error("API error");
      // Ensure the first axios call (author search) is the one that rejects
      (axios.get as jest.Mock).mockRejectedValueOnce(mockError);

      await getAuthorInfo(req as Request, res as Response);

      // API errors during external calls should result in 500
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Server error", // Or match the exact message from the controller's catch block
        error: "API error",
      });
      // Verify axios was called (and subsequently rejected)
      expect(axios.get).toHaveBeenCalled();
    });

    it("should handle rate limiting", async () => {
      // This test depends on the exact implementation
      // of the rate limiter and how state persists across calls within the test.

      // Mock axios responses for the initial calls
      const mockAuthorResponse = {
        data: { docs: [{ name: `Test Author`, key: `/authors/OL1` }] },
      };
      const mockWorksResponse = { data: { entries: [] } }; // Assuming works are fetched too
      (axios.get as jest.Mock)
        .mockResolvedValueOnce(mockAuthorResponse)
        .mockResolvedValueOnce(mockWorksResponse);

      // Simulate 5 successful calls to fill the rate limit window
      for (let i = 0; i < 5; i++) {
        req.query = { authorName: `Test Author ${i}` };
        // Need to re-mock axios for each loop iteration if it's called multiple times per getAuthorInfo
        (axios.get as jest.Mock)
          .mockResolvedValueOnce({
            data: {
              docs: [{ name: `Test Author ${i}`, key: `/authors/OL${i}` }],
            },
          })
          .mockResolvedValueOnce({ data: { entries: [] } }); // Mock works call too

        await getAuthorInfo(req as Request, res as Response);
        // Reset mocks used within the loop if necessary, depending on getAuthorInfo logic
      }

      // This 6th call should now be rate limited
      req.query = { authorName: "One More Author" };
      // Mock axios again for this call, although it shouldn't be reached if rate limited
      (axios.get as jest.Mock)
        .mockResolvedValueOnce({
          data: {
            docs: [{ name: `One More Author`, key: `/authors/OL_LIMIT` }],
          },
        })
        .mockResolvedValueOnce({ data: { entries: [] } });

      await getAuthorInfo(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(429);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Rate limit exceeded. Please try again later.",
        })
      );
    });

    // New test cases for increased branch coverage

    it("should handle author with string description", async () => {
      req.query = { authorName: "Author with string description" };

      const mockAuthorResponse = {
        data: {
          docs: [
            {
              name: "Author with string description",
              key: "/authors/OL123456A",
              birth_date: "1980-01-01",
              top_work: "Famous Book",
              work_count: 50,
              photos: [9876],
            },
          ],
        },
      };

      const mockWorksResponse = {
        data: {
          entries: [
            {
              title: "Test Work",
              key: "/works/OL82563W",
              first_publish_year: 1997,
              covers: [9876],
              description: "This is a plain string description", // String description
            },
          ],
        },
      };

      (axios.get as jest.Mock)
        .mockResolvedValueOnce(mockAuthorResponse)
        .mockResolvedValueOnce(mockWorksResponse);

      await getAuthorInfo(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          works: expect.arrayContaining([
            expect.objectContaining({
              title: "Test Work",
            }),
          ]),
        })
      );
    });

    it("should handle author with object description", async () => {
      req.query = { authorName: "Author with object description" };

      const mockAuthorResponse = {
        data: {
          docs: [
            {
              name: "Author with object description",
              key: "/authors/OL123456A",
              birth_date: "1980-01-01",
              work_count: 50,
              photos: [9876],
            },
          ],
        },
      };

      const mockWorksResponse = {
        data: {
          entries: [
            {
              title: "Test Work",
              key: "/works/OL82563W",
              first_publish_year: 1997,
              covers: [9876],
              description: {
                value: "This is a description value from an object",
              },
            },
          ],
        },
      };

      (axios.get as jest.Mock)
        .mockResolvedValueOnce(mockAuthorResponse)
        .mockResolvedValueOnce(mockWorksResponse);

      await getAuthorInfo(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          works: expect.arrayContaining([
            expect.objectContaining({
              title: "Test Work",
            }),
          ]),
        })
      );
    });

    it("should handle missing author key", async () => {
      req.query = { authorName: "Author without key" };

      const mockAuthorResponse = {
        data: {
          docs: [
            {
              name: "Author without key",
              // No key provided
              birth_date: "1980-01-01",
              work_count: 50,
              photos: [9876],
            },
          ],
        },
      };

      (axios.get as jest.Mock).mockResolvedValueOnce(mockAuthorResponse);

      await getAuthorInfo(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          author: expect.objectContaining({
            name: "Author without key",
            key: undefined, // Verify the key is undefined
          }),
          works: [], // Expect empty works array when no key is provided
        })
      );
    });

    it("should handle empty works response", async () => {
      req.query = { authorName: "Author with no works" };

      const mockAuthorResponse = {
        data: {
          docs: [
            {
              name: "Author with no works",
              key: "/authors/OL123456A",
              birth_date: "1980-01-01",
              work_count: 0,
            },
          ],
        },
      };

      const mockWorksResponse = {
        data: {
          // No entries property
        },
      };

      (axios.get as jest.Mock)
        .mockResolvedValueOnce(mockAuthorResponse)
        .mockResolvedValueOnce(mockWorksResponse);

      await getAuthorInfo(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          author: expect.objectContaining({
            name: "Author with no works",
          }),
          works: [], // Should be an empty array
        })
      );
    });

    it("should handle works with no covers", async () => {
      req.query = { authorName: "Author with works without covers" };

      const mockAuthorResponse = {
        data: {
          docs: [
            {
              name: "Author with works without covers",
              key: "/authors/OL123456A",
            },
          ],
        },
      };

      const mockWorksResponse = {
        data: {
          entries: [
            {
              title: "Work Without Cover",
              key: "/works/OL82563W",
              // No covers property
            },
          ],
        },
      };

      (axios.get as jest.Mock)
        .mockResolvedValueOnce(mockAuthorResponse)
        .mockResolvedValueOnce(mockWorksResponse);

      await getAuthorInfo(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          works: expect.arrayContaining([
            expect.objectContaining({
              title: "Work Without Cover",
              coverId: null,
              cover: null,
            }),
          ]),
        })
      );
    });
  });

  describe("searchOpenLibraryAuthor", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      (axios.get as jest.Mock).mockReset();

      // Reset the rate limiting state
      if (typeof global === "object" && global) {
        global.requestTimestamps = []; // Use proper global typing
      }
    });

    it("should return author data from OpenLibrary", async () => {
      req.query = { name: "J.K. Rowling" };

      const mockAuthorData = {
        data: {
          docs: [
            {
              name: "J.K. Rowling",
              key: "/authors/OL23919A",
              birth_date: "1965-07-31",
              top_work: "Harry Potter and the Philosopher's Stone",
              work_count: 123,
              _version_: 1234567890,
            },
          ],
          numFound: 1,
        },
      };

      // Mock axios response for author data
      (axios.get as jest.Mock).mockResolvedValue(mockAuthorData);

      await searchOpenLibraryAuthor(req as Request, res as Response);

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining("openlibrary.org/search/authors.json"),
        expect.any(Object)
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          author: expect.objectContaining({
            name: "J.K. Rowling",
            birth_date: "1965-07-31",
          }),
        })
      );
    });

    it("should return 400 if name query parameter is missing", async () => {
      req.query = {}; // No name parameter

      await searchOpenLibraryAuthor(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Author name is required",
      });
    });

    it("should return 404 if author not found", async () => {
      req.query = { name: "NonexistentAuthor123456" };

      const emptyResponse = {
        data: {
          docs: [],
          numFound: 0,
        },
      };

      // Mock axios response with no results
      (axios.get as jest.Mock).mockResolvedValue(emptyResponse);

      await searchOpenLibraryAuthor(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Author not found" });
    });

    it("should handle API errors", async () => {
      req.query = { name: "J.K. Rowling" };

      // Ensure rate limit is not hit
      if (typeof global === "object" && global) {
        global.requestTimestamps = []; // Use proper global typing
      }

      // Mock API error
      const mockError = new Error("API error");
      (axios.get as jest.Mock).mockRejectedValue(mockError);

      await searchOpenLibraryAuthor(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Server error",
        error: "API error", // Match the actual error message format
      });
      // Verify axios was called (and subsequently rejected)
      expect(axios.get).toHaveBeenCalled();
    });

    it("should return 429 if rate limit is exceeded", async () => {
      // Make sure to completely reset the rate limiter state
      resetRateLimiter();

      const mockAxios = axios.get as jest.Mock;
      // Create a consistent mock response for all calls
      const mockResponse = {
        data: {
          docs: [{ name: "Test Author", key: "/authors/OL123" }],
          numFound: 1,
        },
      };

      // Set up the mock to always return the same response for simplicity
      mockAxios.mockResolvedValue(mockResponse);

      // Make 5 separate calls - these should all succeed
      for (let i = 0; i < 5; i++) {
        req.query = { name: `Test Author ${i}` };
        await searchOpenLibraryAuthor(req as Request, res as Response);

        // Verify each successful request returns 200
        expect(res.status).toHaveBeenLastCalledWith(200);
      }

      // Verify axios was called 5 times for the successful requests
      expect(mockAxios).toHaveBeenCalledTimes(5);

      // Clear the response mocks for the next assertion
      (res.status as jest.Mock).mockClear();
      (res.json as jest.Mock).mockClear();

      // This 6th call should be rate limited
      req.query = { name: "Rate Limited Author" };
      await searchOpenLibraryAuthor(req as Request, res as Response);

      // Should return 429 for the rate limited call
      expect(res.status).toHaveBeenCalledWith(429);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Rate limit exceeded. Please try again later.",
        })
      );

      // Axios should not be called again after rate limit is hit
      expect(mockAxios).toHaveBeenCalledTimes(5);
    });

    it("should handle author with photos correctly", async () => {
      req.query = { name: "Author with photos" };

      const mockAuthorData = {
        data: {
          docs: [
            {
              name: "Author with photos",
              key: "/authors/OL123456A",
              birth_date: "1980-01-01",
              top_work: "Famous Book",
              work_count: 50,
              photos: [9876], // Author has photos
            },
          ],
          numFound: 1,
        },
      };

      // Mock axios response for author data
      (axios.get as jest.Mock).mockResolvedValue(mockAuthorData);

      await searchOpenLibraryAuthor(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        author: expect.objectContaining({
          name: "Author with photos",
          photos: [9876],
          photo_url: "https://covers.openlibrary.org/a/id/9876-L.jpg",
        }),
      });
    });

    it("should handle author with no photos", async () => {
      req.query = { name: "Author without photos" };

      const mockAuthorData = {
        data: {
          docs: [
            {
              name: "Author without photos",
              key: "/authors/OL123456A",
              birth_date: "1980-01-01",
              top_work: "Famous Book",
              work_count: 50,
              // No photos array
            },
          ],
          numFound: 1,
        },
      };

      // Mock axios response for author data
      (axios.get as jest.Mock).mockResolvedValue(mockAuthorData);

      await searchOpenLibraryAuthor(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        author: expect.objectContaining({
          name: "Author without photos",
          photos: [], // Should default to empty array
          photo_url: null, // Should be null when no photos
        }),
      });
    });
  });

  describe("linkAuthorToBook", () => {
    it("should link an author to a book successfully", async () => {
      req.body = { authorId: 1, bookId: 2 };

      const mockAuthor = { id: 1, name: "Test Author" };
      const mockBook = { id: 2, title: "Test Book" };

      mockDb.get = jest
        .fn()
        .mockResolvedValueOnce(mockAuthor) // Author exists
        .mockResolvedValueOnce(mockBook) // Book exists
        .mockResolvedValueOnce(null); // Association doesn't exist yet

      await linkAuthorToBook(req as Request, res as Response);

      expect(mockDb.run).toHaveBeenCalledWith(
        "INSERT INTO author_books (author_id, book_id, is_primary) VALUES (?, ?, ?)",
        [1, 2, 0]
      );

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Author linked to book successfully",
      });
    });

    it("should update existing association if it already exists", async () => {
      req.body = { authorId: 1, bookId: 2, isPrimary: true };

      const mockAuthor = { id: 1, name: "Test Author" };
      const mockBook = { id: 2, title: "Test Book" };
      const mockAssociation = { author_id: 1, book_id: 2, is_primary: 0 };

      mockDb.get = jest
        .fn()
        .mockResolvedValueOnce(mockAuthor) // Author exists
        .mockResolvedValueOnce(mockBook) // Book exists
        .mockResolvedValueOnce(mockAssociation); // Association already exists

      await linkAuthorToBook(req as Request, res as Response);

      expect(mockDb.run).toHaveBeenCalledWith(
        "UPDATE author_books SET is_primary = ? WHERE author_id = ? AND book_id = ?",
        [1, 1, 2]
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Author-book relationship updated successfully",
      });
    });

    it("should return 400 if authorId or bookId is missing", async () => {
      req.body = { authorId: 1 }; // Missing bookId

      await linkAuthorToBook(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Author ID and Book ID are required",
      });
    });

    it("should return 404 if author not found", async () => {
      req.body = { authorId: 999, bookId: 2 };

      mockDb.get = jest.fn().mockResolvedValueOnce(null); // Author doesn't exist

      await linkAuthorToBook(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Author not found" });
    });

    it("should return 404 if book not found", async () => {
      req.body = { authorId: 1, bookId: 999 };

      const mockAuthor = { id: 1, name: "Test Author" };

      mockDb.get = jest
        .fn()
        .mockResolvedValueOnce(mockAuthor) // Author exists
        .mockResolvedValueOnce(null); // Book doesn't exist

      await linkAuthorToBook(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Book not found" });
    });

    it("should handle database error", async () => {
      req.body = { authorId: 1, bookId: 2 };

      const mockError = new Error("Database error");
      mockDb.get = jest.fn().mockRejectedValue(mockError);

      await linkAuthorToBook(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Server error",
        error: "Database error",
      });
    });

    it("should set isPrimary correctly when explicitly set to true", async () => {
      req.body = { authorId: 1, bookId: 2, isPrimary: true };

      const mockAuthor = { id: 1, name: "Test Author" };
      const mockBook = { id: 2, title: "Test Book" };

      mockDb.get = jest
        .fn()
        .mockResolvedValueOnce(mockAuthor) // Author exists
        .mockResolvedValueOnce(mockBook) // Book exists
        .mockResolvedValueOnce(null); // Association doesn't exist yet

      await linkAuthorToBook(req as Request, res as Response);

      // Verify isPrimary is set to 1 (true)
      expect(mockDb.run).toHaveBeenCalledWith(
        "INSERT INTO author_books (author_id, book_id, is_primary) VALUES (?, ?, ?)",
        [1, 2, 1]
      );

      expect(res.status).toHaveBeenCalledWith(201);
    });

    it("should set isPrimary correctly when explicitly set to false", async () => {
      req.body = { authorId: 1, bookId: 2, isPrimary: false };

      const mockAuthor = { id: 1, name: "Test Author" };
      const mockBook = { id: 2, title: "Test Book" };

      mockDb.get = jest
        .fn()
        .mockResolvedValueOnce(mockAuthor) // Author exists
        .mockResolvedValueOnce(mockBook) // Book exists
        .mockResolvedValueOnce(null); // Association doesn't exist yet

      await linkAuthorToBook(req as Request, res as Response);

      // Verify isPrimary is set to 0 (false)
      expect(mockDb.run).toHaveBeenCalledWith(
        "INSERT INTO author_books (author_id, book_id, is_primary) VALUES (?, ?, ?)",
        [1, 2, 0]
      );

      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe("unlinkAuthorFromBook", () => {
    it("should unlink an author from a book successfully", async () => {
      req.params = { authorId: "1", bookId: "2" };

      const mockAssociation = { author_id: 1, book_id: 2 };
      mockDb.get = jest.fn().mockResolvedValue(mockAssociation);
      // Mock run separately if needed, ensure it resolves
      mockDb.run = jest.fn().mockResolvedValue({ changes: 1 });

      await unlinkAuthorFromBook(req as Request, res as Response);

      // Expect strings from req.params
      expect(mockDb.run).toHaveBeenCalledWith(
        "DELETE FROM author_books WHERE author_id = ? AND book_id = ?",
        ["1", "2"]
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Author unlinked from book successfully",
      });
    });

    it("should return 400 if authorId or bookId parameter is missing", async () => {
      req.params = { authorId: "1" }; // Missing bookId

      await unlinkAuthorFromBook(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Author ID and Book ID are required",
      });
    });

    it("should return 404 if association not found", async () => {
      req.params = { authorId: "1", bookId: "2" };

      mockDb.get = jest.fn().mockResolvedValue(null);

      await unlinkAuthorFromBook(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Author-book association not found",
      });
    });

    it("should handle database error", async () => {
      req.params = { authorId: "1", bookId: "2" };

      const mockError = new Error("Database error");
      mockDb.get = jest.fn().mockRejectedValue(mockError);

      await unlinkAuthorFromBook(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Server error",
        error: "Database error",
      });
    });

    it("should return 400 if both parameters are missing", async () => {
      req.params = {}; // Both parameters missing

      await unlinkAuthorFromBook(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Author ID and Book ID are required",
      });
    });
  });

  describe("resetRateLimiter", () => {
    it("should reset the rate limiter state", async () => {
      // First, simulate several requests to fill the rate limiter
      const mockAuthorResponse = {
        data: { docs: [{ name: "Test Author", key: "/authors/OL1" }] },
      };

      (axios.get as jest.Mock).mockResolvedValue(mockAuthorResponse);

      // Make several requests to fill the rate limit
      for (let i = 0; i < 5; i++) {
        req.query = { authorName: `Test Author ${i}` };
        await getAuthorInfo(req as Request, res as Response);
      }

      // Try to make one more - should be rate limited
      req.query = { authorName: "Rate Limited Author" };
      await getAuthorInfo(req as Request, res as Response);
      expect(res.status).toHaveBeenLastCalledWith(429);

      // Reset status mock
      (res.status as jest.Mock).mockClear();

      // Now reset the rate limiter
      resetRateLimiter();

      // Should be able to make another request now
      await getAuthorInfo(req as Request, res as Response);
      expect(res.status).toHaveBeenLastCalledWith(200);
    });
  });
});
