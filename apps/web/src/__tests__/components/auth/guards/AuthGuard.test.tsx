import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthGuard } from "../../../../components/auth/guards/AuthGuard";
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

describe("AuthGuard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render children when user is authenticated", () => {
    // Mock authenticated state
    vi.mocked(useAppSelector).mockReturnValue({
      isAuthenticated: true,
    });

    render(
      <MemoryRouter>
        <AuthGuard>
          <div data-testid="protected-content">Protected Content</div>
        </AuthGuard>
      </MemoryRouter>
    );

    // Check that children are rendered
    expect(screen.getByTestId("protected-content")).toBeInTheDocument();
    expect(screen.getByText("Protected Content")).toBeInTheDocument();

    // Verify no navigation occurred
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("should redirect to login when user is not authenticated", () => {
    // Mock unauthenticated state
    vi.mocked(useAppSelector).mockReturnValue({
      isAuthenticated: false,
    });

    render(
      <MemoryRouter>
        <AuthGuard>
          <div data-testid="protected-content">Protected Content</div>
        </AuthGuard>
      </MemoryRouter>
    );

    // Check that children are not rendered
    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();

    // Verify navigation to login
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  it("should render fallback content when provided and user is not authenticated", () => {
    // Mock unauthenticated state
    vi.mocked(useAppSelector).mockReturnValue({
      isAuthenticated: false,
    });

    render(
      <MemoryRouter>
        <AuthGuard
          fallback={<div data-testid="fallback-content">Loading...</div>}
        >
          <div data-testid="protected-content">Protected Content</div>
        </AuthGuard>
      </MemoryRouter>
    );

    // Check that fallback is rendered
    expect(screen.getByTestId("fallback-content")).toBeInTheDocument();
    expect(screen.getByText("Loading...")).toBeInTheDocument();

    // Check that children are not rendered
    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();

    // Verify navigation to login
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });
});
