'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Camera, Upload } from 'lucide-react';
import { useAuth } from '@/lib/auth/hooks';
import { apiRequest } from '@/lib/api';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditProfileModal({ isOpen, onClose, onSuccess }: EditProfileModalProps) {
  const { user, jwt, setAuth } = useAuth();
  const [formData, setFormData] = useState({
    full_name: user?.name || '',
    username: user?.username || '',
    bio: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatarUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update avatar preview when user changes
  useEffect(() => {
    if (isOpen && user?.avatarUrl) {
      setAvatarPreview(user.avatarUrl);
    }
  }, [isOpen, user?.avatarUrl]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    // Store file for later upload
    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadAvatar = async (): Promise<string | null> => {
    if (!selectedFile) return null;

    try {
      console.log('[EditProfile] Uploading avatar...');
      const formData = new FormData();
      formData.append('image', selectedFile); // ✅ Changed from 'avatar' to 'image'

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://stogie-production.up.railway.app';
      const response = await fetch(`${API_BASE_URL}/api/profiles/image`, { // ✅ Changed from '/upload-avatar' to '/image'
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwt}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload avatar');
      }

      const result = await response.json();
      console.log('[EditProfile] Avatar uploaded successfully!');
      console.log('[EditProfile] New avatar URL:', result.avatar_url);
      
      if (!result.avatar_url) {
        console.error('[EditProfile] No avatar_url in response:', result);
        throw new Error('Server did not return avatar URL');
      }
      
      return result.avatar_url;
    } catch (error: any) {
      console.error('[EditProfile] Failed to upload avatar:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      
      let newAvatarUrl = user?.avatarUrl;

      // Upload avatar first if a new one was selected
      if (selectedFile) {
        console.log('[EditProfile] Uploading new avatar before saving profile...');
        newAvatarUrl = await uploadAvatar();
        console.log('[EditProfile] Avatar upload complete:', newAvatarUrl);
      }

      // Update profile data
      console.log('[EditProfile] Updating profile data...');
      const response = await apiRequest('/api/profiles', {
        method: 'PUT',
        body: JSON.stringify(formData),
      }, jwt);

      console.log('[EditProfile] Profile updated successfully');

      // Update local auth state with new data
      if (user && jwt) {
        const updatedUser = {
          ...user,
          name: formData.full_name,
          username: formData.username,
          avatarUrl: newAvatarUrl || user.avatarUrl,
        };
        
        console.log('[EditProfile] Updating local auth with new user data:', updatedUser);
        
        setAuth({
          jwt,
          user: updatedUser,
        });
      }

      // Clear selected file
      setSelectedFile(null);
      
      alert('Profile updated successfully!');
      
      // Trigger parent refresh (reloads profile data from server)
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('[EditProfile] Failed to update profile:', error);
      alert(error.message || 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-surface rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/[0.08]">
          <h2 className="text-xl font-bold text-textPrimary">Edit Profile</h2>
          <button
            onClick={onClose}
            className="text-textSecondary hover:text-textPrimary transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Profile Picture */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-surface2 flex items-center justify-center border-2 border-white/[0.08] overflow-hidden">
                  {avatarPreview ? (
                    <img 
                      src={avatarPreview} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl font-bold text-accentGold">
                      {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={submitting}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-accentGold rounded-full flex items-center justify-center border-2 border-bgPrimary hover:bg-opacity-90 transition-all disabled:opacity-50"
                >
                  <Camera size={16} className="text-bgPrimary" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
              <p className="text-textTertiary text-xs mt-3 text-center">
                {selectedFile ? (
                  <span className="text-accentGold">New picture selected • Click Save to upload</span>
                ) : (
                  'Click the camera icon to change your profile picture'
                )}
              </p>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-textSecondary text-sm mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full bg-surface2 text-textPrimary px-4 py-3 rounded-lg border border-white/[0.08] focus:border-accentGold/30 focus:outline-none"
                placeholder="Your full name"
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-textSecondary text-sm mb-2">
                Username
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full bg-surface2 text-textPrimary px-4 py-3 rounded-lg border border-white/[0.08] focus:border-accentGold/30 focus:outline-none"
                placeholder="username"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-textSecondary text-sm mb-2">
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={3}
                className="w-full bg-surface2 text-textPrimary px-4 py-3 rounded-lg border border-white/[0.08] focus:border-accentGold/30 focus:outline-none resize-none"
                placeholder="Tell us about yourself..."
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-surface2 text-textPrimary py-3 rounded-full font-semibold hover:bg-opacity-80 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-accentGold text-bgPrimary py-3 rounded-full font-semibold hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                selectedFile ? 'Uploading...' : 'Saving...'
              ) : (
                selectedFile ? 'Save & Upload' : 'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

