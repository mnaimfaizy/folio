/* eslint-disable @typescript-eslint/no-explicit-any */
import { removeToken, setToken } from '../utils/storage';

import api from './api';

export interface SignupData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface ResetPasswordRequestData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  newPassword: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  email_verified: boolean;
}

export interface AuthResponse {
  message: string;
  token?: string;
  user?: User;
  userId?: number;
  resetToken?: string;
  needsVerification?: boolean;
}

// Helper function to handle API errors
const handleApiError = (error: any, operation: string) => {
  if (__DEV__) {
    console.log(`Auth error (${operation}):`, error?.response?.status);
  }
  throw error;
};

export const authService = {
  /**
   * Register a new user
   */
  async signup(userData: SignupData): Promise<AuthResponse> {
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
  async login(credentials: LoginData): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials);

      if (response.data.token) {
        await setToken(response.data.token);
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
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await removeToken();
    }
  },

  /**
   * Request password reset email
   */
  async requestPasswordReset(data: ResetPasswordRequestData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/request-password-reset', data);
    return response.data;
  },

  /**
   * Reset password with token
   */
  async resetPassword(data: ResetPasswordData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/reset-password', data);
    return response.data;
  },

  /**
   * Get current user information
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await api.get<{ user: User }>('/auth/me');
      return response.data.user;
    } catch (error) {
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
    const response = await api.post<AuthResponse>('/auth/resend-verification', { email });
    return response.data;
  },
};
