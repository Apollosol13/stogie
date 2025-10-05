import React from "react";
import { Marker, Callout } from "react-native-maps";
import { View, Text } from "react-native";
import { colors } from "@/components/map/colors";

const MapMarkers = ({ markers, onMarkerPress }) => {
  const getMarkerColor = (type) => {
    switch (type) {
      case "lounge":
        return colors.accentGold;
      case "shop":
        return colors.accentBlue;
      case "session":
        return colors.accentGreen;
      default:
        return colors.textSecondary;
    }
  };

  return (
    <>
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          coordinate={marker.coordinate}
          pinColor={getMarkerColor(marker.type)}
          onPress={() => onMarkerPress(marker)}
        >
          <Callout tooltip>
            <View
              style={{
                backgroundColor: colors.surface2,
                borderRadius: 8,
                padding: 12,
                minWidth: 200,
              }}
            >
              <Text
                style={{
                  fontWeight: "bold",
                  fontSize: 14,
                  color: colors.textPrimary,
                }}
              >
                {marker.title}
              </Text>
              <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                {marker.description}
              </Text>
            </View>
          </Callout>
        </Marker>
      ))}
    </>
  );
};

export default MapMarkers;
