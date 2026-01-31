import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GuestGuard } from "../../../../components/auth/guards/GuestGuard";
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

describe("GuestGuard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render children when user is not authenticated", () => {
    // Mock unauthenticated state
    vi.mocked(useAppSelector).mockReturnValue({
      isAuthenticated: false,
    });

    render(
      <MemoryRouter>
        <GuestGuard>
          <div data-testid="guest-content">Guest Content</div>
        </GuestGuard>
      </MemoryRouter>
    );

    // Check that children are rendered
    expect(screen.getByTestId("guest-content")).toBeInTheDocument();
    expect(screen.getByText("Guest Content")).toBeInTheDocument();

    // Verify no navigation occurred
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("should redirect to books page when user is authenticated", () => {
    // Mock authenticated state
    vi.mocked(useAppSelector).mockReturnValue({
      isAuthenticated: true,
    });

    render(
      <MemoryRouter>
        <GuestGuard>
          <div data-testid="guest-content">Guest Content</div>
        </GuestGuard>
      </MemoryRouter>
    );

    // Check that children are still rendered (GuestGuard doesn't prevent rendering)
    expect(screen.getByTestId("guest-content")).toBeInTheDocument();
    expect(screen.getByText("Guest Content")).toBeInTheDocument();

    // Verify navigation to books page
    expect(mockNavigate).toHaveBeenCalledWith("/books");
  });
});
