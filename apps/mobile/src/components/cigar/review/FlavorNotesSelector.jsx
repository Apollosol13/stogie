import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { FLAVOR_NOTES } from "@/components/cigar/constants";
import { colors } from "@/components/cigar/colors";
import { FormSection } from "./FormSection";

export function FlavorNotesSelector({ selectedNotes, onToggle }) {
  return (
    <FormSection title="Flavor Notes">
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {FLAVOR_NOTES.map((note) => {
          const isSelected = selectedNotes.includes(note);
          return (
            <TouchableOpacity
              key={note}
              onPress={() => onToggle(note)}
              style={{
                backgroundColor: isSelected ? colors.accentGold : colors.surface,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: isSelected ? colors.accentGold : colors.divider,
              }}
            >
              <Text style={{
                  color: isSelected ? colors.bgPrimary : colors.textSecondary,
                  fontSize: 14,
                  fontWeight: "500",
                }}
              >
                {note}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </FormSection>
  );
}
