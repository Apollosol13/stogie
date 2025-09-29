import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import {
  Settings,
  Edit3,
  Calendar,
  MapPin,
  Camera,
} from "lucide-react-native";
import { colors } from "@/constants/colors";

export default function ProfileHeader({
  profile,
  user,
  onEdit,
  onSelectImage,
}) {
  return (
    <View
      style={{
        paddingHorizontal: 20,
        paddingBottom: 24,
        alignItems: "center",
      }}
    >
      <View
        style={{
          alignSelf: "flex-end",
          marginBottom: 20,
        }}
      >
        <TouchableOpacity
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: colors.surface,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Settings size={22} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={{ position: "relative", marginBottom: 16 }}>
        <Image
          source={{
            uri:
              profile?.profile_image_url ||
              user?.image ||
              "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
          }}
          style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            borderWidth: 3,
            borderColor: colors.accentGold,
          }}
        />
        <TouchableOpacity
          onPress={onSelectImage}
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: colors.accentGold,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Camera size={16} color={colors.bgPrimary} />
        </TouchableOpacity>
      </View>

      <Text
        style={{
          color: colors.textPrimary,
          fontSize: 24,
          fontWeight: "700",
          marginBottom: 4,
        }}
      >
        {profile?.display_name || user?.name || "Welcome!"}
      </Text>

      <Text
        style={{
          color: colors.textSecondary,
          fontSize: 16,
          marginBottom: 8,
        }}
      >
        {profile?.username ? `@${profile.username}` : user?.email}
      </Text>

      <Text
        style={{
          color: colors.textSecondary,
          fontSize: 14,
          textAlign: "center",
          marginBottom: 12,
          lineHeight: 20,
        }}
      >
        {profile?.bio ||
          "Complete your profile to share your cigar journey with others."}
      </Text>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        {profile?.location && (
          <>
            <MapPin size={14} color={colors.textTertiary} />
            <Text
              style={{
                color: colors.textTertiary,
                fontSize: 13,
                marginLeft: 4,
                marginRight: 16,
              }}
            >
              {profile.location}
            </Text>
          </>
        )}
        <Calendar size={14} color={colors.textTertiary} />
        <Text
          style={{
            color: colors.textTertiary,
            fontSize: 13,
            marginLeft: 4,
          }}
        >
          Joined{" "}
          {profile?.join_date
            ? new Date(profile.join_date).toLocaleDateString()
            : "recently"}
        </Text>
      </View>

      <TouchableOpacity
        onPress={onEdit}
        style={{
          backgroundColor: colors.accentGold,
          paddingHorizontal: 32,
          paddingVertical: 12,
          borderRadius: 24,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Edit3 size={16} color={colors.bgPrimary} />
        <Text
          style={{
            color: colors.bgPrimary,
            fontSize: 16,
            fontWeight: "600",
            marginLeft: 8,
          }}
        >
          Edit Profile
        </Text>
      </TouchableOpacity>
    </View>
  );
}
