import {
  AuthResponse,
  AuthUser,
  LoginRequest,
  MessageResponse,
  SignupRequest,
} from '@folio/shared';
import {
  AxiosError,
  getRefreshToken,
  removeRefreshToken,
  removeToken,
  setRefreshToken,
  setToken,
} from '../utils/storage';

import api from './api';

export type SignupData = SignupRequest;
export type LoginData = LoginRequest;
export type User = AuthUser;

export interface ResetPasswordRequestData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  newPassword: string;
}

interface ApiErrorPayload {
  message?: string;
}

// Helper function to handle API errors
const handleApiError = (error: unknown, operation: string) => {
  const axiosError = error as AxiosError<ApiErrorPayload>;
  if (__DEV__) {
    console.log(`Auth error (${operation}):`, axiosError.response?.status);
  }
  throw error;
};

export const authService = {
  /**
   * Register a new user
   */
  async signup(userData: SignupRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/register', userData);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'signup');
    }
  },

  /**
   * Login a user
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials);

      if (response.data.token) {
        await setToken(response.data.token);
      }

      if (response.data.refreshToken) {
        await setRefreshToken(response.data.refreshToken);
      }

      return response.data;
    } catch (error) {
      return handleApiError(error, 'login');
    }
  },

  /**
   * Logout the current user
   */
  async logout(): Promise<void> {
    const refreshToken = await getRefreshToken();

    try {
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      } else {
        await api.post('/auth/logout');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await removeToken();
      await removeRefreshToken();
    }
  },

  /**
   * Refresh session using refresh token
   */
  async refreshSession(): Promise<AuthResponse> {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await api.post<AuthResponse>('/auth/refresh', {
      refreshToken,
    });

    if (response.data.token) {
      await setToken(response.data.token);
    }

    if (response.data.refreshToken) {
      await setRefreshToken(response.data.refreshToken);
    }

    return response.data;
  },

  /**
   * Request password reset email
   */
  async requestPasswordReset(
    data: ResetPasswordRequestData,
  ): Promise<MessageResponse> {
    const response = await api.post<MessageResponse>(
      '/auth/request-password-reset',
      data,
    );
    return response.data;
  },

  /**
   * Reset password with token
   */
  async resetPassword(data: ResetPasswordData): Promise<MessageResponse> {
    const response = await api.post<MessageResponse>(
      '/auth/reset-password',
      data,
    );
    return response.data;
  },

  /**
   * Get current user information
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const response = await api.get<{ user: AuthUser }>('/auth/me');
      return response.data.user;
    } catch {
      return null;
    }
  },

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<AuthResponse> {
    const response = await api.get<AuthResponse>(`/auth/verify-email/${token}`);
    return response.data;
  },

  /**
   * Resend verification email
   */
  async resendVerification(email: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/resend-verification', {
      email,
    });
    return response.data;
  },
};
