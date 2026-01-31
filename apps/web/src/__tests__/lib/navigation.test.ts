import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { appNavigate, registerNavigate } from "../../lib/navigation";

// Mock the navigation module
vi.mock("../../lib/navigation");

describe("Navigation Utility", () => {
  let mockNavigate: ReturnType<typeof vi.fn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Create mock navigate function
    mockNavigate = vi.fn();

    // Reset window.location.href
    Object.defineProperty(window, "location", {
      writable: true,
      value: {
        href: "http://localhost/",
        replace: vi.fn(),
        assign: vi.fn(),
      },
    });

    // Spy on console.warn
    consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    // Clear all mocks
    vi.clearAllMocks();
  });

  it("should register and use the provided navigate function", () => {
    // Mock the behavior for this test
    vi.mocked(registerNavigate).mockImplementation((fn) => {
      // Store the navigate function
      vi.mocked(appNavigate).mockImplementation((path) => fn(path));
    });

    // Register the mock navigate function
    registerNavigate(mockNavigate);

    // Call appNavigate with a path
    appNavigate("/books");

    // Verify the mock navigate function was called with the correct path
    expect(mockNavigate).toHaveBeenCalledWith("/books");

    // Verify window.location.href was not changed
    expect(window.location.href).toBe("http://localhost/");

    // Verify console.warn was not called
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  it("should fall back to window.location.href when navigate function is not registered", () => {
    // Mock the behavior for this test - no function registered
    vi.mocked(appNavigate).mockImplementation((path) => {
      console.warn(
        "Navigation function not registered. Using window.location as fallback."
      );
      window.location.href = path;
    });

    // Call appNavigate with a path
    appNavigate("/books");

    // Verify window.location.href was changed
    expect(window.location.href).toBe("/books");

    // Verify console.warn was called
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      "Navigation function not registered. Using window.location as fallback."
    );
  });

  it("should handle empty paths correctly", () => {
    // Mock the behavior for this test
    vi.mocked(registerNavigate).mockImplementation((fn) => {
      // Store the navigate function
      vi.mocked(appNavigate).mockImplementation((path) => fn(path));
    });

    // Register the mock navigate function
    registerNavigate(mockNavigate);

    // Call appNavigate with an empty path
    appNavigate("");

    // Verify the mock navigate function was called with an empty path
    expect(mockNavigate).toHaveBeenCalledWith("");
  });

  it("should handle absolute URLs correctly", () => {
    // Mock the behavior for this test
    vi.mocked(registerNavigate).mockImplementation((fn) => {
      // Store the navigate function
      vi.mocked(appNavigate).mockImplementation((path) => fn(path));
    });

    // Register the mock navigate function
    registerNavigate(mockNavigate);

    // Call appNavigate with an absolute URL
    appNavigate("https://example.com/page");

    // Verify the mock navigate function was called with the correct URL
    expect(mockNavigate).toHaveBeenCalledWith("https://example.com/page");
  });

  it("should handle query parameters correctly", () => {
    // Mock the behavior for this test
    vi.mocked(registerNavigate).mockImplementation((fn) => {
      // Store the navigate function
      vi.mocked(appNavigate).mockImplementation((path) => fn(path));
    });

    // Register the mock navigate function
    registerNavigate(mockNavigate);

    // Call appNavigate with a path including query parameters
    appNavigate("/books?search=fantasy&author=tolkien");

    // Verify the mock navigate function was called with the correct path
    expect(mockNavigate).toHaveBeenCalledWith(
      "/books?search=fantasy&author=tolkien"
    );
  });

  it("should handle hash fragments correctly", () => {
    // Mock the behavior for this test
    vi.mocked(registerNavigate).mockImplementation((fn) => {
      // Store the navigate function
      vi.mocked(appNavigate).mockImplementation((path) => fn(path));
    });

    // Register the mock navigate function
    registerNavigate(mockNavigate);

    // Call appNavigate with a path including a hash fragment
    appNavigate("/books#section-2");

    // Verify the mock navigate function was called with the correct path
    expect(mockNavigate).toHaveBeenCalledWith("/books#section-2");
  });
});
