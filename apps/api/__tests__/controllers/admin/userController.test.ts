import { Request, Response } from "express";
import { Database } from "sqlite";
import {
  changeUserPassword,
  createUser,
  deleteUser,
  getAllUsers,
  getUserById,
  updateUser,
} from "../../../controllers/admin/userController";
import { connectDatabase } from "../../../db/database";
import { UserRole } from "../../../models/User";
import { emailService } from "../../../utils/emailService";
import * as helpers from "../../../utils/helpers";

// Mock dependencies
jest.mock("../../../db/database");
jest.mock("../../../utils/emailService");
jest.mock("../../../utils/helpers");
jest.mock("crypto", () => ({
  randomBytes: jest.fn().mockImplementation(() => ({
    toString: jest.fn().mockReturnValue("mock-verification-token"),
  })),
}));

describe("Admin User Controller", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let mockDb: Partial<Database>;

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
      query: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllUsers", () => {
    it("should get all users successfully", async () => {
      const mockUsers = [
        {
          id: 1,
          name: "User One",
          email: "user1@example.com",
          role: UserRole.USER,
          email_verified: true,
        },
        {
          id: 2,
          name: "Admin User",
          email: "admin@example.com",
          role: UserRole.ADMIN,
          email_verified: true,
        },
      ];

      mockDb.all = jest.fn().mockResolvedValue(mockUsers);

      await getAllUsers(req as Request, res as Response);

      expect(mockDb.all).toHaveBeenCalledWith(
        expect.stringContaining("SELECT id, name, email, role, email_verified")
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ users: mockUsers });
    });

    it("should handle database errors", async () => {
      const mockError = new Error("Database error");
      mockDb.all = jest.fn().mockRejectedValue(mockError);

      await getAllUsers(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Server error",
        error: "Database error",
      });
    });
  });

  describe("getUserById", () => {
    it("should get a user by ID with their book collection", async () => {
      const userId = "1";
      req.params = { id: userId };

      const mockUser = {
        id: 1,
        name: "Test User",
        email: "user@example.com",
        role: UserRole.USER,
        email_verified: true,
        createdAt: "2023-01-01T12:00:00Z",
        updatedAt: null,
      };

      const mockBooks = [
        { id: 1, title: "Book 1", isbn: "1234567890" },
        { id: 2, title: "Book 2", isbn: "0987654321" },
      ];

      mockDb.get = jest.fn().mockResolvedValue(mockUser);
      mockDb.all = jest.fn().mockResolvedValue(mockBooks);

      await getUserById(req as Request, res as Response);

      expect(mockDb.get).toHaveBeenCalledWith(
        expect.stringContaining("SELECT id, name, email, role, email_verified"),
        [userId]
      );

      expect(mockDb.all).toHaveBeenCalledWith(
        expect.stringContaining("JOIN user_collections"),
        [userId]
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        user: {
          ...mockUser,
          books: mockBooks,
        },
      });
    });

    it("should return 404 if user not found", async () => {
      req.params = { id: "999" };
      mockDb.get = jest.fn().mockResolvedValue(null);

      await getUserById(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
    });

    it("should handle database errors", async () => {
      req.params = { id: "1" };
      const mockError = new Error("Database error");
      mockDb.get = jest.fn().mockRejectedValue(mockError);

      await getUserById(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Server error",
        error: "Database error",
      });
    });
  });

  describe("createUser", () => {
    it("should create a user successfully", async () => {
      req.body = {
        name: "New User",
        email: "newuser@example.com",
        password: "Password123!",
        role: UserRole.USER,
        email_verified: true,
      };

      const hashedPassword = "hashed-password";
      (helpers.hashPassword as jest.Mock).mockResolvedValue(hashedPassword);

      const mockNewUser = {
        id: 3,
        name: "New User",
        email: "newuser@example.com",
        role: UserRole.USER,
        email_verified: true,
        createdAt: "2023-01-01T12:00:00Z",
        updatedAt: null,
      };

      mockDb.get = jest
        .fn()
        .mockResolvedValueOnce(null) // No existing user
        .mockResolvedValueOnce(mockNewUser); // Newly created user

      mockDb.run = jest
        .fn()
        .mockResolvedValueOnce({}) // BEGIN TRANSACTION
        .mockResolvedValueOnce({ lastID: 3 }) // INSERT INTO users
        .mockResolvedValueOnce({}); // COMMIT

      await createUser(req as Request, res as Response);

      expect(mockDb.get).toHaveBeenCalledWith(
        "SELECT * FROM users WHERE LOWER(email) = LOWER(?)",
        ["newuser@example.com"]
      );

      expect(mockDb.run).toHaveBeenCalledWith("BEGIN TRANSACTION");
      expect(mockDb.run).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO users"),
        expect.arrayContaining([
          "New User",
          "newuser@example.com",
          hashedPassword,
          1,
          UserRole.USER,
        ])
      );
      expect(mockDb.run).toHaveBeenCalledWith("COMMIT");

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "User created successfully",
        user: mockNewUser,
      });
    });

    it("should create a user with verification email", async () => {
      req.body = {
        name: "Verify User",
        email: "verify@example.com",
        password: "Password123!",
        sendVerificationEmail: true,
      };

      const hashedPassword = "hashed-password";
      (helpers.hashPassword as jest.Mock).mockResolvedValue(hashedPassword);

      const mockNewUser = {
        id: 4,
        name: "Verify User",
        email: "verify@example.com",
        role: UserRole.USER,
        email_verified: false,
        createdAt: "2023-01-01T12:00:00Z",
        updatedAt: null,
      };

      mockDb.get = jest
        .fn()
        .mockResolvedValueOnce(null) // No existing user
        .mockResolvedValueOnce(mockNewUser); // Newly created user

      mockDb.run = jest
        .fn()
        .mockResolvedValueOnce({}) // BEGIN TRANSACTION
        .mockResolvedValueOnce({ lastID: 4 }) // INSERT INTO users
        .mockResolvedValueOnce({}); // COMMIT

      await createUser(req as Request, res as Response);

      expect(mockDb.run).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO users"),
        expect.arrayContaining([
          "Verify User",
          "verify@example.com",
          hashedPassword,
          0,
          UserRole.USER,
          "mock-verification-token",
        ])
      );

      expect(emailService.sendVerificationEmail).toHaveBeenCalledWith(
        "verify@example.com",
        "mock-verification-token"
      );

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "User created successfully. Verification email sent.",
        user: mockNewUser,
      });
    });

    it("should return 400 if required fields are missing", async () => {
      req.body = {
        name: "Incomplete User",
        // Missing email and password
      };

      await createUser(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Please provide name, email, and password",
      });
      expect(mockDb.run).not.toHaveBeenCalled();
    });

    it("should return 400 if user already exists", async () => {
      req.body = {
        name: "Existing User",
        email: "existing@example.com",
        password: "Password123!",
      };

      const existingUser = {
        id: 1,
        name: "Existing User",
        email: "existing@example.com",
      };

      mockDb.get = jest.fn().mockResolvedValue(existingUser);
      mockDb.run = jest.fn().mockResolvedValue({});

      await createUser(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "User with this email already exists",
      });
      expect(mockDb.run).toHaveBeenCalledWith("ROLLBACK");
    });

    it("should handle database errors", async () => {
      req.body = {
        name: "Error User",
        email: "error@example.com",
        password: "Password123!",
      };

      const mockError = new Error("Database error");
      mockDb.get = jest.fn().mockResolvedValue(null);
      mockDb.run = jest
        .fn()
        .mockResolvedValueOnce({}) // BEGIN TRANSACTION
        .mockRejectedValueOnce(mockError); // Error during INSERT

      await createUser(req as Request, res as Response);

      expect(mockDb.run).toHaveBeenCalledWith("ROLLBACK");
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Server error",
        error: "Database error",
      });
    });
  });

  describe("updateUser", () => {
    it("should update a user successfully", async () => {
      req.params = { id: "1" };
      req.body = {
        name: "Updated User",
        email: "updated@example.com",
        role: UserRole.ADMIN,
        email_verified: false,
      };

      const existingUser = {
        id: 1,
        name: "Original User",
        email: "original@example.com",
        role: UserRole.USER,
        email_verified: true,
      };

      const updatedUser = {
        id: 1,
        name: "Updated User",
        email: "updated@example.com",
        role: UserRole.ADMIN,
        email_verified: false,
        createdAt: "2023-01-01T12:00:00Z",
        updatedAt: "2023-01-02T12:00:00Z",
      };

      mockDb.get = jest
        .fn()
        .mockResolvedValueOnce(existingUser) // User exists
        .mockResolvedValueOnce(null) // No user with same email
        .mockResolvedValueOnce(updatedUser); // Updated user

      mockDb.run = jest
        .fn()
        .mockResolvedValueOnce({}) // BEGIN TRANSACTION
        .mockResolvedValueOnce({}) // UPDATE users
        .mockResolvedValueOnce({}); // COMMIT

      await updateUser(req as Request, res as Response);

      expect(mockDb.get).toHaveBeenCalledWith(
        "SELECT * FROM users WHERE id = ?",
        ["1"]
      );

      expect(mockDb.run).toHaveBeenCalledWith("BEGIN TRANSACTION");
      expect(mockDb.run).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE users SET"),
        expect.arrayContaining([
          "Updated User",
          "updated@example.com",
          UserRole.ADMIN,
          0,
          "1",
        ])
      );
      expect(mockDb.run).toHaveBeenCalledWith("COMMIT");

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "User updated successfully",
        user: updatedUser,
      });
    });

    it("should return 404 if user not found", async () => {
      req.params = { id: "999" };
      req.body = {
        name: "Update Nonexistent",
      };

      mockDb.get = jest.fn().mockResolvedValue(null);
      mockDb.run = jest.fn().mockResolvedValue({});

      await updateUser(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
      expect(mockDb.run).toHaveBeenCalledWith("ROLLBACK");
    });

    it("should return 400 if email is already in use", async () => {
      req.params = { id: "1" };
      req.body = {
        email: "taken@example.com",
      };

      const existingUser = {
        id: 1,
        name: "Original User",
        email: "original@example.com",
      };

      const conflictingUser = {
        id: 2,
        email: "taken@example.com",
      };

      mockDb.get = jest
        .fn()
        .mockResolvedValueOnce(existingUser) // User exists
        .mockResolvedValueOnce(conflictingUser); // Email already in use

      mockDb.run = jest.fn().mockResolvedValue({});

      await updateUser(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Email is already in use",
      });
      expect(mockDb.run).toHaveBeenCalledWith("ROLLBACK");
    });

    it("should return 400 if invalid role is specified", async () => {
      req.params = { id: "1" };
      req.body = {
        role: "INVALID_ROLE",
      };

      const existingUser = {
        id: 1,
        name: "Original User",
        email: "original@example.com",
      };

      mockDb.get = jest.fn().mockResolvedValue(existingUser);
      mockDb.run = jest.fn().mockResolvedValue({});

      await updateUser(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Invalid role specified",
      });
      expect(mockDb.run).toHaveBeenCalledWith("ROLLBACK");
    });

    it("should return 400 if no valid fields to update", async () => {
      req.params = { id: "1" };
      req.body = {}; // No fields to update

      const existingUser = {
        id: 1,
        name: "Original User",
        email: "original@example.com",
      };

      mockDb.get = jest.fn().mockResolvedValue(existingUser);
      mockDb.run = jest.fn().mockResolvedValue({});

      await updateUser(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "No valid fields to update",
      });
      expect(mockDb.run).toHaveBeenCalledWith("ROLLBACK");
    });

    it("should handle database errors", async () => {
      req.params = { id: "1" };
      req.body = {
        name: "Error Update",
      };

      const mockError = new Error("Database error");
      mockDb.get = jest.fn().mockResolvedValue({ id: 1 });
      mockDb.run = jest
        .fn()
        .mockResolvedValueOnce({}) // BEGIN TRANSACTION
        .mockRejectedValueOnce(mockError); // Error during UPDATE

      await updateUser(req as Request, res as Response);

      expect(mockDb.run).toHaveBeenCalledWith("ROLLBACK");
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Server error",
        error: "Database error",
      });
    });
  });

  describe("deleteUser", () => {
    it("should delete a user successfully", async () => {
      req.params = { id: "1" };

      const existingUser = {
        id: 1,
        name: "User to Delete",
      };

      mockDb.get = jest.fn().mockResolvedValue(existingUser);
      mockDb.run = jest
        .fn()
        .mockResolvedValueOnce({}) // BEGIN TRANSACTION
        .mockResolvedValueOnce({}) // DELETE FROM reset_tokens
        .mockResolvedValueOnce({}) // DELETE FROM user_collections
        .mockResolvedValueOnce({}) // DELETE FROM users
        .mockResolvedValueOnce({}); // COMMIT

      await deleteUser(req as Request, res as Response);

      expect(mockDb.get).toHaveBeenCalledWith(
        "SELECT * FROM users WHERE id = ?",
        ["1"]
      );

      expect(mockDb.run).toHaveBeenCalledWith("BEGIN TRANSACTION");
      expect(mockDb.run).toHaveBeenCalledWith(
        "DELETE FROM reset_tokens WHERE userId = ?",
        ["1"]
      );
      expect(mockDb.run).toHaveBeenCalledWith(
        "DELETE FROM user_collections WHERE userId = ?",
        ["1"]
      );
      expect(mockDb.run).toHaveBeenCalledWith(
        "DELETE FROM users WHERE id = ?",
        ["1"]
      );
      expect(mockDb.run).toHaveBeenCalledWith("COMMIT");

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "User deleted successfully",
      });
    });

    it("should return 404 if user not found", async () => {
      req.params = { id: "999" };
      mockDb.get = jest.fn().mockResolvedValue(null);
      mockDb.run = jest.fn().mockResolvedValue({});

      await deleteUser(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
      expect(mockDb.run).toHaveBeenCalledWith("ROLLBACK");
    });

    it("should handle database errors", async () => {
      req.params = { id: "1" };

      const mockError = new Error("Database error");
      mockDb.get = jest.fn().mockResolvedValue({ id: 1 });
      mockDb.run = jest
        .fn()
        .mockResolvedValueOnce({}) // BEGIN TRANSACTION
        .mockRejectedValueOnce(mockError); // Error during deletion

      await deleteUser(req as Request, res as Response);

      expect(mockDb.run).toHaveBeenCalledWith("ROLLBACK");
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Server error",
        error: "Database error",
      });
    });
  });

  describe("changeUserPassword", () => {
    it("should change user password successfully", async () => {
      req.params = { id: "1" };
      req.body = {
        newPassword: "NewPassword456!",
      };

      const existingUser = {
        id: 1,
        name: "Password Change User",
      };

      const hashedPassword = "new-hashed-password";
      (helpers.hashPassword as jest.Mock).mockResolvedValue(hashedPassword);

      mockDb.get = jest.fn().mockResolvedValue(existingUser);
      mockDb.run = jest
        .fn()
        .mockResolvedValueOnce({}) // BEGIN TRANSACTION
        .mockResolvedValueOnce({}) // UPDATE users
        .mockResolvedValueOnce({}); // COMMIT

      await changeUserPassword(req as Request, res as Response);

      expect(mockDb.get).toHaveBeenCalledWith(
        "SELECT * FROM users WHERE id = ?",
        ["1"]
      );

      expect(helpers.hashPassword).toHaveBeenCalledWith("NewPassword456!");

      expect(mockDb.run).toHaveBeenCalledWith("BEGIN TRANSACTION");
      expect(mockDb.run).toHaveBeenCalledWith(
        "UPDATE users SET password = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?",
        [hashedPassword, "1"]
      );
      expect(mockDb.run).toHaveBeenCalledWith("COMMIT");

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "User password changed successfully",
      });
    });

    it("should return 400 if new password is not provided", async () => {
      req.params = { id: "1" };
      req.body = {}; // No newPassword

      await changeUserPassword(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "New password is required",
      });
      expect(mockDb.run).not.toHaveBeenCalled();
    });

    it("should return 404 if user not found", async () => {
      req.params = { id: "999" };
      req.body = {
        newPassword: "NewPassword456!",
      };

      mockDb.get = jest.fn().mockResolvedValue(null);
      mockDb.run = jest.fn().mockResolvedValue({});

      await changeUserPassword(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
      expect(mockDb.run).toHaveBeenCalledWith("ROLLBACK");
    });

    it("should handle database errors", async () => {
      req.params = { id: "1" };
      req.body = {
        newPassword: "NewPassword456!",
      };

      const mockError = new Error("Database error");
      mockDb.get = jest.fn().mockResolvedValue({ id: 1 });
      mockDb.run = jest
        .fn()
        .mockResolvedValueOnce({}) // BEGIN TRANSACTION
        .mockRejectedValueOnce(mockError); // Error during UPDATE

      await changeUserPassword(req as Request, res as Response);

      expect(mockDb.run).toHaveBeenCalledWith("ROLLBACK");
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Server error",
        error: "Database error",
      });
    });
  });
});
