import express from "express";
import request from "supertest";
import * as booksController from "../../../controllers/booksController";
import { authenticate, isAdmin } from "../../../middleware/auth";
import bookRoutes from "../../../routes/admin/bookRoutes";

// Mock the auth middleware
jest.mock("../../../middleware/auth", () => ({
  authenticate: jest.fn((req, res, next) => {
    req.user = { id: 1, isAdmin: true };
    next();
  }),
  isAdmin: jest.fn((req, res, next) => next()),
}));

// Mock the controllers
jest.mock("../../../controllers/booksController");

describe("Admin Book Routes", () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use("/api/admin/books", bookRoutes);

    // Reset all mocks
    jest.clearAllMocks();

    // Default implementation for mocked controller methods
    (booksController.getAllBooks as jest.Mock).mockImplementation(
      (req, res) => {
        res.status(200).json({ data: [], total: 0, page: 1, limit: 10 });
      }
    );

    (booksController.getBookById as jest.Mock).mockImplementation(
      (req, res) => {
        res.status(200).json({
          id: parseInt(req.params.id),
          title: "Test Book",
          author: "Test Author",
          isbn: "1234567890123",
        });
      }
    );

    (booksController.createBookManually as jest.Mock).mockImplementation(
      (req, res) => {
        res.status(201).json({ id: 1, ...req.body });
      }
    );

    (booksController.createBookByIsbn as jest.Mock).mockImplementation(
      (req, res) => {
        res.status(201).json({
          id: 1,
          isbn: req.body.isbn,
          title: "Book from ISBN",
          author: "ISBN Author",
        });
      }
    );

    (booksController.updateBook as jest.Mock).mockImplementation((req, res) => {
      res.status(200).json({ id: parseInt(req.params.id), ...req.body });
    });

    (booksController.deleteBook as jest.Mock).mockImplementation((req, res) => {
      res.status(200).json({ message: "Book deleted successfully" });
    });
  });

  describe("GET /api/admin/books", () => {
    it("should get all books", async () => {
      const response = await request(app).get("/api/admin/books");
      expect(response.status).toBe(200);
      expect(authenticate).toHaveBeenCalled();
      expect(isAdmin).toHaveBeenCalled();
      expect(booksController.getAllBooks).toHaveBeenCalled();
      expect(response.body).toEqual({ data: [], total: 0, page: 1, limit: 10 });
    });
  });

  describe("GET /api/admin/books/:id", () => {
    it("should get book by ID", async () => {
      const response = await request(app).get("/api/admin/books/1");
      expect(response.status).toBe(200);
      expect(authenticate).toHaveBeenCalled();
      expect(isAdmin).toHaveBeenCalled();
      expect(booksController.getBookById).toHaveBeenCalled();
      expect(response.body).toEqual({
        id: 1,
        title: "Test Book",
        author: "Test Author",
        isbn: "1234567890123",
      });
    });
  });

  describe("POST /api/admin/books", () => {
    it("should create a new book manually", async () => {
      const bookData = {
        title: "New Book",
        author: "New Author",
        isbn: "9781234567897",
        publicationYear: 2023,
        genre: "Fiction",
        description: "Test description",
      };

      const response = await request(app)
        .post("/api/admin/books")
        .send(bookData);

      expect(response.status).toBe(201);
      expect(authenticate).toHaveBeenCalled();
      expect(isAdmin).toHaveBeenCalled();
      expect(booksController.createBookManually).toHaveBeenCalled();
      expect(response.body).toEqual({ id: 1, ...bookData });
    });
  });

  describe("POST /api/admin/books/isbn", () => {
    it("should create a book from ISBN", async () => {
      const isbnData = {
        isbn: "9781234567897",
      };

      const response = await request(app)
        .post("/api/admin/books/isbn")
        .send(isbnData);

      expect(response.status).toBe(201);
      expect(authenticate).toHaveBeenCalled();
      expect(isAdmin).toHaveBeenCalled();
      expect(booksController.createBookByIsbn).toHaveBeenCalled();
      expect(response.body).toEqual({
        id: 1,
        isbn: "9781234567897",
        title: "Book from ISBN",
        author: "ISBN Author",
      });
    });
  });

  describe("PUT /api/admin/books/:id", () => {
    it("should update a book", async () => {
      const updateData = {
        title: "Updated Book",
        description: "Updated description",
      };

      const response = await request(app)
        .put("/api/admin/books/1")
        .send(updateData);

      expect(response.status).toBe(200);
      expect(authenticate).toHaveBeenCalled();
      expect(isAdmin).toHaveBeenCalled();
      expect(booksController.updateBook).toHaveBeenCalled();
      expect(response.body).toEqual({ id: 1, ...updateData });
    });
  });

  describe("DELETE /api/admin/books/:id", () => {
    it("should delete a book", async () => {
      const response = await request(app).delete("/api/admin/books/1");

      expect(response.status).toBe(200);
      expect(authenticate).toHaveBeenCalled();
      expect(isAdmin).toHaveBeenCalled();
      expect(booksController.deleteBook).toHaveBeenCalled();
      expect(response.body).toEqual({ message: "Book deleted successfully" });
    });
  });
});
