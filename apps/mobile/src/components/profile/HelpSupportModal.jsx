import React from "react";
import { View, Text, Modal, TouchableOpacity, ScrollView, StyleSheet, Linking } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X } from "lucide-react-native";
import { colors } from "@/constants/colors";

const SectionTitle = ({ children }) => (
  <Text style={styles.sectionTitle}>{children}</Text>
);

const Paragraph = ({ children }) => (
  <Text style={styles.paragraph}>{children}</Text>
);

export default function HelpSupportModal({ visible, onClose }) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.title}>Help & Support</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* 1. FAQ */}
          <SectionTitle>1. FAQ</SectionTitle>
          <Text style={styles.subheading}>Account & Login</Text>
          <Paragraph>
            Can’t log in or forgot your password? Tap “Forgot Password” on the sign-in page or reach out to us below.
          </Paragraph>
          <Text style={styles.subheading}>Posting & Logging Smokes</Text>
          <Paragraph>
            Tap the “+” button to log your smoke session or add a cigar to your digital humidor. You can edit or delete any of your posts anytime.
          </Paragraph>
          <Text style={styles.subheading}>Notifications</Text>
          <Paragraph>
            Want fewer updates? Go to Settings → Notifications and toggle them off or set to “Only from friends.”
          </Paragraph>
          <Text style={styles.subheading}>Community Etiquette</Text>
          <Paragraph>
            Keep things classy. No hate speech, spam, or cigar sales. Treat the lounge like a real one — respect first, ashtrays second.
          </Paragraph>

          {/* 2. AI Identification Guide */}
          <SectionTitle>2. AI Identification Guide</SectionTitle>
          <Paragraph>
            Our cigar identifier uses OpenAI’s vision model to recognize cigar bands, wrappers, and brands from your photo. For best results:
          </Paragraph>
          <Paragraph>• Use good lighting and a clear angle on the cigar band.</Paragraph>
          <Paragraph>• Avoid cluttered backgrounds.</Paragraph>
          <Paragraph>
            • If the cigar isn’t recognized, try another photo or type the name manually.
          </Paragraph>
          <Paragraph>
            Disclaimer: AI results are suggestions, not guarantees. Always verify before adding to your humidor.
          </Paragraph>

          {/* 3. Map & Location Troubleshooting */}
          <SectionTitle>3. Map & Location Troubleshooting</SectionTitle>
          <Text style={styles.subheading}>The Map Isn’t Loading</Text>
          <Paragraph>• Ensure Location Services are turned on for Stogie.</Paragraph>
          <Paragraph>• Try restarting the app or refreshing the map.</Paragraph>
          <Paragraph>• Check your Wi‑Fi or cellular connection.</Paragraph>
          <Text style={styles.subheading}>Nearby Lounges Aren’t Showing Up</Text>
          <Paragraph>• Zoom out on the map or tap “Search This Area.”</Paragraph>
          <Paragraph>
            • We’re constantly updating lounge data, so if you notice something missing, report it via Suggest a Lounge under Feedback.
          </Paragraph>
          <Text style={styles.subheading}>Location Privacy</Text>
          <Paragraph>
            We only use your location to show lounges near you — it’s never shared publicly without your permission.
          </Paragraph>

          {/* 4. Contact Support */}
          <SectionTitle>4. Contact Support</SectionTitle>
          <Paragraph>
            Need a hand? Email us at <Text style={styles.link} onPress={() => Linking.openURL("mailto:Brennen@invictusreserve.com")}>Brennen@invictusreserve.com</Text>
          </Paragraph>
          <Paragraph>We usually respond within 24–48 hours.</Paragraph>

          {/* 5. Report a Problem */}
          <SectionTitle>5. Report a Problem</SectionTitle>
          <Paragraph>
            Spot something off? From any post or comment, tap the three dots → Report. You can also attach screenshots and send logs directly from Settings → Report a Problem.
          </Paragraph>

          {/* 6. Community Guidelines */}
          <SectionTitle>6. Community Guidelines</SectionTitle>
          <Paragraph>• No buying, selling, or trading cigars.</Paragraph>
          <Paragraph>• Keep discussions civil and cigar-related.</Paragraph>
          <Paragraph>• Respect privacy — no doxxing, harassment, or spam.</Paragraph>
          <Paragraph>Violations may result in suspension or permanent ban.</Paragraph>

          {/* 7. Terms & Privacy */}
          <SectionTitle>7. Terms & Privacy</SectionTitle>
          <Paragraph>
            Read our Terms of Service and Privacy Policy for full details. In short: we protect your data, don’t sell it, and value your trust.
          </Paragraph>

          {/* 8. Give Feedback */}
          <SectionTitle>8. Give Feedback</SectionTitle>
          <Paragraph>
            Got a feature idea or something we can improve? We love hearing from our community — use Send Feedback in settings. Active contributors may earn a “Cigar Aficionado” badge for helpful ideas.
          </Paragraph>

          {/* 9. Version & Updates */}
          <SectionTitle>9. Version & Updates</SectionTitle>
          <Paragraph>Current Version: Stogie v1.0.0</Paragraph>
          <Paragraph>Last Updated: October 2025</Paragraph>
          <Paragraph>Check back here for feature releases and bug fixes.</Paragraph>

          <View style={{ height: insets.bottom + 20 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgPrimary },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
  },
  title: { color: colors.textPrimary, fontSize: 20, fontWeight: "700" },
  closeButton: { padding: 8 },
  content: { paddingHorizontal: 20, paddingVertical: 16 },
  sectionTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: "700", marginTop: 8, marginBottom: 8 },
  subheading: { color: colors.textPrimary, fontSize: 14, fontWeight: "600", marginTop: 8 },
  paragraph: { color: colors.textSecondary, fontSize: 14, lineHeight: 22, marginTop: 4 },
  link: { color: colors.accentGold, textDecorationLine: "underline" },
});


