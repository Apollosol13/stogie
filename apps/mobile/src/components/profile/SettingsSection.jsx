import React, { useState } from "react";
import { View, Text, Switch } from "react-native";
import SettingsItem from "@/components/profile/SettingsItem";
import PrivacyPolicyModal from "@/components/profile/PrivacyPolicyModal";
import TermsOfServiceModal from "@/components/profile/TermsOfServiceModal";
import CommunityGuidelinesModal from "@/components/profile/CommunityGuidelinesModal";
import HelpSupportModal from "@/components/profile/HelpSupportModal";
import {
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  MapPin,
  FileText,
  ScrollText,
  Users,
} from "lucide-react-native";
import { colors } from "@/constants/colors";

export default function SettingsSection({ onSignOut }) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTermsOfService, setShowTermsOfService] = useState(false);
  const [showCommunityGuidelines, setShowCommunityGuidelines] = useState(false);
  const [showHelpSupport, setShowHelpSupport] = useState(false);

  return (
    <>
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
          icon={<FileText size={20} color={colors.accentGold} />}
          title="Privacy Policy"
          subtitle="Read our privacy policy"
          onPress={() => setShowPrivacyPolicy(true)}
        />

        <SettingsItem
          icon={<ScrollText size={20} color={colors.accentGold} />}
          title="Terms of Service"
          subtitle="Read our terms of service"
          onPress={() => setShowTermsOfService(true)}
        />

        <SettingsItem
          icon={<Users size={20} color={colors.accentGold} />}
          title="Community Guidelines"
          subtitle="Read our community guidelines"
          onPress={() => setShowCommunityGuidelines(true)}
        />

        <SettingsItem
          icon={<HelpCircle size={20} color={colors.accentGold} />}
          title="Help & Support"
          subtitle="FAQ, contact support"
          onPress={() => setShowHelpSupport(true)}
        />

        <SettingsItem
          icon={<LogOut size={20} color={colors.accentRed} />}
          title="Sign Out"
          onPress={onSignOut}
        />
      </View>

      <PrivacyPolicyModal
        visible={showPrivacyPolicy}
        onClose={() => setShowPrivacyPolicy(false)}
      />

      <TermsOfServiceModal
        visible={showTermsOfService}
        onClose={() => setShowTermsOfService(false)}
      />

      <CommunityGuidelinesModal
        visible={showCommunityGuidelines}
        onClose={() => setShowCommunityGuidelines(false)}
      />

      <HelpSupportModal
        visible={showHelpSupport}
        onClose={() => setShowHelpSupport(false)}
      />
    </>
  );
}
