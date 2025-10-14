import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Swipeable } from 'react-native-gesture-handler';
import { useUser } from '@/utils/auth/useUser';
import { X, Send, Heart } from 'lucide-react-native';
import { apiRequest } from '@/utils/api';
import { formatTimeAgo } from '@/utils/timeAgo';

const colors = {
  bgPrimary: '#0F0F0F',
  surface: '#1A1A1A',
  surface2: '#242424',
  textPrimary: '#FFFFFF',
  textSecondary: '#B0B0B0',
  textTertiary: '#6B7280',
  accentGold: '#D4B896',
  accentRed: '#FF4444',
};

export default function CommentsModal({ visible, onClose, postId }) {
  const insets = useSafeAreaInsets();
  const { data: currentUser } = useUser();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null); // { id, username }

  useEffect(() => {
    if (visible && postId) {
      loadComments();
    }
  }, [visible, postId]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const res = await apiRequest(`/api/posts/${postId}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
      }
    } catch (e) {
      console.error('Failed to load comments:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim() || submitting) return;

    setSubmitting(true);
    try {
      const body = { text: commentText.trim() };
      if (replyingTo) {
        body.parent_comment_id = replyingTo.id;
      }

      const res = await apiRequest(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setCommentText('');
        setReplyingTo(null);
        await loadComments(); // Reload all comments to show new one
      }
    } catch (e) {
      console.error('Failed to post comment:', e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      console.log('[CommentsModal] Liking comment:', commentId, 'on post:', postId);
      const res = await apiRequest(`/api/posts/${postId}/comments/${commentId}/like`, {
        method: 'POST',
      });

      console.log('[CommentsModal] Like response status:', res.status);
      if (res.ok) {
        const data = await res.json();
        console.log('[CommentsModal] Like response data:', data);
        // Update comment in list optimistically
        setComments((prev) =>
          prev.map((c) =>
            c.id === commentId
              ? {
                  ...c,
                  liked_by_me: !c.liked_by_me,
                  like_count: c.liked_by_me ? c.like_count - 1 : c.like_count + 1,
                }
              : c
          )
        );
      } else {
        const errorText = await res.text();
        console.error('[CommentsModal] Failed to like:', res.status, errorText);
      }
    } catch (e) {
      console.error('[CommentsModal] Error liking comment:', e);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      // Optimistic remove
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      const res = await apiRequest(`/api/posts/${postId}/comments/${commentId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        // Revert on failure
        await loadComments();
      }
    } catch (e) {
      console.error('Failed to delete comment:', e);
      await loadComments();
    }
  };

  const renderRightActions = (comment) => (
    <TouchableOpacity
      onPress={() => handleDeleteComment(comment.id)}
      style={{
        width: 72,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.accentRed,
        marginLeft: 8,
        borderRadius: 8,
      }}
      accessibilityLabel="Delete comment"
      accessibilityHint="Double tap to confirm deletion"
    >
      <X size={22} color="#fff" />
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, backgroundColor: colors.bgPrimary }}
      >
        {/* Header */}
        <View
          style={{
            paddingTop: insets.top + 16,
            paddingHorizontal: 20,
            paddingBottom: 16,
            borderBottomWidth: 1,
            borderBottomColor: colors.surface2,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: '700' }}>
            Comments
          </Text>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Comments List */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 16 }}
        >
          {loading ? (
            <View style={{ alignItems: 'center', marginTop: 40 }}>
              <ActivityIndicator size="large" color={colors.accentGold} />
            </View>
          ) : comments.length === 0 ? (
            <View style={{ alignItems: 'center', marginTop: 40 }}>
              <Text style={{ color: colors.textSecondary, fontSize: 16 }}>
                No comments yet. Be the first to comment!
              </Text>
            </View>
          ) : (
            comments.map((comment) => {
              const canDelete =
                comment.user_id === currentUser?.id ||
                comment.profiles?.id === currentUser?.id;

              const CommentRow = (
                <View
                  key={comment.id}
                  style={{
                    marginBottom: 16,
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    marginLeft: comment.parent_comment_id ? 40 : 0,
                  }}
                >
                {comment.profiles?.avatar_url ? (
                  <Image
                    source={{ uri: comment.profiles.avatar_url }}
                    style={{ width: 32, height: 32, borderRadius: 16, marginRight: 12 }}
                  />
                ) : (
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: colors.surface,
                      marginRight: 12,
                    }}
                  />
                )}
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.textPrimary, fontWeight: '600', marginBottom: 4 }}>
                    {comment.profiles?.username || 'User'}
                  </Text>
                  <Text style={{ color: colors.textSecondary, lineHeight: 20 }}>
                    {comment.text}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 12 }}>
                    <Text style={{ color: colors.textTertiary, fontSize: 12 }}>
                      {formatTimeAgo(comment.created_at)}
                    </Text>
                    {comment.like_count > 0 && (
                      <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '600' }}>
                        {comment.like_count} {comment.like_count === 1 ? 'like' : 'likes'}
                      </Text>
                    )}
                    <TouchableOpacity onPress={() => setReplyingTo({ id: comment.id, username: comment.profiles?.username })}>
                      <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '600' }}>
                        Reply
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <TouchableOpacity 
                  onPress={() => handleLikeComment(comment.id)}
                  style={{ paddingLeft: 8 }}
                >
                  <Heart
                    size={16}
                    color={comment.liked_by_me ? colors.accentRed : colors.textSecondary}
                    fill={comment.liked_by_me ? colors.accentRed : 'transparent'}
                  />
                </TouchableOpacity>
                </View>
              );

              return canDelete ? (
                <Swipeable
                  key={comment.id}
                  overshootRight={false}
                  renderRightActions={() => renderRightActions(comment)}
                >
                  {CommentRow}
                </Swipeable>
              ) : (
                <View key={comment.id}>{CommentRow}</View>
              );
            })
          )}
        </ScrollView>

        {/* Comment Input */}
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: colors.surface2,
            paddingBottom: insets.bottom,
          }}
        >
          {replyingTo && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 20,
                paddingTop: 8,
                paddingBottom: 4,
              }}
            >
              <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
                Replying to <Text style={{ fontWeight: '600' }}>{replyingTo.username}</Text>
              </Text>
              <TouchableOpacity onPress={() => setReplyingTo(null)}>
                <X size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          )}
          <View
            style={{
              paddingHorizontal: 20,
              paddingVertical: 12,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <TextInput
              placeholder={replyingTo ? `Reply to ${replyingTo.username}...` : "Add a comment..."}
              placeholderTextColor={colors.textSecondary}
              value={commentText}
              onChangeText={setCommentText}
              style={{
                flex: 1,
                backgroundColor: colors.surface,
                color: colors.textPrimary,
                borderRadius: 20,
                paddingHorizontal: 16,
                paddingVertical: 10,
                fontSize: 16,
              }}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              onPress={handleSubmitComment}
              disabled={!commentText.trim() || submitting}
              style={{
                backgroundColor: commentText.trim() ? colors.accentGold : colors.surface,
                borderRadius: 20,
                width: 40,
                height: 40,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {submitting ? (
                <ActivityIndicator size="small" color={colors.bgPrimary} />
              ) : (
                <Send
                  size={20}
                  color={commentText.trim() ? colors.bgPrimary : colors.textSecondary}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
