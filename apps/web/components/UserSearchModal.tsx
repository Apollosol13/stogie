'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Search as SearchIcon, User } from 'lucide-react';
import { useAuth } from '@/lib/auth/hooks';
import { apiRequest } from '@/lib/api';

interface UserSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UserProfile {
  id: string;
  full_name?: string;
  username: string;
  avatar_url?: string;
  bio?: string;
}

export default function UserSearchModal({ isOpen, onClose }: UserSearchModalProps) {
  const router = useRouter();
  const { jwt } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [isSuggested, setIsSuggested] = useState(false);

  // Load suggested users when modal opens
  useEffect(() => {
    if (isOpen && searchResults.length === 0 && !searchQuery) {
      loadSuggestedUsers();
    }
  }, [isOpen]);

  const loadSuggestedUsers = async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/api/profiles/search', { method: 'GET' }, jwt || undefined);
      
      if (data.success) {
        setSearchResults(data.profiles || []);
        setIsSuggested(true);
      }
    } catch (error) {
      console.error('Load suggested users error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setIsSuggested(false);
    
    if (query.trim().length === 0) {
      // Load suggested users when query is cleared
      loadSuggestedUsers();
      setSearched(false);
      return;
    }

    if (query.trim().length < 2) {
      setSearchResults([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    setSearched(true);
    
    try {
      const data = await apiRequest(
        `/api/profiles/search?q=${encodeURIComponent(query.trim())}`,
        { method: 'GET' },
        jwt || undefined
      );
      
      if (data.success) {
        setSearchResults(data.profiles || []);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('User search error:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (userId: string) => {
    onClose();
    setSearchQuery('');
    setSearchResults([]);
    setSearched(false);
    router.push(`/user/${userId}`);
  };

  const handleClose = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSearched(false);
    setIsSuggested(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg max-h-[80vh] bg-bgPrimary rounded-2xl flex flex-col m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/[0.08]">
          <h2 className="text-xl font-bold text-textPrimary">Search Users</h2>
          <button
            onClick={handleClose}
            className="w-9 h-9 rounded-full bg-surface flex items-center justify-center text-textSecondary hover:text-textPrimary transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-6">
          <div className="flex items-center gap-3 bg-surface rounded-xl px-4 py-3 border border-white/[0.08]">
            <SearchIcon size={20} className="text-textSecondary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search by username or name..."
              className="flex-1 bg-transparent text-textPrimary placeholder:text-textSecondary outline-none"
              autoFocus
            />
            {loading && (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-accentGold"></div>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto">
          {searched && !loading && searchResults.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 px-10">
              <User size={48} className="text-textSecondary mb-4" />
              <p className="text-textSecondary text-center mb-2">No users found</p>
              <p className="text-textTertiary text-sm text-center">Try a different search term</p>
            </div>
          )}

          {searchResults.length > 0 && (
            <>
              {isSuggested && (
                <div className="px-6 py-3 border-b border-white/[0.08]">
                  <p className="text-textSecondary text-sm font-semibold">SUGGESTED USERS</p>
                </div>
              )}
              <div>
                {searchResults.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleUserClick(user.id)}
                    className="w-full flex items-center gap-3 p-4 hover:bg-surface transition-colors border-b border-white/[0.08] last:border-b-0"
                  >
                    <div className="w-12 h-12 rounded-full bg-surface2 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.full_name || user.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User size={24} className="text-textSecondary" />
                      )}
                    </div>
                    
                    <div className="flex-1 text-left">
                      <p className="text-textPrimary font-semibold">
                        {user.full_name || 'Unknown User'}
                      </p>
                      <p className="text-textSecondary text-sm">@{user.username}</p>
                      {user.bio && (
                        <p className="text-textSecondary text-xs mt-1 line-clamp-1">
                          {user.bio}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

