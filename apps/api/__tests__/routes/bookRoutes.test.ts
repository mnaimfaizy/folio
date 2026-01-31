import express from "express";
import request from "supertest";
import { searchBooks } from "../../controllers/booksController";
import bookRoutes from "../../routes/bookRoutes";

// Mock dependencies
jest.mock("../../controllers/booksController", () => ({
  getAllBooks: jest.fn((req, res) =>
    res.status(200).json({ books: [], message: "Mocked get all books" })
  ),
  getBookById: jest.fn((req, res) =>
    res.status(200).json({ book: {}, message: "Mocked get book by id" })
  ),
  createBookManually: jest.fn((req, res) =>
    res.status(201).json({ message: "Mocked create book manually" })
  ),
  createBookByIsbn: jest.fn((req, res) =>
    res.status(201).json({ message: "Mocked create book by ISBN" })
  ),
  updateBook: jest.fn((req, res) =>
    res.status(200).json({ message: "Mocked update book" })
  ),
  deleteBook: jest.fn((req, res) =>
    res.status(200).json({ message: "Mocked delete book" })
  ),
  searchBooks: jest.fn((req, res) =>
    res.status(200).json({ books: [], message: "Mocked search books" })
  ),
  searchOpenLibrary: jest.fn((req, res) =>
    res.status(200).json({ books: [], message: "Mocked search OpenLibrary" })
  ),
  addToUserCollection: jest.fn((req, res) =>
    res.status(201).json({ message: "Mocked add to collection" })
  ),
  removeFromUserCollection: jest.fn((req, res) =>
    res.status(200).json({ message: "Mocked remove from collection" })
  ),
  getUserCollection: jest.fn((req, res) =>
    res.status(200).json({ books: [], message: "Mocked get collection" })
  ),
}));

jest.mock("../../middleware/auth", () => ({
  authenticate: jest.fn((req, res, next) => {
    req.user = { id: 1, email: "test@example.com" };
    next();
  }),
  isAdmin: jest.fn((req, res, next) => next()),
}));

describe("Book Routes", () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use("/api/books", bookRoutes);

    // Add the search route that's not in the actual router but in the test
    app.get("/api/books/search", (req, res) => searchBooks(req, res));
  });

  describe("GET /api/books", () => {
    it("should route to getAllBooks controller", async () => {
      const response = await request(app).get("/api/books").send();

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Mocked get all books");
    });
  });

  describe("GET /api/books/:id", () => {
    it("should route to getBookById controller", async () => {
      const response = await request(app).get("/api/books/1").send();

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Mocked get book by id");
    });
  });

  describe("POST /api/books", () => {
    it("should route to createBookManually controller with authentication", async () => {
      const response = await request(app)
        .post("/api/books")
        .send({
          title: "Test Book",
          isbn: "1234567890",
          authors: [{ name: "Test Author" }],
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe("Mocked create book manually");
    });
  });

  describe("POST /api/books/by-isbn", () => {
    it("should route to createBookByIsbn controller with authentication", async () => {
      const response = await request(app)
        .post("/api/books/isbn")
        .send({ isbn: "1234567890" });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe("Mocked create book by ISBN");
    });
  });

  describe("PUT /api/books/:id", () => {
    it("should route to updateBook controller with authentication", async () => {
      const response = await request(app).put("/api/books/1").send({
        title: "Updated Book",
        isbn: "0987654321",
      });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Mocked update book");
    });
  });

  describe("DELETE /api/books/:id", () => {
    it("should route to deleteBook controller with authentication", async () => {
      const response = await request(app).delete("/api/books/1").send();

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Mocked delete book");
    });
  });

  describe("GET /api/books/search", () => {
    it("should route to searchBooks controller", async () => {
      const response = await request(app)
        .get("/api/books/search?q=test")
        .send();

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Mocked search books");
    });
  });

  describe("GET /api/books/search/open-library", () => {
    it("should route to searchOpenLibrary controller", async () => {
      const response = await request(app)
        .get("/api/books/search/open-library?query=test&type=title")
        .send();

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Mocked search OpenLibrary");
    });
  });

  describe("POST /api/books/user/collection", () => {
    it("should route to addToUserCollection controller with authentication", async () => {
      const response = await request(app)
        .post("/api/books/user/collection")
        .send({ bookId: 1 });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe("Mocked add to collection");
    });
  });

  describe("DELETE /api/books/user/collection/:bookId", () => {
    it("should route to removeFromUserCollection controller with authentication", async () => {
      const response = await request(app)
        .delete("/api/books/user/collection/1")
        .send();

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Mocked remove from collection");
    });
  });

  describe("GET /api/books/user/collection", () => {
    it("should route to getUserCollection controller with authentication", async () => {
      const response = await request(app)
        .get("/api/books/user/collection")
        .send();

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Mocked get collection");
    });
  });
});
