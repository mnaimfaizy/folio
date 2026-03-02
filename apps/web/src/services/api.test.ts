import type { InternalAxiosRequestConfig } from 'axios';
import appNavigate from '@/lib/navigation';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TokenManager } from './tokenManager';

const mockAxiosPost = vi.fn();
const mockApiRequest = vi.fn();
let requestInterceptor:
  | ((config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig)
  | undefined;
let responseErrorInterceptor:
  | ((error: unknown) => Promise<unknown>)
  | undefined;

const apiInstance = Object.assign(mockApiRequest, {
  interceptors: {
    request: {
      use: vi.fn((onFulfilled: (config: InternalAxiosRequestConfig) => any) => {
        requestInterceptor = onFulfilled;
      }),
    },
    response: {
      use: vi.fn((_: unknown, onRejected: (error: unknown) => Promise<any>) => {
        responseErrorInterceptor = onRejected;
      }),
    },
  },
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
});

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => apiInstance),
    post: mockAxiosPost,
  },
  post: mockAxiosPost,
}));

vi.mock('@/lib/navigation', () => ({ default: vi.fn() }));

vi.mock('./tokenManager', () => ({
  TokenManager: {
    getToken: vi.fn(),
    getRefreshToken: vi.fn(),
    setCredentials: vi.fn(),
    setToken: vi.fn(),
    setRefreshToken: vi.fn(),
    clearCredentials: vi.fn(),
  },
}));

await import('./api');

describe('api service auth refresh flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApiRequest.mockReset();
    expect(responseErrorInterceptor).toBeTypeOf('function');
  });

  it('uses single-flight refresh for concurrent 401 responses', async () => {
    vi.mocked(TokenManager.getRefreshToken).mockReturnValue('refresh-token');

    let resolveRefresh: ((value: unknown) => void) | null = null;
    const refreshPromise = new Promise((resolve) => {
      resolveRefresh = resolve;
    });
    mockAxiosPost.mockReturnValue(refreshPromise);

    mockApiRequest.mockResolvedValue({ data: { ok: true } });

    const errorA = {
      response: { status: 401 },
      config: { url: '/api/user/profile', headers: {} },
    };
    const errorB = {
      response: { status: 401 },
      config: { url: '/api/user/profile', headers: {} },
    };

    const pendingA = responseErrorInterceptor!(errorA);
    const pendingB = responseErrorInterceptor!(errorB);

    expect(mockAxiosPost).toHaveBeenCalledTimes(1);

    resolveRefresh?.({
      data: {
        token: 'new-access-token',
        refreshToken: 'new-refresh-token',
        user: { id: 1, name: 'Test', email: 'test@example.com', role: 'USER' },
      },
    });

    await Promise.all([pendingA, pendingB]);

    expect(mockAxiosPost).toHaveBeenCalledTimes(1);
    expect(TokenManager.setCredentials).toHaveBeenCalledWith(
      'new-access-token',
      { id: 1, name: 'Test', email: 'test@example.com', role: 'USER' },
      'new-refresh-token',
    );
    expect(mockApiRequest).toHaveBeenCalledTimes(2);
  });

  it('retries a request at most once after auth refresh', async () => {
    const error = {
      response: { status: 401 },
      config: { url: '/api/user/profile', headers: {}, _authRetry: true },
    };

    await expect(responseErrorInterceptor!(error)).rejects.toBe(error);

    expect(mockAxiosPost).not.toHaveBeenCalled();
    expect(TokenManager.clearCredentials).toHaveBeenCalledTimes(1);
    expect(appNavigate).toHaveBeenCalledWith('/login');
  });

  it('attaches bearer token for protected requests', () => {
    vi.mocked(TokenManager.getToken).mockReturnValue('access-token');

    const result = requestInterceptor!({
      url: '/api/user/profile',
      headers: {},
    } as InternalAxiosRequestConfig);

    expect(result.headers.Authorization).toBe('Bearer access-token');
  });
});
