import React, { useState, useRef } from "react";
import { Animated, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import useHumidor from "@/hooks/useHumidor";
import useUser from "@/utils/auth/useUser";
import { apiRequest } from "../utils/api";

export default function useCigarScanner() {
  const router = useRouter();
  const { data: user } = useUser();
  const { addToHumidorAsync, isAdding } = useHumidor();

  const [step, setStep] = useState("camera"); // camera, processing, results
  const [capturedImage, setCapturedImage] = useState(null);
  const [matches, setMatches] = useState([]);
  const processingProgress = useRef(new Animated.Value(0)).current;
  const [selectedMatch, setSelectedMatch] = useState(null);

  const resetScan = () => {
    setStep("camera");
    setCapturedImage(null);
    setMatches([]);
    setSelectedMatch(null);
    processingProgress.setValue(0);
  };

  const identifyCigar = async (imageUri) => {
    try {
      setStep("processing");
      setCapturedImage(imageUri);

      // Start progress animation
      Animated.timing(processingProgress, {
        toValue: 1,
        duration: 4000,
        useNativeDriver: false,
      }).start();

      // Convert image to base64 if it's a local URI
      let imageData = imageUri;
      if (imageUri && !imageUri.startsWith("data:image/")) {
        console.log("📱 Converting local URI to base64:", imageUri.substring(0, 50) + "...");
        // If it's a local URI, we need to read it as base64
        const response = await fetch(imageUri);
        const blob = await response.blob();
        const reader = new FileReader();

        imageData = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      }
      
      console.log("📸 Image data format:", imageData ? imageData.substring(0, 50) + "..." : "null");
      console.log("📏 Image data length:", imageData ? imageData.length : 0);
      
      // Calculate estimated file size (base64 is ~33% larger than binary)
      const estimatedSizeMB = imageData ? (imageData.length * 0.75) / (1024 * 1024) : 0;
      console.log("📊 Estimated image size:", estimatedSizeMB.toFixed(2), "MB");
      
      console.log("🌐 Making API request to analyze-v2 endpoint...");

      const analysisResponse = await apiRequest("/api/cigars/analyze-v2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageData }), // Changed from imageUri to image
      });

      if (!analysisResponse.ok) {
        // Get detailed error message from server
        let errorMessage = `Analysis failed: ${analysisResponse.status}`;
        try {
          const errorData = await analysisResponse.json();
          if (errorData.error) {
            errorMessage = `${errorMessage} - ${errorData.error}`;
          }
          if (errorData.details) {
            errorMessage = `${errorMessage} (${errorData.details})`;
          }
        } catch (e) {
          // If we can't parse the error response, use the text
          try {
            const errorText = await analysisResponse.text();
            if (errorText) {
              errorMessage = `${errorMessage} - ${errorText}`;
            }
          } catch (e2) {
            // Use the basic error message
          }
        }
        throw new Error(errorMessage);
      }

      const analysisData = await analysisResponse.json();
      console.log("📋 Analysis response data:", analysisData);
      
      if (!analysisData.success || !analysisData.analysis) {
        const errorMsg = analysisData.error || "No analysis results received";
        console.error("❌ Analysis failed:", errorMsg);
        throw new Error(errorMsg);
      }

      const analysis = analysisData.analysis;
      console.log("✅ Analysis successful:", analysis);
      let searchQuery = "";
      if (analysis.brand) {
        searchQuery = analysis.brand;
        if (analysis.line) searchQuery += " " + analysis.line;
      } else if (analysis.description) {
        const brandKeywords = [
          "padron",
          "romeo",
          "cohiba",
          "montecristo",
          "arturo fuente",
        ];
        const foundBrand = brandKeywords.find((brand) =>
          analysis.description.toLowerCase().includes(brand),
        );
        searchQuery = foundBrand || "premium cigar";
      } else {
        searchQuery = "cigar";
      }

      const searchResponse = await fetch(
        `/api/cigars/search?query=${encodeURIComponent(searchQuery)}`,
      );
      const searchData = await searchResponse.json();

      const expertMatch = {
        id: "expert-identified",
        brand: analysis.brand || "Unknown Brand",
        line: analysis.line || "",
        vitola: analysis.vitola || "Unknown",
        strength: (analysis.strength || "medium").toLowerCase(),
        wrapper: analysis.wrapper || "Unknown",
        binder: analysis.binder || "Unknown",
        filler: analysis.filler || "Unknown",

        // UI display fields (camelCase) - these are what MatchDetail component uses
        ringGauge: analysis.ringGauge || analysis.ring_gauge || "Unknown",
        length: analysis.length || analysis.length_inches || "Unknown",
        origin: analysis.origin || analysis.origin_country || "Unknown",
        priceRange: analysis.priceRange || analysis.price_range || "$10-20",
        flavorProfile: analysis.flavorProfile ||
          analysis.flavor_profile || ["tobacco", "wood"],
        smokingTime: analysis.smokingTime || "45-60 minutes",
        smokingExperience:
          analysis.smokingExperience ||
          analysis.smoking_experience ||
          "Premium smoking experience with balanced flavors and smooth finish",
        notes: analysis.notes || analysis.analysis_notes || "",

        // Database fields (snake_case) - these are for saving to database
        ring_gauge: analysis.ringGauge || analysis.ring_gauge || null,
        length_inches: analysis.length || analysis.length_inches || null,
        flavor_profile: analysis.flavorProfile ||
          analysis.flavor_profile || ["tobacco", "wood"],
        smoking_time_minutes: analysis.smokingTime
          ? parseInt(analysis.smokingTime.match(/\d+/)?.[0]) || null
          : null,
        price_range: analysis.priceRange || analysis.price_range || "$10-20",
        origin_country: analysis.origin || analysis.origin_country || "Unknown",
        smoking_experience:
          analysis.smokingExperience ||
          analysis.smoking_experience ||
          "Premium smoking experience with balanced flavors and smooth finish",

        confidence: analysis.confidence || 0.85,
        ai_confidence: analysis.confidence || 0.85,
        image: imageUri,
        image_url: imageUri,
        description:
          analysis.description || "Identified through image analysis",
        isAiIdentified: true,
        is_ai_identified: true,
        analysis_notes: analysis.notes || analysis.analysis_notes || "",
      };

      let allMatches = [expertMatch];
      if (searchResponse.ok && searchData.cigars) {
        const dbMatches = searchData.cigars.map((cigar, index) => ({
          id: cigar.id,
          brand: cigar.brand,
          line: cigar.line,
          vitola: cigar.vitola,
          strength: cigar.strength?.toUpperCase() || "MEDIUM",
          wrapper: cigar.wrapper,
          binder: cigar.binder || "Unknown",
          filler: cigar.filler || "Unknown",
          ringGauge: cigar.ring_gauge || cigar.ringGauge,
          length: cigar.length_inches || cigar.length,
          priceRange: cigar.price_range || "$10-20",
          origin: cigar.origin_country || "Unknown",
          notes: cigar.description || "",
          smokingExperience: "Premium smoking experience",
          confidence: Math.max(0.5, 0.8 - index * 0.1),
          image:
            cigar.image_url ||
            "https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?w=200&h=150&fit=crop",
          description: cigar.description,
        }));
        allMatches = [...allMatches, ...dbMatches.slice(0, 4)];
      }

      // Only proceed if we have valid matches
      if (allMatches && allMatches.length > 0) {
        console.log("🎯 Found", allMatches.length, "matches, showing results");
        setTimeout(() => {
          setMatches(allMatches);
          setStep("results");
        }, 4000);
      } else {
        console.error("❌ No matches found, something went wrong");
        throw new Error("No cigar matches found - analysis may have failed");
      }
    } catch (error) {
      console.error("Error identifying cigar:", error);
      Alert.alert(
        "Identification Failed",
        "Could not identify the cigar. Please try again with a clearer image of the cigar band.",
        [
          { text: "Try Again", onPress: resetScan },
          { text: "Cancel", style: "cancel" },
        ],
      );
      resetScan();
    }
  };

  const pickImageFromGallery = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Please grant camera roll permissions to upload images",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7, // Higher quality for iOS - better for cigar band details
        base64: true, // Get base64 data directly
        exif: false, // Remove EXIF data to reduce size
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        // Use base64 data if available, otherwise fall back to URI
        const imageData = asset.base64
          ? `data:image/jpeg;base64,${asset.base64}`
          : asset.uri;
        identifyCigar(imageData);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert(
        "Error",
        "Failed to pick image from gallery. Please try again.",
      );
    }
  };

  const addCigarToHumidor = async (match, isWishlist = false) => {
    try {
      console.log("Adding cigar to humidor:", {
        cigarId:
          match.id && !match.id.toString().startsWith("expert-identified")
            ? match.id
            : null,
        brand: match.brand,
        line: match.line,
        vitola: match.vitola,
        isWishlist,
        matchData: match, // Add full match data for debugging
      });

      const result = await addToHumidorAsync({
        cigarId:
          match.id && !match.id.toString().startsWith("expert-identified")
            ? match.id
            : null,
        cigarData: match,
        isWishlist,
        quantity: 1,
        notes: match.isAiIdentified ? "Automatically identified" : "",
      });

      console.log("Successfully added to humidor:", result);

      Alert.alert(
        "Success!",
        `${match.brand} ${match.line} has been added to your ${isWishlist ? "wishlist" : "humidor"}!`,
        [
          {
            text: "View Collection",
            onPress: () => router.push("/(tabs)/humidor"),
          },
          { text: "Scan Another", onPress: resetScan },
        ],
      );
    } catch (error) {
      console.error("Error adding to humidor - full error:", error);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);

      // More specific error messages
      let errorMessage =
        "Failed to add cigar to your collection. Please try again.";
      if (error.message?.includes("Unauthorized")) {
        errorMessage = "Please sign in to add cigars to your collection.";
      } else if (error.message?.includes("Failed to create cigar")) {
        errorMessage =
          "Could not save cigar details. Please check your internet connection.";
      } else if (error.message?.includes("Failed to add to humidor")) {
        errorMessage = "Could not add to your collection. Please try again.";
      }

      Alert.alert("Error", errorMessage, [{ text: "OK" }]);
    }
  };

  const handleMatchSelect = async (match) => {
    if (!user) {
      Alert.alert(
        "Authentication Required",
        "Please sign in to save cigars to your humidor.",
      );
      return;
    }

    Alert.alert(
      "Add to Collection",
      `Selected: ${match.brand} ${match.line} ${match.vitola}`,
      [
        {
          text: "Add to Humidor",
          onPress: () => addCigarToHumidor(match, false),
        },
        {
          text: "Add to Wishlist",
          onPress: () => addCigarToHumidor(match, true),
        },
        { text: "Cancel", style: "cancel" },
      ],
    );
  };

  return {
    step,
    capturedImage,
    matches,
    processingProgress,
    selectedMatch,
    isAdding,
    identifyCigar,
    pickImageFromGallery,
    resetScan,
    handleMatchSelect,
    setSelectedMatch,
  };
}
