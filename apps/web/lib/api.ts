/**
 * API client utilities - matches mobile app API calls
 */

// Direct API URL - CORS is handled by backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://stogie-production.up.railway.app';

export interface SignInData {
  email: string;
  password: string;
}

export interface SignUpData {
  email: string;
  password: string;
  fullName?: string;
  username?: string;
}

export interface AuthResponse {
  success: boolean;
  session?: {
    access_token: string;
    expires_at?: number;
  };
  user?: {
    id: string;
    email: string;
    fullName?: string;
    username?: string;
    avatarUrl?: string;
  };
  error?: string;
}

/**
 * Sign in with email and password
 */
export async function signIn(data: SignInData): Promise<AuthResponse> {
  console.log('🔐 Signing in to:', `${API_BASE_URL}/api/auth/signin`);
  console.log('🔐 With data:', { email: data.email, password: '***' });
  
  const response = await fetch(`${API_BASE_URL}/api/auth/signin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  console.log('🔐 Response status:', response.status);
  const result = await response.json();
  console.log('🔐 Response data:', result);

  if (!response.ok) {
    throw new Error(result.error || 'Authentication failed');
  }

  return result;
}

/**
 * Sign up with email and password
 */
export async function signUp(data: SignUpData): Promise<AuthResponse> {
  console.log('🔐 Signing up to:', `${API_BASE_URL}/api/auth/signup`);
  console.log('🔐 With data:', { ...data, password: '***' });
  
  const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  console.log('🔐 Response status:', response.status);
  const result = await response.json();
  console.log('🔐 Response data:', result);

  if (!response.ok) {
    throw new Error(result.error || 'Sign up failed');
  }

  return result;
}

/**
 * Make authenticated API request
 */
export async function apiRequest(endpoint: string, options: RequestInit = {}, jwt?: string) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (jwt) {
    headers['Authorization'] = `Bearer ${jwt}`;
    console.log('🔐 API Request with JWT to:', endpoint);
    console.log('🔐 JWT preview:', jwt.substring(0, 30) + '...');
  } else {
    console.warn('⚠️ API Request without JWT to:', endpoint);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  console.log(`📡 Response from ${endpoint}:`, response.status, response.statusText);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    
    console.error(`❌ API Error [${response.status}] at ${endpoint}:`, error);
    
    // Log validation details if present
    if (error.details) {
      console.error('❌ Validation errors:', error.details);
    }
    
    // Handle authentication errors
    if (response.status === 401) {
      console.error('❌ Authentication failed:', error.error);
      
      // If token is invalid/expired, clear local storage and force re-login
      if (error.error?.includes('Invalid') || error.error?.includes('expired')) {
        console.log('🔄 Token expired, clearing auth...');
        localStorage.removeItem('stogie-auth-jwt');
        
        // Redirect to sign in
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
      }
    }
    
    // Include validation details in error message
    const errorMessage = error.error || `HTTP ${response.status}`;
    const validationInfo = error.details ? `\n\nValidation errors:\n${JSON.stringify(error.details, null, 2)}` : '';
    throw new Error(errorMessage + validationInfo);
  }

  const data = await response.json();
  console.log(`✅ Success response from ${endpoint}:`, data);
  
  // For validation errors, log the details
  if (data.details) {
    console.log('Validation details:', data.details);
  }
  
  return data;
}

