import React, { useState } from "react";
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
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X, Heart, MessageCircle, MoreVertical, Send } from "lucide-react-native";
import { colors } from "@/constants/colors";
import { apiRequest } from "@/utils/api";

export default function PostDetailModal({
  visible,
  onClose,
  post,
  currentUserId,
  onLike,
  onDelete,
}) {
  const insets = useSafeAreaInsets();
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  const isMyPost = post?.user_id === currentUserId;

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
      const response = await apiRequest(`/api/posts/${post.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: comment.trim() }),
      });

      if (response.ok) {
        setComment("");
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
        <View
          style={{
            flex: 1,
            backgroundColor: colors.bgPrimary,
            paddingTop: insets.top,
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

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image
                source={{ uri: post.profiles?.avatar_url }}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  marginRight: 8,
                }}
              />
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: 16,
                  fontWeight: "600",
                }}
              >
                {post.profiles?.username || "User"}
              </Text>
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
                aspectRatio: 1,
                backgroundColor: colors.surface,
              }}
              resizeMode="cover"
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
                comments.map((c) => (
                  <View
                    key={c.id}
                    style={{
                      flexDirection: "row",
                      marginBottom: 16,
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
                      <Text
                        style={{
                          color: colors.textTertiary,
                          fontSize: 12,
                          marginTop: 4,
                        }}
                      >
                        {new Date(c.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                ))
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
              paddingHorizontal: 16,
              paddingVertical: 12,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <TextInput
              placeholder="Add a comment..."
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
      </KeyboardAvoidingView>
    </Modal>
  );
}

