import React from "react";
import { View, Text } from "react-native";
import { Calendar } from "lucide-react-native";
import { colors } from "@/constants/colors";

export default function ActivityTab() {
  return (
    <View style={{ padding: 20 }}>
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 16,
          padding: 20,
          alignItems: "center",
        }}
      >
        <Calendar size={48} color={colors.textTertiary} />
        <Text
          style={{
            color: colors.textSecondary,
            fontSize: 16,
            marginTop: 16,
            textAlign: "center",
          }}
        >
          No recent activity yet
        </Text>
        <Text
          style={{
            color: colors.textTertiary,
            fontSize: 14,
            marginTop: 8,
            textAlign: "center",
          }}
        >
          Start by adding cigars to your humidor or logging a smoking session
        </Text>
      </View>
    </View>
  );
}
