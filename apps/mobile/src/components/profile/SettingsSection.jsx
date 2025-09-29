import React, { useState } from "react";
import { View, Text, Switch } from "react-native";
import SettingsItem from "@/components/profile/SettingsItem";
import {
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  MapPin,
} from "lucide-react-native";
import { colors } from "@/constants/colors";

export default function SettingsSection({ onSignOut }) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        marginHorizontal: 20,
        borderRadius: 16,
        marginBottom: 20,
      }}
    >
      <Text
        style={{
          color: colors.textPrimary,
          fontSize: 18,
          fontWeight: "600",
          padding: 20,
          paddingBottom: 8,
        }}
      >
        Settings
      </Text>

      <SettingsItem
        icon={<Bell size={20} color={colors.accentBlue} />}
        title="Notifications"
        subtitle="Push notifications for likes and comments"
        rightElement={
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: colors.surface2, true: colors.accentGold }}
            thumbColor={colors.textPrimary}
          />
        }
      />

      <SettingsItem
        icon={<MapPin size={20} color={colors.accentGreen} />}
        title="Location Services"
        subtitle="Allow location for check-ins and nearby venues"
        rightElement={
          <Switch
            value={locationEnabled}
            onValueChange={setLocationEnabled}
            trackColor={{ false: colors.surface2, true: colors.accentGold }}
            thumbColor={colors.textPrimary}
          />
        }
      />

      <SettingsItem
        icon={<Shield size={20} color={colors.textSecondary} />}
        title="Privacy & Security"
        subtitle="Manage your account privacy"
      />

      <SettingsItem
        icon={<HelpCircle size={20} color={colors.textSecondary} />}
        title="Help & Support"
        subtitle="FAQ, contact support"
      />

      <SettingsItem
        icon={<LogOut size={20} color={colors.accentRed} />}
        title="Sign Out"
        onPress={onSignOut}
      />
    </View>
  );
}
