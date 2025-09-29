import React from "react";
import { View, Text } from "react-native";
import { colors } from "@/components/cigar/colors";
import StarRating from "@/components/common/StarRating";
import { FormSection } from "./FormSection";
import { FormInput } from "./FormInput";
import { FlavorNotesSelector } from "./FlavorNotesSelector";
import { RecommendationSelector } from "./RecommendationSelector";

const DetailedRatingRow = ({ label, rating, onRate }) => (
  <View
    style={{
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 16,
    }}
  >
    <Text style={{ color: colors.textSecondary, fontSize: 16 }}>{label}</Text>
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <StarRating
        rating={rating}
        onPress={onRate}
        size={12}
        color={colors.accentGold}
        inactiveColor={colors.textTertiary}
      />
    </View>
  </View>
);

export function ReviewForm({ form, onFormChange, onToggleFlavorNote }) {
  const handleInputChange = (field, value) => {
    onFormChange((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <View>
      <FormSection title="Overall Rating" isRequired>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <StarRating
            rating={form.rating}
            onPress={(rating) => handleInputChange("rating", rating)}
            size={32}
            color={colors.accentGold}
            inactiveColor={colors.textTertiary}
          />
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 16,
              marginLeft: 12,
            }}
          >
            {form.rating}/5
          </Text>
        </View>
      </FormSection>

      <FormSection title="Review Title">
        <FormInput
          value={form.title}
          onChangeText={(text) => handleInputChange("title", text)}
          placeholder="e.g. 'Excellent morning smoke'"
        />
      </FormSection>

      <FormSection title="Your Review">
        <FormInput
          value={form.reviewText}
          onChangeText={(text) => handleInputChange("reviewText", text)}
          placeholder="Share your thoughts about this cigar..."
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          style={{ minHeight: 100 }}
        />
      </FormSection>

      <FlavorNotesSelector
        selectedNotes={form.flavorNotes}
        onToggle={onToggleFlavorNote}
      />

      <FormSection title="Detailed Ratings">
        <DetailedRatingRow
          label="Construction"
          rating={form.constructionRating}
          onRate={(r) => handleInputChange("constructionRating", r)}
        />
        <DetailedRatingRow
          label="Draw"
          rating={form.drawRating}
          onRate={(r) => handleInputChange("drawRating", r)}
        />
        <DetailedRatingRow
          label="Burn"
          rating={form.burnRating}
          onRate={(r) => handleInputChange("burnRating", r)}
        />
        <DetailedRatingRow
          label="Flavor"
          rating={form.flavorRating}
          onRate={(r) => handleInputChange("flavorRating", r)}
        />
      </FormSection>

      <FormSection title="Additional Details">
        <FormInput
          value={form.smokeDate}
          onChangeText={(text) => handleInputChange("smokeDate", text)}
          placeholder="Smoke date (YYYY-MM-DD)"
          style={{ marginBottom: 12 }}
        />
        <FormInput
          value={form.pairing}
          onChangeText={(text) => handleInputChange("pairing", text)}
          placeholder="What did you pair this with?"
          style={{ marginBottom: 12 }}
        />
        <FormInput
          value={form.smokeDuration}
          onChangeText={(text) => handleInputChange("smokeDuration", text)}
          placeholder="Smoking time (minutes)"
          keyboardType="numeric"
          style={{ marginBottom: 12 }}
        />
        <FormInput
          value={form.environment}
          onChangeText={(text) => handleInputChange("environment", text)}
          placeholder="Where did you smoke this?"
        />
      </FormSection>

      <FormSection title="Recommendations">
        <RecommendationSelector
          question="Would you smoke this again?"
          value={form.wouldSmokeAgain}
          onSelect={(val) => handleInputChange("wouldSmokeAgain", val)}
        />
        <RecommendationSelector
          question="Would you recommend this to others?"
          value={form.wouldRecommend}
          onSelect={(val) => handleInputChange("wouldRecommend", val)}
        />
      </FormSection>
    </View>
  );
}
