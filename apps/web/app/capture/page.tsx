'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/hooks';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';
import { Camera, Upload, X, Image as ImageIcon } from 'lucide-react';
import { apiRequest } from '@/lib/api';

export default function CapturePage() {
  return (
    <ProtectedRoute>
      <CaptureContent />
    </ProtectedRoute>
  );
}

function CaptureContent() {
  const router = useRouter();
  const { jwt } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePost = async () => {
    if (!selectedImage) return;

    try {
      setUploading(true);
      
      // For now, just create the post with the data URL
      // In production, you'd upload to a service like Uploadcare or S3
      const response = await apiRequest('/api/posts', {
        method: 'POST',
        body: JSON.stringify({
          image_url: selectedImage,
          caption: caption.trim(),
        }),
      }, jwt || undefined);

      if (response.success) {
        router.push('/feed');
      }
    } catch (error) {
      console.error('Failed to create post:', error);
      alert('Failed to create post. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bgPrimary pb-20">
      {/* Header */}
      <header className="sticky top-0 bg-bgPrimary border-b border-white/[0.08] z-40">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="text-textSecondary hover:text-textPrimary"
            >
              <X size={24} />
            </button>
            <h1 className="text-xl font-bold text-textPrimary">Create Post</h1>
            <button
              onClick={handlePost}
              disabled={!selectedImage || uploading}
              className="text-accentGold font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Image Upload Area */}
        {!selectedImage ? (
          <div className="space-y-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-square bg-surface rounded-2xl border-2 border-dashed border-white/[0.2] hover:border-accentGold/50 transition-colors flex flex-col items-center justify-center"
            >
              <Camera size={64} className="text-textTertiary mb-4" />
              <p className="text-textPrimary font-semibold text-lg mb-2">
                Take or Upload a Photo
              </p>
              <p className="text-textSecondary text-sm">
                Share your cigar experience
              </p>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-surface p-6 rounded-xl border border-white/[0.08] hover:border-accentGold/30 transition-colors"
              >
                <Upload className="text-accentGold mx-auto mb-3" size={32} />
                <p className="text-textPrimary font-semibold text-sm">Upload Photo</p>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-surface p-6 rounded-xl border border-white/[0.08] hover:border-accentGold/30 transition-colors"
              >
                <ImageIcon className="text-accentGold mx-auto mb-3" size={32} />
                <p className="text-textPrimary font-semibold text-sm">Choose from Library</p>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Image Preview */}
            <div className="relative">
              <img
                src={selectedImage}
                alt="Selected"
                className="w-full aspect-square object-cover rounded-2xl"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white p-2 rounded-full hover:bg-black/70 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Caption Input */}
            <div>
              <label className="block text-textSecondary text-sm mb-2">
                Caption
              </label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Share your thoughts about this cigar..."
                rows={4}
                className="w-full bg-surface text-textPrimary px-4 py-3 rounded-lg border border-white/[0.08] focus:border-accentGold/30 focus:outline-none resize-none"
              />
            </div>

            {/* Post Button */}
            <button
              onClick={handlePost}
              disabled={uploading}
              className="w-full bg-accentGold text-bgPrimary py-4 rounded-full font-semibold hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-bgPrimary"></div>
                  Posting...
                </span>
              ) : (
                'Share to Feed'
              )}
            </button>
          </div>
        )}
      </main>

      <Navigation />
    </div>
  );
}

