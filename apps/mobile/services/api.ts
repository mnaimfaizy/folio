import Constants from 'expo-constants';
import { Platform } from 'react-native';

import axios, { AxiosError, AxiosInstance } from 'axios';

import {
  getRefreshToken,
  getToken,
  removeRefreshToken,
  removeToken,
  setRefreshToken,
  setToken,
} from '../utils/storage';

const debugLog = (...args: unknown[]) => {
  if (__DEV__) console.log(...args);
};

type ExpoClientExtra = {
  expoClient?: {
    hostUri?: string;
  };
};

type ExpoConfigLike = {
  hostUri?: string;
  debuggerHost?: string;
  extra?: {
    apiUrl?: string;
  } & ExpoClientExtra;
};

const asExpoConfigLike = (value: unknown): ExpoConfigLike => {
  if (!value || typeof value !== 'object') {
    return {};
  }

  return value as ExpoConfigLike;
};

const getDevHost = (): string | null => {
  const constantsWithLegacyManifest = Constants as unknown as {
    manifest?: ExpoConfigLike;
    manifest2?: ExpoConfigLike;
  };

  const expoConfig = asExpoConfigLike(Constants.expoConfig);
  const manifest = asExpoConfigLike(constantsWithLegacyManifest.manifest);
  const manifest2 = asExpoConfigLike(constantsWithLegacyManifest.manifest2);

  const hostUri: string | undefined =
    expoConfig?.hostUri ||
    expoConfig?.debuggerHost ||
    manifest?.debuggerHost ||
    manifest2?.extra?.expoClient?.hostUri;

  if (!hostUri) return null;
  return hostUri.split(':')[0] || null;
};

const normalizeBaseUrl = (url: string): string => url.replace(/\/+$/, '');

const resolveBaseUrl = (): string => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  const configUrl = asExpoConfigLike(Constants.expoConfig).extra?.apiUrl;
  const candidate = (envUrl || configUrl || '').trim();

  // Always prefer explicit config if provided.
  if (candidate) {
    let baseUrl = normalizeBaseUrl(candidate);

    // On Android, `localhost` points at the device/emulator. Fix it automatically in dev.
    if (
      __DEV__ &&
      /localhost|127\.0\.0\.1/.test(baseUrl) &&
      Platform.OS === 'android'
    ) {
      if (Constants.isDevice) {
        const host = getDevHost();
        if (host) {
          baseUrl = baseUrl.replace(/localhost|127\.0\.0\.1/g, host);
        }
      } else {
        baseUrl = baseUrl.replace(/localhost|127\.0\.0\.1/g, '10.0.2.2');
      }
    }

    return baseUrl;
  }

  // Sensible fallbacks when nothing is configured.
  if (Platform.OS === 'android') return 'http://10.0.2.2:3000/api';
  return 'http://localhost:3000/api';
};

const BASE_URL = resolveBaseUrl();
debugLog('API URL:', BASE_URL);

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // Add timeout to avoid long loading times
});

let refreshInFlight: Promise<string | null> | null = null;

const refreshAccessToken = async (): Promise<string | null> => {
  if (refreshInFlight) {
    return refreshInFlight;
  }

  refreshInFlight = (async () => {
    try {
      const refreshToken = await getRefreshToken();
      if (!refreshToken) {
        return null;
      }

      const response = await axios.post<{
        token: string;
        refreshToken?: string;
      }>(`${BASE_URL}/auth/refresh`, {
        refreshToken,
      });

      if (!response.data.token) {
        return null;
      }

      await setToken(response.data.token);
      if (response.data.refreshToken) {
        await setRefreshToken(response.data.refreshToken);
      }

      return response.data.token;
    } catch {
      await removeToken();
      await removeRefreshToken();
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
};

// Request interceptor to add authentication token
api.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    debugLog('Auth Token:', token ? 'Present' : 'Missing');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (typeof error.config & {
          _authRetry?: boolean;
        })
      | null;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._authRetry
    ) {
      originalRequest._authRetry = true;
      const refreshedToken = await refreshAccessToken();

      if (refreshedToken) {
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${refreshedToken}`;
        return api.request(originalRequest);
      }
    }

    if (__DEV__ && error.response?.status === 401) {
      debugLog('API 401 — auth will handle token cleanup');
    }
    return Promise.reject(error);
  },
);

export default api;
