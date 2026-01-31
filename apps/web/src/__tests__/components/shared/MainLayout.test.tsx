import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// Mock dependencies with factory functions
vi.mock("react-router-dom", () => {
  const location = { pathname: "/" };
  return {
    useLocation: vi.fn(() => location),
    __esModule: true,
  };
});

vi.mock("../../../store/hooks", () => {
  const useAppSelector = vi.fn();
  return {
    useAppSelector,
    __esModule: true,
  };
});

vi.mock("../../../components/shared/HeaderComponent", () => ({
  HeaderComponent: () => <div data-testid="header">Header</div>,
}));

vi.mock("../../../components/shared/FooterComponent", () => ({
  FooterComponent: () => <div data-testid="footer">Footer</div>,
}));

vi.mock("../../../components/shared/NavigationComponent", () => ({
  NavigationComponent: () => <div data-testid="navigation">Navigation</div>,
}));

vi.mock("../../../components/admin/AdminNavigationComponent", () => ({
  AdminNavigationComponent: () => (
    <div data-testid="admin-navigation">Admin Navigation</div>
  ),
}));

// Import the component after mocks are set up
import { MainLayout } from "../../../components/shared/MainLayout";

// Import mocks for use in tests
import { useLocation } from "react-router-dom";
import { useAppSelector } from "../../../store/hooks";

describe("MainLayout Component", () => {
  it("renders children, header and footer", () => {
    // Default mock state has isAuthenticated: false
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

    render(
      <MainLayout>
        <div data-testid="content">Test Content</div>
      </MainLayout>
    );

    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("content")).toBeInTheDocument();
    expect(screen.getByTestId("footer")).toBeInTheDocument();
  });

  it("does not render navigation when user is not authenticated", () => {
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

    render(
      <MainLayout>
        <div>Content</div>
      </MainLayout>
    );

    expect(screen.queryByTestId("navigation")).not.toBeInTheDocument();
  });

  it("renders navigation when user is authenticated", () => {
    // Mock authenticated state
    vi.mocked(useAppSelector).mockImplementation((selector) =>
      selector({
        auth: {
          isAuthenticated: true,
          user: null,
          token: null,
          isLoading: false,
          error: null,
          emailVerified: false,
          verificationRequired: false,
        },
      })
    );

    render(
      <MainLayout>
        <div>Content</div>
      </MainLayout>
    );

    expect(screen.getByTestId("navigation")).toBeInTheDocument();
  });

  it("renders admin navigation on admin pages", () => {
    // Mock admin route
    vi.mocked(useLocation).mockReturnValue({
      pathname: "/admin/users",
      state: undefined,
      key: "",
      search: "",
      hash: "",
    });

    // Mock authenticated state
    vi.mocked(useAppSelector).mockImplementation((selector) =>
      selector({
        auth: {
          isAuthenticated: true,
          user: null,
          token: null,
          isLoading: false,
          error: null,
          emailVerified: false,
          verificationRequired: false,
        },
      })
    );

    render(
      <MainLayout>
        <div>Admin Content</div>
      </MainLayout>
    );

    expect(screen.getByTestId("admin-navigation")).toBeInTheDocument();
    expect(screen.queryByTestId("navigation")).not.toBeInTheDocument();
  });
});
