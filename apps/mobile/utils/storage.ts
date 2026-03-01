import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'library_auth_token';
const REFRESH_TOKEN_KEY = 'library_refresh_token';
const USER_KEY = 'library_user';

/**
 * Store authentication token securely
 */
export const setToken = async (token: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } catch (error) {
    if (__DEV__) console.error('Error storing token:', error);
  }
};

/**
 * Get stored authentication token
 */
export const getToken = async (): Promise<string | null> => {
  try {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    return token;
  } catch (error) {
    if (__DEV__) console.error('Error retrieving token:', error);
    return null;
  }
};

/**
 * Remove stored authentication token
 */
export const removeToken = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch (error) {
    if (__DEV__) console.error('Error removing token:', error);
  }
};

/**
 * Store refresh token securely
 */
export const setRefreshToken = async (token: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
  } catch (error) {
    if (__DEV__) console.error('Error storing refresh token:', error);
  }
};

/**
 * Get stored refresh token
 */
export const getRefreshToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  } catch (error) {
    if (__DEV__) console.error('Error retrieving refresh token:', error);
    return null;
  }
};

/**
 * Remove stored refresh token
 */
export const removeRefreshToken = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  } catch (error) {
    if (__DEV__) console.error('Error removing refresh token:', error);
  }
};

/**
 * Store user data
 */
export const setUser = async (user: object): Promise<void> => {
  try {
    const userData = JSON.stringify(user);
    await SecureStore.setItemAsync(USER_KEY, userData);
  } catch (error) {
    if (__DEV__) console.error('Error storing user data:', error);
  }
};

/**
 * Get stored user data
 */
export const getUser = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(USER_KEY);
  } catch (error) {
    if (__DEV__) console.error('Error retrieving user data:', error);
    return null;
  }
};

/**
 * Remove stored user data
 */
export const removeUser = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(USER_KEY);
  } catch (error) {
    if (__DEV__) console.error('Error removing user data:', error);
  }
};
