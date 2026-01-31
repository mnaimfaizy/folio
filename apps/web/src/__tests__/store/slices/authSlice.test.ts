import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import authReducer, {
  AuthState,
  deleteAccount,
  loginUser,
  logoutUser,
  resetAuthError,
  setVerificationRequired,
  signupUser,
  updateProfile,
  verifyEmail,
} from "../../../store/slices/authSlice";

// Mock the AuthService
vi.mock("../../../services/authService", () => ({
  default: {
    getCurrentUser: vi.fn(),
    login: vi.fn(),
    signup: vi.fn(),
    logout: vi.fn(),
    verifyEmail: vi.fn(),
    changePassword: vi.fn(),
    updateProfile: vi.fn(),
    deleteAccount: vi.fn(),
  },
}));

describe("Auth Slice", () => {
  // Mock localStorage
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
    };
  })();

  // Save original localStorage and replace with mock
  const originalLocalStorage = global.localStorage;

  beforeEach(() => {
    vi.clearAllMocks();
    // Replace localStorage with mock implementation
    global.localStorage = localStorageMock as unknown as Storage;
    localStorageMock.clear();
  });

  afterAll(() => {
    // Restore original localStorage
    global.localStorage = originalLocalStorage;
  });

  const initialState: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    emailVerified: true,
    verificationRequired: false,
  };

  describe("Reducers", () => {
    it("should handle resetAuthError", () => {
      const stateWithError = { ...initialState, error: "Some error" };
      const newState = authReducer(stateWithError, resetAuthError());
      expect(newState.error).toBeNull();
    });

    it("should handle setVerificationRequired", () => {
      const newState = authReducer(initialState, setVerificationRequired(true));
      expect(newState.verificationRequired).toBe(true);
    });
  });

  describe("Thunks", () => {
    it("should handle loginUser.pending", () => {
      const action = { type: loginUser.pending.type };
      const state = authReducer(initialState, action);
      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it("should handle loginUser.fulfilled", () => {
      const user = {
        id: 1,
        name: "Test User",
        email: "test@example.com",
        role: "USER",
      };
      const token = "test-token";
      const action = {
        type: loginUser.fulfilled.type,
        payload: { user, token },
      };
      const state = authReducer(initialState, action);
      expect(state.isLoading).toBe(false);
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(user);
      expect(state.token).toBe(token);
    });

    it("should handle loginUser.rejected", () => {
      const action = {
        type: loginUser.rejected.type,
        payload: "Invalid credentials",
      };
      const state = authReducer(initialState, action);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe("Invalid credentials");
      expect(state.isAuthenticated).toBe(false);
    });

    it("should handle signupUser.pending", () => {
      const action = { type: signupUser.pending.type };
      const state = authReducer(initialState, action);
      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it("should handle signupUser.fulfilled", () => {
      const action = { type: signupUser.fulfilled.type };
      const state = authReducer(initialState, action);
      expect(state.isLoading).toBe(false);
      expect(state.verificationRequired).toBe(true);
      expect(state.isAuthenticated).toBe(false);
    });

    it("should handle signupUser.rejected", () => {
      const action = {
        type: signupUser.rejected.type,
        payload: "Email already in use",
      };
      const state = authReducer(initialState, action);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe("Email already in use");
    });

    it("should handle logoutUser.fulfilled", () => {
      const initialStateWithUser = {
        ...initialState,
        user: {
          id: 1,
          name: "Test User",
          email: "test@example.com",
          role: "USER",
        },
        token: "test-token",
        isAuthenticated: true,
      };
      const action = { type: logoutUser.fulfilled.type };
      const state = authReducer(initialStateWithUser, action);
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });

    it("should handle verifyEmail.pending", () => {
      const action = { type: verifyEmail.pending.type };
      const state = authReducer(initialState, action);
      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it("should handle verifyEmail.fulfilled", () => {
      const stateWithVerification = {
        ...initialState,
        emailVerified: false,
        verificationRequired: true,
      };
      const action = { type: verifyEmail.fulfilled.type };
      const state = authReducer(stateWithVerification, action);
      expect(state.isLoading).toBe(false);
      expect(state.emailVerified).toBe(true);
      expect(state.verificationRequired).toBe(false);
    });

    it("should handle verifyEmail.rejected", () => {
      const action = {
        type: verifyEmail.rejected.type,
        payload: "Invalid verification token",
      };
      const state = authReducer(initialState, action);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe("Invalid verification token");
    });

    it("should handle updateProfile.fulfilled", () => {
      const initialStateWithUser = {
        ...initialState,
        user: {
          id: 1,
          name: "Old Name",
          email: "test@example.com",
          role: "USER",
        },
      };
      const updatedUser = {
        id: 1,
        name: "New Name",
        email: "test@example.com",
        role: "USER",
      };
      const action = {
        type: updateProfile.fulfilled.type,
        payload: { user: updatedUser },
      };
      const state = authReducer(initialStateWithUser, action);
      expect(state.isLoading).toBe(false);
      expect(state.user).toEqual(updatedUser);
    });

    it("should handle deleteAccount.fulfilled", () => {
      const initialStateWithUser = {
        ...initialState,
        user: {
          id: 1,
          name: "Test User",
          email: "test@example.com",
          role: "USER",
        },
        token: "test-token",
        isAuthenticated: true,
        isLoading: true,
      };
      const action = { type: deleteAccount.fulfilled.type };
      const state = authReducer(initialStateWithUser, action);
      expect(state.isLoading).toBe(false);
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });
});
