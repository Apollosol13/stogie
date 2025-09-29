import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Target, Globe } from "lucide-react-native";
import { colors } from "./constants";

export default function SearchModeToggle({
  searchMode,
  setSearchMode,
  setHasSearched,
  setSearchResults,
  userLocation,
}) {
  const handleModeChange = (mode) => {
    setSearchMode(mode);
    setHasSearched(false);
    setSearchResults([]);
  };

  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: colors.surface2,
        borderRadius: 12,
        padding: 4,
        marginBottom: 16,
      }}
    >
      <TouchableOpacity
        onPress={() => handleModeChange("nearby")}
        disabled={!userLocation}
        style={{
          flex: 1,
          paddingVertical: 8,
          borderRadius: 8,
          backgroundColor:
            searchMode === "nearby" ? colors.accentGold : "transparent",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          opacity: !userLocation ? 0.5 : 1,
        }}
      >
        <Target
          size={16}
          color={
            searchMode === "nearby" ? colors.bgPrimary : colors.textSecondary
          }
        />
        <Text
          style={{
            color:
              searchMode === "nearby"
                ? colors.bgPrimary
                : colors.textSecondary,
            fontSize: 14,
            fontWeight: "600",
            marginLeft: 6,
          }}
        >
          Nearby
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => handleModeChange("city")}
        style={{
          flex: 1,
          paddingVertical: 8,
          borderRadius: 8,
          backgroundColor:
            searchMode === "city" ? colors.accentGold : "transparent",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Globe
          size={16}
          color={
            searchMode === "city" ? colors.bgPrimary : colors.textSecondary
          }
        />
        <Text
          style={{
            color:
              searchMode === "city"
                ? colors.bgPrimary
                : colors.textSecondary,
            fontSize: 14,
            fontWeight: "600",
            marginLeft: 6,
          }}
        >
          By City
        </Text>
      </TouchableOpacity>
    </View>
  );
}
