'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Send, Trash2 } from 'lucide-react';
import { useAuth } from '@/lib/auth/hooks';
import { apiRequest } from '@/lib/api';

interface Comment {
  id: string;
  user_id: string;
  text: string;
  created_at: string;
  profiles?: {
    id: string;
    username: string;
    avatar_url?: string;
  };
  like_count?: number;
  liked_by_me?: boolean;
}

interface CommentsModalProps {
  postId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function CommentsModal({ postId, isOpen, onClose }: CommentsModalProps) {
  const { jwt, user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && postId) {
      loadComments();
    }
  }, [isOpen, postId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const data = await apiRequest(`/api/posts/${postId}/comments`, { method: 'GET' }, jwt || undefined);
      setComments(data.comments || []);
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    try {
      setSubmitting(true);
      await apiRequest(
        `/api/posts/${postId}/comments`,
        {
          method: 'POST',
          body: JSON.stringify({ text: newComment.trim() }),
        },
        jwt || undefined
      );

      // Reload comments to get full enriched data
      setNewComment('');
      await loadComments();
    } catch (error) {
      console.error('Failed to post comment:', error);
      alert('Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Delete this comment?')) return;

    try {
      // Optimistic update
      setComments(comments.filter(c => c.id !== commentId));

      await apiRequest(
        `/api/posts/${postId}/comments/${commentId}`,
        { method: 'DELETE' },
        jwt || undefined
      );
    } catch (error) {
      console.error('Failed to delete comment:', error);
      alert('Failed to delete comment');
      // Reload comments to restore state on error
      await loadComments();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-surface rounded-t-2xl sm:rounded-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/[0.08]">
          <h3 className="text-lg font-semibold text-textPrimary">Comments</h3>
          <button
            onClick={onClose}
            className="text-textSecondary hover:text-textPrimary transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accentGold"></div>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-textSecondary">No comments yet</p>
              <p className="text-textTertiary text-sm mt-1">Be the first to comment!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <CommentItem 
                key={comment.id} 
                comment={comment} 
                currentUserId={user?.id}
                onDelete={handleDeleteComment}
              />
            ))
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-white/[0.08]">
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-surface2 flex items-center justify-center flex-shrink-0">
              <span className="text-accentGold text-sm font-semibold">
                {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 bg-surface2 text-textPrimary px-4 py-2 rounded-full border border-white/[0.08] focus:border-accentGold/30 focus:outline-none text-sm"
                disabled={submitting}
              />
              <button
                type="submit"
                disabled={!newComment.trim() || submitting}
                className="bg-accentGold text-bgPrimary p-2 rounded-full hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function CommentItem({ 
  comment, 
  currentUserId, 
  onDelete 
}: { 
  comment: Comment; 
  currentUserId?: string;
  onDelete: (commentId: string) => void;
}) {
  const router = useRouter();
  const isOwnComment = currentUserId === comment.user_id;
  
  const timeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const handleProfileClick = () => {
    if (comment.user_id) {
      router.push(`/user/${comment.user_id}`);
    }
  };

  return (
    <div className="flex gap-3 group">
      <button 
        onClick={handleProfileClick}
        className="w-8 h-8 rounded-full bg-surface2 flex items-center justify-center flex-shrink-0 overflow-hidden hover:opacity-80 transition-opacity"
      >
        {comment.profiles?.avatar_url ? (
          <img 
            src={comment.profiles.avatar_url} 
            alt={comment.profiles.username || 'User'} 
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-accentGold text-sm font-semibold">
            {comment.profiles?.username?.[0]?.toUpperCase() || 'U'}
          </span>
        )}
      </button>

      <div className="flex-1">
        <div className="bg-surface2 rounded-2xl px-3 py-2 relative">
          <button 
            onClick={handleProfileClick}
            className="text-textPrimary font-semibold text-sm mb-1 hover:text-accentGold transition-colors"
          >
            {comment.profiles?.username || 'User'}
          </button>
          <p className="text-textPrimary text-sm pr-8">{comment.text}</p>
          
          {/* Delete button - only show for own comments */}
          {isOwnComment && (
            <button
              onClick={() => onDelete(comment.id)}
              className="absolute top-2 right-2 p-1.5 text-textTertiary hover:text-accentRed transition-colors opacity-0 group-hover:opacity-100"
              title="Delete comment"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
        <p className="text-textTertiary text-xs mt-1 ml-3">
          {timeAgo(comment.created_at)}
        </p>
      </div>
    </div>
  );
}

