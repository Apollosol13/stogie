'use client';

import { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import { useAuth } from '@/lib/auth/hooks';
import { apiRequest } from '@/lib/api';

interface EditCigarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onDelete: () => void;
  entry: any;
}

export default function EditCigarModal({ isOpen, onClose, onSuccess, onDelete, entry }: EditCigarModalProps) {
  const { jwt } = useAuth();
  const [quantity, setQuantity] = useState('1');
  const [notes, setNotes] = useState('');
  const [pricePaid, setPricePaid] = useState('');
  const [status, setStatus] = useState<'owned' | 'wishlist' | 'smoked'>('owned');
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (entry) {
      setQuantity(String(entry.quantity || 1));
      setNotes(entry.notes || '');
      setPricePaid(String(entry.price_paid || ''));
      setStatus(entry.status || 'owned');
    }
  }, [entry]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      const payload = {
        quantity: parseInt(quantity) || 1,
        personal_notes: notes?.trim() || null,
        purchase_price: pricePaid ? parseFloat(pricePaid) : null,
        status,
      };

      console.log('[EditCigar] Submitting update payload:', payload);
      console.log('[EditCigar] Entry ID:', entry.entry_id || entry.id);

      const entryId = entry.entry_id || entry.id;
      const response = await apiRequest(`/api/humidor/${entryId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      }, jwt);

      console.log('[EditCigar] Update response:', response);

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Failed to update cigar:', error);
      alert(error.message || 'Failed to update cigar');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Remove this cigar from your humidor?')) return;

    try {
      setDeleting(true);

      const entryId = entry.entry_id || entry.id;
      console.log('[EditCigar] Deleting entry ID:', entryId);

      await apiRequest(`/api/humidor/${entryId}`, {
        method: 'DELETE',
      }, jwt);

      onDelete();
      onClose();
    } catch (error: any) {
      console.error('Failed to delete cigar:', error);
      alert(error.message || 'Failed to delete cigar');
    } finally {
      setDeleting(false);
    }
  };

  if (!isOpen || !entry) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-surface rounded-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/[0.08]">
          <h2 className="text-2xl font-bold text-textPrimary">Edit Cigar</h2>
          <button
            onClick={onClose}
            className="text-textSecondary hover:text-textPrimary transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {/* Cigar Info - Read Only */}
            <div className="bg-surface2 rounded-lg p-4 border border-white/[0.08]">
              <h3 className="text-textPrimary font-semibold mb-2">
                {entry.brand} {entry.line}
              </h3>
              <p className="text-textSecondary text-sm">{entry.vitola}</p>
            </div>

            {/* Status */}
            <div>
              <label className="block text-textSecondary text-sm mb-2">
                Status
              </label>
              <div className="flex gap-2">
                {(['owned', 'wishlist', 'smoked'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    className={`flex-1 py-2 px-4 rounded-lg font-semibold text-sm transition-colors ${
                      status === s
                        ? 'bg-accentGold text-bgPrimary'
                        : 'bg-surface2 text-textSecondary'
                    }`}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity - Only for owned */}
            {status === 'owned' && (
              <div>
                <label className="block text-textSecondary text-sm mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full bg-surface2 text-textPrimary px-4 py-3 rounded-lg border border-white/[0.08] focus:border-accentGold/30 focus:outline-none"
                />
              </div>
            )}

            {/* Price Paid - Only for owned */}
            {status === 'owned' && (
              <div>
                <label className="block text-textSecondary text-sm mb-2">
                  Price Paid ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={pricePaid}
                  onChange={(e) => setPricePaid(e.target.value)}
                  className="w-full bg-surface2 text-textPrimary px-4 py-3 rounded-lg border border-white/[0.08] focus:border-accentGold/30 focus:outline-none"
                  placeholder="0.00"
                />
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="block text-textSecondary text-sm mb-2">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full bg-surface2 text-textPrimary px-4 py-3 rounded-lg border border-white/[0.08] focus:border-accentGold/30 focus:outline-none resize-none"
                placeholder="Add any notes..."
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="px-6 py-3 bg-accentRed/10 text-accentRed rounded-full font-semibold hover:bg-accentRed/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Trash2 size={18} />
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
            
            <div className="flex-1 flex gap-3">
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
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

