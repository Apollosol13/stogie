import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { colors } from "@/components/cigar/colors";

function ChoiceButton({ label, value, selectedValue, onPress, color }) {
    const isSelected = selectedValue === value;
    return (
        <TouchableOpacity
            onPress={() => onPress(value)}
            style={{
                backgroundColor: isSelected ? color : colors.surface,
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: isSelected ? color : colors.divider,
            }}
        >
            <Text style={{
                color: isSelected ? colors.textPrimary : colors.textSecondary,
                fontSize: 14,
                fontWeight: "500",
            }}>
                {label}
            </Text>
        </TouchableOpacity>
    );
}

export function RecommendationSelector({ question, value, onSelect }) {
    return (
        <View style={{ marginBottom: 16 }}>
            <Text style={{ color: colors.textSecondary, fontSize: 14, marginBottom: 8 }}>
                {question}
            </Text>
            <View style={{ flexDirection: "row", gap: 12 }}>
                <ChoiceButton label="Yes" value={true} selectedValue={value} onPress={onSelect} color={colors.accentGreen} />
                <ChoiceButton label="No" value={false} selectedValue={value} onPress={onSelect} color={colors.accentRed} />
            </View>
        </View>
    );
}
