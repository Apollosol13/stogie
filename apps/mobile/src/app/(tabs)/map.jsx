import React, { useState, useRef } from "react";
import { View, Alert, TouchableOpacity, Text } from "react-native";
import { StatusBar } from "expo-status-bar";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import { apiRequest } from "../../utils/api";

import useUser from "../../utils/auth/useUser";
import useLocationManager from "../../hooks/useLocationManager";
import useMapData from "../../hooks/useMapData";

import SmokingSessionModal from "../../components/map/SmokingSessionModal";
import VenueSearchModal from "../../components/map/VenueSearchModal";
import LocationPermissionModal from "../../components/map/LocationPermissionModal";
import VenueBottomSheet from "../../components/map/VenueBottomSheet";
import MapHeader from "../../components/map/MapHeader";
import RecentActivityCard from "../../components/map/RecentActivityCard";
import LoadingOverlay from "../../components/map/LoadingOverlay";
import MapMarkers from "../../components/map/MapMarkers";
import { colors } from "../../components/map/colors";
import { customMapStyle } from "../../components/map/mapStyle";

export default function MapScreen() {
  const mapRef = useRef(null);
  const { data: user } = useUser();

  const {
    region,
    setRegion,
    userLocation,
    locationPermission,
    showLocationPermissionModal,
    centerOnUser,
    handleLocationPermissionAllow,
    handleLocationPermissionDecline,
  } = useLocationManager(mapRef);

  const {
    loading,
    recentActivity,
    activeFilter,
    setActiveFilter,
    filteredMarkers,
    loadMapData,
  } = useMapData();

  const [selectedVenue, setSelectedVenue] = useState(null);
  const [showVenueModal, setShowVenueModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const handleMapPress = (event) => {
    if (!user) {
      Alert.alert(
        "Authentication Required",
        "Please sign in to create smoking sessions.",
      );
      return;
    }
    const { coordinate } = event.nativeEvent;
    setSelectedLocation(coordinate);
    setShowSessionModal(true);
  };

  const handleMarkerPress = (marker) => {
    setSelectedVenue(marker);
    setShowVenueModal(true);
  };

  const handleCreateSession = async (sessionData) => {
    const response = await apiRequest("/api/smoking-sessions", {
      method: "POST",
      body: JSON.stringify(sessionData),
    });

    if (!response.ok) throw new Error("Failed to create session");

    Alert.alert(
      "Success!",
      "Your smoking session has been posted to the map!",
      [{ text: "OK", onPress: () => loadMapData() }],
    );

    setShowSessionModal(false);
    setSelectedLocation(null);
  };

  const handleVenuesAdded = (newVenues) => {
    loadMapData();
    // Removed automatic animation to keep map stationary
  };

  const handleCheckIn = (coordinate) => {
    if (user) {
      setSelectedLocation(coordinate);
      setShowSessionModal(true);
      setShowVenueModal(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      <StatusBar style="light" />

      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={{ flex: 1 }}
        region={region}
        onPress={handleMapPress}
        showsUserLocation={locationPermission}
        showsMyLocationButton={false}
        customMapStyle={customMapStyle}
        userInterfaceStyle="dark"
        scrollEnabled={true}
        zoomEnabled={true}
        pitchEnabled={false}
        rotateEnabled={false}
      >
        <MapMarkers
          markers={filteredMarkers}
          onMarkerPress={handleMarkerPress}
        />
      </MapView>

      <LoadingOverlay isVisible={loading} />

      <MapHeader
        onSearchPress={() => setShowSearchModal(true)}
        onCenterPress={centerOnUser}
        onFilterPress={() => {
          /* TODO: Implement filter modal */
        }}
      />


      <RecentActivityCard recentActivity={recentActivity} />

      <VenueBottomSheet
        venue={selectedVenue}
        isVisible={showVenueModal}
        onClose={() => {
          setShowVenueModal(false);
          setSelectedVenue(null);
        }}
        onCheckIn={handleCheckIn}
        user={user}
      />

      <SmokingSessionModal
        isVisible={showSessionModal}
        onClose={() => {
          setShowSessionModal(false);
          setSelectedLocation(null);
        }}
        location={selectedLocation}
        onCreateSession={handleCreateSession}
      />

      <VenueSearchModal
        isVisible={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        userLocation={userLocation}
        onVenuesAdded={handleVenuesAdded}
      />

      <LocationPermissionModal
        isVisible={showLocationPermissionModal}
        onAllow={handleLocationPermissionAllow}
        onDecline={handleLocationPermissionDecline}
      />

      {/* Bottom CTA - Smoking Session */}
      <View
        style={{
          position: "absolute",
          left: 20,
          right: 20,
          bottom: 28,
          alignItems: "center",
        }}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => {
            if (!user) {
              Alert.alert("Authentication Required", "Please sign in to log a smoking session.");
              return;
            }
            setShowSessionModal(true);
          }}
          style={{
            backgroundColor: colors.accentGold,
            paddingVertical: 14,
            paddingHorizontal: 24,
            borderRadius: 28,
            width: "100%",
            shadowColor: "#000",
            shadowOpacity: 0.3,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 6 },
          }}
        >
          <Text
            style={{
              textAlign: "center",
              color: colors.bgPrimary,
              fontSize: 18,
              fontWeight: "800",
              letterSpacing: 0.3,
            }}
          >
            Smoking Session
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
