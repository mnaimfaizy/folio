import dotenv from "dotenv";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UserRole } from "../models/User";

dotenv.config();

// Extend Express Request interface to include user property
declare module "express-serve-static-core" {
  interface Request {
    user?: jwt.JwtPayload;
  }
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "default_secret"
    );

    // Add user to request object
    req.user = decoded as jwt.JwtPayload;

    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
    return;
  }
};

// Optional authentication middleware - doesn't require auth but will use it if available
export const authenticateOptional = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // No auth token, continue without user info
      next();
      return;
    }

    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "default_secret"
    );

    // Add user to request object
    req.user = decoded as jwt.JwtPayload;

    next();
  } catch {
    // Invalid token, but it's optional so just continue without user info
    next();
    return;
  }
};

// Admin middleware to check if user has admin role
export const isAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.user && req.user.role === UserRole.ADMIN) {
    next();
  } else {
    res
      .status(403)
      .json({ message: "Access denied: Admin privilege required" });
    return;
  }
};

// Role-based middleware for future expansion of roles
export const hasRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (req.user && roles.includes(req.user.role as string)) {
      next();
    } else {
      res
        .status(403)
        .json({ message: "Access denied: Insufficient privileges" });
      return;
    }
  };
};
