import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CreateAuthor } from "../../../../components/admin/authors/CreateAuthor";

// Mock AdminService
vi.mock("@/services/adminService", () => ({
  __esModule: true,
  default: {
    createAuthor: vi.fn(),
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

describe("CreateAuthor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear(); // Clear the mock before each test
  });

  it("renders the form fields", () => {
    render(
      <MemoryRouter>
        <CreateAuthor />
      </MemoryRouter>
    );
    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Birth Date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Photo URL/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Biography/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Create Author/i })
    ).toBeInTheDocument();
  });

  it("shows validation error if name is missing", async () => {
    render(
      <MemoryRouter>
        <CreateAuthor />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole("button", { name: /Create Author/i }));
    await waitFor(() => {
      expect(screen.getByText(/Author name is required/i)).toBeInTheDocument();
    });
  });

  it("submits the form and shows success", async () => {
    const AdminService = (await import("@/services/adminService")).default;
    AdminService.createAuthor = vi.fn().mockResolvedValue({ id: 123 });
    render(
      <MemoryRouter>
        <CreateAuthor />
      </MemoryRouter>
    );
    fireEvent.change(screen.getByLabelText(/Name/i), {
      target: { value: "Test Author" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Create Author/i }));
    await waitFor(() => {
      expect(
        screen.getByText(/Author created successfully/i)
      ).toBeInTheDocument();
    });
  });

  it("shows error if API fails", async () => {
    const AdminService = (await import("@/services/adminService")).default;
    AdminService.createAuthor = vi.fn().mockRejectedValue({
      response: { data: { message: "API error" } },
    });
    render(
      <MemoryRouter>
        <CreateAuthor />
      </MemoryRouter>
    );
    fireEvent.change(screen.getByLabelText(/Name/i), {
      target: { value: "Test Author" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Create Author/i }));
    await waitFor(() => {
      expect(screen.getByText(/API error/i)).toBeInTheDocument();
    });
  });

  it("calls navigate when Cancel is clicked", async () => {
    render(
      <MemoryRouter>
        <CreateAuthor />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole("button", { name: /Cancel/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/admin/authors"); // Assert on the top-level mock
  });
});
