import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { colors } from "@/components/cigar/colors";

export function NotFoundState() {
  const router = useRouter();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.bgPrimary,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text
        style={{ color: colors.textPrimary, fontSize: 18, fontWeight: "600" }}
      >
        Cigar not found
      </Text>
      <TouchableOpacity
        onPress={() => router.back()}
        style={{ marginTop: 16 }}
      >
        <Text style={{ color: colors.accentGold, fontSize: 16 }}>
          Go Back
        </Text>
      </TouchableOpacity>
    </View>
  );
}
