import React from "react";
import { View, Text } from "react-native";
import { colors } from "../../constants/colors";

export default function StatCard({
  icon,
  value,
  label,
  color = colors.accentGold,
}) {
  return (
    <View
      style={{
        backgroundColor: colors.surface2,
        borderRadius: 12,
        padding: 16,
        alignItems: "center",
        flex: 1,
        marginHorizontal: 4,
      }}
    >
      {icon}
      <Text
        style={{
          color,
          fontSize: 20,
          fontWeight: "700",
          marginTop: 8,
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          color: colors.textSecondary,
          fontSize: 10,
          fontWeight: "600",
          textAlign: "center",
          marginTop: 4,
          letterSpacing: 0.5,
        }}
        numberOfLines={1}
        adjustsFontSizeToFit={true}
        minimumFontScale={0.7}
      >
        {label}
      </Text>
    </View>
  );
}
