import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Navigation, Plus, Check } from "lucide-react-native";
import { colors } from "./constants";
import { renderStars, calculateDistance } from "./utils";

export default function VenueCard({
  venue,
  isSelected,
  onPress,
  userLocation,
}) {
  const distance = calculateDistance(venue, userLocation);

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        marginHorizontal: 20,
        marginBottom: 12,
        backgroundColor: isSelected ? colors.accentGold + "20" : colors.surface2,
        borderRadius: 16,
        padding: 16,
        borderWidth: isSelected ? 2 : 0,
        borderColor: isSelected ? colors.accentGold : "transparent",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: 16,
              fontWeight: "600",
              marginBottom: 4,
            }}
            numberOfLines={1}
          >
            {venue.name}
          </Text>

          {venue.rating > 0 && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 4,
              }}
            >
              <View style={{ flexDirection: "row", marginRight: 8 }}>
                {renderStars(Math.floor(venue.rating))}
              </View>
              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                {venue.rating} ({venue.reviews} reviews)
              </Text>
            </View>
          )}

          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 14,
              marginBottom: 8,
            }}
            numberOfLines={2}
          >
            {venue.address}
          </Text>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            {venue.hasLounge && (
              <View
                style={{
                  backgroundColor: colors.accentGold + "40",
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 8,
                  marginRight: 6,
                  marginBottom: 4,
                }}
              >
                <Text
                  style={{
                    color: colors.textPrimary,
                    fontSize: 10,
                    fontWeight: "600",
                  }}
                >
                  LOUNGE
                </Text>
              </View>
            )}

            {distance && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginRight: 6,
                }}
              >
                <Navigation size={12} color={colors.textTertiary} />
                <Text
                  style={{
                    color: colors.textTertiary,
                    fontSize: 12,
                    marginLeft: 4,
                  }}
                >
                  {distance}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: isSelected ? colors.accentGold : colors.surface,
            justifyContent: "center",
            alignItems: "center",
            marginLeft: 12,
          }}
        >
          {isSelected ? (
            <Check size={18} color={colors.bgPrimary} />
          ) : (
            <Plus size={18} color={colors.textSecondary} />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}
