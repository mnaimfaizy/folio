// Global test setup for Vitest
import "@testing-library/jest-dom";
import { vi } from "vitest";

// Set up common mocks that multiple tests might need
vi.mock("@/lib/navigation", () => ({
  default: vi.fn(),
  appNavigate: vi.fn(),
  registerNavigate: vi.fn(),
}));

// Mock axios to prevent actual network requests
vi.mock("axios", () => {
  return {
    default: {
      create: vi.fn(() => ({
        interceptors: {
          request: { use: vi.fn(), eject: vi.fn() },
          response: { use: vi.fn(), eject: vi.fn() },
        },
        get: vi.fn().mockResolvedValue({ data: {} }),
        post: vi.fn().mockResolvedValue({ data: {} }),
        put: vi.fn().mockResolvedValue({ data: {} }),
        delete: vi.fn().mockResolvedValue({ data: {} }),
      })),
      interceptors: {
        request: { use: vi.fn(), eject: vi.fn() },
        response: { use: vi.fn(), eject: vi.fn() },
      },
      get: vi.fn().mockResolvedValue({ data: {} }),
      post: vi.fn().mockResolvedValue({ data: {} }),
      put: vi.fn().mockResolvedValue({ data: {} }),
      delete: vi.fn().mockResolvedValue({ data: {} }),
    },
  };
});

// Mock Redux auth slice
vi.mock("@/store/slices/authSlice", async () => {
  const actual = await vi.importActual("@/store/slices/authSlice");
  return {
    ...actual,
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
    default: actual.default || vi.fn(),
  };
});

// Mock for ResizeObserver which is not available in test environment
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Add to global
global.ResizeObserver = MockResizeObserver;

// Mock for matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Fix for navigation tests
Object.defineProperty(window, "location", {
  writable: true,
  value: {
    href: "http://localhost/",
    assign: vi.fn(),
    replace: vi.fn(),
    pathname: "/",
    origin: "http://localhost",
  },
});
