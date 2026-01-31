import { PublicBooksComponent } from "@/components/books/PublicBooksComponent";
import BookService from "@/services/bookService";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock the book service
vi.mock("@/services/bookService", () => ({
  default: {
    getAllBooks: vi.fn(),
  },
}));

describe("PublicBooksComponent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state initially", () => {
    // Return a pending promise to keep loading state
    vi.mocked(BookService.getAllBooks).mockImplementation(
      () => new Promise(() => {})
    );

    render(
      <BrowserRouter>
        <PublicBooksComponent />
      </BrowserRouter>
    );
    expect(screen.getByText(/loading books catalog/i)).toBeInTheDocument();
  });

  it("renders books when data is loaded", async () => {
    const mockBooks = [
      {
        id: 1,
        title: "Public Book 1",
        author: "Author 1",
        genre: "Genre 1",
        publishYear: 2021,
        isbn: "978-1234567890",
        description: "Description 1",
        cover: "cover1.jpg",
        status: "available",
      },
      {
        id: 2,
        title: "Public Book 2",
        author: "Author 2",
        genre: "Genre 2",
        publishYear: 2022,
        isbn: "978-0987654321",
        description: "Description 2",
        cover: "cover2.jpg",
        status: "available",
      },
    ];
    vi.mocked(BookService.getAllBooks).mockResolvedValue(mockBooks);

    render(
      <BrowserRouter>
        <PublicBooksComponent />
      </BrowserRouter>
    );

    // Wait for the books to load and verify they're displayed
    expect(await screen.findByText("Public Book 1")).toBeInTheDocument();
    expect(screen.getByText("Public Book 2")).toBeInTheDocument();
  });
});
