import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import config from "../config/config";
import { User, UserResponse } from "../models/User";

/**
 * Hash a password using bcrypt
 */
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

/**
 * Compare a password with its hash
 */
export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

/**
 * Generate a JWT token for a user
 */
export const generateToken = (user: User): string => {
  // @ts-expect-error - Complex jwt typings
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
};

/**
 * Verify a JWT token
 */
export const verifyToken = (token: string): jwt.JwtPayload | null => {
  try {
    // @ts-expect-error - Complex jwt typings
    return jwt.verify(token, config.jwt.secret);
  } catch {
    return null;
  }
};

/**
 * Generate a random token for password reset
 */
export const generateResetToken = (): string => {
  return crypto.randomBytes(20).toString("hex");
};

/**
 * Calculate expiry time for password reset
 */
export const calculateExpiryTime = (): Date => {
  const expiryTime = new Date();
  expiryTime.setTime(expiryTime.getTime() + config.resetPassword.expiryTime);
  return expiryTime;
};

/**
 * Sanitize user object by removing password
 */
export const sanitizeUser = (user: User): UserResponse => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _, ...sanitizedUser } = user;
  return sanitizedUser as UserResponse;
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 */
export const isStrongPassword = (password: string): boolean => {
  // Password must be at least 8 characters long and contain at least one uppercase letter,
  // one lowercase letter, one number, and one special character
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};
