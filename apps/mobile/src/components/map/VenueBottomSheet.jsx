import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Navigation, Cigarette, X, Plus } from "lucide-react-native";
import { colors } from "@/components/map/colors";
import StarRating from "@/components/common/StarRating";

const { height } = Dimensions.get("window");

const VenueBottomSheet = ({ venue, isVisible, onClose, onCheckIn, user }) => {
  const insets = useSafeAreaInsets();
  if (!venue) return null;

  const isShop = venue.type === "shop" || venue.type === "lounge";
  const data = venue.data;

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, justifyContent: "flex-end" }}>
        <TouchableOpacity
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: colors.overlay,
          }}
          onPress={onClose}
          activeOpacity={1}
        />

        <View
          style={{
            backgroundColor: colors.surface,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            maxHeight: height * 0.8,
            paddingBottom: insets.bottom,
          }}
        >
          <View
            style={{
              width: 40,
              height: 4,
              backgroundColor: colors.textTertiary,
              alignSelf: "center",
              marginTop: 12,
              borderRadius: 2,
            }}
          />

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              padding: 20,
              paddingBottom: 0,
            }}
          >
            <View style={{ flex: 1 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 4,
                }}
              >
                <Text style={{ fontSize: 24, marginRight: 8 }}>
                  {isShop ? (venue.type === "lounge" ? "🏛️" : "🏪") : "🚬"}
                </Text>
                <Text
                  style={{
                    color: colors.textPrimary,
                    fontSize: 20,
                    fontWeight: "700",
                    flex: 1,
                  }}
                  numberOfLines={1}
                >
                  {venue.title}
                </Text>
              </View>

              {isShop && data.averageRating > 0 && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <StarRating
                    rating={data.averageRating}
                    color={colors.accentGold}
                    inactiveColor={colors.textTertiary}
                  />
                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontSize: 14,
                      marginLeft: 8,
                    }}
                  >
                    {`${data.averageRating.toFixed(1)} • ${
                      data.totalReviews
                    } reviews`}
                  </Text>
                </View>
              )}

              <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
                {venue.description}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={{ maxHeight: height * 0.5 }}
            showsVerticalScrollIndicator={false}
          >
            {isShop ? (
              <ShopDetails data={data} />
            ) : (
              <SessionDetails data={data} />
            )}
            <Actions onCheckIn={() => onCheckIn(venue.coordinate)} user={user} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const ShopDetails = ({ data }) => (
  <View style={{ padding: 20 }}>
    <Text style={styles.sectionTitle}>Features</Text>
    <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
      {data.hasLounge && <FeatureTag label="Lounge" />}
      {data.hasHumidor && <FeatureTag label="Humidor" />}
      {data.allowsSmoking && <FeatureTag label="Smoking Allowed" />}
    </View>
  </View>
);

const SessionDetails = ({ data }) => (
  <View style={{ padding: 20 }}>
    <Text style={styles.sectionTitle}>Session Details</Text>
    {data.cigar && (
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
        <Cigarette size={16} color={colors.accentGold} />
        <Text style={{ color: colors.textPrimary, fontSize: 14, marginLeft: 8 }}>
          {`${data.cigar.brand} ${data.cigar.line}`}
        </Text>
      </View>
    )}
    {data.pairing && (
      <Text style={{ color: colors.textSecondary, fontSize: 14, marginBottom: 4 }}>
        {`Paired with: ${data.pairing}`}
      </Text>
    )}
    {data.notes && (
      <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 8 }}>
        {data.notes}
      </Text>
    )}
  </View>
);

const FeatureTag = ({ label }) => (
  <View
    style={{
      backgroundColor: colors.surface2,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      marginRight: 8,
      marginBottom: 8,
    }}
  >
    <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{label}</Text>
  </View>
);

const Actions = ({ onCheckIn, user }) => (
  <View
    style={{
      flexDirection: "row",
      paddingHorizontal: 20,
      paddingBottom: 20,
      gap: 12,
    }}
  >
    <TouchableOpacity style={styles.actionButton}>
      <Navigation size={20} color={colors.textPrimary} />
      <Text style={styles.actionButtonText}>Directions</Text>
    </TouchableOpacity>

    {user && (
      <TouchableOpacity
        onPress={onCheckIn}
        style={[styles.actionButton, { backgroundColor: colors.accentGold }]}
      >
        <Plus size={20} color={colors.bgPrimary} />
        <Text style={[styles.actionButtonText, { color: colors.bgPrimary }]}>
          Check In
        </Text>
      </TouchableOpacity>
    )}
  </View>
);

const styles = {
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.surface2,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
};

export default VenueBottomSheet;
