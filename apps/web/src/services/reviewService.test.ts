/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "./api";
import reviewService from "./reviewService";

vi.mock("./api");
const mockApi = api as unknown as Record<string, any>;

describe("reviewService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getBookReviews returns reviews", async () => {
    mockApi.get = vi.fn().mockResolvedValue({ data: [{ id: 1, rating: 5 }] });
    const reviews = await reviewService.getBookReviews(1);
    expect(reviews).toEqual([{ id: 1, rating: 5 }]);
  });

  it("getBookReviews returns [] on error", async () => {
    mockApi.get = vi.fn().mockRejectedValue(new Error("fail"));
    const reviews = await reviewService.getBookReviews(1);
    expect(reviews).toEqual([]);
  });

  it("createReview returns created review", async () => {
    mockApi.post = vi.fn().mockResolvedValue({ data: { id: 2, rating: 4 } });
    const review = await reviewService.createReview(1, {
      username: "A",
      rating: 4,
      comment: "Good",
    });
    expect(review).toEqual({ id: 2, rating: 4 });
  });

  it("createReview throws on error", async () => {
    mockApi.post = vi.fn().mockRejectedValue(new Error("fail"));
    await expect(
      reviewService.createReview(1, {
        username: "A",
        rating: 4,
        comment: "Good",
      })
    ).rejects.toThrow();
  });

  it("updateReview returns updated review", async () => {
    mockApi.put = vi.fn().mockResolvedValue({ data: { id: 3, rating: 3 } });
    const review = await reviewService.updateReview(3, { rating: 3 });
    expect(review).toEqual({ id: 3, rating: 3 });
  });

  it("updateReview throws on error", async () => {
    mockApi.put = vi.fn().mockRejectedValue(new Error("fail"));
    await expect(
      reviewService.updateReview(3, { rating: 3 })
    ).rejects.toThrow();
  });

  it("deleteReview returns true on success", async () => {
    mockApi.delete = vi.fn().mockResolvedValue({});
    const res = await reviewService.deleteReview(4);
    expect(res).toBe(true);
  });

  it("deleteReview throws on error", async () => {
    mockApi.delete = vi.fn().mockRejectedValue(new Error("fail"));
    await expect(reviewService.deleteReview(4)).rejects.toThrow();
  });
});
