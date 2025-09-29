import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { colors } from "@/constants/colors";

export default function SettingsItem({
  icon,
  title,
  subtitle,
  onPress,
  rightElement,
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
      }}
      disabled={!onPress && !rightElement}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: colors.surface2,
          justifyContent: "center",
          alignItems: "center",
          marginRight: 16,
        }}
      >
        {icon}
      </View>

      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: colors.textPrimary,
            fontSize: 16,
            fontWeight: "500",
            marginBottom: subtitle ? 2 : 0,
          }}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 14,
            }}
          >
            {subtitle}
          </Text>
        )}
      </View>

      {rightElement || (onPress && <ChevronRight size={20} color={colors.textTertiary} />)}
    </TouchableOpacity>
  );
}
