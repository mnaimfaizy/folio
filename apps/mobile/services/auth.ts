/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AuthResponse,
  AuthUser,
  LoginRequest,
  MessageResponse,
  SignupRequest,
} from '@folio/shared';
import { removeToken, setToken } from '../utils/storage';

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
    const response = await api.post<AuthResponse>('/auth/resend-verification', {
      email,
    });
    return response.data;
  },
};
