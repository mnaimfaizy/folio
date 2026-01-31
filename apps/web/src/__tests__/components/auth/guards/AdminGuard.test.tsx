import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminGuard } from "../../../../components/auth/guards/AdminGuard";
import { UserRole } from "../../../../services/authService";
import { useAppSelector } from "../../../../store/hooks";

// Mock dependencies
vi.mock("../../../../store/hooks", () => ({
  useAppSelector: vi.fn(),
}));

// Mock navigate function
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("AdminGuard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render children when user is authenticated and is an admin", () => {
    // Mock authenticated admin state
    vi.mocked(useAppSelector).mockReturnValue({
      isAuthenticated: true,
      user: {
        id: 1,
        name: "Admin User",
        email: "admin@example.com",
        role: UserRole.ADMIN,
      },
    });

    render(
      <MemoryRouter>
        <AdminGuard>
          <div data-testid="admin-content">Admin Content</div>
        </AdminGuard>
      </MemoryRouter>
    );

    // Check that children are rendered
    expect(screen.getByTestId("admin-content")).toBeInTheDocument();
    expect(screen.getByText("Admin Content")).toBeInTheDocument();

    // Verify no navigation occurred
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("should redirect to login when user is not authenticated", () => {
    // Mock unauthenticated state
    vi.mocked(useAppSelector).mockReturnValue({
      isAuthenticated: false,
      user: null,
    });

    render(
      <MemoryRouter>
        <AdminGuard>
          <div data-testid="admin-content">Admin Content</div>
        </AdminGuard>
      </MemoryRouter>
    );

    // Check that children are not rendered
    expect(screen.queryByTestId("admin-content")).not.toBeInTheDocument();
    expect(screen.queryByText("Admin Content")).not.toBeInTheDocument();

    // Verify navigation to login
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  it("should redirect to home when user is authenticated but not an admin", () => {
    // Mock authenticated non-admin state
    vi.mocked(useAppSelector).mockReturnValue({
      isAuthenticated: true,
      user: {
        id: 2,
        name: "Regular User",
        email: "user@example.com",
        role: UserRole.USER,
      },
    });

    render(
      <MemoryRouter>
        <AdminGuard>
          <div data-testid="admin-content">Admin Content</div>
        </AdminGuard>
      </MemoryRouter>
    );

    // Check that children are not rendered
    expect(screen.queryByTestId("admin-content")).not.toBeInTheDocument();
    expect(screen.queryByText("Admin Content")).not.toBeInTheDocument();

    // Verify navigation to home page
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("should render fallback content when provided and user is not an admin", () => {
    // Mock authenticated non-admin state
    vi.mocked(useAppSelector).mockReturnValue({
      isAuthenticated: true,
      user: {
        id: 2,
        name: "Regular User",
        email: "user@example.com",
        role: UserRole.USER,
      },
    });

    render(
      <MemoryRouter>
        <AdminGuard
          fallback={<div data-testid="fallback-content">Access Denied</div>}
        >
          <div data-testid="admin-content">Admin Content</div>
        </AdminGuard>
      </MemoryRouter>
    );

    // Check that fallback is rendered
    expect(screen.getByTestId("fallback-content")).toBeInTheDocument();
    expect(screen.getByText("Access Denied")).toBeInTheDocument();

    // Check that children are not rendered
    expect(screen.queryByTestId("admin-content")).not.toBeInTheDocument();
    expect(screen.queryByText("Admin Content")).not.toBeInTheDocument();

    // Verify navigation to home page
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});
