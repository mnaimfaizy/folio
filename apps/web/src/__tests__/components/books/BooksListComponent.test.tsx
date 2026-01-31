import { BooksListComponent } from "@/components/books/BooksListComponent";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock the Book Service as a default export
vi.mock("@/services/bookService", () => ({
  default: {
    getAllBooks: vi.fn(),
    getUserCollection: vi.fn(),
    addToUserCollection: vi.fn(),
    removeFromUserCollection: vi.fn(),
  },
}));

// Mock toast notifications
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Import the mocked service
import BookService, { Book } from "@/services/bookService";

describe("BooksListComponent", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("renders loading state initially", () => {
    // Set up an unresolved promise to keep the loading state active
    const loadingPromise = new Promise(() => {});
    vi.mocked(BookService.getAllBooks).mockReturnValue(
      loadingPromise as Promise<Book[]>
    );

    render(
      <BrowserRouter>
        <BooksListComponent />
      </BrowserRouter>
    );

    expect(screen.getByText(/loading books/i)).toBeInTheDocument();
  });

  it("renders books when data is loaded", async () => {
    const mockBooks = [
      {
        id: 1,
        title: "Book 1",
        isbn: "1234567890",
        author: "Author 1",
        genre: "Genre 1",
        publishYear: 2021,
      },
      {
        id: 2,
        title: "Book 2",
        isbn: "0987654321",
        author: "Author 2",
        genre: "Genre 2",
        publishYear: 2022,
      },
    ];

    // Mock the service methods with resolved values
    vi.mocked(BookService.getAllBooks).mockResolvedValue(mockBooks);
    vi.mocked(BookService.getUserCollection).mockResolvedValue([]);

    render(
      <BrowserRouter>
        <BooksListComponent />
      </BrowserRouter>
    );

    // Wait for the books to appear
    await waitFor(() => {
      expect(screen.getByText("Book 1")).toBeInTheDocument();
    });

    expect(screen.getByText("Book 2")).toBeInTheDocument();
    // Verify other elements are displayed correctly
    expect(screen.getByText("Author 1")).toBeInTheDocument();
    expect(screen.getByText("Author 2")).toBeInTheDocument();
  });

  it("handles empty book list", async () => {
    // Mock with empty array to test the "No books found" state
    vi.mocked(BookService.getAllBooks).mockResolvedValue([]);

    render(
      <BrowserRouter>
        <BooksListComponent />
      </BrowserRouter>
    );

    // Wait for the no books message to appear
    await waitFor(() => {
      expect(screen.getByText("No books found")).toBeInTheDocument();
    });

    expect(
      screen.getByText("Add some books to the catalog to get started.")
    ).toBeInTheDocument();
    expect(screen.getByText("Add Your First Book")).toBeInTheDocument();
  });
});
