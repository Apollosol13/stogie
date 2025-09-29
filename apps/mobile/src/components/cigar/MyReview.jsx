import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { colors } from "@/components/cigar/colors";
import StarRating from "@/components/common/StarRating";

export function MyReview({ userReview, onWriteReview }) {
  return (
    <View
      style={{
        backgroundColor: colors.surface,
        margin: 16,
        marginTop: 0,
        borderRadius: 16,
        padding: 20,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <Text
          style={{ color: colors.textPrimary, fontSize: 18, fontWeight: "600" }}
        >
          My Review
        </Text>
        <TouchableOpacity
          onPress={onWriteReview}
          style={{
            backgroundColor: colors.accentGold,
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 8,
          }}
        >
          <Text
            style={{ color: colors.bgPrimary, fontSize: 14, fontWeight: "600" }}
          >
            {userReview ? "Edit" : "Add"} Review
          </Text>
        </TouchableOpacity>
      </View>
      {userReview ? (
        <View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <StarRating
              rating={userReview.rating}
              size={12}
              color={colors.accentGold}
              inactiveColor={colors.textTertiary}
            />
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 14,
                marginLeft: 8,
              }}
            >
              {new Date(userReview.created_at).toLocaleDateString()}
            </Text>
          </View>
          {userReview.title && (
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: 16,
                fontWeight: "600",
                marginBottom: 8,
              }}
            >
              {userReview.title}
            </Text>
          )}
          {userReview.review_text && (
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 14,
                lineHeight: 20,
              }}
            >
              {userReview.review_text}
            </Text>
          )}
        </View>
      ) : (
        <Text
          style={{
            color: colors.textTertiary,
            fontSize: 14,
            fontStyle: "italic",
          }}
        >
          You haven't reviewed this cigar yet. Tap "Add Review" to share your
          thoughts!
        </Text>
      )}
    </View>
  );
}
