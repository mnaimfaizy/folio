import express, { Router } from 'express';
import {
  changePassword,
  deleteUser,
  getCurrentUser,
  login,
  logout,
  logoutAll,
  refreshSession,
  register,
  requestPasswordReset,
  resendVerification,
  resetPassword,
  updateUser,
  verifyEmail,
} from '../controllers/authController';
import {
  loginRateLimiter,
  passwordResetRateLimiter,
  registerRateLimiter,
  resendVerificationRateLimiter,
} from '../middleware/authRateLimit';
import { authenticate } from '../middleware/auth';

const router: Router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the user
 *         email:
 *           type: string
 *           description: The user email
 *         name:
 *           type: string
 *           description: The user full name
 *         role:
 *           type: string
 *           enum: [USER, ADMIN]
 *           description: User role
 *         isVerified:
 *           type: boolean
 *           description: Whether the email is verified
 *         createdAt:
 *           type: string
 *           format: date
 *           description: Date user was created
 *       example:
 *         id: 1
 *         email: user@example.com
 *         name: John Doe
 *         role: user
 *         isVerified: true
 *         createdAt: 2023-01-01T00:00:00.000Z
 *     UserResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: User ID
 *         email:
 *           type: string
 *           description: User email
 *         name:
 *           type: string
 *           description: User full name
 *         role:
 *           type: string
 *           description: User role
 *         isVerified:
 *           type: boolean
 *           description: Email verification status
 *     AuthResponse:
 *       type: object
 *       properties:
 *         user:
 *           $ref: '#/components/schemas/UserResponse'
 *         token:
 *           type: string
 *           description: JWT token
 *       example:
 *         user:
 *           id: 1
 *           email: user@example.com
 *           name: John Doe
 *           role: USER
 *           isVerified: true
 *         token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 */

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication and management
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: User successfully registered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/UserResponse'
 *       400:
 *         description: Invalid input or email already in use
 *       429:
 *         description: Too many authentication attempts
 *       500:
 *         description: Server error
 */
router.post(
  '/register',
  registerRateLimiter,
  register as express.RequestHandler,
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login to the application
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid credentials or account not verified
 *       429:
 *         description: Too many authentication attempts
 *       500:
 *         description: Server error
 */
router.post('/login', loginRateLimiter, login as express.RequestHandler);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token using refresh token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Session refreshed successfully
 *       400:
 *         description: Missing refresh token
 *       401:
 *         description: Invalid or expired refresh token
 *       429:
 *         description: Too many authentication attempts
 *       500:
 *         description: Server error
 */
router.post(
  '/refresh',
  loginRateLimiter,
  refreshSession as express.RequestHandler,
);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout from the application
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Logout successful
 *       500:
 *         description: Server error
 */
router.post('/logout', (req: express.Request, res: express.Response) => {
  return logout(req, res);
});

/**
 * @swagger
 * /api/auth/logout-all:
 *   post:
 *     summary: Logout from all active sessions
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All sessions logged out successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post(
  '/logout-all',
  authenticate,
  (req: express.Request, res: express.Response) => {
    return logoutAll(req, res);
  },
);

/**
 * @swagger
 * /api/auth/request-password-reset:
 *   post:
 *     summary: Request a password reset email
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Password reset email sent
 *       429:
 *         description: Too many authentication attempts
 *       500:
 *         description: Server error
 */
router.post(
  '/request-password-reset',
  passwordResetRateLimiter,
  (req: express.Request, res: express.Response) => {
    return requestPasswordReset(req, res);
  },
);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password using token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Password successfully reset
 *       400:
 *         description: Invalid or expired token
 *       429:
 *         description: Too many authentication attempts
 *       500:
 *         description: Server error
 */
router.post(
  '/reset-password',
  passwordResetRateLimiter,
  (req: express.Request, res: express.Response) => {
    return resetPassword(req, res);
  },
);

/**
 * @swagger
 * /api/auth/verify-email/{token}:
 *   get:
 *     summary: Verify user email using token
 *     tags: [Authentication]
 *     parameters:
 *       - in: path
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: Verification token
 *     responses:
 *       200:
 *         description: Email successfully verified
 *       400:
 *         description: Invalid or expired token
 *       500:
 *         description: Server error
 */
router.get(
  '/verify-email/:token',
  (req: express.Request, res: express.Response) => {
    return verifyEmail(req, res);
  },
);

/**
 * @swagger
 * /api/auth/resend-verification:
 *   post:
 *     summary: Resend verification email
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Verification email sent
 *       400:
 *         description: Email already verified
 *       404:
 *         description: User not found
 *       429:
 *         description: Too many authentication attempts
 *       500:
 *         description: Server error
 */
router.post(
  '/resend-verification',
  resendVerificationRateLimiter,
  (req: express.Request, res: express.Response) => {
    return resendVerification(req, res);
  },
);

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     summary: Change user password
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Password successfully changed
 *       400:
 *         description: Invalid current password
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post(
  '/change-password',
  authenticate,
  (req: express.Request, res: express.Response) => {
    return changePassword(req, res);
  },
);

/**
 * @swagger
 * /api/auth/update-profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put(
  '/update-profile',
  authenticate,
  (req: express.Request, res: express.Response) => {
    return updateUser(req, res);
  },
);

/**
 * @swagger
 * /api/auth/delete-account:
 *   delete:
 *     summary: Delete user account
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account successfully deleted
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.delete(
  '/delete-account',
  authenticate,
  (req: express.Request, res: express.Response) => {
    return deleteUser(req, res);
  },
);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current authenticated user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/UserResponse'
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.get(
  '/me',
  authenticate,
  (req: express.Request, res: express.Response) => {
    return getCurrentUser(req, res);
  },
);

export default router;
