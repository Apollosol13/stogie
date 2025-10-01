import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity, Dimensions, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CameraView, CameraType } from "expo-camera";
import {
  Camera,
  Zap,
  ZapOff,
  Image as ImageIcon,
  X,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { colors } from "./colors";

const { height } = Dimensions.get("window");

export default function CameraMode({ identifyCigar, pickImageFromGallery }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const cameraRef = useRef(null);
  const [facing, setFacing] = useState("back");
  const [flashEnabled, setFlashEnabled] = useState(false);

  const takePicture = async () => {
    if (!cameraRef.current) {
      Alert.alert("Camera Error", "Camera is not ready. Please try again.");
      return;
    }

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7, // Higher quality for iOS - better for cigar band details
        base64: true, // Get base64 data directly
        exif: false, // Remove EXIF data to reduce size
      });

      if (photo && photo.uri) {
        // Convert to base64 format if base64 data is available
        const imageData = photo.base64
          ? `data:image/jpeg;base64,${photo.base64}`
          : photo.uri;
        identifyCigar(imageData);
      } else {
        throw new Error("Failed to capture image");
      }
    } catch (error) {
      console.error("Error taking picture:", error);
      Alert.alert("Error", "Failed to take picture. Please try again.");
    }
  };

  const toggleFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const toggleFlash = () => {
    setFlashEnabled(!flashEnabled);
  };

  return (
    <View style={{ flex: 1 }}>
      <CameraView
        ref={cameraRef}
        style={{ flex: 1 }}
        facing={facing}
        flash={flashEnabled ? "on" : "off"}
      >
        {/* Crop Guide Overlay */}
        <View
          style={{
            position: "absolute",
            top: height * 0.3,
            left: 40,
            right: 40,
            height: 120,
            borderWidth: 3,
            borderColor: colors.accentGold,
            borderRadius: 12,
            backgroundColor: "transparent",
          }}
        >
          {/* Corner indicators */}
          <View
            style={{
              position: "absolute",
              top: -3,
              left: -3,
              width: 20,
              height: 20,
              borderTopWidth: 3,
              borderLeftWidth: 3,
              borderColor: colors.accentGold,
            }}
          />
          <View
            style={{
              position: "absolute",
              top: -3,
              right: -3,
              width: 20,
              height: 20,
              borderTopWidth: 3,
              borderRightWidth: 3,
              borderColor: colors.accentGold,
            }}
          />
          <View
            style={{
              position: "absolute",
              bottom: -3,
              left: -3,
              width: 20,
              height: 20,
              borderBottomWidth: 3,
              borderLeftWidth: 3,
              borderColor: colors.accentGold,
            }}
          />
          <View
            style={{
              position: "absolute",
              bottom: -3,
              right: -3,
              width: 20,
              height: 20,
              borderBottomWidth: 3,
              borderRightWidth: 3,
              borderColor: colors.accentGold,
            }}
          />
        </View>

        {/* Instructions */}
        <View
          style={{
            position: "absolute",
            top: height * 0.2,
            left: 40,
            right: 40,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: 18,
              fontWeight: "600",
              textAlign: "center",
              marginBottom: 8,
            }}
          >
            Position the cigar band
          </Text>
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 14,
              textAlign: "center",
            }}
          >
            Align the band within the frame for best results
          </Text>
        </View>

        {/* Top Controls */}
        <View
          style={{
            position: "absolute",
            top: insets.top + 16,
            left: 20,
            right: 20,
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: colors.overlay,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <X size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={toggleFlash}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: colors.overlay,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {flashEnabled ? (
              <Zap size={24} color={colors.accentGold} />
            ) : (
              <ZapOff size={24} color={colors.textPrimary} />
            )}
          </TouchableOpacity>
        </View>

        {/* Bottom Controls */}
        <View
          style={{
            position: "absolute",
            bottom: insets.bottom + 40,
            left: 0,
            right: 0,
            flexDirection: "row",
            justifyContent: "space-around",
            alignItems: "center",
            paddingHorizontal: 40,
          }}
        >
          <TouchableOpacity
            onPress={pickImageFromGallery}
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: colors.overlay,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ImageIcon size={28} color={colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={takePicture}
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: colors.accentGold,
              justifyContent: "center",
              alignItems: "center",
              shadowColor: colors.accentGold,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.4,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <Camera size={36} color={colors.bgPrimary} strokeWidth={2.5} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={toggleFacing}
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: colors.overlay,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: 12,
                fontWeight: "600",
              }}
            >
              FLIP
            </Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}
