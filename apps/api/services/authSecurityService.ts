type LoginAttemptState = {
  failedAttempts: number;
  lastFailedAt: number;
  lockedUntil?: number;
};

const DEFAULT_LOCKOUT_THRESHOLD = 5;
const DEFAULT_LOCKOUT_MS = 15 * 60 * 1000;
const DEFAULT_BACKOFF_BASE_MS = 1000;
const DEFAULT_BACKOFF_MAX_MS = 30 * 1000;
const DEFAULT_STATE_TTL_MS = 24 * 60 * 60 * 1000;

const parseEnvNumber = (key: string, defaultValue: number): number => {
  const parsed = Number(process.env[key]);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : defaultValue;
};

const lockoutThreshold = parseEnvNumber(
  'AUTH_LOCKOUT_THRESHOLD',
  DEFAULT_LOCKOUT_THRESHOLD,
);
const lockoutMs = parseEnvNumber('AUTH_LOCKOUT_MS', DEFAULT_LOCKOUT_MS);
const backoffBaseMs = parseEnvNumber(
  'AUTH_BACKOFF_BASE_MS',
  DEFAULT_BACKOFF_BASE_MS,
);
const backoffMaxMs = parseEnvNumber(
  'AUTH_BACKOFF_MAX_MS',
  DEFAULT_BACKOFF_MAX_MS,
);
const stateTtlMs = parseEnvNumber(
  'AUTH_SECURITY_STATE_TTL_MS',
  DEFAULT_STATE_TTL_MS,
);

const loginAttemptsByKey = new Map<string, LoginAttemptState>();

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

const normalizeIp = (ip?: string): string => {
  if (!ip) {
    return 'unknown';
  }

  return ip.startsWith('::ffff:') ? ip.slice(7) : ip;
};

const buildLoginAttemptKey = (email: string, ip?: string): string => {
  return `${normalizeEmail(email)}::${normalizeIp(ip)}`;
};

const calculateBackoffMs = (failedAttempts: number): number => {
  if (failedAttempts <= 1) {
    return 0;
  }

  return Math.min(backoffBaseMs * 2 ** (failedAttempts - 2), backoffMaxMs);
};

const pruneStaleState = (now: number): void => {
  for (const [key, state] of loginAttemptsByKey.entries()) {
    const hasExpiredLock = state.lockedUntil ? state.lockedUntil <= now : true;
    const hasExpiredWindow = now - state.lastFailedAt > stateTtlMs;

    if (hasExpiredLock && hasExpiredWindow) {
      loginAttemptsByKey.delete(key);
    }
  }
};

export const getClientIp = (ip?: string): string => normalizeIp(ip);

export const evaluateLoginAttempt = (
  email: string,
  ip?: string,
): { allowed: true } | { allowed: false; retryAfterMs: number } => {
  const now = Date.now();
  pruneStaleState(now);

  const state = loginAttemptsByKey.get(buildLoginAttemptKey(email, ip));
  if (!state) {
    return { allowed: true };
  }

  if (state.lockedUntil && state.lockedUntil > now) {
    return { allowed: false, retryAfterMs: state.lockedUntil - now };
  }

  const backoffMs = calculateBackoffMs(state.failedAttempts);
  const elapsedSinceFailure = now - state.lastFailedAt;

  if (backoffMs > elapsedSinceFailure) {
    return {
      allowed: false,
      retryAfterMs: backoffMs - elapsedSinceFailure,
    };
  }

  return { allowed: true };
};

export const recordFailedLoginAttempt = (email: string, ip?: string): void => {
  const now = Date.now();
  pruneStaleState(now);

  const key = buildLoginAttemptKey(email, ip);
  const previous = loginAttemptsByKey.get(key);

  const nextFailedAttempts = (previous?.failedAttempts || 0) + 1;
  const nextState: LoginAttemptState = {
    failedAttempts: nextFailedAttempts,
    lastFailedAt: now,
  };

  if (nextFailedAttempts >= lockoutThreshold) {
    nextState.lockedUntil = now + lockoutMs;
  }

  loginAttemptsByKey.set(key, nextState);
};

export const clearFailedLoginAttempts = (email: string, ip?: string): void => {
  loginAttemptsByKey.delete(buildLoginAttemptKey(email, ip));
};

export const __resetAuthSecurityState = (): void => {
  loginAttemptsByKey.clear();
};
