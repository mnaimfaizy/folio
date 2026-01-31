import appNavigate from "@/lib/navigation";
import api from "./api";

// Types for API requests and responses
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

export interface UpdateProfileResponse {
  message: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
}

const AuthService = {
  // Login user
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>(
      "/api/auth/login",
      credentials
    );
    // Store auth token and user info in localStorage
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("user", JSON.stringify(response.data.user));
    return response.data;
  },

  // Register new user
  signup: async (
    userData: SignupRequest
  ): Promise<{ message: string; user?: { id: number; email: string } }> => {
    const response = await api.post<{
      message: string;
      user?: { id: number; email: string };
    }>("/api/auth/register", userData);
    // Don't store token or user data since email verification is required
    return response.data;
  },

  // Request password reset
  requestPasswordReset: async (email: string): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>(
      "/api/auth/request-password-reset",
      { email }
    );
    return response.data;
  },

  // Reset password with token
  resetPassword: async (
    token: string,
    newPassword: string
  ): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>(
      "/api/auth/reset-password",
      {
        token,
        newPassword,
      }
    );
    return response.data;
  },

  // Change password (for authenticated users)
  changePassword: async (
    currentPassword: string,
    newPassword: string
  ): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>(
      "/api/auth/change-password",
      {
        currentPassword,
        newPassword,
      }
    );
    return response.data;
  },

  // Verify email address
  verifyEmail: async (token: string): Promise<{ message: string }> => {
    const response = await api.get<{ message: string }>(
      `/api/auth/verify-email/${token}`
    );
    return response.data;
  },

  // Resend email verification
  resendVerification: async (email: string): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>(
      "/api/auth/resend-verification",
      { email }
    );
    return response.data;
  },

  // Update user profile
  updateProfile: async (name: string): Promise<UpdateProfileResponse> => {
    const response = await api.put<UpdateProfileResponse>(
      "/api/auth/update-profile",
      { name }
    );

    // Update the user in localStorage
    if (response.data.user) {
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }

    return response.data;
  },

  // Delete user account
  deleteAccount: async (password: string): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(
      "/api/auth/delete-account",
      {
        data: { password },
      }
    );

    // Clean up local storage on successful deletion
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    return response.data;
  },

  // Logout user
  logout: (): void => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // Redirect to home page using navigation utility
    appNavigate("/");
  },

  // Check if user is logged in
  isAuthenticated: (): boolean => {
    return localStorage.getItem("token") !== null;
  },

  // Get current user
  getCurrentUser: (): {
    id: number;
    name: string;
    email: string;
    role: string;
  } | null => {
    const user = localStorage.getItem("user");
    if (user) {
      return JSON.parse(user);
    }
    return null;
  },
};

export default AuthService;
