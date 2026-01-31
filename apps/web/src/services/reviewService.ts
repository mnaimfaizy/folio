// filepath: c:\Users\mnaim\Downloads\Projects\vibe-coding-projects\library-ui\src\services\reviewService.ts
import api from "./api";
import { AxiosResponse } from "axios";

export interface Review {
  id?: number;
  bookId: number;
  userId?: number;
  username: string;
  rating: number;
  comment: string;
  createdAt?: string;
  updatedAt?: string;
}

const reviewService = {
  // Get all reviews for a specific book
  getBookReviews: async (bookId: number): Promise<Review[]> => {
    try {
      const response: AxiosResponse<Review[]> = await api.get(
        `/api/books/${bookId}/reviews`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching book reviews:", error);
      return [];
    }
  },

  // Create a new review for a book
  createReview: async (
    bookId: number,
    reviewData: Omit<Review, "id" | "bookId" | "createdAt" | "updatedAt">
  ): Promise<Review | null> => {
    try {
      const response: AxiosResponse<Review> = await api.post(
        `/api/books/${bookId}/reviews`,
        reviewData
      );
      return response.data;
    } catch (error) {
      console.error("Error creating review:", error);
      throw error;
    }
  },

  // Update an existing review
  updateReview: async (
    reviewId: number,
    reviewData: Partial<Review>
  ): Promise<Review | null> => {
    try {
      const response: AxiosResponse<Review> = await api.put(
        `/api/reviews/${reviewId}`,
        reviewData
      );
      return response.data;
    } catch (error) {
      console.error("Error updating review:", error);
      throw error;
    }
  },

  // Delete a review
  deleteReview: async (reviewId: number): Promise<boolean> => {
    try {
      await api.delete(`/api/reviews/${reviewId}`);
      return true;
    } catch (error) {
      console.error("Error deleting review:", error);
      throw error;
    }
  },
};

export default reviewService;
