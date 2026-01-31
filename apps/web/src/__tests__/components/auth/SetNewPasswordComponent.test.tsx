import { SetNewPasswordComponent } from "@/components/auth/SetNewPasswordComponent";
import AuthService from "@/services/authService";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import configureStore from "redux-mock-store";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock the auth service
vi.mock("@/services/authService", () => ({
  default: {
    resetPassword: vi.fn(),
  },
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockStore = configureStore([]);
const store = mockStore({});

describe("SetNewPasswordComponent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.location.search
    Object.defineProperty(window, "location", {
      value: {
        search: "?token=valid-token",
      },
    });
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <Provider store={store}>
          <SetNewPasswordComponent />
        </Provider>
      </BrowserRouter>
    );
  };

  it("renders the form with valid token", async () => {
    renderComponent();

    // Wait for form to be rendered (token validation complete)
    await waitFor(() => {
      expect(
        screen.queryByText(/validating your reset token/i)
      ).not.toBeInTheDocument();
    });

    // Check form elements are present
    expect(screen.getByLabelText(/New Password/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm Password/)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Reset Password/i })
    ).toBeInTheDocument();
  });

  it("validates password requirements", async () => {
    renderComponent();

    // Wait for form to be rendered
    await waitFor(() => {
      expect(
        screen.queryByText(/validating your reset token/i)
      ).not.toBeInTheDocument();
    });

    const submitButton = screen.getByRole("button", {
      name: /Reset Password/i,
    });

    // Submit empty form
    fireEvent.click(submitButton);

    // Check validation messages
    await waitFor(() => {
      expect(
        screen.getByText(/must be at least 8 characters/i)
      ).toBeInTheDocument();
    });

    // Try short password
    const passwordInput = screen.getByLabelText(/New Password/);
    fireEvent.change(passwordInput, { target: { value: "short" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/must be at least 8 characters/i)
      ).toBeInTheDocument();
    });
  });

  it("validates password matching", async () => {
    renderComponent();

    // Wait for form to be rendered
    await waitFor(() => {
      expect(
        screen.queryByText(/validating your reset token/i)
      ).not.toBeInTheDocument();
    });

    const passwordInput = screen.getByLabelText(/New Password/);
    const confirmInput = screen.getByLabelText(/Confirm Password/);
    const submitButton = screen.getByRole("button", {
      name: /Reset Password/i,
    });

    // Enter different passwords
    fireEvent.change(passwordInput, { target: { value: "Password123!" } });
    fireEvent.change(confirmInput, { target: { value: "Password456!" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });

  it("handles successful password reset", async () => {
    renderComponent();

    // Wait for form to be rendered
    await waitFor(() => {
      expect(
        screen.queryByText(/validating your reset token/i)
      ).not.toBeInTheDocument();
    });

    const passwordInput = screen.getByLabelText(/New Password/);
    const confirmInput = screen.getByLabelText(/Confirm Password/);
    const submitButton = screen.getByRole("button", {
      name: /Reset Password/i,
    });

    // Fill form with valid data
    fireEvent.change(passwordInput, { target: { value: "NewPassword123!" } });
    fireEvent.change(confirmInput, { target: { value: "NewPassword123!" } });
    fireEvent.click(submitButton);

    // Check success message appears
    await waitFor(() => {
      expect(
        screen.getByText(/password successfully reset/i)
      ).toBeInTheDocument();
    });
  });

  it("handles reset password failure", async () => {
    // Mock AuthService to throw an error
    vi.spyOn(AuthService, "resetPassword").mockRejectedValueOnce(
      new Error("Reset failed")
    );

    renderComponent();

    // Wait for form to be rendered
    await waitFor(() => {
      expect(
        screen.queryByText(/validating your reset token/i)
      ).not.toBeInTheDocument();
    });

    const passwordInput = screen.getByLabelText(/New Password/);
    const confirmInput = screen.getByLabelText(/Confirm Password/);
    const submitButton = screen.getByRole("button", {
      name: /Reset Password/i,
    });

    // Fill form with valid data
    fireEvent.change(passwordInput, { target: { value: "NewPassword123!" } });
    fireEvent.change(confirmInput, { target: { value: "NewPassword123!" } });
    fireEvent.click(submitButton);

    // Check error message appears
    await waitFor(() => {
      expect(screen.getByText(/failed to reset password/i)).toBeInTheDocument();
    });
  });
});
