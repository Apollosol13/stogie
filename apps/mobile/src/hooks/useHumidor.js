import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../utils/api";
import { useUser } from "../utils/auth/useUser";

const useHumidor = () => {
  const queryClient = useQueryClient();
  const { user } = useUser();

  // Fetch humidor entries
  const {
    data: humidorData,
    loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["humidor"],
    queryFn: async () => {
      const response = await apiRequest("/api/humidor?includeWishlist=true");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      // Transform data for the UI
      const owned = data.entries.filter(
        (entry) => !entry.is_wishlist && entry.quantity > 0,
      );
      const wishlist = data.entries.filter((entry) => entry.is_wishlist);

      return {
        owned: owned.map(transformEntry),
        smoked: [], // Will be populated from smoking_sessions table later
        wishlist: wishlist.map(transformEntry),
        stats: data.stats || {},
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  // Helper function to safely parse numbers
  const safeParseInt = (value) => {
    if (
      !value ||
      value === "Unknown" ||
      value === "" ||
      value === null ||
      value === undefined
    ) {
      return null;
    }
    const parsed = parseInt(value);
    return isNaN(parsed) ? null : parsed;
  };

  const safeParseFloat = (value) => {
    if (
      !value ||
      value === "Unknown" ||
      value === "" ||
      value === null ||
      value === undefined
    ) {
      return null;
    }
    const parsed = parseFloat(value);
    return isNaN(parsed) ? null : parsed;
  };

  // Add cigar to humidor
  const addToHumidorMutation = useMutation({
    mutationFn: async ({
      cigarId,
      cigarData,
      isWishlist = false,
      quantity = 1,
      notes = "",
      purchasePrice = null,
    }) => {
      try {
        console.log("=== addToHumidorMutation START ===");
        console.log("Input parameters:", {
          cigarId,
          isWishlist,
          quantity,
          notes,
        });
        console.log("CigarData:", cigarData);

        // First ensure the cigar exists in our database
        let finalCigarId = cigarId;

        if (
          !cigarId ||
          (typeof cigarId === "string" &&
            cigarId.startsWith("expert-identified"))
        ) {
          console.log("Creating new cigar from AI analysis...");
          // Create the cigar first if it doesn't exist - include all AI analysis data
          // Fix payload to match backend API expectations
          const createPayload = {
            brand: cigarData.brand,
            line: cigarData.line || "",
            vitola: cigarData.vitola,
            strength: cigarData.strength?.toUpperCase() || "MEDIUM",  // Backend validates uppercase
            wrapper: cigarData.wrapper || "",
            binder: cigarData.binder || "",
            filler: cigarData.filler || "",
            country: cigarData.origin || "",  // Backend expects 'country'
            imageUrl: cigarData.image || cigarData.image_url || null,  // Backend expects 'imageUrl'
            description: cigarData.description || cigarData.notes || "",
          };

          console.log("Creating cigar with payload:", createPayload);
          
          // Debug authentication
          console.log("🔐 DEBUG: About to create cigar with authentication");
          console.log("🔐 DEBUG: User authenticated?", !!user);
          console.log("🔐 DEBUG: User ID:", user?.id);

          const createResponse = await apiRequest("/api/cigars", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(createPayload),
          });

          console.log("Create response status:", createResponse.status);

          if (!createResponse.ok) {
            const errorData = await createResponse.text();
            console.error("Cigar creation failed:", errorData);
            throw new Error(
              `Failed to create cigar: ${createResponse.status} ${errorData}`,
            );
          }

          const newCigar = await createResponse.json();
          console.log("Cigar created successfully:", newCigar);
          finalCigarId = newCigar.id;
        }

        console.log("Adding to humidor with cigar ID:", finalCigarId);

        // Add to humidor - fix API payload to match backend expectations
        const humidorPayload = {
          cigarId: finalCigarId,  // Backend expects camelCase
          status: isWishlist ? 'wishlist' : 'owned',  // Backend expects status string
          quantity,
          notes: notes,  // Backend expects 'notes' not 'personal_notes'
          pricePaid: purchasePrice,  // Backend expects camelCase
          acquiredDate: new Date().toISOString().split("T")[0],  // Backend expects camelCase
        };

        console.log("Adding to humidor with payload:", humidorPayload);
        
        // Debug authentication for humidor
        console.log("🔐 DEBUG: About to add to humidor with authentication");
        console.log("🔐 DEBUG: User authenticated?", !!user);
        console.log("🔐 DEBUG: User ID:", user?.id);
        console.log("🔐 DEBUG: User object:", user);

        const response = await apiRequest("/api/humidor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(humidorPayload),
        });

        if (!response.ok) {
          const errorData = await response.text();
          console.error("Humidor add failed:", errorData);
          throw new Error(
            `Failed to add to humidor: ${response.status} ${errorData}`,
          );
        }

        const result = await response.json();
        console.log("Added to humidor successfully:", result);
        return result;
      } catch (error) {
        console.error("addToHumidorMutation error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["humidor"] });
    },
    onError: (error) => {
      console.error("Humidor mutation failed:", error);
    },
  });

  // Update humidor entry
  const updateEntryMutation = useMutation({
    mutationFn: async ({ id, updates }) => {
      const response = await fetch("/api/humidor", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updates }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["humidor"] });
    },
  });

  // Delete humidor entry
  const deleteEntryMutation = useMutation({
    mutationFn: async (entryId) => {
      const response = await fetch(`/api/humidor?id=${entryId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["humidor"] });
    },
  });

  return {
    // Data
    humidorData: humidorData || {
      owned: [],
      smoked: [],
      wishlist: [],
      stats: {},
    },
    loading,
    error,

    // Actions
    addToHumidor: addToHumidorMutation.mutate,
    addToHumidorAsync: addToHumidorMutation.mutateAsync,
    updateEntry: updateEntryMutation.mutate,
    deleteEntry: deleteEntryMutation.mutate,
    refetch,

    // Status
    isAdding: addToHumidorMutation.isPending,
    isUpdating: updateEntryMutation.isPending,
    isDeleting: deleteEntryMutation.isPending,
  };
};

// Transform database entry to UI format
const transformEntry = (entry) => {
  return {
    id: entry.id, // humidor entry ID
    cigar_id: entry.cigar_id, // reference to the cigar in cigars table
    brand: entry.brand,
    line: entry.line || "",
    vitola: entry.vitola,
    strength: entry.strength?.toUpperCase() || "MEDIUM",
    wrapper: entry.wrapper || "Unknown",
    binder: entry.binder || "Unknown",
    filler: entry.filler || "Unknown",
    quantity: entry.quantity || 1,
    acquiredDate: entry.purchase_date,
    notes: entry.personal_notes || "",
    image:
      entry.image_url ||
      "https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?w=200&h=150&fit=crop",
    pricePaid: parseFloat(entry.purchase_price) || 0,
    agingMonths: entry.age_years ? entry.age_years * 12 : 0,
    ringGauge: entry.ring_gauge || "Unknown",
    length: entry.length_inches || "Unknown",
    condition: entry.condition || "excellent",
    storageLocation: entry.storage_location || "",
    isWishlist: entry.is_wishlist || false,
    // Include cigar specs for direct access
    flavorProfile: entry.flavor_profile || [],
    averageRating: entry.average_rating || 0,
    priceRange: entry.price_range || "",
    origin: entry.origin_country || "Unknown",
    description: entry.description || "",
    // AI Analysis fields
    smokingTimeMinutes: entry.smoking_time_minutes || null,
    smokingTime: entry.smoking_time_minutes
      ? `${entry.smoking_time_minutes} minutes`
      : "45-60 minutes",
    smokingExperience: entry.smoking_experience || "",
    aiConfidence: entry.ai_confidence || null,
    confidence: entry.ai_confidence || null,
    analysisNotes: entry.analysis_notes || "",
    isAiIdentified: entry.is_ai_identified || false,
  };
};

export default useHumidor;
