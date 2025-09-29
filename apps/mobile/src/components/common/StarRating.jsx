import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Star } from "lucide-react-native";

const StarRating = ({
  rating = 0,
  size = 12,
  color = "#D4B896",
  inactiveColor = "#6B7280",
  onPress,
  disabled = false,
}) => {
  const handleStarPress = (starIndex) => {
    if (onPress && !disabled) {
      onPress(starIndex + 1);
    }
  };

  return (
    <View style={{ flexDirection: "row" }}>
      {Array.from({ length: 5 }, (_, i) => {
        const isActive = i < Math.round(rating);

        if (onPress && !disabled) {
          return (
            <TouchableOpacity
              key={i}
              onPress={() => handleStarPress(i)}
              style={{
                padding: 2,
                marginRight: i < 4 ? 4 : 0,
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Star
                size={size}
                color={isActive ? color : inactiveColor}
                fill={isActive ? color : "transparent"}
              />
            </TouchableOpacity>
          );
        }

        return (
          <View
            key={i}
            style={{
              marginRight: i < 4 ? 4 : 0,
            }}
          >
            <Star
              size={size}
              color={isActive ? color : inactiveColor}
              fill={isActive ? color : "transparent"}
            />
          </View>
        );
      })}
    </View>
  );
};

export default StarRating;
