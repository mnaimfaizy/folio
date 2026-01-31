export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
}

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  email_verified: boolean;
  verification_token: string | null;
  verification_token_expires: Date | null;
  role: string; // Added role field
  createdAt?: string;
  updatedAt?: string;
}

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  role: string; // Added role field
  createdAt: string;
  updatedAt: string;
}
