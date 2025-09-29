import React, { useState } from "react";
import { View, Modal, Alert, Text, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useVenueSearch } from "../../hooks/useVenueSearch";

import VenueSearchHeader from "./VenueSearchModal/VenueSearchHeader";
import SearchModeToggle from "./VenueSearchModal/SearchModeToggle";
import CitySearch from "./VenueSearchModal/CitySearch";
import VenueSearch from "./VenueSearchModal/VenueSearch";
import SearchResults from "./VenueSearchModal/SearchResults";
import VenueSearchFooter from "./VenueSearchModal/VenueSearchFooter";
import { colors } from "./VenueSearchModal/constants";

export default function VenueSearchModal({
  isVisible,
  onClose,
  userLocation,
  onVenuesAdded,
}) {
  const insets = useSafeAreaInsets();
  const [selectedVenues, setSelectedVenues] = useState([]);
  const [saving, setSaving] = useState(false);

  const {
    searchQuery,
    setSearchQuery,
    cityQuery,
    setCityQuery,
    citySuggestions,
    searchResults,
    setSearchResults,
    loading,
    hasSearched,
    setHasSearched,
    searchMode,
    setSearchMode,
    selectedCity,
    loadingCities,
    selectCity,
    handleSearch,
    resetState,
  } = useVenueSearch(userLocation, isVisible);

  const toggleVenueSelection = (venue) => {
    setSelectedVenues((prev) => {
      const isSelected = prev.some(
        (v) => v.googlePlaceId === venue.googlePlaceId,
      );
      if (isSelected) {
        return prev.filter((v) => v.googlePlaceId !== venue.googlePlaceId);
      } else {
        return [...prev, venue];
      }
    });
  };

  const isVenueSelected = (venue) => {
    return selectedVenues.some((v) => v.googlePlaceId === venue.googlePlaceId);
  };

  const handleClose = () => {
    resetState();
    setSelectedVenues([]);
    onClose();
  };

  const saveSelectedVenues = async () => {
    if (selectedVenues.length === 0) {
      Alert.alert(
        "No Venues Selected",
        "Please select venues to add to your map.",
      );
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/shops/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ venues: selectedVenues }),
      });
      const data = await response.json();

      if (data.success) {
        Alert.alert("Success!", `Added ${data.saved} venues to your map!`, [
          {
            text: "OK",
            onPress: () => {
              onVenuesAdded(data.venues);
              handleClose();
            },
          },
        ]);
      } else {
        Alert.alert("Save Failed", data.error || "Failed to save venues");
      }
    } catch (error) {
      console.error("Save error:", error);
      Alert.alert("Save Error", "Failed to save venues. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={{ flex: 1, backgroundColor: colors.overlay }}>
        <View
          style={{
            flex: 1,
            backgroundColor: colors.surface,
            marginTop: insets.top + 20,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          }}
        >
          <VenueSearchHeader onClose={handleClose} />

          <View style={{ paddingHorizontal: 20, paddingBottom: 16 }}>
            <SearchModeToggle
              searchMode={searchMode}
              setSearchMode={setSearchMode}
              setHasSearched={setHasSearched}
              setSearchResults={setSearchResults}
              userLocation={userLocation}
            />

            {searchMode === "city" && (
              <CitySearch
                cityQuery={cityQuery}
                setCityQuery={setCityQuery}
                citySuggestions={citySuggestions}
                selectCity={selectCity}
                loadingCities={loadingCities}
              />
            )}

            <VenueSearch
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              handleSearch={handleSearch}
              loading={loading}
            />
            <Text
              style={{
                color: colors.textTertiary,
                fontSize: 14,
                marginTop: 8,
                textAlign: "center",
              }}
            >
              {hasSearched
                ? `Found ${searchResults.length} venues ${searchMode === "city" && selectedCity ? `in ${selectedCity.structured_formatting?.main_text || cityQuery}` : "nearby"}`
                : searchMode === "city"
                  ? "Select a city to search for cigar lounges and tobacco shops"
                  : "Searching for cigar lounges and tobacco shops near you..."}
            </Text>

            {/* Debug Section - Remove this later */}
            <TouchableOpacity
              onPress={async () => {
                try {
                  console.log("Testing API integration...");
                  const response = await fetch("/api/test-search");
                  const data = await response.json();
                  console.log("Test API Response:", data);
                  Alert.alert(
                    "API Test",
                    `Status: ${data.success ? "Success" : "Failed"}\n` +
                      `Results: ${data.resultCount || 0}\n` +
                      `URL: ${data.url || "N/A"}`,
                  );
                } catch (error) {
                  console.error("Test API Error:", error);
                  Alert.alert("API Test Error", error.message);
                }
              }}
              style={{
                backgroundColor: colors.surface2,
                padding: 8,
                borderRadius: 8,
                marginTop: 8,
              }}
            >
              <Text
                style={{
                  color: colors.accentGold,
                  fontSize: 12,
                  textAlign: "center",
                }}
              >
                🔧 Debug API Test
              </Text>
            </TouchableOpacity>
          </View>

          <SearchResults
            loading={loading}
            hasSearched={hasSearched}
            searchResults={searchResults}
            searchMode={searchMode}
            isVenueSelected={isVenueSelected}
            toggleVenueSelection={toggleVenueSelection}
            userLocation={userLocation}
          />

          <VenueSearchFooter
            selectedVenuesCount={selectedVenues.length}
            onSave={saveSelectedVenues}
            saving={saving}
          />
        </View>
      </View>
    </Modal>
  );
}
