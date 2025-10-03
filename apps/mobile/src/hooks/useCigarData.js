import { useState, useEffect } from "react";
import { Alert } from "react-native";
import useUser from "@/utils/auth/useUser";
import { apiRequest } from "../utils/api";

export function useCigarData(id) {
  const { data: user } = useUser();
  const [cigar, setCigar] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [userReview, setUserReview] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCigarDetails = async () => {
    setLoading(true);
    try {
      const response = await apiRequest(`/api/cigars?id=${id}`);
      const data = await response.json();

      if (response.ok && data.success && data.cigars && data.cigars.length > 0) {
        setCigar(data.cigars[0]);
      } else {
        console.warn(`Cigar with ID ${id} not found in cigars table`);
        const fallbackCigar = {
          id: id,
          brand: "Unknown Brand",
          line: "",
          vitola: "Unknown",
          strength: "medium",
          wrapper: "Unknown",
          image_url: "https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?w=400&h=300&fit=crop",
          description: `Cigar with ID ${id} - details not available`,
          average_rating: 0,
          total_reviews: 0,
        };
        setCigar(fallbackCigar);
        Alert.alert(
          "Cigar Details",
          "This cigar's details are limited. You can still add a review to help build our database!",
          [{ text: "OK" }],
        );
      }
    } catch (error) {
      console.error("Error fetching cigar:", error);
      const minimalCigar = {
        id: id,
        brand: "Unknown",
        line: "",
        vitola: "Unknown",
        strength: "medium",
        wrapper: "Unknown",
        image_url: "https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?w=400&h=300&fit=crop",
        description: "Cigar details unavailable",
        average_rating: 0,
        total_reviews: 0,
      };
      setCigar(minimalCigar);
      Alert.alert(
        "Connection Error",
        "Unable to load cigar details, but you can still add reviews.",
        [{ text: "OK" }],
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await apiRequest(`/api/reviews?cigarId=${id}`);
      const data = await response.json();

      if (response.ok && data.success) {
        const fetchedReviews = data.reviews || [];
        setReviews(fetchedReviews);
        const myReview = fetchedReviews.find((r) => r.user_id === user?.id);
        setUserReview(myReview);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchCigarDetails();
      fetchReviews();
    }
  }, [id, user]);

  return { cigar, reviews, userReview, loading, fetchCigarDetails, fetchReviews };
}
