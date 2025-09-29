import React from "react";
import { View, Text, TextInput } from "react-native";
import { colors } from "@/constants/colors";

export default function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
}) {
  return (
    <View style={{ marginBottom: 20 }}>
      <Text
        style={{
          color: colors.textSecondary,
          fontSize: 14,
          fontWeight: "600",
          marginBottom: 8,
        }}
      >
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        style={{
          backgroundColor: colors.surface2,
          borderRadius: 12,
          paddingHorizontal: 16,
          paddingVertical: multiline ? 16 : 12,
          color: colors.textPrimary,
          fontSize: 16,
          minHeight: multiline ? 80 : 44,
          textAlignVertical: multiline ? "top" : "center",
        }}
      />
    </View>
  );
}
