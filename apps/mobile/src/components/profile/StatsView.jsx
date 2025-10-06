import React from "react";
import { View } from "react-native";
import StatCard from "./StatCard";
import { 
  TrendingUp, 
  Star, 
  Users, 
  UserPlus, 
  Globe, 
  Calendar,
  BarChart3,
  Clock
} from "lucide-react-native";
import { colors } from "../../constants/colors";

export default function StatsView({ analytics }) {
  const getStatValue = (key, fallback = 0) => {
    if (!analytics) return fallback;
    switch (key) {
      case "totalSmoked":
        return analytics.sessionStats?.total_sessions || fallback;
      case "avgRating":
        return analytics.reviewStats?.avg_rating_given
          ? analytics.reviewStats.avg_rating_given.toFixed(2)
          : fallback.toFixed(2);
      case "followers":
        return analytics.userStats?.followers || 0;
      case "following":
        return analytics.userStats?.following || 0;
      case "countries":
        return analytics.locationStats?.countries_visited || fallback;
      case "cigarsPerDay":
        return analytics.frequencyStats?.cigars_per_day
          ? analytics.frequencyStats.cigars_per_day.toFixed(2)
          : fallback.toFixed(2);
      case "cigarsPerWeek":
        return analytics.frequencyStats?.cigars_per_week
          ? analytics.frequencyStats.cigars_per_week.toFixed(1)
          : fallback.toFixed(1);
      case "cigarsPerMonth":
        return analytics.frequencyStats?.cigars_per_month
          ? Math.round(analytics.frequencyStats.cigars_per_month)
          : fallback;
      default:
        return fallback;
    }
  };

  return (
    <View
      style={{
        paddingHorizontal: 20,
        marginBottom: 24,
      }}
    >
      {/* First Row */}
      <View
        style={{
          flexDirection: "row",
          marginBottom: 12,
        }}
      >
        <StatCard
          icon={<TrendingUp size={20} color={colors.accentGold} />}
          value={getStatValue("totalSmoked")}
          label="Smoked"
          color={colors.accentGold}
        />
        <StatCard
          icon={<Users size={20} color={colors.accentGreen} />}
          value={getStatValue("following")}
          label="Following"
          color={colors.accentGreen}
        />
        <StatCard
          icon={<UserPlus size={20} color={colors.accentBlue} />}
          value={getStatValue("followers")}
          label="Followers"
          color={colors.accentBlue}
        />
        <StatCard
          icon={<Globe size={20} color={colors.textSecondary} />}
          value={getStatValue("countries")}
          label="Locations"
          color={colors.textSecondary}
        />
      </View>

      {/* Second Row */}
      <View
        style={{
          flexDirection: "row",
        }}
      >
        <StatCard
          icon={<Star size={20} color={colors.accentGold} />}
          value={getStatValue("avgRating")}
          label="Avg. Rating"
          color={colors.accentGold}
        />
        <StatCard
          icon={<Calendar size={20} color={colors.accentRed} />}
          value={getStatValue("cigarsPerDay")}
          label="Cigars/ Day"
          color={colors.accentRed}
        />
        <StatCard
          icon={<BarChart3 size={20} color={colors.accentBlue} />}
          value={getStatValue("cigarsPerWeek")}
          label="Cigars/ Week"
          color={colors.accentBlue}
        />
        <StatCard
          icon={<Clock size={20} color={colors.textSecondary} />}
          value={getStatValue("cigarsPerMonth")}
          label="Cigars/ Month"
          color={colors.textSecondary}
        />
      </View>
    </View>
  );
}
