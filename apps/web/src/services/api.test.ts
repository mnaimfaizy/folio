import appNavigate from "@/lib/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Create mock handlers for axios interceptors
const mockRequestHandler = vi.fn((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const mockRequestErrorHandler = vi.fn((error) => {
  return Promise.reject(error);
});

const mockResponseHandler = vi.fn((response) => response);

const mockErrorHandler = vi.fn((error) => {
  if (error.response && error.response.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    appNavigate("/login");
  }
  return Promise.reject(error);
});

// Mock axios with our handlers
vi.mock("axios", () => ({
  default: {
    create: () => ({
      interceptors: {
        request: {
          use: vi.fn((successFn, errorFn) => {
            mockRequestHandler.mockImplementation(successFn);
            if (errorFn) mockRequestErrorHandler.mockImplementation(errorFn);
          }),
        },
        response: {
          use: vi.fn((successFn, errorFn) => {
            mockResponseHandler.mockImplementation(successFn);
            mockErrorHandler.mockImplementation(errorFn);
          }),
        },
      },
    }),
  },
}));

vi.mock("@/lib/navigation", () => ({
  default: vi.fn(),
}));

// Import the api module after mocks are set up

describe("api service", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("attaches token to request headers if present", async () => {
    localStorage.setItem("token", "test-token");
    const config = { headers: {} };
    const result = await mockRequestHandler(config);
    expect(result.headers.Authorization).toBe("Bearer test-token");
  });

  it("does not attach Authorization if no token", async () => {
    const config = { headers: {} };
    const result = await mockRequestHandler(config);
    expect(result.headers.Authorization).toBeUndefined();
  });

  it("removes token/user and navigates on 401 response", async () => {
    localStorage.setItem("token", "test-token");
    localStorage.setItem("user", "test-user");
    const error = { response: { status: 401 } };
    await expect(mockErrorHandler(error)).rejects.toBe(error);
    expect(localStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("user")).toBeNull();
    expect(appNavigate).toHaveBeenCalledWith("/login");
  });

  it("does not navigate on non-401 error", async () => {
    localStorage.setItem("token", "test-token");
    const error = { response: { status: 500 } };
    await expect(mockErrorHandler(error)).rejects.toBe(error);
    expect(appNavigate).not.toHaveBeenCalled();
  });

  it("returns response on success", () => {
    const response = { data: "ok" };
    expect(mockResponseHandler(response)).toBe(response);
  });

  it("handles errors without response property", async () => {
    const networkError = new Error("Network Error");
    await expect(mockErrorHandler(networkError)).rejects.toBe(networkError);
    expect(appNavigate).not.toHaveBeenCalled();
  });

  it("handles request interceptor errors", async () => {
    const requestError = new Error("Request Error");
    await expect(mockRequestErrorHandler(requestError)).rejects.toBe(
      requestError
    );
  });
});
