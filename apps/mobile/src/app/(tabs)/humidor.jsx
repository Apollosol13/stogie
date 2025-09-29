import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Search,
  Filter,
  Grid3X3,
  List,
  Plus,
  Edit3,
  Calendar,
  TrendingUp,
  Package,
  Star,
  MoreVertical,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import useHumidor from "../../hooks/useHumidor";
import useUser from "../../utils/auth/useUser";
import AuthPrompt from "../../components/auth/AuthPrompt";

// Black color palette
const colors = {
  bgPrimary: "#0F0F0F",
  surface: "#1A1A1A",
  surface2: "#242424",
  textPrimary: "#FFFFFF",
  textSecondary: "#B0B0B0",
  textTertiary: "#6B7280",
  accentGold: "#D4B896",
  accentGreen: "#68D391",
  accentRed: "#F56565",
  strengthMild: "#68D391",
  strengthMedium: "#F59E0B",
  strengthFull: "#F56565",
  divider: "rgba(255, 255, 255, 0.1)",
};

const tabs = [
  { key: "owned", label: "OWNED", color: colors.accentGreen },
  { key: "smoked", label: "SMOKED", color: colors.accentGold },
  { key: "wishlist", label: "WISHLIST", color: colors.accentRed },
];

export default function HumidorScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data: user, loading: userLoading } = useUser();
  const { humidorData, loading, error, addToHumidor, deleteEntry, refetch } =
    useHumidor();

  const [activeTab, setActiveTab] = useState("owned");
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [searchQuery, setSearchQuery] = useState("");
  const [showStats, setShowStats] = useState(true);

  const getStrengthColor = (strength) => {
    switch (strength) {
      case "MILD":
        return colors.strengthMild;
      case "MEDIUM":
        return colors.strengthMedium;
      case "FULL":
        return colors.strengthFull;
      default:
        return colors.textSecondary;
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={12}
        color={i < rating ? colors.accentGold : colors.textTertiary}
        fill={i < rating ? colors.accentGold : "transparent"}
      />
    ));
  };

  const getStats = () => {
    if (!humidorData || !humidorData.stats) {
      return {
        totalOwned: 0,
        totalSmoked: 0,
        totalValue: 0,
        avgRating: 0,
      };
    }

    const { owned, smoked } = humidorData;
    const totalOwned = owned.reduce((sum, cigar) => sum + cigar.quantity, 0);
    const totalSmoked = smoked.length;
    const totalValue = owned.reduce(
      (sum, cigar) => sum + cigar.pricePaid * cigar.quantity,
      0,
    );
    const avgRating =
      smoked.length > 0
        ? smoked.reduce((sum, cigar) => sum + (cigar.rating || 0), 0) /
          smoked.length
        : 0;

    return {
      totalOwned,
      totalSmoked,
      totalValue,
      avgRating,
    };
  };

  const handleDeleteEntry = (item) => {
    Alert.alert(
      "Remove from Humidor",
      `Are you sure you want to remove ${item.brand} ${item.line} from your humidor?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => deleteEntry(item.id),
        },
      ],
    );
  };

  const stats = getStats();

  // Show auth prompt if not logged in
  if (userLoading) {
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

  if (!user) {
    return <AuthPrompt />;
  }

  // Show error state
  if (error) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.bgPrimary,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <StatusBar style="light" />
        <Text
          style={{
            color: colors.textPrimary,
            fontSize: 18,
            fontWeight: "600",
            marginBottom: 16,
            textAlign: "center",
          }}
        >
          Failed to load your humidor
        </Text>
        <Text
          style={{
            color: colors.textSecondary,
            fontSize: 14,
            marginBottom: 24,
            textAlign: "center",
          }}
        >
          {error.message || "Something went wrong"}
        </Text>
        <TouchableOpacity
          onPress={refetch}
          style={{
            backgroundColor: colors.accentGold,
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 8,
          }}
        >
          <Text
            style={{ color: colors.bgPrimary, fontSize: 16, fontWeight: "600" }}
          >
            Try Again
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const HumidorCard = ({ item, viewMode = "grid" }) => {
    const isGrid = viewMode === "grid";

    const handleCardPress = () => {
      // Navigate to cigar detail screen
      if (item.cigar_id || item.id) {
        const cigarId = item.cigar_id || item.id;
        router.push(`/cigar/${cigarId}`);
      }
    };

    return (
      <TouchableOpacity
        style={{
          backgroundColor: colors.surface,
          borderRadius: 16,
          padding: 16,
          marginBottom: 16,
          marginHorizontal: isGrid ? 4 : 0,
          flex: isGrid ? 1 : undefined,
          borderWidth: 1,
          borderColor: "rgba(255, 255, 255, 0.05)",
        }}
        onPress={handleCardPress}
        onLongPress={() => handleDeleteEntry(item)}
      >
        {/* Image */}
        <Image
          source={{ uri: item.image }}
          style={{
            width: "100%",
            height: isGrid ? 80 : 60,
            borderRadius: 8,
            marginBottom: 12,
          }}
        />

        {/* Content */}
        <View style={{ flex: 1 }}>
          {/* Brand & Line */}
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: isGrid ? 14 : 16,
              fontWeight: "600",
              marginBottom: 4,
            }}
            numberOfLines={isGrid ? 2 : 1}
          >
            {item.brand} {item.line}
          </Text>

          {/* Vitola & Wrapper */}
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: isGrid ? 12 : 14,
              marginBottom: 8,
            }}
            numberOfLines={1}
          >
            {item.vitola} • {item.wrapper}
          </Text>

          {/* Strength & Details */}
          <View
            style={{
              flexDirection: isGrid ? "column" : "row",
              alignItems: isGrid ? "flex-start" : "center",
              marginBottom: 8,
            }}
          >
            {/* Strength Pill */}
            <View
              style={{
                backgroundColor: getStrengthColor(item.strength) + "20",
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 6,
                marginBottom: isGrid ? 6 : 0,
                marginRight: isGrid ? 0 : 12,
                alignSelf: "flex-start",
              }}
            >
              <Text
                style={{
                  color: getStrengthColor(item.strength),
                  fontSize: 10,
                  fontWeight: "600",
                }}
              >
                {item.strength}
              </Text>
            </View>

            {/* Quantity/Rating */}
            {item.quantity ? (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Package size={12} color={colors.textTertiary} />
                <Text
                  style={{
                    color: colors.textTertiary,
                    fontSize: 12,
                    marginLeft: 4,
                    fontWeight: "600",
                  }}
                >
                  {item.quantity}
                </Text>
              </View>
            ) : (
              item.rating && (
                <View style={{ flexDirection: "row" }}>
                  {renderStars(item.rating)}
                </View>
              )
            )}
          </View>

          {/* Price/Date */}
          <Text
            style={{
              color: colors.textTertiary,
              fontSize: 11,
              marginBottom: 4,
            }}
          >
            {item.pricePaid > 0 && `$${item.pricePaid.toFixed(2)}`}
            {item.estimatedPrice && `~$${item.estimatedPrice.toFixed(2)}`}
            {item.acquiredDate &&
              ` • ${new Date(item.acquiredDate).toLocaleDateString()}`}
            {item.smokingDate &&
              ` • ${new Date(item.smokingDate).toLocaleDateString()}`}
          </Text>

          {/* Notes */}
          {item.notes && (
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 11,
                fontStyle: "italic",
                marginTop: 4,
              }}
              numberOfLines={isGrid ? 2 : 1}
            >
              "{item.notes}"
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const StatsWidget = () => (
    <View
      style={{
        backgroundColor: colors.surface,
        margin: 20,
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.05)",
      }}
    >
      <Text
        style={{
          color: colors.textPrimary,
          fontSize: 16,
          fontWeight: "600",
          marginBottom: 16,
        }}
      >
        Collection Stats
      </Text>

      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <View style={{ alignItems: "center" }}>
          <Text
            style={{
              color: colors.accentGreen,
              fontSize: 20,
              fontWeight: "700",
            }}
          >
            {stats.totalOwned}
          </Text>
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 12,
              marginTop: 2,
            }}
          >
            OWNED
          </Text>
        </View>

        <View style={{ alignItems: "center" }}>
          <Text
            style={{
              color: colors.accentGold,
              fontSize: 20,
              fontWeight: "700",
            }}
          >
            {stats.totalSmoked}
          </Text>
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 12,
              marginTop: 2,
            }}
          >
            SMOKED
          </Text>
        </View>

        <View style={{ alignItems: "center" }}>
          <Text
            style={{
              color: colors.accentGold,
              fontSize: 20,
              fontWeight: "700",
            }}
          >
            ${stats.totalValue.toFixed(0)}
          </Text>
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 12,
              marginTop: 2,
            }}
          >
            VALUE
          </Text>
        </View>

        <View style={{ alignItems: "center" }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Star
              size={16}
              color={colors.accentGold}
              fill={colors.accentGold}
            />
            <Text
              style={{
                color: colors.accentGold,
                fontSize: 20,
                fontWeight: "700",
                marginLeft: 2,
              }}
            >
              {stats.avgRating.toFixed(1)}
            </Text>
          </View>
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 12,
              marginTop: 2,
            }}
          >
            AVG RATING
          </Text>
        </View>
      </View>
    </View>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={colors.accentGold} />
          <Text
            style={{ color: colors.textSecondary, fontSize: 16, marginTop: 16 }}
          >
            Loading your collection...
          </Text>
        </View>
      );
    }

    const data = humidorData[activeTab] || [];

    // Filter by search query if provided
    const filteredData = searchQuery
      ? data.filter(
          (item) =>
            item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.line.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.vitola.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      : data;

    if (filteredData.length === 0) {
      return (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 40,
          }}
        >
          <Package size={48} color={colors.textTertiary} />
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: 18,
              fontWeight: "600",
              marginTop: 16,
              marginBottom: 8,
            }}
          >
            {searchQuery ? "No matches found" : "No cigars yet"}
          </Text>
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 14,
              textAlign: "center",
              marginBottom: 24,
            }}
          >
            {searchQuery
              ? "Try adjusting your search terms"
              : activeTab === "owned"
                ? "Start adding cigars to your collection"
                : activeTab === "wishlist"
                  ? "Add cigars you want to try someday"
                  : "No smoking sessions recorded yet"}
          </Text>
          {!searchQuery && (
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/scan")}
              style={{
                backgroundColor: colors.accentGold,
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: 8,
              }}
            >
              <Text
                style={{
                  color: colors.bgPrimary,
                  fontSize: 16,
                  fontWeight: "600",
                }}
              >
                {activeTab === "owned"
                  ? "Add Cigar"
                  : activeTab === "wishlist"
                    ? "Add to Wishlist"
                    : "Record Session"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }

    if (viewMode === "grid") {
      return (
        <FlatList
          data={filteredData}
          numColumns={2}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <HumidorCard item={item} viewMode="grid" />}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        />
      );
    }

    return (
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
      >
        {filteredData.map((item) => (
          <HumidorCard key={item.id} item={item} viewMode="list" />
        ))}
      </ScrollView>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      <StatusBar style="light" />

      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 20,
          paddingBottom: 16,
          borderBottomWidth: 1,
          borderBottomColor: colors.divider,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: 28,
              fontWeight: "700",
              letterSpacing: -0.5,
            }}
          >
            Humidor
          </Text>

          <View style={{ flexDirection: "row", gap: 8 }}>
            <TouchableOpacity
              onPress={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: colors.surface,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {viewMode === "grid" ? (
                <List size={22} color={colors.textSecondary} />
              ) : (
                <Grid3X3 size={22} color={colors.textSecondary} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/(tabs)/scan")}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: colors.accentGold,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Plus size={22} color={colors.bgPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 12,
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            height: 48,
          }}
        >
          <Search size={20} color={colors.textTertiary} />
          <TextInput
            placeholder="Search your collection..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{
              flex: 1,
              marginLeft: 12,
              fontSize: 16,
              color: colors.textPrimary,
            }}
          />
          <TouchableOpacity>
            <Filter size={20} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View
        style={{
          flexDirection: "row",
          marginTop: 16,
          marginHorizontal: 20,
        }}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            style={{
              flex: 1,
              paddingVertical: 12,
              alignItems: "center",
              borderBottomWidth: 3,
              borderBottomColor:
                activeTab === tab.key ? tab.color : "transparent",
            }}
          >
            <Text
              style={{
                color: activeTab === tab.key ? tab.color : colors.textSecondary,
                fontSize: 14,
                fontWeight: "600",
                letterSpacing: 0.5,
              }}
            >
              {tab.label}
            </Text>
            <Text
              style={{
                color: colors.textTertiary,
                fontSize: 12,
                marginTop: 2,
              }}
            >
              {humidorData[tab.key]?.length || 0}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Stats Widget */}
      {activeTab === "owned" && showStats && <StatsWidget />}

      {/* Content */}
      <View style={{ flex: 1, marginTop: 16 }}>{renderContent()}</View>
    </View>
  );
}