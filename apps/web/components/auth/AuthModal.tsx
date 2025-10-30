'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { useAuthModal } from '@/lib/auth/store';
import AuthForm from './AuthForm';

export default function AuthModal() {
  const router = useRouter();
  const { isOpen, mode, close } = useAuthModal();
  const [currentMode, setCurrentMode] = useState<'signin' | 'signup'>(mode);

  useEffect(() => {
    setCurrentMode(mode);
  }, [mode]);

  const handleSuccess = () => {
    close();
    // Redirect to feed after successful sign in
    router.push('/feed');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={close}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md">
        <button
          onClick={close}
          className="absolute top-4 right-4 z-10 text-textSecondary hover:text-textPrimary transition-colors bg-surface2 rounded-full p-2"
        >
          <X size={20} />
        </button>
        
        <AuthForm 
          mode={currentMode}
          onSuccess={handleSuccess}
          onModeChange={setCurrentMode}
        />
      </div>
    </div>
  );
}

