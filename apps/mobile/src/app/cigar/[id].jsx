import React, { useState } from "react";
import { View, ScrollView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import useUser from "@/utils/auth/useUser";
import { useCigarData } from "@/hooks/useCigarData";

import { colors } from "@/components/cigar/colors";
import LoadingState from "@/components/cigar/LoadingState";
import { NotFoundState } from "@/components/cigar/NotFoundState";
import { CigarDetailHeader } from "@/components/cigar/CigarDetailHeader";
import { CigarInfo } from "@/components/cigar/CigarInfo";
import { MyReview } from "@/components/cigar/MyReview";
import { CommunityReviewsList } from "@/components/cigar/CommunityReviewsList";
import { ReviewModal } from "@/components/cigar/ReviewModal";

export default function CigarDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const { data: user } = useUser();
  const {
    cigar,
    reviews,
    userReview,
    loading,
    fetchCigarDetails,
    fetchReviews,
  } = useCigarData(id);

  const [showReviewModal, setShowReviewModal] = useState(false);

  const handleReviewSuccess = () => {
    fetchReviews();
    fetchCigarDetails();
  };

  if (loading) {
    return <LoadingState />;
  }

  if (!cigar) {
    return <NotFoundState />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      <StatusBar style="light" />
      <CigarDetailHeader onWriteReview={() => setShowReviewModal(true)} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        <CigarInfo cigar={cigar} />
        {user && (
          <MyReview
            userReview={userReview}
            onWriteReview={() => setShowReviewModal(true)}
          />
        )}
        <CommunityReviewsList reviews={reviews} />
      </ScrollView>

      <ReviewModal
        visible={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        userReview={userReview}
        onSuccess={handleReviewSuccess}
      />
    </View>
  );
}
