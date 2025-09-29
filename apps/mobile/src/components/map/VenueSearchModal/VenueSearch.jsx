import React from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from "react-native";
import { Search } from "lucide-react-native";
import { colors } from "./constants";

export default function VenueSearch({
  searchQuery,
  setSearchQuery,
  handleSearch,
  loading,
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: colors.surface2,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        alignItems: "center",
      }}
    >
      <Search size={20} color={colors.textSecondary} />
      <TextInput
        style={{
          flex: 1,
          marginLeft: 12,
          color: colors.textPrimary,
          fontSize: 16,
        }}
        placeholder="Search for specific venues..."
        placeholderTextColor={colors.textTertiary}
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmitEditing={handleSearch}
        returnKeyType="search"
      />
      <TouchableOpacity onPress={handleSearch} disabled={loading}>
        {loading ? (
          <ActivityIndicator size="small" color={colors.accentGold} />
        ) : (
          <Text
            style={{
              color: colors.accentGold,
              fontSize: 16,
              fontWeight: "600",
            }}
          >
            Search
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
