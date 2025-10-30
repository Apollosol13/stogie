'use client';

import { useEffect, useCallback } from 'react';
import { useAuthStore, useAuthModal } from './store';

/**
 * Main auth hook - matches mobile app functionality
 */
export const useAuth = () => {
  const { isReady, auth, setAuth, initAuth } = useAuthStore();
  const { open, close } = useAuthModal();

  // Initialize auth on mount
  useEffect(() => {
    if (!isReady) {
      initAuth();
    }
  }, [isReady, initAuth]);

  const signIn = useCallback(() => {
    open({ mode: 'signin' });
  }, [open]);

  const signUp = useCallback(() => {
    open({ mode: 'signup' });
  }, [open]);

  const signOut = useCallback(() => {
    console.log('🔐 Signing out');
    setAuth(null);
    close();
    // Optionally call backend signout endpoint
    if (auth?.jwt) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/signout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${auth.jwt}`,
        },
      }).catch(console.error);
    }
  }, [setAuth, close, auth]);

  return {
    isReady,
    isAuthenticated: isReady ? !!auth : null,
    user: auth?.user || null,
    jwt: auth?.jwt || null,
    signIn,
    signUp,
    signOut,
    setAuth,
  };
};

/**
 * Hook that requires authentication - redirects to sign in if not authenticated
 */
export const useRequireAuth = () => {
  const { isReady, isAuthenticated, signIn } = useAuth();

  useEffect(() => {
    if (isReady && !isAuthenticated) {
      signIn();
    }
  }, [isReady, isAuthenticated, signIn]);

  return { isReady, isAuthenticated };
};

