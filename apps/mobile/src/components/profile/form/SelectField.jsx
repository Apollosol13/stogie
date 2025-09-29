import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { colors } from "@/constants/colors";

export default function SelectField({ label, value, onValueChange, options }) {
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
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            onPress={() => onValueChange(option.value)}
            style={{
              backgroundColor:
                value === option.value ? colors.accentGold : colors.surface2,
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              marginRight: 8,
              marginBottom: 8,
            }}
          >
            <Text
              style={{
                color:
                  value === option.value
                    ? colors.bgPrimary
                    : colors.textSecondary,
                fontSize: 14,
                fontWeight: "600",
              }}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
