import React from "react";
import { View, Text, Modal, TouchableOpacity, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X } from "lucide-react-native";
import { colors } from "@/constants/colors";

export default function CommunityGuidelinesModal({ visible, onClose }) {
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
            Community Guidelines
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

        {/* Guidelines Content */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 20 }}
        >
          <Text style={{ color: colors.textSecondary, fontSize: 14, marginBottom: 20 }}>
            Last Updated: October 2025
          </Text>

          <Text style={{ color: colors.textPrimary, lineHeight: 24, marginBottom: 16 }}>
            Welcome to Stogie, a place built for people who appreciate good cigars, good company, and good conversation. These guidelines exist to keep the experience enjoyable, safe, and respectful for everyone.
          </Text>

          <View style={{ backgroundColor: colors.surface, padding: 16, borderRadius: 12, marginBottom: 20, borderLeftWidth: 4, borderLeftColor: colors.accentRed }}>
            <Text style={{ color: colors.accentRed, fontSize: 16, fontWeight: "700", marginBottom: 8 }}>
              Zero Tolerance Policy
            </Text>
            <Text style={{ color: colors.textSecondary, lineHeight: 22 }}>
              Stogie has absolutely no tolerance for objectionable content, abusive behavior, harassment, hate speech, or any content that violates these guidelines. Violations will result in immediate content removal and account suspension or permanent ban.
            </Text>
          </View>

          {/* Section 1 */}
          <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: "700", marginTop: 20, marginBottom: 12 }}>
            1. Be Respectful
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginBottom: 8 }}>
            We're here to celebrate cigars, not insult each other.
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginLeft: 16, marginBottom: 4 }}>
            • No hate speech, bullying, or harassment.
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginLeft: 16, marginBottom: 4 }}>
            • Disagree all you want—just don't be an ass about it.
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginLeft: 16, marginBottom: 12 }}>
            • Respect other users' opinions, cultures, and preferences.
          </Text>

          {/* Section 2 */}
          <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: "700", marginTop: 20, marginBottom: 12 }}>
            2. Keep It Legal
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginBottom: 8 }}>
            Cigars are for adults.
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginLeft: 16, marginBottom: 4 }}>
            • You must be 18+ (or the legal age in your country) to use Stogie.
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginLeft: 16, marginBottom: 4 }}>
            • No promotion or sale of illegal substances.
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginLeft: 16, marginBottom: 12 }}>
            • Don't share content that breaks local laws.
          </Text>

          {/* Section 3 */}
          <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: "700", marginTop: 20, marginBottom: 12 }}>
            3. Post Real Experiences
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginBottom: 8 }}>
            Log your smoke sessions honestly—authenticity is what makes Stogie special.
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginLeft: 16, marginBottom: 4 }}>
            • Use your own photos whenever possible.
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginLeft: 16, marginBottom: 12 }}>
            • Spam, fake reviews, or self-promotion without approval will be removed.
          </Text>

          {/* Section 4 */}
          <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: "700", marginTop: 20, marginBottom: 12 }}>
            4. Keep It Classy
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginBottom: 8 }}>
            Cigars are about style and ritual, not shock value.
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginLeft: 16, marginBottom: 4 }}>
            • No nudity or explicit content.
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginLeft: 16, marginBottom: 4 }}>
            • Avoid posting anything obscene or meant to offend.
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginLeft: 16, marginBottom: 12 }}>
            • Treat Stogie like a lounge, not a comment warzone.
          </Text>

          {/* Section 5 */}
          <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: "700", marginTop: 20, marginBottom: 12 }}>
            5. Respect Privacy
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginLeft: 16, marginBottom: 4 }}>
            • Don't post personal information—yours or anyone else's.
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginLeft: 16, marginBottom: 4 }}>
            • If someone appears in your photo, make sure they're cool with it.
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginLeft: 16, marginBottom: 12 }}>
            • What's shared on Stogie may be visible to others—share responsibly.
          </Text>

          {/* Section 6 */}
          <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: "700", marginTop: 20, marginBottom: 12 }}>
            6. No Bots, Scams, or Shady Stuff
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginLeft: 16, marginBottom: 4 }}>
            • Don't impersonate others or misrepresent your identity.
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginLeft: 16, marginBottom: 4 }}>
            • No fake giveaways, phishing links, or suspicious promotions.
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginLeft: 16, marginBottom: 12 }}>
            • If something feels off, report it.
          </Text>

          {/* Section 7 */}
          <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: "700", marginTop: 20, marginBottom: 12 }}>
            7. Moderation & Enforcement
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginLeft: 16, marginBottom: 4 }}>
            • Our moderation team reviews all reports within 24 hours.
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginLeft: 16, marginBottom: 4 }}>
            • Objectionable content will be removed immediately and the offending user will be ejected from the platform.
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginLeft: 16, marginBottom: 4 }}>
            • Serious violations (hate speech, harassment, illegal content) result in immediate permanent bans.
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginLeft: 16, marginBottom: 4 }}>
            • Repeat offenders will be permanently banned without warning.
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginLeft: 16, marginBottom: 12 }}>
            • We reserve the right to moderate at our discretion to keep Stogie safe, welcoming, and authentic.
          </Text>

          {/* Section 8 */}
          <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: "700", marginTop: 20, marginBottom: 12 }}>
            8. Report & Block Features
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginBottom: 8 }}>
            Stogie provides in-app tools to keep your experience safe:
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginLeft: 16, marginBottom: 4 }}>
            • <Text style={{ fontWeight: "600" }}>Report:</Text> Tap the flag icon on any post or the "Report" option on any comment to report objectionable content. Our team will review within 24 hours.
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginLeft: 16, marginBottom: 4 }}>
            • <Text style={{ fontWeight: "600" }}>Block:</Text> Block users from their profile to prevent them from seeing your content or interacting with you.
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginBottom: 12, marginTop: 8 }}>
            You can also contact us directly at <Text style={{ color: colors.accentGold }}>Brennen@invictusreserve.com</Text> for urgent matters.
          </Text>

          {/* Section 9 */}
          <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: "700", marginTop: 20, marginBottom: 12 }}>
            9. Final Word
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginBottom: 8 }}>
            Stogie is about connection, not contention.
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22, marginBottom: 20 }}>
            Light up, share your experience, and contribute to a community that respects the craft and the people behind it.
          </Text>
        </ScrollView>
      </View>
    </Modal>
  );
}

