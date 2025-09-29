import React from "react";
import {
  ScrollView,
  View,
  ActivityIndicator,
  Text,
} from "react-native";
import { MapPin } from "lucide-react-native";
import VenueCard from "./VenueCard";
import { colors } from "./constants";

const LoadingState = ({ searchMode }) => (
  <View style={{ paddingVertical: 40, alignItems: "center" }}>
    <ActivityIndicator size="large" color={colors.accentGold} />
    <Text
      style={{
        color: colors.textSecondary,
        fontSize: 16,
        marginTop: 16,
      }}
    >
      {searchMode === "city"
        ? "Searching venues in city..."
        : "Searching nearby venues..."}
    </Text>
  </View>
);

const EmptyState = ({ searchMode }) => (
  <View
    style={{
      paddingVertical: 40,
      paddingHorizontal: 20,
      alignItems: "center",
    }}
  >
    <MapPin size={48} color={colors.textTertiary} />
    <Text
      style={{
        color: colors.textPrimary,
        fontSize: 18,
        fontWeight: "600",
        marginTop: 16,
        textAlign: "center",
      }}
    >
      No venues found
    </Text>
    <Text
      style={{
        color: colors.textSecondary,
        fontSize: 14,
        marginTop: 8,
        textAlign: "center",
      }}
    >
      Try searching in a different {searchMode === "city" ? "city" : "area"} or
      using different keywords
    </Text>
  </View>
);

export default function SearchResults({
  loading,
  hasSearched,
  searchResults,
  searchMode,
  isVenueSelected,
  toggleVenueSelection,
  userLocation,
}) {
  if (loading && !hasSearched) {
    return <LoadingState searchMode={searchMode} />;
  }

  if (hasSearched && searchResults.length === 0 && !loading) {
    return <EmptyState searchMode={searchMode} />;
  }

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: 20 }}
      showsVerticalScrollIndicator={false}
    >
      {searchResults.map((venue, index) => (
        <VenueCard
          key={`${venue.googlePlaceId}-${index}`}
          venue={venue}
          isSelected={isVenueSelected(venue)}
          onPress={() => toggleVenueSelection(venue)}
          userLocation={userLocation}
        />
      ))}
    </ScrollView>
  );
}
