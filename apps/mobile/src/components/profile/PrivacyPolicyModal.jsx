import React from "react";
import { View, Text, Modal, TouchableOpacity, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X } from "lucide-react-native";
import { colors } from "@/constants/colors";

export default function PrivacyPolicyModal({ visible, onClose }) {
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
            Privacy Policy
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

        {/* Privacy Policy Content */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 20 }}
        >
          <Text style={{ color: colors.textSecondary, fontSize: 14, marginBottom: 20 }}>
            Last Updated: October 6th, 2025
          </Text>

          <Text style={{ color: colors.textPrimary, lineHeight: 24, marginBottom: 16 }}>
            Stogie respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, and share information when you use our mobile application.
          </Text>

          {/* Section 1 */}
          <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: "700", marginTop: 20, marginBottom: 12 }}>
            1. Information We Collect
          </Text>

          <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: "600", marginTop: 12, marginBottom: 8 }}>
            a. Personal Information
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginBottom: 12 }}>
            Email Address: We collect your email when you create an account. It's used for login, account recovery, and necessary updates about your account.
          </Text>

          <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: "600", marginTop: 12, marginBottom: 8 }}>
            b. Location Data
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginBottom: 8 }}>
            Stogie uses your location (with your permission) to:
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginLeft: 16, marginBottom: 4 }}>
            • Show nearby cigar stores on Google Maps.
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginLeft: 16, marginBottom: 4 }}>
            • Display where users are logging smoking sessions.
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginLeft: 16, marginBottom: 12 }}>
            • Improve recommendations and mapping accuracy.
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginBottom: 12 }}>
            You can disable location access at any time in your device settings, though some features may not work correctly without it.
          </Text>

          <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: "600", marginTop: 12, marginBottom: 8 }}>
            c. User-Generated Content
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginBottom: 8 }}>
            When you post, comment, like, or log a cigar session, this information may be visible to other users.
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginLeft: 16, marginBottom: 4 }}>
            • Posts and smoke logs may appear on the map.
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginLeft: 16, marginBottom: 4 }}>
            • Your digital humidor entries are stored under your account.
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginLeft: 16, marginBottom: 12 }}>
            • Do not share information you wouldn't want public.
          </Text>

          <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: "600", marginTop: 12, marginBottom: 8 }}>
            d. Cigar Identification
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginBottom: 12 }}>
            When you use the Identify feature powered by OpenAI, uploaded images are processed by OpenAI's system to recognize the cigar. We do not store these images beyond what's necessary to complete the request.
          </Text>

          <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: "600", marginTop: 12, marginBottom: 8 }}>
            e. Usage Data
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginBottom: 12 }}>
            We collect basic analytics (such as app interactions, feature use, and session length) to improve performance and user experience.
          </Text>

          {/* Section 2 */}
          <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: "700", marginTop: 20, marginBottom: 12 }}>
            2. How We Use Your Information
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginBottom: 8 }}>
            We use collected data to:
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginLeft: 16, marginBottom: 4 }}>
            • Provide, operate, and improve Stogie.
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginLeft: 16, marginBottom: 4 }}>
            • Enable social features like posting, commenting, and liking.
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginLeft: 16, marginBottom: 4 }}>
            • Display cigar stores and community smoke sessions on the map.
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginLeft: 16, marginBottom: 4 }}>
            • Communicate updates and respond to support requests.
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginLeft: 16, marginBottom: 12 }}>
            • Ensure platform integrity and prevent misuse.
          </Text>

          {/* Section 3 */}
          <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: "700", marginTop: 20, marginBottom: 12 }}>
            3. How We Share Information
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginBottom: 8 }}>
            We may share information in limited ways:
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginLeft: 16, marginBottom: 4 }}>
            • With Service Providers: Including Google (for Maps and location data) and OpenAI (for cigar identification).
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginLeft: 16, marginBottom: 4 }}>
            • With Other Users: Posts, comments, likes, and smoking sessions you choose to share are visible to others.
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginLeft: 16, marginBottom: 4 }}>
            • For Legal Reasons: If required by law, regulation, or court order.
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginLeft: 16, marginBottom: 12 }}>
            • Business Transfers: In the event of a merger or acquisition, user data may be part of the transfer.
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginBottom: 12 }}>
            We do not sell or rent your personal information to third parties.
          </Text>

          {/* Section 4 */}
          <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: "700", marginTop: 20, marginBottom: 12 }}>
            4. Data Retention
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginBottom: 12 }}>
            We retain data for as long as your account is active or as needed to provide our services. You may delete your account at any time to remove your data.
          </Text>

          {/* Section 5 */}
          <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: "700", marginTop: 20, marginBottom: 12 }}>
            5. Your Choices
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginLeft: 16, marginBottom: 4 }}>
            • Access and Update: You can update or delete your data from your account settings.
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginLeft: 16, marginBottom: 4 }}>
            • Location: You may disable location services at any time via device settings.
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginLeft: 16, marginBottom: 12 }}>
            • Emails: You can unsubscribe from non-essential communications.
          </Text>

          {/* Section 6 */}
          <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: "700", marginTop: 20, marginBottom: 12 }}>
            6. Security
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginBottom: 12 }}>
            We take reasonable steps to protect your data from unauthorized access or misuse. However, no online service is entirely secure, and you use Stogie at your own risk.
          </Text>

          {/* Section 7 */}
          <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: "700", marginTop: 20, marginBottom: 12 }}>
            7. Children's Privacy
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginBottom: 12 }}>
            Stogie is intended for adults aged 18 and older. We do not knowingly collect information from minors. If a child provides personal data, we will delete it promptly.
          </Text>

          {/* Section 8 */}
          <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: "700", marginTop: 20, marginBottom: 12 }}>
            8. Changes to This Policy
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginBottom: 12 }}>
            We may update this Privacy Policy periodically. If significant changes occur, we will notify users within the App or via email.
          </Text>

          {/* Section 9 */}
          <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: "700", marginTop: 20, marginBottom: 12 }}>
            9. Contact Us
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginBottom: 4 }}>
            If you have any questions or concerns about this Privacy Policy, please contact:
          </Text>
          <Text style={{ color: colors.accentGold, lineHeight: 22, marginBottom: 4 }}>
            Email: Brennen@invictusreserve.com
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginBottom: 20 }}>
            App Name: Stogie
          </Text>
        </ScrollView>
      </View>
    </Modal>
  );
}

