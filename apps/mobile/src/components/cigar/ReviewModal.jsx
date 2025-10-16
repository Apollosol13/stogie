import React from "react";
import { Modal, View, ScrollView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { useUser } from "@/utils/auth/useUser";
import { useReviewForm } from "@/hooks/useReviewForm";
import { colors } from "@/components/cigar/colors";
import { ReviewModalHeader } from "./review/ReviewModalHeader";
import { ReviewForm } from "./review/ReviewForm";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";

export function ReviewModal({ visible, onClose, userReview, onSuccess }) {
  const insets = useSafeAreaInsets();
  const { id: cigarId } = useLocalSearchParams();
  const { data: user } = useUser();

  const handleSuccess = () => {
    onClose();
    onSuccess();
  };

  const {
    reviewForm,
    setReviewForm,
    isSubmittingReview,
    handleSubmitReview,
  } = useReviewForm(userReview, cigarId, user, handleSuccess);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingAnimatedView
        style={{ flex: 1, backgroundColor: colors.bgPrimary }}
        behavior="padding"
      >
        <StatusBar style="light" />
        <ReviewModalHeader
          isEdit={!!userReview}
          isSubmitting={isSubmittingReview}
          onClose={onClose}
          onSubmit={handleSubmitReview}
        />
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            padding: 20,
            paddingBottom: insets.bottom + 20,
          }}
          showsVerticalScrollIndicator={false}
        >
          <ReviewForm
            form={reviewForm}
            onFormChange={setReviewForm}
          />
        </ScrollView>
      </KeyboardAvoidingAnimatedView>
    </Modal>
  );
}
