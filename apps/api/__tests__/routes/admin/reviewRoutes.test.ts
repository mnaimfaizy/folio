import express from "express";
import request from "supertest";
import * as reviewsController from "../../../controllers/reviewsController";
import * as database from "../../../db/database";
import { authenticate, isAdmin } from "../../../middleware/auth";
import reviewRoutes from "../../../routes/admin/reviewRoutes";

// Mock the auth middleware
jest.mock("../../../middleware/auth", () => ({
  authenticate: jest.fn((req, res, next) => next()),
  isAdmin: jest.fn((req, res, next) => next()),
}));

// Mock the controllers
jest.mock("../../../controllers/reviewsController");

// Mock the database
jest.mock("../../../db/database", () => ({
  connectDatabase: jest.fn(),
}));

describe("Admin Review Routes", () => {
  let app: express.Application;

  // Mock database methods
  const mockDb = {
    all: jest.fn(),
    get: jest.fn(),
    run: jest.fn(),
  };

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use("/api/admin/reviews", reviewRoutes);

    // Reset all mocks
    jest.clearAllMocks();

    // Mock database connection
    (database.connectDatabase as jest.Mock).mockResolvedValue(mockDb);

    // Setup mock database responses
    mockDb.all.mockResolvedValue([
      {
        id: 1,
        bookId: 1,
        userId: 2,
        rating: 4,
        comment: "Great book",
        user_name: "John Doe",
        book_title: "Test Book",
      },
    ]);

    // Default implementation for mocked controller methods
    (reviewsController.getBookReviews as jest.Mock).mockImplementation(
      (req, res) => {
        res.status(200).json([
          {
            id: 1,
            bookId: parseInt(req.params.bookId),
            rating: 4,
            comment: "Great book",
          },
        ]);
      }
    );

    (reviewsController.updateReview as jest.Mock).mockImplementation(
      (req, res) => {
        res.status(200).json({
          id: parseInt(req.params.reviewId),
          ...req.body,
        });
      }
    );

    (reviewsController.deleteReview as jest.Mock).mockImplementation(
      (req, res) => {
        res.status(200).json({ message: "Review deleted successfully" });
      }
    );
  });

  describe("GET /api/admin/reviews", () => {
    it("should get all reviews with user and book details", async () => {
      const response = await request(app).get("/api/admin/reviews");
      expect(response.status).toBe(200);
      expect(authenticate).toHaveBeenCalled();
      expect(isAdmin).toHaveBeenCalled();
      expect(database.connectDatabase).toHaveBeenCalled();
      expect(mockDb.all).toHaveBeenCalled();
      expect(response.body).toEqual([
        {
          id: 1,
          bookId: 1,
          userId: 2,
          rating: 4,
          comment: "Great book",
          user_name: "John Doe",
          book_title: "Test Book",
        },
      ]);
    });

    it("should handle database errors", async () => {
      mockDb.all.mockRejectedValue(new Error("Database error"));

      const response = await request(app).get("/api/admin/reviews");
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("message", "Server error");
      expect(response.body).toHaveProperty("error", "Database error");
    });
  });

  describe("GET /api/admin/reviews/book/:bookId", () => {
    it("should get reviews for a specific book", async () => {
      const response = await request(app).get("/api/admin/reviews/book/1");
      expect(response.status).toBe(200);
      expect(authenticate).toHaveBeenCalled();
      expect(isAdmin).toHaveBeenCalled();
      expect(reviewsController.getBookReviews).toHaveBeenCalled();
      expect(response.body).toEqual([
        {
          id: 1,
          bookId: 1,
          rating: 4,
          comment: "Great book",
        },
      ]);
    });
  });

  describe("PUT /api/admin/reviews/:reviewId", () => {
    it("should update a review", async () => {
      const updateData = {
        rating: 3,
        comment: "Updated review",
      };

      const response = await request(app)
        .put("/api/admin/reviews/1")
        .send(updateData);

      expect(response.status).toBe(200);
      expect(authenticate).toHaveBeenCalled();
      expect(isAdmin).toHaveBeenCalled();
      expect(reviewsController.updateReview).toHaveBeenCalled();
      expect(response.body).toEqual({
        id: 1,
        rating: 3,
        comment: "Updated review",
      });
    });
  });

  describe("DELETE /api/admin/reviews/:reviewId", () => {
    it("should delete a review", async () => {
      const response = await request(app).delete("/api/admin/reviews/1");

      expect(response.status).toBe(200);
      expect(authenticate).toHaveBeenCalled();
      expect(isAdmin).toHaveBeenCalled();
      expect(reviewsController.deleteReview).toHaveBeenCalled();
      expect(response.body).toEqual({ message: "Review deleted successfully" });
    });
  });
});
