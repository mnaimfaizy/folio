import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ChangePasswordComponent } from "../../../components/auth/ChangePasswordComponent";
import AuthService from "../../../services/authService";

// Helper to render with router
const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe("ChangePasswordComponent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all form fields and button", () => {
    renderWithRouter(<ChangePasswordComponent />);
    expect(screen.getByLabelText("Current Password")).toBeInTheDocument();
    expect(screen.getByLabelText("New Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm New Password")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /update password/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/return to profile/i)).toBeInTheDocument();
  });

  it("shows validation errors for empty fields", async () => {
    renderWithRouter(<ChangePasswordComponent />);
    fireEvent.click(screen.getByRole("button", { name: /update password/i }));
    await waitFor(() => {
      expect(
        screen.getByText(/current password is required/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/password must be at least 8 characters long/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/please confirm your password/i)
      ).toBeInTheDocument();
    });
  });

  it("shows error if passwords do not match", async () => {
    renderWithRouter(<ChangePasswordComponent />);
    fireEvent.input(screen.getByLabelText("Current Password"), {
      target: { value: "OldPassword1" },
    });
    fireEvent.input(screen.getByLabelText("New Password"), {
      target: { value: "NewPassword1" },
    });
    fireEvent.input(screen.getByLabelText("Confirm New Password"), {
      target: { value: "DifferentPassword1" },
    });
    fireEvent.click(screen.getByRole("button", { name: /update password/i }));
    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });

  it("shows error if new password is same as current password", async () => {
    renderWithRouter(<ChangePasswordComponent />);
    fireEvent.input(screen.getByLabelText("Current Password"), {
      target: { value: "SamePassword1" },
    });
    fireEvent.input(screen.getByLabelText("New Password"), {
      target: { value: "SamePassword1" },
    });
    fireEvent.input(screen.getByLabelText("Confirm New Password"), {
      target: { value: "SamePassword1" },
    });
    fireEvent.click(screen.getByRole("button", { name: /update password/i }));
    await waitFor(() => {
      expect(
        screen.getByText(
          /new password must be different from current password/i
        )
      ).toBeInTheDocument();
    });
  });

  it("shows error if password is weak (missing uppercase, lowercase, or number)", async () => {
    renderWithRouter(<ChangePasswordComponent />);
    fireEvent.input(screen.getByLabelText("Current Password"), {
      target: { value: "OldPassword1" },
    });
    fireEvent.input(screen.getByLabelText("New Password"), {
      target: { value: "weakpass" },
    });
    fireEvent.input(screen.getByLabelText("Confirm New Password"), {
      target: { value: "weakpass" },
    });
    fireEvent.click(screen.getByRole("button", { name: /update password/i }));
    await waitFor(() => {
      expect(
        screen.getByText(/password must contain at least one uppercase letter/i)
      ).toBeInTheDocument();
    });
  });

  it("calls AuthService.changePassword and shows success message on success", async () => {
    const mockChangePassword = vi
      .spyOn(AuthService, "changePassword")
      .mockResolvedValue({ message: "Password successfully changed" });
    renderWithRouter(<ChangePasswordComponent />);
    fireEvent.input(screen.getByLabelText("Current Password"), {
      target: { value: "OldPassword1" },
    });
    fireEvent.input(screen.getByLabelText("New Password"), {
      target: { value: "NewPassword1" },
    });
    fireEvent.input(screen.getByLabelText("Confirm New Password"), {
      target: { value: "NewPassword1" },
    });
    fireEvent.click(screen.getByRole("button", { name: /update password/i }));
    await waitFor(() => {
      expect(mockChangePassword).toHaveBeenCalledWith(
        "OldPassword1",
        "NewPassword1"
      );
      expect(
        screen.getByText(/password successfully changed/i)
      ).toBeInTheDocument();
    });
  });

  it("shows error message if AuthService.changePassword fails with API error", async () => {
    vi.spyOn(AuthService, "changePassword").mockRejectedValue({
      response: { data: { message: "API error: invalid password" } },
    });
    renderWithRouter(<ChangePasswordComponent />);
    fireEvent.input(screen.getByLabelText("Current Password"), {
      target: { value: "OldPassword1" },
    });
    fireEvent.input(screen.getByLabelText("New Password"), {
      target: { value: "NewPassword1" },
    });
    fireEvent.input(screen.getByLabelText("Confirm New Password"), {
      target: { value: "NewPassword1" },
    });
    fireEvent.click(screen.getByRole("button", { name: /update password/i }));
    await waitFor(() => {
      expect(
        screen.getByText(/api error: invalid password/i)
      ).toBeInTheDocument();
    });
  });

  it("shows generic error message if AuthService.changePassword fails with unknown error", async () => {
    vi.spyOn(AuthService, "changePassword").mockRejectedValue(
      new Error("Something went wrong")
    );
    renderWithRouter(<ChangePasswordComponent />);
    fireEvent.input(screen.getByLabelText("Current Password"), {
      target: { value: "OldPassword1" },
    });
    fireEvent.input(screen.getByLabelText("New Password"), {
      target: { value: "NewPassword1" },
    });
    fireEvent.input(screen.getByLabelText("Confirm New Password"), {
      target: { value: "NewPassword1" },
    });
    fireEvent.click(screen.getByRole("button", { name: /update password/i }));
    await waitFor(() => {
      expect(
        screen.getByText(/failed to update password/i)
      ).toBeInTheDocument();
    });
  });
});
