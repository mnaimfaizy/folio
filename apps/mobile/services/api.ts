import Constants from 'expo-constants';
import { Platform } from 'react-native';

import axios, { AxiosError, AxiosInstance } from 'axios';

import { getToken, removeToken } from '../utils/storage';

const debugLog = (...args: unknown[]) => {
  if (__DEV__) console.log(...args);
};

const getDevHost = (): string | null => {
  const expoConfig: any = Constants.expoConfig;
  const manifest: any = (Constants as any).manifest;
  const manifest2: any = (Constants as any).manifest2;

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
  const configUrl = (Constants.expoConfig?.extra as any)?.apiUrl as string | undefined;
  const candidate = (envUrl || configUrl || '').trim();

  // Always prefer explicit config if provided.
  if (candidate) {
    let baseUrl = normalizeBaseUrl(candidate);

    // On Android, `localhost` points at the device/emulator. Fix it automatically in dev.
    if (__DEV__ && /localhost|127\.0\.0\.1/.test(baseUrl) && Platform.OS === 'android') {
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
  (error: AxiosError) => {
    const status = error.response?.status;

    // Handle authentication errors
    if (status === 401) {
      // Token expired or invalid
      removeToken();
      // Redirect to login (will be handled by the auth context)
    }

    return Promise.reject(error);
  },
);

export default api;
