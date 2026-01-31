import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BookDetailsComponent } from "../../../components/books/BookDetailsComponent";
import bookService from "../../../services/bookService";

// Mock the dependencies
vi.mock("../../../services/bookService", () => ({
  default: {
    getBookById: vi.fn(),
    getAllBooks: vi.fn(),
    isBookInUserCollection: vi.fn(),
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

describe("BookDetailsComponent", () => {
  const mockBook = {
    id: 1,
    title: "Test Book",
    isbn: "123456789",
    description: "This is a test book description",
    publishedDate: "2023-01-01",
    publishYear: 2023,
    cover: "https://example.com/cover.jpg",
    genre: "Fiction, Fantasy",
    authors: [
      { id: 1, name: "Test Author", is_primary: true },
      { id: 2, name: "Secondary Author", is_primary: false },
    ],
    rating: 4.5,
  };

  const mockSimilarBooks = [
    {
      id: 2,
      title: "Similar Book 1",
      cover: "https://example.com/cover1.jpg",
      isbn: "987654321",
    },
    {
      id: 3,
      title: "Similar Book 2",
      cover: "https://example.com/cover2.jpg",
      isbn: "1234567890",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementations
    vi.mocked(bookService.getBookById).mockResolvedValue(mockBook);
    vi.mocked(bookService.getAllBooks).mockResolvedValue([
      mockBook,
      ...mockSimilarBooks,
    ]);
    vi.mocked(bookService.isBookInUserCollection).mockResolvedValue(false);
  });

  it("renders loading state initially", () => {
    render(
      <MemoryRouter initialEntries={["/books/1"]}>
        <Routes>
          <Route path="/books/:bookId" element={<BookDetailsComponent />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Loading book details...")).toBeInTheDocument();
  });

  it("renders book details when data is loaded", async () => {
    render(
      <MemoryRouter initialEntries={["/books/1"]}>
        <Routes>
          <Route path="/books/:bookId" element={<BookDetailsComponent />} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for the book to load
    await waitFor(() => {
      expect(screen.getByText("Test Book")).toBeInTheDocument();
    });

    // Check if main book details are rendered
    expect(screen.getByText("Test Author")).toBeInTheDocument();
    expect(screen.getByText("Secondary Author")).toBeInTheDocument();
    expect(screen.getByText("Primary Author")).toBeInTheDocument();

    // Check if tabs are rendered
    expect(
      screen.getByRole("tab", { name: "Description" })
    ).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Details" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Reviews/i })).toBeInTheDocument();
  });

  it("shows error state when book loading fails", async () => {
    vi.mocked(bookService.getBookById).mockRejectedValue(
      new Error("Failed to fetch")
    );

    render(
      <MemoryRouter initialEntries={["/books/1"]}>
        <Routes>
          <Route path="/books/:bookId" element={<BookDetailsComponent />} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for the error state
    await waitFor(() => {
      expect(screen.getByText("Book Not Found")).toBeInTheDocument();
    });

    expect(
      screen.getByText(/Failed to load book details/i)
    ).toBeInTheDocument();
  });

  it("allows adding book to collection", async () => {
    render(
      <MemoryRouter initialEntries={["/books/1"]}>
        <Routes>
          <Route path="/books/:bookId" element={<BookDetailsComponent />} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for the book to load
    await waitFor(() => {
      expect(screen.getByText("Test Book")).toBeInTheDocument();
    });

    // Find and click the "Add to My Collection" button
    const addButton = screen.getByText("Add to My Collection");
    fireEvent.click(addButton);

    // Verify the service was called
    await waitFor(() => {
      expect(bookService.addToUserCollection).toHaveBeenCalledWith(1);
    });

    // Verify the success toast was shown
    expect(toast.success).toHaveBeenCalledWith("Book added to your collection");
  });

  it("allows removing book from collection", async () => {
    // Set up the book to be in collection initially
    vi.mocked(bookService.isBookInUserCollection).mockResolvedValue(true);

    render(
      <MemoryRouter initialEntries={["/books/1"]}>
        <Routes>
          <Route path="/books/:bookId" element={<BookDetailsComponent />} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for the book to load
    await waitFor(() => {
      expect(screen.getByText("Test Book")).toBeInTheDocument();
    });

    // Wait for collection status to be checked
    await waitFor(() => {
      expect(screen.getByText("In My Collection")).toBeInTheDocument();
    });

    // Find and click the "In My Collection" button to remove
    const removeButton = screen.getByText("In My Collection");
    fireEvent.click(removeButton);

    // Verify the service was called
    await waitFor(() => {
      expect(bookService.removeFromUserCollection).toHaveBeenCalledWith(1);
    });

    // Verify the success toast was shown
    expect(toast.success).toHaveBeenCalledWith(
      "Book removed from your collection"
    );
  });

  it("renders similar books section when available", async () => {
    // Mock the service to return a resolved promise with the expected books
    vi.mocked(bookService.getAllBooks).mockResolvedValue([
      mockBook,
      ...mockSimilarBooks,
    ]);

    render(
      <MemoryRouter initialEntries={["/books/1"]}>
        <Routes>
          <Route path="/books/:bookId" element={<BookDetailsComponent />} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for the book to load first
    await waitFor(() => {
      expect(screen.getByText("Test Book")).toBeInTheDocument();
    });

    // Verify that the service was called
    expect(bookService.getAllBooks).toHaveBeenCalled();

    // Check that the service call returns the expected data
    await waitFor(() => {
      // We need to await the promise resolution
      const result = vi.mocked(bookService.getAllBooks).mock.results[0].value;
      return expect(result).resolves.toEqual(
        expect.arrayContaining([
          expect.objectContaining({ title: "Similar Book 1" }),
          expect.objectContaining({ title: "Similar Book 2" }),
        ])
      );
    });
  });
});
