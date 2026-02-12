import axios, {
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from 'axios';
import appNavigate from '@/lib/navigation';
import { TokenManager } from './tokenManager';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const REQUEST_TIMEOUT = 30000; // 30 seconds
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_BASE = 1000; // 1 second

// Extended request config with retry tracking
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retryCount?: number;
  _isRetry?: boolean;
}

// Create a base axios instance with common configurations
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // Set to true if using cookies for auth
});

// List of endpoints that don't require authentication
const publicEndpoints = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/verify-email',
  '/api/auth/request-password-reset',
  '/api/auth/reset-password',
  '/api/auth/resend-verification',
  '/api/books', // Public book listing
];

// Check if endpoint is public
const isPublicEndpoint = (url: string | undefined): boolean => {
  if (!url) return false;
  return publicEndpoints.some((endpoint) => url.startsWith(endpoint));
};

// Retry delay with exponential backoff
const getRetryDelay = (retryCount: number): number => {
  return RETRY_DELAY_BASE * Math.pow(2, retryCount) + Math.random() * 1000;
};

// Check if error is retryable
const isRetryableError = (error: AxiosError): boolean => {
  // Don't retry client errors (4xx) except 408 (timeout)
  if (error.response) {
    const status = error.response.status;
    if (status === 408 || status >= 500) {
      return true;
    }
    return false;
  }
  // Retry network errors and timeouts
  return error.code === 'ECONNABORTED' || error.message === 'Network Error';
};

// Request interceptor to attach auth token and handle request configuration
api.interceptors.request.use(
  (config: ExtendedAxiosRequestConfig) => {
    // Skip token attachment for public endpoints
    if (!isPublicEndpoint(config.url)) {
      const token = TokenManager.getToken();

      if (token) {
        // Check if token is expired before making request
        if (TokenManager.isTokenExpired()) {
          console.warn('Session expired, redirecting to login');
          TokenManager.clearCredentials();
          appNavigate('/login');
          return Promise.reject(
            new Error('Session expired. Please log in again.'),
          );
        }

        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // Add request timestamp for debugging
    config.headers['X-Request-Time'] = new Date().toISOString();

    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  },
);

// Response interceptor for error handling, retry logic, and session management
api.interceptors.response.use(
  (response) => {
    // Successful response - just return it
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as ExtendedAxiosRequestConfig;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Initialize retry count
    originalRequest._retryCount = originalRequest._retryCount || 0;

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      // Don't redirect if already on a public endpoint
      if (!isPublicEndpoint(originalRequest.url)) {
        console.warn('Unauthorized request, clearing session');
        TokenManager.clearCredentials();

        // Dispatch custom event for auth state listeners
        window.dispatchEvent(new CustomEvent('auth:session-expired'));

        // Navigate to login
        appNavigate('/login');
      }
      return Promise.reject(error);
    }

    // Handle 403 Forbidden errors
    if (error.response?.status === 403) {
      console.warn('Access forbidden:', error.response.data);
      // Dispatch event for UI to handle
      window.dispatchEvent(
        new CustomEvent('auth:access-denied', {
          detail: { url: originalRequest.url },
        }),
      );
      return Promise.reject(error);
    }

    // Implement retry logic for retryable errors
    if (
      isRetryableError(error) &&
      originalRequest._retryCount < MAX_RETRY_ATTEMPTS &&
      !originalRequest._isRetry
    ) {
      originalRequest._retryCount += 1;
      originalRequest._isRetry = true;

      const delay = getRetryDelay(originalRequest._retryCount);
      console.log(
        `Retrying request (${originalRequest._retryCount}/${MAX_RETRY_ATTEMPTS}) after ${delay}ms`,
      );

      await new Promise((resolve) => setTimeout(resolve, delay));

      return api(originalRequest);
    }

    // Log error for debugging
    if (error.response) {
      console.error('API Error:', {
        status: error.response.status,
        url: originalRequest.url,
        message: error.response.data,
      });
    } else if (error.request) {
      console.error('Network Error:', {
        url: originalRequest.url,
        message: error.message,
      });
    }

    return Promise.reject(error);
  },
);

// Export typed request methods for convenience
export const apiGet = <T>(url: string, config?: AxiosRequestConfig) =>
  api.get<T>(url, config);

export const apiPost = <T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
) => api.post<T>(url, data, config);

export const apiPut = <T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
) => api.put<T>(url, data, config);

export const apiDelete = <T>(url: string, config?: AxiosRequestConfig) =>
  api.delete<T>(url, config);

export const apiPatch = <T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
) => api.patch<T>(url, data, config);

export default api;
