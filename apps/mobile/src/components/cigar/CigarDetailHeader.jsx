import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, Edit3 } from "lucide-react-native";
import { colors } from "@/components/cigar/colors";

export function CigarDetailHeader({ onWriteReview }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View
      style={{
        paddingTop: insets.top + 16,
        paddingHorizontal: 20,
        paddingBottom: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
      }}
    >
      <TouchableOpacity onPress={() => router.back()}>
        <ArrowLeft size={24} color={colors.textPrimary} />
      </TouchableOpacity>
      <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: "600" }}>
        Cigar Details
      </Text>
      <TouchableOpacity onPress={onWriteReview}>
        <Edit3 size={24} color={colors.accentGold} />
      </TouchableOpacity>
    </View>
  );
}
