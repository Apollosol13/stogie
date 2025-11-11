'use client';

import { useState } from 'react';
import { useAuthStore } from '@/lib/auth/store';
import { signIn as apiSignIn, signUp as apiSignUp, verifyEmail as apiVerifyEmail, resendVerification as apiResendVerification } from '@/lib/api';
import { colors } from '@/lib/constants/colors';

interface AuthFormProps {
  mode?: 'signin' | 'signup';
  onSuccess?: () => void;
  onModeChange?: (mode: 'signin' | 'signup') => void;
}

export default function AuthForm({ 
  mode = 'signin', 
  onSuccess,
  onModeChange 
}: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Email verification states
  const [verificationMode, setVerificationMode] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verifyingEmail, setVerifyingEmail] = useState('');

  const { setAuth } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all required fields');
      return;
    }

    if (mode === 'signup' && password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (mode === 'signup' && !termsAccepted) {
      setError('You must accept the Terms of Service to create an account');
      return;
    }

    setLoading(true);

    try {
      // Clear any existing auth data before signing in
      console.log('🔐 Clearing old auth data before sign in...');
      localStorage.removeItem('stogie-auth-jwt');
      
      if (mode === 'signup') {
        const data = await apiSignUp({ email, password, fullName, username });
        
        // Don't auto-sign in - show verification screen
        console.log('✅ Account created, showing verification screen');
        setVerifyingEmail(email);
        setVerificationMode(true);
        setError('');
        setLoading(false);
        return;
      } else {
        console.log('🔐 Signing in with email:', email);
        const data = await apiSignIn({ email, password });
        
        console.log('🔐 Sign-in response from backend:', {
          userId: data.user?.id,
          userEmail: data.user?.email,
          username: data.user?.username
        });
        
        const authData = {
          jwt: data.session?.access_token || '',
          user: {
            id: data.user?.id || '',
            email: data.user?.email || email,
            name: data.user?.fullName,
            username: data.user?.username,
            avatarUrl: data.user?.avatarUrl
          },
          expires_at: data.session?.expires_at
        };
        
        console.log('🔐 Storing new auth data in localStorage:', {
          userId: authData.user.id,
          userEmail: authData.user.email,
          username: authData.user.username,
          jwtPreview: authData.jwt.substring(0, 30) + '...'
        });
        
        setAuth(authData);
        onSuccess?.();
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }
    
    setLoading(true);
    
    try {
      const data = await apiVerifyEmail({
        email: verifyingEmail,
        token: verificationCode
      });
      
      // Sign them in with the session
      const authData = {
        jwt: data.session?.access_token || '',
        user: {
          id: data.user?.id || '',
          email: data.user?.email || verifyingEmail,
          name: data.user?.fullName,
          username: data.user?.username,
          avatarUrl: data.user?.avatarUrl
        },
        expires_at: data.session?.expires_at
      };
      
      setAuth(authData);
      onSuccess?.();
      
    } catch (err: any) {
      console.error('Verification error:', err);
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError('');
    setLoading(true);
    
    try {
      await apiResendVerification(verifyingEmail);
      setError(''); // Clear any errors
      alert('A new verification code has been sent to your email!');
    } catch (err: any) {
      console.error('Resend error:', err);
      setError(err.message || 'Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  // If in verification mode, show verification UI
  if (verificationMode) {
    return (
      <div className="w-full max-w-md mx-auto p-8">
        <div className="bg-surface rounded-2xl p-8 border border-white/[0.08]">
          <h2 className="text-2xl font-bold text-textPrimary mb-2">
            Verify Your Email
          </h2>
          <p className="text-textSecondary mb-6">
            We sent a 6-digit code to <span className="text-accentGold">{verifyingEmail}</span>
          </p>

          {error && (
            <div className="bg-accentRed/10 border border-accentRed/30 rounded-lg p-4 mb-4">
              <p className="text-accentRed text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleVerifyEmail} className="space-y-4">
            <div>
              <label className="block text-textSecondary text-sm mb-2">
                Verification Code
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, ''); // Only digits
                  if (value.length <= 6) {
                    setVerificationCode(value);
                  }
                }}
                placeholder="000000"
                maxLength={6}
                className="w-full bg-surface2 text-textPrimary text-center text-3xl tracking-[0.5em] rounded-lg px-4 py-4 border border-white/[0.08] focus:border-accentGold/30 focus:outline-none transition-colors font-mono"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading || verificationCode.length !== 6}
              className="w-full bg-accentGold text-bgPrimary font-semibold py-3 rounded-full hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={loading}
                className="text-textSecondary hover:text-accentGold transition-colors text-sm disabled:opacity-50"
              >
                Didn&apos;t receive the code? Resend
              </button>
            </div>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setVerificationMode(false);
                  setVerificationCode('');
                  setError('');
                }}
                className="text-textSecondary hover:text-accentGold transition-colors text-sm"
              >
                ← Back to sign up
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-8">
      <div className="bg-surface rounded-2xl p-8 border border-white/[0.08]">
        <h2 className="text-2xl font-bold text-textPrimary mb-2">
          {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
        </h2>
        <p className="text-textSecondary mb-6">
          {mode === 'signup' 
            ? 'Join the Stogie Social community' 
            : 'Sign in to your account'}
        </p>

        {error && (
          <div className="bg-accentRed/10 border border-accentRed/30 rounded-lg p-4 mb-4">
            <p className="text-accentRed text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-textSecondary text-sm mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-surface2 text-textPrimary rounded-lg px-4 py-3 border border-white/[0.08] focus:border-accentGold/30 focus:outline-none transition-colors"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-textSecondary text-sm mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-surface2 text-textPrimary rounded-lg px-4 py-3 border border-white/[0.08] focus:border-accentGold/30 focus:outline-none transition-colors"
                  placeholder="johndoe"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-textSecondary text-sm mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-surface2 text-textPrimary rounded-lg px-4 py-3 border border-white/[0.08] focus:border-accentGold/30 focus:outline-none transition-colors"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-textSecondary text-sm mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-surface2 text-textPrimary rounded-lg px-4 py-3 border border-white/[0.08] focus:border-accentGold/30 focus:outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>

          {mode === 'signup' && (
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-1"
                id="terms"
              />
              <label htmlFor="terms" className="text-textSecondary text-sm">
                I accept the{' '}
                <a href="#" className="text-accentGold hover:underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-accentGold hover:underline">
                  Privacy Policy
                </a>
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accentGold text-bgPrimary font-semibold py-3 rounded-full hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading 
              ? 'Loading...' 
              : mode === 'signup' ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => onModeChange?.(mode === 'signup' ? 'signin' : 'signup')}
            className="text-textSecondary hover:text-accentGold transition-colors text-sm"
          >
            {mode === 'signup' 
              ? 'Already have an account? Sign In' 
              : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}

