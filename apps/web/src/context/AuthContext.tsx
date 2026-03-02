import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService, {
  LoginRequest,
  SignupRequest,
} from '@/services/authService';
import { TokenManager } from '@/services/tokenManager';

// User type definition
export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  credit_balance?: number;
}

// Auth state interface
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
}

// Auth context value interface
export interface AuthContextValue extends AuthState {
  login: (
    credentials: LoginRequest,
  ) => Promise<{ success: boolean; error?: string }>;
  signup: (userData: SignupRequest) => Promise<{
    success: boolean;
    requiresVerification?: boolean;
    error?: string;
  }>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
  updateUser: (user: User) => void;
  clearError: () => void;
  checkAuth: () => Promise<boolean>;
}

// Create auth context with undefined default
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Auth provider props
interface AuthProviderProps {
  children: React.ReactNode;
}

// Session check interval (5 minutes)
const SESSION_CHECK_INTERVAL = 5 * 60 * 1000;

// Token refresh threshold (5 minutes before expiry)
const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000;

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    isInitialized: false,
    error: null,
  });

  const navigate = useNavigate();

  // Initialize auth state from stored credentials
  const initializeAuth = useCallback(async () => {
    try {
      const token = TokenManager.getToken();
      const storedUser = TokenManager.getUser();

      if (!token || !storedUser) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          isInitialized: true,
        }));
        return;
      }

      // Check if token is expired
      if (TokenManager.isTokenExpired()) {
        try {
          const refreshedSession = await AuthService.refreshSession();
          setState((prev) => ({
            ...prev,
            user: refreshedSession.user,
            isAuthenticated: true,
            isLoading: false,
            isInitialized: true,
          }));
          return;
        } catch {
          console.warn('Token expired and refresh failed, clearing session');
          TokenManager.clearCredentials();
          setState((prev) => ({
            ...prev,
            user: null,
            isAuthenticated: false,
            isLoading: false,
            isInitialized: true,
          }));
          return;
        }
      }

      // Validate token with server (optional - can be disabled for offline support)
      try {
        const currentUser = await AuthService.validateSession();
        if (currentUser) {
          TokenManager.setUser(currentUser);
          setState((prev) => ({
            ...prev,
            user: currentUser,
            isAuthenticated: true,
            isLoading: false,
            isInitialized: true,
          }));
        } else {
          // Server invalidated the session
          TokenManager.clearCredentials();
          setState((prev) => ({
            ...prev,
            user: null,
            isAuthenticated: false,
            isLoading: false,
            isInitialized: true,
          }));
        }
      } catch {
        // If server validation fails, use stored user (offline support)
        console.warn('Session validation failed, using stored credentials');
        setState((prev) => ({
          ...prev,
          user: storedUser,
          isAuthenticated: true,
          isLoading: false,
          isInitialized: true,
        }));
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      TokenManager.clearCredentials();
      setState((prev) => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
        error: 'Failed to initialize authentication',
      }));
    }
  }, []);

  // Login handler
  const login = useCallback(
    async (
      credentials: LoginRequest,
    ): Promise<{ success: boolean; error?: string }> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await AuthService.login(credentials);

        setState((prev) => ({
          ...prev,
          user: response.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        }));

        return { success: true };
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : (error as { response?: { data?: { message?: string } } })
                ?.response?.data?.message ||
              'Login failed. Please check your credentials.';

        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));

        return { success: false, error: errorMessage };
      }
    },
    [],
  );

  // Signup handler
  const signup = useCallback(
    async (
      userData: SignupRequest,
    ): Promise<{
      success: boolean;
      requiresVerification?: boolean;
      error?: string;
    }> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        await AuthService.signup(userData);

        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: null,
        }));

        return { success: true, requiresVerification: true };
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : (error as { response?: { data?: { message?: string } } })
                ?.response?.data?.message || 'Signup failed. Please try again.';

        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));

        return { success: false, error: errorMessage };
      }
    },
    [],
  );

  // Logout handler
  const logout = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      await AuthService.logout();
    } finally {
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
        error: null,
      });
      navigate('/');
    }
  }, [navigate]);

  // Refresh session (for token refresh scenarios)
  const refreshSession = useCallback(async (): Promise<boolean> => {
    try {
      const token = TokenManager.getToken();
      if (!token) {
        return false;
      }

      // Check if token needs refresh
      if (TokenManager.shouldRefreshToken(TOKEN_REFRESH_THRESHOLD)) {
        const refreshedSession = await AuthService.refreshSession();
        if (refreshedSession?.user) {
          setState((prev) => ({
            ...prev,
            user: refreshedSession.user,
            isAuthenticated: true,
          }));
          return true;
        }
        return false;
      }

      return true;
    } catch {
      console.error('Session refresh failed');
      return false;
    }
  }, []);

  // Update user (for profile updates)
  const updateUser = useCallback((user: User) => {
    TokenManager.setUser(user);
    setState((prev) => ({ ...prev, user }));
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // Check authentication status
  const checkAuth = useCallback(async (): Promise<boolean> => {
    const token = TokenManager.getToken();
    if (!token || TokenManager.isTokenExpired()) {
      return false;
    }

    try {
      const currentUser = await AuthService.validateSession();
      return !!currentUser;
    } catch {
      return false;
    }
  }, []);

  // Initialize auth on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Periodic session validation
  useEffect(() => {
    if (!state.isAuthenticated) {
      return;
    }

    const intervalId = setInterval(async () => {
      const isValid = await refreshSession();
      if (!isValid) {
        console.warn('Session expired, logging out');
        logout();
      }
    }, SESSION_CHECK_INTERVAL);

    return () => clearInterval(intervalId);
  }, [state.isAuthenticated, refreshSession, logout]);

  // Listen for storage events (for multi-tab sync)
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'auth_token' || event.key === 'auth_refresh_token') {
        if (!event.newValue) {
          // Token was removed (logged out in another tab)
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            isInitialized: true,
            error: null,
          });
        } else if (event.newValue && !state.isAuthenticated) {
          // Token was added (logged in in another tab)
          initializeAuth();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [state.isAuthenticated, initializeAuth]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo<AuthContextValue>(
    () => ({
      ...state,
      login,
      signup,
      logout,
      refreshSession,
      updateUser,
      clearError,
      checkAuth,
    }),
    [
      state,
      login,
      signup,
      logout,
      refreshSession,
      updateUser,
      clearError,
      checkAuth,
    ],
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// HOC for class components (if needed)
export function withAuth<P extends object>(
  Component: React.ComponentType<P & AuthContextValue>,
): React.FC<P> {
  return function WithAuthComponent(props: P) {
    const auth = useAuth();
    return <Component {...props} {...auth} />;
  };
}

export default AuthContext;
