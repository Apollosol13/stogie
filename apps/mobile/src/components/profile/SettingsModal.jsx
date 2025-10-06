import React from "react";
import { View, Text, Modal, TouchableOpacity, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X } from "lucide-react-native";
import { colors } from "@/constants/colors";
import SettingsSection from "./SettingsSection";

export default function SettingsModal({ visible, onClose, onSignOut }) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: colors.bgPrimary,
          paddingTop: insets.top,
        }}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 20,
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: colors.surface,
          }}
        >
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: 20,
              fontWeight: "700",
            }}
          >
            Settings
          </Text>
          <TouchableOpacity
            onPress={onClose}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: colors.surface,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <X size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Settings Content */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 20 }}
        >
          <SettingsSection onSignOut={onSignOut} />
          <View style={{ height: insets.bottom + 20 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

