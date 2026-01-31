import { describe, expect, it } from "vitest";
import { RootState, store } from "../../store";

describe("Redux Store", () => {
  it("should have the expected initial state", () => {
    const state = store.getState();

    // Check that auth slice is present with expected structure
    expect(state).toHaveProperty("auth");
    expect(state.auth).toEqual({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      emailVerified: true,
      verificationRequired: false,
    });
  });

  it("should have the correct type definitions", () => {
    // This test is mostly for TypeScript to verify types are correct
    const state: RootState = store.getState();

    // Just check that we can access the auth properties without type errors
    const { user, token, isAuthenticated, isLoading, error } = state.auth;

    expect(user).toBeNull();
    expect(token).toBeNull();
    expect(isAuthenticated).toBe(false);
    expect(isLoading).toBe(false);
    expect(error).toBeNull();
  });

  it("should handle dispatch without errors", () => {
    // Create a mock action
    const mockAction = { type: "TEST_ACTION" };

    // Ensure dispatching doesn't throw errors
    expect(() => {
      store.dispatch(mockAction);
    }).not.toThrow();
  });
});
