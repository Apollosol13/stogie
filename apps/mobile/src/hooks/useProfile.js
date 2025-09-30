import { useState, useEffect } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as SecureStore from 'expo-secure-store';
import { useAuth } from "@/utils/auth/useAuth";
import useUser from "@/utils/auth/useUser";
import { apiRequest, API_BASE_URL } from "../utils/api";

export default function useProfile() {
  const { isAuthenticated } = useAuth();
  const { data: user } = useUser();
  const [profile, setProfile] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchProfile = async () => {
    try {
      const response = await apiRequest("/api/profiles");
      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
      } else {
        console.error(
          "Profile fetch failed:",
          response.status,
          response.statusText,
        );
        setProfile(null);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setProfile(null);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await apiRequest("/api/analytics");
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.analytics);
      } else {
        console.error(
          "Analytics fetch failed:",
          response.status,
          response.statusText,
        );
        setAnalytics(null);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      setAnalytics(null);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      setLoading(true);
      Promise.all([fetchProfile(), fetchAnalytics()]).finally(() =>
        setLoading(false),
      );
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const handleSaveProfile = async (editForm) => {
    setSaving(true);
    try {
      const response = await apiRequest("/api/profiles", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setProfile(data.profile);
        setShowEditModal(false);
        Alert.alert("Success", "Profile updated successfully!");
      } else {
        console.error("Profile update error:", data);
        Alert.alert(
          "Error",
          data.error || "Failed to update profile. Please try again.",
        );
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert(
        "Error",
        "Network error. Please check your connection and try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSelectProfileImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        "Permission Required",
        "Please allow access to your photos to update your profile picture.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const imageUri = result.assets[0].uri;

      setSaving(true);

      try {
        // Get JWT token for authorization
        let token = null;
        try {
          const authData = await SecureStore.getItemAsync('stogie-auth-jwt');
          if (authData) {
            const auth = JSON.parse(authData);
            token = auth.jwt || auth.session?.access_token || auth.access_token;
          }
        } catch (error) {
          console.log('Error getting auth token:', error);
        }

        if (!token) {
          Alert.alert("Error", "Please sign in again to update your profile picture.");
          return;
        }

        const formData = new FormData();

        // Create proper blob for the image
        const response = await fetch(imageUri);
        const blob = await response.blob();

        formData.append("image", blob, "profile-image.jpg");

        const uploadResponse = await fetch(`${API_BASE_URL}/api/profiles/image`, {
          method: "POST",
          headers: {
            'Authorization': `Bearer ${token}`,
            // Don't set Content-Type - let FormData set it automatically
          },
          body: formData,
        });

        const data = await uploadResponse.json();

        if (uploadResponse.ok && data.success) {
          // Refresh the profile to get updated data
          await fetchProfile();
          Alert.alert("Success", "Profile picture updated successfully!");
        } else {
          console.error("Upload error:", data);
          Alert.alert(
            "Error",
            data.error || "Failed to update profile picture. Please try again.",
          );
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        Alert.alert(
          "Error",
          "Network error. Please check your connection and try again.",
        );
      } finally {
        setSaving(false);
      }
    }
  };

  return {
    profile,
    analytics,
    loading,
    showEditModal,
    setShowEditModal,
    saving,
    handleSaveProfile,
    handleSelectProfileImage,
  };
}
