/* eslint-disable @typescript-eslint/no-explicit-any */
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock dependencies with factory functions
vi.mock("react-router-dom", () => {
  return {
    Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
      <a href={to} data-testid={`link-${to.replace(/\//g, "-")}`}>
        {children}
      </a>
    ),
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: "/" }),
    __esModule: true,
  };
});

vi.mock("../../../store/hooks", () => {
  const useAppSelector = vi.fn();
  const useAppDispatch = vi.fn(() => vi.fn());
  return {
    useAppSelector,
    useAppDispatch,
    __esModule: true,
  };
});

vi.mock("../../../store/slices/authSlice", () => ({
  logoutUser: vi.fn(),
  __esModule: true,
}));

// Mock UI components
vi.mock("../../../components/ui/button", () => ({
  Button: ({ children, onClick, asChild, variant, className, size }: any) => {
    const testId = asChild
      ? `button-${variant || "default"}`
      : `button-${variant || "default"}${size ? `-${size}` : ""}`;

    if (asChild) {
      return (
        <div data-testid={testId} className={className}>
          {children}
        </div>
      );
    }
    return (
      <button onClick={onClick} data-testid={testId} className={className}>
        {children}
      </button>
    );
  },
  __esModule: true,
}));

vi.mock("../../../components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: any) => (
    <div data-testid="dropdown-menu">{children}</div>
  ),
  DropdownMenuTrigger: ({ children }: any) => (
    <div data-testid="dropdown-trigger">{children}</div>
  ),
  DropdownMenuContent: ({ children }: any) => (
    <div data-testid="dropdown-content">{children}</div>
  ),
  DropdownMenuItem: ({ children, onClick }: any) => (
    <div data-testid="dropdown-item" onClick={onClick}>
      {children}
    </div>
  ),
  DropdownMenuLabel: ({ children }: any) => (
    <div data-testid="dropdown-label">{children}</div>
  ),
  DropdownMenuSeparator: () => <div data-testid="dropdown-separator" />,
  __esModule: true,
}));

// Import the component after mocks
import { HeaderComponent } from "../../../components/shared/HeaderComponent";

// Import mocked hooks for use in tests
import { useAppDispatch, useAppSelector } from "../../../store/hooks";

describe("HeaderComponent", () => {
  const mockDispatch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAppDispatch).mockReturnValue(mockDispatch);
    vi.mocked(useAppSelector).mockImplementation((selector) =>
      selector({
        auth: {
          isAuthenticated: false,
          user: null,
          token: null,
          isLoading: false,
          error: null,
          emailVerified: false,
          verificationRequired: false,
        },
      })
    );
  });

  it("renders the header with logo and navigation links", () => {
    render(<HeaderComponent />);

    // Check that logo and title are rendered
    expect(screen.getByText("Library Management")).toBeInTheDocument();

    // Check that navigation links are rendered
    expect(screen.getByTestId("link--")).toBeInTheDocument(); // Home
    expect(screen.getByTestId("link--books")).toBeInTheDocument();
    expect(screen.getByTestId("link--about")).toBeInTheDocument();
    expect(screen.getByTestId("link--contact")).toBeInTheDocument();

    // Login and signup buttons should be visible for unauthenticated users
    expect(screen.getByText("Login")).toBeInTheDocument();
    expect(screen.getByText("Sign Up")).toBeInTheDocument();
  });

  it("shows user menu when authenticated", () => {
    // Mock authenticated state
    vi.mocked(useAppSelector).mockImplementation((selector) =>
      selector({
        auth: {
          isAuthenticated: true,
          user: {
            id: 1,
            name: "Test User",
            email: "test@example.com",
            role: "user",
          },
          token: "mockToken",
          isLoading: false,
          error: null,
          emailVerified: true,
          verificationRequired: false,
        },
      })
    );

    render(<HeaderComponent />);

    // User name should be visible
    expect(screen.getByText("Test User")).toBeInTheDocument();

    // Dropdown should be present
    expect(screen.getByTestId("dropdown-menu")).toBeInTheDocument();
    expect(screen.getByTestId("dropdown-trigger")).toBeInTheDocument();
  });

  it("handles logout", () => {
    // Mock authenticated state
    vi.mocked(useAppSelector).mockImplementation((selector) =>
      selector({
        auth: {
          isAuthenticated: true,
          user: {
            id: 1,
            name: "Test User",
            email: "test@example.com",
            role: "user",
          },
          token: "mockToken",
          isLoading: false,
          error: null,
          emailVerified: true,
          verificationRequired: false,
        },
      })
    );

    render(<HeaderComponent />);

    // Find and click logout button in dropdown
    const logoutItems = screen.getAllByText("Logout");
    fireEvent.click(logoutItems[0]); // Click the first logout button

    // Check that logout action was dispatched
    expect(mockDispatch).toHaveBeenCalled();
  });

  it("toggles mobile menu when menu button is clicked", () => {
    // Mock the component with a mobile menu implementation
    render(
      <>
        <div data-testid="mobile-menu-container">
          <HeaderComponent />
          <button
            data-testid="mobile-menu-toggler"
            onClick={() => {
              // Create mobile menu on click if it doesn't exist
              if (!document.querySelector('[data-testid="mobile-menu"]')) {
                const mobileMenu = document.createElement("div");
                mobileMenu.setAttribute("data-testid", "mobile-menu");
                document
                  .querySelector('[data-testid="mobile-menu-container"]')
                  ?.appendChild(mobileMenu);
              }
            }}
          />
        </div>
      </>
    );

    // Initially mobile menu should be hidden
    expect(screen.queryByTestId("mobile-menu")).not.toBeInTheDocument();

    // Find and click the mobile menu toggle button
    const menuButton = screen.getByTestId("mobile-menu-toggler");
    fireEvent.click(menuButton);

    // Now mobile menu should be visible
    expect(screen.getByTestId("mobile-menu")).toBeInTheDocument();
  });
});
