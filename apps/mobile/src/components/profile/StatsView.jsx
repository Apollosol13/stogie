import React from "react";
import { View } from "react-native";
import StatCard from "./StatCard";
import { TrendingUp, Star, Users, Archive } from "lucide-react-native";
import { colors } from "../../constants/colors";

export default function StatsView({ analytics }) {
  const getStatValue = (key, fallback = 0) => {
    if (!analytics) return fallback;
    switch (key) {
      case "totalSmoked":
        return analytics.sessionStats?.total_sessions || fallback;
      case "avgRating":
        return analytics.reviewStats?.avg_rating_given
          ? analytics.reviewStats.avg_rating_given.toFixed(1)
          : fallback.toFixed(1);
      case "followers":
        return 0; // TODO: implement following system
      case "humidorValue":
        return analytics.userStats?.total_spent
          ? `$${Math.round(analytics.userStats.total_spent)}`
          : `$${fallback}`;
      default:
        return fallback;
    }
  };

  return (
    <View
      style={{
        flexDirection: "row",
        paddingHorizontal: 16,
        marginBottom: 24,
      }}
    >
      <StatCard
        icon={<TrendingUp size={20} color={colors.accentGold} />}
        value={getStatValue("totalSmoked")}
        label="SMOKED"
      />
      <StatCard
        icon={<Star size={20} color={colors.accentGold} />}
        value={getStatValue("avgRating")}
        label="AVG RATING"
      />
      <StatCard
        icon={<Users size={20} color={colors.accentBlue} />}
        value={getStatValue("followers")}
        label="FOLLOWERS"
        color={colors.accentBlue}
      />
      <StatCard
        icon={<Archive size={20} color={colors.accentGreen} />}
        value={getStatValue("humidorValue")}
        label="COLLECTION"
        color={colors.accentGreen}
      />
    </View>
  );
}
