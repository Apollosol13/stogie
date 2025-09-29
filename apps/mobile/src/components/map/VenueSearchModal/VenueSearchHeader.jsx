import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { X } from "lucide-react-native";
import { colors } from "./constants";

export default function VenueSearchHeader({ onClose }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255, 255, 255, 0.1)",
      }}
    >
      <Text
        style={{
          color: colors.textPrimary,
          fontSize: 20,
          fontWeight: "700",
        }}
      >
        Find Cigar Venues
      </Text>
      <TouchableOpacity onPress={onClose}>
        <X size={24} color={colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );
}
