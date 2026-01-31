import { User } from "@/services/adminService";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UsersList } from "../../../../components/admin/users/UsersList";

// Mock AdminService
vi.mock("@/services/adminService", () => ({
  __esModule: true,
  default: {
    getAllUsers: vi.fn(),
    deleteUser: vi.fn(),
  },
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate, // Use the mockNavigate function here
  };
});

const mockUsers = [
  {
    id: 1,
    name: "User One",
    email: "user1@example.com",
    role: "ADMIN",
    email_verified: true,
    createdAt: "2024-01-01T10:00:00Z",
  },
  {
    id: 2,
    name: "User Two",
    email: "user2@example.com",
    role: "USER",
    email_verified: false,
    createdAt: "2024-02-01T10:00:00Z",
  },
];

describe("UsersList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state", async () => {
    const AdminService = (await import("@/services/adminService")).default;
    // This promise will intentionally never resolve, keeping the component in loading state
    AdminService.getAllUsers = vi.fn(() => new Promise<User[]>(() => {}));
    render(
      <MemoryRouter>
        <UsersList />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText("Loading users...")).toBeInTheDocument();
    });
  });

  it("renders error state", async () => {
    const AdminService = (await import("@/services/adminService")).default;
    // Fix: Properly reject the promise to trigger error state
    AdminService.getAllUsers = vi.fn().mockRejectedValue(new Error("fail"));
    render(
      <MemoryRouter>
        <UsersList />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText(/Failed to load users/i)).toBeInTheDocument();
    });
  });

  it("renders 'no users found' state", async () => {
    const AdminService = (await import("@/services/adminService")).default;
    // Fix: Properly resolve the promise with an empty array
    AdminService.getAllUsers = vi.fn().mockResolvedValue([]);
    render(
      <MemoryRouter>
        <UsersList />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText(/No users found/i)).toBeInTheDocument();
    });
  });

  it("renders a list of users", async () => {
    const AdminService = (await import("@/services/adminService")).default;
    // Fix: Properly resolve the promise with mock users array
    AdminService.getAllUsers = vi.fn().mockResolvedValue(mockUsers);
    render(
      <MemoryRouter>
        <UsersList />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText("User One")).toBeInTheDocument();
      expect(screen.getByText("User Two")).toBeInTheDocument();
      expect(screen.getByText("user1@example.com")).toBeInTheDocument();
      expect(screen.getByText("user2@example.com")).toBeInTheDocument();
    });
  });

  it("calls navigate when 'Add User' is clicked", async () => {
    const AdminService = (await import("@/services/adminService")).default;
    // Fix: Properly resolve the promise with mock users array
    AdminService.getAllUsers = vi.fn().mockResolvedValue(mockUsers);
    render(
      <MemoryRouter>
        <UsersList />
      </MemoryRouter>
    );
    await waitFor(() => {
      fireEvent.click(screen.getByText("Add User"));
      expect(mockNavigate).toHaveBeenCalledWith("/admin/users/create");
    });
  });
});
