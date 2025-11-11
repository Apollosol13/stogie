'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/hooks';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';
import CommentsModal from '@/components/feed/CommentsModal';
import UserSearchModal from '@/components/UserSearchModal';
import { Search, Heart, MessageCircle, MoreVertical } from 'lucide-react';
import { apiRequest } from '@/lib/api';

export default function FeedPage() {
  return (
    <ProtectedRoute>
      <FeedContent />
    </ProtectedRoute>
  );
}

function FeedContent() {
  const { user, jwt } = useAuth();
  const [activeTab, setActiveTab] = useState<'For You' | 'Following'>('For You');
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    loadFeed();
  }, [activeTab]);

  const loadFeed = async () => {
    try {
      setLoading(true);
      const filter = activeTab === 'Following' ? '?filter=following' : '';
      const data = await apiRequest(`/api/posts${filter}`, { method: 'GET' }, jwt || undefined);
      setPosts(data.posts || []);
    } catch (error) {
      console.error('Failed to load feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    // Check authentication
    if (!jwt) {
      alert('Please sign in to like posts');
      return;
    }

    // Find the post and store its current state
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const wasLiked = post.liked_by_me;
    const previousCount = post.like_count;

    try {
      // Optimistic update
      setPosts(posts.map(p => 
        p.id === postId 
          ? { 
              ...p, 
              liked_by_me: !wasLiked, 
              like_count: wasLiked ? previousCount - 1 : previousCount + 1 
            }
          : p
      ));

      const result = await apiRequest(`/api/posts/${postId}/like`, { method: 'POST' }, jwt || undefined);
      
      // Update with actual backend response to ensure sync
      setPosts(posts.map(p => 
        p.id === postId 
          ? { 
              ...p, 
              liked_by_me: result.liked, 
              like_count: wasLiked ? previousCount - 1 : previousCount + 1 
            }
          : p
      ));
    } catch (error: any) {
      // Revert to original state on error
      setPosts(posts.map(p => 
        p.id === postId 
          ? { 
              ...p, 
              liked_by_me: wasLiked, 
              like_count: previousCount 
            }
          : p
      ));
      console.error('Failed to like post:', error);
      
      // Show error message if not redirecting
      if (!error.message?.includes('expired') && !error.message?.includes('Invalid')) {
        alert('Failed to like post. Please try again.');
      }
    }
  };

  const handleDeletePost = async (postId: string, postUserId: string) => {
    if (postUserId !== user?.id) {
      alert("You can only delete your own posts");
      return;
    }

    if (!confirm("Are you sure you want to delete this post?")) {
      return;
    }

    try {
      await apiRequest(`/api/posts/${postId}`, { method: 'DELETE' }, jwt || undefined);
      setPosts(posts.filter(post => post.id !== postId));
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert('Failed to delete post');
    }
  };

  return (
    <div className="min-h-screen bg-bgPrimary pb-20">
      {/* Header */}
      <header className="sticky top-0 bg-bgPrimary border-b border-white/[0.08] z-40">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-textPrimary" style={{ fontFamily: 'serif' }}>
              Stogie
            </h1>
            <button 
              onClick={() => setShowSearch(true)}
              className="text-textPrimary hover:text-accentGold transition-colors"
            >
              <Search size={24} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-4xl mx-auto px-6 flex gap-4 pb-4">
          {(['For You', 'Following'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-full font-semibold transition-colors ${
                activeTab === tab
                  ? 'bg-accentGold text-bgPrimary'
                  : 'bg-transparent text-textSecondary'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      {/* Feed Content */}
      <main className="max-w-4xl mx-auto px-6 py-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accentGold"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-textSecondary text-lg">No posts yet</p>
            <p className="text-textTertiary text-sm mt-2">
              {activeTab === 'Following' 
                ? 'Follow some users to see their posts' 
                : 'Be the first to post!'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard 
                key={post.id} 
                post={post} 
                currentUserId={user?.id}
                onLike={handleLike}
                onComment={(postId) => {
                  setSelectedPostId(postId);
                  setShowComments(true);
                }}
                onDelete={handleDeletePost}
              />
            ))}
          </div>
        )}
      </main>

      {/* Comments Modal */}
      {selectedPostId && (
        <CommentsModal
          postId={selectedPostId}
          isOpen={showComments}
          onClose={() => {
            setShowComments(false);
            setSelectedPostId(null);
            loadFeed(); // Reload feed to update comment counts
          }}
        />
      )}

      {/* User Search Modal */}
      <UserSearchModal
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
      />

      {/* Navigation */}
      <Navigation />
    </div>
  );
}

interface PostCardProps {
  post: any;
  currentUserId?: string;
  onLike: (postId: string) => void;
  onComment: (postId: string) => void;
  onDelete: (postId: string, userId: string) => void;
}

function PostCard({ post, currentUserId, onLike, onComment, onDelete }: PostCardProps) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const isOwnPost = currentUserId === post.user_id;

  const handleProfileClick = () => {
    if (post.user_id) {
      router.push(`/user/${post.user_id}`);
    }
  };

  return (
    <div className="bg-surface rounded-2xl overflow-hidden border border-white/[0.08]">
      {/* Post Header */}
      <div className="p-4 flex items-center justify-between">
        <button 
          onClick={handleProfileClick}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div className="w-10 h-10 rounded-full bg-surface2 flex items-center justify-center overflow-hidden">
            {post.profiles?.avatar_url ? (
              <img 
                src={post.profiles.avatar_url} 
                alt={post.profiles.username || 'User'} 
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-accentGold font-semibold">
                {post.profiles?.username?.[0]?.toUpperCase() || 'U'}
              </span>
            )}
          </div>
          <div className="text-left">
            <p className="text-textPrimary font-semibold">{post.profiles?.username || 'User'}</p>
            <p className="text-textTertiary text-sm">{post.created_at ? new Date(post.created_at).toLocaleDateString() : 'Recently'}</p>
          </div>
        </button>
        
        {isOwnPost && (
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="text-textSecondary hover:text-textPrimary"
            >
              <MoreVertical size={20} />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-8 bg-surface2 rounded-lg shadow-lg border border-white/[0.08] py-1 z-10 min-w-[120px]">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onDelete(post.id, post.user_id);
                  }}
                  className="w-full px-4 py-2 text-left text-accentRed hover:bg-surface transition-colors"
                >
                  Delete Post
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Post Image */}
      {post.image_url && (
        <img 
          src={post.image_url} 
          alt="Post" 
          className="w-full aspect-square object-cover"
        />
      )}

      {/* Post Content */}
      <div className="p-4">
        {post.caption && (
          <p className="text-textPrimary mb-3">{post.caption}</p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => onLike(post.id)}
            className="flex items-center gap-2 text-textSecondary hover:text-accentRed transition-colors"
          >
            <Heart 
              size={24} 
              className={post.liked_by_me ? 'fill-accentRed text-accentRed' : ''}
            />
            <span className="text-sm">{post.like_count || 0}</span>
          </button>
          
          <button 
            onClick={() => onComment(post.id)}
            className="flex items-center gap-2 text-textSecondary hover:text-accentBlue transition-colors"
          >
            <MessageCircle size={24} />
            <span className="text-sm">{post.comment_count || 0}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

