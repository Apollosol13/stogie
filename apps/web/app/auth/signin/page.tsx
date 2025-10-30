'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthForm from '@/components/auth/AuthForm';
import { useAuth } from '@/lib/auth/hooks';
import { Cigarette } from 'lucide-react';

export default function SignInPage() {
  const router = useRouter();
  const { isAuthenticated, isReady } = useAuth();

  useEffect(() => {
    if (isReady && isAuthenticated) {
      router.push('/');
    }
  }, [isReady, isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-bgPrimary flex flex-col items-center justify-center p-6">
      {/* Logo */}
      <div className="mb-8 flex items-center gap-3">
        <Cigarette size={40} className="text-accentGold" />
        <h1 className="text-3xl font-bold text-textPrimary">
          Stogie Social
        </h1>
      </div>

      {/* Auth Form */}
      <AuthForm 
        mode="signin"
        onSuccess={() => router.push('/')}
      />

      {/* Back to home */}
      <button
        onClick={() => router.push('/')}
        className="mt-8 text-textSecondary hover:text-accentGold transition-colors"
      >
        ← Back to Home
      </button>
    </div>
  );
}

