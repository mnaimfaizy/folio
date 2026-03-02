import { NextFunction, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';

const isTest = process.env.NODE_ENV === 'test';

const passthroughLimiter = (
  _req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  next();
};

const createLimiter = (windowMs: number, max: number) => {
  if (isTest) {
    return passthroughLimiter;
  }

  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      message: 'Too many authentication attempts. Please try again later.',
    },
  });
};

export const loginRateLimiter = createLimiter(15 * 60 * 1000, 10);
export const registerRateLimiter = createLimiter(60 * 60 * 1000, 8);
export const passwordResetRateLimiter = createLimiter(60 * 60 * 1000, 6);
export const resendVerificationRateLimiter = createLimiter(60 * 60 * 1000, 6);
