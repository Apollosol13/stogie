import React from "react";
import { TextInput, Platform } from "react-native";
import { colors } from "@/components/cigar/colors";

export function FormInput(props) {
  const baseStyle = {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#FFFFFF", // White text
  };

  const combinedStyle = [baseStyle, props.style, { color: "#FFFFFF" }]; // Ensure color is always white

  return (
    <TextInput
      {...props}
      placeholderTextColor={colors.textTertiary}
      selectionColor={colors.accentGold}
      underlineColorAndroid="transparent"
      style={combinedStyle}
    />
  );
}
