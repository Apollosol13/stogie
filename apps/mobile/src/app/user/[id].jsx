import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from "react-native";
import { useLocalSearchParams, Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, UserPlus, UserMinus } from "lucide-react-native";
import { apiRequest } from "@/utils/api";
import { useUser } from "@/utils/auth/useUser";
import StatsView from "@/components/profile/StatsView";
import PostsGrid from "@/components/profile/PostsGrid";
import PostDetailModal from "@/components/profile/PostDetailModal";

const colors = {
  bgPrimary: "#0F0F0F",
  surface: "#1A1A1A",
  textPrimary: "#FFFFFF",
  textSecondary: "#B0B0B0",
  textTertiary: "#6B7280",
  accentGold: "#D4B896",
};

export default function UserProfileScreen() {
  const { id: userId } = useLocalSearchParams();
  const { user: currentUser } = useUser();
  const insets = useSafeAreaInsets();

  const [profile, setProfile] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showPostDetail, setShowPostDetail] = useState(false);

  useEffect(() => {
    loadUserProfile();
    checkFollowStatus();
  }, [userId]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      // Fetch profile
      const profileRes = await apiRequest(`/api/profiles/${userId}`);
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setProfile(profileData.profile);
      }

      // Fetch analytics
      const analyticsRes = await apiRequest(`/api/analytics/${userId}`);
      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        setAnalytics(analyticsData);
      }

      // Fetch user's posts
      const postsRes = await apiRequest("/api/posts");
      if (postsRes.ok) {
        const postsData = await postsRes.json();
        const userPosts = postsData.posts.filter((p) => p.user_id === userId);
        setPosts(userPosts);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      Alert.alert("Error", "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const checkFollowStatus = async () => {
    try {
      const res = await apiRequest(`/api/follow/status/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setIsFollowing(data.following);
      }
    } catch (error) {
      console.error("Error checking follow status:", error);
    }
  };

  const handleFollowToggle = async () => {
    try {
      setFollowLoading(true);
      const res = await apiRequest(`/api/follow/${userId}`, {
        method: "POST",
      });

      if (res.ok) {
        const data = await res.json();
        setIsFollowing(data.following);
        
        // Optimistically update follower count in the correct nested structure
        setAnalytics((prev) => {
          const currentFollowers = prev?.userStats?.followers || 0;
          const newFollowers = data.following 
            ? currentFollowers + 1 
            : Math.max(currentFollowers - 1, 0);
          
          return {
            ...prev,
            followers: newFollowers, // Top-level for compatibility
            userStats: {
              ...prev?.userStats,
              followers: newFollowers,
            },
          };
        });
        
        // Reload full analytics to sync with server
        const analyticsRes = await apiRequest(`/api/analytics/${userId}`);
        if (analyticsRes.ok) {
          const analyticsData = await analyticsRes.json();
          setAnalytics(analyticsData);
        }
      } else {
        Alert.alert("Error", "Failed to follow/unfollow");
      }
    } catch (error) {
      console.error("Error following:", error);
      Alert.alert("Error", "Failed to follow/unfollow");
    } finally {
      setFollowLoading(false);
    }
  };

  const handlePostPress = (post) => {
    setSelectedPost(post);
    setShowPostDetail(true);
  };

  const handleLikePost = async (postId) => {
    try {
      const res = await apiRequest(`/api/posts/${postId}/like`, { method: "POST" });
      if (res.ok) {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  liked_by_me: !p.liked_by_me,
                  like_count: p.liked_by_me ? p.like_count - 1 : p.like_count + 1,
                }
              : p
          )
        );
        if (selectedPost?.id === postId) {
          setSelectedPost((prev) => ({
            ...prev,
            liked_by_me: !prev.liked_by_me,
            like_count: prev.liked_by_me ? prev.like_count - 1 : prev.like_count + 1,
          }));
        }
      }
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bgPrimary, justifyContent: "center", alignItems: "center" }}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color={colors.accentGold} />
      </View>
    );
  }

  const isOwnProfile = currentUser?.id === userId;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      <StatusBar style="light" />
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 20,
          paddingBottom: 16,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: "700" }}>
          @{profile?.username || "User"}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Info */}
        <View style={{ paddingHorizontal: 20, paddingBottom: 24, alignItems: "center" }}>
          <Image
            source={{ uri: profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}` }}
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              borderWidth: 3,
              borderColor: colors.accentGold,
              marginBottom: 16,
            }}
          />

          <Text style={{ color: colors.textPrimary, fontSize: 24, fontWeight: "700", marginBottom: 4 }}>
            {profile?.full_name || profile?.username || "User"}
          </Text>

          <Text style={{ color: colors.textSecondary, fontSize: 16, marginBottom: 8 }}>
            @{profile?.username || "user"}
          </Text>

          {profile?.bio && (
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 14,
                textAlign: "center",
                marginBottom: 12,
                lineHeight: 20,
              }}
            >
              {profile.bio}
            </Text>
          )}

          {/* Follow/Unfollow Button */}
          {!isOwnProfile && (
            <TouchableOpacity
              onPress={handleFollowToggle}
              disabled={followLoading}
              style={{
                backgroundColor: isFollowing ? colors.surface : colors.accentGold,
                paddingHorizontal: 32,
                paddingVertical: 12,
                borderRadius: 24,
                flexDirection: "row",
                alignItems: "center",
                marginTop: 12,
                borderWidth: isFollowing ? 1 : 0,
                borderColor: colors.textSecondary,
              }}
            >
              {followLoading ? (
                <ActivityIndicator size="small" color={isFollowing ? colors.textPrimary : colors.bgPrimary} />
              ) : (
                <>
                  {isFollowing ? (
                    <UserMinus size={16} color={colors.textPrimary} />
                  ) : (
                    <UserPlus size={16} color={colors.bgPrimary} />
                  )}
                  <Text
                    style={{
                      color: isFollowing ? colors.textPrimary : colors.bgPrimary,
                      fontSize: 16,
                      fontWeight: "600",
                      marginLeft: 8,
                    }}
                  >
                    {isFollowing ? "Following" : "Follow"}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        <StatsView analytics={analytics} />

        <PostsGrid posts={posts} onPostPress={handlePostPress} />

        <View style={{ height: insets.bottom + 100 }} />
      </ScrollView>

      <PostDetailModal
        visible={showPostDetail}
        onClose={() => setShowPostDetail(false)}
        post={selectedPost}
        currentUserId={currentUser?.id}
        onLike={handleLikePost}
        onDelete={() => {}}
      />
    </View>
  );
}

