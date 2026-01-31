import axios from "axios"; // Import axios properly at the top
import { NextFunction, Request, Response } from "express";
import request from "supertest";
import { app } from "../../index";

// Add proper TypeScript declaration for global variables
declare global {
  var requestTimestamps: number[];
}

// Mock the database to prevent actual changes during tests
jest.mock("../../db/database", () => {
  const mockDb = {
    get: jest.fn(),
    all: jest.fn(),
    run: jest.fn(),
    close: jest.fn(),
    exec: jest.fn(),
  };
  return {
    connectDatabase: jest.fn().mockResolvedValue(mockDb),
    __mockDb: mockDb,
  };
});

// Access the mock database instance
const mockDb = jest.requireMock("../../db/database").__mockDb;

// Mock axios for OpenLibrary API calls
jest.mock("axios", () => ({
  get: jest.fn(),
}));

// Mock the auth middleware to be more selective
jest.mock("../../middleware/auth", () => ({
  authenticate: (req: Request, res: Response, next: NextFunction): void => {
    // Check if Authorization header exists
    if (!req.headers.authorization) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    // Set user info for authenticated requests
    const token = req.headers.authorization.split(" ")[1];
    if (token === adminToken) {
      req.user = { id: 2, role: "admin" };
    } else {
      req.user = { id: 1, role: "user" };
    }
    next();
  },

  isAdmin: (req: Request, res: Response, next: NextFunction): void => {
    // Check if user is admin
    if (req.user && req.user.role === "admin") {
      next();
      return;
    }
    res
      .status(403)
      .json({ message: "Access denied: Admin privilege required" });
  },

  authenticateOptional: (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => next(),
  hasRole:
    () =>
    (req: Request, res: Response, next: NextFunction): void =>
      next(),
}));

// Define tokens for use in middleware mock
const authToken = "userToken";
const adminToken = "adminToken";

describe("Book API Integration Tests", () => {
  beforeAll(() => {
    // No need to create actual JWT tokens since we're mocking the middleware
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/books", () => {
    it("should return a list of books", async () => {
      const mockBooks = [
        { id: 1, title: "Book 1", isbn: "1234567890" },
        { id: 2, title: "Book 2", isbn: "0987654321" },
      ];

      // Setup the mock database responses
      (mockDb.all as jest.Mock).mockImplementation((query) => {
        if (query.includes("SELECT * FROM books")) {
          return Promise.resolve(mockBooks);
        } else if (query.includes("SELECT a.* FROM authors")) {
          return Promise.resolve([{ id: 1, name: "Author 1" }]);
        }
        return Promise.resolve([]);
      });

      const response = await request(app)
        .get("/api/books")
        .expect("Content-Type", /json/)
        .expect(200);

      expect(response.body).toHaveProperty("books");
      expect(response.body.books).toHaveLength(2);
      expect(response.body.books[0]).toHaveProperty("title", "Book 1");
      expect(mockDb.all).toHaveBeenCalledWith(
        expect.stringContaining("SELECT * FROM books")
      );
    });
  });

  describe("POST /api/books", () => {
    it("should create a new book when authenticated", async () => {
      const bookData = {
        title: "New Book",
        isbn: "1234567890",
        publishYear: 2023,
        author: "Test Author",
      };

      // Mock database responses
      (mockDb.get as jest.Mock).mockImplementation((query) => {
        if (query.includes("SELECT * FROM books WHERE isbn")) {
          return Promise.resolve(null); // No existing book with this ISBN
        }
        return Promise.resolve({ id: 1, ...bookData });
      });

      (mockDb.run as jest.Mock).mockImplementation((query) => {
        if (query.includes("INSERT INTO books")) {
          return Promise.resolve({ lastID: 1 });
        }
        return Promise.resolve({});
      });

      (mockDb.all as jest.Mock).mockResolvedValue([
        { id: 1, name: "Test Author" },
      ]);

      const response = await request(app)
        .post("/api/books")
        .set("Authorization", `Bearer ${authToken}`)
        .send(bookData)
        .expect("Content-Type", /json/)
        .expect(201);

      expect(response.body).toHaveProperty(
        "message",
        "Book created successfully"
      );
      expect(response.body).toHaveProperty("book");
      expect(response.body.book).toHaveProperty("title", "New Book");
      expect(mockDb.run).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO books"),
        expect.arrayContaining(["New Book", "1234567890"])
      );
    });

    it("should return 401 when not authenticated", async () => {
      const bookData = {
        title: "New Book",
        isbn: "1234567890",
        publishYear: 2023,
        author: "Test Author",
      };

      await request(app)
        .post("/api/books")
        .send(bookData)
        .expect("Content-Type", /json/)
        .expect(401);
    });
  });

  describe("GET /api/books/:id", () => {
    it("should return a book by ID", async () => {
      const mockBook = {
        id: 1,
        title: "Test Book",
        isbn: "1234567890",
        publishYear: 2023,
      };

      const mockAuthors = [{ id: 1, name: "Test Author", is_primary: 1 }];

      (mockDb.get as jest.Mock).mockResolvedValue(mockBook);
      (mockDb.all as jest.Mock).mockResolvedValue(mockAuthors);

      const response = await request(app)
        .get("/api/books/1")
        .expect("Content-Type", /json/)
        .expect(200);

      expect(response.body).toHaveProperty("book");
      expect(response.body.book).toHaveProperty("title", "Test Book");
      expect(response.body.book).toHaveProperty("authors");
      expect(response.body.book.authors).toEqual(mockAuthors);
      expect(mockDb.get).toHaveBeenCalledWith(
        "SELECT * FROM books WHERE id = ?",
        ["1"]
      );
    });

    it("should return 404 for a non-existent book ID", async () => {
      (mockDb.get as jest.Mock).mockResolvedValue(null);

      await request(app)
        .get("/api/books/999")
        .expect("Content-Type", /json/)
        .expect(404);
    });
  });

  describe("DELETE /api/books/:id", () => {
    it("should allow admins to delete a book", async () => {
      (mockDb.get as jest.Mock).mockResolvedValue({
        id: 1,
        title: "Book to Delete",
      });
      (mockDb.run as jest.Mock).mockResolvedValue({});

      await request(app)
        .delete("/api/books/1")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect("Content-Type", /json/)
        .expect(200);

      expect(mockDb.run).toHaveBeenCalledWith(
        "DELETE FROM books WHERE id = ?",
        ["1"]
      );
    });

    it("should return 403 when a non-admin user tries to delete a book", async () => {
      (mockDb.get as jest.Mock).mockResolvedValue({
        id: 1,
        title: "Book to Delete",
      });

      await request(app)
        .delete("/api/books/1")
        .set("Authorization", `Bearer ${authToken}`)
        .expect("Content-Type", /json/)
        .expect(403);
    });
  });

  describe("GET /api/books/search/open-library", () => {
    it("should search OpenLibrary and return results", async () => {
      // Use the already imported axios instance
      // Mock the axios response for title search
      (axios.get as jest.Mock).mockResolvedValueOnce({
        data: {
          docs: [
            {
              title: "Harry Potter",
              author_name: ["J.K. Rowling"],
              first_publish_year: 1997,
              isbn: ["9780747532743"],
              cover_i: 12345,
              key: "/works/OL82586W",
            },
          ],
          numFound: 1,
          start: 0,
        },
      });

      // Mock the rate limiter to always allow requests
      global.requestTimestamps = [];

      const response = await request(app)
        .get("/api/books/search/open-library")
        .query({ query: "Harry Potter" })
        .expect("Content-Type", /json/)
        .expect(200);

      expect(response.body).toHaveProperty("books");
      expect(response.body.books).toHaveLength(1);
      expect(response.body.books[0]).toHaveProperty("title", "Harry Potter");
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining("openlibrary.org"),
        expect.objectContaining({ headers: expect.any(Object) })
      );
    });
  });

  describe("GET /api/books/search", () => {
    it("should search books in the database", async () => {
      const mockSearchResults = [
        { id: 1, title: "Harry Potter", isbn: "1234567890" },
      ];

      // Make sure our mock responds to the book search query
      (mockDb.all as jest.Mock).mockImplementation((query, params = []) => {
        // For book search query
        if (
          query.includes("SELECT DISTINCT b.* FROM books b") ||
          query.includes("WHERE b.title LIKE") ||
          params.includes("%Harry Potter%")
        ) {
          return Promise.resolve(mockSearchResults);
        }
        // For author query that follows
        else if (query.includes("SELECT a.* FROM authors a")) {
          return Promise.resolve([{ id: 1, name: "J.K. Rowling" }]);
        }
        // Default response
        return Promise.resolve([]);
      });

      const response = await request(app)
        .get("/api/books/search")
        .query({ q: "Harry Potter" })
        .expect("Content-Type", /json/)
        .expect(200);

      expect(response.body).toHaveProperty("books");
      expect(response.body.books).toHaveLength(1);
      expect(response.body.books[0]).toHaveProperty("title", "Harry Potter");
    });

    it("should return 400 if search query is missing", async () => {
      await request(app)
        .get("/api/books/search")
        .expect("Content-Type", /json/)
        .expect(400);
    });
  });

  describe("POST /api/books/collection", () => {
    it("should add a book to user collection when authenticated", async () => {
      (mockDb.get as jest.Mock).mockImplementation((query) => {
        if (query.includes("SELECT * FROM books WHERE id = ?")) {
          return Promise.resolve({ id: 1, title: "Test Book" });
        } else if (query.includes("SELECT * FROM user_collections")) {
          return Promise.resolve(null); // Not already in collection
        }
        return Promise.resolve(null);
      });

      (mockDb.run as jest.Mock).mockResolvedValue({});

      await request(app)
        .post("/api/books/collection")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ bookId: 1 })
        .expect("Content-Type", /json/)
        .expect(201);

      expect(mockDb.run).toHaveBeenCalledWith(
        "INSERT INTO user_collections (userId, bookId) VALUES (?, ?)",
        [1, 1]
      );
    });

    it("should return 401 when not authenticated", async () => {
      await request(app)
        .post("/api/books/collection")
        .send({ bookId: 1 })
        .expect("Content-Type", /json/)
        .expect(401);
    });
  });

  describe("GET /api/books/collection", () => {
    it("should get user collection when authenticated", async () => {
      const mockCollection = [{ id: 1, title: "Book 1", isbn: "1234567890" }];

      (mockDb.all as jest.Mock).mockImplementation((query) => {
        if (query.includes("JOIN user_collections")) {
          return Promise.resolve(mockCollection);
        } else if (query.includes("SELECT a.* FROM authors")) {
          return Promise.resolve([{ id: 1, name: "Author 1" }]);
        }
        return Promise.resolve([]);
      });

      const response = await request(app)
        .get("/api/books/collection")
        .set("Authorization", `Bearer ${authToken}`)
        .expect("Content-Type", /json/)
        .expect(200);

      expect(response.body).toHaveProperty("books");
      expect(response.body.books).toHaveLength(1);
      expect(response.body.books[0]).toHaveProperty("title", "Book 1");
      expect(mockDb.all).toHaveBeenCalledWith(
        expect.stringContaining("JOIN user_collections"),
        [1]
      );
    });

    it("should return 401 when not authenticated", async () => {
      await request(app)
        .get("/api/books/collection")
        .expect("Content-Type", /json/)
        .expect(401);
    });
  });

  describe("DELETE /api/books/collection/:bookId", () => {
    it("should remove a book from user collection when authenticated", async () => {
      (mockDb.get as jest.Mock).mockResolvedValue({ userId: 1, bookId: 1 });
      (mockDb.run as jest.Mock).mockResolvedValue({});

      await request(app)
        .delete("/api/books/collection/1")
        .set("Authorization", `Bearer ${authToken}`)
        .expect("Content-Type", /json/)
        .expect(200);

      expect(mockDb.run).toHaveBeenCalledWith(
        "DELETE FROM user_collections WHERE userId = ? AND bookId = ?",
        [1, "1"]
      );
    });

    it("should return 401 when not authenticated", async () => {
      await request(app)
        .delete("/api/books/collection/1")
        .expect("Content-Type", /json/)
        .expect(401);
    });

    it("should return 404 when book not in user collection", async () => {
      (mockDb.get as jest.Mock).mockResolvedValue(null);

      await request(app)
        .delete("/api/books/collection/999")
        .set("Authorization", `Bearer ${authToken}`)
        .expect("Content-Type", /json/)
        .expect(404);
    });
  });
});
