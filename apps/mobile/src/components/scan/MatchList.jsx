import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
} from "react-native";
import { ArrowRight } from "lucide-react-native";
import { colors, getStrengthColor } from "./colors";

const { width } = Dimensions.get("window");

export default function MatchList({ matches, capturedImage, onSelectMatch }) {
  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: 120 }} // Space for bottom actions
      showsVerticalScrollIndicator={false}
    >
      {capturedImage && (
        <Image
          source={{ uri: capturedImage }}
          style={{
            width: width - 40,
            height: 120,
            borderRadius: 12,
            marginHorizontal: 20,
            marginBottom: 20,
          }}
        />
      )}

      <Text
        style={{
          color: colors.textPrimary,
          fontSize: 16,
          fontWeight: "600",
          marginHorizontal: 20,
          marginBottom: 16,
        }}
      >
        Top Matches
      </Text>

      {matches.map((match) => (
        <TouchableOpacity
          key={match.id}
          onPress={() => onSelectMatch(match)}
          style={{
            backgroundColor: colors.surface,
            marginHorizontal: 20,
            marginBottom: 12,
            borderRadius: 16,
            padding: 16,
            flexDirection: "row",
            alignItems: "center",
            borderWidth: 1,
            borderColor: "rgba(255, 255, 255, 0.05)",
          }}
        >
          <View style={{ position: "absolute", top: 8, right: 8, backgroundColor: colors.surface2, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
            <Text style={{ color: colors.accentGold, fontSize: 12, fontWeight: "600" }}>
              {`${Math.round(match.confidence * 100)}%`}
            </Text>
          </View>

          <Image source={{ uri: match.image }} style={{ width: 60, height: 60, borderRadius: 8, marginRight: 16 }} />

          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: "600", marginBottom: 4 }} numberOfLines={1}>
              {`${match.brand} ${match.line}`}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 14, marginBottom: 4 }}>
              {`${match.vitola} • ${match.wrapper}`}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={{ backgroundColor: `${getStrengthColor(match.strength)}20`, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginRight: 8 }}>
                <Text style={{ color: getStrengthColor(match.strength), fontSize: 10, fontWeight: "600" }}>
                  {match.strength}
                </Text>
              </View>
              <Text style={{ color: colors.textTertiary, fontSize: 12 }}>
                {`${match.ringGauge} x ${match.length}"`}
              </Text>
            </View>
          </View>

          <ArrowRight size={20} color={colors.textTertiary} />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
