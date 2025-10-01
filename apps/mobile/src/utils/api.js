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
    console.log('Raw auth data from SecureStore:', authData ? 'exists' : 'null');
    
    if (authData) {
      const auth = JSON.parse(authData);
      console.log('Parsed auth data keys:', Object.keys(auth));
      
      // Handle the simplified token format
      token = auth.jwt;
      console.log('Extracted token:', token ? 'exists' : 'null');
      
      // Check if token is expired (only if expires_at exists)
      if (auth.expires_at) {
        const expiresAt = new Date(auth.expires_at * 1000); // Convert to milliseconds
        const now = new Date();
        console.log('Token expiration check:', { expiresAt, now, expired: now >= expiresAt });
        
        if (now >= expiresAt) {
          console.log('Token expired, clearing auth data');
          await SecureStore.deleteItemAsync('stogie-auth-jwt');
          token = null;
        }
      } else {
        console.log('No expiration time found, using token as-is');
      }
    } else {
      console.log('No auth data found in SecureStore');
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
    console.log('Adding Authorization header with token');
  } else {
    console.log('No token available, making unauthenticated request');
  }

  console.log('🌐 Making API request to:', url);
  console.log('📋 Request headers:', headers);
  console.log('📦 Request method:', options.method || 'GET');

  try {
    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
    
    const response = await fetch(url, {
      headers,
      signal: controller.signal,
      ...options,
    });
    
    clearTimeout(timeoutId);

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
  } catch (error) {
    console.error('❌ Network request failed:', error);
    console.error('🔍 Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack?.substring(0, 200)
    });
    
    // Provide more specific error messages
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - the server took too long to respond');
    } else if (error.message.includes('Network request failed')) {
      throw new Error('Network connection failed - check your internet connection');
    }
    
    throw error;
  }
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
