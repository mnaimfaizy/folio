import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { User } from "./adminService";
import AuthService, { LoginRequest, SignupRequest } from "./authService";
import { useAuth } from "./useAuth";

// Mock the default export of authService
vi.mock("./authService", () => ({
  default: {
    isAuthenticated: vi.fn(),
    getCurrentUser: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    signup: vi.fn(),
  },
}));

const mockedUser = {
  id: 1,
  name: "A",
  email: "a@example.com",
  role: "user",
  email_verified: true,
} as User;

describe("useAuth hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("returns initial auth state from AuthService", () => {
    // Setup mocks for this test
    AuthService.isAuthenticated = vi.fn(() => true);
    AuthService.getCurrentUser = vi.fn(() => mockedUser);

    const { result } = renderHook(() => useAuth());
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual({
      id: 1,
      name: "A",
      email: "a@example.com",
      role: "user",
      email_verified: true,
    });
  });

  it("updates state on storage event", () => {
    // Setup sequence of mock returns
    AuthService.isAuthenticated = vi
      .fn()
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);
    AuthService.getCurrentUser = vi
      .fn()
      .mockReturnValueOnce(null)
      .mockReturnValueOnce({ id: 2, name: "B" });

    const { result } = renderHook(() => useAuth());
    act(() => {
      window.dispatchEvent(new StorageEvent("storage"));
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual({ id: 2, name: "B" });
  });

  it("exposes login, logout, signup from AuthService", () => {
    const { result } = renderHook(() => useAuth());

    // Check that the methods are from AuthService (not checking exact reference equality)
    expect(typeof result.current.login).toBe("function");
    expect(typeof result.current.logout).toBe("function");
    expect(typeof result.current.signup).toBe("function");

    // Call the methods and verify original services were called
    result.current.login({
      email: "a@example.com",
      password: "pass",
    } as LoginRequest);
    expect(AuthService.login).toHaveBeenCalledWith({
      email: "a@example.com",
      password: "pass",
    });

    result.current.logout();
    expect(AuthService.logout).toHaveBeenCalled();

    result.current.signup({
      name: "A",
      email: "a@example.com",
      password: "pass",
    } as SignupRequest);
    expect(AuthService.signup).toHaveBeenCalledWith({
      name: "A",
      email: "a@example.com",
      password: "pass",
    });
  });
});
