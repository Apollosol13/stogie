import React from "react";
import { View, ScrollView, TouchableOpacity, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/components/map/colors";
import { filterOptions } from "@/components/map/constants";

const FilterPills = ({ activeFilter, onChangeFilter, hasRecentActivity }) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        position: "absolute",
        bottom: insets.bottom + (hasRecentActivity ? 140 : 40),
        left: 0,
        right: 0,
        paddingHorizontal: 20,
      }}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 0 }}
      >
        {filterOptions.map((filter, index) => (
          <TouchableOpacity
            key={filter.key}
            onPress={() => onChangeFilter(filter.key)}
            style={{
              backgroundColor:
                activeFilter === filter.key ? filter.color : colors.surface,
              paddingHorizontal: 20,
              paddingVertical: 12,
              borderRadius: 24,
              marginRight: index < filterOptions.length - 1 ? 12 : 0,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Text
              style={{
                color:
                  activeFilter === filter.key
                    ? colors.bgPrimary
                    : colors.textSecondary,
                fontSize: 14,
                fontWeight: "600",
                letterSpacing: 0.5,
              }}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default FilterPills;
