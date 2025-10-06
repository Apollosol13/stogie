import { useState, useEffect } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "@/utils/auth/useAuth";
import useUser from "@/utils/auth/useUser";
import { apiRequest, API_BASE_URL, getAuthToken } from "../utils/api";

export default function useProfile() {
  const { isAuthenticated } = useAuth();
  const { data: user } = useUser();
  const [profile, setProfile] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch profile data
  const fetchProfile = async () => {
    if (!isAuthenticated) return;

    console.log("👤 useProfile: Fetching profile...");
    try {
      const response = await apiRequest("/api/profiles");
      console.log("👤 useProfile: Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("👤 useProfile: Profile loaded:", data.profile?.username);
        setProfile(data.profile);
      } else {
        console.error("👤 useProfile: Failed to load profile:", response.status);
      }
    } catch (error) {
      console.error("👤 useProfile: Error:", error);
    }
  };

  // Fetch analytics data
  const fetchAnalytics = async () => {
    if (!isAuthenticated) return;

    try {
      const response = await apiRequest("/api/analytics");
      if (response.ok) {
        const data = await response.json();
        // Extract the nested analytics object to match StatsView expectations
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error("Analytics fetch error:", error);
    }
  };

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchProfile(), fetchAnalytics()]);
      setLoading(false);
    };

    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const handleSaveProfile = async (editForm) => {
    setSaving(true);
    try {
      const response = await apiRequest("/api/profiles", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: editForm.display_name,
          username: editForm.username,
          bio: editForm.bio,
          location: editForm.location,
          experience_level: editForm.experience_level,
          favorite_strength: editForm.favorite_strength,
          favorite_wrapper: editForm.favorite_wrapper,
        }),
      });

      if (response.ok) {
        Alert.alert("Success", "Profile updated successfully!");
        setShowEditModal(false);
        await fetchProfile();
      } else {
        const errorData = await response.json();
        Alert.alert(
          "Error",
          errorData.error || "Failed to update profile. Please try again.",
        );
      }
    } catch (error) {
      console.error("Profile update error:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
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
        // Use the exported getAuthToken function for consistency
        const token = await getAuthToken();

        if (!token) {
          Alert.alert("Error", "Please sign in again to update your profile picture.");
          return;
        }

        const formData = new FormData();
        // Prefer React Native file object over Blob for iOS camera roll URIs
        const asset = result.assets[0];
        const fileName = asset.fileName || `profile-image-${Date.now()}.jpg`;
        const mimeType = asset.mimeType || 'image/jpeg';
        formData.append('image', { uri: imageUri, name: fileName, type: mimeType });

        console.log('[Profile] Uploading image with token:', token ? 'exists' : 'null');
        
        const uploadResponse = await fetch(`${API_BASE_URL}/api/profiles/image`, {
          method: "POST",
          headers: {
            'Authorization': `Bearer ${token}`,
            // Don't set Content-Type - let FormData set it automatically
          },
          body: formData,
        });

        const data = await uploadResponse.json();
        console.log('[Profile] Upload response:', data);

        if (uploadResponse.ok && data.success) {
        // Refresh the profile to get updated data (add cache-busting query)
        await apiRequest(`/api/profiles?ts=${Date.now()}`);
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
        console.error("Image upload error:", error);
        Alert.alert(
          "Error",
          "Failed to upload image. Please check your connection and try again.",
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
    saving,
    showEditModal,
    setShowEditModal,
    handleSaveProfile,
    handleSelectProfileImage,
    refreshProfile: async () => {
      setLoading(true);
      await Promise.all([fetchProfile(), fetchAnalytics()]);
      setLoading(false);
    },
  };
}
