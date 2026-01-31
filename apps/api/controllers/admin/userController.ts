import crypto from "crypto";
import { Request, Response } from "express";
import { connectDatabase } from "../../db/database";
import { UserRole } from "../../models/User";
import { emailService } from "../../utils/emailService";
import { hashPassword } from "../../utils/helpers";

/**
 * Get all users (admin only)
 */
export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const db = await connectDatabase();

    // Get all users with their roles
    const users = await db.all(
      "SELECT id, name, email, role, email_verified, createdAt, updatedAt FROM users ORDER BY name"
    );

    res.status(200).json({ users });
  } catch (error: Error | unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Error fetching users:", errorMessage);
    res.status(500).json({ message: "Server error", error: errorMessage });
  }
};

/**
 * Get a single user by ID (admin only)
 */
export const getUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const db = await connectDatabase();

    const user = await db.get(
      "SELECT id, name, email, role, email_verified, createdAt, updatedAt FROM users WHERE id = ?",
      [id]
    );

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Get user's book collection
    const books = await db.all(
      `
      SELECT b.* 
      FROM books b
      JOIN user_collections uc ON b.id = uc.bookId
      WHERE uc.userId = ?
      ORDER BY b.title
      `,
      [id]
    );

    // Format the response
    const userData = {
      ...user,
      books,
    };

    res.status(200).json({ user: userData });
  } catch (error: Error | unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Error fetching user:", errorMessage);
    res.status(500).json({ message: "Server error", error: errorMessage });
  }
};

/**
 * Create a new user (admin only)
 */
export const createUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  let db;
  try {
    const {
      name,
      email,
      password,
      role,
      email_verified = true,
      sendVerificationEmail = false,
    } = req.body;

    // Validate input
    if (!name || !email || !password) {
      res
        .status(400)
        .json({ message: "Please provide name, email, and password" });
      return;
    }

    // Validate role if provided
    let userRole =
      role && Object.values(UserRole).includes(role as UserRole)
        ? role
        : UserRole.USER;

    // Connect to database
    db = await connectDatabase();

    // Begin transaction
    await db.run("BEGIN TRANSACTION");

    // Check if user already exists
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
    const hashedPassword = await hashPassword(password);

    // Generate verification token if needed
    let verificationToken = null;
    let verificationTokenExpires = null;

    // If email is not verified and we want to send verification email
    if (!email_verified || sendVerificationEmail) {
      verificationToken = crypto.randomBytes(32).toString("hex");
      verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    }

    // Create new user
    const result = await db.run(
      "INSERT INTO users (name, email, password, email_verified, role, verification_token, verification_token_expires) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        name,
        email.toLowerCase(),
        hashedPassword,
        !sendVerificationEmail && email_verified ? 1 : 0, // If sending verification email, set to false
        userRole,
        verificationToken,
        verificationTokenExpires
          ? verificationTokenExpires.toISOString()
          : null,
      ]
    );

    // Commit transaction
    await db.run("COMMIT");

    if (result.lastID) {
      // Get the created user
      const newUser = await db.get(
        "SELECT id, name, email, role, email_verified, createdAt, updatedAt FROM users WHERE id = ?",
        [result.lastID]
      );

      // Send verification email if requested
      if (sendVerificationEmail && verificationToken) {
        await emailService.sendVerificationEmail(email, verificationToken);
      }

      res.status(201).json({
        message: sendVerificationEmail
          ? "User created successfully. Verification email sent."
          : "User created successfully",
        user: newUser,
      });
    } else {
      res.status(500).json({ message: "Failed to create user" });
    }
  } catch (error: Error | unknown) {
    // Rollback on error
    if (db) {
      try {
        await db.run("ROLLBACK");
      } catch (rollbackError) {
        console.error("Error during rollback:", rollbackError);
      }
    }
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Create user error:", errorMessage);
    res.status(500).json({ message: "Server error", error: errorMessage });
  }
};

/**
 * Update a user (admin only)
 */
export const updateUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  let db;
  try {
    const { id } = req.params;
    const { name, email, role, email_verified } = req.body;

    // Connect to database
    db = await connectDatabase();

    // Begin transaction
    await db.run("BEGIN TRANSACTION");

    // Check if user exists
    const user = await db.get("SELECT * FROM users WHERE id = ?", [id]);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      await db.run("ROLLBACK");
      return;
    }

    // Check if email is changed and already exists
    if (email && email !== user.email) {
      const existingUser = await db.get(
        "SELECT * FROM users WHERE LOWER(email) = LOWER(?) AND id != ?",
        [email, id]
      );

      if (existingUser) {
        res.status(400).json({ message: "Email is already in use" });
        await db.run("ROLLBACK");
        return;
      }
    }

    // Validate role if provided
    if (role && !Object.values(UserRole).includes(role as UserRole)) {
      res.status(400).json({ message: "Invalid role specified" });
      await db.run("ROLLBACK");
      return;
    }

    // Build update query dynamically based on provided fields
    let updateFields = [];
    let values = [];

    if (name) {
      updateFields.push("name = ?");
      values.push(name);
    }

    if (email) {
      updateFields.push("email = ?");
      values.push(email.toLowerCase());
    }

    if (role) {
      updateFields.push("role = ?");
      values.push(role);
    }

    if (email_verified !== undefined) {
      updateFields.push("email_verified = ?");
      values.push(email_verified ? 1 : 0);
    }

    if (updateFields.length === 0) {
      res.status(400).json({ message: "No valid fields to update" });
      await db.run("ROLLBACK");
      return;
    }

    // Add updatedAt field
    updateFields.push("updatedAt = CURRENT_TIMESTAMP");

    // Add id to values for WHERE clause
    values.push(id);

    // Update user
    await db.run(
      `UPDATE users SET ${updateFields.join(", ")} WHERE id = ?`,
      values
    );

    // Commit transaction
    await db.run("COMMIT");

    // Get updated user
    const updatedUser = await db.get(
      "SELECT id, name, email, role, email_verified, createdAt, updatedAt FROM users WHERE id = ?",
      [id]
    );

    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error: Error | unknown) {
    // Rollback on error
    if (db) {
      try {
        await db.run("ROLLBACK");
      } catch (rollbackError) {
        console.error("Error during rollback:", rollbackError);
      }
    }
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Update user error:", errorMessage);
    res.status(500).json({ message: "Server error", error: errorMessage });
  }
};

/**
 * Delete a user (admin only)
 */
export const deleteUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  let db;
  try {
    const { id } = req.params;

    // Connect to database
    db = await connectDatabase();

    // Begin transaction
    await db.run("BEGIN TRANSACTION");

    // Check if user exists
    const user = await db.get("SELECT * FROM users WHERE id = ?", [id]);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      await db.run("ROLLBACK");
      return;
    }

    // Delete user's reset tokens (if any)
    await db.run("DELETE FROM reset_tokens WHERE userId = ?", [id]);

    // Delete user's book collection entries
    await db.run("DELETE FROM user_collections WHERE userId = ?", [id]);

    // Delete user
    await db.run("DELETE FROM users WHERE id = ?", [id]);

    // Commit transaction
    await db.run("COMMIT");

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error: Error | unknown) {
    // Rollback on error
    if (db) {
      try {
        await db.run("ROLLBACK");
      } catch (rollbackError) {
        console.error("Error during rollback:", rollbackError);
      }
    }
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Delete user error:", errorMessage);
    res.status(500).json({ message: "Server error", error: errorMessage });
  }
};

/**
 * Change user password (admin only)
 */
export const changeUserPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  let db;
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      res.status(400).json({ message: "New password is required" });
      return;
    }

    // Connect to database
    db = await connectDatabase();

    // Begin transaction
    await db.run("BEGIN TRANSACTION");

    // Check if user exists
    const user = await db.get("SELECT * FROM users WHERE id = ?", [id]);

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
      [hashedPassword, id]
    );

    // Commit transaction
    await db.run("COMMIT");

    res.status(200).json({ message: "User password changed successfully" });
  } catch (error: Error | unknown) {
    // Rollback on error
    if (db) {
      try {
        await db.run("ROLLBACK");
      } catch (rollbackError) {
        console.error("Error during rollback:", rollbackError);
      }
    }
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Change user password error:", errorMessage);
    res.status(500).json({ message: "Server error", error: errorMessage });
  }
};
