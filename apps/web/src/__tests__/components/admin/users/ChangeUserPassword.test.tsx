import type { UserDetail } from "@/services/adminService";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ChangeUserPassword } from "../../../../components/admin/users/ChangeUserPassword";

// Mock AdminService
const mockGetUserById = vi.fn();
const mockChangeUserPassword = vi.fn();
vi.mock("@/services/adminService", () => ({
  __esModule: true,
  default: {
    getUserById: (id: number) => mockGetUserById(id),
    changeUserPassword: (id: number, password: string) =>
      mockChangeUserPassword(id, password),
  },
}));

// Mock useNavigate and useParams
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: "1" }),
  };
});

const mockUser: UserDetail = {
  id: 1,
  name: "User One",
  email: "user1@example.com",
  role: "ADMIN",
  email_verified: true,
  books: [],
  createdAt: "2025-01-01T00:00:00Z",
  updatedAt: "2025-01-01T00:00:00Z",
};

describe("ChangeUserPassword", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    // Mock successful user fetch
    mockGetUserById.mockResolvedValue({
      id: 1,
      name: "Test User",
      email: "test@example.com",
      role: "USER",
    });
  });

  it("renders loading state", () => {
    mockGetUserById.mockImplementation(() => new Promise(() => {}));
    render(
      <MemoryRouter>
        <ChangeUserPassword />
      </MemoryRouter>
    );
    expect(screen.getByText("Loading user data...")).toBeInTheDocument();
  });

  it("renders user not found", async () => {
    mockGetUserById.mockResolvedValue(null);
    render(
      <MemoryRouter>
        <ChangeUserPassword />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText(/User not found/i)).toBeInTheDocument();
    });
  });

  it("renders the form with user data", async () => {
    mockGetUserById.mockResolvedValue(mockUser);
    render(
      <MemoryRouter>
        <ChangeUserPassword />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(
        screen.getByText(/Change Password for User One/i)
      ).toBeInTheDocument();
    });
  });

  it("shows validation error if password is invalid or does not match", async () => {
    mockGetUserById.mockResolvedValue(mockUser);
    render(
      <MemoryRouter>
        <ChangeUserPassword />
      </MemoryRouter>
    );
    await waitFor(() => {
      // Use exact label text for specificity
      fireEvent.change(screen.getByLabelText("New Password"), {
        target: { value: "short" },
      });
      fireEvent.change(screen.getByLabelText("Confirm New Password"), {
        target: { value: "short" },
      });
      fireEvent.click(screen.getByRole("button", { name: /Change Password/i }));
    });
    await waitFor(() => {
      expect(
        screen.getByText(/Password must be at least 8 characters/i)
      ).toBeInTheDocument();
    });
    // Now test mismatch
    fireEvent.change(screen.getByLabelText("New Password"), {
      target: { value: "Password1" },
    });
    fireEvent.change(screen.getByLabelText("Confirm New Password"), {
      target: { value: "Password2" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Change Password/i }));
    await waitFor(() => {
      expect(screen.getByText(/Passwords don't match/i)).toBeInTheDocument();
    });
  });

  it("submits the form and shows success", async () => {
    mockGetUserById.mockResolvedValue(mockUser);
    mockChangeUserPassword.mockResolvedValue({});
    render(
      <MemoryRouter>
        <ChangeUserPassword />
      </MemoryRouter>
    );
    await waitFor(() => {
      fireEvent.change(screen.getByLabelText("New Password"), {
        target: { value: "Password1" },
      });
      fireEvent.change(screen.getByLabelText("Confirm New Password"), {
        target: { value: "Password1" },
      });
      fireEvent.click(screen.getByRole("button", { name: /Change Password/i }));
    });
    await waitFor(() => {
      expect(
        screen.getByText(/Password changed successfully/i)
      ).toBeInTheDocument();
    });
  });

  it("shows error if API fails", async () => {
    mockGetUserById.mockResolvedValue(mockUser);
    mockChangeUserPassword.mockRejectedValue({
      response: { data: { message: "API error" } },
    });
    render(
      <MemoryRouter>
        <ChangeUserPassword />
      </MemoryRouter>
    );
    await waitFor(() => {
      fireEvent.change(screen.getByLabelText("New Password"), {
        target: { value: "Password1" },
      });
      fireEvent.change(screen.getByLabelText("Confirm New Password"), {
        target: { value: "Password1" },
      });
      fireEvent.click(screen.getByRole("button", { name: /Change Password/i }));
    });
    await waitFor(() => {
      expect(screen.getByText(/API error/i)).toBeInTheDocument();
    });
  });

  it("calls navigate when Cancel is clicked", async () => {
    render(
      <MemoryRouter>
        <ChangeUserPassword />
      </MemoryRouter>
    );

    // Wait for loading state to finish
    await waitFor(() => {
      expect(
        screen.queryByText("Loading user data...")
      ).not.toBeInTheDocument();
    });

    // Now we can interact with the Cancel button
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/admin/users");
  });
});
