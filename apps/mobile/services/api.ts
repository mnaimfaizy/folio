import Constants from 'expo-constants';

import axios, { AxiosError, AxiosInstance } from 'axios';

import { getToken, removeToken } from '../utils/storage';

// Use environment variable if available, otherwise use local network IP
// that can be accessed from mobile devices on the same network
const BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'http://192.168.1.9:3000/api'; // Replace with your computer's local IP

console.warn('API URL:', BASE_URL); // For debugging purposes

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // Add timeout to avoid long loading times
});

// Request interceptor to add authentication token
api.interceptors.request.use(
  async config => {
    const token = await getToken();
    console.warn('Auth Token:', token ? 'Present' : 'Missing'); // Debug token presence

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  response => response,
  (error: AxiosError) => {
    const status = error.response?.status;

    // Handle authentication errors
    if (status === 401) {
      // Token expired or invalid
      removeToken();
      // Redirect to login (will be handled by the auth context)
    }

    return Promise.reject(error);
  }
);

export default api;
