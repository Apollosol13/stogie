import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

export const authKey = 'stogie-auth-jwt';

/**
 * This store manages the authentication state of the application.
 */
export const useAuthStore = create((set) => ({
  isReady: false,
  auth: null,
  setAuth: (auth) => {
    console.log('🏪 STORE: setAuth called with:', auth ? 'auth data' : 'null');
    
    if (auth) {
      console.log('🏪 STORE: Auth data keys:', Object.keys(auth));
      console.log('🏪 STORE: Has JWT?', !!auth.jwt);
      console.log('🏪 STORE: Has user?', !!auth.user);
      console.log('🏪 STORE: JWT preview:', auth.jwt?.substring(0, 20) + '...');
      console.log('🏪 STORE: User object:', auth.user);
      
      const authString = JSON.stringify(auth);
      console.log('🏪 STORE: Stringified auth length:', authString.length);
      
      SecureStore.setItemAsync(authKey, authString).then(() => {
        console.log('🏪 STORE: Successfully saved to SecureStore');
      }).catch((error) => {
        console.error('🏪 STORE: Failed to save to SecureStore:', error);
      });
    } else {
      console.log('🏪 STORE: Deleting auth data from SecureStore');
      SecureStore.deleteItemAsync(authKey);
    }
    
    console.log('🏪 STORE: Setting Zustand state...');
    set({ auth });
    console.log('🏪 STORE: Zustand state updated');
  },
}));

/**
 * This store manages the state of the authentication modal.
 */
export const useAuthModal = create((set) => ({
  isOpen: false,
  mode: 'signin',
  open: (options) => set({ isOpen: true, mode: options?.mode || 'signin' }),
  close: () => set({ isOpen: false }),
}));