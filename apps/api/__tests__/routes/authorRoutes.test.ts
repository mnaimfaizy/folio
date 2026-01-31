import express from "express";
import request from "supertest";
import * as authorsController from "../../controllers/authorsController";
import { authenticate } from "../../middleware/auth";
import authorRoutes from "../../routes/authorRoutes";

// Mock the auth middleware
jest.mock("../../middleware/auth", () => ({
  authenticate: jest.fn((req, res, next) => next()),
}));

// Mock the controllers
jest.mock("../../controllers/authorsController");

describe("Author Routes", () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use("/api/authors", authorRoutes);

    // Reset all mocks
    jest.clearAllMocks();

    // Default implementation for mocked controller methods
    (authorsController.getAllAuthors as jest.Mock).mockImplementation(
      (req, res) => {
        res.status(200).json({ data: [], total: 0, page: 1, limit: 10 });
      }
    );

    (authorsController.getAuthorById as jest.Mock).mockImplementation(
      (req, res) => {
        res.status(200).json({ id: 1, name: "Test Author" });
      }
    );

    (authorsController.getAuthorByName as jest.Mock).mockImplementation(
      (req, res) => {
        res.status(200).json({ id: 1, name: req.params.name });
      }
    );

    (authorsController.getAuthorInfo as jest.Mock).mockImplementation(
      (req, res) => {
        res.status(200).json({ info: "Author info" });
      }
    );

    (authorsController.createAuthor as jest.Mock).mockImplementation(
      (req, res) => {
        res.status(201).json({ id: 1, ...req.body });
      }
    );

    (authorsController.updateAuthor as jest.Mock).mockImplementation(
      (req, res) => {
        res.status(200).json({ id: parseInt(req.params.id), ...req.body });
      }
    );

    (authorsController.deleteAuthor as jest.Mock).mockImplementation(
      (req, res) => {
        res.status(200).json({ message: "Author deleted successfully" });
      }
    );

    (authorsController.addBookToAuthor as jest.Mock).mockImplementation(
      (req, res) => {
        res.status(200).json({ message: "Book added to author successfully" });
      }
    );

    (authorsController.removeBookFromAuthor as jest.Mock).mockImplementation(
      (req, res) => {
        res
          .status(200)
          .json({ message: "Book removed from author successfully" });
      }
    );
  });

  describe("GET /api/authors", () => {
    it("should get all authors", async () => {
      const response = await request(app).get("/api/authors");
      expect(response.status).toBe(200);
      expect(authorsController.getAllAuthors).toHaveBeenCalled();
      expect(response.body).toEqual({ data: [], total: 0, page: 1, limit: 10 });
    });
  });

  describe("GET /api/authors/id/:id", () => {
    it("should get author by ID", async () => {
      const response = await request(app).get("/api/authors/id/1");
      expect(response.status).toBe(200);
      expect(authorsController.getAuthorById).toHaveBeenCalled();
      expect(response.body).toEqual({ id: 1, name: "Test Author" });
    });
  });

  describe("GET /api/authors/name/:name", () => {
    it("should get author by name", async () => {
      const response = await request(app).get("/api/authors/name/John%20Doe");
      expect(response.status).toBe(200);
      expect(authorsController.getAuthorByName).toHaveBeenCalled();
      expect(response.body).toEqual({ id: 1, name: "John Doe" });
    });
  });

  describe("GET /api/authors/info", () => {
    it("should get author info", async () => {
      const response = await request(app).get(
        "/api/authors/info?name=John%20Doe"
      );
      expect(response.status).toBe(200);
      expect(authorsController.getAuthorInfo).toHaveBeenCalled();
      expect(response.body).toEqual({ info: "Author info" });
    });
  });

  describe("POST /api/authors", () => {
    it("should create a new author", async () => {
      const authorData = {
        name: "New Author",
        biography: "Test biography",
        birthDate: "1950-01-01",
        nationality: "American",
      };

      const response = await request(app).post("/api/authors").send(authorData);

      expect(response.status).toBe(201);
      expect(authenticate).toHaveBeenCalled();
      expect(authorsController.createAuthor).toHaveBeenCalled();
      expect(response.body).toEqual({ id: 1, ...authorData });
    });
  });

  describe("PUT /api/authors/:id", () => {
    it("should update an author", async () => {
      const updateData = {
        name: "Updated Author",
        biography: "Updated biography",
      };

      const response = await request(app)
        .put("/api/authors/1")
        .send(updateData);

      expect(response.status).toBe(200);
      expect(authenticate).toHaveBeenCalled();
      expect(authorsController.updateAuthor).toHaveBeenCalled();
      expect(response.body).toEqual({ id: 1, ...updateData });
    });
  });

  describe("DELETE /api/authors/:id", () => {
    it("should delete an author", async () => {
      const response = await request(app).delete("/api/authors/1");

      expect(response.status).toBe(200);
      expect(authenticate).toHaveBeenCalled();
      expect(authorsController.deleteAuthor).toHaveBeenCalled();
      expect(response.body).toEqual({ message: "Author deleted successfully" });
    });
  });

  describe("POST /api/authors/book", () => {
    it("should add a book to an author", async () => {
      const bookData = {
        authorId: 1,
        bookId: 2,
      };

      const response = await request(app)
        .post("/api/authors/book")
        .send(bookData);

      expect(response.status).toBe(200);
      expect(authenticate).toHaveBeenCalled();
      expect(authorsController.addBookToAuthor).toHaveBeenCalled();
      expect(response.body).toEqual({
        message: "Book added to author successfully",
      });
    });
  });

  describe("DELETE /api/authors/:authorId/book/:bookId", () => {
    it("should remove a book from an author", async () => {
      const response = await request(app).delete("/api/authors/1/book/2");

      expect(response.status).toBe(200);
      expect(authenticate).toHaveBeenCalled();
      expect(authorsController.removeBookFromAuthor).toHaveBeenCalled();
      expect(response.body).toEqual({
        message: "Book removed from author successfully",
      });
    });
  });
});
