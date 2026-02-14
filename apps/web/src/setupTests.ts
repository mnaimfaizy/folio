// Global test setup for Vitest
import '@testing-library/jest-dom';
import { vi } from 'vitest';

const shouldSuppressConsoleError = (firstArg: unknown) => {
  if (typeof firstArg !== 'string') return false;
  return (
    firstArg.startsWith('Error') ||
    firstArg.startsWith('Change password error') ||
    firstArg.startsWith('Reset password error') ||
    firstArg.startsWith('Password reset error') ||
    firstArg.includes(
      'Unexpected key "books" found in preloadedState argument passed to createStore',
    )
  );
};

const shouldSuppressConsoleWarn = (firstArg: unknown) => {
  if (typeof firstArg !== 'string') return false;
  return firstArg.includes(
    'Unexpected key "books" found in preloadedState argument passed to createStore',
  );
};

const originalConsoleError = console.error.bind(console);
console.error = (...args: unknown[]) => {
  if (shouldSuppressConsoleError(args[0])) return;
  originalConsoleError(...args);
};

const originalConsoleWarn = console.warn.bind(console);
console.warn = (...args: unknown[]) => {
  if (shouldSuppressConsoleWarn(args[0])) return;
  originalConsoleWarn(...args);
};

vi.mock('@/context/AuthContext', () => {
  // Keep this mock lightweight: most component tests just need stable auth state.
  const React = require('react');

  const useAuth = vi.fn(() => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    isInitialized: true,
    error: null,
    login: vi.fn(async () => ({ success: true })),
    signup: vi.fn(async () => ({ success: true })),
    logout: vi.fn(async () => undefined),
    refreshSession: vi.fn(async () => true),
    updateUser: vi.fn(),
    clearError: vi.fn(),
    checkAuth: vi.fn(async () => true),
  }));

  const AuthProvider = ({ children }: { children: unknown }) =>
    React.createElement(React.Fragment, null, children);

  const withAuth = (Component: any) => (props: any) =>
    React.createElement(Component, { ...props, ...useAuth() });

  return {
    __esModule: true,
    default: {},
    useAuth,
    AuthProvider,
    withAuth,
  };
});

vi.mock('@/context/SettingsContext', async () => {
  const React = require('react');
  const { DEFAULT_SETTINGS } = await vi.importActual<any>(
    '@/services/settingsService',
  );

  const useSettings = vi.fn(() => ({
    settings: DEFAULT_SETTINGS,
    loading: false,
    error: false,
    refreshSettings: vi.fn(async () => undefined),
  }));

  const SettingsProvider = ({ children }: { children: unknown }) =>
    React.createElement(React.Fragment, null, children);

  return {
    __esModule: true,
    default: {},
    useSettings,
    SettingsProvider,
  };
});

// Set up common mocks that multiple tests might need
vi.mock('@/lib/navigation', () => ({
  default: vi.fn(),
  appNavigate: vi.fn(),
  registerNavigate: vi.fn(),
}));

// Mock axios to prevent actual network requests
vi.mock('axios', () => {
  return {
    default: {
      create: vi.fn(() => ({
        interceptors: {
          request: { use: vi.fn(), eject: vi.fn() },
          response: { use: vi.fn(), eject: vi.fn() },
        },
        get: vi.fn().mockResolvedValue({ data: {} }),
        post: vi.fn().mockResolvedValue({ data: {} }),
        put: vi.fn().mockResolvedValue({ data: {} }),
        delete: vi.fn().mockResolvedValue({ data: {} }),
      })),
      interceptors: {
        request: { use: vi.fn(), eject: vi.fn() },
        response: { use: vi.fn(), eject: vi.fn() },
      },
      get: vi.fn().mockResolvedValue({ data: {} }),
      post: vi.fn().mockResolvedValue({ data: {} }),
      put: vi.fn().mockResolvedValue({ data: {} }),
      delete: vi.fn().mockResolvedValue({ data: {} }),
    },
  };
});

// Mock Redux auth slice
vi.mock('@/store/slices/authSlice', async () => {
  const actual = await vi.importActual('@/store/slices/authSlice');
  return {
    ...actual,
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
    default: actual.default || vi.fn(),
  };
});

// Mock for ResizeObserver which is not available in test environment
class MockResizeObserver {
  observe() {
    return undefined;
  }
  unobserve() {
    return undefined;
  }
  disconnect() {
    return undefined;
  }
}

// Add to global
global.ResizeObserver = MockResizeObserver;

// Mock for matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Fix for navigation tests
Object.defineProperty(window, 'location', {
  writable: true,
  value: {
    href: 'http://localhost/',
    assign: vi.fn(),
    replace: vi.fn(),
    pathname: '/',
    origin: 'http://localhost',
  },
});
