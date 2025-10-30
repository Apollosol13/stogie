'use client';

import { create } from 'zustand';

const AUTH_KEY = 'stogie-auth-jwt';

export interface User {
  id: string;
  email: string;
  name?: string;
  username?: string;
  avatarUrl?: string;
}

export interface AuthData {
  jwt: string;
  user: User;
  expires_at?: number;
}

interface AuthState {
  isReady: boolean;
  auth: AuthData | null;
  setAuth: (auth: AuthData | null) => void;
  initAuth: () => void;
}

// Auth store - matches mobile app structure
export const useAuthStore = create<AuthState>((set) => ({
  isReady: false,
  auth: null,
  
  setAuth: (auth) => {
    console.log('🏪 STORE: setAuth called with:', auth ? 'auth data' : 'null');
    
    if (auth) {
      console.log('🏪 STORE: Storing auth data');
      localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
    } else {
      console.log('🏪 STORE: Removing auth data');
      localStorage.removeItem(AUTH_KEY);
    }
    
    set({ auth, isReady: true });
  },
  
  initAuth: () => {
    console.log('🔐 INIT: Loading auth from localStorage');
    try {
      const authString = localStorage.getItem(AUTH_KEY);
      if (authString) {
        const auth = JSON.parse(authString);
        
        // Check if token is expired
        if (auth.expires_at && auth.expires_at < Date.now() / 1000) {
          console.log('🔐 INIT: Token expired, clearing auth');
          localStorage.removeItem(AUTH_KEY);
          set({ auth: null, isReady: true });
          return;
        }
        
        console.log('🔐 INIT: Found valid auth data');
        set({ auth, isReady: true });
      } else {
        console.log('🔐 INIT: No auth data found');
        set({ auth: null, isReady: true });
      }
    } catch (error) {
      console.error('🔐 INIT: Error loading auth:', error);
      localStorage.removeItem(AUTH_KEY);
      set({ auth: null, isReady: true });
    }
  },
}));

// Modal state - for showing auth modal
interface AuthModalState {
  isOpen: boolean;
  mode: 'signin' | 'signup';
  open: (options?: { mode?: 'signin' | 'signup' }) => void;
  close: () => void;
}

export const useAuthModal = create<AuthModalState>((set) => ({
  isOpen: false,
  mode: 'signin',
  open: (options) => set({ isOpen: true, mode: options?.mode || 'signin' }),
  close: () => set({ isOpen: false }),
}));

