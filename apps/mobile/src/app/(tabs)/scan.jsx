import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
  Switch,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUser } from "@/utils/auth/useUser";
import AuthPrompt from "@/components/auth/AuthPrompt";
import * as ImagePicker from "expo-image-picker";
import { Camera, Image as ImageIcon, X } from "lucide-react-native";
import { apiRequest } from "@/utils/api";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";

const colors = {
  bgPrimary: "#0F0F0F",
  surface: "#1A1A1A",
  surface2: "#242424",
  textPrimary: "#FFFFFF",
  textSecondary: "#B0B0B0",
  accentGold: "#D4B896",
};

export default function CaptureScreen() {
  const insets = useSafeAreaInsets();
  const { data: user, loading: userLoading } = useUser();
  
  const [showBottomSheet, setShowBottomSheet] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showPostForm, setShowPostForm] = useState(false);
  const [caption, setCaption] = useState("");
  const [addToHumidor, setAddToHumidor] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Show bottom sheet when tab is focused
  useFocusEffect(
    React.useCallback(() => {
      if (!showPostForm) {
        setShowBottomSheet(true);
      }
    }, [showPostForm])
  );

  const resetForm = () => {
    setSelectedImage(null);
    setShowPostForm(false);
    setCaption("");
    setAddToHumidor(false);
    setShowBottomSheet(false); // Don't show after posting
  };

  const handleCloseBottomSheet = () => {
    setShowBottomSheet(false);
    router.push("/(tabs)/home");
  };

  const handleCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "Camera access is needed to take photos.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (!result.canceled && result.assets?.length) {
        setSelectedImage(result.assets[0]);
        setShowBottomSheet(false);
        setShowPostForm(true);
      }
    } catch (error) {
      console.error("Camera error:", error);
      Alert.alert("Error", "Failed to open camera");
    }
  };

  const handleGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "Photo library access is needed.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.9,
      });

      if (!result.canceled && result.assets?.length) {
        setSelectedImage(result.assets[0]);
        setShowBottomSheet(false);
        setShowPostForm(true);
      }
    } catch (error) {
      console.error("Gallery error:", error);
      Alert.alert("Error", "Failed to open photo library");
    }
  };

  const handleShare = async () => {
    if (!selectedImage || submitting) return;

    try {
      setSubmitting(true);

      // Upload image
      const formData = new FormData();
      formData.append("image", {
        uri: selectedImage.uri,
        name: `post-${Date.now()}.jpg`,
        type: selectedImage.mimeType || "image/jpeg",
      });

      const uploadRes = await apiRequest("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error("Failed to upload image");
      }

      const { url } = await uploadRes.json();

      // Create post
      const createRes = await apiRequest("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_url: url,
          caption: caption.trim() || null,
        }),
      });

      if (!createRes.ok) {
        throw new Error("Failed to create post");
      }

      // Optionally add to humidor
      if (addToHumidor) {
        const humidorData = {
          brand: "Unknown",
          line: caption.trim() || "New Cigar",
          vitola: "Unknown", // Required field
          image_url: url,
          notes: caption.trim() || null,
          status: "owned", // Must be: owned, wishlist, or smoked
        };

        const humidorRes = await apiRequest("/api/humidor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(humidorData),
        });

        if (!humidorRes.ok) {
          console.error("Failed to add to humidor:", await humidorRes.text());
        }
      }

      Alert.alert("Success", addToHumidor ? "Post created and added to humidor!" : "Post created!");
      resetForm();
      // Navigate to home without showing bottom sheet
      router.replace("/(tabs)/home");
    } catch (error) {
      console.error("Share error:", error);
      Alert.alert("Error", error.message || "Failed to create post");
    } finally {
      setSubmitting(false);
    }
  };

  if (userLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.bgPrimary,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <StatusBar style="light" />
        <ActivityIndicator size="large" color={colors.accentGold} />
      </View>
    );
  }

  if (!user) {
    return <AuthPrompt />;
  }

  // Post Form Screen
  if (showPostForm) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
        <StatusBar style="light" />
        <View style={{ flex: 1, paddingTop: insets.top }}>
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderBottomColor: colors.surface2,
            }}
          >
            <TouchableOpacity onPress={resetForm}>
              <Text style={{ color: colors.textPrimary, fontSize: 24 }}>‹</Text>
            </TouchableOpacity>
            <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: "700" }}>
              New Post
            </Text>
            <TouchableOpacity onPress={handleShare} disabled={submitting}>
              {submitting ? (
                <ActivityIndicator color={colors.accentGold} />
              ) : (
                <Text
                  style={{
                    color: colors.accentGold,
                    fontSize: 16,
                    fontWeight: "700",
                  }}
                >
                  Share
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ padding: 16 }}>
            {/* Content Row - Image and Caption side by side */}
            <View style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 24 }}>
              {/* Image Preview */}
              {selectedImage && (
                <Image
                  source={{ uri: selectedImage.uri }}
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 8,
                    backgroundColor: colors.surface,
                    marginRight: 12,
                  }}
                  resizeMode="cover"
                />
              )}

              {/* Caption Input */}
              <View style={{ flex: 1 }}>
                <TextInput
                  placeholder="Write a caption..."
                  placeholderTextColor={colors.textSecondary}
                  value={caption}
                  onChangeText={setCaption}
                  style={{
                    color: colors.textPrimary,
                    fontSize: 16,
                    minHeight: 80,
                    textAlignVertical: "top",
                  }}
                  multiline
                  maxLength={2000}
                  autoFocus
                />
              </View>
            </View>

            {/* Add to Humidor Toggle */}
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 12,
                padding: 16,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: "600", marginBottom: 4 }}>
                  Add to Humidor
                </Text>
                <Text style={{ color: colors.textSecondary, fontSize: 14, lineHeight: 20 }}>
                  Save this to your collection. You can edit details later in your humidor.
                </Text>
              </View>
              <Switch
                value={addToHumidor}
                onValueChange={setAddToHumidor}
                trackColor={{ false: colors.surface2, true: colors.accentGold }}
                thumbColor={colors.textPrimary}
              />
            </View>
          </ScrollView>
        </View>
      </View>
    );
  }

  // Main Screen - Just show the modal
  return (
    <View style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      <StatusBar style="light" />

      {/* Bottom Sheet */}
      <Modal
        visible={showBottomSheet}
        transparent
        animationType="slide"
        onRequestClose={handleCloseBottomSheet}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={handleCloseBottomSheet}
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            justifyContent: "flex-end",
          }}
        >
          <TouchableOpacity activeOpacity={1}>
            <View
              style={{
                backgroundColor: colors.surface,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                paddingBottom: insets.bottom + 20,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingHorizontal: 20,
                  paddingTop: 20,
                  paddingBottom: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.surface2,
                }}
              >
                <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: "700" }}>
                  Choose Photo
                </Text>
                <TouchableOpacity onPress={handleCloseBottomSheet}>
                  <X size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={{ paddingTop: 8 }}>
                <TouchableOpacity
                  onPress={handleCamera}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 20,
                    paddingVertical: 16,
                  }}
                >
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      backgroundColor: colors.surface2,
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: 16,
                    }}
                  >
                    <Camera size={24} color={colors.accentGold} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: "600" }}>
                      Take Photo
                    </Text>
                    <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 2 }}>
                      Use camera to capture
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleGallery}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 20,
                    paddingVertical: 16,
                  }}
                >
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      backgroundColor: colors.surface2,
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: 16,
                    }}
                  >
                    <ImageIcon size={24} color={colors.accentGold} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: "600" }}>
                      Choose from Library
                    </Text>
                    <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 2 }}>
                      Select from your photos
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
