import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X } from "lucide-react-native";
import { useRouter } from "expo-router";
import { colors } from "./colors";
import MatchList from "./MatchList";
import MatchDetail from "./MatchDetail";

export default function ResultsMode({
  matches,
  selectedMatch,
  setSelectedMatch,
  resetScan,
  capturedImage,
  handleMatchSelect,
  isAdding,
}) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Auto-select the first match (expert analysis) when matches first load
  React.useEffect(() => {
    if (matches && matches.length > 0 && !selectedMatch) {
      setSelectedMatch(matches[0]); // Auto-select the expert-identified match
    }
  }, [matches, selectedMatch, setSelectedMatch]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      <StatusBar style="light" />

      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 20,
          paddingBottom: 16,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <TouchableOpacity onPress={resetScan}>
          <X size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text
          style={{ color: colors.textPrimary, fontSize: 18, fontWeight: "600" }}
        >
          {selectedMatch ? "Cigar Analysis" : "Match Results"}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {selectedMatch ? (
        <MatchDetail match={selectedMatch} />
      ) : (
        <MatchList
          matches={matches}
          capturedImage={capturedImage}
          onSelectMatch={setSelectedMatch}
        />
      )}

      {/* Fixed Bottom Actions */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: colors.bgPrimary,
          paddingTop: 16,
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 20,
          borderTopWidth: 1,
          borderTopColor: "rgba(255, 255, 255, 0.1)",
        }}
      >
        {selectedMatch ? (
          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity
              onPress={() => setSelectedMatch(null)}
              style={{
                flex: 1,
                backgroundColor: colors.surface,
                paddingVertical: 16,
                borderRadius: 12,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: 16,
                  fontWeight: "600",
                }}
              >
                View All Matches
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleMatchSelect(selectedMatch)}
              disabled={isAdding}
              style={{
                flex: 1,
                backgroundColor: colors.accentGold,
                paddingVertical: 16,
                borderRadius: 12,
                alignItems: "center",
                opacity: isAdding ? 0.6 : 1,
              }}
            >
              <Text
                style={{
                  color: colors.bgPrimary,
                  fontSize: 16,
                  fontWeight: "600",
                }}
              >
                {isAdding ? "Adding..." : "Add to Collection"}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity
              onPress={resetScan}
              style={{
                flex: 1,
                backgroundColor: colors.surface,
                paddingVertical: 16,
                borderRadius: 12,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: 16,
                  fontWeight: "600",
                }}
              >
                Scan Again
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/humidor")}
              style={{
                flex: 1,
                backgroundColor: colors.accentGold,
                paddingVertical: 16,
                borderRadius: 12,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: colors.bgPrimary,
                  fontSize: 16,
                  fontWeight: "600",
                }}
              >
                View Collection
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}
