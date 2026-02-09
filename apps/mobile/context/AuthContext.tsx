/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { createContext, ReactNode, useEffect, useState } from 'react';

import { router } from 'expo-router';

import {
  authService,
  LoginData,
  ResetPasswordData,
  ResetPasswordRequestData,
  SignupData,
  User,
} from '../services/auth';
import { getToken, getUser, removeToken, removeUser, setUser } from '../utils/storage';

const debugLog = (...args: unknown[]) => {
  if (__DEV__) console.log(...args);
};

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  signup: (data: SignupData) => Promise<boolean>;
  login: (data: LoginData) => Promise<boolean>;
  logout: () => Promise<void>;
  requestPasswordReset: (data: ResetPasswordRequestData) => Promise<boolean>;
  resetPassword: (data: ResetPasswordData) => Promise<boolean>;
  clearError: () => void;
  verifyEmail: (token: string) => Promise<boolean>;
  resendVerification: (email: string) => Promise<boolean>;
  navigateAfterAuth: (route: string) => void;
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  isLoading: false,
  error: null,
  signup: async () => false,
  login: async () => false,
  logout: async () => {},
  requestPasswordReset: async () => false,
  resetPassword: async () => false,
  clearError: () => {},
  verifyEmail: async () => false,
  resendVerification: async () => false,
  navigateAfterAuth: () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [initialCheckDone, setInitialCheckDone] = useState<boolean>(false);

  // Format error message from API or exception
  const formatErrorMessage = (err: any): string => {
    debugLog('Formatting error:', err);

    if (typeof err === 'string') return err;

    // Handle Axios error response
    if (err.response?.data) {
      if (typeof err.response.data === 'string') return err.response.data;
      if (err.response.data.message) return err.response.data.message;
      if (err.response.data.error) return err.response.data.error;
    }

    // Handle network errors
    if (err.message && err.message.includes('Network Error')) {
      return 'Network error. Please check your internet connection and verify the API server is running.';
    }

    return err.message || 'An unexpected error occurred';
  };

  // Load user on app start
  useEffect(() => {
    const loadUser = async () => {
      try {
        debugLog('AuthContext: Loading user session...');
        const token = await getToken();

        if (!token) {
          debugLog('AuthContext: No token found');
          setIsLoading(false);
          setInitialCheckDone(true);
          return;
        }

        debugLog('AuthContext: Token found, getting stored user');
        // Try to get user from local storage first for faster loading
        const storedUser = await getUser();

        // Verify with the server before setting authenticated
        try {
          debugLog('AuthContext: Verifying user with server');
          const currentUser = await authService.getCurrentUser();
          if (currentUser) {
            debugLog('AuthContext: Server verification successful');
            setUserState(currentUser);
            setUser(currentUser);
            setIsAuthenticated(true);
          } else {
            // Token is invalid or expired
            debugLog('AuthContext: Server returned no user, clearing session');
            setUserState(null);
            setIsAuthenticated(false);
            await removeToken();
            await removeUser();
          }
        } catch (err) {
          // Handle server verification error (network issues, timeout, etc.)
          if (__DEV__) console.error('AuthContext: Error verifying user with server:', err);
          if (storedUser) {
            // Server unreachable but we have stored data — use it optimistically
            const parsedUser: User = JSON.parse(storedUser);
            debugLog('AuthContext: Using stored user (server unreachable)');
            setUserState(parsedUser);
            setIsAuthenticated(true);
          } else {
            debugLog('AuthContext: No stored user available, logging out');
            setUserState(null);
            setIsAuthenticated(false);
            await removeUser();
          }
        }
      } catch (err) {
        if (__DEV__) console.error('AuthContext: Error loading user:', err);
        setUserState(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
        setInitialCheckDone(true);
      }
    };

    loadUser();
  }, []);

  // Safely navigate after auth operations
  const navigateAfterAuth = (
    route: '/(tabs)' | '/login' | '/verify-email' | '/(auth)/forgot-password' | string
  ) => {
    // Ensure we don't navigate during rendering
    debugLog(`AuthContext: Navigating to ${route}`);
    setTimeout(() => {
      router.replace(route as any); // Cast to 'any' if necessary for dynamic routes
    }, 0);
  };

  const signup = async (data: SignupData): Promise<boolean> => {
    try {
      setError(null);
      setIsLoading(true);
      debugLog('AuthContext: Starting signup process');
      await authService.signup(data);
      debugLog('AuthContext: Signup successful');
      setIsLoading(false);
      return true;
    } catch (err: any) {
      if (__DEV__) console.error('AuthContext: Signup error:', err);
      setError(formatErrorMessage(err));
      setIsLoading(false);
      return false;
    }
  };

  const login = async (data: LoginData): Promise<boolean> => {
    try {
      setError(null);
      setIsLoading(true);
      debugLog('AuthContext: Starting login process');
      const response = await authService.login(data);

      if (response.needsVerification) {
        debugLog('AuthContext: User needs email verification');
        setIsLoading(false);
        navigateAfterAuth('/verify-email');
        return true;
      }

      if (response.user && response.token) {
        debugLog('AuthContext: Login successful with user and token');
        setUserState(response.user);
        await setUser(response.user);
        setIsAuthenticated(true);
        setIsLoading(false);
        navigateAfterAuth('/(tabs)');
        return true;
      }

      debugLog('AuthContext: Login response missing user or token');
      setIsLoading(false);
      return false;
    } catch (err: any) {
      if (__DEV__) console.error('AuthContext: Login error:', err);
      setError(formatErrorMessage(err));
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await authService.logout();
      setIsAuthenticated(false);
      setUserState(null);
      await removeUser();
      navigateAfterAuth('/login');
      setIsLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred during logout');
      setIsLoading(false);
    }
  };

  const requestPasswordReset = async (data: ResetPasswordRequestData): Promise<boolean> => {
    try {
      setError(null);
      setIsLoading(true);
      await authService.requestPasswordReset(data);
      setIsLoading(false);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred requesting password reset');
      setIsLoading(false);
      return false;
    }
  };

  const resetPassword = async (data: ResetPasswordData): Promise<boolean> => {
    try {
      setError(null);
      setIsLoading(true);
      await authService.resetPassword(data);
      setIsLoading(false);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred resetting password');
      setIsLoading(false);
      return false;
    }
  };

  const verifyEmail = async (token: string): Promise<boolean> => {
    try {
      setError(null);
      setIsLoading(true);
      await authService.verifyEmail(token);
      setIsLoading(false);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred verifying email');
      setIsLoading(false);
      return false;
    }
  };

  const resendVerification = async (email: string): Promise<boolean> => {
    try {
      setError(null);
      setIsLoading(true);
      await authService.resendVerification(email);
      setIsLoading(false);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred resending verification email');
      setIsLoading(false);
      return false;
    }
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        isLoading,
        error,
        signup,
        login,
        logout,
        requestPasswordReset,
        resetPassword,
        clearError,
        verifyEmail,
        resendVerification,
        navigateAfterAuth,
      }}>
      {children}
    </AuthContext.Provider>
  );
};
