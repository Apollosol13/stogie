import React from "react";
import { TextInput } from "react-native";
import { colors } from "@/components/cigar/colors";

export function FormInput(props) {
  return (
    <TextInput
      placeholderTextColor={colors.textTertiary}
      selectionColor="#FFFFFF" // White text selection/highlighting
      style={{
        backgroundColor: colors.surface,
        borderRadius: 8,
        padding: 12,
        color: "#FFFFFF", // Explicitly set to white for visibility
        fontSize: 16,
        ...props.style,
      }}
      {...props}
    />
  );
}
