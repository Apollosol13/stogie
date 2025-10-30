'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/hooks';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Wrapper component that requires authentication
 * Redirects to sign in if user is not authenticated
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isReady, isAuthenticated, signIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isReady && !isAuthenticated) {
      signIn();
    }
  }, [isReady, isAuthenticated, signIn]);

  // Show loading state while checking auth
  if (!isReady) {
    return (
      <div className="min-h-screen bg-bgPrimary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accentGold mx-auto mb-4"></div>
          <p className="text-textSecondary">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render content if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

