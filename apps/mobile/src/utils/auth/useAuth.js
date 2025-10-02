import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useCallback, useEffect, useMemo } from 'react';
import { create } from 'zustand';
import { Modal, View } from 'react-native';
import { useAuthModal, useAuthStore, authKey } from './store';


/**
 * This hook provides authentication functionality.
 * It may be easier to use the `useAuthModal` or `useRequireAuth` hooks
 * instead as those will also handle showing authentication to the user
 * directly.
 */
export const useAuth = () => {
  const { isReady, auth, setAuth } = useAuthStore();
  const { isOpen, close, open } = useAuthModal();

  const initiate = useCallback(() => {
    console.log('🔐 INITIATE: Starting authentication initialization...');
    SecureStore.getItemAsync(authKey).then((auth) => {
      console.log('🔐 INITIATE: Raw auth data from SecureStore:', auth ? 'exists' : 'null');
      
      if (auth) {
        try {
          const parsedAuth = JSON.parse(auth);
          console.log('🔐 INITIATE: Parsed auth keys:', Object.keys(parsedAuth));
          console.log('🔐 INITIATE: Has JWT?', !!parsedAuth.jwt);
          console.log('🔐 INITIATE: Has user?', !!parsedAuth.user);
          console.log('🔐 INITIATE: User object:', parsedAuth.user);
          console.log('🔐 INITIATE: JWT preview:', parsedAuth.jwt?.substring(0, 20) + '...');
          
          useAuthStore.setState({
            auth: parsedAuth,
            isReady: true,
          });
          console.log('🔐 INITIATE: Auth state updated successfully');
        } catch (error) {
          console.error('🔐 INITIATE: Failed to parse auth data:', error);
          useAuthStore.setState({
            auth: null,
            isReady: true,
          });
        }
      } else {
        console.log('🔐 INITIATE: No auth data found, setting to null');
        useAuthStore.setState({
          auth: null,
          isReady: true,
        });
      }
    }).catch((error) => {
      console.error('🔐 INITIATE: SecureStore error:', error);
      useAuthStore.setState({
        auth: null,
        isReady: true,
      });
    });
  }, []);

  useEffect(() => {
    initiate();
  }, [initiate]);

  const signIn = useCallback(() => {
    open({ mode: 'signin' });
  }, [open]);
  const signUp = useCallback(() => {
    open({ mode: 'signup' });
  }, [open]);

  const signOut = useCallback(() => {
    setAuth(null);
    close();
  }, [close]);

  return {
    isReady,
    isAuthenticated: isReady ? !!auth : null,
    signIn,
    signOut,
    signUp,
    auth,
    setAuth,
    initiate,
  };
};

/**
 * This hook will automatically open the authentication modal if the user is not authenticated.
 */
export const useRequireAuth = (options) => {
  const { isAuthenticated, isReady } = useAuth();
  const { open } = useAuthModal();

  useEffect(() => {
    if (!isAuthenticated && isReady) {
      open({ mode: options?.mode });
    }
  }, [isAuthenticated, open, options?.mode, isReady]);
};

export default useAuth;