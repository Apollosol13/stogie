import React from "react";
import { View, Text } from "react-native";
import { colors } from "@/constants/colors";

const PreferenceItem = ({ label, value, color, bgColor }) => (
  <View style={{ marginBottom: 16 }}>
    <Text
      style={{
        color: colors.textSecondary,
        fontSize: 14,
        marginBottom: 8,
      }}
    >
      {label}
    </Text>
    <View
      style={{
        backgroundColor: bgColor,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        alignSelf: "flex-start",
      }}
    >
      <Text
        style={{
          color: color,
          fontSize: 14,
          fontWeight: "600",
          textTransform: "capitalize",
        }}
      >
        {value}
      </Text>
    </View>
  </View>
);

export default function StatsTab({ profile }) {
  const hasPreferences =
    profile?.experience_level ||
    profile?.favorite_strength ||
    profile?.favorite_wrapper;

  return (
    <View style={{ padding: 20 }}>
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 16,
          padding: 20,
          marginBottom: 20,
        }}
      >
        <Text
          style={{
            color: colors.textPrimary,
            fontSize: 18,
            fontWeight: "600",
            marginBottom: 16,
          }}
        >
          Preferences
        </Text>

        {profile?.experience_level && (
          <PreferenceItem
            label="Experience Level"
            value={profile.experience_level}
            color={colors.accentBlue}
            bgColor={colors.accentBlue + "20"}
          />
        )}

        {profile?.favorite_strength && (
          <PreferenceItem
            label="Favorite Strength"
            value={profile.favorite_strength}
            color={colors.accentRed}
            bgColor={colors.accentRed + "20"}
          />
        )}

        {profile?.favorite_wrapper && (
          <PreferenceItem
            label="Favorite Wrapper"
            value={profile.favorite_wrapper}
            color={colors.accentGold}
            bgColor={colors.accentGold + "20"}
          />
        )}

        {!hasPreferences && (
          <Text
            style={{
              color: colors.textTertiary,
              fontSize: 14,
              textAlign: "center",
              fontStyle: "italic",
            }}
          >
            Complete your profile to see your preferences here
          </Text>
        )}
      </View>
    </View>
  );
}
