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
      // Handle the simplified token format
      token = auth.jwt;
      
      // Check if token is expired
      if (auth.expires_at) {
        const expiresAt = new Date(auth.expires_at * 1000); // Convert to milliseconds
        const now = new Date();
        if (now >= expiresAt) {
          console.log('Token expired, clearing auth data');
          await SecureStore.deleteItemAsync('stogie-auth-jwt');
          token = null;
        }
      }
    }
  } catch (error) {
    console.log('Error getting auth token:', error);
  }

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add Authorization header if token exists
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    headers,
    ...options,
  });

  // If we get a 401 and this is an authenticated endpoint, the token might be expired
  if (response.status === 401 && token) {
    console.log('Received 401 with token - token might be expired');
    // Clear the stored auth data
    try {
      await SecureStore.deleteItemAsync('stogie-auth-jwt');
    } catch (error) {
      console.log('Error clearing expired token:', error);
    }
  }

  return response;
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
