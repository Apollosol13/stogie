import React from "react";
import {
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from "react-native";
import { MapPin } from "lucide-react-native";
import { colors } from "./constants";

export default function CitySearch({
  cityQuery,
  setCityQuery,
  citySuggestions,
  selectCity,
  loadingCities,
}) {
  return (
    <View style={{ marginBottom: 16 }}>
      <View
        style={{
          backgroundColor: colors.surface2,
          borderRadius: 12,
          paddingHorizontal: 16,
          paddingVertical: 12,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <MapPin size={20} color={colors.textSecondary} />
        <TextInput
          style={{
            flex: 1,
            marginLeft: 12,
            color: colors.textPrimary,
            fontSize: 16,
          }}
          placeholder="Enter city name..."
          placeholderTextColor={colors.textTertiary}
          value={cityQuery}
          onChangeText={setCityQuery}
        />
        {loadingCities && (
          <ActivityIndicator size="small" color={colors.accentGold} />
        )}
      </View>

      {citySuggestions.length > 0 && (
        <View
          style={{
            backgroundColor: colors.surface2,
            borderRadius: 12,
            marginTop: 8,
            maxHeight: 200,
          }}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            {citySuggestions.map((city, index) => (
              <TouchableOpacity
                key={city.place_id}
                onPress={() => selectCity(city)}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderBottomWidth:
                    index < citySuggestions.length - 1 ? 1 : 0,
                  borderBottomColor: "rgba(255, 255, 255, 0.1)",
                }}
              >
                <Text style={{ color: colors.textPrimary, fontSize: 16 }}>
                  {city.description}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}
