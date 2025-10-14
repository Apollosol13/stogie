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
import NewPostBottomSheet from "@/components/feed/NewPostBottomSheet";
import NewPostCaptionModal from "@/components/feed/NewPostCaptionModal";
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
  const [activeTab, setActiveTab] = useState("For You");
  
  // Pass filter to useFeed based on activeTab
  const filter = activeTab === "Following" ? "following" : null;
  const { posts, loading, load, toggleLike, removePost } = useFeed(filter);
  
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [showCaptionModal, setShowCaptionModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
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

  const handleImageSelected = (image) => {
    setSelectedImage(image);
    setShowCaptionModal(true);
  };

  const handlePostCreated = () => {
    setShowCaptionModal(false);
    setSelectedImage(null);
    load(); // Reload feed
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
              fontFamily: 'LibreBodoni_700Bold',
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
                borderRadius: 8,
                backgroundColor: colors.accentGold,
              }}
            >
              <Text
                style={{
                  color: colors.bgPrimary,
                  fontSize: 16,
                  fontWeight: "600",
                }}
              >
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: insets.bottom + 40,
          }}
        >
          <View style={{ marginBottom: 40 }}>
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: 32,
                fontWeight: "700",
                lineHeight: 42,
                marginBottom: 16,
              }}
            >
              Your Digital{"\n"}Cigar Companion
            </Text>
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 18,
                lineHeight: 26,
              }}
            >
              Track your collection, discover new cigars, and connect with
              fellow enthusiasts.
            </Text>
          </View>

          <View style={{ marginBottom: 40 }}>
            <View
              style={{
                backgroundColor: colors.surface,
                padding: 24,
                borderRadius: 16,
                marginBottom: 16,
              }}
            >
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: 20,
                  fontWeight: "600",
                  marginBottom: 8,
                }}
              >
                🔍 AI-Powered Scanner
              </Text>
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: 16,
                  lineHeight: 24,
                }}
              >
                Instantly identify any cigar with your camera
              </Text>
            </View>

            <View
              style={{
                backgroundColor: colors.surface,
                padding: 24,
                borderRadius: 16,
                marginBottom: 16,
              }}
            >
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: 20,
                  fontWeight: "600",
                  marginBottom: 8,
                }}
              >
                📱 Digital Humidor
              </Text>
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: 16,
                  lineHeight: 24,
                }}
              >
                Manage your collection and wishlist in one place
              </Text>
            </View>

            <View
              style={{
                backgroundColor: colors.surface,
                padding: 24,
                borderRadius: 16,
              }}
            >
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: 20,
                  fontWeight: "600",
                  marginBottom: 8,
                }}
              >
                🗺️ Find Nearby Shops
              </Text>
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: 16,
                  lineHeight: 24,
                }}
              >
                Discover cigar lounges and retailers near you
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => signIn()}
            style={{
              backgroundColor: colors.accentGold,
              paddingVertical: 16,
              borderRadius: 12,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: colors.bgPrimary,
                fontSize: 18,
                fontWeight: "700",
              }}
            >
              Get Started
            </Text>
          </TouchableOpacity>
        </ScrollView>

        <View style={{ alignItems: "center", marginBottom: insets.bottom + 20 }}>
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
            fontFamily: 'LibreBodoni_700Bold',
            flex: 1, // ensure the title can take available horizontal space
            marginRight: 12, // give space before the search icon to avoid clipping
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
        {["For You", "Following"].map((tab) => (
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
              {activeTab === "Following" 
                ? "No posts from people you follow yet. Follow some users to see their posts here!"
                : "No posts yet. Tap the + button to share your first photo."}
            </Text>
          </View>
        ) : (
          posts.map((p) => (
            <View
              key={p.id}
              style={{
                marginBottom: 20,
                backgroundColor: colors.surface,
                borderRadius: 12,
                overflow: "hidden",
                marginHorizontal: 16,
              }}
            >
              {/* Post Header */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: 12,
                }}
              >
                <TouchableOpacity
                  onPress={() => p.user_id && router.push(`/user/${p.user_id}`)}
                  style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
                >
                  {p.profiles?.avatar_url ? (
                    <Image
                      source={{ uri: p.profiles.avatar_url }}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        marginRight: 8,
                      }}
                    />
                  ) : (
                    <View
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        backgroundColor: colors.surface,
                        marginRight: 8,
                      }}
                    />
                  )}
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: colors.textPrimary,
                        fontWeight: "600",
                      }}
                    >
                      {p.profiles?.username || "User"}
                    </Text>
                    <Text
                      style={{
                        color: colors.textSecondary,
                        fontSize: 12,
                        marginTop: 2,
                      }}
                    >
                      {formatTimeAgo(p.created_at)}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Three-dot menu (only for post owner) */}
                {p.user_id === user?.id && (
                  <TouchableOpacity
                    onPress={() => handleDeletePost(p.id, p.user_id)}
                    disabled={deletingPostId === p.id}
                  >
                    {deletingPostId === p.id ? (
                      <ActivityIndicator
                        size="small"
                        color={colors.textSecondary}
                      />
                    ) : (
                      <MoreVertical size={20} color={colors.textSecondary} />
                    )}
                  </TouchableOpacity>
                )}
              </View>

              {/* Post Image */}
              <Image
                source={{ uri: p.image_url }}
                style={{
                  width: "100%",
                  aspectRatio: 1,
                  backgroundColor: colors.bgPrimary,
                }}
                resizeMode="cover"
              />

              {/* Like & Comment Buttons */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 12,
                  gap: 16,
                }}
              >
                <TouchableOpacity
                  onPress={() => handleLikePost(p.id)}
                  style={{ flexDirection: "row", alignItems: "center" }}
                >
                  <Heart
                    size={24}
                    color={p.liked_by_me ? colors.accentGold : colors.textSecondary}
                    fill={p.liked_by_me ? colors.accentGold : "transparent"}
                  />
                  <Text
                    style={{
                      color: colors.textPrimary,
                      marginLeft: 6,
                      fontSize: 16,
                      fontWeight: "600",
                    }}
                  >
                    {p.like_count || 0}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleCommentPress(p.id)}
                  style={{ flexDirection: "row", alignItems: "center" }}
                >
                  <MessageCircle size={24} color={colors.textSecondary} />
                  <Text
                    style={{
                      color: colors.textPrimary,
                      marginLeft: 6,
                      fontSize: 16,
                      fontWeight: "600",
                    }}
                  >
                    {p.comment_count || 0}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Caption */}
              {p.caption && (
                <View style={{ paddingHorizontal: 12, paddingBottom: 12 }}>
                  <Text style={{ color: colors.textPrimary, lineHeight: 20 }}>
                    <Text style={{ fontWeight: "600" }}>
                      {p.profiles?.username || "User"}
                    </Text>{" "}
                    {p.caption}
                  </Text>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={{
          position: "absolute",
          bottom: 50,
          right: 20,
          backgroundColor: colors.accentGold,
          borderRadius: 30,
          width: 60,
          height: 60,
          justifyContent: "center",
          alignItems: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 5,
          elevation: 5,
          zIndex: 999,
        }}
        onPress={() => setShowBottomSheet(true)}
      >
        <Plus size={30} color={colors.bgPrimary} />
      </TouchableOpacity>

      <NewPostBottomSheet
        visible={showBottomSheet}
        onClose={() => setShowBottomSheet(false)}
        onImageSelected={handleImageSelected}
      />

      <NewPostCaptionModal
        visible={showCaptionModal}
        onClose={() => {
          setShowCaptionModal(false);
          setSelectedImage(null);
        }}
        selectedImage={selectedImage}
        onPosted={handlePostCreated}
      />

      {selectedPostId && (
        <CommentsModal
          visible={showComments}
          postId={selectedPostId}
          onClose={() => {
            setShowComments(false);
            setSelectedPostId(null);
            load(); // Reload to update comment counts
          }}
        />
      )}
    </View>
  );
}
