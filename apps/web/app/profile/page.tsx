'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';
import EditProfileModal from '@/components/profile/EditProfileModal';
import { useAuth } from '@/lib/auth/hooks';
import { User, Mail, Calendar, Settings, Edit3, LogOut, Image as ImageIcon, RefreshCw } from 'lucide-react';
import { apiRequest } from '@/lib/api';

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}

function ProfileContent() {
  const router = useRouter();
  const { user, signOut, jwt, setAuth } = useAuth();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<'posts' | 'stats'>('posts');
  const [stats, setStats] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const lastPathRef = useRef<string | null>(null);

  // Initial load
  useEffect(() => {
    if (jwt) {
      console.log('[Profile] Initial load');
      loadProfileData();
    }
  }, [jwt]);

  // Refresh when navigating to profile page
  useEffect(() => {
    if (pathname === '/profile' && jwt && lastPathRef.current !== null && lastPathRef.current !== '/profile') {
      console.log('[Profile] Navigated to profile page, refreshing...');
      loadProfileData();
    }
    lastPathRef.current = pathname;
  }, [pathname, jwt]);

  // Reload profile data when page becomes visible (e.g., after navigating back from feed)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && jwt) {
        console.log('[Profile] Page visible, refreshing data...');
        loadProfileData();
      }
    };

    const handleFocus = () => {
      if (jwt) {
        console.log('[Profile] Window focused, refreshing data...');
        loadProfileData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [jwt]);

  const loadProfileData = async () => {
    // Prevent multiple simultaneous calls
    if (isRefreshing) {
      console.log('[Profile] Already refreshing, skipping...');
      return;
    }

    try {
      setLoading(true);
      setIsRefreshing(true);
      
      console.log('[Profile] ========================================');
      console.log('[Profile] Fetching profile data...');
      console.log('[Profile] Current cached user:', user);
      console.log('[Profile] JWT preview:', jwt?.substring(0, 30) + '...');
      console.log('[Profile] ========================================');
      
      // Fetch fresh user profile data from backend
      const [userProfileData, statsData, postsData] = await Promise.all([
        apiRequest('/api/profiles/me', { method: 'GET' }, jwt).catch(err => {
          console.error('[Profile] Failed to fetch user profile:', err);
          return null;
        }),
        apiRequest('/api/analytics', { method: 'GET' }, jwt).catch(err => {
          console.error('[Profile] Failed to fetch analytics:', err);
          return null;
        }),
        apiRequest('/api/posts?user=me', { method: 'GET' }, jwt).catch(err => {
          console.error('[Profile] Failed to fetch posts:', err);
          return { posts: [] };
        }),
      ]);
      
      console.log('[Profile] ========================================');
      console.log('[Profile] API RESPONSES:');
      console.log('[Profile] User profile data:', userProfileData);
      console.log('[Profile] Stats data:', statsData);
      console.log('[Profile] Following count from API:', statsData?.analytics?.userStats?.following);
      console.log('[Profile] Posts data:', postsData);
      console.log('[Profile] ========================================');
      
      // Update the profile data state if we got it
      if (userProfileData && userProfileData.profile) {
        console.log('[Profile] Setting profile data for user:', userProfileData.profile.username);
        setProfileData(userProfileData);
        
        // Also update the auth store with fresh user data
        setAuth({
          jwt: jwt,
          user: {
            id: userProfileData.profile.id,
            email: userProfileData.profile.email,
            name: userProfileData.profile.full_name,
            username: userProfileData.profile.username,
            avatarUrl: userProfileData.profile.avatar_url,
          },
        });
      } else {
        console.error('[Profile] Failed to get profile data, clearing cached data');
        // If we can't get fresh profile data, don't show stale data
        setProfileData(null);
      }
      
      setStats(statsData);
      setPosts(postsData?.posts || []);
    } catch (error) {
      console.error('[Profile] Error loading profile data:', error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };
  
  // Use profileData - don't fall back to cached user to avoid showing wrong profile
  const displayUser = profileData?.profile;

  // If still loading, show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-bgPrimary pb-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accentGold"></div>
      </div>
    );
  }

  // If no profile data after loading, show error
  if (!displayUser) {
    return (
      <div className="min-h-screen bg-bgPrimary pb-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-textPrimary font-semibold mb-2">Unable to load profile</p>
          <p className="text-textSecondary text-sm">Please try refreshing the page</p>
          <button
            onClick={loadProfileData}
            className="mt-4 px-6 py-2 bg-accentGold text-bgPrimary rounded-full font-semibold"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bgPrimary pb-20">
      {/* Header */}
      <header className="bg-bgPrimary border-b border-white/[0.08]">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-textPrimary" style={{ fontFamily: 'serif' }}>Profile</h1>
            <div className="flex items-center gap-3">
              <button 
                onClick={loadProfileData}
                disabled={isRefreshing}
                className={`text-textSecondary hover:text-accentGold transition-colors ${isRefreshing ? 'animate-spin' : ''}`}
                title="Refresh"
              >
                <RefreshCw size={22} />
              </button>
              <button className="text-textSecondary hover:text-textPrimary">
                <Settings size={24} />
              </button>
            </div>
          </div>

          {/* Profile Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-surface2 flex items-center justify-center border-2 border-white/[0.08]">
                {displayUser?.avatar_url || displayUser?.avatarUrl ? (
                  <img 
                    src={displayUser.avatar_url || displayUser.avatarUrl} 
                    alt={displayUser.full_name || displayUser.name || displayUser.email} 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-accentGold">
                    {displayUser?.full_name?.[0]?.toUpperCase() || 
                     displayUser?.name?.[0]?.toUpperCase() || 
                     displayUser?.email?.[0]?.toUpperCase() || 'U'}
                  </span>
                )}
              </div>
              <button 
                onClick={() => {
                  console.log('[Profile] ✏️ Edit button clicked!');
                  console.log('[Profile] Opening edit modal...');
                  setShowEditModal(true);
                }}
                className="absolute bottom-0 right-0 w-7 h-7 bg-accentGold rounded-full flex items-center justify-center border-2 border-bgPrimary hover:bg-opacity-90 transition-all"
              >
                <Edit3 size={14} className="text-bgPrimary" />
              </button>
            </div>
            
            <div className="flex-1">
              <h2 className="text-xl font-bold text-textPrimary">
                {displayUser?.full_name || displayUser?.name || 'Stogie Enthusiast'}
              </h2>
              {displayUser?.username && (
                <p className="text-textSecondary text-sm">@{displayUser.username}</p>
              )}
              <p className="text-textTertiary text-xs mt-1">{displayUser?.email}</p>
            </div>
          </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <StatCard label="Posts" value={posts.length || 0} />
                <StatCard label="Smoked" value={stats?.analytics?.sessionStats?.total_sessions || 0} />
                <StatCard label="Following" value={stats?.analytics?.userStats?.following || 0} />
              </div>

          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('posts')}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${
                activeTab === 'posts'
                  ? 'bg-accentGold text-bgPrimary'
                  : 'bg-surface text-textSecondary'
              }`}
            >
              Posts
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${
                activeTab === 'stats'
                  ? 'bg-accentGold text-bgPrimary'
                  : 'bg-surface text-textSecondary'
              }`}
            >
              Activity
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-6">
        {activeTab === 'posts' ? (
          posts.length === 0 ? (
            <div className="text-center py-16">
              <ImageIcon size={48} className="text-textTertiary mx-auto mb-4" />
              <p className="text-textPrimary font-semibold">No posts yet</p>
              <p className="text-textSecondary text-sm mt-2">Share your first cigar experience!</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {posts.map((post) => (
                <button
                  key={post.id}
                  onClick={() => router.push('/feed')}
                  className="aspect-square bg-surface rounded-lg overflow-hidden hover:opacity-80 transition-opacity cursor-pointer"
                >
                  {post.image_url ? (
                    <img 
                      src={post.image_url} 
                      alt="Post" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-surface2">
                      <ImageIcon size={32} className="text-textTertiary" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )
            ) : (
              <div className="space-y-4">
                <ActivityCard 
                  title="Total Smoked"
                  value={stats?.analytics?.sessionStats?.total_sessions || 0}
                  subtitle="cigars logged"
                />
                <ActivityCard 
                  title="Average Rating"
                  value={stats?.analytics?.reviewStats?.avg_rating_given?.toFixed(1) || '0.0'}
                  subtitle="out of 5 stars"
                />
                <ActivityCard 
                  title="Followers"
                  value={stats?.analytics?.userStats?.followers || 0}
                  subtitle="people following you"
                />
              </div>
            )}

        {/* Sign Out Button */}
        <button
          onClick={signOut}
          className="w-full mt-8 bg-surface text-accentRed py-3 rounded-full font-semibold hover:bg-opacity-80 transition-all border border-accentRed/30 flex items-center justify-center gap-2"
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </main>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={() => {
          loadProfileData();
          setShowEditModal(false);
        }}
      />

      <Navigation />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-surface rounded-lg p-3 text-center border border-white/[0.08]">
      <div className="text-xl font-bold text-textPrimary">{value}</div>
      <div className="text-xs text-textSecondary">{label}</div>
    </div>
  );
}

function ActivityCard({ title, value, subtitle }: { title: string; value: string | number; subtitle: string }) {
  return (
    <div className="bg-surface rounded-xl p-4 border border-white/[0.08]">
      <h3 className="text-textSecondary text-sm mb-2">{title}</h3>
      <div className="text-2xl font-bold text-textPrimary mb-1">{value}</div>
      <p className="text-textTertiary text-xs">{subtitle}</p>
    </div>
  );
}

