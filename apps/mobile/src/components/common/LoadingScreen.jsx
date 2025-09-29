import React from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { colors } from "@/constants/colors";

export default function LoadingScreen({ text = "Loading..." }) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.bgPrimary,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <ActivityIndicator size="large" color={colors.accentGold} />
      <Text
        style={{
          color: colors.textSecondary,
          marginTop: 16,
          fontSize: 16,
        }}
      >
        {text}
      </Text>
    </View>
  );
}
