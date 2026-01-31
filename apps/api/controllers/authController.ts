import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Request, Response } from "express";
import { connectDatabase } from "../db/database";
import { User, UserRole } from "../models/User";
import { emailService } from "../utils/emailService";
import {
  calculateExpiryTime,
  comparePassword,
  generateResetToken,
  generateToken,
  hashPassword,
  sanitizeUser,
} from "../utils/helpers";

/**
 * Register a new user
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  let db;
  try {
    const { name, email, password, role } = req.body;

    // Validate input
    if (!name || !email || !password) {
      res
        .status(400)
        .json({ message: "Please provide name, email, and password" });
      return;
    }

    // Set default role if not provided or validate if provided
    let userRole = UserRole.USER;
    if (role) {
      // Only allow role to be set to predefined roles
      if (Object.values(UserRole).includes(role as UserRole)) {
        userRole = role;
      } else {
        res.status(400).json({ message: "Invalid role specified" });
        return;
      }
    }

    // Connect to database
    db = await connectDatabase();

    // Begin transaction
    await db.run("BEGIN TRANSACTION");

    // Check if user already exists - use case insensitive comparison
    const existingUser = await db.get(
      "SELECT * FROM users WHERE LOWER(email) = LOWER(?)",
      [email]
    );

    if (existingUser) {
      res.status(400).json({ message: "User with this email already exists" });
      await db.run("ROLLBACK");
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    try {
      // Create new user with email normalized to lowercase
      const result = await db.run(
        "INSERT INTO users (name, email, password, email_verified, verification_token, verification_token_expires, role) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          name,
          email.toLowerCase(), // Store email in lowercase to prevent case-sensitivity issues
          hashedPassword,
          false,
          verificationToken,
          verificationTokenExpires.toISOString(),
          userRole,
        ]
      );

      // Commit transaction
      await db.run("COMMIT");

      if (result.lastID) {
        // Send verification email
        await emailService.sendVerificationEmail(email, verificationToken);

        res.status(201).json({
          message:
            "User registered successfully. Please check your email to verify your account.",
          userId: result.lastID,
        });
      } else {
        await db.run("ROLLBACK");
        res.status(500).json({ message: "Failed to register user" });
      }
    } catch (insertError: Error | unknown) {
      await db.run("ROLLBACK");
      // Check if error is due to unique constraint violation
      if (
        insertError instanceof Error &&
        insertError.message &&
        insertError.message.includes("UNIQUE constraint failed")
      ) {
        res
          .status(400)
          .json({ message: "User with this email already exists" });
      } else {
        const errorMessage =
          insertError instanceof Error ? insertError.message : "Unknown error";
        console.error("Registration insert error:", errorMessage);
        res.status(500).json({
          message: "Server error during user creation",
          error: errorMessage,
        });
      }
    }
  } catch (error: Error | unknown) {
    // Rollback transaction on error
    if (db) {
      await db.run("ROLLBACK").catch(console.error);
    }
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Registration error:", errorMessage);
    res.status(500).json({ message: "Server error", error: errorMessage });
  }
};

/**
 * Verify email
 */
export const verifyEmail = async (
  req: Request,
  res: Response
): Promise<void> => {
  let db;
  try {
    const { token } = req.params;

    // Connect to database
    db = await connectDatabase();

    // Begin transaction
    await db.run("BEGIN TRANSACTION");

    // Find user with matching token that hasn't expired
    const user = await db.get(
      "SELECT * FROM users WHERE verification_token = ? AND verification_token_expires > CURRENT_TIMESTAMP",
      [token]
    );

    if (!user) {
      res
        .status(400)
        .json({ message: "Invalid or expired verification token" });
      await db.run("ROLLBACK");
      return;
    }

    // Update user's verification status
    await db.run(
      "UPDATE users SET email_verified = ?, verification_token = NULL, verification_token_expires = NULL WHERE id = ?",
      [true, user.id]
    );

    // Commit transaction
    await db.run("COMMIT");

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error: Error | unknown) {
    // Rollback on error
    if (db) {
      await db.run("ROLLBACK").catch(console.error);
    }
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Verification error:", errorMessage);
    res.status(500).json({ message: "Server error", error: errorMessage });
  }
};

/**
 * Resend verification email
 */
export const resendVerification = async (
  req: Request,
  res: Response
): Promise<void> => {
  let db;
  try {
    const { email } = req.body;

    // Connect to database
    db = await connectDatabase();

    // Begin transaction
    await db.run("BEGIN TRANSACTION");

    // Find user by email
    const user = await db.get("SELECT * FROM users WHERE email = ?", [email]);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      await db.run("ROLLBACK");
      return;
    }

    if (user.email_verified) {
      res.status(400).json({ message: "Email is already verified" });
      await db.run("ROLLBACK");
      return;
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update user's verification token
    await db.run(
      "UPDATE users SET verification_token = ?, verification_token_expires = ? WHERE id = ?",
      [verificationToken, verificationTokenExpires.toISOString(), user.id]
    );

    // Commit transaction
    await db.run("COMMIT");

    // Send verification email
    await emailService.sendVerificationEmail(email, verificationToken);

    res.status(200).json({ message: "Verification email sent" });
  } catch (error: Error | unknown) {
    // Rollback on error
    if (db) {
      await db.run("ROLLBACK").catch(console.error);
    }
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Resend verification error:", errorMessage);
    res.status(500).json({ message: "Server error", error: errorMessage });
  }
};

/**
 * Login user
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  let db;
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      res.status(400).json({ message: "Please provide email and password" });
      return;
    }

    // Connect to database
    db = await connectDatabase();

    // Find user by email
    const user = (await db.get("SELECT * FROM users WHERE email = ?", [
      email,
    ])) as User;

    if (!user) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    // Check if email is verified
    if (!user.email_verified) {
      res.status(401).json({
        message: "Email not verified",
        needsVerification: true,
      });
      return;
    }

    // Validate password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    // Generate JWT token
    const token = generateToken(user);

    // Return user data and token
    res.status(200).json({
      message: "Login successful",
      user: sanitizeUser(user),
      token,
    });
  } catch (error: Error | unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Login error:", errorMessage);
    res.status(500).json({ message: "Server error", error: errorMessage });
  } finally {
    // Close database connection if needed
    if (db) {
      try {
        await db.close();
      } catch (closeError) {
        console.error("Error closing database:", closeError);
      }
    }
  }
};

/**
 * Logout user (client-side token removal)
 */
export const logout = async (_req: Request, res: Response): Promise<void> => {
  // JWT tokens are stateless, so we just tell the client the logout was successful
  // The client should remove the token from storage
  res.status(200).json({ message: "Logout successful" });
};

/**
 * Change user password
 */
export const changePassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  let db;
  try {
    const { currentPassword, newPassword } = req.body;

    if (!req.user || !req.user.id) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const userId = req.user.id;

    // Validate input
    if (!currentPassword || !newPassword) {
      res.status(400).json({
        message: "Please provide current password and new password",
      });
      return;
    }

    // Connect to database
    db = await connectDatabase();

    // Begin transaction
    await db.run("BEGIN TRANSACTION");

    // Get current user
    const user = (await db.get("SELECT * FROM users WHERE id = ?", [
      userId,
    ])) as User;

    if (!user) {
      res.status(404).json({ message: "User not found" });
      await db.run("ROLLBACK");
      return;
    }

    // Verify current password
    const isPasswordValid = await comparePassword(
      currentPassword,
      user.password
    );
    if (!isPasswordValid) {
      res.status(401).json({ message: "Current password is incorrect" });
      await db.run("ROLLBACK");
      return;
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await db.run(
      "UPDATE users SET password = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?",
      [hashedPassword, userId]
    );

    // Commit transaction
    await db.run("COMMIT");

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error: Error | unknown) {
    // Rollback on error
    if (db) {
      await db.run("ROLLBACK").catch(console.error);
    }
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Change password error:", errorMessage);
    res.status(500).json({ message: "Server error", error: errorMessage });
  }
};

/**
 * Request password reset
 */
export const requestPasswordReset = async (
  req: Request,
  res: Response
): Promise<void> => {
  let db;
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: "Please provide an email address" });
      return;
    }

    // Connect to database
    db = await connectDatabase();

    // Begin transaction
    await db.run("BEGIN TRANSACTION");

    // Find user by email
    const user = (await db.get("SELECT * FROM users WHERE email = ?", [
      email,
    ])) as User;

    if (!user) {
      // Don't reveal that the user doesn't exist for security reasons
      res.status(200).json({
        message:
          "If your email is in our system, you will receive a password reset link",
      });
      await db.run("ROLLBACK");
      return;
    }

    // Generate reset token
    const resetToken = generateResetToken();
    const expiryTime = calculateExpiryTime();

    // Remove any existing tokens for this user
    await db.run("DELETE FROM reset_tokens WHERE userId = ?", [user.id]);

    // Store token in database
    await db.run(
      "INSERT INTO reset_tokens (userId, token, expiresAt) VALUES (?, ?, ?)",
      [user.id, resetToken, expiryTime.toISOString()]
    );

    // Commit transaction
    await db.run("COMMIT");

    // In a real application, you would send an email with the reset link
    // For this demo, we'll just return the token
    console.log(`Reset token for ${email}: ${resetToken}`);

    res.status(200).json({
      message:
        "If your email is in our system, you will receive a password reset link",
      // Only for development purposes
      resetToken,
    });
  } catch (error: Error | unknown) {
    // Rollback on error
    if (db) {
      await db.run("ROLLBACK").catch(console.error);
    }
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Request password reset error:", errorMessage);
    res.status(500).json({ message: "Server error", error: errorMessage });
  }
};

/**
 * Reset password using token
 */
export const resetPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  let db;
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      res.status(400).json({
        message: "Please provide a token and new password",
      });
      return;
    }

    // Connect to database
    db = await connectDatabase();

    // Begin transaction
    await db.run("BEGIN TRANSACTION");

    // Find token in database
    const resetRequest = await db.get(
      "SELECT * FROM reset_tokens WHERE token = ? AND expiresAt > CURRENT_TIMESTAMP",
      [token]
    );

    if (!resetRequest) {
      res.status(400).json({ message: "Invalid or expired token" });
      await db.run("ROLLBACK");
      return;
    }

    // Get user
    const user = (await db.get("SELECT * FROM users WHERE id = ?", [
      resetRequest.userId,
    ])) as User;

    if (!user) {
      res.status(404).json({ message: "User not found" });
      await db.run("ROLLBACK");
      return;
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await db.run(
      "UPDATE users SET password = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?",
      [hashedPassword, user.id]
    );

    // Delete used token
    await db.run("DELETE FROM reset_tokens WHERE userId = ?", [user.id]);

    // Commit transaction
    await db.run("COMMIT");

    res.status(200).json({ message: "Password has been reset successfully" });
  } catch (error: Error | unknown) {
    // Rollback on error
    if (db) {
      await db.run("ROLLBACK").catch(console.error);
    }
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Reset password error:", errorMessage);
    res.status(500).json({ message: "Server error", error: errorMessage });
  }
};

/**
 * Update user's profile information
 */
export const updateUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  let db;
  try {
    const { name } = req.body;

    if (!req.user || !req.user.id) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const userId = req.user.id;

    // Validate input
    if (!name) {
      res.status(400).json({ message: "Please provide a name" });
      return;
    }

    // Connect to database
    db = await connectDatabase();

    // Begin transaction
    await db.run("BEGIN TRANSACTION");

    // Get current user
    const user = (await db.get("SELECT * FROM users WHERE id = ?", [
      userId,
    ])) as User;

    if (!user) {
      res.status(404).json({ message: "User not found" });
      await db.run("ROLLBACK");
      return;
    }

    // Update user information
    await db.run(
      "UPDATE users SET name = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?",
      [name, userId]
    );

    // Commit transaction
    await db.run("COMMIT");

    // Get updated user
    const updatedUser = (await db.get("SELECT * FROM users WHERE id = ?", [
      userId,
    ])) as User;

    res.status(200).json({
      message: "Profile updated successfully",
      user: sanitizeUser(updatedUser),
    });
  } catch (error: Error | unknown) {
    // Rollback on error
    if (db) {
      await db.run("ROLLBACK").catch(console.error);
    }
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Update user error:", errorMessage);
    res.status(500).json({ message: "Server error", error: errorMessage });
  }
};

/**
 * Delete user account
 */
export const deleteUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  let db;
  try {
    const { password } = req.body;

    if (!req.user || !req.user.id) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const userId = req.user.id;

    // Validate input
    if (!password) {
      res
        .status(400)
        .json({ message: "Please provide your password to confirm deletion" });
      return;
    }

    // Connect to database
    db = await connectDatabase();

    // Begin transaction
    await db.run("BEGIN TRANSACTION");

    // Get current user
    const user = (await db.get("SELECT * FROM users WHERE id = ?", [
      userId,
    ])) as User;

    if (!user) {
      res.status(404).json({ message: "User not found" });
      await db.run("ROLLBACK");
      return;
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: "Password is incorrect" });
      await db.run("ROLLBACK");
      return;
    }

    // Delete user's reset tokens (if any)
    await db.run("DELETE FROM reset_tokens WHERE userId = ?", [userId]);

    // Delete user
    await db.run("DELETE FROM users WHERE id = ?", [userId]);

    // Commit transaction
    await db.run("COMMIT");

    res.status(200).json({ message: "User account deleted successfully" });
  } catch (error: Error | unknown) {
    // Rollback on error
    if (db) {
      await db.run("ROLLBACK").catch(console.error);
    }
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Delete user error:", errorMessage);
    res.status(500).json({ message: "Server error", error: errorMessage });
  }
};
