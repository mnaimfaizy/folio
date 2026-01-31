import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import config from "../../config/config";
import { User, UserRole } from "../../models/User";
import {
  calculateExpiryTime,
  comparePassword,
  generateResetToken,
  generateToken,
  hashPassword,
  isStrongPassword,
  isValidEmail,
  sanitizeUser,
  verifyToken,
} from "../../utils/helpers";

// Mock dependencies
jest.mock("bcryptjs");
jest.mock("crypto");
jest.mock("jsonwebtoken");
jest.mock("../../config/config", () => ({
  jwt: {
    secret: "test-secret",
    expiresIn: "1h",
  },
  resetPassword: {
    expiryTime: 3600000, // 1 hour
  },
}));

describe("Helper functions", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("hashPassword", () => {
    it("should generate salt and hash password", async () => {
      const mockSalt = "mock-salt";
      const mockHash = "hashed-password";
      const password = "password123";

      (bcrypt.genSalt as jest.Mock).mockResolvedValue(mockSalt);
      (bcrypt.hash as jest.Mock).mockResolvedValue(mockHash);

      const result = await hashPassword(password);

      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith(password, mockSalt);
      expect(result).toBe(mockHash);
    });
  });

  describe("comparePassword", () => {
    it("should compare password with hash", async () => {
      const password = "password123";
      const hashedPassword = "hashed-password";

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await comparePassword(password, hashedPassword);

      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(result).toBe(true);
    });

    it("should return false for non-matching passwords", async () => {
      const password = "wrong-password";
      const hashedPassword = "hashed-password";

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await comparePassword(password, hashedPassword);

      expect(result).toBe(false);
    });
  });

  describe("generateToken", () => {
    it("should generate JWT token for user", () => {
      const mockUser: User = {
        id: 1,
        name: "Test User",
        email: "test@example.com",
        password: "hashed-password",
        email_verified: true,
        verification_token: null,
        verification_token_expires: null,
        role: UserRole.USER,
      };

      (jwt.sign as jest.Mock).mockReturnValue("mock-token");

      const token = generateToken(mockUser);

      expect(jwt.sign).toHaveBeenCalledWith(
        { id: mockUser.id, email: mockUser.email, role: mockUser.role },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );
      expect(token).toBe("mock-token");
    });
  });

  describe("verifyToken", () => {
    it("should verify valid JWT token", () => {
      const mockToken = "valid-token";
      const mockPayload = { id: 1, email: "test@example.com" };

      (jwt.verify as jest.Mock).mockReturnValue(mockPayload);

      const result = verifyToken(mockToken);

      expect(jwt.verify).toHaveBeenCalledWith(mockToken, config.jwt.secret);
      expect(result).toEqual(mockPayload);
    });

    it("should return null for invalid token", () => {
      const mockToken = "invalid-token";

      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error("Invalid token");
      });

      const result = verifyToken(mockToken);

      expect(result).toBeNull();
    });
  });

  describe("generateResetToken", () => {
    it("should generate random token for password reset", () => {
      const mockBuffer = Buffer.from("mock-random-bytes");
      const mockToken = "mock-random-bytes-hex";

      (crypto.randomBytes as jest.Mock).mockReturnValue(mockBuffer);
      mockBuffer.toString = jest.fn().mockReturnValue(mockToken);

      const result = generateResetToken();

      expect(crypto.randomBytes).toHaveBeenCalledWith(20);
      expect(mockBuffer.toString).toHaveBeenCalledWith("hex");
      expect(result).toBe(mockToken);
    });
  });

  describe("calculateExpiryTime", () => {
    it("should calculate expiry time based on config", () => {
      // Mock the Date constructor
      const mockDate = new Date("2023-01-01T12:00:00Z");
      const originalDate = global.Date;
      global.Date = jest.fn(() => mockDate) as unknown as DateConstructor;

      // Mock the setTime method
      mockDate.setTime = jest.fn();
      mockDate.getTime = jest.fn().mockReturnValue(1672578000000); // Fixed timestamp for 2023-01-01T12:00:00Z

      // Call the function we're testing
      const result = calculateExpiryTime();

      // Verify expectations
      expect(mockDate.setTime).toHaveBeenCalledWith(
        mockDate.getTime() + config.resetPassword.expiryTime
      );
      expect(result).toBe(mockDate);

      // Restore original Date constructor
      global.Date = originalDate;
    });
  });

  describe("sanitizeUser", () => {
    it("should remove password from user object", () => {
      const mockUser: User = {
        id: 1,
        name: "Test User",
        email: "test@example.com",
        password: "hashed-password",
        email_verified: true,
        verification_token: null,
        verification_token_expires: null,
        role: UserRole.USER,
        createdAt: "2023-01-01T12:00:00Z",
        updatedAt: "2023-01-01T12:00:00Z",
      };

      const sanitized = sanitizeUser(mockUser);

      expect(sanitized).not.toHaveProperty("password");
      expect(sanitized).toMatchObject({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        role: mockUser.role,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
    });
  });

  describe("isValidEmail", () => {
    it("should return true for valid email formats", () => {
      expect(isValidEmail("user@example.com")).toBe(true);
      expect(isValidEmail("user.name+tag@example.co.uk")).toBe(true);
    });

    it("should return false for invalid email formats", () => {
      expect(isValidEmail("user@")).toBe(false);
      expect(isValidEmail("@example.com")).toBe(false);
      expect(isValidEmail("user example.com")).toBe(false);
      expect(isValidEmail("")).toBe(false);
    });
  });

  describe("isStrongPassword", () => {
    it("should return true for strong passwords", () => {
      expect(isStrongPassword("StrongP@ss1")).toBe(true);
      expect(isStrongPassword("C0mplex!Password")).toBe(true);
    });

    it("should return false for weak passwords", () => {
      expect(isStrongPassword("password")).toBe(false); // Missing uppercase, number, special char
      expect(isStrongPassword("Password1")).toBe(false); // Missing special char
      expect(isStrongPassword("pass@Word")).toBe(false); // Missing number
      expect(isStrongPassword("PASS@123")).toBe(false); // Missing lowercase
      expect(isStrongPassword("Pass1!")).toBe(false); // Too short
    });
  });
});
