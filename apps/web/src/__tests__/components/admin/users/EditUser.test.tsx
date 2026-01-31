import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { EditUser } from "../../../../components/admin/users/EditUser";

// Mock AdminService
vi.mock("@/services/adminService", () => ({
  __esModule: true,
  default: {
    getUserById: vi.fn(),
    updateUser: vi.fn(),
  },
}));

// Mock useNavigate and useParams
const mockNavigate = vi.fn(); // Define mock function at the top level
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate, // Use the top-level mock
    useParams: () => ({ id: "1" }),
  };
});

const mockUser = {
  id: 1,
  name: "User One",
  email: "user1@example.com",
  role: "ADMIN",
  email_verified: true,
};

describe("EditUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear(); // Clear the mock before each test
  });

  it("renders loading state", async () => {
    const AdminService = (await import("@/services/adminService")).default;
    AdminService.getUserById = vi
      .fn()
      .mockImplementation(() => new Promise(() => {}));
    render(
      <MemoryRouter>
        <EditUser />
      </MemoryRouter>
    );
    expect(screen.getByText("Loading user data...")).toBeInTheDocument();
  });

  it("renders user not found", async () => {
    const AdminService = (await import("@/services/adminService")).default;
    AdminService.getUserById = vi.fn().mockResolvedValue(null);
    render(
      <MemoryRouter>
        <EditUser />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText(/User not found/i)).toBeInTheDocument();
    });
  });

  it("renders the form with user data", async () => {
    const AdminService = (await import("@/services/adminService")).default;
    AdminService.getUserById = vi.fn().mockResolvedValue(mockUser);
    render(
      <MemoryRouter>
        <EditUser />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByDisplayValue("User One")).toBeInTheDocument();
      expect(screen.getByDisplayValue("user1@example.com")).toBeInTheDocument();
    });
  });

  it("shows validation error if name is missing", async () => {
    const AdminService = (await import("@/services/adminService")).default;
    AdminService.getUserById = vi.fn().mockResolvedValue(mockUser);
    render(
      <MemoryRouter>
        <EditUser />
      </MemoryRouter>
    );
    await waitFor(() => {
      fireEvent.change(screen.getByLabelText(/Name/i), {
        target: { value: "" },
      });
      // Use getByRole for the submit button
      fireEvent.click(screen.getByRole("button", { name: /Update User/i }));
    });
    await waitFor(() => {
      expect(
        screen.getByText(/Name must be at least 2 characters/i)
      ).toBeInTheDocument();
    });
  });

  it("submits the form and shows success", async () => {
    const AdminService = (await import("@/services/adminService")).default;
    AdminService.getUserById = vi.fn().mockResolvedValue(mockUser);
    AdminService.updateUser = vi.fn().mockResolvedValue({});
    render(
      <MemoryRouter>
        <EditUser />
      </MemoryRouter>
    );
    await waitFor(() => {
      fireEvent.change(screen.getByLabelText(/Name/i), {
        target: { value: "Updated User" },
      });
      // Use getByRole for the submit button
      fireEvent.click(screen.getByRole("button", { name: /Update User/i }));
    });
    await waitFor(() => {
      expect(
        screen.getByText(/User updated successfully/i)
      ).toBeInTheDocument();
      // Assert navigation was called (optional, depends on component logic)
      // expect(mockNavigate).toHaveBeenCalledWith(...);
    });
  });

  it("shows error if API fails", async () => {
    const AdminService = (await import("@/services/adminService")).default;
    AdminService.getUserById = vi.fn().mockResolvedValue(mockUser);
    AdminService.updateUser = vi.fn().mockRejectedValue({
      response: { data: { message: "API error" } },
    });
    render(
      <MemoryRouter>
        <EditUser />
      </MemoryRouter>
    );
    await waitFor(() => {
      // Use getByRole for the submit button
      fireEvent.click(screen.getByRole("button", { name: /Update User/i }));
    });
    await waitFor(() => {
      expect(screen.getByText(/API error/i)).toBeInTheDocument();
    });
  });

  it("calls navigate when Cancel is clicked", async () => {
    const AdminService = (await import("@/services/adminService")).default;
    AdminService.getUserById = vi.fn().mockResolvedValue(mockUser);
    render(
      <MemoryRouter>
        <EditUser />
      </MemoryRouter>
    );
    await waitFor(() => {
      // Use getByRole for the cancel button
      fireEvent.click(screen.getByRole("button", { name: /Cancel/i }));
    });
    expect(mockNavigate).toHaveBeenCalledWith("/admin/users"); // Assert on the top-level mock
  });
});
