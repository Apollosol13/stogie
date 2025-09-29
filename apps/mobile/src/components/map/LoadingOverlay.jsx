import React from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { colors } from "@/components/map/colors";

const LoadingOverlay = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.3)",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 10,
      }}
    >
      <ActivityIndicator size="large" color={colors.accentGold} />
      <Text style={{ color: colors.textPrimary, marginTop: 12 }}>
        Loading map data...
      </Text>
    </View>
  );
};

export default LoadingOverlay;
