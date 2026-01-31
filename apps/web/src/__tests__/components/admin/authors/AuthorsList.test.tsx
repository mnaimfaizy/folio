import { Author } from "@/services/adminService";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthorsList } from "../../../../components/admin/authors/AuthorsList";

// Mock AdminService
vi.mock("@/services/adminService", () => ({
  __esModule: true,
  default: {
    getAllAuthors: vi.fn(),
    deleteAuthor: vi.fn(),
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

const mockAuthors = [
  {
    id: 1,
    name: "Author One",
    photo_url: "http://example.com/photo1.jpg",
    book_count: 3,
    birth_date: "1980-01-01",
    createdAt: "2020-01-01",
  },
  {
    id: 2,
    name: "Author Two",
    photo_url: null,
    book_count: 0,
    birth_date: null,
    createdAt: "2021-01-01",
  },
];

describe("AuthorsList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear(); // Clear the mock before each test
  });

  it("renders loading state", async () => {
    const AdminService = (await import("@/services/adminService")).default;
    AdminService.getAllAuthors = vi.fn(
      () => new Promise<Author[]>(() => mockAuthors)
    );
    render(
      <MemoryRouter>
        <AuthorsList />
      </MemoryRouter>
    );
    expect(screen.getByText("Loading authors...")).toBeInTheDocument();
  });

  it("renders error state", async () => {
    const AdminService = (await import("@/services/adminService")).default;
    AdminService.getAllAuthors = vi.fn().mockRejectedValue(new Error("fail"));
    render(
      <MemoryRouter>
        <AuthorsList />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText(/Failed to load authors/i)).toBeInTheDocument();
    });
  });

  it("renders 'no authors found' state", async () => {
    const AdminService = (await import("@/services/adminService")).default;
    AdminService.getAllAuthors = vi.fn().mockResolvedValue([]);
    render(
      <MemoryRouter>
        <AuthorsList />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText(/No authors found/i)).toBeInTheDocument();
    });
  });

  it("renders a list of authors", async () => {
    const AdminService = (await import("@/services/adminService")).default;
    AdminService.getAllAuthors = vi.fn().mockResolvedValue(mockAuthors);
    render(
      <MemoryRouter>
        <AuthorsList />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText("Author One")).toBeInTheDocument();
      expect(screen.getByText("Author Two")).toBeInTheDocument();
      expect(screen.getAllByRole("row").length).toBeGreaterThan(1); // header + authors
    });
  });

  it("calls navigate when 'Add Author' is clicked", async () => {
    const AdminService = (await import("@/services/adminService")).default;
    AdminService.getAllAuthors = vi.fn().mockResolvedValue([]);
    render(
      <MemoryRouter>
        <AuthorsList />
      </MemoryRouter>
    );
    await waitFor(() => {
      fireEvent.click(screen.getByRole("button", { name: /Add Author/i }));
      expect(mockNavigate).toHaveBeenCalledWith("/admin/authors/create"); // Assert on the top-level mock
    });
  });
});
