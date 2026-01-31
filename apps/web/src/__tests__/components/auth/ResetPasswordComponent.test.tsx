import { ResetPasswordComponent } from "@/components/auth/ResetPasswordComponent";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import configureStore from "redux-mock-store";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock AuthService
vi.mock("@/services/authService", () => ({
  default: {
    requestPasswordReset: vi.fn(),
  },
}));

// Import the mocked service for assertions
import AuthService from "@/services/authService";

const mockStore = configureStore([]);
const store = mockStore({});

describe("ResetPasswordComponent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <Provider store={store}>
        <BrowserRouter>
          <ResetPasswordComponent />
          <ToastContainer />
        </BrowserRouter>
      </Provider>
    );
  };

  it("renders the form correctly", () => {
    renderComponent();

    // Check for the title text using data-slot attribute
    expect(
      screen.getByText(/reset password/i, {
        selector: '[data-slot="card-title"]',
      })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /reset password/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/return to login/i)).toBeInTheDocument();
  });

  it("validates email format", async () => {
    renderComponent();

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole("button", {
      name: /reset password/i,
    });

    // Submit with empty email
    fireEvent.click(submitButton);
    expect(
      await screen.findByText(/please enter a valid email address/i)
    ).toBeInTheDocument();

    // Submit with invalid email
    fireEvent.change(emailInput, { target: { value: "invalid-email" } });
    fireEvent.click(submitButton);
    expect(
      await screen.findByText(/please enter a valid email address/i)
    ).toBeInTheDocument();
  });

  it("shows loading state during submission", async () => {
    vi.mocked(AuthService.requestPasswordReset).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    renderComponent();

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole("button", {
      name: /reset password/i,
    });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.click(submitButton);

    expect(screen.getByText(/processing/i)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it("handles successful password reset request", async () => {
    vi.mocked(AuthService.requestPasswordReset).mockResolvedValue({
      message: "Reset email sent",
    });

    renderComponent();

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole("button", {
      name: /reset password/i,
    });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/if an account exists with test@example.com/i)
      ).toBeInTheDocument();
    });

    expect(AuthService.requestPasswordReset).toHaveBeenCalledWith(
      "test@example.com"
    );
  });

  it("handles reset request error", async () => {
    const errorMessage = "Failed to send reset email";
    vi.mocked(AuthService.requestPasswordReset).mockRejectedValue({
      response: { data: { message: errorMessage } },
    });

    renderComponent();

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole("button", {
      name: /reset password/i,
    });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it("navigates to login page when clicking return link", () => {
    renderComponent();

    const loginLink = screen.getByText(/return to login/i);
    expect(loginLink).toHaveAttribute("href", "/login");
  });
});
