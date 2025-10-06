import React from "react";
import { View, Text, Modal, TouchableOpacity, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X } from "lucide-react-native";
import { colors } from "@/constants/colors";

export default function TermsOfServiceModal({ visible, onClose }) {
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
            Terms of Service
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

        {/* Terms Content */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 20 }}
        >
          <Text style={{ color: colors.textSecondary, fontSize: 14, marginBottom: 20 }}>
            Last Updated: October 2025
          </Text>

          <Text style={{ color: colors.textPrimary, lineHeight: 24, marginBottom: 16 }}>
            Welcome to Stogie! These Terms of Service ("Terms") govern your use of the Stogie mobile application and related services (collectively, the "App"). By creating an account or using the App, you agree to these Terms. If you do not agree, please do not use Stogie.
          </Text>

          {/* Section 1 */}
          <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: "700", marginTop: 20, marginBottom: 12 }}>
            1. About Stogie
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginBottom: 8 }}>
            Stogie is a social platform for cigar enthusiasts. Users can:
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginLeft: 16, marginBottom: 4 }}>
            • Post, like, and comment on content.
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginLeft: 16, marginBottom: 4 }}>
            • Log cigars and smoking sessions.
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginLeft: 16, marginBottom: 4 }}>
            • Discover nearby cigar shops using Google Maps.
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginLeft: 16, marginBottom: 4 }}>
            • Store cigars in a digital humidor.
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginLeft: 16, marginBottom: 12 }}>
            • Identify cigars through our AI-powered identification feature (powered by OpenAI).
          </Text>

          {/* Section 2 */}
          <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: "700", marginTop: 20, marginBottom: 12 }}>
            2. Eligibility
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginBottom: 12 }}>
            You must be 18 years or older to use Stogie. By using the App, you confirm that you meet this requirement and that you are legally allowed to consume or discuss tobacco products in your jurisdiction.
          </Text>

          {/* Section 3 */}
          <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: "700", marginTop: 20, marginBottom: 12 }}>
            3. Your Account
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginLeft: 16, marginBottom: 4 }}>
            • You are responsible for maintaining the confidentiality of your account credentials.
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginLeft: 16, marginBottom: 4 }}>
            • You agree that all information you provide is accurate and up to date.
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginLeft: 16, marginBottom: 4 }}>
            • You are responsible for all activities that occur under your account.
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginLeft: 16, marginBottom: 12 }}>
            • We reserve the right to suspend or terminate accounts that violate these Terms or engage in harmful or illegal activity.
          </Text>

          {/* Section 4 */}
          <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: "700", marginTop: 20, marginBottom: 12 }}>
            4. Content You Post
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginBottom: 12 }}>
            You retain ownership of any content you post to Stogie, including photos, comments, logs, and reviews ("User Content"). However, by posting, you grant us a non-exclusive, royalty-free, worldwide license to use, display, and distribute your content within the App for operational purposes (like showing your sessions on the map or your posts in the feed).
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginBottom: 8 }}>
            You agree not to post content that:
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginLeft: 16, marginBottom: 4 }}>
            • Promotes hate, violence, or illegal activity.
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginLeft: 16, marginBottom: 4 }}>
            • Contains nudity, pornography, or explicit material.
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginLeft: 16, marginBottom: 4 }}>
            • Violates intellectual property rights.
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginLeft: 16, marginBottom: 12 }}>
            • Harasses or threatens others.
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginBottom: 12 }}>
            We reserve the right to remove or moderate content at our discretion.
          </Text>

          {/* Section 5 */}
          <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: "700", marginTop: 20, marginBottom: 12 }}>
            5. Location Features
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginBottom: 8 }}>
            Stogie uses Google Maps and location data to:
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginLeft: 16, marginBottom: 4 }}>
            • Show nearby cigar lounges and stores.
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginLeft: 16, marginBottom: 12 }}>
            • Display community smoke sessions.
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginBottom: 12 }}>
            By enabling location services, you consent to this use. You can disable location access anytime in your device settings, though some features will be limited.
          </Text>

          {/* Section 6 */}
          <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: "700", marginTop: 20, marginBottom: 12 }}>
            6. AI Identification Feature
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginLeft: 16, marginBottom: 4 }}>
            • When using the Identify button, images you upload are processed by OpenAI to detect the cigar type.
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginLeft: 16, marginBottom: 4 }}>
            • You acknowledge that these images may be transmitted to third-party systems for processing.
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginLeft: 16, marginBottom: 4 }}>
            • You retain ownership of your images, but you grant us permission to process them for this purpose.
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginLeft: 16, marginBottom: 12 }}>
            • We do not guarantee accuracy of AI identifications.
          </Text>

          {/* Section 7 */}
          <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: "700", marginTop: 20, marginBottom: 12 }}>
            7. Community Standards
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginBottom: 8 }}>
            Stogie is a place to connect, not to troll. Users are expected to:
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginLeft: 16, marginBottom: 4 }}>
            • Treat others respectfully.
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginLeft: 16, marginBottom: 4 }}>
            • Avoid spamming or self-promotion without permission.
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginLeft: 16, marginBottom: 12 }}>
            • Refrain from posting illegal or harmful content.
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginBottom: 12 }}>
            Violations may result in suspension or permanent removal from the platform.
          </Text>

          {/* Section 8 */}
          <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: "700", marginTop: 20, marginBottom: 12 }}>
            8. Intellectual Property
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginLeft: 16, marginBottom: 4 }}>
            • All trademarks, logos, code, and design elements of Stogie are owned by Invictus Reserve LLC.
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginLeft: 16, marginBottom: 12 }}>
            • You may not copy, modify, or distribute our app or branding without written permission.
          </Text>

          {/* Section 9 */}
          <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: "700", marginTop: 20, marginBottom: 12 }}>
            9. Disclaimer of Warranties
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginLeft: 16, marginBottom: 4 }}>
            • Stogie is provided "as is" and "as available."
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginLeft: 16, marginBottom: 12 }}>
            • We do not guarantee that the App will be error-free, uninterrupted, or that any content (including AI identifications or map data) is accurate. Use is at your own risk.
          </Text>

          {/* Section 10 */}
          <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: "700", marginTop: 20, marginBottom: 12 }}>
            10. Limitation of Liability
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginBottom: 12 }}>
            To the maximum extent permitted by law, Invictus Reserve LLC and its affiliates will not be liable for any indirect, incidental, or consequential damages arising from your use of Stogie, including loss of data or reputation.
          </Text>

          {/* Section 11 */}
          <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: "700", marginTop: 20, marginBottom: 12 }}>
            11. Termination
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginBottom: 12 }}>
            We reserve the right to suspend or terminate your access to Stogie at any time, with or without notice, for behavior we deem inappropriate or in violation of these Terms.
          </Text>

          {/* Section 12 */}
          <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: "700", marginTop: 20, marginBottom: 12 }}>
            12. Changes to These Terms
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginBottom: 12 }}>
            We may update these Terms periodically. Continued use of the App after updates means you accept the revised Terms.
          </Text>

          {/* Section 13 */}
          <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: "700", marginTop: 20, marginBottom: 12 }}>
            13. Governing Law
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginBottom: 12 }}>
            These Terms are governed by and construed under the laws of the State of South Carolina, without regard to conflict of law principles.
          </Text>

          {/* Section 14 */}
          <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: "700", marginTop: 20, marginBottom: 12 }}>
            14. Contact
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginBottom: 4 }}>
            For questions about these Terms, please contact:
          </Text>
          <Text style={{ color: colors.accentGold, lineHeight: 22, marginBottom: 4 }}>
            Email: Brennen@invictusreserve.com
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginBottom: 4 }}>
            App Name: Stogie
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginBottom: 20 }}>
            Company: Invictus Reserve LLC
          </Text>
        </ScrollView>
      </View>
    </Modal>
  );
}

