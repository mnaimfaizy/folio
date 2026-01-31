import express from "express";
import request from "supertest";
import * as reviewsController from "../../controllers/reviewsController";
import { authenticateOptional } from "../../middleware/auth";
import reviewRoutes from "../../routes/reviewRoutes";

// Mock the auth middleware
jest.mock("../../middleware/auth", () => ({
  authenticateOptional: jest.fn((req, res, next) => {
    req.user = { id: 1, role: "user" };
    next();
  }),
}));

// Mock the controllers
jest.mock("../../controllers/reviewsController");

describe("Review Routes", () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use("/api", reviewRoutes);

    // Reset all mocks
    jest.clearAllMocks();

    // Default implementation for mocked controller methods
    (reviewsController.getBookReviews as jest.Mock).mockImplementation(
      (req, res) => {
        res
          .status(200)
          .json([
            {
              id: 1,
              bookId: parseInt(req.params.bookId),
              rating: 4,
              comment: "Great book",
            },
          ]);
      }
    );

    (reviewsController.createReview as jest.Mock).mockImplementation(
      (req, res) => {
        const bookId = parseInt(req.params.bookId);
        res.status(201).json({
          id: 1,
          bookId,
          userId: req.user?.id || null,
          ...req.body,
        });
      }
    );

    (reviewsController.updateReview as jest.Mock).mockImplementation(
      (req, res) => {
        const reviewId = parseInt(req.params.reviewId);
        res.status(200).json({
          id: reviewId,
          bookId: 1,
          userId: req.user?.id || null,
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

  describe("GET /api/books/:bookId/reviews", () => {
    it("should get all reviews for a book", async () => {
      const response = await request(app).get("/api/books/1/reviews");
      expect(response.status).toBe(200);
      expect(reviewsController.getBookReviews).toHaveBeenCalled();
      expect(response.body).toEqual([
        { id: 1, bookId: 1, rating: 4, comment: "Great book" },
      ]);
    });
  });

  describe("POST /api/books/:bookId/reviews", () => {
    it("should create a new review", async () => {
      const reviewData = {
        rating: 5,
        comment: "Excellent read!",
      };

      const response = await request(app)
        .post("/api/books/1/reviews")
        .send(reviewData);

      expect(response.status).toBe(201);
      expect(authenticateOptional).toHaveBeenCalled();
      expect(reviewsController.createReview).toHaveBeenCalled();
      expect(response.body).toEqual({
        id: 1,
        bookId: 1,
        userId: 1,
        rating: 5,
        comment: "Excellent read!",
      });
    });
  });

  describe("PUT /api/reviews/:reviewId", () => {
    it("should update a review", async () => {
      const updateData = {
        rating: 3,
        comment: "Updated review",
      };

      const response = await request(app)
        .put("/api/reviews/1")
        .send(updateData);

      expect(response.status).toBe(200);
      expect(authenticateOptional).toHaveBeenCalled();
      expect(reviewsController.updateReview).toHaveBeenCalled();
      expect(response.body).toEqual({
        id: 1,
        bookId: 1,
        userId: 1,
        rating: 3,
        comment: "Updated review",
      });
    });
  });

  describe("DELETE /api/reviews/:reviewId", () => {
    it("should delete a review", async () => {
      const response = await request(app).delete("/api/reviews/1");

      expect(response.status).toBe(200);
      expect(authenticateOptional).toHaveBeenCalled();
      expect(reviewsController.deleteReview).toHaveBeenCalled();
      expect(response.body).toEqual({ message: "Review deleted successfully" });
    });
  });
});
