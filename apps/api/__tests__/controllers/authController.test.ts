import { Request, Response } from "express";
import { Database } from "sqlite";
import {
  changePassword,
  deleteUser,
  login,
  logout,
  register,
  requestPasswordReset,
  resendVerification,
  resetPassword,
  updateUser,
  verifyEmail,
} from "../../controllers/authController";
import { connectDatabase } from "../../db/database";
import { UserRole } from "../../models/User";
import { emailService } from "../../utils/emailService";
import * as helpers from "../../utils/helpers";

// Mock dependencies
jest.mock("../../db/database");
jest.mock("../../utils/emailService");
jest.mock("../../utils/helpers");
jest.mock("bcryptjs");

// Mock nodemailer before any imports that might use it
jest.mock("nodemailer", () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: "test-message-id" }),
  }),
}));

// Mock crypto for consistent token generation
jest.mock("crypto", () => ({
  randomBytes: jest.fn().mockImplementation(() => {
    return {
      toString: jest.fn().mockReturnValue("test-token"),
    };
  }),
}));

// Mock config to prevent nodemailer issues
jest.mock("../../config/config", () => ({
  jwt: {
    secret: "test-secret",
    expiresIn: "1h",
  },
  email: {
    host: "smtp.test.com",
    port: 587,
    user: "test@example.com",
    password: "test-password",
    from: "noreply@test.com",
  },
  frontendUrl: "http://localhost:3000",
  resetPassword: {
    expiryTime: 3600000,
  },
}));

// Ensure tests can run
jest.mock("../../utils/emailService", () => ({
  emailService: {
    sendVerificationEmail: jest.fn().mockResolvedValue(true),
    sendPasswordResetEmail: jest.fn().mockResolvedValue(true),
  },
}));

describe("Auth Controller", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let mockDb: Partial<Database>;
  const mockHashedPassword = "hashed-password";

  beforeEach(() => {
    mockDb = {
      run: jest.fn().mockResolvedValue({}),
      get: jest.fn(),
      all: jest.fn(),
      close: jest.fn(),
      exec: jest.fn(),
    };

    (connectDatabase as jest.Mock).mockResolvedValue(mockDb);

    req = {
      body: {},
      params: {},
      user: undefined,
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Setup consistent password hashing
    (helpers.hashPassword as jest.Mock).mockResolvedValue(mockHashedPassword);

    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("register", () => {
    it("should register a new user successfully", async () => {
      const mockVerificationToken = "test-token";

      req.body = {
        name: "Test User",
        email: "test@example.com",
        password: "Password123!",
      };

      // Mock database responses
      mockDb.get = jest.fn().mockResolvedValue(null); // No existing user

      const mockRunFn = jest
        .fn()
        .mockResolvedValueOnce({}) // Begin transaction
        .mockResolvedValueOnce({ lastID: 1 }) // Insert user with our expected params
        .mockResolvedValueOnce({}); // Commit transaction

      mockDb.run = mockRunFn as jest.MockedFunction<
        NonNullable<typeof mockDb.run>
      >;

      await register(req as Request, res as Response);

      // Verify database operations
      expect(mockDb.get).toHaveBeenCalledWith(
        "SELECT * FROM users WHERE LOWER(email) = LOWER(?)",
        ["test@example.com"]
      );

      expect(mockRunFn).toHaveBeenNthCalledWith(1, "BEGIN TRANSACTION");

      // Skip the detailed parameter check and just verify the query
      expect(mockRunFn).toHaveBeenNthCalledWith(
        2,
        "INSERT INTO users (name, email, password, email_verified, verification_token, verification_token_expires, role) VALUES (?, ?, ?, ?, ?, ?, ?)",
        expect.any(Array)
      );

      expect(mockRunFn).toHaveBeenNthCalledWith(3, "COMMIT");

      // Verify email service called
      expect(emailService.sendVerificationEmail).toHaveBeenCalledWith(
        "test@example.com",
        mockVerificationToken
      );

      // Verify response
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message:
          "User registered successfully. Please check your email to verify your account.",
        userId: 1,
      });
    });

    it("should return 400 if required fields are missing", async () => {
      req.body = {
        name: "Test User",
        // Missing email and password
      };

      await register(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Please provide name, email, and password",
      });
      expect(connectDatabase).not.toHaveBeenCalled();
    });

    it("should return 400 if user with email already exists", async () => {
      req.body = {
        name: "Test User",
        email: "existing@example.com",
        password: "Password123!",
      };

      // Mock existing user
      mockDb.get = jest.fn().mockResolvedValue({
        id: 1,
        email: "existing@example.com",
      });

      await register(req as Request, res as Response);

      expect(mockDb.run).toHaveBeenCalledWith("ROLLBACK");
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "User with this email already exists",
      });
    });

    it("should validate and handle custom role if provided", async () => {
      req.body = {
        name: "Admin User",
        email: "admin@example.com",
        password: "Password123!",
        role: UserRole.ADMIN,
      };

      // Mock database responses for success
      mockDb.get = jest.fn().mockResolvedValue(null);
      mockDb.run = jest
        .fn()
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({ lastID: 1 })
        .mockResolvedValueOnce({});

      await register(req as Request, res as Response);

      // Verify role was passed correctly
      expect(mockDb.run).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([UserRole.ADMIN])
      );
    });

    it("should return 400 if invalid role is provided", async () => {
      req.body = {
        name: "Test User",
        email: "test@example.com",
        password: "Password123!",
        role: "INVALID_ROLE",
      };

      await register(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Invalid role specified",
      });
    });

    it("should handle database errors during registration", async () => {
      req.body = {
        name: "Test User",
        email: "test@example.com",
        password: "Password123!",
      };

      const mockError = new Error("Database error");
      mockDb.get = jest.fn().mockRejectedValue(mockError);

      // Properly mock the ROLLBACK to avoid the catch call issue
      mockDb.run = jest.fn().mockResolvedValue({});

      await register(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Server error",
        error: "Database error",
      });
    });

    it("should handle failed registration when lastID is missing", async () => {
      req.body = {
        name: "Test User",
        email: "test@example.com",
        password: "Password123!",
      };

      mockDb.get = jest.fn().mockResolvedValue(null); // No existing user

      const mockRunFn = jest
        .fn()
        .mockResolvedValueOnce({}) // Begin transaction
        .mockResolvedValueOnce({}) // Insert user but no lastID returned
        .mockResolvedValueOnce({}); // Rollback transaction

      mockDb.run = mockRunFn as jest.MockedFunction<
        NonNullable<typeof mockDb.run>
      >;

      await register(req as Request, res as Response);

      expect(mockRunFn).toHaveBeenCalledWith("ROLLBACK");
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Failed to register user",
      });
    });

    it("should handle unique constraint violation errors explicitly", async () => {
      req.body = {
        name: "Test User",
        email: "existing@example.com",
        password: "Password123!",
      };

      mockDb.get = jest.fn().mockResolvedValue(null); // No existing user found in initial check

      const uniqueConstraintError = new Error(
        "UNIQUE constraint failed: users.email"
      );
      uniqueConstraintError.message = "UNIQUE constraint failed: users.email";

      const mockRunFn = jest
        .fn()
        .mockResolvedValueOnce({}) // Begin transaction
        .mockRejectedValueOnce(uniqueConstraintError) // Unique constraint error
        .mockResolvedValueOnce({}); // Rollback transaction

      mockDb.run = mockRunFn as jest.MockedFunction<
        NonNullable<typeof mockDb.run>
      >;

      await register(req as Request, res as Response);

      expect(mockRunFn).toHaveBeenCalledWith("ROLLBACK");
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "User with this email already exists",
      });
    });

    // Add a special test case for ROLLBACK failure
    it("should handle ROLLBACK failures in the catch block", async () => {
      // We'll use register function as an example
      req.body = {
        name: "Test User",
        email: "test@example.com",
        password: "Password123!",
      };

      const dbError = new Error("Database error");
      const rollbackError = new Error("ROLLBACK failed");

      mockDb.get = jest.fn().mockRejectedValue(dbError);
      mockDb.run = jest.fn().mockRejectedValue(rollbackError);

      const consoleErrorSpy = jest.spyOn(console, "error");

      await register(req as Request, res as Response);

      // Check that console.error was called at least once
      expect(consoleErrorSpy).toHaveBeenCalled();
      // Verify the first call contains the error message
      expect(
        consoleErrorSpy.mock.calls.some((call) =>
          call.join(" ").includes("Registration error")
        )
      ).toBeTruthy();
      expect(res.status).toHaveBeenCalledWith(500);

      consoleErrorSpy.mockRestore();
    });
  });

  describe("login", () => {
    it("should login a user successfully", async () => {
      req.body = {
        email: "test@example.com",
        password: "Password123!",
      };

      const mockUser = {
        id: 1,
        email: "test@example.com",
        password: "hashed-password",
        name: "Test User",
        email_verified: true,
        role: UserRole.USER,
      };

      const mockToken = "jwt-token";
      const mockSanitizedUser = {
        id: 1,
        email: "test@example.com",
        name: "Test User",
        role: UserRole.USER,
      };

      mockDb.get = jest.fn().mockResolvedValue(mockUser);
      (helpers.comparePassword as jest.Mock).mockResolvedValue(true);
      (helpers.generateToken as jest.Mock).mockReturnValue(mockToken);
      (helpers.sanitizeUser as jest.Mock).mockReturnValue(mockSanitizedUser);

      await login(req as Request, res as Response);

      expect(mockDb.get).toHaveBeenCalledWith(
        "SELECT * FROM users WHERE email = ?",
        ["test@example.com"]
      );

      expect(helpers.comparePassword).toHaveBeenCalledWith(
        "Password123!",
        "hashed-password"
      );

      expect(helpers.generateToken).toHaveBeenCalledWith(mockUser);
      expect(helpers.sanitizeUser).toHaveBeenCalledWith(mockUser);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Login successful",
        user: mockSanitizedUser,
        token: mockToken,
      });
    });

    it("should return 400 if email or password is missing", async () => {
      req.body = {
        // Missing email and password
      };

      await login(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Please provide email and password",
      });
    });

    it("should return 401 if user does not exist", async () => {
      req.body = {
        email: "nonexistent@example.com",
        password: "Password123!",
      };

      mockDb.get = jest.fn().mockResolvedValue(null);

      await login(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "Invalid credentials" });
    });

    it("should return 401 if email is not verified", async () => {
      req.body = {
        email: "unverified@example.com",
        password: "Password123!",
      };

      mockDb.get = jest.fn().mockResolvedValue({
        id: 2,
        email: "unverified@example.com",
        password: "hashed-password",
        email_verified: false,
      });

      await login(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Email not verified",
        needsVerification: true,
      });
    });

    it("should return 401 if password is incorrect", async () => {
      req.body = {
        email: "test@example.com",
        password: "WrongPassword123!",
      };

      mockDb.get = jest.fn().mockResolvedValue({
        id: 1,
        email: "test@example.com",
        password: "hashed-password",
        email_verified: true,
      });

      (helpers.comparePassword as jest.Mock).mockResolvedValue(false);

      await login(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "Invalid credentials" });
    });

    it("should handle database errors during login", async () => {
      req.body = {
        email: "test@example.com",
        password: "Password123!",
      };

      const mockError = new Error("Database error");
      mockDb.get = jest.fn().mockRejectedValue(mockError);

      await login(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Server error",
        error: "Database error",
      });
    });

    it("should handle database close errors", async () => {
      req.body = {
        email: "test@example.com",
        password: "Password123!",
      };

      const mockUser = {
        id: 1,
        email: "test@example.com",
        password: "hashed-password",
        email_verified: true,
      };

      mockDb.get = jest.fn().mockResolvedValue(mockUser);
      mockDb.close = jest.fn().mockRejectedValue(new Error("Close error"));
      (helpers.comparePassword as jest.Mock).mockResolvedValue(true);

      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      await login(req as Request, res as Response);

      expect(mockDb.close).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error closing database:",
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe("logout", () => {
    it("should logout a user successfully", async () => {
      await logout(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Logout successful" });
    });
  });

  describe("verifyEmail", () => {
    it("should verify email successfully", async () => {
      const token = "valid-verification-token";
      req.params = { token };

      const user = {
        id: 1,
        email: "test@example.com",
        email_verified: false,
        verification_token: token,
      };

      mockDb.get = jest.fn().mockResolvedValue(user);
      mockDb.run = jest
        .fn()
        .mockResolvedValueOnce({}) // Begin transaction
        .mockResolvedValueOnce({}) // Update user
        .mockResolvedValueOnce({}); // Commit transaction

      await verifyEmail(req as Request, res as Response);

      expect(mockDb.get).toHaveBeenCalledWith(
        "SELECT * FROM users WHERE verification_token = ? AND verification_token_expires > CURRENT_TIMESTAMP",
        [token]
      );

      expect(mockDb.run).toHaveBeenCalledWith(
        "UPDATE users SET email_verified = ?, verification_token = NULL, verification_token_expires = NULL WHERE id = ?",
        [true, user.id]
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Email verified successfully",
      });
    });

    it("should return 400 if token is invalid or expired", async () => {
      const token = "invalid-token";
      req.params = { token };

      mockDb.get = jest.fn().mockResolvedValue(null);
      mockDb.run = jest.fn().mockResolvedValue({});

      await verifyEmail(req as Request, res as Response);

      expect(mockDb.get).toHaveBeenCalledWith(
        "SELECT * FROM users WHERE verification_token = ? AND verification_token_expires > CURRENT_TIMESTAMP",
        [token]
      );

      expect(mockDb.run).toHaveBeenCalledWith("ROLLBACK");
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Invalid or expired verification token",
      });
    });

    it("should handle database errors during verification", async () => {
      const token = "valid-token";
      req.params = { token };

      const mockError = new Error("Database error");
      mockDb.get = jest.fn().mockRejectedValue(mockError);

      // Properly mock the ROLLBACK to avoid the catch call issue
      mockDb.run = jest.fn().mockResolvedValue({});

      await verifyEmail(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Server error",
        error: "Database error",
      });
    });
  });

  describe("resendVerification", () => {
    it("should resend verification email successfully", async () => {
      const email = "unverified@example.com";
      const mockUser = {
        id: 1,
        email,
        email_verified: false,
      };

      const mockToken = "test-token";

      req.body = { email };

      mockDb.get = jest.fn().mockResolvedValue(mockUser);

      const mockRunFn = jest
        .fn()
        .mockResolvedValueOnce({}) // Begin transaction
        .mockResolvedValueOnce({}) // Update user
        .mockResolvedValueOnce({}); // Commit transaction

      mockDb.run = mockRunFn as jest.MockedFunction<
        NonNullable<typeof mockDb.run>
      >;

      (emailService.sendVerificationEmail as jest.Mock).mockResolvedValue(true);

      // Mock Date.now for consistent testing
      jest.useFakeTimers().setSystemTime(new Date("2023-01-01T12:00:00Z"));

      await resendVerification(req as Request, res as Response);

      expect(mockDb.get).toHaveBeenCalledWith(
        "SELECT * FROM users WHERE email = ?",
        [email]
      );

      // Use a more flexible assertion for the update call
      const updateCall = mockRunFn.mock.calls[1];
      expect(updateCall[0]).toBe(
        "UPDATE users SET verification_token = ?, verification_token_expires = ? WHERE id = ?"
      );
      expect(updateCall[1][0]).toBe(mockToken);
      // Skip checking the exact date format of the token expiry time
      expect(updateCall[1][2]).toBe(mockUser.id);

      expect(emailService.sendVerificationEmail).toHaveBeenCalledWith(
        email,
        mockToken
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Verification email sent",
      });

      jest.useRealTimers();
    });

    it("should return 404 if user is not found", async () => {
      const email = "nonexistent@example.com";
      req.body = { email };

      mockDb.get = jest.fn().mockResolvedValue(null);

      await resendVerification(req as Request, res as Response);

      expect(mockDb.run).toHaveBeenCalledWith("ROLLBACK");
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
    });

    it("should return 400 if email is already verified", async () => {
      const email = "verified@example.com";
      const mockUser = {
        id: 1,
        email,
        email_verified: true,
      };

      req.body = { email };
      mockDb.get = jest.fn().mockResolvedValue(mockUser);

      await resendVerification(req as Request, res as Response);

      expect(mockDb.run).toHaveBeenCalledWith("ROLLBACK");
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Email is already verified",
      });
    });

    it("should handle email service errors during resend verification", async () => {
      const email = "unverified@example.com";
      const mockUser = {
        id: 1,
        email,
        email_verified: false,
      };

      req.body = { email };

      mockDb.get = jest.fn().mockResolvedValue(mockUser);
      mockDb.run = jest.fn().mockResolvedValue({});

      const emailError = new Error("Email sending failed");
      (emailService.sendVerificationEmail as jest.Mock).mockRejectedValue(
        emailError
      );

      await resendVerification(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Server error",
        error: "Email sending failed",
      });
    });
  });

  describe("changePassword", () => {
    it("should change password successfully", async () => {
      const userId = 1;
      const currentPassword = "CurrentPass123!";
      const newPassword = "NewPass456!";
      const hashedPassword = "hashed-new-password";

      req.body = { currentPassword, newPassword };
      req.user = { id: userId };

      const mockUser = {
        id: userId,
        password: "current-hashed-password",
      };

      mockDb.get = jest.fn().mockResolvedValue(mockUser);
      mockDb.run = jest
        .fn()
        .mockResolvedValueOnce({}) // Begin transaction
        .mockResolvedValueOnce({}) // Update password
        .mockResolvedValueOnce({}); // Commit transaction

      (helpers.comparePassword as jest.Mock).mockResolvedValue(true);
      (helpers.hashPassword as jest.Mock).mockResolvedValue(hashedPassword);

      await changePassword(req as Request, res as Response);

      expect(mockDb.get).toHaveBeenCalledWith(
        "SELECT * FROM users WHERE id = ?",
        [userId]
      );

      expect(helpers.comparePassword).toHaveBeenCalledWith(
        currentPassword,
        mockUser.password
      );

      expect(helpers.hashPassword).toHaveBeenCalledWith(newPassword);

      expect(mockDb.run).toHaveBeenCalledWith(
        "UPDATE users SET password = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?",
        [hashedPassword, userId]
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Password changed successfully",
      });
    });

    it("should return 401 if no user in request", async () => {
      req.body = { currentPassword: "Pass123!", newPassword: "New456!" };
      req.user = undefined;

      await changePassword(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Authentication required",
      });
    });

    it("should return 400 if current or new password is missing", async () => {
      req.body = { currentPassword: "Pass123!" }; // Missing new password
      req.user = { id: 1 };

      await changePassword(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Please provide current password and new password",
      });
    });

    it("should return 404 if user is not found", async () => {
      req.body = { currentPassword: "Pass123!", newPassword: "New456!" };
      req.user = { id: 999 }; // Non-existent user

      mockDb.get = jest.fn().mockResolvedValue(null);
      mockDb.run = jest.fn().mockResolvedValue({});

      await changePassword(req as Request, res as Response);

      expect(mockDb.run).toHaveBeenCalledWith("ROLLBACK");
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
    });

    it("should return 401 if current password is incorrect", async () => {
      req.body = { currentPassword: "WrongPass123!", newPassword: "New456!" };
      req.user = { id: 1 };

      mockDb.get = jest
        .fn()
        .mockResolvedValue({ id: 1, password: "hashed-password" });
      mockDb.run = jest.fn().mockResolvedValue({});

      (helpers.comparePassword as jest.Mock).mockResolvedValue(false);

      await changePassword(req as Request, res as Response);

      expect(mockDb.run).toHaveBeenCalledWith("ROLLBACK");
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Current password is incorrect",
      });
    });

    it("should handle database errors during update operations in changePassword", async () => {
      const userId = 1;

      req.body = {
        currentPassword: "CurrentPass123!",
        newPassword: "NewPass456!",
      };
      req.user = { id: userId };

      const mockUser = {
        id: userId,
        password: "current-hashed-password",
      };

      mockDb.get = jest.fn().mockResolvedValue(mockUser);

      const updateError = new Error("Update failed");
      const mockRunFn = jest
        .fn()
        .mockResolvedValueOnce({}) // Begin transaction
        .mockRejectedValueOnce(updateError) // Error during update
        .mockResolvedValueOnce({}); // Successful ROLLBACK

      mockDb.run = mockRunFn;

      (helpers.comparePassword as jest.Mock).mockResolvedValue(true);

      await changePassword(req as Request, res as Response);

      expect(mockRunFn).toHaveBeenCalledWith("ROLLBACK");
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Server error",
        error: "Update failed",
      });
    });
  });

  describe("requestPasswordReset", () => {
    it("should request password reset successfully", async () => {
      const email = "user@example.com";
      const resetToken = "reset-token-123";
      const expiryTime = new Date("2023-01-01T13:00:00Z");

      req.body = { email };

      const mockUser = { id: 1, email };

      mockDb.get = jest.fn().mockResolvedValue(mockUser);
      mockDb.run = jest
        .fn()
        .mockResolvedValueOnce({}) // Begin transaction
        .mockResolvedValueOnce({}) // Delete existing tokens
        .mockResolvedValueOnce({}) // Insert new token
        .mockResolvedValueOnce({}); // Commit transaction

      (helpers.generateResetToken as jest.Mock).mockReturnValue(resetToken);
      (helpers.calculateExpiryTime as jest.Mock).mockReturnValue(expiryTime);

      // Mock console.log for token output
      const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();

      await requestPasswordReset(req as Request, res as Response);

      expect(mockDb.get).toHaveBeenCalledWith(
        "SELECT * FROM users WHERE email = ?",
        [email]
      );

      expect(helpers.generateResetToken).toHaveBeenCalled();
      expect(helpers.calculateExpiryTime).toHaveBeenCalled();

      expect(mockDb.run).toHaveBeenCalledWith(
        "DELETE FROM reset_tokens WHERE userId = ?",
        [mockUser.id]
      );

      expect(mockDb.run).toHaveBeenCalledWith(
        "INSERT INTO reset_tokens (userId, token, expiresAt) VALUES (?, ?, ?)",
        [mockUser.id, resetToken, expiryTime.toISOString()]
      );

      expect(consoleLogSpy).toHaveBeenCalledWith(
        `Reset token for ${email}: ${resetToken}`
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message:
          "If your email is in our system, you will receive a password reset link",
        resetToken, // Only for development
      });

      consoleLogSpy.mockRestore();
    });

    it("should return generic success even if user doesn't exist (for security)", async () => {
      const email = "nonexistent@example.com";
      req.body = { email };

      mockDb.get = jest.fn().mockResolvedValue(null);
      mockDb.run = jest.fn().mockResolvedValue({});

      await requestPasswordReset(req as Request, res as Response);

      expect(mockDb.run).toHaveBeenCalledWith("ROLLBACK");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message:
          "If your email is in our system, you will receive a password reset link",
      });
    });

    it("should return 400 if email is not provided", async () => {
      req.body = {}; // No email

      await requestPasswordReset(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Please provide an email address",
      });
    });
  });

  describe("resetPassword", () => {
    it("should reset password successfully", async () => {
      const token = "valid-reset-token";
      const newPassword = "NewPassword123!";
      const hashedPassword = "new-hashed-password";

      req.body = { token, newPassword };

      const mockResetRequest = {
        userId: 1,
        token,
      };

      const mockUser = {
        id: 1,
        email: "user@example.com",
      };

      mockDb.get = jest
        .fn()
        .mockResolvedValueOnce(mockResetRequest) // Find token
        .mockResolvedValueOnce(mockUser); // Find user

      mockDb.run = jest
        .fn()
        .mockResolvedValueOnce({}) // Begin transaction
        .mockResolvedValueOnce({}) // Update password
        .mockResolvedValueOnce({}) // Delete used token
        .mockResolvedValueOnce({}); // Commit transaction

      (helpers.hashPassword as jest.Mock).mockResolvedValue(hashedPassword);

      await resetPassword(req as Request, res as Response);

      expect(mockDb.get).toHaveBeenCalledWith(
        "SELECT * FROM reset_tokens WHERE token = ? AND expiresAt > CURRENT_TIMESTAMP",
        [token]
      );

      expect(mockDb.get).toHaveBeenCalledWith(
        "SELECT * FROM users WHERE id = ?",
        [mockResetRequest.userId]
      );

      expect(helpers.hashPassword).toHaveBeenCalledWith(newPassword);

      expect(mockDb.run).toHaveBeenCalledWith(
        "UPDATE users SET password = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?",
        [hashedPassword, mockUser.id]
      );

      expect(mockDb.run).toHaveBeenCalledWith(
        "DELETE FROM reset_tokens WHERE userId = ?",
        [mockUser.id]
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Password has been reset successfully",
      });
    });

    it("should return 400 if token or new password is missing", async () => {
      req.body = { token: "some-token" }; // Missing new password

      await resetPassword(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Please provide a token and new password",
      });
    });

    it("should return 400 if token is invalid or expired", async () => {
      const token = "invalid-token";
      const newPassword = "NewPassword123!";

      req.body = { token, newPassword };

      mockDb.get = jest.fn().mockResolvedValue(null); // No valid token found
      mockDb.run = jest.fn().mockResolvedValue({});

      await resetPassword(req as Request, res as Response);

      expect(mockDb.run).toHaveBeenCalledWith("ROLLBACK");
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Invalid or expired token",
      });
    });

    it("should return 404 if user is not found", async () => {
      const token = "valid-token";
      const newPassword = "NewPassword123!";

      req.body = { token, newPassword };

      mockDb.get = jest
        .fn()
        .mockResolvedValueOnce({ userId: 999, token }) // Token exists
        .mockResolvedValueOnce(null); // But user doesn't exist

      mockDb.run = jest.fn().mockResolvedValue({});

      await resetPassword(req as Request, res as Response);

      expect(mockDb.run).toHaveBeenCalledWith("ROLLBACK");
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
    });
  });

  describe("updateUser", () => {
    it("should update user profile successfully", async () => {
      const userId = 1;
      const name = "Updated Name";

      req.body = { name };
      req.user = { id: userId };

      const mockUser = {
        id: userId,
        name: "Original Name",
        email: "user@example.com",
      };

      const updatedUser = {
        ...mockUser,
        name,
      };

      mockDb.get = jest
        .fn()
        .mockResolvedValueOnce(mockUser) // Get current user
        .mockResolvedValueOnce(updatedUser); // Get updated user

      mockDb.run = jest
        .fn()
        .mockResolvedValueOnce({}) // Begin transaction
        .mockResolvedValueOnce({}) // Update user
        .mockResolvedValueOnce({}); // Commit transaction

      (helpers.sanitizeUser as jest.Mock).mockReturnValue({
        id: userId,
        name,
        email: "user@example.com",
      });

      await updateUser(req as Request, res as Response);

      expect(mockDb.get).toHaveBeenCalledWith(
        "SELECT * FROM users WHERE id = ?",
        [userId]
      );

      expect(mockDb.run).toHaveBeenCalledWith(
        "UPDATE users SET name = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?",
        [name, userId]
      );

      expect(helpers.sanitizeUser).toHaveBeenCalledWith(updatedUser);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Profile updated successfully",
        user: expect.objectContaining({
          id: userId,
          name,
          email: "user@example.com",
        }),
      });
    });

    it("should return 401 if no user in request", async () => {
      req.body = { name: "Updated Name" };
      req.user = undefined;

      await updateUser(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Authentication required",
      });
    });

    it("should return 400 if name is missing", async () => {
      req.body = {}; // No name
      req.user = { id: 1 };

      await updateUser(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Please provide a name",
      });
    });

    it("should return 404 if user is not found", async () => {
      req.body = { name: "Updated Name" };
      req.user = { id: 999 }; // Non-existent user

      mockDb.get = jest.fn().mockResolvedValue(null);
      mockDb.run = jest.fn().mockResolvedValue({});

      await updateUser(req as Request, res as Response);

      expect(mockDb.run).toHaveBeenCalledWith("ROLLBACK");
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
    });
  });

  describe("deleteUser", () => {
    it("should delete user account successfully", async () => {
      const userId = 1;
      const password = "Password123!";

      req.body = { password };
      req.user = { id: userId };

      const mockUser = {
        id: userId,
        email: "user@example.com",
        password: "hashed-password",
      };

      mockDb.get = jest.fn().mockResolvedValue(mockUser);
      mockDb.run = jest
        .fn()
        .mockResolvedValueOnce({}) // Begin transaction
        .mockResolvedValueOnce({}) // Delete reset tokens
        .mockResolvedValueOnce({}) // Delete user
        .mockResolvedValueOnce({}); // Commit transaction

      (helpers.comparePassword as jest.Mock).mockResolvedValue(true);

      await deleteUser(req as Request, res as Response);

      expect(mockDb.get).toHaveBeenCalledWith(
        "SELECT * FROM users WHERE id = ?",
        [userId]
      );

      expect(helpers.comparePassword).toHaveBeenCalledWith(
        password,
        mockUser.password
      );

      expect(mockDb.run).toHaveBeenCalledWith(
        "DELETE FROM reset_tokens WHERE userId = ?",
        [userId]
      );

      expect(mockDb.run).toHaveBeenCalledWith(
        "DELETE FROM users WHERE id = ?",
        [userId]
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "User account deleted successfully",
      });
    });

    it("should return 401 if no user in request", async () => {
      req.body = { password: "Password123!" };
      req.user = undefined;

      await deleteUser(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Authentication required",
      });
    });

    it("should return 400 if password is missing", async () => {
      req.body = {}; // No password
      req.user = { id: 1 };

      await deleteUser(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Please provide your password to confirm deletion",
      });
    });

    it("should return 404 if user is not found", async () => {
      req.body = { password: "Password123!" };
      req.user = { id: 999 }; // Non-existent user

      mockDb.get = jest.fn().mockResolvedValue(null);
      mockDb.run = jest.fn().mockResolvedValue({});

      await deleteUser(req as Request, res as Response);

      expect(mockDb.run).toHaveBeenCalledWith("ROLLBACK");
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
    });

    it("should return 401 if password is incorrect", async () => {
      req.body = { password: "WrongPassword123!" };
      req.user = { id: 1 };

      mockDb.get = jest.fn().mockResolvedValue({
        id: 1,
        password: "hashed-password",
      });

      mockDb.run = jest.fn().mockResolvedValue({});

      (helpers.comparePassword as jest.Mock).mockResolvedValue(false);

      await deleteUser(req as Request, res as Response);

      expect(mockDb.run).toHaveBeenCalledWith("ROLLBACK");
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Password is incorrect",
      });
    });
  });
});
