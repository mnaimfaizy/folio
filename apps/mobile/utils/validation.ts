/**
 * Email validation using regex
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Password validation - minimum 8 characters with at least one letter and one number
 */
export const isValidPassword = (password: string): boolean => {
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  return passwordRegex.test(password);
};

/**
 * Field is not empty validation
 */
export const isNotEmpty = (value?: string): boolean => {
  return !!value && value.trim() !== '';
};

/**
 * Validate if passwords match
 */
export const passwordsMatch = (password: string, confirmPassword: string): boolean => {
  return password === confirmPassword;
};

/**
 * Validate signup form
 */
export const validateSignup = (
  name: string,
  email: string,
  password: string,
  confirmPassword: string
): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!isNotEmpty(name)) {
    errors.name = 'Name is required';
  }

  if (!isNotEmpty(email)) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!isNotEmpty(password)) {
    errors.password = 'Password is required';
  } else if (!isValidPassword(password)) {
    errors.password =
      'Password must be at least 8 characters with at least one letter and one number';
  }

  if (!isNotEmpty(confirmPassword)) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (!passwordsMatch(password, confirmPassword)) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return errors;
};

/**
 * Validate login form
 */
export const validateLogin = (email: string, password: string): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!isNotEmpty(email)) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!isNotEmpty(password)) {
    errors.password = 'Password is required';
  }

  return errors;
};

/**
 * Validate password reset request form
 */
export const validatePasswordResetRequest = (email: string): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!isNotEmpty(email)) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(email)) {
    errors.email = 'Please enter a valid email address';
  }

  return errors;
};

/**
 * Validate password reset form
 */
export const validatePasswordReset = (
  password: string,
  confirmPassword: string
): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!isNotEmpty(password)) {
    errors.password = 'Password is required';
  } else if (!isValidPassword(password)) {
    errors.password =
      'Password must be at least 8 characters with at least one letter and one number';
  }

  if (!isNotEmpty(confirmPassword)) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (!passwordsMatch(password, confirmPassword)) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return errors;
};
