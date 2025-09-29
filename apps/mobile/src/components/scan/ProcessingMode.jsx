import React from "react";
import { View, Text, Image, Dimensions, Animated } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Camera } from "lucide-react-native";
import { colors } from "./colors";

const { width } = Dimensions.get("window");

export default function ProcessingMode({ capturedImage, processingProgress }) {
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

      {capturedImage && (
        <Image
          source={{ uri: capturedImage }}
          style={{
            width: width - 80,
            height: 200,
            borderRadius: 16,
            marginBottom: 40,
          }}
        />
      )}

      <View
        style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: colors.surface,
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <Camera size={36} color={colors.accentGold} />
      </View>

      <Text
        style={{
          color: colors.textPrimary,
          fontSize: 20,
          fontWeight: "600",
          marginBottom: 8,
        }}
      >
        Analyzing...
      </Text>

      <Text
        style={{
          color: colors.textSecondary,
          fontSize: 14,
          marginBottom: 32,
          textAlign: "center",
        }}
      >
        Identifying your cigar
      </Text>

      <View
        style={{
          width: width - 80,
          height: 4,
          backgroundColor: colors.surface,
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <Animated.View
          style={{
            height: "100%",
            backgroundColor: colors.accentGold,
            width: processingProgress.interpolate({
              inputRange: [0, 1],
              outputRange: ["0%", "100%"],
            }),
          }}
        />
      </View>
    </View>
  );
}
