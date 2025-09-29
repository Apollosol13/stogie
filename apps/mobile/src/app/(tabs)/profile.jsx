import React, { useState } from "react";
import { View, ScrollView, Alert } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../utils/auth/useAuth";
import useUser from "../../utils/auth/useUser";
import useProfile from "../../hooks/useProfile";

import { colors } from "../../constants/colors";
import LoadingScreen from "../../components/common/LoadingScreen";
import AuthPrompt from "../../components/auth/AuthPrompt";
import ProfileHeader from "../../components/profile/ProfileHeader";
import StatsView from "../../components/profile/StatsView";
import ProfileTabs from "../../components/profile/ProfileTabs";
import ActivityTab from "../../components/profile/ActivityTab";
import StatsTab from "../../components/profile/StatsTab";
import SettingsSection from "../../components/profile/SettingsSection";
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
  } = useProfile();

  const [activeTab, setActiveTab] = useState("activity");

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: signOut },
    ]);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "activity":
        return <ActivityTab />;
      case "stats":
        return <StatsTab profile={profile} />;
      default:
        return null;
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
      >
        <ProfileHeader
          profile={profile}
          user={user}
          onEdit={() => setShowEditModal(true)}
          onSelectImage={handleSelectProfileImage}
        />

        <StatsView analytics={analytics} />

        <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        {renderTabContent()}

        <SettingsSection onSignOut={handleSignOut} />

        <View style={{ height: insets.bottom + 100 }} />
      </ScrollView>

      <EditProfileModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        profile={profile}
        onSave={handleSaveProfile}
        saving={saving}
      />
    </View>
  );
}
