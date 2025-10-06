// API utility for consistent backend URL handling
import * as SecureStore from 'expo-secure-store';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://stogie-production.up.railway.app';

// Cache the auth token in memory to avoid SecureStore flakiness
let tokenCache = null;
let lastFetch = 0;
const CACHE_DURATION = 5000; // 5 seconds

/**
 * Get auth token with caching (exported for use in other modules)
 */
export async function getAuthToken() {
  const now = Date.now();
  
  // Return cached token if recent
  if (tokenCache && (now - lastFetch) < CACHE_DURATION) {
    console.log('🚀 API: Using cached token');
    return tokenCache;
  }
  
  console.log('🚀 API: Fetching token from SecureStore');
  try {
    const authData = await SecureStore.getItemAsync('stogie-auth-jwt');
    console.log('📱 SecureStore authData:', authData ? 'exists' : 'null');
    
    if (authData) {
      const auth = JSON.parse(authData);
      console.log('🔑 Parsed auth keys:', Object.keys(auth));
      const token = auth.jwt;
      console.log('🎫 Token:', token ? 'exists' : 'null');
      
      // Check expiration
      if (auth.expires_at) {
        const expiresAt = new Date(auth.expires_at * 1000);
        if (new Date() >= expiresAt) {
          console.log('Token expired, clearing cache');
          await SecureStore.deleteItemAsync('stogie-auth-jwt');
          tokenCache = null;
          return null;
        }
      }
      
      // Cache the token
      tokenCache = token;
      lastFetch = now;
      return token;
    }
  } catch (error) {
    console.error('Error getting auth token:', error);
  }
  
  tokenCache = null;
  return null;
}

/**
 * Clear the token cache (call after logout)
 */
export function clearTokenCache() {
  tokenCache = null;
  lastFetch = 0;
}

/**
 * Make an API request with the correct base URL and automatic authentication
 * @param {string} endpoint - The API endpoint (e.g., '/api/cigars')
 * @param {RequestInit} options - Fetch options
 * @returns {Promise<Response>}
 */
export const apiRequest = async (endpoint, options = {}) => {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  // Get JWT token
  const token = await getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add Authorization header if token exists
  if (token) {
    console.log('Adding Authorization header with token');
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    console.log('No token available, making unauthenticated request');
  }

  console.log('🌐 Making API request to:', url);
  console.log('📋 Request headers:', headers);
  console.log('📦 Request method:', options.method || 'GET');

  // Set timeout for requests
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers,
    });

    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timed out');
    }
    throw error;
  }
};
