import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import {
  authenticate,
  authenticateOptional,
  hasRole,
  isAdmin,
} from "../../middleware/auth";
import { UserRole } from "../../models/User";

// Mock dependencies
jest.mock("jsonwebtoken");
jest.mock("dotenv", () => ({
  config: jest.fn(),
}));

describe("Authentication Middleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      headers: {},
      user: undefined,
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();

    // Default process.env for tests
    process.env.JWT_SECRET = "test_secret";
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("authenticate", () => {
    it("should authenticate valid token and set user in request", () => {
      const mockUser = {
        id: 1,
        email: "test@example.com",
        role: UserRole.USER,
      };
      const mockToken = "valid.token.here";

      req.headers = {
        authorization: `Bearer ${mockToken}`,
      };

      (jwt.verify as jest.Mock).mockReturnValue(mockUser);

      authenticate(req as Request, res as Response, next);

      expect(jwt.verify).toHaveBeenCalledWith(mockToken, "test_secret");
      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should return 401 if no auth header is provided", () => {
      req.headers = {};

      authenticate(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Authentication required",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should return 401 if auth header has incorrect format", () => {
      req.headers = {
        authorization: "Basic username:password",
      };

      authenticate(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Authentication required",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should return 401 if token is invalid", () => {
      req.headers = {
        authorization: "Bearer invalid.token",
      };

      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error("Invalid token");
      });

      authenticate(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Invalid or expired token",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should use default secret if JWT_SECRET is not defined", () => {
      const originalSecret = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;

      const mockUser = { id: 1, email: "test@example.com" };
      const mockToken = "valid.token.here";

      req.headers = {
        authorization: `Bearer ${mockToken}`,
      };

      (jwt.verify as jest.Mock).mockReturnValue(mockUser);

      authenticate(req as Request, res as Response, next);

      expect(jwt.verify).toHaveBeenCalledWith(mockToken, "default_secret");

      // Restore original value
      process.env.JWT_SECRET = originalSecret;
    });
  });

  describe("authenticateOptional", () => {
    it("should authenticate valid token and set user in request", () => {
      const mockUser = {
        id: 1,
        email: "test@example.com",
        role: UserRole.USER,
      };
      const mockToken = "valid.token.here";

      req.headers = {
        authorization: `Bearer ${mockToken}`,
      };

      (jwt.verify as jest.Mock).mockReturnValue(mockUser);

      authenticateOptional(req as Request, res as Response, next);

      expect(jwt.verify).toHaveBeenCalledWith(mockToken, "test_secret");
      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalled();
    });

    it("should continue without user if no auth header is provided", () => {
      req.headers = {};

      authenticateOptional(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeUndefined();
    });

    it("should continue without user if auth header has incorrect format", () => {
      req.headers = {
        authorization: "Basic username:password",
      };

      authenticateOptional(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeUndefined();
    });

    it("should continue without user if token is invalid", () => {
      req.headers = {
        authorization: "Bearer invalid.token",
      };

      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error("Invalid token");
      });

      authenticateOptional(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeUndefined();
    });
  });

  describe("isAdmin", () => {
    it("should allow access if user has ADMIN role", () => {
      req.user = { id: 1, role: UserRole.ADMIN };

      isAdmin(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should deny access if user doesn't have ADMIN role", () => {
      req.user = { id: 1, role: UserRole.USER };

      isAdmin(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: "Access denied: Admin privilege required",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should deny access if user is not set", () => {
      req.user = undefined;

      isAdmin(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: "Access denied: Admin privilege required",
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("hasRole", () => {
    it("should allow access if user has a permitted role", () => {
      req.user = { id: 1, role: UserRole.ADMIN };
      const middleware = hasRole([UserRole.ADMIN, "EDITOR"]);

      middleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should deny access if user doesn't have a permitted role", () => {
      req.user = { id: 1, role: UserRole.USER };
      const middleware = hasRole([UserRole.ADMIN, "EDITOR"]);

      middleware(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: "Access denied: Insufficient privileges",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should deny access if user is not set", () => {
      req.user = undefined;
      const middleware = hasRole([UserRole.ADMIN, "EDITOR"]);

      middleware(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: "Access denied: Insufficient privileges",
      });
      expect(next).not.toHaveBeenCalled();
    });
  });
});
