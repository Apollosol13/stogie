import React from "react";
import { View, TouchableOpacity, Text, ActivityIndicator } from "react-native";
import { Plus } from "lucide-react-native";
import { colors } from "./constants";

export default function VenueSearchFooter({
  selectedVenuesCount,
  onSave,
  saving,
}) {
  if (selectedVenuesCount === 0) {
    return null;
  }

  return (
    <View
      style={{
        padding: 20,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: "rgba(255, 255, 255, 0.1)",
      }}
    >
      <TouchableOpacity
        onPress={onSave}
        disabled={saving}
        style={{
          backgroundColor: colors.accentGold,
          paddingVertical: 16,
          borderRadius: 12,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {saving ? (
          <ActivityIndicator size="small" color={colors.bgPrimary} />
        ) : (
          <>
            <Plus size={20} color={colors.bgPrimary} />
            <Text
              style={{
                color: colors.bgPrimary,
                fontSize: 16,
                fontWeight: "600",
                marginLeft: 8,
              }}
            >
              Add {selectedVenuesCount} Venue
              {selectedVenuesCount > 1 ? "s" : ""} to Map
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}
