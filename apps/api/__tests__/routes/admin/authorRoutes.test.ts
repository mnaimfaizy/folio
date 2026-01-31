import express from "express";
import request from "supertest";
import * as authorsController from "../../../controllers/authorsController";
import { authenticate, isAdmin } from "../../../middleware/auth";
import authorRoutes from "../../../routes/admin/authorRoutes";

// Mock the auth middleware
jest.mock("../../../middleware/auth", () => ({
  authenticate: jest.fn((req, res, next) => next()),
  isAdmin: jest.fn((req, res, next) => next()),
}));

// Mock the controllers
jest.mock("../../../controllers/authorsController");

describe("Admin Author Routes", () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use("/api/admin/authors", authorRoutes);

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
        res.status(200).json({
          id: parseInt(req.params.id),
          name: "Test Author",
          biography: "Author biography",
          nationality: "American",
        });
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
  });

  describe("GET /api/admin/authors", () => {
    it("should get all authors", async () => {
      const response = await request(app).get("/api/admin/authors");
      expect(response.status).toBe(200);
      expect(authenticate).toHaveBeenCalled();
      expect(isAdmin).toHaveBeenCalled();
      expect(authorsController.getAllAuthors).toHaveBeenCalled();
      expect(response.body).toEqual({ data: [], total: 0, page: 1, limit: 10 });
    });
  });

  describe("GET /api/admin/authors/:id", () => {
    it("should get author by ID", async () => {
      const response = await request(app).get("/api/admin/authors/1");
      expect(response.status).toBe(200);
      expect(authenticate).toHaveBeenCalled();
      expect(isAdmin).toHaveBeenCalled();
      expect(authorsController.getAuthorById).toHaveBeenCalled();
      expect(response.body).toEqual({
        id: 1,
        name: "Test Author",
        biography: "Author biography",
        nationality: "American",
      });
    });
  });

  describe("POST /api/admin/authors", () => {
    it("should create a new author", async () => {
      const authorData = {
        name: "New Author",
        biography: "New author biography",
        birthDate: "1960-01-01",
        nationality: "Canadian",
      };

      const response = await request(app)
        .post("/api/admin/authors")
        .send(authorData);

      expect(response.status).toBe(201);
      expect(authenticate).toHaveBeenCalled();
      expect(isAdmin).toHaveBeenCalled();
      expect(authorsController.createAuthor).toHaveBeenCalled();
      expect(response.body).toEqual({ id: 1, ...authorData });
    });
  });

  describe("PUT /api/admin/authors/:id", () => {
    it("should update an author", async () => {
      const updateData = {
        name: "Updated Author",
        biography: "Updated biography",
        nationality: "British",
      };

      const response = await request(app)
        .put("/api/admin/authors/1")
        .send(updateData);

      expect(response.status).toBe(200);
      expect(authenticate).toHaveBeenCalled();
      expect(isAdmin).toHaveBeenCalled();
      expect(authorsController.updateAuthor).toHaveBeenCalled();
      expect(response.body).toEqual({ id: 1, ...updateData });
    });
  });

  describe("DELETE /api/admin/authors/:id", () => {
    it("should delete an author", async () => {
      const response = await request(app).delete("/api/admin/authors/1");

      expect(response.status).toBe(200);
      expect(authenticate).toHaveBeenCalled();
      expect(isAdmin).toHaveBeenCalled();
      expect(authorsController.deleteAuthor).toHaveBeenCalled();
      expect(response.body).toEqual({ message: "Author deleted successfully" });
    });
  });
});
