import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X } from "lucide-react-native";
import { colors } from "@/components/cigar/colors";

export function ReviewModalHeader({
  isEdit,
  isSubmitting,
  onClose,
  onSubmit,
}) {
  const insets = useSafeAreaInsets();
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
      <TouchableOpacity onPress={onClose}>
        <X size={24} color={colors.textSecondary} />
      </TouchableOpacity>
      <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: "600" }}>
        {isEdit ? "Edit Review" : "Write Review"}
      </Text>
      <TouchableOpacity
        onPress={onSubmit}
        disabled={isSubmitting}
        style={{
          backgroundColor: colors.accentGold,
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 8,
          opacity: isSubmitting ? 0.7 : 1,
        }}
      >
        {isSubmitting ? (
          <ActivityIndicator size="small" color={colors.bgPrimary} />
        ) : (
          <Text style={{ color: colors.bgPrimary, fontSize: 14, fontWeight: "600" }}>
            {isEdit ? "Update" : "Submit"}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
