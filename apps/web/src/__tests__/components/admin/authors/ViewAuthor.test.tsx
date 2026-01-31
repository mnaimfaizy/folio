import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ViewAuthor } from "../../../../components/admin/authors/ViewAuthor";

// Mock AdminService
vi.mock("@/services/adminService", () => ({
  __esModule: true,
  default: {
    getAuthorById: vi.fn(),
    deleteAuthor: vi.fn(),
  },
}));

// Mock useNavigate and useParams
const mockNavigate = vi.fn(); // Define mock function at the top level
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate, // Use the top-level mock
    useParams: () => ({ id: "1" }),
  };
});

const mockAuthor = {
  id: 1,
  name: "Author One",
  biography: "Bio",
  birth_date: "1980-01-01",
  photo_url: "http://example.com/photo1.jpg",
  createdAt: "2020-01-01T10:00:00Z",
  updatedAt: "2021-01-01T10:00:00Z",
};
const mockBooks = [
  {
    id: 10,
    title: "Book Title",
    isbn: "1234567890",
    publishYear: "2022",
    cover: null,
  },
];

describe("ViewAuthor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear(); // Clear the mock before each test
  });

  it("renders loading state", async () => {
    const AdminService = (await import("@/services/adminService")).default;
    AdminService.getAuthorById = vi
      .fn()
      .mockImplementation(() => new Promise(() => {}));
    render(
      <MemoryRouter>
        <ViewAuthor />
      </MemoryRouter>
    );
    expect(screen.getByText("Loading author data...")).toBeInTheDocument();
  });

  it("renders error state", async () => {
    const AdminService = (await import("@/services/adminService")).default;
    AdminService.getAuthorById = vi.fn().mockRejectedValue({
      response: { data: { message: "API error" } },
    });
    render(
      <MemoryRouter>
        <ViewAuthor />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText(/API error/i)).toBeInTheDocument();
    });
  });

  it("renders author not found", async () => {
    const AdminService = (await import("@/services/adminService")).default;
    AdminService.getAuthorById = vi
      .fn()
      .mockResolvedValue({ author: null, books: [] });
    render(
      <MemoryRouter>
        <ViewAuthor />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText(/Author not found/i)).toBeInTheDocument();
    });
  });

  it("renders author details and books", async () => {
    const AdminService = (await import("@/services/adminService")).default;
    AdminService.getAuthorById = vi.fn().mockResolvedValue({
      author: mockAuthor,
      books: mockBooks,
    });
    render(
      <MemoryRouter>
        <ViewAuthor />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText("Author One")).toBeInTheDocument();
      expect(screen.getByText("Book Title")).toBeInTheDocument();
      expect(screen.getByText("Bio")).toBeInTheDocument();
    });
  });

  it("calls navigate when Edit is clicked", async () => {
    const AdminService = (await import("@/services/adminService")).default;
    AdminService.getAuthorById = vi.fn().mockResolvedValue({
      author: mockAuthor,
      books: [],
    });
    render(
      <MemoryRouter>
        <ViewAuthor />
      </MemoryRouter>
    );
    await waitFor(() => {
      fireEvent.click(screen.getByRole("button", { name: /Edit/i })); // Use getByRole for button
    });
    expect(mockNavigate).toHaveBeenCalledWith("/admin/authors/edit/1"); // Assert on the top-level mock
  });

  it("calls navigate when Back to Authors List is clicked", async () => {
    const AdminService = (await import("@/services/adminService")).default;
    AdminService.getAuthorById = vi.fn().mockResolvedValue({
      author: mockAuthor,
      books: [],
    });
    render(
      <MemoryRouter>
        <ViewAuthor />
      </MemoryRouter>
    );
    await waitFor(() => {
      // Use getByRole for button, adjust name regex if needed
      fireEvent.click(
        screen.getByRole("button", { name: /Back to Authors List/i })
      );
    });
    expect(mockNavigate).toHaveBeenCalledWith("/admin/authors"); // Assert on the top-level mock
  });
});
