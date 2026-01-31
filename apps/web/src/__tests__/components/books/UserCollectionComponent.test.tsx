import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserCollectionComponent } from "../../../components/books/UserCollectionComponent";
import BookService from "../../../services/bookService";

// Mock dependencies
vi.mock("../../../services/bookService", () => ({
  default: {
    getUserCollection: vi.fn(),
    removeFromUserCollection: vi.fn(),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("UserCollectionComponent", () => {
  const mockCollectionBooks = [
    {
      id: 1,
      title: "Collected Book 1",
      isbn: "1234567890",
      author: "Author 1",
      description: "Description for collected book 1",
      coverImage: "https://example.com/cover1.jpg",
    },
    {
      id: 2,
      title: "Collected Book 2",
      isbn: "0987654321",
      author: "Author 2",
      description: "Description for collected book 2",
      coverImage: "https://example.com/cover2.jpg",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementation
    vi.mocked(BookService.getUserCollection).mockResolvedValue(
      mockCollectionBooks
    );
    vi.mocked(BookService.removeFromUserCollection).mockResolvedValue(true);
  });

  it("renders loading state initially", () => {
    render(
      <MemoryRouter>
        <UserCollectionComponent />
      </MemoryRouter>
    );

    expect(screen.getByText("Loading your collection...")).toBeInTheDocument();
  });

  it("renders books in user's collection when data is loaded", async () => {
    render(
      <MemoryRouter>
        <UserCollectionComponent />
      </MemoryRouter>
    );

    // Wait for books to load
    await waitFor(() => {
      expect(screen.getByText("Collected Book 1")).toBeInTheDocument();
    });

    // Check if book details are correctly displayed
    expect(screen.getByText("Author 1")).toBeInTheDocument();
    expect(screen.getByText("Collected Book 2")).toBeInTheDocument();
    expect(screen.getByText("Author 2")).toBeInTheDocument();

    // Check if each book has collection badge and actions
    const badges = screen.getAllByText("In Your Collection");
    expect(badges).toHaveLength(2);

    const viewButtons = screen.getAllByText("View");
    expect(viewButtons).toHaveLength(2);

    const removeButtons = screen.getAllByText("Remove");
    expect(removeButtons).toHaveLength(2);
  });

  it("shows empty state when no books are in collection", async () => {
    vi.mocked(BookService.getUserCollection).mockResolvedValue([]);

    render(
      <MemoryRouter>
        <UserCollectionComponent />
      </MemoryRouter>
    );

    // Wait for the empty state message
    await waitFor(() => {
      expect(screen.getByText("Your collection is empty")).toBeInTheDocument();
    });

    expect(
      screen.getByText(
        "Browse the book catalog and add books to your collection."
      )
    ).toBeInTheDocument();
  });

  it("handles error when fetching collection", async () => {
    vi.mocked(BookService.getUserCollection).mockRejectedValue(
      new Error("Failed to fetch")
    );

    render(
      <MemoryRouter>
        <UserCollectionComponent />
      </MemoryRouter>
    );

    // Wait for loading to finish
    await waitFor(() => {
      expect(
        screen.queryByText("Loading your collection...")
      ).not.toBeInTheDocument();
    });

    // Check if error toast was shown
    expect(toast.error).toHaveBeenCalledWith(
      "Failed to load your book collection."
    );

    // Should show empty state
    expect(screen.getByText("Your collection is empty")).toBeInTheDocument();
  });

  it("allows removing a book from collection", async () => {
    render(
      <MemoryRouter>
        <UserCollectionComponent />
      </MemoryRouter>
    );

    // Wait for books to load
    await waitFor(() => {
      expect(screen.getByText("Collected Book 1")).toBeInTheDocument();
    });

    // Find and click the first "Remove" button
    const removeButtons = screen.getAllByText("Remove");
    fireEvent.click(removeButtons[0]);

    // Verify the service was called
    expect(BookService.removeFromUserCollection).toHaveBeenCalledWith(1);

    // Verify the success toast was shown
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        "Book removed from your collection."
      );
    });

    // The book should be removed from the view (since we're removing it from local state)
    await waitFor(() => {
      expect(screen.queryByText("Collected Book 1")).not.toBeInTheDocument();
      expect(screen.queryByText("Author 1")).not.toBeInTheDocument();
    });

    // But the second book should still be there
    expect(screen.getByText("Collected Book 2")).toBeInTheDocument();
    expect(screen.getByText("Author 2")).toBeInTheDocument();
  });

  it("handles error when removing a book", async () => {
    vi.mocked(BookService.removeFromUserCollection).mockRejectedValue(
      new Error("Failed to remove")
    );

    render(
      <MemoryRouter>
        <UserCollectionComponent />
      </MemoryRouter>
    );

    // Wait for books to load
    await waitFor(() => {
      expect(screen.getByText("Collected Book 1")).toBeInTheDocument();
    });

    // Find and click the first "Remove" button
    const removeButtons = screen.getAllByText("Remove");
    fireEvent.click(removeButtons[0]);

    // Verify the error toast was shown
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Failed to remove book from collection."
      );
    });

    // The book should still be in the view (since removal failed)
    expect(screen.getByText("Collected Book 1")).toBeInTheDocument();
    expect(screen.getByText("Author 1")).toBeInTheDocument();
  });
});
