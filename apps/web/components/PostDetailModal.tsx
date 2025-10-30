'use client';

import { useState, useEffect } from 'react';
import { X, Heart, MessageCircle, Trash2 } from 'lucide-react';
import { useAuth } from '@/lib/auth/hooks';
import { apiRequest } from '@/lib/api';
import CommentsModal from './feed/CommentsModal';

interface PostDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  onDelete?: () => void;
}

export default function PostDetailModal({ isOpen, onClose, postId, onDelete }: PostDetailModalProps) {
  const { user, jwt } = useAuth();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    if (isOpen && postId) {
      loadPost();
    }
  }, [isOpen, postId]);

  const loadPost = async () => {
    try {
      setLoading(true);
      const data = await apiRequest(`/api/posts/${postId}`, { method: 'GET' }, jwt);
      setPost(data.post);
    } catch (error) {
      console.error('Failed to load post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!jwt) {
      alert('Please sign in to like posts');
      return;
    }

    const wasLiked = post.liked_by_me;
    const previousCount = post.like_count;

    try {
      // Optimistic update
      setPost({
        ...post,
        liked_by_me: !wasLiked,
        like_count: wasLiked ? previousCount - 1 : previousCount + 1,
      });

      await apiRequest(`/api/posts/${postId}/like`, { method: 'POST' }, jwt);
    } catch (error: any) {
      // Revert on error
      setPost({
        ...post,
        liked_by_me: wasLiked,
        like_count: previousCount,
      });
      console.error('Failed to like post:', error);
    }
  };

  const handleDelete = async () => {
    if (post.user_id !== user?.id) {
      alert("You can only delete your own posts");
      return;
    }

    if (!confirm("Are you sure you want to delete this post?")) {
      return;
    }

    try {
      await apiRequest(`/api/posts/${postId}`, { method: 'DELETE' }, jwt);
      onDelete?.();
      onClose();
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert('Failed to delete post');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-surface rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
        {loading ? (
          <div className="flex items-center justify-center w-full h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accentGold"></div>
          </div>
        ) : post ? (
          <>
            {/* Image Section */}
            <div className="flex-1 bg-black flex items-center justify-center">
              {post.image_url ? (
                <img 
                  src={post.image_url} 
                  alt="Post" 
                  className="max-w-full max-h-[90vh] object-contain"
                />
              ) : (
                <div className="text-textSecondary">No image</div>
              )}
            </div>

            {/* Details Section */}
            <div className="w-full md:w-96 flex flex-col bg-surface">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/[0.08]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-surface2 flex items-center justify-center">
                    {post.profiles?.avatar_url ? (
                      <img 
                        src={post.profiles.avatar_url} 
                        alt={post.profiles.username} 
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-bold text-accentGold">
                        {post.profiles?.username?.[0]?.toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                  <span className="font-semibold text-textPrimary">
                    {post.profiles?.username || 'User'}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  {post.user_id === user?.id && (
                    <button
                      onClick={handleDelete}
                      className="text-textSecondary hover:text-accentRed transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="text-textSecondary hover:text-textPrimary transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              {/* Caption */}
              {post.caption && (
                <div className="p-4 border-b border-white/[0.08]">
                  <p className="text-textPrimary">{post.caption}</p>
                </div>
              )}

              {/* Actions */}
              <div className="p-4 border-b border-white/[0.08]">
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleLike}
                    className="flex items-center gap-2 group"
                  >
                    <Heart
                      size={24}
                      className={`transition-colors ${
                        post.liked_by_me
                          ? 'fill-accentRed text-accentRed'
                          : 'text-textPrimary group-hover:text-accentRed'
                      }`}
                    />
                    <span className="text-textPrimary font-semibold">{post.like_count || 0}</span>
                  </button>
                  <button
                    onClick={() => setShowComments(true)}
                    className="flex items-center gap-2 group"
                  >
                    <MessageCircle
                      size={24}
                      className="text-textPrimary group-hover:text-accentGold transition-colors"
                    />
                    <span className="text-textPrimary font-semibold">{post.comment_count || 0}</span>
                  </button>
                </div>
              </div>

              {/* Cigar Info */}
              {post.cigars && (
                <div className="p-4 flex-1 overflow-y-auto">
                  <h3 className="text-sm font-semibold text-textSecondary mb-2">Cigar Details</h3>
                  <div className="space-y-1">
                    <p className="text-textPrimary font-semibold">
                      {post.cigars.brand} {post.cigars.line}
                    </p>
                    {post.cigars.vitola && (
                      <p className="text-textSecondary text-sm">{post.cigars.vitola}</p>
                    )}
                    {post.rating && (
                      <p className="text-accentGold text-sm">★ {post.rating}/5</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center w-full h-96">
            <p className="text-textSecondary">Post not found</p>
          </div>
        )}
      </div>

      {/* Comments Modal */}
      {post && (
        <CommentsModal
          postId={postId}
          isOpen={showComments}
          onClose={() => {
            setShowComments(false);
            loadPost(); // Reload to update comment count
          }}
        />
      )}
    </div>
  );
}

