import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Modal,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  PanResponder,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUser } from "@/utils/auth/useUser";
import { X, Heart, MessageCircle, MoreVertical, Send, Reply } from "lucide-react-native";
import { colors } from "@/constants/colors";
import { apiRequest } from "@/utils/api";
import { formatTimeAgo } from "@/utils/timeAgo";

const accentRed = "#FF4444";

export default function PostDetailModal({
  visible,
  onClose,
  post,
  currentUserId,
  onLike,
  onDelete,
}) {
  const insets = useSafeAreaInsets();
  const { data: currentUser } = useUser();
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null); // { id, username }

  const isMyPost = post?.user_id === currentUserId;

  // Swipe gesture handling
  const pan = useRef(new Animated.Value(0)).current;
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only respond to horizontal swipes (left)
        return Math.abs(gestureState.dx) > 20 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
      },
      onPanResponderMove: (evt, gestureState) => {
        // Only allow swiping to the right (dismissing to the left visually means negative dx)
        if (gestureState.dx < 0) {
          pan.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        // If swiped more than 100px to the left, close the modal
        if (gestureState.dx < -100) {
          Animated.timing(pan, {
            toValue: -500,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            pan.setValue(0);
            onClose();
          });
        } else {
          // Snap back
          Animated.spring(pan, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  // Fetch comments when modal opens
  React.useEffect(() => {
    if (visible && post?.id) {
      fetchComments();
    }
  }, [visible, post?.id]);

  const fetchComments = async () => {
    if (!post?.id) return;
    try {
      setLoadingComments(true);
      console.log('[PostDetailModal] Fetching comments for post:', post.id);
      const response = await apiRequest(`/api/posts/${post.id}/comments`);
      console.log('[PostDetailModal] Comments response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('[PostDetailModal] Comments data:', data);
        setComments(data.comments || []);
      } else {
        const errorText = await response.text();
        console.error('[PostDetailModal] Failed to fetch comments:', errorText);
      }
    } catch (error) {
      console.error("[PostDetailModal] Error fetching comments:", error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!comment.trim()) return;

    try {
      setSubmittingComment(true);
      const body = { text: comment.trim() };
      if (replyingTo) {
        body.parent_comment_id = replyingTo.id;
      }
      
      const response = await apiRequest(`/api/posts/${post.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        setComment("");
        setReplyingTo(null);
        await fetchComments(); // Reload comments
      } else {
        Alert.alert("Error", "Failed to post comment");
      }
    } catch (error) {
      console.error("Error posting comment:", error);
      Alert.alert("Error", "Failed to post comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      const response = await apiRequest(`/api/posts/${post.id}/comments/${commentId}/like`, {
        method: "POST",
      });

      if (response.ok) {
        // Update comment in list
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
      }
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      // Optimistic removal
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      const res = await apiRequest(`/api/posts/${post.id}/comments/${commentId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        // Revert if failed
        await fetchComments();
      }
    } catch (e) {
      console.error('[PostDetailModal] delete comment error:', e);
      await fetchComments();
    }
  };

  const renderRightActions = (comment) => (
    <TouchableOpacity
      onPress={() => handleDeleteComment(comment.id)}
      style={{
        width: 72,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: accentRed,
        marginLeft: 8,
        borderRadius: 8,
      }}
    >
      <X size={22} color="#fff" />
    </TouchableOpacity>
  );

  const handleDeletePost = () => {
    Alert.alert("Delete Post", "Are you sure you want to delete this post?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          onDelete?.(post.id);
          onClose();
        },
      },
    ]);
  };

  if (!post) return null;

  // Add console log to debug
  React.useEffect(() => {
    if (visible && post) {
      console.log('[PostDetailModal] Opening post:', {
        id: post.id,
        hasProfiles: !!post.profiles,
        profilesData: post.profiles,
        image_url: post.image_url,
        created_at: post.created_at
      });
    }
  }, [visible, post]);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, backgroundColor: colors.bgPrimary }}
      >
        <Animated.View
          {...panResponder.panHandlers}
          style={{
            flex: 1,
            backgroundColor: colors.bgPrimary,
            paddingTop: insets.top,
            transform: [{ translateX: pan }],
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderBottomColor: colors.surface,
            }}
          >
            <TouchableOpacity
              onPress={onClose}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: colors.surface,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
              <Image
                source={{ uri: post.profiles?.avatar_url || 'https://via.placeholder.com/32' }}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  marginRight: 8,
                }}
              />
              <View>
                <Text
                  style={{
                    color: colors.textPrimary,
                    fontSize: 16,
                    fontWeight: "600",
                  }}
                >
                  {post.profiles?.username || "User"}
                </Text>
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontSize: 12,
                    marginTop: 2,
                  }}
                >
                  {formatTimeAgo(post.created_at)}
                </Text>
              </View>
            </View>

            {isMyPost && (
              <TouchableOpacity
                onPress={handleDeletePost}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: colors.surface,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <MoreVertical size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Image */}
            <Image
              source={{ uri: post.image_url }}
              style={{
                width: "100%",
                minHeight: 300,
                maxHeight: 600,
                backgroundColor: colors.surface,
              }}
              resizeMode="contain"
            />

            {/* Like & Comment Buttons */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: colors.surface,
              }}
            >
              <TouchableOpacity
                onPress={() => onLike?.(post.id)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginRight: 20,
                }}
              >
                <Heart
                  size={24}
                  color={post.liked_by_me ? colors.accentRed : colors.textSecondary}
                  fill={post.liked_by_me ? colors.accentRed : "transparent"}
                />
                <Text
                  style={{
                    color: colors.textPrimary,
                    fontSize: 16,
                    fontWeight: "600",
                    marginLeft: 8,
                  }}
                >
                  {post.like_count || 0}
                </Text>
              </TouchableOpacity>

              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <MessageCircle size={24} color={colors.textSecondary} />
                <Text
                  style={{
                    color: colors.textPrimary,
                    fontSize: 16,
                    fontWeight: "600",
                    marginLeft: 8,
                  }}
                >
                  {post.comment_count || 0}
                </Text>
              </View>
            </View>

            {/* Caption */}
            {post.caption && (
              <View
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.surface,
                }}
              >
                <Text style={{ color: colors.textPrimary, fontSize: 15, lineHeight: 22 }}>
                  <Text style={{ fontWeight: "600" }}>
                    {post.profiles?.username}{" "}
                  </Text>
                  {post.caption}
                </Text>
              </View>
            )}

            {/* Comments Section */}
            <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: 16,
                  fontWeight: "600",
                  marginBottom: 12,
                }}
              >
                Comments
              </Text>

              {loadingComments ? (
                <Text style={{ color: colors.textSecondary, textAlign: "center", paddingVertical: 20 }}>
                  Loading comments...
                </Text>
              ) : comments.length === 0 ? (
                <Text
                  style={{
                    color: colors.textSecondary,
                    textAlign: "center",
                    paddingVertical: 20,
                  }}
                >
                  No comments yet. Be the first to comment!
                </Text>
              ) : (
                comments.map((c) => {
                  const canDelete = c.user_id === currentUser?.id;
                  const Row = (
                    <View
                      key={c.id}
                      style={{
                        flexDirection: "row",
                        marginBottom: 16,
                        marginLeft: c.parent_comment_id ? 40 : 0,
                      }}
                    >
                    <Image
                      source={{ uri: c.profiles?.avatar_url }}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        marginRight: 12,
                      }}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: colors.textPrimary, fontSize: 15, lineHeight: 22 }}>
                        <Text style={{ fontWeight: "600" }}>
                          {c.profiles?.username}{" "}
                        </Text>
                        {c.text}
                      </Text>
                      <View style={{ flexDirection: "row", alignItems: "center", marginTop: 6, gap: 12 }}>
                        <Text style={{ color: colors.textTertiary, fontSize: 12 }}>
                          {formatTimeAgo(c.created_at)}
                        </Text>
                        {c.like_count > 0 && (
                          <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: "600" }}>
                            {c.like_count} {c.like_count === 1 ? "like" : "likes"}
                          </Text>
                        )}
                        <TouchableOpacity onPress={() => setReplyingTo({ id: c.id, username: c.profiles?.username })}>
                          <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: "600" }}>
                            Reply
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    <TouchableOpacity 
                      onPress={() => handleLikeComment(c.id)}
                      style={{ paddingLeft: 8 }}
                    >
                      <Heart
                        size={16}
                        color={c.liked_by_me ? accentRed : colors.textSecondary}
                        fill={c.liked_by_me ? accentRed : "transparent"}
                      />
                    </TouchableOpacity>
                  </View>
                  );

                  return canDelete ? (
                    <Swipeable key={c.id} overshootRight={false} renderRightActions={() => renderRightActions(c)}>
                      {Row}
                    </Swipeable>
                  ) : (
                    <View key={c.id}>{Row}</View>
                  );
                })
              )}
            </View>

            <View style={{ height: insets.bottom + 80 }} />
          </ScrollView>

          {/* Comment Input */}
          <View
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: colors.surface,
              borderTopWidth: 1,
              borderTopColor: colors.divider,
              paddingBottom: insets.bottom,
            }}
          >
            {replyingTo && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingHorizontal: 16,
                  paddingTop: 8,
                  paddingBottom: 4,
                }}
              >
                <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
                  Replying to <Text style={{ fontWeight: "600" }}>{replyingTo.username}</Text>
                </Text>
                <TouchableOpacity onPress={() => setReplyingTo(null)}>
                  <X size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            )}
            <View
              style={{
                paddingHorizontal: 16,
                paddingVertical: 12,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <TextInput
                placeholder={replyingTo ? `Reply to ${replyingTo.username}...` : "Add a comment..."}
                placeholderTextColor={colors.textSecondary}
                value={comment}
                onChangeText={setComment}
                style={{
                  flex: 1,
                  backgroundColor: colors.bgPrimary,
                  color: colors.textPrimary,
                  borderRadius: 20,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  fontSize: 15,
                  marginRight: 12,
                }}
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                onPress={handleSubmitComment}
                disabled={!comment.trim() || submittingComment}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: comment.trim() ? colors.accentGold : colors.surface2,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Send
                  size={20}
                  color={comment.trim() ? colors.bgPrimary : colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

