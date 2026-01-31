import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BooksCatalogComponent } from "../../../components/books/BooksCatalogComponent";
import BookService from "../../../services/bookService";

// Mock dependencies
vi.mock("../../../services/bookService", () => ({
  default: {
    getAllBooks: vi.fn(),
    getUserCollection: vi.fn(),
    addToUserCollection: vi.fn(),
    removeFromUserCollection: vi.fn(),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("BooksCatalogComponent", () => {
  const mockBooks = [
    {
      id: 1,
      title: "Public Book 1",
      author: "Test Author 1",
      description: "Description for book 1",
      coverImage: "https://example.com/cover1.jpg",
      genre: "Fiction",
      publishYear: 2023,
      isbn: "978-0123456789",
    },
    {
      id: 2,
      title: "Public Book 2",
      author: "Test Author 2",
      description: "Description for book 2",
      coverImage: "https://example.com/cover2.jpg",
      genre: "Non-Fiction",
      publishYear: 2022,
      isbn: "978-0123456790",
    },
    {
      id: 3,
      title: "Public Book 3",
      author: "Test Author 3",
      description: "Description for book 3",
      coverImage: "https://example.com/cover3.jpg",
      genre: "Mystery",
      publishYear: 2021,
      isbn: "978-0123456791",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementations
    vi.mocked(BookService.getAllBooks).mockResolvedValue(mockBooks);
    vi.mocked(BookService.getUserCollection).mockResolvedValue([]);
  });

  it("renders loading state initially", () => {
    render(
      <MemoryRouter>
        <BooksCatalogComponent />
      </MemoryRouter>
    );

    expect(screen.getByText("Loading books catalog...")).toBeInTheDocument();
  });

  it("renders books when data is loaded", async () => {
    render(
      <MemoryRouter>
        <BooksCatalogComponent />
      </MemoryRouter>
    );

    // Wait for books to load
    await waitFor(() => {
      expect(screen.getByText("Public Book 1")).toBeInTheDocument();
    });

    // Check if book titles are correctly displayed
    expect(screen.getByText("Public Book 2")).toBeInTheDocument();
    expect(screen.getByText("Public Book 3")).toBeInTheDocument();

    // Look for author text in a more flexible way, as it might be rendered as part of a description
    // or with additional formatting
    const page = screen.getByText(/Test Author 1/);
    expect(page).toBeInTheDocument();

    // Check for other author texts
    expect(screen.getByText(/Test Author 2/)).toBeInTheDocument();
    expect(screen.getByText(/Test Author 3/)).toBeInTheDocument();

    // Check genre badges
    expect(screen.getByText("Fiction")).toBeInTheDocument();
    expect(screen.getByText("Non-Fiction")).toBeInTheDocument();
    expect(screen.getByText("Mystery")).toBeInTheDocument();
  });

  it("shows empty state when no books are available", async () => {
    vi.mocked(BookService.getAllBooks).mockResolvedValue([]);

    render(
      <MemoryRouter>
        <BooksCatalogComponent />
      </MemoryRouter>
    );

    // Wait for the empty state message
    await waitFor(() => {
      expect(screen.getByText("No books found")).toBeInTheDocument();
    });

    expect(
      screen.getByText("Add some books to the catalog to get started.")
    ).toBeInTheDocument();
    expect(screen.getByText("Add Your First Book")).toBeInTheDocument();
  });

  it("handles error when fetching books", async () => {
    vi.mocked(BookService.getAllBooks).mockRejectedValue(
      new Error("Failed to fetch")
    );

    render(
      <MemoryRouter>
        <BooksCatalogComponent />
      </MemoryRouter>
    );

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText("Loading books...")).not.toBeInTheDocument();
    });

    // Check if error toast was shown
    expect(toast.error).toHaveBeenCalledWith("Failed to load books catalog.");

    // Should show empty state
    expect(screen.getByText("No books found")).toBeInTheDocument();
  });

  it("shows 'In Your Collection' badge for books in user collection", async () => {
    vi.mocked(BookService.getUserCollection).mockResolvedValue([mockBooks[0]]);

    render(
      <MemoryRouter>
        <BooksCatalogComponent />
      </MemoryRouter>
    );

    // Wait for books to load
    await waitFor(() => {
      expect(screen.getByText("Public Book 1")).toBeInTheDocument();
    });

    // Check if the badge is displayed for the first book
    expect(screen.getByText("In Your Collection")).toBeInTheDocument();
  });

  it("allows adding a book to collection", async () => {
    render(
      <MemoryRouter>
        <BooksCatalogComponent />
      </MemoryRouter>
    );

    // Wait for books to load
    await waitFor(() => {
      expect(screen.getByText("Public Book 1")).toBeInTheDocument();
    });

    // Find all "Collect" buttons (there should be 3 initially)
    const collectButtons = screen.getAllByText("Collect");

    // Click the first "Collect" button (for Public Book 1)
    fireEvent.click(collectButtons[0]);

    // Verify the service was called
    expect(BookService.addToUserCollection).toHaveBeenCalledWith(1);

    // Verify the success toast was shown
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        "Book added to your collection."
      );
    });
  });

  it("allows removing a book from collection", async () => {
    // Set first book as in collection
    vi.mocked(BookService.getUserCollection).mockResolvedValue([mockBooks[0]]);

    render(
      <MemoryRouter>
        <BooksCatalogComponent />
      </MemoryRouter>
    );

    // Wait for books to load and collection status to be set
    await waitFor(() => {
      expect(screen.getByText("In Your Collection")).toBeInTheDocument();
    });

    // Find the "Remove" button for the first book
    const removeButton = screen.getByText("Remove");
    fireEvent.click(removeButton);

    // Verify the service was called
    expect(BookService.removeFromUserCollection).toHaveBeenCalledWith(1);

    // Verify the success toast was shown
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        "Book removed from your collection."
      );
    });
  });
});
