import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { colors } from "@/constants/colors";
import { useAuthModal } from "@/utils/auth/store";

export default function AuthPrompt() {
  const { open } = useAuthModal();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.bgPrimary,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 40,
      }}
    >
      <Text
        style={{
          color: colors.textPrimary,
          fontSize: 24,
          fontWeight: "700",
          textAlign: "center",
          marginBottom: 16,
        }}
      >
        Sign In Required
      </Text>
      <Text
        style={{
          color: colors.textSecondary,
          fontSize: 16,
          textAlign: "center",
          marginBottom: 32,
          lineHeight: 24,
        }}
      >
        Create an account to track your cigars, save reviews, and connect with
        other enthusiasts.
      </Text>
      <TouchableOpacity
        onPress={() => open({ mode: 'signin' })}
        style={{
          backgroundColor: colors.accentGold,
          paddingHorizontal: 32,
          paddingVertical: 16,
          borderRadius: 24,
        }}
      >
        <Text
          style={{
            color: colors.bgPrimary,
            fontSize: 18,
            fontWeight: "600",
          }}
        >
          Sign In
        </Text>
      </TouchableOpacity>
    </View>
  );
}
