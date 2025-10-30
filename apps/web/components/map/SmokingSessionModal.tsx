'use client';

import { useState, useEffect } from 'react';
import { X, MapPin, Check } from 'lucide-react';
import useHumidor from '@/lib/hooks/useHumidor';

interface SmokingSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: { lat: number; lng: number } | null;
  onCreateSession: (data: any) => Promise<void>;
}

const stickers = [
  { key: 'marker_green', label: '📍' },
  { key: 'maduro', label: '🥃' },
  { key: 'ash', label: '🧱' },
  { key: 'flame', label: '🔥' },
  { key: 'cheers', label: '🍻' },
];

export default function SmokingSessionModal({
  isOpen,
  onClose,
  location,
  onCreateSession,
}: SmokingSessionModalProps) {
  const { humidorData, loading: humidorLoading } = useHumidor();
  
  const [selectedCigar, setSelectedCigar] = useState<any>(null);
  const [locationName, setLocationName] = useState('');
  const [selectedSticker, setSelectedSticker] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      setSelectedCigar(null);
      setLocationName('');
      setSelectedSticker(null);
      setCreating(false);
    }
  }, [isOpen]);

  const availableCigars = humidorData?.owned?.filter(entry => entry.quantity > 0) || [];

  const handleCreateSession = async () => {
    if (!selectedCigar) {
      alert('Please select a cigar from your humidor to continue.');
      return;
    }

    if (!locationName.trim()) {
      alert('Please add a name for this location.');
      return;
    }

    if (!location) {
      alert('No location selected.');
      return;
    }

    setCreating(true);

    try {
      const sessionData = {
        cigar_id: selectedCigar.cigar_id,
        location_name: locationName.trim(),
        latitude: location.lat,
        longitude: location.lng,
        sticker: selectedSticker || null,
      };

      await onCreateSession(sessionData);
      onClose();
    } catch (error: any) {
      console.error('Error creating session:', error);
      alert(error.message || 'Failed to create session. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-surface rounded-t-3xl max-h-[85vh] flex flex-col animate-slide-up">
        {/* Handle */}
        <div className="w-10 h-1 bg-textTertiary rounded-full mx-auto mt-3 mb-2" />
        
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-textPrimary">New Session</h2>
            {location && (
              <div className="flex items-center gap-1 mt-1">
                <MapPin size={14} className="text-textSecondary" />
                <p className="text-sm text-textSecondary">
                  {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                </p>
              </div>
            )}
          </div>
          
          <button
            onClick={onClose}
            className="text-textSecondary hover:text-textPrimary transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {/* Sticker Picker */}
          <div className="mb-6">
            <h3 className="text-base font-semibold text-textPrimary mb-3">Pick a sticker</h3>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {stickers.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setSelectedSticker(s.key)}
                  className={`px-4 py-2 rounded-xl transition-colors flex-shrink-0 ${
                    selectedSticker === s.key
                      ? 'bg-accentGold'
                      : 'bg-surface2'
                  }`}
                >
                  <span className="text-2xl">{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Cigar Selection */}
          <div className="mb-6">
            <h3 className="text-base font-semibold text-textPrimary mb-3 flex items-center gap-2">
              <span className="text-accentGold">*</span> Select Cigar
            </h3>

            {humidorLoading ? (
              <div className="bg-surface2 rounded-xl p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accentGold mx-auto mb-2"></div>
                <p className="text-textSecondary">Loading your humidor...</p>
              </div>
            ) : availableCigars.length === 0 ? (
              <div className="bg-surface2 rounded-xl p-6 text-center">
                <p className="text-textSecondary">
                  No cigars available in your humidor.{'\n'}Add some cigars first!
                </p>
              </div>
            ) : (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {availableCigars.map((entry) => (
                  <button
                    key={entry.id}
                    onClick={() => setSelectedCigar(entry)}
                    className={`flex-shrink-0 p-4 rounded-xl min-w-[160px] max-w-[200px] transition-colors ${
                      selectedCigar?.id === entry.id
                        ? 'bg-accentGold'
                        : 'bg-surface2'
                    }`}
                  >
                    <h4
                      className={`font-semibold mb-1 truncate ${
                        selectedCigar?.id === entry.id
                          ? 'text-bgPrimary'
                          : 'text-textPrimary'
                      }`}
                    >
                      {entry.brand} {entry.line}
                    </h4>
                    <p
                      className={`text-sm mb-2 truncate ${
                        selectedCigar?.id === entry.id
                          ? 'text-bgPrimary/80'
                          : 'text-textSecondary'
                      }`}
                    >
                      {entry.vitola || 'Unknown'}
                    </p>
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs ${
                          selectedCigar?.id === entry.id
                            ? 'text-bgPrimary/70'
                            : 'text-textTertiary'
                        }`}
                      >
                        Qty: {entry.quantity}
                      </span>
                      {selectedCigar?.id === entry.id && (
                        <Check size={16} className="text-bgPrimary" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Location Name */}
          <div className="mb-6">
            <h3 className="text-base font-semibold text-textPrimary mb-3 flex items-center gap-2">
              <span className="text-accentGold">*</span> Location Name
            </h3>
            <input
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="e.g., My backyard, Central Park, Joe's Cigar Lounge"
              className="w-full bg-surface2 text-textPrimary px-4 py-3 rounded-xl placeholder:text-textTertiary focus:outline-none focus:ring-2 focus:ring-accentGold"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-surface2 text-textPrimary py-4 rounded-xl font-semibold hover:bg-surface transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={handleCreateSession}
              disabled={creating || !selectedCigar || !locationName.trim()}
              className={`flex-[2] py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors ${
                !selectedCigar || !locationName.trim()
                  ? 'bg-textTertiary text-bgPrimary cursor-not-allowed'
                  : 'bg-accentGold text-bgPrimary hover:bg-opacity-90'
              }`}
            >
              {creating ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-bgPrimary"></div>
              ) : (
                <>
                  <MapPin size={20} />
                  Check In Here
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

