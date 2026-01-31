/* eslint-disable @typescript-eslint/no-explicit-any */
import appNavigate from "@/lib/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "./api";
import AuthService from "./authService";

vi.mock("./api");
vi.mock("@/lib/navigation", () => ({ default: vi.fn() }));
const mockApi = api as unknown as Record<string, any>;

describe("AuthService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("login stores token and user", async () => {
    mockApi.post = vi.fn().mockResolvedValue({
      data: {
        token: "tok",
        user: { id: 1, name: "A", email: "a@a.com", role: "USER" },
      },
    });
    const res = await AuthService.login({ email: "a@a.com", password: "pw" });
    expect(localStorage.getItem("token")).toBe("tok");
    expect(JSON.parse(localStorage.getItem("user")!)).toEqual({
      id: 1,
      name: "A",
      email: "a@a.com",
      role: "USER",
    });
    expect(res).toEqual({
      token: "tok",
      user: { id: 1, name: "A", email: "a@a.com", role: "USER" },
    });
  });

  it("signup returns message and user", async () => {
    mockApi.post = vi.fn().mockResolvedValue({
      data: { message: "ok", user: { id: 2, email: "b@b.com" } },
    });
    const res = await AuthService.signup({
      name: "B",
      email: "b@b.com",
      password: "pw",
    });
    expect(res).toEqual({ message: "ok", user: { id: 2, email: "b@b.com" } });
  });

  it("requestPasswordReset returns message", async () => {
    mockApi.post = vi.fn().mockResolvedValue({ data: { message: "sent" } });
    const res = await AuthService.requestPasswordReset("a@a.com");
    expect(res).toEqual({ message: "sent" });
  });

  it("resetPassword returns message", async () => {
    mockApi.post = vi.fn().mockResolvedValue({ data: { message: "reset" } });
    const res = await AuthService.resetPassword("token", "newpw");
    expect(res).toEqual({ message: "reset" });
  });

  it("changePassword returns message", async () => {
    mockApi.post = vi.fn().mockResolvedValue({ data: { message: "changed" } });
    const res = await AuthService.changePassword("old", "new");
    expect(res).toEqual({ message: "changed" });
  });

  it("verifyEmail returns message", async () => {
    mockApi.get = vi.fn().mockResolvedValue({ data: { message: "verified" } });
    const res = await AuthService.verifyEmail("tok");
    expect(res).toEqual({ message: "verified" });
  });

  it("resendVerification returns message", async () => {
    mockApi.post = vi.fn().mockResolvedValue({ data: { message: "resent" } });
    const res = await AuthService.resendVerification("a@a.com");
    expect(res).toEqual({ message: "resent" });
  });

  it("updateProfile updates localStorage and returns data", async () => {
    mockApi.put = vi.fn().mockResolvedValue({
      data: {
        message: "updated",
        user: { id: 1, name: "A", email: "a@a.com", role: "USER" },
      },
    });
    const res = await AuthService.updateProfile("A");
    expect(JSON.parse(localStorage.getItem("user")!)).toEqual({
      id: 1,
      name: "A",
      email: "a@a.com",
      role: "USER",
    });
    expect(res).toEqual({
      message: "updated",
      user: { id: 1, name: "A", email: "a@a.com", role: "USER" },
    });
  });

  it("deleteAccount removes token/user and returns message", async () => {
    localStorage.setItem("token", "tok");
    localStorage.setItem("user", JSON.stringify({ id: 1 }));
    mockApi.delete = vi
      .fn()
      .mockResolvedValue({ data: { message: "deleted" } });
    const res = await AuthService.deleteAccount("pw");
    expect(localStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("user")).toBeNull();
    expect(res).toEqual({ message: "deleted" });
  });

  it("logout removes token/user and navigates", () => {
    localStorage.setItem("token", "tok");
    localStorage.setItem("user", JSON.stringify({ id: 1 }));
    AuthService.logout();
    expect(localStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("user")).toBeNull();
    expect(appNavigate).toHaveBeenCalledWith("/");
  });

  it("isAuthenticated returns true if token exists", () => {
    localStorage.setItem("token", "tok");
    expect(AuthService.isAuthenticated()).toBe(true);
  });

  it("isAuthenticated returns false if no token", () => {
    expect(AuthService.isAuthenticated()).toBe(false);
  });

  it("getCurrentUser returns user if present", () => {
    localStorage.setItem("user", JSON.stringify({ id: 1, name: "A" }));
    expect(AuthService.getCurrentUser()).toEqual({ id: 1, name: "A" });
  });

  it("getCurrentUser returns null if not present", () => {
    expect(AuthService.getCurrentUser()).toBeNull();
  });
});
