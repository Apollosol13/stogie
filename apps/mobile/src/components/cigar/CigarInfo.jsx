import React from "react";
import { View, Text, Image } from "react-native";
import { colors } from "@/components/cigar/colors";
import StarRating from "@/components/common/StarRating";
import { Search } from "lucide-react-native";

const getStrengthColor = (strength) => {
  switch (strength?.toUpperCase()) {
    case "MILD":
      return colors.strengthMild;
    case "MEDIUM":
      return colors.strengthMedium;
    case "FULL":
      return colors.strengthFull;
    default:
      return colors.textSecondary;
  }
};

const InfoRow = ({ label, value }) => {
  if (!value) return null;
  return (
    <Text
      style={{ color: colors.textSecondary, fontSize: 14, marginBottom: 4 }}
    >
      {label}: {value}
    </Text>
  );
};

const InfoSection = ({ title, children, icon = null }) => (
  <View
    style={{
      borderTopWidth: 1,
      borderTopColor: colors.divider,
      paddingTop: 16,
      marginTop: 16,
    }}
  >
    <View
      style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}
    >
      {icon}
      <Text
        style={{
          color: colors.textPrimary,
          fontSize: 16,
          fontWeight: "600",
          marginLeft: icon ? 8 : 0,
        }}
      >
        {title}
      </Text>
    </View>
    {children}
  </View>
);

export function CigarInfo({ cigar }) {
  const strengthColor = getStrengthColor(cigar.strength);

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        margin: 16,
        borderRadius: 16,
        padding: 20,
      }}
    >
      <Image
        source={{
          uri:
            cigar.image_url ||
            "https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?w=400&h=300&fit=crop",
        }}
        style={{
          width: "100%",
          height: 200,
          borderRadius: 12,
          marginBottom: 16,
        }}
      />
      <Text
        style={{
          color: colors.textPrimary,
          fontSize: 24,
          fontWeight: "700",
          marginBottom: 8,
        }}
      >
        {cigar.brand} {cigar.line}
      </Text>
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}
      >
        <Text
          style={{ color: colors.textSecondary, fontSize: 18, marginRight: 16 }}
        >
          {cigar.vitola}
        </Text>
        <View
          style={{
            backgroundColor: strengthColor + "20",
            paddingHorizontal: 12,
            paddingVertical: 4,
            borderRadius: 8,
          }}
        >
          <Text
            style={{ color: strengthColor, fontSize: 14, fontWeight: "600" }}
          >
            {cigar.strength?.toUpperCase()}
          </Text>
        </View>
      </View>

      {cigar.average_rating > 0 && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <StarRating
            rating={Math.round(cigar.average_rating)}
            size={16}
            color={colors.accentGold}
            inactiveColor={colors.textTertiary}
          />
          <Text
            style={{ color: colors.textSecondary, fontSize: 16, marginLeft: 8 }}
          >
            {cigar.average_rating.toFixed(1)} ({cigar.total_reviews} reviews)
          </Text>
        </View>
      )}

      <InfoSection title="Specifications">
        <InfoRow
          label="Length"
          value={cigar.length_inches ? `${cigar.length_inches}"` : null}
        />
        <InfoRow label="Ring Gauge" value={cigar.ring_gauge} />
        <InfoRow label="Wrapper" value={cigar.wrapper} />
        <InfoRow label="Binder" value={cigar.binder} />
        <InfoRow label="Filler" value={cigar.filler} />
        <InfoRow label="Origin" value={cigar.origin_country} />
      </InfoSection>

      {/* Expert Analysis Section - only show if this cigar has analysis data */}
      {(cigar.isAiIdentified ||
        cigar.is_ai_identified ||
        cigar.smokingExperience ||
        cigar.smoking_experience ||
        cigar.analysisNotes ||
        cigar.analysis_notes) && (
        <InfoSection
          title="Expert Analysis"
          icon={<Search size={18} color={colors.accentGold} />}
        >
          {(cigar.aiConfidence || cigar.ai_confidence) && (
            <Text
              style={{
                color: colors.accentGold,
                fontSize: 12,
                marginBottom: 8,
                fontStyle: "italic",
              }}
            >
              Confidence Rating:{" "}
              {Math.round((cigar.aiConfidence || cigar.ai_confidence) * 100)}%
            </Text>
          )}
          <InfoRow
            label="Smoking Time"
            value={
              cigar.smokingTime ||
              (cigar.smoking_time_minutes &&
                `${cigar.smoking_time_minutes} minutes`)
            }
          />
          {(cigar.smokingExperience || cigar.smoking_experience) && (
            <View style={{ marginBottom: 8 }}>
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: 14,
                  fontWeight: "600",
                  marginBottom: 4,
                }}
              >
                Smoking Experience:
              </Text>
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: 14,
                  lineHeight: 20,
                }}
              >
                {cigar.smokingExperience || cigar.smoking_experience}
              </Text>
            </View>
          )}
          {(cigar.analysisNotes || cigar.analysis_notes) && (
            <View style={{ marginBottom: 8 }}>
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: 14,
                  fontWeight: "600",
                  marginBottom: 4,
                }}
              >
                Expert Notes:
              </Text>
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: 14,
                  lineHeight: 20,
                }}
              >
                {cigar.analysisNotes || cigar.analysis_notes}
              </Text>
            </View>
          )}
          {(cigar.isAiIdentified || cigar.is_ai_identified) && (
            <Text
              style={{
                color: colors.accentGold,
                fontSize: 12,
                fontStyle: "italic",
                marginTop: 8,
              }}
            >
              ✨ Automatically identified from image
            </Text>
          )}
        </InfoSection>
      )}

      {/* Description section */}
      {cigar.description && (
        <InfoSection title="Description">
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 14,
              lineHeight: 20,
            }}
          >
            {cigar.description}
          </Text>
        </InfoSection>
      )}
    </View>
  );
}
