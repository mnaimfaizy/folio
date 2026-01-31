/* eslint-disable @typescript-eslint/no-explicit-any */
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoginComponent } from "../../../components/auth/LoginComponent";
import { setupStore } from "../../../store";

// Mock dependencies and Redux actions
vi.mock("../../../store/slices/authSlice", async () => {
  const actual = await vi.importActual("../../../store/slices/authSlice");
  return {
    ...actual,
    loginUser: vi.fn(),
    resetAuthError: vi.fn(),
    default: actual.default,
  };
});

// Import after mocking
import { loginUser } from "../../../store/slices/authSlice";

// Mock navigate function
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock the GuestGuard component
vi.mock("../../../components/auth/guards/GuestGuard", () => ({
  GuestGuard: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="guest-guard">{children}</div>
  ),
}));

describe("LoginComponent", () => {
  const mockDispatch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup for Redux dispatch mock
    mockDispatch.mockImplementation(() => ({
      unwrap: () => Promise.resolve(),
    }));
    vi.mocked(loginUser).mockImplementation(
      () => ({ type: "auth/loginUser" } as any)
    );
  });

  const renderLoginComponent = (initialState = {}) => {
    const store = setupStore({
      auth: {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        emailVerified: true,
        verificationRequired: false,
        ...initialState,
      },
    });

    // Override the dispatch function for testing
    store.dispatch = mockDispatch;

    return render(
      <Provider store={store}>
        <MemoryRouter>
          <LoginComponent />
        </MemoryRouter>
      </Provider>
    );
  };

  it("renders login form correctly", () => {
    renderLoginComponent();

    // Check if form elements are rendered
    expect(screen.getByRole("heading", { name: "Login" })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
    expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
    expect(screen.getByText(/sign up/i)).toBeInTheDocument();
  });

  it("displays loading state during form submission", () => {
    renderLoginComponent({ isLoading: true });

    // Check if loader is displayed
    expect(screen.getByText("Logging in...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /logging in/i })).toBeDisabled();
  });

  it("displays error message when auth fails", () => {
    renderLoginComponent({ error: "Invalid email or password" });

    // Check if error message is displayed
    expect(screen.getByText("Invalid email or password")).toBeInTheDocument();
  });

  it("shows validation errors for invalid inputs", async () => {
    renderLoginComponent();

    // Get the form elements
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /login/i });

    // Submit the form with empty inputs
    fireEvent.click(submitButton);

    // Wait for validation errors to appear
    await waitFor(() => {
      expect(
        screen.getByText(/Please enter a valid email address/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/Password is required/i)).toBeInTheDocument();
    });

    // Test with invalid email format
    fireEvent.change(emailInput, { target: { value: "invalidemail" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/Please enter a valid email address/i)
      ).toBeInTheDocument();
    });
  });

  it("submits the form with valid inputs and dispatches login action", async () => {
    renderLoginComponent();

    // Get the form elements
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /login/i });

    // Fill the form with valid inputs
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    // Submit the form
    fireEvent.click(submitButton);

    // Check if login action was dispatched with correct values
    await waitFor(() => {
      expect(loginUser).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
    });

    expect(mockDispatch).toHaveBeenCalled();
  });

  it("navigates to /books after successful login", async () => {
    renderLoginComponent();

    // Get the form elements
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /login/i });

    // Fill the form with valid inputs
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    // Submit the form
    fireEvent.click(submitButton);

    // Wait for navigation to occur after successful login
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/books");
    });
  });

  it("renders within GuestGuard", () => {
    renderLoginComponent();

    // Check if the GuestGuard component wraps the login form
    expect(screen.getByTestId("guest-guard")).toBeInTheDocument();
  });
});
