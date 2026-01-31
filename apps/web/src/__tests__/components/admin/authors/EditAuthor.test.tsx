import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { EditAuthor } from "../../../../components/admin/authors/EditAuthor";
import { Author } from "../../../../services/authorService";

// Mock dependencies
vi.mock("../../../../services/adminService", () => ({
  __esModule: true,
  default: {
    getAuthorById: vi.fn(),
    updateAuthor: vi.fn(),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock navigate function
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: "1" }),
  };
});

const mockAuthor = {
  author: {
    id: 1,
    name: "Author One",
    biography: "Bio",
    birth_date: "1980-01-01",
    photo_url: "http://example.com/photo1.jpg",
  } as Author,
  books: [],
};

describe("EditAuthor", () => {
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
        <EditAuthor />
      </MemoryRouter>
    );
    expect(screen.getByText("Loading author data...")).toBeInTheDocument();
  });

  it("renders author not found", async () => {
    const AdminService = (await import("@/services/adminService")).default;
    AdminService.getAuthorById = vi.fn().mockResolvedValue(null);
    render(
      <MemoryRouter>
        <EditAuthor />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(
        screen.getByText("Failed to load author data")
      ).toBeInTheDocument();
    });
  });

  it("renders the form with author data", async () => {
    const AdminService = (await import("@/services/adminService")).default;
    AdminService.getAuthorById = vi.fn().mockResolvedValue(mockAuthor);
    render(
      <MemoryRouter>
        <EditAuthor />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByDisplayValue("Author One")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Bio")).toBeInTheDocument();
      expect(screen.getByDisplayValue("1980-01-01")).toBeInTheDocument();
      expect(
        screen.getByDisplayValue("http://example.com/photo1.jpg")
      ).toBeInTheDocument();
    });
  });
});
