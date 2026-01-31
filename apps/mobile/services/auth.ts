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

// Helper function to better handle and log API errors
const handleApiError = (error: any, operation: string) => {
  console.error(`Auth error (${operation}):`, error);

  // Log specific response data if available
  if (error.response) {
    console.error(`Status: ${error.response.status}`);
    console.error(`Response data:`, error.response.data);
  }

  throw error;
};

export const authService = {
  /**
   * Register a new user
   */
  async signup(userData: SignupData): Promise<AuthResponse> {
    try {
      console.warn('Signup request:', JSON.stringify(userData, null, 2));
      const response = await api.post<AuthResponse>('/auth/register', userData);
      console.warn('Signup response:', JSON.stringify(response.data, null, 2));
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
      console.warn('Login request:', JSON.stringify({ email: credentials.email }, null, 2));
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      console.warn('Login response:', JSON.stringify(response.data, null, 2));

      if (response.data.token) {
        await setToken(response.data.token);
        console.warn('Token stored successfully');
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
      console.warn('Fetching current user...');
      const response = await api.get<{ user: User }>('/auth/me');
      console.warn('Current user response:', JSON.stringify(response.data, null, 2));
      return response.data.user;
    } catch (error) {
      console.error('Get current user error:', error);
      if (error instanceof Error && (error as any).response?.status === 401) {
        console.warn('Session expired or invalid token');
        await removeToken();
      }
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
