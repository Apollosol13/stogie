import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Image,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/utils/auth/useAuth";
import {
  Search,
  Heart,
  MessageCircle,
  Share,
  Bookmark,
  MapPin,
  Star,
} from "lucide-react-native";

const colors = {
  bgPrimary: "#0F0F0F",
  surface: "#1A1A1A",
  textPrimary: "#FFFFFF",
  textSecondary: "#B0B0B0",
  accentGold: "#D4B896",
  buttonOutline: "rgba(212, 184, 150, 0.3)",
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { isAuthenticated, isReady, signIn } = useAuth();
  const [activeTab, setActiveTab] = useState("Following");

  // Show loading state while auth is initializing
  if (!isReady) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.bgPrimary,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color={colors.accentGold} />
      </View>
    );
  }

  // Show the clean welcome screen for unauthenticated users
  if (!isAuthenticated) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
        <StatusBar style="light" />

        {/* Header */}
        <View
          style={{
            paddingTop: insets.top + 20,
            paddingHorizontal: 20,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 60,
          }}
        >
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: 24,
              fontWeight: "700",
            }}
          >
            Aficionado
          </Text>

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity
              onPress={() => signIn()}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                marginRight: 8,
              }}
            >
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: 16,
                  fontWeight: "500",
                }}
              >
                Sign In
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => signIn()}
              style={{
                backgroundColor: colors.accentGold,
                paddingHorizontal: 20,
                paddingVertical: 8,
                borderRadius: 20,
              }}
            >
              <Text
                style={{
                  color: colors.bgPrimary,
                  fontSize: 16,
                  fontWeight: "600",
                }}
              >
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Content */}
        <View
          style={{
            flex: 1,
            paddingHorizontal: 20,
            justifyContent: "center",
            marginTop: -100,
          }}
        >
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: 48,
              fontWeight: "700",
              lineHeight: 56,
              textAlign: "center",
              marginBottom: 24,
            }}
          >
            Track Your Cigar Journey
          </Text>

          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 18,
              lineHeight: 28,
              textAlign: "center",
              marginBottom: 60,
              paddingHorizontal: 20,
            }}
          >
            Discover new cigars, manage your humidor, connect with fellow
            enthusiasts, and never forget a great smoke again.
          </Text>

          {/* Action Buttons */}
          <View style={{ alignItems: "center" }}>
            <TouchableOpacity
              onPress={() => signIn()}
              style={{
                backgroundColor: colors.accentGold,
                paddingHorizontal: 48,
                paddingVertical: 16,
                borderRadius: 24,
                marginBottom: 16,
                minWidth: 200,
              }}
            >
              <Text
                style={{
                  color: colors.bgPrimary,
                  fontSize: 18,
                  fontWeight: "600",
                  textAlign: "center",
                }}
              >
                Get Started Free
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => signIn()}
              style={{
                borderWidth: 1,
                borderColor: colors.buttonOutline,
                paddingHorizontal: 48,
                paddingVertical: 16,
                borderRadius: 24,
                minWidth: 200,
              }}
            >
              <Text
                style={{
                  color: colors.accentGold,
                  fontSize: 18,
                  fontWeight: "600",
                  textAlign: "center",
                }}
              >
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Section */}
        <View
          style={{
            paddingHorizontal: 20,
            paddingBottom: insets.bottom + 40,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: 24,
              fontWeight: "600",
              textAlign: "center",
            }}
          >
            Popular Cigars in Our Database
          </Text>
        </View>
      </View>
    );
  }

  // Show authenticated social feed
  return (
    <View style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      <StatusBar style="light" />

      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 20,
          paddingVertical: 16,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottomWidth: 1,
          borderBottomColor: "rgba(255, 255, 255, 0.1)",
        }}
      >
        <Text
          style={{
            color: colors.textPrimary,
            fontSize: 28,
            fontWeight: "700",
          }}
        >
          Aficionado
        </Text>

        <TouchableOpacity>
          <Search size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Tab Pills */}
      <View
        style={{
          flexDirection: "row",
          paddingHorizontal: 20,
          paddingVertical: 16,
          gap: 16,
        }}
      >
        {["Following", "Nearby", "Trending"].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={{
              backgroundColor:
                activeTab === tab ? colors.accentGold : "transparent",
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 20,
            }}
          >
            <Text
              style={{
                color:
                  activeTab === tab ? colors.bgPrimary : colors.textSecondary,
                fontSize: 16,
                fontWeight: "600",
              }}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Feed */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 20,
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ alignItems: "center", paddingHorizontal: 40 }}>
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 18,
              textAlign: "center",
              lineHeight: 26,
            }}
          >
            No posts yet. Follow some users to see their reviews and cigar
            experiences!
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
