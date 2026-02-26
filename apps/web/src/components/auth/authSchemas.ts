import * as z from 'zod';

// ── Reusable field definitions ─────────────────────────────────────────────

/** Strong password: 8+ chars, ≥1 uppercase, ≥1 lowercase, ≥1 digit. */
export const strongPasswordField = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

// ── Auth form schemas ──────────────────────────────────────────────────────

/** Login form. */
export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

/** Sign-up form. */
export const signupSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
export type SignupFormValues = z.infer<typeof signupSchema>;

/** "Forgot password" — request a reset link by email. */
export const requestPasswordResetSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});
export type RequestPasswordResetFormValues = z.infer<
  typeof requestPasswordResetSchema
>;

/** "Set new password" — used after clicking a reset link. */
export const setNewPasswordSchema = z
  .object({
    password: strongPasswordField,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
export type SetNewPasswordFormValues = z.infer<typeof setNewPasswordSchema>;

/** "Change password" — authenticated user changing their own password. */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: strongPasswordField,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  });
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

// ── Admin-specific schemas ─────────────────────────────────────────────────

/** Admin: create a new user. */
export const adminCreateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: strongPasswordField,
  role: z.string(),
  email_verified: z.boolean(),
  sendVerificationEmail: z.boolean(),
});
export type AdminCreateUserFormValues = z.infer<typeof adminCreateUserSchema>;

/** Admin: force-reset a user's password. */
export const adminSetPasswordSchema = z
  .object({
    newPassword: strongPasswordField,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });
export type AdminSetPasswordFormValues = z.infer<typeof adminSetPasswordSchema>;
