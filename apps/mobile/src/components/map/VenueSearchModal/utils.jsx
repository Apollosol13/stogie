import React from "react";
import { Star } from "lucide-react-native";
import { colors } from "./constants";

export const renderStars = (rating) => {
  return Array.from({ length: 5 }, (_, i) => (
    <Star
      key={i}
      size={12}
      color={i < rating ? colors.accentGold : colors.textTertiary}
      fill={i < rating ? colors.accentGold : "transparent"}
    />
  ));
};

export const calculateDistance = (venue, userLocation) => {
  if (!userLocation || !venue.latitude || !venue.longitude) return null;

  const R = 6371; // Earth"s radius in km
  const dLat = ((venue.latitude - userLocation.latitude) * Math.PI) / 180;
  const dLon = ((venue.longitude - userLocation.longitude) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((userLocation.latitude * Math.PI) / 180) *
      Math.cos((venue.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;

  return d < 1 ? `${Math.round(d * 1000)}m` : `${d.toFixed(1)}km`;
};
