import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'library_auth_token';
const USER_KEY = 'library_user';

/**
 * Store authentication token securely
 */
export const setToken = async (token: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } catch (error) {
    console.error('Error storing token:', error);
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
    console.error('Error retrieving token:', error);
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
    console.error('Error removing token:', error);
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
    console.error('Error storing user data:', error);
  }
};

/**
 * Get stored user data
 */
export const getUser = async (): Promise<string | null> => {
  try {
    const userData = await SecureStore.getItemAsync(USER_KEY);
    if (userData) {
      return JSON.parse(userData);
    }
    return null;
  } catch (error) {
    console.error('Error retrieving user data:', error);
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
    console.error('Error removing user data:', error);
  }
};
