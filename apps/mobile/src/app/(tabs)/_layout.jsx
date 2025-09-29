import { Tabs } from "expo-router";
import { View, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MapPin, Camera, Archive, User } from "lucide-react-native";
import CigarIcon from "../../components/icons/CigarIcon";

// Black color palette
const colors = {
  bgPrimary: "#0F0F0F",
  surface: "#1A1A1A",
  accentGold: "#D4B896",
  textSecondary: "#B0B0B0",
  textTertiary: "#6B7280",
};

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: "rgba(255, 255, 255, 0.08)",
          height: 90 + insets.bottom,
          paddingBottom: insets.bottom + 16,
          paddingTop: 16,
          paddingHorizontal: 20,
        },
        tabBarActiveTintColor: colors.accentGold,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarLabelStyle: {
          fontFamily: "Inter_600SemiBold",
          fontSize: 11,
          marginTop: 4,
          letterSpacing: 0.5,
        },
        tabBarIconStyle: {
          marginBottom: 2,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "FEED",
          tabBarIcon: ({ color, focused }) => (
            <CigarIcon size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: "MAP",
          tabBarIcon: ({ color, focused }) => (
            <MapPin size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: "IDENTIFY",
          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: colors.accentGold,
                justifyContent: "center",
                alignItems: "center",
                marginTop: -32,
                shadowColor: colors.accentGold,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 12,
                elevation: 8,
              }}
            >
              <Camera size={26} color="#0F0F0F" strokeWidth={2.5} />
            </View>
          ),
          tabBarLabelStyle: {
            fontFamily: "Inter_600SemiBold",
            fontSize: 11,
            marginTop: 4,
            letterSpacing: 0.5,
          },
        }}
      />
      <Tabs.Screen
        name="humidor"
        options={{
          title: "HUMIDOR",
          tabBarIcon: ({ color, focused }) => (
            <Archive size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "ACCOUNT",
          tabBarIcon: ({ color, focused }) => (
            <User size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
    </Tabs>
  );
}