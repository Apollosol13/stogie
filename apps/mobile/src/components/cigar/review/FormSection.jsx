import React from "react";
import { View, Text } from "react-native";
import { colors } from "@/components/cigar/colors";

export function FormSection({ title, children, isRequired }) {
  return (
    <View style={{ marginBottom: 24 }}>
      <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: "600", marginBottom: 12 }}>
        {title}
        {isRequired && " *"}
      </Text>
      {children}
    </View>
  );
}
