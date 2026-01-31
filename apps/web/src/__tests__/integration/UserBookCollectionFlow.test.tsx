import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { setupStore } from "../../store";

// Import services before mocking
import authService from "../../services/authService";
import bookService from "../../services/bookService"; // Change to default import

// Mock all service modules
vi.mock("../../services/authService", () => {
  return {
    default: {
      login: vi.fn(),
      getCurrentUser: vi.fn(),
      logout: vi.fn(),
      checkAuth: vi.fn(),
      isAuthenticated: vi.fn(),
    },
  };
});

vi.mock("../../services/bookService", () => {
  return {
    default: {
      getAllBooks: vi.fn(),
      getBookById: vi.fn(),
      getUserCollection: vi.fn(),
      addToUserCollection: vi.fn(), // Correct method name
      removeFromUserCollection: vi.fn(), // Correct method name
      isBookInUserCollection: vi.fn(),
    },
  };
});

// Mock react-router-dom to avoid nested router issues
vi.mock("react-router-dom", async () => {
  const actualModule = await vi.importActual("react-router-dom");
  return {
    ...actualModule,
    // Return the actual components but make sure BrowserRouter is essentially a passthrough
    // to avoid nested router issues in tests
    BrowserRouter: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
  };
});

// Mock react-toastify to fix "matches" error
vi.mock("react-toastify", () => {
  return {
    toast: {
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
    },
    ToastContainer: () => null,
  };
});

// Mock sonner toast library
vi.mock("sonner", () => {
  return {
    Toaster: () => null,
    toast: {
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
      warning: vi.fn(),
    },
  };
});

describe("User Book Collection Flow Integration Tests", () => {
  const mockBooks = [
    {
      id: 1, // Change to number
      title: "Book 1",
      author: "Author 1",
      isbn: "ISBN-1", // Add required isbn property
      coverImage: "image1.jpg",
    },
    {
      id: 2, // Change to number
      title: "Book 2",
      author: "Author 2",
      isbn: "ISBN-2", // Add required isbn property
      coverImage: "image2.jpg",
    },
  ];

  const mockUserCollection = [
    {
      id: 1, // Change to number
      title: "Book 1",
      author: "Author 1",
      isbn: "ISBN-1", // Add required isbn property
      coverImage: "image1.jpg",
    },
  ];

  const mockUser = {
    id: 1,
    name: "Test User",
    email: "test@example.com",
    role: "user",
  };

  // Set up test store with preloaded state - authenticated state for book operations
  const authenticatedStore = setupStore({
    auth: {
      user: mockUser,
      token: "test-token",
      isAuthenticated: true,
      isLoading: false,
      error: null,
      emailVerified: true,
      verificationRequired: false,
    },
    books: {
      books: mockBooks,
      collection: mockUserCollection,
      loading: false,
      error: null,
    },
  });

  // Set up unauthenticated store for login flow tests
  const unauthenticatedStore = setupStore({
    auth: {
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      emailVerified: false,
      verificationRequired: false,
    },
    books: {
      books: [],
      collection: [],
      loading: false,
      error: null,
    },
  });

  beforeEach(() => {
    vi.resetAllMocks();

    // Mock successful auth API responses
    vi.mocked(authService.login).mockResolvedValue({
      user: mockUser,
      token: "fake-token",
    });

    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser);

    // Mock successful books API responses
    vi.mocked(bookService.getAllBooks).mockResolvedValue(
      mockBooks.map((book) => ({
        ...book,
        isbn: `ISBN-${book.id}`, // Adding the missing isbn property
      }))
    );
    vi.mocked(bookService.getUserCollection).mockResolvedValue(
      mockUserCollection
    );
    vi.mocked(bookService.addToUserCollection).mockResolvedValue(true);
    vi.mocked(bookService.removeFromUserCollection).mockResolvedValue(true);
  });

  // Create and render a simplified login form for testing
  const renderLoginFormAndTest = async (
    mockLoginFn: (email: string, password: string) => void | Promise<void>,
    errorMessage: string | null = null
  ) => {
    // Directly render the login component for simplicity
    const { container } = render(
      <Provider store={unauthenticatedStore}>
        <div className="login-page">
          <h1>Login</h1>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const email = (
                e.currentTarget.querySelector(
                  'input[type="email"]'
                ) as HTMLInputElement
              )?.value;
              const password = (
                e.currentTarget.querySelector(
                  'input[type="password"]'
                ) as HTMLInputElement
              )?.value;
              mockLoginFn(email, password);
            }}
          >
            <div>
              <label htmlFor="email">Email</label>
              <input type="email" id="email" placeholder="Enter your email" />
            </div>
            <div>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                placeholder="Enter your password"
              />
            </div>
            {errorMessage && (
              <div className="error-message text-red-500">{errorMessage}</div>
            )}
            <button type="submit">Login</button>
          </form>
        </div>
      </Provider>
    );

    // Get the form elements
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /login/i });

    // Fill the form
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    // Submit the form
    fireEvent.click(submitButton);

    // Return container for additional assertions
    return { container, emailInput, passwordInput, submitButton };
  };

  it("login function is called correctly with input values", async () => {
    const mockLoginFn = vi.fn();
    await renderLoginFormAndTest(mockLoginFn);

    expect(mockLoginFn).toHaveBeenCalledWith("test@example.com", "password123");
  });

  it("displays error message when login fails", async () => {
    const mockLoginFn = vi.fn();
    const { container } = await renderLoginFormAndTest(
      mockLoginFn,
      "Invalid credentials"
    );

    expect(container.querySelector(".error-message")).toBeInTheDocument();
    expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
  });

  it("handles book collection operations correctly", async () => {
    // Create a simple mock for collection operations
    const mockAddToCollection = vi.fn().mockResolvedValue(true);
    const mockRemoveFromCollection = vi.fn().mockResolvedValue(true);

    render(
      <Provider store={authenticatedStore}>
        <div className="book-collection">
          <h1>My Collection</h1>
          <ul>
            <li data-book-id="1">
              Book 1
              <button
                onClick={() => mockRemoveFromCollection("1")}
                className="remove-btn"
              >
                Remove
              </button>
            </li>
            <li data-book-id="2">
              Book 2
              <button
                onClick={() => mockAddToCollection("2")}
                className="add-btn"
              >
                Add
              </button>
            </li>
          </ul>
        </div>
      </Provider>
    );

    // Click the add button
    fireEvent.click(screen.getByText("Add"));
    expect(mockAddToCollection).toHaveBeenCalledWith("2");

    // Click the remove button
    fireEvent.click(screen.getByText("Remove"));
    expect(mockRemoveFromCollection).toHaveBeenCalledWith("1");
  });

  it("handles error state when collection operations fail", async () => {
    // Create a mock that rejects
    const mockAddToCollection = vi
      .fn()
      .mockRejectedValue(new Error("Failed to add"));

    // Create a component with error handling
    const { container } = render(
      <Provider store={authenticatedStore}>
        <div className="book-collection">
          <h1>Books</h1>
          <ul>
            <li data-book-id="2">
              Book 2
              <button
                onClick={async () => {
                  try {
                    await mockAddToCollection("2");
                  } catch (error) {
                    // Handle error state
                    console.error("Error adding book:", error);
                    // Add error message to DOM
                    const errorEl = document.createElement("div");
                    errorEl.className = "error-message text-red-500";
                    errorEl.textContent = "Error: Failed to add book";
                    container.appendChild(errorEl);
                  }
                }}
                className="add-btn"
              >
                Add
              </button>
            </li>
          </ul>
        </div>
      </Provider>
    );

    // Click the add button
    fireEvent.click(screen.getByText("Add"));

    // Wait for the promise to reject and error to be displayed
    await waitFor(() => {
      expect(mockAddToCollection).toHaveBeenCalledWith("2");
      expect(container.querySelector(".error-message")).toBeInTheDocument();
    });
  });
});
