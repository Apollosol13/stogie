import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { apiRequest } from "../utils/api";

const getInitialFormState = (review) => ({
  rating: review?.rating || 0,
  title: review?.title || "",
  reviewText: review?.review_text || "",
  smokeDate: review?.smoke_date || new Date().toISOString().split("T")[0],
  smokeDuration: review?.smoke_duration?.toString() || "",
  pairing: review?.pairing || "",
  environment: review?.environment || "",
  flavorNotes: review?.flavor_notes || [],
  constructionRating: review?.construction_rating || 0,
  drawRating: review?.draw_rating || 0,
  burnRating: review?.burn_rating || 0,
  flavorRating: review?.flavor_rating || 0,
  wouldSmokeAgain: review?.would_smoke_again,
  wouldRecommend: review?.would_recommend,
});

export function useReviewForm(userReview, cigarId, user, onSuccess) {
  const [reviewForm, setReviewForm] = useState(getInitialFormState(userReview));
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    setReviewForm(getInitialFormState(userReview));
  }, [userReview]);

  const toggleFlavorNote = (note) => {
    setReviewForm((prev) => ({
      ...prev,
      flavorNotes: prev.flavorNotes.includes(note)
        ? prev.flavorNotes.filter((n) => n !== note)
        : [...prev.flavorNotes, note],
    }));
  };

  const handleSubmitReview = async () => {
    if (!user) {
      Alert.alert(
        "Authentication Required",
        "Please sign in to review cigars.",
      );
      return;
    }
    if (reviewForm.rating < 1) {
      Alert.alert(
        "Rating Required",
        "Please provide a rating before submitting.",
      );
      return;
    }

    setIsSubmittingReview(true);
    try {
      const payload = {
        ...reviewForm,
        cigarId,
        smokeDuration: reviewForm.smokeDuration
          ? parseInt(reviewForm.smokeDuration)
          : null,
        // Ensure rating values are either null or between 1-5 for database constraints
        constructionRating:
          reviewForm.constructionRating > 0
            ? reviewForm.constructionRating
            : null,
        drawRating: reviewForm.drawRating > 0 ? reviewForm.drawRating : null,
        burnRating: reviewForm.burnRating > 0 ? reviewForm.burnRating : null,
        flavorRating:
          reviewForm.flavorRating > 0 ? reviewForm.flavorRating : null,
      };

      console.log("Submitting review payload:", payload);

      const response = await apiRequest("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log("Review API response:", data);

      if (data.success) {
        Alert.alert(
          "Success!",
          data.message || "Review submitted successfully!",
          [{ text: "OK", onPress: onSuccess }],
        );
      } else {
        console.error("Review submission failed:", data.error);
        Alert.alert("Error", data.error || "Failed to submit review");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      Alert.alert("Error", `Network error: ${error.message}`);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return {
    reviewForm,
    setReviewForm,
    isSubmittingReview,
    toggleFlavorNote,
    handleSubmitReview,
  };
}
