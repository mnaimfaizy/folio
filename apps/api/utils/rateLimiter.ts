export interface SlidingWindowRateLimiterConfig {
  windowMs: number;
  maxRequests: number;
  stateKey?: string;
}

export interface SlidingWindowRateLimiter {
  isLimited: () => boolean;
  reset: () => void;
}

type GlobalState = typeof globalThis & {
  [key: string]: unknown;
};

export const createSlidingWindowRateLimiter = (
  config: SlidingWindowRateLimiterConfig,
): SlidingWindowRateLimiter => {
  const { windowMs, maxRequests, stateKey } = config;
  const globalState = globalThis as GlobalState;
  let internalTimestamps: number[] = [];

  const readTimestamps = (): number[] => {
    if (!stateKey) {
      return internalTimestamps;
    }

    const value = globalState[stateKey];
    if (
      Array.isArray(value) &&
      value.every((item) => typeof item === 'number')
    ) {
      return value;
    }

    return internalTimestamps;
  };

  const writeTimestamps = (timestamps: number[]): void => {
    internalTimestamps = timestamps;
    if (stateKey) {
      globalState[stateKey] = timestamps;
    }
  };

  const reset = (): void => {
    writeTimestamps([]);
  };

  const isLimited = (): boolean => {
    const now = Date.now();
    const activeTimestamps = readTimestamps().filter(
      (timestamp) => now - timestamp < windowMs,
    );

    if (activeTimestamps.length >= maxRequests) {
      writeTimestamps(activeTimestamps);
      return true;
    }

    activeTimestamps.push(now);
    writeTimestamps(activeTimestamps);
    return false;
  };

  return {
    isLimited,
    reset,
  };
};
