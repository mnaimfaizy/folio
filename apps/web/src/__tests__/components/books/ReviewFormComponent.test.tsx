import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ReviewFormComponent } from "../../../components/books/ReviewFormComponent";
import reviewService from "../../../services/reviewService";
import { useAuth } from "../../../services/useAuth";

// Mock dependencies
vi.mock("../../../services/reviewService", () => ({
  default: {
    createReview: vi.fn(),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("../../../services/useAuth", () => ({
  useAuth: vi.fn(),
}));

// Mock StarRating component
vi.mock("../../../components/ui/star-rating", () => ({
  StarRating: ({
    rating,
    onRatingChange,
  }: {
    rating: number;
    onRatingChange: (rating: number) => void;
  }) => (
    <div data-testid="star-rating">
      <span>Current rating: {rating}</span>
      <button
        type="button"
        data-testid="rate-1-star"
        onClick={() => onRatingChange(1)}
      >
        Rate 1
      </button>
      <button
        type="button"
        data-testid="rate-5-stars"
        onClick={() => onRatingChange(5)}
      >
        Rate 5
      </button>
    </div>
  ),
}));

describe("ReviewFormComponent", () => {
  const mockOnReviewSubmitted = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementation for useAuth
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isAuthenticated: false,
      login: vi.fn(),
      logout: vi.fn(),
      signup: vi.fn(),
    });

    // Default mock implementation for createReview
    vi.mocked(reviewService.createReview).mockResolvedValue({
      id: 1,
      bookId: 1,
      username: "Test User",
      rating: 5,
      comment: "Great book",
    });
  });

  it("renders the review form correctly", () => {
    render(
      <ReviewFormComponent
        bookId={1}
        onReviewSubmitted={mockOnReviewSubmitted}
      />
    );

    // Use getByText instead of getByRole for the title
    expect(screen.getByText(/write a review/i)).toBeInTheDocument();
    expect(screen.getByTestId("star-rating")).toBeInTheDocument();
    expect(screen.getByLabelText(/your name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/your review/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /submit review/i })
    ).toBeInTheDocument();
  });

  it("pre-fills username when user is logged in", () => {
    // Mock authenticated user
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: 1,
        name: "Test User",
        email: "test@example.com",
        role: "USER",
      },
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
      signup: vi.fn(),
    });

    render(
      <ReviewFormComponent
        bookId={1}
        onReviewSubmitted={mockOnReviewSubmitted}
      />
    );

    // Check if username is pre-filled and disabled
    const usernameInput = screen.getByLabelText(/your name/i);
    expect(usernameInput).toHaveValue("Test User");
    expect(usernameInput).toBeDisabled();
  });

  it("disables submit button initially", () => {
    render(
      <ReviewFormComponent
        bookId={1}
        onReviewSubmitted={mockOnReviewSubmitted}
      />
    );

    // Submit button should be disabled by default (no rating, no comment)
    expect(
      screen.getByRole("button", { name: /submit review/i })
    ).toBeDisabled();
  });

  it("shows validation errors for missing fields", async () => {
    render(
      <ReviewFormComponent
        bookId={1}
        onReviewSubmitted={mockOnReviewSubmitted}
      />
    );

    // Fill only username field
    fireEvent.change(screen.getByLabelText(/your name/i), {
      target: { value: "Test User" },
    });

    // Submit button should still be disabled (missing rating and comment)
    expect(
      screen.getByRole("button", { name: /submit review/i })
    ).toBeDisabled();

    // Try to submit form by clicking the button anyway
    fireEvent.click(screen.getByRole("button", { name: /submit review/i }));

    // Check service was not called
    expect(reviewService.createReview).not.toHaveBeenCalled();
  });

  it("enables submit button when all fields are filled", async () => {
    render(
      <ReviewFormComponent
        bookId={1}
        onReviewSubmitted={mockOnReviewSubmitted}
      />
    );

    // Fill all required fields
    // Set rating to 5 stars
    fireEvent.click(screen.getByTestId("rate-5-stars"));

    // Fill username
    fireEvent.change(screen.getByLabelText(/your name/i), {
      target: { value: "Test User" },
    });

    // Fill comment
    fireEvent.change(screen.getByLabelText(/your review/i), {
      target: { value: "This is a great book!" },
    });

    // Submit button should now be enabled
    expect(
      screen.getByRole("button", { name: /submit review/i })
    ).toBeEnabled();
  });

  it("submits review successfully", async () => {
    render(
      <ReviewFormComponent
        bookId={1}
        onReviewSubmitted={mockOnReviewSubmitted}
      />
    );

    // Fill all required fields
    // Set rating to 5 stars
    fireEvent.click(screen.getByTestId("rate-5-stars"));

    // Fill username
    fireEvent.change(screen.getByLabelText(/your name/i), {
      target: { value: "Test User" },
    });

    // Fill comment
    fireEvent.change(screen.getByLabelText(/your review/i), {
      target: { value: "This is a great book!" },
    });

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /submit review/i }));

    // Check if service was called with correct parameters
    await waitFor(() => {
      expect(reviewService.createReview).toHaveBeenCalledWith(1, {
        username: "Test User",
        rating: 5,
        comment: "This is a great book!",
      });
    });

    // Check if success toast was shown
    expect(toast.success).toHaveBeenCalledWith(
      "Your review has been submitted!"
    );

    // Check if callback was called
    expect(mockOnReviewSubmitted).toHaveBeenCalled();

    // Check if form was reset (comment and rating)
    expect(screen.getByLabelText(/your review/i)).toHaveValue("");
    expect(screen.getByText("Current rating: 0")).toBeInTheDocument();

    // But username should remain
    expect(screen.getByLabelText(/your name/i)).toHaveValue("Test User");
  });

  it("handles errors during submission", async () => {
    // Mock a failure
    vi.mocked(reviewService.createReview).mockRejectedValue(
      new Error("Submission failed")
    );

    render(
      <ReviewFormComponent
        bookId={1}
        onReviewSubmitted={mockOnReviewSubmitted}
      />
    );

    // Fill all required fields
    fireEvent.click(screen.getByTestId("rate-5-stars"));
    fireEvent.change(screen.getByLabelText(/your name/i), {
      target: { value: "Test User" },
    });
    fireEvent.change(screen.getByLabelText(/your review/i), {
      target: { value: "Good book!" },
    });

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /submit review/i }));

    // Wait for the error handling
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Failed to submit review. Please try again."
      );
    });

    // Check that the form was not reset
    expect(screen.getByLabelText(/your review/i)).toHaveValue("Good book!");
    expect(screen.getByText("Current rating: 5")).toBeInTheDocument();

    // Callback should not be called when there's an error
    expect(mockOnReviewSubmitted).not.toHaveBeenCalled();
  });

  it("shows validation error for missing rating", async () => {
    // Mock the form submission event
    const mockPreventDefault = vi.fn();

    // Mock the toast.error function
    vi.mocked(toast.error).mockImplementation(vi.fn());

    render(
      <ReviewFormComponent
        bookId={1}
        onReviewSubmitted={mockOnReviewSubmitted}
      />
    );

    // Fill in the username and comment but not rating
    const usernameInput = screen.getByLabelText(/your name/i);
    const commentInput = screen.getByLabelText(/your review/i);
    fireEvent.change(usernameInput, { target: { value: "Test User" } });
    fireEvent.change(commentInput, { target: { value: "Good book!" } });

    // Create a custom event and submit the form manually
    const form = screen.getByRole("form", { name: /review form/i });
    fireEvent.submit(form, { preventDefault: mockPreventDefault });

    // Check for validation error toast
    expect(toast.error).toHaveBeenCalledWith("Please select a rating");
  });
});
