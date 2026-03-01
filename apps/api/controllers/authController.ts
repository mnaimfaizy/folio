import crypto from 'crypto';
import { Request, Response } from 'express';
import { connectDatabase } from '../db/database';
import { User, UserRole } from '../models/User';
import {
  clearFailedLoginAttempts,
  evaluateLoginAttempt,
  getClientIp,
  recordFailedLoginAttempt,
} from '../services/authSecurityService';
import { emailService } from '../utils/emailService';
import {
  calculateRefreshTokenExpiry,
  calculateExpiryTime,
  hashToken,
  comparePassword,
  generateResetToken,
  generateRefreshToken,
  generateToken,
  hashPassword,
  isStrongPassword,
  isValidEmail,
  sanitizeUser,
} from '../utils/helpers';

type AuthenticatedRequest = Request & { user?: any };

const getTokenFamily = (): string => crypto.randomUUID();

/**
 * Register a new user
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  let db;
  try {
    const { name, email, password, role } = req.body;
    const normalizedEmail =
      typeof email === 'string' ? email.trim().toLowerCase() : '';

    // Validate input
    if (!name || !email || !password) {
      res
        .status(400)
        .json({ message: 'Please provide name, email, and password' });
      return;
    }

    if (!isValidEmail(normalizedEmail)) {
      res.status(400).json({ message: 'Please provide a valid email address' });
      return;
    }

    if (!isStrongPassword(password)) {
      res.status(400).json({
        message:
          'Password must be at least 8 characters and include uppercase, lowercase, number, and special character',
      });
      return;
    }

    // Set default role if not provided or validate if provided
    let userRole = UserRole.USER;
    if (role) {
      // Only allow role to be set to predefined roles
      if (Object.values(UserRole).includes(role as UserRole)) {
        userRole = role;
      } else {
        res.status(400).json({ message: 'Invalid role specified' });
        return;
      }
    }

    // Connect to database
    db = await connectDatabase();

    // Begin transaction
    await db.run('BEGIN TRANSACTION');

    // Check if user already exists - use case insensitive comparison
    const existingUser = await db.get(
      'SELECT * FROM users WHERE LOWER(email) = LOWER(?)',
      [normalizedEmail],
    );

    if (existingUser) {
      res.status(400).json({ message: 'User with this email already exists' });
      await db.run('ROLLBACK');
      return;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    try {
      // Create new user with email normalized to lowercase
      const result = await db.run(
        'INSERT INTO users (name, email, password, email_verified, verification_token, verification_token_expires, role, credit_balance) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [
          name,
          normalizedEmail, // Store email in lowercase to prevent case-sensitivity issues
          hashedPassword,
          false,
          verificationToken,
          verificationTokenExpires.toISOString(),
          userRole,
          0,
        ],
      );

      // Commit transaction
      await db.run('COMMIT');

      if (result.lastID) {
        // Send verification email
        await emailService.sendVerificationEmail(
          normalizedEmail,
          verificationToken,
        );

        res.status(201).json({
          message:
            'User registered successfully. Please check your email to verify your account.',
          userId: result.lastID,
        });
      } else {
        await db.run('ROLLBACK');
        res.status(500).json({ message: 'Failed to register user' });
      }
    } catch (insertError: Error | unknown) {
      await db.run('ROLLBACK');
      // Check if error is due to unique constraint violation
      if (
        insertError instanceof Error &&
        insertError.message &&
        insertError.message.includes('UNIQUE constraint failed')
      ) {
        res
          .status(400)
          .json({ message: 'User with this email already exists' });
      } else {
        const errorMessage =
          insertError instanceof Error ? insertError.message : 'Unknown error';
        console.error('Registration insert error:', errorMessage);
        res.status(500).json({
          message: 'Server error during user creation',
          error: errorMessage,
        });
      }
    }
  } catch (error: Error | unknown) {
    // Rollback transaction on error
    if (db) {
      await db.run('ROLLBACK').catch(console.error);
    }
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Registration error:', errorMessage);
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
};

/**
 * Verify email
 */
export const verifyEmail = async (
  req: Request,
  res: Response,
): Promise<void> => {
  let db;
  try {
    const { token } = req.params;

    // Connect to database
    db = await connectDatabase();

    // Begin transaction
    await db.run('BEGIN TRANSACTION');

    // Find user with matching token that hasn't expired
    const user = await db.get(
      'SELECT * FROM users WHERE verification_token = ? AND verification_token_expires > CURRENT_TIMESTAMP',
      [token],
    );

    if (!user) {
      res
        .status(400)
        .json({ message: 'Invalid or expired verification token' });
      await db.run('ROLLBACK');
      return;
    }

    // Update user's verification status
    await db.run(
      'UPDATE users SET email_verified = ?, verification_token = NULL, verification_token_expires = NULL WHERE id = ?',
      [true, user.id],
    );

    // Commit transaction
    await db.run('COMMIT');

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error: Error | unknown) {
    // Rollback on error
    if (db) {
      await db.run('ROLLBACK').catch(console.error);
    }
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Verification error:', errorMessage);
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
};

/**
 * Resend verification email
 */
export const resendVerification = async (
  req: Request,
  res: Response,
): Promise<void> => {
  let db;
  try {
    const { email } = req.body;
    const normalizedEmail =
      typeof email === 'string' ? email.trim().toLowerCase() : '';

    if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
      res.status(400).json({ message: 'Please provide a valid email address' });
      return;
    }

    // Connect to database
    db = await connectDatabase();

    // Begin transaction
    await db.run('BEGIN TRANSACTION');

    // Find user by email
    const user = await db.get('SELECT * FROM users WHERE email = ?', [
      normalizedEmail,
    ]);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      await db.run('ROLLBACK');
      return;
    }

    if (user.email_verified) {
      res.status(400).json({ message: 'Email is already verified' });
      await db.run('ROLLBACK');
      return;
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update user's verification token
    await db.run(
      'UPDATE users SET verification_token = ?, verification_token_expires = ? WHERE id = ?',
      [verificationToken, verificationTokenExpires.toISOString(), user.id],
    );

    // Commit transaction
    await db.run('COMMIT');

    // Send verification email
    await emailService.sendVerificationEmail(
      normalizedEmail,
      verificationToken,
    );

    res.status(200).json({ message: 'Verification email sent' });
  } catch (error: Error | unknown) {
    // Rollback on error
    if (db) {
      await db.run('ROLLBACK').catch(console.error);
    }
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Resend verification error:', errorMessage);
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
};

/**
 * Login user
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  let db;
  try {
    const { email, password } = req.body;
    const normalizedEmail =
      typeof email === 'string' ? email.trim().toLowerCase() : '';
    const clientIp = getClientIp(req.ip);

    // Validate input
    if (!email || !password) {
      res.status(400).json({ message: 'Please provide email and password' });
      return;
    }

    if (!isValidEmail(normalizedEmail)) {
      res.status(400).json({ message: 'Please provide a valid email address' });
      return;
    }

    const attemptCheck = evaluateLoginAttempt(normalizedEmail, clientIp);
    if (!attemptCheck.allowed) {
      const retryAfterMs =
        'retryAfterMs' in attemptCheck ? attemptCheck.retryAfterMs : 1000;
      const retryAfterSeconds = Math.max(1, Math.ceil(retryAfterMs / 1000));
      res.setHeader('Retry-After', retryAfterSeconds.toString());
      res.status(429).json({
        message: `Too many login attempts. Please try again in ${retryAfterSeconds} second(s).`,
      });
      return;
    }

    // Connect to database
    db = await connectDatabase();

    // Find user by email (case-insensitive)
    const user = (await db.get(
      'SELECT * FROM users WHERE LOWER(email) = LOWER(?)',
      [normalizedEmail],
    )) as User;

    if (!user) {
      recordFailedLoginAttempt(normalizedEmail, clientIp);
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Check if email is verified
    if (!user.email_verified) {
      res.status(401).json({
        message: 'Email not verified',
        needsVerification: true,
      });
      return;
    }

    // Validate password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      recordFailedLoginAttempt(normalizedEmail, clientIp);
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    clearFailedLoginAttempts(normalizedEmail, clientIp);

    // Generate JWT token
    const token = generateToken(user);
    const refreshToken = generateRefreshToken();
    const refreshTokenHash = hashToken(refreshToken);
    const refreshTokenExpiresAt = calculateRefreshTokenExpiry();
    const tokenFamily = getTokenFamily();

    await db.run(
      'INSERT INTO auth_sessions (userId, token_hash, token_family, user_agent, ip_address, expiresAt, last_used_at) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)',
      [
        user.id,
        refreshTokenHash,
        tokenFamily,
        req.get('user-agent') || null,
        clientIp,
        refreshTokenExpiresAt.toISOString(),
      ],
    );

    // Return user data and token
    res.status(200).json({
      message: 'Login successful',
      user: sanitizeUser(user),
      token,
      refreshToken,
      refreshTokenExpiresAt: refreshTokenExpiresAt.toISOString(),
    });
  } catch (error: Error | unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Login error:', errorMessage);
    res.status(500).json({ message: 'Server error', error: errorMessage });
  } finally {
    // Close database connection if needed
    if (db) {
      try {
        if (typeof (db as any).close === 'function') {
          await (db as any).close();
        }
      } catch (closeError) {
        console.error('Error closing database:', closeError);
      }
    }
  }
};

/**
 * Logout user (client-side token removal)
 */
export const logout = async (_req: Request, res: Response): Promise<void> => {
  let db;
  try {
    const refreshToken = _req.body?.refreshToken;

    if (refreshToken && typeof refreshToken === 'string') {
      db = await connectDatabase();
      const refreshTokenHash = hashToken(refreshToken);

      await db.run(
        'UPDATE auth_sessions SET revoked_at = CURRENT_TIMESTAMP WHERE token_hash = ? AND revoked_at IS NULL',
        [refreshTokenHash],
      );
    }
  } catch (error) {
    console.error('Logout session revocation error:', error);
  }

  res.status(200).json({ message: 'Logout successful' });
};

export const refreshSession = async (
  req: Request,
  res: Response,
): Promise<void> => {
  let db;
  try {
    const { refreshToken } = req.body;

    if (!refreshToken || typeof refreshToken !== 'string') {
      res.status(400).json({ message: 'Please provide a refresh token' });
      return;
    }

    db = await connectDatabase();
    await db.run('BEGIN TRANSACTION');

    const refreshTokenHash = hashToken(refreshToken);
    const existingSession = (await db.get(
      'SELECT * FROM auth_sessions WHERE token_hash = ?',
      [refreshTokenHash],
    )) as
      | {
          id: number;
          userId: number;
          token_family: string;
          tokenFamily: string;
          expiresAt: string;
          revokedAt?: string | null;
          revoked_at?: string | null;
        }
      | undefined;

    if (!existingSession) {
      await db.run('ROLLBACK');
      res.status(401).json({ message: 'Invalid or expired refresh token' });
      return;
    }

    const tokenFamily =
      existingSession.tokenFamily || existingSession.token_family;
    const revokedAt = existingSession.revokedAt || existingSession.revoked_at;

    if (revokedAt) {
      await db.run(
        'UPDATE auth_sessions SET revoked_at = CURRENT_TIMESTAMP WHERE token_family = ? AND revoked_at IS NULL',
        [tokenFamily],
      );
      await db.run('COMMIT');
      res.status(401).json({ message: 'Invalid or expired refresh token' });
      return;
    }

    if (new Date(existingSession.expiresAt).getTime() <= Date.now()) {
      await db.run(
        'UPDATE auth_sessions SET revoked_at = CURRENT_TIMESTAMP WHERE id = ? AND revoked_at IS NULL',
        [existingSession.id],
      );
      await db.run('COMMIT');
      res.status(401).json({ message: 'Invalid or expired refresh token' });
      return;
    }

    const user = (await db.get('SELECT * FROM users WHERE id = ?', [
      existingSession.userId,
    ])) as User;

    if (!user) {
      await db.run('ROLLBACK');
      res.status(401).json({ message: 'Invalid or expired refresh token' });
      return;
    }

    const nextRefreshToken = generateRefreshToken();
    const nextRefreshTokenHash = hashToken(nextRefreshToken);
    const nextRefreshTokenExpiresAt = calculateRefreshTokenExpiry();

    await db.run(
      'INSERT INTO auth_sessions (userId, token_hash, token_family, user_agent, ip_address, expiresAt, last_used_at) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)',
      [
        user.id,
        nextRefreshTokenHash,
        tokenFamily,
        req.get('user-agent') || null,
        getClientIp(req.ip),
        nextRefreshTokenExpiresAt.toISOString(),
      ],
    );

    await db.run(
      'UPDATE auth_sessions SET revoked_at = CURRENT_TIMESTAMP, replaced_by_token_hash = ?, last_used_at = CURRENT_TIMESTAMP WHERE id = ? AND revoked_at IS NULL',
      [nextRefreshTokenHash, existingSession.id],
    );

    await db.run('COMMIT');

    const token = generateToken(user);

    res.status(200).json({
      message: 'Session refreshed successfully',
      user: sanitizeUser(user),
      token,
      refreshToken: nextRefreshToken,
      refreshTokenExpiresAt: nextRefreshTokenExpiresAt.toISOString(),
    });
  } catch (error: Error | unknown) {
    if (db) {
      await db.run('ROLLBACK').catch(console.error);
    }
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Refresh session error:', errorMessage);
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
};

export const logoutAll = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  let db;
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    db = await connectDatabase();
    await db.run(
      'UPDATE auth_sessions SET revoked_at = CURRENT_TIMESTAMP WHERE userId = ? AND revoked_at IS NULL',
      [req.user.id],
    );

    res.status(200).json({ message: 'All sessions logged out successfully' });
  } catch (error: Error | unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Logout all sessions error:', errorMessage);
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
};

/**
 * Change user password
 */
export const changePassword = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  let db;
  try {
    const { currentPassword, newPassword } = req.body;

    if (!req.user || !req.user.id) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const userId = req.user.id;

    // Validate input
    if (!currentPassword || !newPassword) {
      res.status(400).json({
        message: 'Please provide current password and new password',
      });
      return;
    }

    if (!isStrongPassword(newPassword)) {
      res.status(400).json({
        message:
          'Password must be at least 8 characters and include uppercase, lowercase, number, and special character',
      });
      return;
    }

    // Connect to database
    db = await connectDatabase();

    // Begin transaction
    await db.run('BEGIN TRANSACTION');

    // Get current user
    const user = (await db.get('SELECT * FROM users WHERE id = ?', [
      userId,
    ])) as User;

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      await db.run('ROLLBACK');
      return;
    }

    // Verify current password
    const isPasswordValid = await comparePassword(
      currentPassword,
      user.password,
    );
    if (!isPasswordValid) {
      res.status(401).json({ message: 'Current password is incorrect' });
      await db.run('ROLLBACK');
      return;
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await db.run(
      'UPDATE users SET password = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [hashedPassword, userId],
    );

    // Commit transaction
    await db.run('COMMIT');

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error: Error | unknown) {
    // Rollback on error
    if (db) {
      await db.run('ROLLBACK').catch(console.error);
    }
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Change password error:', errorMessage);
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
};

/**
 * Request password reset
 */
export const requestPasswordReset = async (
  req: Request,
  res: Response,
): Promise<void> => {
  let db;
  try {
    const { email } = req.body;
    const normalizedEmail =
      typeof email === 'string' ? email.trim().toLowerCase() : '';

    if (!normalizedEmail) {
      res.status(400).json({ message: 'Please provide an email address' });
      return;
    }

    if (!isValidEmail(normalizedEmail)) {
      res.status(400).json({ message: 'Please provide a valid email address' });
      return;
    }

    // Connect to database
    db = await connectDatabase();

    // Begin transaction
    await db.run('BEGIN TRANSACTION');

    // Find user by email
    const user = (await db.get('SELECT * FROM users WHERE email = ?', [
      normalizedEmail,
    ])) as User;

    if (!user) {
      // Don't reveal that the user doesn't exist for security reasons
      res.status(200).json({
        message:
          'If your email is in our system, you will receive a password reset link',
      });
      await db.run('ROLLBACK');
      return;
    }

    // Generate reset token
    const resetToken = generateResetToken();
    const expiryTime = calculateExpiryTime();

    // Remove any existing tokens for this user
    await db.run('DELETE FROM reset_tokens WHERE userId = ?', [user.id]);

    // Store token in database
    await db.run(
      'INSERT INTO reset_tokens (userId, token, expiresAt) VALUES (?, ?, ?)',
      [user.id, resetToken, expiryTime.toISOString()],
    );

    // Commit transaction
    await db.run('COMMIT');

    res.status(200).json({
      message:
        'If your email is in our system, you will receive a password reset link',
    });
  } catch (error: Error | unknown) {
    // Rollback on error
    if (db) {
      await db.run('ROLLBACK').catch(console.error);
    }
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Request password reset error:', errorMessage);
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
};

/**
 * Reset password using token
 */
export const resetPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  let db;
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      res.status(400).json({
        message: 'Please provide a token and new password',
      });
      return;
    }

    if (!isStrongPassword(newPassword)) {
      res.status(400).json({
        message:
          'Password must be at least 8 characters and include uppercase, lowercase, number, and special character',
      });
      return;
    }

    // Connect to database
    db = await connectDatabase();

    // Begin transaction
    await db.run('BEGIN TRANSACTION');

    // Find token in database
    const resetRequest = await db.get(
      'SELECT * FROM reset_tokens WHERE token = ? AND expiresAt > CURRENT_TIMESTAMP',
      [token],
    );

    if (!resetRequest) {
      res.status(400).json({ message: 'Invalid or expired token' });
      await db.run('ROLLBACK');
      return;
    }

    // Get user
    const user = (await db.get('SELECT * FROM users WHERE id = ?', [
      resetRequest.userId,
    ])) as User;

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      await db.run('ROLLBACK');
      return;
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await db.run(
      'UPDATE users SET password = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [hashedPassword, user.id],
    );

    // Delete used token
    await db.run('DELETE FROM reset_tokens WHERE userId = ?', [user.id]);

    // Commit transaction
    await db.run('COMMIT');

    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error: Error | unknown) {
    // Rollback on error
    if (db) {
      await db.run('ROLLBACK').catch(console.error);
    }
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Reset password error:', errorMessage);
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
};

/**
 * Update user's profile information
 */
export const updateUser = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  let db;
  try {
    const { name } = req.body;

    if (!req.user || !req.user.id) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const userId = req.user.id;

    // Validate input
    if (!name) {
      res.status(400).json({ message: 'Please provide a name' });
      return;
    }

    // Connect to database
    db = await connectDatabase();

    // Begin transaction
    await db.run('BEGIN TRANSACTION');

    // Get current user
    const user = (await db.get('SELECT * FROM users WHERE id = ?', [
      userId,
    ])) as User;

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      await db.run('ROLLBACK');
      return;
    }

    // Update user information
    await db.run(
      'UPDATE users SET name = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [name, userId],
    );

    // Commit transaction
    await db.run('COMMIT');

    // Get updated user
    const updatedUser = (await db.get('SELECT * FROM users WHERE id = ?', [
      userId,
    ])) as User;

    res.status(200).json({
      message: 'Profile updated successfully',
      user: sanitizeUser(updatedUser),
    });
  } catch (error: Error | unknown) {
    // Rollback on error
    if (db) {
      await db.run('ROLLBACK').catch(console.error);
    }
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Update user error:', errorMessage);
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
};

/**
 * Delete user account
 */
export const deleteUser = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  let db;
  try {
    const { password } = req.body;

    if (!req.user || !req.user.id) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const userId = req.user.id;

    // Validate input
    if (!password) {
      res
        .status(400)
        .json({ message: 'Please provide your password to confirm deletion' });
      return;
    }

    // Connect to database
    db = await connectDatabase();

    // Begin transaction
    await db.run('BEGIN TRANSACTION');

    // Get current user
    const user = (await db.get('SELECT * FROM users WHERE id = ?', [
      userId,
    ])) as User;

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      await db.run('ROLLBACK');
      return;
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: 'Password is incorrect' });
      await db.run('ROLLBACK');
      return;
    }

    // Delete user's reset tokens (if any)
    await db.run('DELETE FROM reset_tokens WHERE userId = ?', [userId]);

    // Delete user
    await db.run('DELETE FROM users WHERE id = ?', [userId]);

    // Commit transaction
    await db.run('COMMIT');

    res.status(200).json({ message: 'User account deleted successfully' });
  } catch (error: Error | unknown) {
    // Rollback on error
    if (db) {
      await db.run('ROLLBACK').catch(console.error);
    }
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Delete user error:', errorMessage);
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
};

/**
 * Get current authenticated user's profile
 */
export const getCurrentUser = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  let db;
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    // Connect to database
    db = await connectDatabase();

    // Get user by ID
    const user = (await db.get(
      'SELECT id, name, email, role, email_verified, created_at FROM users WHERE id = ?',
      [userId],
    )) as User | undefined;

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        email_verified: user.email_verified,
      },
    });
  } catch (error: Error | unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Get current user error:', errorMessage);
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
};
