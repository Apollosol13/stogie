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
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUser } from "@/utils/auth/useUser";
import AuthPrompt from "@/components/auth/AuthPrompt";
import * as ImagePicker from "expo-image-picker";
import { Camera, Image as ImageIcon, X } from "lucide-react-native";
import { apiRequest } from "@/utils/api";

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
  
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [showHumidorModal, setShowHumidorModal] = useState(false);
  
  // Form fields
  const [brand, setBrand] = useState("");
  const [lineName, setLineName] = useState("");
  const [vitola, setVitola] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setSelectedImage(null);
    setShowEntryForm(false);
    setBrand("");
    setLineName("");
    setVitola("");
    setNotes("");
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
        aspect: [4, 3],
        quality: 0.85,
      });

      if (!result.canceled && result.assets?.length) {
        setSelectedImage(result.assets[0]);
        setShowBottomSheet(false);
        setShowEntryForm(true);
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
        aspect: [4, 3],
        quality: 0.9,
      });

      if (!result.canceled && result.assets?.length) {
        setSelectedImage(result.assets[0]);
        setShowBottomSheet(false);
        setShowEntryForm(true);
      }
    } catch (error) {
      console.error("Gallery error:", error);
      Alert.alert("Error", "Failed to open photo library");
    }
  };

  const handleAddToHumidor = async (status) => {
    if (!brand.trim()) {
      Alert.alert("Required", "Please enter a brand name");
      return;
    }

    try {
      setSubmitting(true);
      setShowHumidorModal(false);

      // Upload image if available
      let imageUrl = null;
      if (selectedImage) {
        const formData = new FormData();
        formData.append("image", {
          uri: selectedImage.uri,
          name: `cigar-${Date.now()}.jpg`,
          type: selectedImage.mimeType || "image/jpeg",
        });

        const uploadRes = await apiRequest("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (uploadRes.ok) {
          const data = await uploadRes.json();
          imageUrl = data.url;
        }
      }

      // Create cigar entry
      const entryData = {
        brand: brand.trim(),
        name: lineName.trim() || "Unknown",
        vitola: vitola.trim() || null,
        image_url: imageUrl,
        personal_notes: notes.trim() || null,
        status: status, // 'collection', 'wishlist', or 'smoked'
      };

      const res = await apiRequest("/api/humidor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entryData),
      });

      if (!res.ok) {
        throw new Error("Failed to add to humidor");
      }

      Alert.alert("Success", "Added to your humidor!");
      resetForm();
    } catch (error) {
      console.error("Error adding to humidor:", error);
      Alert.alert("Error", error.message || "Failed to add to humidor");
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

  // Entry Form Screen
  if (showEntryForm) {
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
              Add to Collection
            </Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView contentContainerStyle={{ padding: 16 }}>
            {/* Image Preview */}
            {selectedImage && (
              <View
                style={{
                  width: "100%",
                  aspectRatio: 4 / 3,
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                  overflow: "hidden",
                  marginBottom: 24,
                }}
              >
                <Image
                  source={{ uri: selectedImage.uri }}
                  style={{ width: "100%", height: "100%" }}
                  resizeMode="cover"
                />
              </View>
            )}

            {/* Brand (Required) */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ color: colors.textPrimary, fontSize: 16, marginBottom: 8, fontWeight: "600" }}>
                Brand <Text style={{ color: colors.accentGold }}>*</Text>
              </Text>
              <TextInput
                placeholder="e.g., Arturo Fuente, Padron"
                placeholderTextColor={colors.textSecondary}
                value={brand}
                onChangeText={setBrand}
                style={{
                  backgroundColor: colors.surface,
                  color: colors.textPrimary,
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 16,
                }}
              />
            </View>

            {/* Line/Name */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ color: colors.textPrimary, fontSize: 16, marginBottom: 8, fontWeight: "600" }}>
                Line / Name
              </Text>
              <TextInput
                placeholder="e.g., Opus X, 1964 Anniversary"
                placeholderTextColor={colors.textSecondary}
                value={lineName}
                onChangeText={setLineName}
                style={{
                  backgroundColor: colors.surface,
                  color: colors.textPrimary,
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 16,
                }}
              />
            </View>

            {/* Vitola (Size) */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ color: colors.textPrimary, fontSize: 16, marginBottom: 8, fontWeight: "600" }}>
                Vitola (Size)
              </Text>
              <TextInput
                placeholder="e.g., Robusto, Toro, Churchill"
                placeholderTextColor={colors.textSecondary}
                value={vitola}
                onChangeText={setVitola}
                style={{
                  backgroundColor: colors.surface,
                  color: colors.textPrimary,
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 16,
                }}
              />
            </View>

            {/* Notes */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{ color: colors.textPrimary, fontSize: 16, marginBottom: 8, fontWeight: "600" }}>
                Notes
              </Text>
              <TextInput
                placeholder="Add any personal notes..."
                placeholderTextColor={colors.textSecondary}
                value={notes}
                onChangeText={setNotes}
                style={{
                  backgroundColor: colors.surface,
                  color: colors.textPrimary,
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 16,
                  minHeight: 100,
                  textAlignVertical: "top",
                }}
                multiline
              />
            </View>

            {/* Add to Humidor Button */}
            <TouchableOpacity
              onPress={() => setShowHumidorModal(true)}
              disabled={submitting}
              style={{
                backgroundColor: colors.accentGold,
                paddingVertical: 16,
                borderRadius: 12,
                alignItems: "center",
              }}
            >
              {submitting ? (
                <ActivityIndicator color={colors.bgPrimary} />
              ) : (
                <Text
                  style={{
                    color: colors.bgPrimary,
                    fontSize: 18,
                    fontWeight: "700",
                  }}
                >
                  Add to Humidor
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Humidor Selection Modal */}
        <Modal
          visible={showHumidorModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowHumidorModal(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setShowHumidorModal(false)}
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
                    Add to...
                  </Text>
                  <TouchableOpacity onPress={() => setShowHumidorModal(false)}>
                    <X size={24} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                <View style={{ paddingTop: 8 }}>
                  <TouchableOpacity
                    onPress={() => handleAddToHumidor("collection")}
                    style={{
                      paddingHorizontal: 20,
                      paddingVertical: 16,
                    }}
                  >
                    <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: "600" }}>
                      📦 My Collection
                    </Text>
                    <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 2 }}>
                      Cigars I currently own
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleAddToHumidor("wishlist")}
                    style={{
                      paddingHorizontal: 20,
                      paddingVertical: 16,
                    }}
                  >
                    <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: "600" }}>
                      ⭐ Wishlist
                    </Text>
                    <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 2 }}>
                      Cigars I want to try
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleAddToHumidor("smoked")}
                    style={{
                      paddingHorizontal: 20,
                      paddingVertical: 16,
                    }}
                  >
                    <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: "600" }}>
                      ✅ Already Smoked
                    </Text>
                    <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 2 }}>
                      Cigars I've already enjoyed
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      </View>
    );
  }

  // Main Screen - Camera/Gallery Selection
  return (
    <View style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      <StatusBar style="light" />
      
      <View style={{ flex: 1, paddingTop: insets.top }}>
        {/* Header */}
        <View
          style={{
            paddingHorizontal: 20,
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: colors.surface2,
          }}
        >
          <Text style={{ color: colors.textPrimary, fontSize: 24, fontWeight: "700" }}>
            Capture
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 4 }}>
            Take a photo and add to your collection
          </Text>
        </View>

        {/* Center Content */}
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 40 }}>
          <View
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: colors.surface,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 24,
            }}
          >
            <Camera size={48} color={colors.accentGold} />
          </View>

          <Text
            style={{
              color: colors.textPrimary,
              fontSize: 20,
              fontWeight: "600",
              textAlign: "center",
              marginBottom: 12,
            }}
          >
            Document Your Cigars
          </Text>

          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 16,
              textAlign: "center",
              lineHeight: 24,
              marginBottom: 32,
            }}
          >
            Take a photo or choose from your library to add cigars to your collection
          </Text>

          <TouchableOpacity
            onPress={() => setShowBottomSheet(true)}
            style={{
              backgroundColor: colors.accentGold,
              paddingHorizontal: 32,
              paddingVertical: 16,
              borderRadius: 12,
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
        </View>
      </View>

      {/* Bottom Sheet */}
      <Modal
        visible={showBottomSheet}
        transparent
        animationType="slide"
        onRequestClose={() => setShowBottomSheet(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowBottomSheet(false)}
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
                <TouchableOpacity onPress={() => setShowBottomSheet(false)}>
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
