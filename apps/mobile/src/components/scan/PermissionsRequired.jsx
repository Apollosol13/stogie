import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Camera } from "lucide-react-native";
import { colors } from "./colors";

export default function PermissionsRequired({ requestPermission }) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.bgPrimary,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      <StatusBar style="light" />
      <Camera size={64} color={colors.accentGold} />
      <Text
        style={{
          color: colors.textPrimary,
          fontSize: 20,
          fontWeight: "600",
          marginTop: 20,
          marginBottom: 8,
          textAlign: "center",
        }}
      >
        Camera Permission Required
      </Text>
      <Text
        style={{
          color: colors.textSecondary,
          fontSize: 16,
          textAlign: "center",
          marginBottom: 30,
        }}
      >
        We need access to your camera to identify cigars
      </Text>
      <TouchableOpacity
        onPress={requestPermission}
        style={{
          backgroundColor: colors.accentGold,
          paddingHorizontal: 32,
          paddingVertical: 16,
          borderRadius: 12,
        }}
      >
        <Text
          style={{
            color: colors.bgPrimary,
            fontSize: 16,
            fontWeight: "600",
          }}
        >
          Grant Permission
        </Text>
      </TouchableOpacity>
    </View>
  );
}
