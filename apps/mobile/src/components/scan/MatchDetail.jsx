import React from "react";
import {
  View,
  Text,
  Image,
  Dimensions,
  ScrollView,
} from "react-native";
import { colors, getStrengthColor } from "./colors";

const { width } = Dimensions.get("window");

const DetailRow = ({ label, value, valueColor }) => (
  <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
    <Text style={{ color: colors.textSecondary, fontSize: 14 }}>{label}</Text>
    <Text style={{ color: valueColor || colors.textPrimary, fontSize: 14, fontWeight: "600" }}>
      {value}
    </Text>
  </View>
);

const Section = ({ title, children }) => (
  <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
    <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: "600", marginBottom: 16 }}>
      {title}
    </Text>
    {children}
  </View>
);

export default function MatchDetail({ match }) {
  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: 120 }} // Space for bottom actions
      showsVerticalScrollIndicator={false}
    >
      <Image source={{ uri: match.image }} style={{ width: width, height: 200, marginBottom: 20 }} />

      {/* Main Info */}
      <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
        <Text style={{ color: colors.textPrimary, fontSize: 24, fontWeight: "700", marginBottom: 8 }}>
          {match.brand}
        </Text>
        {match.line && (
          <Text style={{ color: colors.accentGold, fontSize: 18, fontWeight: "600", marginBottom: 12 }}>
            {match.line}
          </Text>
        )}
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
          <View style={{ backgroundColor: getStrengthColor(match.strength) + "20", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginRight: 12 }}>
            <Text style={{ color: getStrengthColor(match.strength), fontSize: 14, fontWeight: "600" }}>
              {match.strength} STRENGTH
            </Text>
          </View>
          <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
            {match.confidence && `${Math.round(match.confidence * 100)}% match`}
          </Text>
        </View>
      </View>

      <Section title="Specifications">
        <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16 }}>
          <DetailRow label="Vitola" value={match.vitola} />
          <DetailRow label="Ring Gauge" value={match.ringGauge} />
          <DetailRow label="Length" value={`${match.length}"`} />
          <DetailRow label="Origin" value={match.origin} />
          <DetailRow label="Price Range" value={match.priceRange} valueColor={colors.accentGold} />
        </View>
      </Section>

      <Section title="Tobacco Composition">
        <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16 }}>
          <DetailRow label="Wrapper" value={match.wrapper} />
          <DetailRow label="Binder" value={match.binder} />
          <DetailRow label="Filler" value={match.filler} />
        </View>
      </Section>

      {match.flavorProfile && match.flavorProfile.length > 0 && (
        <Section title="Flavor Profile">
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {match.flavorProfile.map((flavor, index) => (
              <View key={index} style={{ backgroundColor: colors.accentGold + "20", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 }}>
                <Text style={{ color: colors.accentGold, fontSize: 12, fontWeight: "600", textTransform: "capitalize" }}>
                  {flavor}
                </Text>
              </View>
            ))}
          </View>
        </Section>
      )}

      {match.smokingExperience && (
        <Section title="Smoking Experience">
          <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16 }}>
            <Text style={{ color: colors.textSecondary, fontSize: 14, lineHeight: 20 }}>
              {match.smokingExperience}
            </Text>
            {match.smokingTime && (
              <View style={{ marginTop: 12, flexDirection: "row", alignItems: "center" }}>
                <Text style={{ color: colors.textTertiary, fontSize: 12 }}>Smoking Time:</Text>
                <Text style={{ color: colors.textPrimary, fontSize: 12, fontWeight: "600", marginLeft: 4 }}>
                  {match.smokingTime}
                </Text>
              </View>
            )}
          </View>
        </Section>
      )}

      {match.notes && (
        <Section title="Notes">
          <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16 }}>
            <Text style={{ color: colors.textSecondary, fontSize: 14, lineHeight: 20, fontStyle: "italic" }}>
              {match.notes}
            </Text>
          </View>
        </Section>
      )}
    </ScrollView>
  );
}
