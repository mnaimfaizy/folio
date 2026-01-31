import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProfileComponent } from "../../../components/profile/ProfileComponent";

// Mock the AuthGuard component to avoid testing its logic
vi.mock("../../../components/auth/guards/AuthGuard", () => ({
  AuthGuard: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="auth-guard">{children}</div>
  ),
}));

// Mock the Redux hooks
vi.mock("@/store/hooks", () => ({
  useAppSelector: vi.fn().mockReturnValue({
    user: {
      id: 1,
      name: "Test User",
      email: "test@example.com",
      role: "USER",
    },
    isLoading: false,
    error: null,
  }),
  useAppDispatch: vi.fn().mockReturnValue(
    vi.fn(() => ({
      unwrap: () => Promise.resolve(),
    }))
  ),
}));

// Mock Redux actions
vi.mock("@/store/slices/authSlice", () => ({
  resetAuthError: vi.fn(),
  updateProfile: vi.fn(),
  changePassword: vi.fn(),
  deleteAccount: vi.fn(),
}));

describe("ProfileComponent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state initially", () => {
    render(
      <MemoryRouter>
        <ProfileComponent />
      </MemoryRouter>
    );

    // Profile page should load with user information
    expect(screen.getByText("Your Profile")).toBeInTheDocument();
  });

  it("renders profile information when data is loaded", () => {
    render(
      <MemoryRouter>
        <ProfileComponent />
      </MemoryRouter>
    );

    // Check if user information is displayed
    expect(screen.getByLabelText("Full Name")).toHaveValue("Test User");
    expect(screen.getByLabelText("Email Address")).toHaveValue(
      "test@example.com"
    );

    // Check if the tabs are rendered
    expect(screen.getByText("Personal Info")).toBeInTheDocument();
    expect(screen.getByText("Security")).toBeInTheDocument();
    expect(screen.getByText("Danger Zone")).toBeInTheDocument();
  });
});
