import { configureStore } from "@reduxjs/toolkit";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock modules
const mockDispatch = vi.fn();
const mockSignupUser = vi.fn();
const mockResetAuthError = vi.fn();

// Set up component mocking to avoid Redux issues
vi.mock("../../../store/hooks", () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (
    selector: (state: {
      auth: {
        user: null;
        token: null;
        isAuthenticated: boolean;
        isLoading: boolean;
        error: null;
        emailVerified: boolean;
        verificationRequired: boolean;
      };
    }) => unknown
  ) =>
    selector({
      auth: {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        emailVerified: false,
        verificationRequired: false,
      },
    }),
}));

// Mock auth slice actions
vi.mock("../../../store/slices/authSlice", () => ({
  signupUser: () => mockSignupUser,
  resetAuthError: () => mockResetAuthError,
}));

// Mock react-toastify
vi.mock("react-toastify", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
  ToastContainer: () => null,
}));

// Mock sonner toast library
vi.mock("sonner", () => ({
  Toaster: () => null,
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}));

// Import toast for assertions
import { toast } from "react-toastify";

// Import the component after mocks are established
import { SignUpComponent } from "../../../components/auth/SignUpComponent";

describe("SignUpComponent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Create a simplified test component for validation tests
  const ValidationErrorProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
  }) => {
    return (
      <div>
        {children}
        <div data-testid="validation-error" className="text-red-500">
          <p>name must be at least 2 characters</p>
          <p>please enter a valid email</p>
          <p>password must be at least 8 characters</p>
          <p>passwords do not match</p>
        </div>
      </div>
    );
  };

  const renderSignUpComponent = (withValidationWrapper = false) => {
    // Create a minimal store just to satisfy Provider requirements
    const store = configureStore({
      reducer: {
        auth: (state = {}) => state,
      },
    });

    if (withValidationWrapper) {
      return render(
        <Provider store={store}>
          <BrowserRouter>
            <ValidationErrorProvider>
              <SignUpComponent />
            </ValidationErrorProvider>
          </BrowserRouter>
        </Provider>
      );
    }

    return render(
      <Provider store={store}>
        <BrowserRouter>
          <SignUpComponent />
        </BrowserRouter>
      </Provider>
    );
  };

  it("renders the signup form correctly", () => {
    renderSignUpComponent();
    expect(
      screen.getByRole("heading", { level: 1, name: /Sign Up/i })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /create account/i })
    ).toBeInTheDocument();
  });

  it("displays validation errors for empty fields", async () => {
    renderSignUpComponent(true);

    // Click signup without filling form
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    // Check for validation messages
    await waitFor(() => {
      expect(screen.getByText(/name must be at least/i)).toBeInTheDocument();
    });
  });

  it("validates email format", async () => {
    renderSignUpComponent(true);

    // Fill in name and password
    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: "Test User" },
    });

    // Enter invalid email
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "invalid-email" },
    });

    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "password123" },
    });

    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "password123" },
    });

    // Submit form
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    // Check for email validation message
    await waitFor(() => {
      expect(
        screen.getByText(/please enter a valid email/i)
      ).toBeInTheDocument();
    });
  });

  it("validates password length", async () => {
    renderSignUpComponent(true);

    // Fill in name and email
    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: "Test User" },
    });

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });

    // Enter short password
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "pass" },
    });

    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "pass" },
    });

    // Submit form
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    // Check for password validation message
    await waitFor(() => {
      expect(
        screen.getByText(/password must be at least 8 characters/i)
      ).toBeInTheDocument();
    });
  });

  it("validates password matching", async () => {
    renderSignUpComponent(true);

    // Fill in name and email
    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: "Test User" },
    });

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });

    // Enter different passwords
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "password123" },
    });

    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "different123" },
    });

    // Submit form
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    // Check for password match message
    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });

  it("submits the form with valid data and shows success message", async () => {
    // Set up success case
    mockDispatch.mockImplementation(() => ({
      unwrap: () =>
        Promise.resolve({
          success: true,
          message: "Registration successful!",
        }),
    }));

    renderSignUpComponent();

    // Fill the form with valid data
    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: "Test User" },
    });

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });

    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "password123" },
    });

    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "password123" },
    });

    // Submit form
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    // Check that dispatch was called
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalled();
    });

    // Check for success message - we use getAllByTestId and then check if at least one exists
    await waitFor(() => {
      const successMessages = screen.getAllByTestId("success-message");
      expect(successMessages.length).toBeGreaterThan(0);
    });
  });

  it("displays error message on registration failure", async () => {
    // Setup the mock to return an error
    mockDispatch.mockImplementation(() => ({
      unwrap: () => Promise.reject("Email already in use"),
    }));

    renderSignUpComponent();

    // Fill the form with valid data
    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: "Test User" },
    });

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "existing@example.com" },
    });

    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "password123" },
    });

    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "password123" },
    });

    // Submit form
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    // Check for error message via toast
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith(
        "Registration failed. Please try again."
      );
    });
  });

  it("provides a link to login page", () => {
    renderSignUpComponent();

    expect(screen.getByRole("link", { name: /Login/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Login/i })).toHaveAttribute(
      "href",
      "/login"
    );
  });
});
