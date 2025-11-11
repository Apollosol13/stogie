'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/lib/auth/hooks';
import { apiRequest } from '@/lib/api';
import { ArrowLeft, UserPlus, UserMinus, Image as ImageIcon } from 'lucide-react';

export default function UserProfilePage() {
  return (
    <ProtectedRoute>
      <UserProfileContent />
    </ProtectedRoute>
  );
}

function UserProfileContent() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser, jwt } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const isOwnProfile = currentUser?.id === params.id;

  useEffect(() => {
    if (params.id) {
      loadUserProfile();
      checkFollowStatus();
    }
  }, [params.id]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const [profileData, analyticsData, postsData] = await Promise.all([
        apiRequest(`/api/profiles/${params.id}`, { method: 'GET' }, jwt || undefined),
        apiRequest(`/api/analytics/${params.id}`, { method: 'GET' }, jwt || undefined),
        apiRequest('/api/posts', { method: 'GET' }, jwt || undefined),
      ]);

      setProfile(profileData.profile);
      setAnalytics(analyticsData.analytics);
      
      // Filter user's posts
      const userPosts = postsData.posts.filter((p: any) => p.user_id === params.id);
      setPosts(userPosts);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkFollowStatus = async () => {
    if (isOwnProfile) return;
    
    try {
      const data = await apiRequest(`/api/follow/status/${params.id}`, { method: 'GET' }, jwt || undefined);
      setIsFollowing(data.following);
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const handleFollowToggle = async () => {
    try {
      setFollowLoading(true);
      const data = await apiRequest(`/api/follow/${params.id}`, { method: 'POST' }, jwt || undefined);
      
      setIsFollowing(data.following);
      
      // Update follower count optimistically
      setAnalytics((prev: any) => ({
        ...prev,
        userStats: {
          ...prev?.userStats,
          followers: data.following 
            ? (prev?.userStats?.followers || 0) + 1 
            : Math.max((prev?.userStats?.followers || 0) - 1, 0)
        }
      }));

      // Refresh analytics after a moment
      setTimeout(async () => {
        const analyticsData = await apiRequest(`/api/analytics/${params.id}`, { method: 'GET' }, jwt || undefined);
        setAnalytics(analyticsData.analytics);
      }, 500);
    } catch (error) {
      console.error('Error following:', error);
      alert('Failed to follow/unfollow');
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bgPrimary flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accentGold"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-bgPrimary flex flex-col items-center justify-center px-6">
        <h2 className="text-2xl font-bold text-textPrimary mb-4">Profile Not Found</h2>
        <button
          onClick={() => router.back()}
          className="px-6 py-3 bg-accentGold text-bgPrimary rounded-full font-semibold hover:bg-opacity-90 transition-all"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bgPrimary pb-20">
      {/* Header */}
      <header className="bg-bgPrimary border-b border-white/[0.08]">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <button
            onClick={() => router.back()}
            className="text-textSecondary hover:text-textPrimary transition-colors mb-6"
          >
            <ArrowLeft size={24} />
          </button>

          {/* Profile Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-full bg-surface2 flex items-center justify-center border-2 border-white/[0.08] overflow-hidden">
              {profile.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt={profile.full_name || profile.username} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl font-bold text-accentGold">
                  {profile.full_name?.[0]?.toUpperCase() || profile.username?.[0]?.toUpperCase() || 'U'}
                </span>
              )}
            </div>
            
            <div className="flex-1">
              <h2 className="text-xl font-bold text-textPrimary">
                {profile.full_name || 'User'}
              </h2>
              {profile.username && (
                <p className="text-textSecondary text-sm">@{profile.username}</p>
              )}
              {profile.location && (
                <p className="text-textTertiary text-xs mt-1">{profile.location}</p>
              )}
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="text-textSecondary mb-6">{profile.bio}</p>
          )}

          {/* Favorite Cigar */}
          {profile.favorite_cigar && (
            <div className="mb-6 p-3 bg-surface rounded-lg border border-white/[0.08]">
              <p className="text-textTertiary text-xs mb-1">Favorite Cigar</p>
              <p className="text-textPrimary font-semibold">{profile.favorite_cigar}</p>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <StatCard 
              label="Posts" 
              value={analytics?.userStats?.posts || 0} 
            />
            <StatCard 
              label="Followers" 
              value={analytics?.userStats?.followers || 0} 
            />
            <StatCard 
              label="Following" 
              value={analytics?.userStats?.following || 0} 
            />
          </div>

          {/* Follow Button */}
          {!isOwnProfile && (
            <button
              onClick={handleFollowToggle}
              disabled={followLoading}
              className={`w-full py-3 rounded-full font-semibold transition-all flex items-center justify-center gap-2 ${
                isFollowing
                  ? 'bg-surface text-textPrimary border border-textSecondary hover:bg-opacity-80'
                  : 'bg-accentGold text-bgPrimary hover:bg-opacity-90'
              }`}
            >
              {followLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
              ) : (
                <>
                  {isFollowing ? (
                    <>
                      <UserMinus size={20} />
                      <span>Following</span>
                    </>
                  ) : (
                    <>
                      <UserPlus size={20} />
                      <span>Follow</span>
                    </>
                  )}
                </>
              )}
            </button>
          )}
        </div>
      </header>

      {/* Posts Grid */}
      <main className="max-w-4xl mx-auto px-6 py-6">
        <h3 className="text-textPrimary font-semibold text-lg mb-4">
          Posts ({posts.length})
        </h3>

        {posts.length === 0 ? (
          <div className="text-center py-16">
            <ImageIcon size={48} className="text-textTertiary mx-auto mb-4" />
            <p className="text-textPrimary font-semibold">No posts yet</p>
            <p className="text-textSecondary text-sm mt-2">
              {isOwnProfile ? 'Share your first cigar experience!' : 'This user hasn\'t posted yet'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {posts.map((post) => (
              <div 
                key={post.id} 
                className="aspect-square bg-surface rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
              >
                {post.image_url && (
                  <img 
                    src={post.image_url} 
                    alt="Post" 
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </main>

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

