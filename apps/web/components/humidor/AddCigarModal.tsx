'use client';

import { useState } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '@/lib/auth/hooks';
import { apiRequest } from '@/lib/api';

interface AddCigarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultStatus?: 'owned' | 'wishlist' | 'smoked';
}

export default function AddCigarModal({ isOpen, onClose, onSuccess, defaultStatus = 'owned' }: AddCigarModalProps) {
  const { jwt } = useAuth();
  const [formData, setFormData] = useState({
    brand: '',
    line: '',
    vitola: '',
    wrapper: '',
    strength: 'MEDIUM' as 'MILD' | 'MEDIUM' | 'FULL',
    origin: '',
    price_paid: '',
    quantity: '1',
    notes: '',
    status: defaultStatus,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (12MB limit)
    if (file.size > 12 * 1024 * 1024) {
      alert('Image must be smaller than 12MB');
      return;
    }

    setImageFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwt}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const data = await response.json();
      return data.url;
    } catch (error: any) {
      console.error('Image upload failed:', error);
      throw new Error(error.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.brand || !formData.line || !formData.vitola) {
      alert('Please fill in required fields: Brand, Line, and Vitola');
      return;
    }

    try {
      setSubmitting(true);

      // Upload image first if one was selected
      let imageUrl = null;
      if (imageFile) {
        imageUrl = await uploadImage();
      }
      
      const payload = {
        brand: formData.brand,
        line: formData.line,
        vitola: formData.vitola,
        wrapper: formData.wrapper || null,
        strength: formData.strength,
        origin_country: formData.origin || null,
        pricePaid: formData.price_paid ? parseFloat(formData.price_paid) : null,
        quantity: parseInt(formData.quantity) || 1,
        notes: formData.notes || null,
        status: formData.status,
        image_url: imageUrl,
      };

      console.log('[AddCigar] Submitting payload:', payload);

      const response = await apiRequest('/api/humidor', {
        method: 'POST',
        body: JSON.stringify(payload),
      }, jwt || undefined);

      console.log('[AddCigar] Response:', response);

      if (response.success) {
        console.log('[AddCigar] Successfully added cigar:', response.entry);
        onSuccess();
        handleClose();
      } else {
        throw new Error(response.error || 'Failed to add cigar');
      }
    } catch (error: any) {
      console.error('[AddCigar] Error:', error);
      console.error('[AddCigar] Error message:', error.message);
      alert(error.message || 'Failed to add cigar. Please check console for details.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      brand: '',
      line: '',
      vitola: '',
      wrapper: '',
      strength: 'MEDIUM',
      origin: '',
      price_paid: '',
      quantity: '1',
      notes: '',
      status: defaultStatus,
    });
    setImageFile(null);
    setImagePreview(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-surface rounded-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/[0.08]">
          <h2 className="text-2xl font-bold text-textPrimary">Add Cigar</h2>
          <button
            onClick={handleClose}
            className="text-textSecondary hover:text-textPrimary transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {/* Status */}
            <div>
              <label className="block text-textSecondary text-sm mb-2">
                Status *
              </label>
              <div className="flex gap-2">
                {(['owned', 'wishlist', 'smoked'] as const).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setFormData({ ...formData, status })}
                    className={`flex-1 py-2 px-4 rounded-lg font-semibold text-sm transition-colors ${
                      formData.status === status
                        ? 'bg-accentGold text-bgPrimary'
                        : 'bg-surface2 text-textSecondary'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-textSecondary text-sm mb-2">
                Cigar Image
              </label>
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg border border-white/[0.08]"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-accentRed text-white p-2 rounded-full hover:bg-opacity-90 transition-all"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/[0.08] rounded-lg cursor-pointer hover:border-accentGold/30 transition-colors bg-surface2">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-10 h-10 mb-2 text-textSecondary" />
                    <p className="text-sm text-textSecondary">
                      <span className="font-semibold text-accentGold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-textTertiary mt-1">
                      PNG, JPG, WebP (max 12MB)
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageSelect}
                  />
                </label>
              )}
            </div>

            {/* Brand & Line */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-textSecondary text-sm mb-2">
                  Brand *
                </label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full bg-surface2 text-textPrimary px-4 py-3 rounded-lg border border-white/[0.08] focus:border-accentGold/30 focus:outline-none"
                  placeholder="e.g., Cohiba"
                  required
                />
              </div>

              <div>
                <label className="block text-textSecondary text-sm mb-2">
                  Line *
                </label>
                <input
                  type="text"
                  value={formData.line}
                  onChange={(e) => setFormData({ ...formData, line: e.target.value })}
                  className="w-full bg-surface2 text-textPrimary px-4 py-3 rounded-lg border border-white/[0.08] focus:border-accentGold/30 focus:outline-none"
                  placeholder="e.g., Behike"
                  required
                />
              </div>
            </div>

            {/* Vitola & Wrapper */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-textSecondary text-sm mb-2">
                  Vitola *
                </label>
                <input
                  type="text"
                  value={formData.vitola}
                  onChange={(e) => setFormData({ ...formData, vitola: e.target.value })}
                  className="w-full bg-surface2 text-textPrimary px-4 py-3 rounded-lg border border-white/[0.08] focus:border-accentGold/30 focus:outline-none"
                  placeholder="e.g., Robusto"
                  required
                />
              </div>

              <div>
                <label className="block text-textSecondary text-sm mb-2">
                  Wrapper
                </label>
                <input
                  type="text"
                  value={formData.wrapper}
                  onChange={(e) => setFormData({ ...formData, wrapper: e.target.value })}
                  className="w-full bg-surface2 text-textPrimary px-4 py-3 rounded-lg border border-white/[0.08] focus:border-accentGold/30 focus:outline-none"
                  placeholder="e.g., Maduro"
                />
              </div>
            </div>

            {/* Strength & Origin */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-textSecondary text-sm mb-2">
                  Strength
                </label>
                <select
                  value={formData.strength}
                  onChange={(e) => setFormData({ ...formData, strength: e.target.value as any })}
                  className="w-full bg-surface2 text-textPrimary px-4 py-3 rounded-lg border border-white/[0.08] focus:border-accentGold/30 focus:outline-none"
                >
                  <option value="MILD">Mild</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="FULL">Full</option>
                </select>
              </div>

              <div>
                <label className="block text-textSecondary text-sm mb-2">
                  Origin
                </label>
                <input
                  type="text"
                  value={formData.origin}
                  onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                  className="w-full bg-surface2 text-textPrimary px-4 py-3 rounded-lg border border-white/[0.08] focus:border-accentGold/30 focus:outline-none"
                  placeholder="e.g., Cuba"
                />
              </div>
            </div>

            {/* Price & Quantity */}
            {formData.status === 'owned' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-textSecondary text-sm mb-2">
                    Price Paid ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price_paid}
                    onChange={(e) => setFormData({ ...formData, price_paid: e.target.value })}
                    className="w-full bg-surface2 text-textPrimary px-4 py-3 rounded-lg border border-white/[0.08] focus:border-accentGold/30 focus:outline-none"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-textSecondary text-sm mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full bg-surface2 text-textPrimary px-4 py-3 rounded-lg border border-white/[0.08] focus:border-accentGold/30 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="block text-textSecondary text-sm mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full bg-surface2 text-textPrimary px-4 py-3 rounded-lg border border-white/[0.08] focus:border-accentGold/30 focus:outline-none resize-none"
                placeholder="Add any notes about this cigar..."
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-surface2 text-textPrimary py-3 rounded-full font-semibold hover:bg-opacity-80 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || uploading}
              className="flex-1 bg-accentGold text-bgPrimary py-3 rounded-full font-semibold hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading Image...' : submitting ? 'Adding...' : 'Add Cigar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

