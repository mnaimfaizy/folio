import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ReviewsList } from "../../../../components/admin/reviews/ReviewsList";

// Mock AdminService
vi.mock("@/services/adminService", () => ({
  __esModule: true,
  default: {
    getAllReviews: vi.fn(),
    deleteReview: vi.fn(),
  },
}));

// Mock useNavigate
const mockNavigate = vi.fn(); // Define mock function at the top level
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate, // Use the top-level mock
  };
});

const mockReviews = [
  {
    id: 1,
    bookId: 10,
    book_title: "Book Title",
    user_name: "User1",
    username: "user1",
    rating: 4,
    comment: "A very interesting book.",
    createdAt: "2024-01-01T10:00:00Z",
  },
  {
    id: 2,
    bookId: 11,
    book_title: "Another Book",
    user_name: "User2",
    username: "user2",
    rating: 5,
    comment: "Excellent!",
    createdAt: "2024-02-01T10:00:00Z",
  },
];

describe("ReviewsList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear(); // Clear the mock before each test
  });

  it("renders loading state", async () => {
    const AdminService = (await import("@/services/adminService")).default;
    AdminService.getAllReviews = vi
      .fn()
      .mockImplementation(() => new Promise(() => {}));
    render(
      <MemoryRouter>
        <ReviewsList />
      </MemoryRouter>
    );
    expect(screen.getByText("Loading reviews...")).toBeInTheDocument();
  });

  it("renders error state", async () => {
    const AdminService = (await import("@/services/adminService")).default;
    AdminService.getAllReviews = vi.fn().mockRejectedValue(new Error("fail"));
    render(
      <MemoryRouter>
        <ReviewsList />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText(/Failed to load reviews/i)).toBeInTheDocument();
    });
  });

  it("renders 'no reviews found' state", async () => {
    const AdminService = (await import("@/services/adminService")).default;
    AdminService.getAllReviews = vi.fn().mockResolvedValue([]);
    render(
      <MemoryRouter>
        <ReviewsList />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText(/No reviews found/i)).toBeInTheDocument();
    });
  });

  it("renders a list of reviews", async () => {
    const AdminService = (await import("@/services/adminService")).default;
    AdminService.getAllReviews = vi.fn().mockResolvedValue(mockReviews);
    render(
      <MemoryRouter>
        <ReviewsList />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText("Book Title")).toBeInTheDocument();
      expect(screen.getByText("Another Book")).toBeInTheDocument();
      expect(screen.getByText("User1")).toBeInTheDocument();
      expect(screen.getByText("User2")).toBeInTheDocument();
    });
  });

  it("calls navigate when book title is clicked", async () => {
    const AdminService = (await import("@/services/adminService")).default;
    AdminService.getAllReviews = vi.fn().mockResolvedValue(mockReviews);
    render(
      <MemoryRouter>
        <ReviewsList />
      </MemoryRouter>
    );
    await waitFor(() => {
      fireEvent.click(screen.getByText("Book Title"));
    });
    expect(mockNavigate).toHaveBeenCalledWith("/admin/books/view/10"); // Assert on the top-level mock
  });
});
