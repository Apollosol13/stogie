import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/utils/auth/useAuth";
import { useUser } from "@/utils/auth/useUser";
import { router } from "expo-router";
import {
  Search,
  Plus,
  MoreVertical,
  Heart,
  MessageCircle,
} from "lucide-react-native";
import useFeed from "@/hooks/useFeed";
import NewPostModal from "@/components/feed/NewPostModal";
import CommentsModal from "@/components/feed/CommentsModal";
import { apiRequest } from "@/utils/api";
import { formatTimeAgo } from "@/utils/timeAgo";

const colors = {
  bgPrimary: "#0F0F0F",
  surface: "#1A1A1A",
  textPrimary: "#FFFFFF",
  textSecondary: "#B0B0B0",
  accentGold: "#D4B896",
  buttonOutline: "rgba(212, 184, 150, 0.3)",
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { isAuthenticated, isReady, signIn } = useAuth();
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState("Following");
  const { posts, loading, load, toggleLike, removePost } = useFeed();
  const [showNewPost, setShowNewPost] = useState(false);
  const [deletingPostId, setDeletingPostId] = useState(null);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [showComments, setShowComments] = useState(false);

  const handleDeletePost = async (postId, postUserId) => {
    if (postUserId !== user?.id) {
      Alert.alert("Error", "You can only delete your own posts");
      return;
    }

    Alert.alert(
      "Delete Post",
      "Are you sure you want to delete this post?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setDeletingPostId(postId);
              const res = await apiRequest(`/api/posts/${postId}`, {
                method: "DELETE",
              });
              if (!res.ok) throw new Error("Failed to delete post");
              removePost(postId);
            } catch (e) {
              Alert.alert("Error", e.message || "Failed to delete post");
            } finally {
              setDeletingPostId(null);
            }
          },
        },
      ]
    );
  };

  const handleLikePost = async (postId) => {
    // Optimistic update - instant UI response
    toggleLike(postId);
    
    try {
      const res = await apiRequest(`/api/posts/${postId}/like`, {
        method: "POST",
      });
      if (!res.ok) {
        // Revert on failure
        toggleLike(postId);
        throw new Error("Failed to like post");
      }
    } catch (e) {
      Alert.alert("Error", e.message || "Failed to like post");
    }
  };

  const handleCommentPress = (postId) => {
    setSelectedPostId(postId);
    setShowComments(true);
  };

  if (!isReady) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.bgPrimary,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color={colors.accentGold} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
        <StatusBar style="light" />

        <View
          style={{
            paddingTop: insets.top + 20,
            paddingHorizontal: 20,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 60,
          }}
        >
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: 24,
              fontWeight: "700",
            }}
          >
            Stogie
          </Text>

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity
              onPress={() => signIn()}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                marginRight: 8,
              }}
            >
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: 16,
                  fontWeight: "500",
                }}
              >
                Sign In
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => signIn()}
              style={{
                backgroundColor: colors.accentGold,
                paddingHorizontal: 20,
                paddingVertical: 8,
                borderRadius: 20,
              }}
            >
              <Text
                style={{
                  color: colors.bgPrimary,
                  fontSize: 16,
                  fontWeight: "600",
                }}
              >
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View
          style={{
            flex: 1,
            paddingHorizontal: 20,
            justifyContent: "center",
            marginTop: -100,
          }}
        >
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: 48,
              fontWeight: "700",
              lineHeight: 56,
              textAlign: "center",
              marginBottom: 24,
            }}
          >
            Track Your Cigar Journey
          </Text>

          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 18,
              lineHeight: 28,
              textAlign: "center",
              marginBottom: 60,
              paddingHorizontal: 20,
            }}
          >
            Discover new cigars, manage your humidor, connect with fellow
            enthusiasts, and never forget a great smoke again.
          </Text>

          <View style={{ alignItems: "center" }}>
            <TouchableOpacity
              onPress={() => signIn()}
              style={{
                backgroundColor: colors.accentGold,
                paddingHorizontal: 48,
                paddingVertical: 16,
                borderRadius: 24,
                marginBottom: 16,
                minWidth: 200,
              }}
            >
              <Text
                style={{
                  color: colors.bgPrimary,
                  fontSize: 18,
                  fontWeight: "600",
                  textAlign: "center",
                }}
              >
                Get Started Free
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => signIn()}
              style={{
                borderWidth: 1,
                borderColor: colors.buttonOutline,
                paddingHorizontal: 48,
                paddingVertical: 16,
                borderRadius: 24,
                minWidth: 200,
              }}
            >
              <Text
                style={{
                  color: colors.accentGold,
                  fontSize: 18,
                  fontWeight: "600",
                  textAlign: "center",
                }}
              >
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View
          style={{
            paddingHorizontal: 20,
            paddingBottom: insets.bottom + 40,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: 24,
              fontWeight: "600",
              textAlign: "center",
            }}
          >
            Popular Cigars in Our Database
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      <StatusBar style="light" />

      <View
        style={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 20,
          paddingVertical: 16,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottomWidth: 1,
          borderBottomColor: "rgba(255, 255, 255, 0.1)",
        }}
      >
        <Text
          style={{
            color: colors.textPrimary,
            fontSize: 28,
            fontWeight: "700",
          }}
        >
          Stogie
        </Text>

        <TouchableOpacity>
          <Search size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <View
        style={{
          flexDirection: "row",
          paddingHorizontal: 20,
          paddingVertical: 16,
          gap: 16,
        }}
      >
        {["Following", "Nearby", "Trending"].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={{
              backgroundColor:
                activeTab === tab ? colors.accentGold : "transparent",
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 20,
            }}
          >
            <Text
              style={{
                color:
                  activeTab === tab ? colors.bgPrimary : colors.textSecondary,
                fontSize: 16,
                fontWeight: "600",
              }}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={{ flex: 1, alignItems: "center", marginTop: 40 }}>
            <ActivityIndicator size="large" color={colors.accentGold} />
          </View>
        ) : posts.length === 0 ? (
          <View style={{ alignItems: "center", paddingHorizontal: 40, marginTop: 40 }}>
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 18,
                textAlign: "center",
                lineHeight: 26,
              }}
            >
              No posts yet. Tap the + button to share your first photo.
            </Text>
          </View>
        ) : (
          posts.map((p) => (
            <View key={p.id} style={{ paddingHorizontal: 16, marginBottom: 20, opacity: deletingPostId === p.id ? 0.5 : 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <TouchableOpacity 
                  onPress={() => p.user_id && router.push(`/user/${p.user_id}`)}
                  style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
                >
                  {p.profiles?.avatar_url ? (
                    <Image source={{ uri: p.profiles.avatar_url }} style={{ width: 36, height: 36, borderRadius: 18, marginRight: 8 }} />
                  ) : (
                    <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surface, marginRight: 8 }} />
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.textPrimary, fontWeight: "600" }}>{p.profiles?.username || "User"}</Text>
                    <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>{formatTimeAgo(p.created_at)}</Text>
                  </View>
                </TouchableOpacity>

                {p.user_id === user?.id && (
                  <TouchableOpacity 
                    onPress={() => handleDeletePost(p.id, p.user_id)}
                    disabled={deletingPostId === p.id}
                    style={{ padding: 8 }}
                  >
                    <MoreVertical size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                )}
              </View>

              {p.image_url ? (
                <View style={{ position: "relative" }}>
                  <Image 
                    source={{ uri: p.image_url }} 
                    style={{ width: "100%", aspectRatio: 1, borderRadius: 12, backgroundColor: colors.surface }} 
                  />
                  
                  <View 
                    style={{
                      position: "absolute",
                      bottom: 16,
                      right: 16,
                      gap: 12,
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => handleLikePost(p.id)}
                      style={{
                        backgroundColor: "transparent",
                        borderRadius: 20,
                        padding: 10,
                        alignItems: "center",
                        justifyContent: "center",
                        width: 44,
                        height: 44,
                      }}
                    >
                      <Heart 
                        size={22} 
                        color={p.liked_by_me ? colors.accentGold : "#fff"} 
                        fill={p.liked_by_me ? colors.accentGold : "transparent"}
                      />
                      {p.like_count > 0 && (
                        <Text style={{ color: "#fff", fontSize: 10, fontWeight: "600", marginTop: 2 }}>
                          {p.like_count}
                        </Text>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleCommentPress(p.id)}
                      style={{
                        backgroundColor: "transparent",
                        borderRadius: 20,
                        padding: 10,
                        alignItems: "center",
                        justifyContent: "center",
                        width: 44,
                        height: 44,
                      }}
                    >
                      <MessageCircle size={22} color="#fff" />
                      {p.comment_count > 0 && (
                        <Text style={{ color: "#fff", fontSize: 10, fontWeight: "600", marginTop: 2 }}>
                          {p.comment_count}
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              ) : null}

              {p.caption ? (
                <Text style={{ color: colors.textSecondary, marginTop: 8 }}>{p.caption}</Text>
              ) : null}
            </View>
          ))
        )}
      </ScrollView>

      <View style={{ position: "absolute", right: 20, bottom: insets.bottom + 24 }}>
        <TouchableOpacity
          onPress={() => setShowNewPost(true)}
          activeOpacity={0.9}
          style={{
            backgroundColor: colors.accentGold,
            width: 56,
            height: 56,
            borderRadius: 28,
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#000",
            shadowOpacity: 0.3,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 4 },
          }}
        >
          <Plus size={28} color={colors.bgPrimary} />
        </TouchableOpacity>
      </View>

      <NewPostModal visible={showNewPost} onClose={() => setShowNewPost(false)} onPosted={load} />

      <CommentsModal
        visible={showComments}
        onClose={() => {
          setShowComments(false);
          setSelectedPostId(null);
        }}
        postId={selectedPostId}
      />
    </View>
  );
}
