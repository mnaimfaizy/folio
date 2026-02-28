export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole | string;
  email_verified?: boolean;
  credit_balance?: number;
}

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
  message?: string;
  token?: string;
  user?: AuthUser;
  userId?: number;
  resetToken?: string;
  needsVerification?: boolean;
}

export interface AuthenticatedResponse {
  token: string;
  user: AuthUser;
}

export interface MessageResponse {
  message: string;
}

export interface CurrentUserResponse {
  user: AuthUser;
}
