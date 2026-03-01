import appNavigate from '@/lib/navigation';
import {
  AuthenticatedResponse,
  AuthUser,
  LoginRequest,
  MessageResponse,
  SignupRequest,
  UserRole,
} from '@folio/shared';
import api from './api';
import { TokenManager } from './tokenManager';

export type AuthResponse = AuthenticatedResponse;
export type { LoginRequest, SignupRequest };
export { UserRole };

export interface UpdateProfileResponse {
  message: string;
  user: AuthUser;
}

const AuthService = {
  // Login user
  login: async (credentials: LoginRequest): Promise<AuthenticatedResponse> => {
    const response = await api.post<AuthenticatedResponse>(
      '/api/auth/login',
      credentials,
    );
    // Store auth token and user info using TokenManager
    TokenManager.setCredentials(
      response.data.token,
      response.data.user,
      response.data.refreshToken,
    );
    return response.data;
  },

  // Refresh session using refresh token
  refreshSession: async (): Promise<AuthenticatedResponse> => {
    const refreshToken = TokenManager.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await api.post<AuthenticatedResponse>(
      '/api/auth/refresh',
      {
        refreshToken,
      },
    );

    TokenManager.setCredentials(
      response.data.token,
      response.data.user,
      response.data.refreshToken,
    );

    return response.data;
  },

  // Register new user
  signup: async (
    userData: SignupRequest,
  ): Promise<{ message: string; user?: { id: number; email: string } }> => {
    const response = await api.post<{
      message: string;
      user?: { id: number; email: string };
    }>('/api/auth/register', userData);
    // Don't store token or user data since email verification is required
    return response.data;
  },

  // Validate current session with server
  validateSession: async (): Promise<{
    id: number;
    name: string;
    email: string;
    role: string;
    credit_balance?: number;
  } | null> => {
    try {
      const response = await api.get<{
        user: AuthUser;
      }>('/api/auth/me');
      return response.data.user;
    } catch {
      // Session validation failed - token might be invalid or expired
      return null;
    }
  },

  // Request password reset
  requestPasswordReset: async (email: string): Promise<{ message: string }> => {
    const response = await api.post<MessageResponse>(
      '/api/auth/request-password-reset',
      { email },
    );
    return response.data;
  },

  // Reset password with token
  resetPassword: async (
    token: string,
    newPassword: string,
  ): Promise<MessageResponse> => {
    const response = await api.post<MessageResponse>(
      '/api/auth/reset-password',
      {
        token,
        newPassword,
      },
    );
    return response.data;
  },

  // Change password (for authenticated users)
  changePassword: async (
    currentPassword: string,
    newPassword: string,
  ): Promise<MessageResponse> => {
    const response = await api.post<MessageResponse>(
      '/api/auth/change-password',
      {
        currentPassword,
        newPassword,
      },
    );
    return response.data;
  },

  // Verify email address
  verifyEmail: async (token: string): Promise<MessageResponse> => {
    const response = await api.get<MessageResponse>(
      `/api/auth/verify-email/${token}`,
    );
    return response.data;
  },

  // Resend email verification
  resendVerification: async (email: string): Promise<MessageResponse> => {
    const response = await api.post<MessageResponse>(
      '/api/auth/resend-verification',
      { email },
    );
    return response.data;
  },

  // Update user profile
  updateProfile: async (name: string): Promise<UpdateProfileResponse> => {
    const response = await api.put<UpdateProfileResponse>(
      '/api/auth/update-profile',
      { name },
    );

    // Update the user using TokenManager
    if (response.data.user) {
      TokenManager.setUser(response.data.user);
    }

    return response.data;
  },

  // Delete user account
  deleteAccount: async (password: string): Promise<MessageResponse> => {
    const response = await api.delete<MessageResponse>(
      '/api/auth/delete-account',
      {
        data: { password },
      },
    );

    // Clean up credentials on successful deletion
    TokenManager.clearCredentials();

    return response.data;
  },

  // Logout user
  logout: async (): Promise<void> => {
    const refreshToken = TokenManager.getRefreshToken();

    try {
      if (refreshToken) {
        await api.post('/api/auth/logout', { refreshToken });
      } else {
        await api.post('/api/auth/logout');
      }
    } catch {
    } finally {
      TokenManager.clearCredentials();
      // Dispatch logout event for listeners
      window.dispatchEvent(new CustomEvent('auth:logout'));
      // Redirect to home page using navigation utility
      appNavigate('/');
    }
  },

  // Check if user is logged in
  isAuthenticated: (): boolean => {
    return TokenManager.isAuthenticated();
  },

  // Get current user
  getCurrentUser: (): {
    id: number;
    name: string;
    email: string;
    role: string;
    credit_balance?: number;
  } | null => {
    return TokenManager.getUser();
  },

  // Check if current user has a specific role
  hasRole: (role: UserRole): boolean => {
    return TokenManager.hasRole(role);
  },

  // Check if current user is admin
  isAdmin: (): boolean => {
    return TokenManager.hasRole(UserRole.ADMIN);
  },
};

export default AuthService;
