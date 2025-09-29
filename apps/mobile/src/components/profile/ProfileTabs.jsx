import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { profileTabs } from "@/components/profile/constants";
import { colors } from "@/constants/colors";

export default function ProfileTabs({ activeTab, setActiveTab }) {
  return (
    <View
      style={{
        flexDirection: "row",
        marginHorizontal: 20,
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
      }}
    >
      {profileTabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          onPress={() => setActiveTab(tab.key)}
          style={{
            flex: 1,
            paddingVertical: 16,
            alignItems: "center",
            borderBottomWidth: 2,
            borderBottomColor:
              activeTab === tab.key ? colors.accentGold : "transparent",
          }}
        >
          <Text
            style={{
              color:
                activeTab === tab.key
                  ? colors.accentGold
                  : colors.textSecondary,
              fontSize: 14,
              fontWeight: "600",
              letterSpacing: 0.5,
            }}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
