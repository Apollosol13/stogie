import React, { useState, useEffect } from "react";
import { View, ScrollView, Alert, RefreshControl } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../utils/auth/useAuth";
import useUser from "../../utils/auth/useUser";
import useProfile from "../../hooks/useProfile";
import { apiRequest } from "../../utils/api";

import { colors } from "../../constants/colors";
import LoadingScreen from "../../components/common/LoadingScreen";
import AuthPrompt from "../../components/auth/AuthPrompt";
import ProfileHeader from "../../components/profile/ProfileHeader";
import StatsView from "../../components/profile/StatsView";
import PostsGrid from "../../components/profile/PostsGrid";
import PostDetailModal from "../../components/profile/PostDetailModal";
import SettingsModal from "../../components/profile/SettingsModal";
import EditProfileModal from "../../components/profile/EditProfileModal";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { signOut, signIn, isAuthenticated, isReady } = useAuth();
  const { data: user, loading: userLoading } = useUser();
  const {
    profile,
    analytics,
    loading: profileLoading,
    showEditModal,
    setShowEditModal,
    saving,
    handleSaveProfile,
    handleSelectProfileImage,
    refreshProfile,
  } = useProfile();

  const [userPosts, setUserPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showPostDetailModal, setShowPostDetailModal] = useState(false);

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Sign Out", 
        style: "destructive", 
        onPress: () => {
          signOut();
          setShowSettingsModal(false);
        }
      },
    ]);
  };

  // Fetch user's posts
  const fetchUserPosts = async () => {
    try {
      setLoadingPosts(true);
      const response = await apiRequest("/api/posts");
      if (response.ok) {
        const data = await response.json();
        // Filter to only show current user's posts
        const myPosts = data.posts.filter((post) => post.user_id === user?.id);
        setUserPosts(myPosts);
      }
    } catch (error) {
      console.error("Error fetching user posts:", error);
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchUserPosts();
    }
  }, [user?.id]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshProfile(), fetchUserPosts()]);
    setRefreshing(false);
  };

  const handlePostPress = (post) => {
    setSelectedPost(post);
    setShowPostDetailModal(true);
  };

  const handleLikePost = async (postId) => {
    try {
      const response = await apiRequest(`/api/posts/${postId}/like`, {
        method: "POST",
      });
      if (response.ok) {
        // Update the post in the list
        setUserPosts((prevPosts) =>
          prevPosts.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  liked_by_me: !p.liked_by_me,
                  like_count: p.liked_by_me ? p.like_count - 1 : p.like_count + 1,
                }
              : p
          )
        );
        // Update selected post if it's open
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
      Alert.alert("Error", "Failed to like post");
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      const response = await apiRequest(`/api/posts/${postId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setUserPosts((prevPosts) => prevPosts.filter((p) => p.id !== postId));
      } else {
        Alert.alert("Error", "Failed to delete post");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      Alert.alert("Error", "Failed to delete post");
    }
  };

  if (!isReady || userLoading || profileLoading) {
    return <LoadingScreen text="Loading profile..." />;
  }

  if (!isAuthenticated) {
    return <AuthPrompt onSignIn={signIn} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      <StatusBar style="light" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + 16 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#D4B896"
            colors={["#D4B896"]}
          />
        }
      >
        <ProfileHeader
          profile={profile}
          user={user}
          onEdit={() => setShowEditModal(true)}
          onSelectImage={handleSelectProfileImage}
          onSettingsPress={() => setShowSettingsModal(true)}
        />

        <StatsView analytics={analytics} />

        <PostsGrid posts={userPosts} onPostPress={handlePostPress} />

        <View style={{ height: insets.bottom + 100 }} />
      </ScrollView>

      <EditProfileModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        profile={profile}
        onSave={handleSaveProfile}
        saving={saving}
      />

      <SettingsModal
        visible={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        onSignOut={handleSignOut}
      />

      <PostDetailModal
        visible={showPostDetailModal}
        onClose={() => setShowPostDetailModal(false)}
        post={selectedPost}
        currentUserId={user?.id}
        onLike={handleLikePost}
        onDelete={handleDeletePost}
      />
    </View>
  );
}
