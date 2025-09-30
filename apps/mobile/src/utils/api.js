// API utility for consistent backend URL handling
import * as SecureStore from 'expo-secure-store';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://stogie-production.up.railway.app';

/**
 * Make an API request with the correct base URL and automatic authentication
 * @param {string} endpoint - The API endpoint (e.g., '/api/cigars')
 * @param {RequestInit} options - Fetch options
 * @returns {Promise<Response>}
 */
export const apiRequest = async (endpoint, options = {}) => {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  // Get JWT token from SecureStore
  let token = null;
  try {
    const authData = await SecureStore.getItemAsync('stogie-auth-jwt');
    if (authData) {
      const auth = JSON.parse(authData);
      token = auth.jwt;
    }
  } catch (error) {
    console.log('No auth token found:', error);
  }

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add Authorization header if token exists
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return fetch(url, {
    headers,
    ...options,
  });
};

/**
 * Make an authenticated API request with explicit token
 * @param {string} endpoint - The API endpoint
 * @param {RequestInit} options - Fetch options
 * @param {string} token - JWT token
 * @returns {Promise<Response>}
 */
export const authenticatedRequest = async (endpoint, options = {}, token) => {
  return apiRequest(endpoint, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
};
