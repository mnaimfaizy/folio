import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CreateUser } from "../../../../components/admin/users/CreateUser";

// Mock AdminService
vi.mock("@/services/adminService", () => ({
  __esModule: true,
  default: {
    createUser: vi.fn(),
  },
}));

// Mock useNavigate
const mockNavigate = vi.fn(); // Define mock function at the top level
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate, // Use the top-level mock
  };
});

describe("CreateUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear(); // Clear the mock before each test
  });

  it("renders the form fields", () => {
    render(
      <MemoryRouter>
        <CreateUser />
      </MemoryRouter>
    );
    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    // Use getByRole for specificity, assuming the input has an accessible name "Email"
    expect(screen.getByRole("textbox", { name: /Email/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByText(/Role/i)).toBeInTheDocument();
    expect(screen.getByText(/Email Verified/i)).toBeInTheDocument();
    expect(screen.getByText(/Send Verification Email/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Create User/i })
    ).toBeInTheDocument(); // Use getByRole
  });

  it("shows validation error if required fields are missing", async () => {
    render(
      <MemoryRouter>
        <CreateUser />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole("button", { name: /Create User/i })); // Use getByRole
    await waitFor(() => {
      expect(
        screen.getByText(/Name must be at least 2 characters/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Please enter a valid email address/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Password must be at least 8 characters/i)
      ).toBeInTheDocument();
    });
  });

  it("submits the form and shows success", async () => {
    const AdminService = (await import("@/services/adminService")).default;
    AdminService.createUser = vi.fn().mockResolvedValue({});
    render(
      <MemoryRouter>
        <CreateUser />
      </MemoryRouter>
    );
    fireEvent.change(screen.getByLabelText(/Name/i), {
      target: { value: "Test User" },
    });
    // Use getByRole for specificity
    fireEvent.change(screen.getByRole("textbox", { name: /Email/i }), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "Password1" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Create User/i })); // Use getByRole
    await waitFor(() => {
      expect(
        screen.getByText(/User created successfully/i)
      ).toBeInTheDocument();
    });
  });

  it("shows error if API fails", async () => {
    const AdminService = (await import("@/services/adminService")).default;
    AdminService.createUser = vi.fn().mockRejectedValue({
      response: { data: { message: "API error" } },
    });
    render(
      <MemoryRouter>
        <CreateUser />
      </MemoryRouter>
    );
    fireEvent.change(screen.getByLabelText(/Name/i), {
      target: { value: "Test User" },
    });
    // Use getByRole for specificity
    fireEvent.change(screen.getByRole("textbox", { name: /Email/i }), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "Password1" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Create User/i })); // Use getByRole
    await waitFor(() => {
      expect(screen.getByText(/API error/i)).toBeInTheDocument();
    });
  });

  it("calls navigate when Cancel is clicked", async () => {
    render(
      <MemoryRouter>
        <CreateUser />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole("button", { name: /Cancel/i })); // Use getByRole
    expect(mockNavigate).toHaveBeenCalledWith("/admin/users"); // Assert on the top-level mock
  });
});
