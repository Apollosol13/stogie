import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronUp, Cigarette, MapPin } from "lucide-react-native";
import { colors } from "@/components/map/colors";

const RecentActivityCard = ({ recentActivity }) => {
  const insets = useSafeAreaInsets();

  if (!recentActivity || recentActivity.length === 0) {
    return null;
  }
  const displayActivity = recentActivity.slice(0, 2);

  return (
    <View
      style={{
        position: "absolute",
        bottom: insets.bottom + 20,
        left: 20,
        right: 20,
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <Text
          style={{
            color: colors.textPrimary,
            fontSize: 16,
            fontWeight: "600",
          }}
        >
          Recent Activity
        </Text>
        <TouchableOpacity>
          <ChevronUp size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {displayActivity.map((session, index) => (
        <View
          key={session.id}
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: index < displayActivity.length - 1 ? 12 : 0,
          }}
        >
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: colors.accentGreen,
              justifyContent: "center",
              alignItems: "center",
              marginRight: 12,
            }}
          >
            <Cigarette size={16} color={colors.bgPrimary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: 14,
                fontWeight: "600",
                marginBottom: 2,
              }}
              numberOfLines={1}
            >
              {`${session.userName} smoked ${session.cigar?.brand || "Unknown"} ${
                session.cigar?.line || ""
              }`}
            </Text>
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 12,
              }}
            >
              {`${session.location || "Unknown location"} • ${new Date(
                session.createdAt,
              ).toLocaleDateString()}`}
            </Text>
          </View>
          <MapPin size={16} color={colors.accentGold} />
        </View>
      ))}
    </View>
  );
};

export default RecentActivityCard;
