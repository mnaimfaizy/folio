import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ViewBook } from "../../../../components/admin/books/ViewBook";

// Mock AdminService
vi.mock("@/services/adminService", () => ({
  __esModule: true,
  default: {
    getBookById: vi.fn(),
    deleteBook: vi.fn(),
  },
}));

// Mock useNavigate and useParams
const mockNavigate = vi.fn(); // Define mock function at the top level
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate, // Use the top-level mock
    useParams: () => ({ bookId: "1" }),
  };
});

const mockBook = {
  id: 1,
  title: "Book One",
  cover: null,
  authors: [{ name: "Author A" }],
  isbn: "1234567890",
  publishYear: "2022",
  description: "A book description.",
  createdAt: "2020-01-01T10:00:00Z",
  updatedAt: "2021-01-01T10:00:00Z",
};

describe("ViewBook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear(); // Clear the mock before each test
  });

  it("renders loading state", async () => {
    const AdminService = (await import("@/services/adminService")).default;
    AdminService.getBookById = vi
      .fn()
      .mockImplementation(() => new Promise(() => {}));
    render(
      <MemoryRouter>
        <ViewBook />
      </MemoryRouter>
    );
    expect(screen.getByText("Loading book data...")).toBeInTheDocument();
  });

  it("renders error state", async () => {
    const AdminService = (await import("@/services/adminService")).default;
    AdminService.getBookById = vi.fn().mockRejectedValue({
      response: { data: { message: "API error" } },
    });
    render(
      <MemoryRouter>
        <ViewBook />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText(/API error/i)).toBeInTheDocument();
    });
  });

  it("renders book not found", async () => {
    const AdminService = (await import("@/services/adminService")).default;
    AdminService.getBookById = vi.fn().mockResolvedValue(null);
    render(
      <MemoryRouter>
        <ViewBook />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText(/Book not found/i)).toBeInTheDocument();
    });
  });

  it("renders book details", async () => {
    const AdminService = (await import("@/services/adminService")).default;
    AdminService.getBookById = vi.fn().mockResolvedValue(mockBook);
    render(
      <MemoryRouter>
        <ViewBook />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText("Book One")).toBeInTheDocument();
      expect(screen.getByText("A book description.")).toBeInTheDocument();
      expect(screen.getByText("Author A")).toBeInTheDocument();
    });
  });

  it("calls navigate when Edit is clicked", async () => {
    const AdminService = (await import("@/services/adminService")).default;
    AdminService.getBookById = vi.fn().mockResolvedValue(mockBook);
    render(
      <MemoryRouter>
        <ViewBook />
      </MemoryRouter>
    );
    await waitFor(() => {
      // Use getByRole for button
      fireEvent.click(screen.getByRole("button", { name: /Edit/i }));
    });
    expect(mockNavigate).toHaveBeenCalledWith("/admin/books/edit/1"); // Assert on the top-level mock
  });

  it("calls navigate when Back to Books List is clicked", async () => {
    const AdminService = (await import("@/services/adminService")).default;
    AdminService.getBookById = vi.fn().mockResolvedValue(mockBook);
    render(
      <MemoryRouter>
        <ViewBook />
      </MemoryRouter>
    );
    await waitFor(() => {
      // Use getByRole for button
      fireEvent.click(
        screen.getByRole("button", { name: /Back to Books List/i })
      );
    });
    expect(mockNavigate).toHaveBeenCalledWith("/admin/books"); // Assert on the top-level mock
  });
});
