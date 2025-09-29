import React from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { colors } from "@/components/cigar/colors";

export default function LoadingState() {
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
        style={{ color: colors.textSecondary, fontSize: 16, marginTop: 16 }}
      >
        Loading cigar details...
      </Text>
    </View>
  );
}
