import React from "react";
import { View, Text } from "react-native";
import useUser from "@/utils/auth/useUser";
import { colors } from "@/components/cigar/colors";
import StarRating from "@/components/common/StarRating";

const ReviewItem = ({ review }) => (
  <View
    style={{
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
      paddingBottom: 16,
      marginBottom: 16,
    }}
  >
    <View
      style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}
    >
      <Text
        style={{
          color: colors.textPrimary,
          fontSize: 16,
          fontWeight: "600",
          marginRight: 12,
        }}
      >
        {review.display_name || review.user_name || "Anonymous"}
      </Text>
      <StarRating
        rating={review.rating}
        size={12}
        color={colors.accentGold}
        inactiveColor={colors.textTertiary}
      />
    </View>
    {review.title && (
      <Text
        style={{
          color: colors.textPrimary,
          fontSize: 16,
          fontWeight: "600",
          marginBottom: 8,
        }}
      >
        {review.title}
      </Text>
    )}
    {review.review_text && (
      <Text
        style={{
          color: colors.textSecondary,
          fontSize: 14,
          lineHeight: 20,
          marginBottom: 8,
        }}
      >
        {review.review_text}
      </Text>
    )}
    <Text style={{ color: colors.textTertiary, fontSize: 12 }}>
      {new Date(review.created_at).toLocaleDateString()}
      {review.pairing && ` • Paired with ${review.pairing}`}
    </Text>
  </View>
);

export function CommunityReviewsList({ reviews }) {
  const { data: user } = useUser();
  const communityReviews = reviews.filter((r) => r.user_id !== user?.id);

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
      <Text
        style={{
          color: colors.textPrimary,
          fontSize: 18,
          fontWeight: "600",
          marginBottom: 16,
        }}
      >
        Community Reviews ({communityReviews.length})
      </Text>
      {communityReviews.length > 0 ? (
        communityReviews.map((review) => (
          <ReviewItem key={review.id} review={review} />
        ))
      ) : (
        <Text
          style={{
            color: colors.textTertiary,
            fontSize: 14,
            fontStyle: "italic",
            textAlign: "center",
          }}
        >
          No community reviews yet. Be the first to review this cigar!
        </Text>
      )}
    </View>
  );
}
