import { User } from '@/context/AuthContext';

// Storage keys
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';
const TOKEN_EXPIRY_KEY = 'auth_token_expiry';

// Legacy storage keys (for migration)
const LEGACY_TOKEN_KEY = 'token';
const LEGACY_USER_KEY = 'user';

// Token payload interface (decoded JWT)
interface TokenPayload {
  id: number;
  email: string;
  role: string;
  exp?: number;
  iat?: number;
}

/**
 * Decode JWT token without verification (helper for migration)
 * Note: This is for client-side use only - the server validates tokens
 */
const decodeTokenPayload = (token: string): TokenPayload | null => {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) {
      return null;
    }
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return JSON.parse(jsonPayload) as TokenPayload;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Migrate legacy tokens to new storage keys
 * This handles users who logged in before the auth system update
 */
const migrateLegacyTokens = (): void => {
  try {
    // Check if we have a legacy token but no new token
    const legacyToken = localStorage.getItem(LEGACY_TOKEN_KEY);
    const newToken = localStorage.getItem(TOKEN_KEY);

    if (legacyToken && !newToken) {
      // Migrate token
      localStorage.setItem(TOKEN_KEY, legacyToken);
      localStorage.removeItem(LEGACY_TOKEN_KEY);

      // Extract and store expiry time from migrated token
      const payload = decodeTokenPayload(legacyToken);
      if (payload?.exp) {
        localStorage.setItem(TOKEN_EXPIRY_KEY, String(payload.exp * 1000)); // Convert to ms
      }

      // Migrate user if exists
      const legacyUser = localStorage.getItem(LEGACY_USER_KEY);
      if (legacyUser) {
        localStorage.setItem(USER_KEY, legacyUser);
        localStorage.removeItem(LEGACY_USER_KEY);
      }
    }
  } catch (error) {
    console.error('Error migrating legacy tokens:', error);
  }
};

/**
 * Ensure token expiry is stored for existing tokens
 * This repairs tokens that were migrated without expiry extraction
 */
const ensureTokenExpiry = (): void => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);

    // If we have a token but no expiry, extract and store it
    if (token && !expiry) {
      const payload = decodeTokenPayload(token);
      if (payload?.exp) {
        localStorage.setItem(TOKEN_EXPIRY_KEY, String(payload.exp * 1000));
      }
    }
  } catch (error) {
    console.error('Error ensuring token expiry:', error);
  }
};

// Run migration and repair on module load
migrateLegacyTokens();
ensureTokenExpiry();

/**
 * TokenManager - Centralized token management utility
 * Handles token storage, retrieval, validation, and expiration
 */
export const TokenManager = {
  /**
   * Store authentication token
   */
  setToken: (token: string): void => {
    try {
      localStorage.setItem(TOKEN_KEY, token);
      // Clean up any legacy keys
      localStorage.removeItem(LEGACY_TOKEN_KEY);

      // Extract and store expiry time from JWT
      const payload = TokenManager.decodeToken(token);
      if (payload?.exp) {
        localStorage.setItem(TOKEN_EXPIRY_KEY, String(payload.exp * 1000)); // Convert to ms
      }
    } catch (error) {
      console.error('Error storing token:', error);
    }
  },

  /**
   * Get stored authentication token
   */
  getToken: (): string | null => {
    try {
      // Try new key first, then fall back to legacy
      let token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        token = localStorage.getItem(LEGACY_TOKEN_KEY);
        // Migrate if found under legacy key
        if (token) {
          migrateLegacyTokens();
        }
      }
      return token;
    } catch (error) {
      console.error('Error retrieving token:', error);
      return null;
    }
  },

  /**
   * Remove stored authentication token
   */
  removeToken: (): void => {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(TOKEN_EXPIRY_KEY);
      // Also remove legacy keys
      localStorage.removeItem(LEGACY_TOKEN_KEY);
    } catch (error) {
      console.error('Error removing token:', error);
    }
  },

  /**
   * Store user data
   */
  setUser: (user: User): void => {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      // Clean up legacy key
      localStorage.removeItem(LEGACY_USER_KEY);
    } catch (error) {
      console.error('Error storing user:', error);
    }
  },

  /**
   * Get stored user data
   */
  getUser: (): User | null => {
    try {
      let userData = localStorage.getItem(USER_KEY);
      if (!userData) {
        // Fall back to legacy key
        userData = localStorage.getItem(LEGACY_USER_KEY);
        if (userData) {
          // Migrate to new key
          localStorage.setItem(USER_KEY, userData);
          localStorage.removeItem(LEGACY_USER_KEY);
        }
      }
      if (userData) {
        return JSON.parse(userData) as User;
      }
      return null;
    } catch (error) {
      console.error('Error retrieving user:', error);
      return null;
    }
  },

  /**
   * Remove stored user data
   */
  removeUser: (): void => {
    try {
      localStorage.removeItem(USER_KEY);
      // Also remove legacy key
      localStorage.removeItem(LEGACY_USER_KEY);
    } catch (error) {
      console.error('Error removing user:', error);
    }
  },

  /**
   * Store all credentials (token + user)
   */
  setCredentials: (token: string, user: User): void => {
    TokenManager.setToken(token);
    TokenManager.setUser(user);
  },

  /**
   * Clear all stored credentials
   */
  clearCredentials: (): void => {
    TokenManager.removeToken();
    TokenManager.removeUser();
  },

  /**
   * Check if user is authenticated (has valid token)
   */
  isAuthenticated: (): boolean => {
    const token = TokenManager.getToken();
    if (!token) {
      return false;
    }
    return !TokenManager.isTokenExpired();
  },

  /**
   * Decode JWT token without verification
   * Note: This is for client-side use only - the server validates tokens
   */
  decodeToken: (token: string): TokenPayload | null => {
    try {
      const base64Url = token.split('.')[1];
      if (!base64Url) {
        return null;
      }
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join(''),
      );
      return JSON.parse(jsonPayload) as TokenPayload;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  },

  /**
   * Get token expiry time in milliseconds
   */
  getTokenExpiry: (): number | null => {
    try {
      const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
      if (expiry) {
        return parseInt(expiry, 10);
      }

      // Fallback: decode from token
      const token = TokenManager.getToken();
      if (token) {
        const payload = TokenManager.decodeToken(token);
        if (payload?.exp) {
          return payload.exp * 1000;
        }
      }
      return null;
    } catch {
      return null;
    }
  },

  /**
   * Check if token is expired
   */
  isTokenExpired: (): boolean => {
    const token = TokenManager.getToken();
    if (!token) {
      // No token at all - consider expired
      return true;
    }

    const expiry = TokenManager.getTokenExpiry();
    if (!expiry) {
      // We have a token but can't determine expiry
      // Let the server validate it rather than assuming expired
      return false;
    }
    // Add a small buffer (10 seconds) to account for clock drift
    return Date.now() >= expiry - 10000;
  },

  /**
   * Check if token should be refreshed (approaching expiry)
   */
  shouldRefreshToken: (thresholdMs: number = 5 * 60 * 1000): boolean => {
    const expiry = TokenManager.getTokenExpiry();
    if (!expiry) {
      return true;
    }
    return Date.now() >= expiry - thresholdMs;
  },

  /**
   * Get time until token expires in milliseconds
   */
  getTimeUntilExpiry: (): number | null => {
    const expiry = TokenManager.getTokenExpiry();
    if (!expiry) {
      return null;
    }
    const timeLeft = expiry - Date.now();
    return timeLeft > 0 ? timeLeft : 0;
  },

  /**
   * Get user role from stored user or token
   */
  getUserRole: (): string | null => {
    const user = TokenManager.getUser();
    if (user?.role) {
      return user.role;
    }

    // Fallback: decode from token
    const token = TokenManager.getToken();
    if (token) {
      const payload = TokenManager.decodeToken(token);
      return payload?.role || null;
    }
    return null;
  },

  /**
   * Check if user has a specific role
   */
  hasRole: (role: string): boolean => {
    const userRole = TokenManager.getUserRole();
    return userRole === role;
  },

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole: (roles: string[]): boolean => {
    const userRole = TokenManager.getUserRole();
    return userRole !== null && roles.includes(userRole);
  },
};

export default TokenManager;
