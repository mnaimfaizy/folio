import { ReviewListComponent } from "@/components/books/ReviewListComponent";
import reviewService from "@/services/reviewService";
import { useAuth } from "@/services/useAuth";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock the dependencies
vi.mock("@/services/reviewService");
vi.mock("@/services/useAuth");
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("ReviewListComponent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default auth mock with all required properties
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isAuthenticated: false,
      login: vi.fn().mockResolvedValue({ user: null, token: "" }),
      logout: vi.fn(),
      signup: vi.fn().mockResolvedValue({ message: "Success" }),
    });
  });

  it("renders loading state initially", async () => {
    vi.mocked(reviewService.getBookReviews).mockImplementation(
      () => new Promise(() => {})
    ); // Never resolves to keep loading

    render(<ReviewListComponent bookId={1} />);
    expect(screen.getByText(/loading reviews/i)).toBeInTheDocument();
  });

  it("renders reviews when data is loaded", async () => {
    const mockReviews = [
      {
        id: 1,
        rating: 5,
        comment: "Great book!",
        userId: 1,
        username: "User One",
        bookId: 1,
        createdAt: new Date().toISOString(),
      },
      {
        id: 2,
        rating: 4,
        comment: "Enjoyed it.",
        userId: 2,
        username: "User Two",
        bookId: 1,
        createdAt: new Date().toISOString(),
      },
    ];

    vi.mocked(reviewService.getBookReviews).mockResolvedValue(mockReviews);

    render(<ReviewListComponent bookId={1} />);

    await waitFor(() => {
      expect(screen.getByText("Great book!")).toBeInTheDocument();
    });
    expect(screen.getByText("User One")).toBeInTheDocument();
    expect(screen.getByText("Enjoyed it.")).toBeInTheDocument();
    expect(screen.getByText("User Two")).toBeInTheDocument();
  });

  it("renders message when no reviews are found", async () => {
    vi.mocked(reviewService.getBookReviews).mockResolvedValue([]);

    render(<ReviewListComponent bookId={1} />);

    await waitFor(() => {
      expect(screen.getByText(/no reviews yet/i)).toBeInTheDocument();
    });
  });
});
