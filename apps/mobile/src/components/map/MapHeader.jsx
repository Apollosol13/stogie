import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Search, Target, Filter } from "lucide-react-native";
import { colors } from "@/components/map/colors";

const MapHeader = ({ onSearchPress, onCenterPress, onFilterPress }) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        position: "absolute",
        top: insets.top + 16,
        left: 20,
        right: 20,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Text
        style={{
          color: colors.textPrimary,
          fontSize: 28,
          fontFamily: 'LibreBodoni_700Bold',
          letterSpacing: -0.5,
          textShadowColor: "rgba(0, 0, 0, 0.8)",
          textShadowOffset: { width: 1, height: 1 },
          textShadowRadius: 3,
        }}
      >
        Discover
      </Text>

      <View style={{ flexDirection: "row", gap: 8 }}>
        <TouchableOpacity
          onPress={onSearchPress}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: colors.accentGold,
            justifyContent: "center",
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 4,
          }}
        >
          <Search size={22} color={colors.bgPrimary} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onCenterPress}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: colors.accentGold,
            justifyContent: "center",
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 4,
          }}
        >
          <Target size={22} color={colors.bgPrimary} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onFilterPress}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: colors.accentGold,
            justifyContent: "center",
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 4,
          }}
        >
          <Filter size={22} color={colors.bgPrimary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default MapHeader;
