import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BooksList } from "../../../../components/admin/books/BooksList";

// Mock AdminService
vi.mock("@/services/adminService", () => ({
  __esModule: true,
  default: {
    getAllBooks: vi.fn(),
    deleteBook: vi.fn(),
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

const mockBooks = [
  {
    id: 1,
    title: "Book One",
    cover: null,
    authors: [{ name: "Author A" }],
    isbn: "1234567890",
    publishYear: "2022",
  },
  {
    id: 2,
    title: "Book Two",
    cover: "http://example.com/cover2.jpg",
    authors: [{ name: "Author B" }],
    isbn: "0987654321",
    publishYear: "2021",
  },
];

describe("BooksList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear(); // Clear the mock before each test
  });

  it("renders loading state", async () => {
    const AdminService = (await import("@/services/adminService")).default;
    AdminService.getAllBooks = vi
      .fn()
      .mockImplementation(() => new Promise(() => {}));
    render(
      <MemoryRouter>
        <BooksList />
      </MemoryRouter>
    );
    expect(screen.getByText("Loading books...")).toBeInTheDocument();
  });

  it("renders error state", async () => {
    const AdminService = (await import("@/services/adminService")).default;
    AdminService.getAllBooks = vi.fn().mockRejectedValue(new Error("fail"));
    render(
      <MemoryRouter>
        <BooksList />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText(/Failed to load books/i)).toBeInTheDocument();
    });
  });

  it("renders 'no books found' state", async () => {
    const AdminService = (await import("@/services/adminService")).default;
    AdminService.getAllBooks = vi.fn().mockResolvedValue([]);
    render(
      <MemoryRouter>
        <BooksList />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText(/No books found/i)).toBeInTheDocument();
    });
  });

  it("renders a list of books", async () => {
    const AdminService = (await import("@/services/adminService")).default;
    AdminService.getAllBooks = vi.fn().mockResolvedValue(mockBooks);
    render(
      <MemoryRouter>
        <BooksList />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText("Book One")).toBeInTheDocument();
      expect(screen.getByText("Book Two")).toBeInTheDocument();
      expect(screen.getAllByRole("row").length).toBeGreaterThan(1); // header + books
    });
  });

  it("calls navigate when 'Add Book' is clicked", async () => {
    const AdminService = (await import("@/services/adminService")).default;
    AdminService.getAllBooks = vi.fn().mockResolvedValue([]);
    render(
      <MemoryRouter>
        <BooksList />
      </MemoryRouter>
    );
    await waitFor(() => {
      fireEvent.click(screen.getByRole("button", { name: /Add Book/i }));
      expect(mockNavigate).toHaveBeenCalledWith("/admin/books/create"); // Assert on the top-level mock
    });
  });
});
