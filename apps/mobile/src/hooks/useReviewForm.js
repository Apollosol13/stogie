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
  flavorNotes: review?.flavor_notes || "", // Changed from [] to ""
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
      // Map frontend field names to backend field names
      const payload = {
        cigarId,
        rating: reviewForm.rating,
        title: reviewForm.title || null,
        content: reviewForm.reviewText || null, // backend expects 'content' not 'reviewText'
        flavorNotes: reviewForm.flavorNotes || null,
        smokingDuration: reviewForm.smokeDuration ? parseInt(reviewForm.smokeDuration) : null,
        smokingDate: reviewForm.smokeDate || null, // backend expects 'smokingDate' 
        location: reviewForm.environment || null, // backend expects 'location' not 'environment'
        // Additional ratings (if backend supports them)
        constructionRating: reviewForm.constructionRating > 0 ? reviewForm.constructionRating : null,
        drawRating: reviewForm.drawRating > 0 ? reviewForm.drawRating : null,
        burnRating: reviewForm.burnRating > 0 ? reviewForm.burnRating : null,
        flavorRating: reviewForm.flavorRating > 0 ? reviewForm.flavorRating : null,
        pairing: reviewForm.pairing || null,
        wouldSmokeAgain: reviewForm.wouldSmokeAgain,
        wouldRecommend: reviewForm.wouldRecommend,
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
    handleSubmitReview,
  };
}
