import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ViewUser } from "../../../../components/admin/users/ViewUser";
import AdminService, { UserDetail } from "../../../../services/adminService";
import { UserRole } from "../../../../services/authService";

// Mock dependencies
vi.mock("../../../../services/adminService");

// Cast the mocked service to the correct type
const mockedAdminService = vi.mocked(AdminService, true);

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

describe("ViewUser", () => {
  const mockUser: UserDetail = {
    id: 1,
    name: "User One",
    email: "user1@example.com",
    role: UserRole.ADMIN,
    email_verified: true,
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-02-01T10:00:00Z",
    books: [
      {
        id: 10,
        title: "Book Title",
        author: "Book Author",
        isbn: "1234567890",
        description: "A test book",
        cover: "book-cover.jpg",
        publishYear: 2022,
        createdAt: "2024-01-01T10:00:00Z",
        updatedAt: "2024-02-01T10:00:00Z",
      },
    ],
  };

  const emptyUser: UserDetail = {
    id: 0,
    name: "",
    email: "",
    role: UserRole.USER,
    email_verified: false,
    createdAt: "",
    updatedAt: "",
    books: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state", async () => {
    mockedAdminService.getUserById.mockImplementation(
      () => new Promise(() => {})
    );
    render(
      <MemoryRouter>
        <ViewUser />
      </MemoryRouter>
    );
    expect(screen.getByText("Loading user data...")).toBeInTheDocument();
  });

  it("renders error state", async () => {
    mockedAdminService.getUserById.mockRejectedValue({
      response: { data: { message: "API error" } },
    });
    render(
      <MemoryRouter>
        <ViewUser />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText(/API error/i)).toBeInTheDocument();
    });
  });

  it("renders user not found when API returns null-like user", async () => {
    mockedAdminService.getUserById.mockResolvedValue(emptyUser);
    render(
      <MemoryRouter>
        <ViewUser />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText(/User not found/i)).toBeInTheDocument();
    });
  });

  it("renders user details and books", async () => {
    mockedAdminService.getUserById.mockResolvedValue(mockUser);
    render(
      <MemoryRouter>
        <ViewUser />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText("User One")).toBeInTheDocument();
      expect(screen.getByText("Book Title")).toBeInTheDocument();
      expect(screen.getByText("user1@example.com")).toBeInTheDocument();
    });
  });

  it("calls navigate when Edit is clicked", async () => {
    mockedAdminService.getUserById.mockResolvedValue(mockUser);
    render(
      <MemoryRouter>
        <ViewUser />
      </MemoryRouter>
    );
    await waitFor(() => {
      fireEvent.click(screen.getByText(/Edit/i));
    });
    expect(mockNavigate).toHaveBeenCalledWith("/admin/users/edit/1");
  });

  it("calls navigate when Password is clicked", async () => {
    mockedAdminService.getUserById.mockResolvedValue(mockUser);
    render(
      <MemoryRouter>
        <ViewUser />
      </MemoryRouter>
    );

    // Wait for user data to load
    await screen.findByText("User One");

    // Click the Password button
    const passwordButton = screen.getByRole("button", { name: /Password/i });
    passwordButton.click();

    // Verify navigation
    expect(mockNavigate).toHaveBeenCalledWith("/admin/users/password/1");
  });

  it("calls navigate when Back to Users List is clicked", async () => {
    mockedAdminService.getUserById.mockResolvedValue(mockUser);
    render(
      <MemoryRouter>
        <ViewUser />
      </MemoryRouter>
    );

    // Wait for user data to load
    await screen.findByText("User One");

    // Click the Back button
    const backButton = screen.getByRole("button", {
      name: /Back to Users List/i,
    });
    backButton.click();

    // Verify navigation
    expect(mockNavigate).toHaveBeenCalledWith("/admin/users");
  });
});
