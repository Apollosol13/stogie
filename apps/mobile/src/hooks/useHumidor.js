import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as SecureStore from 'expo-secure-store';
import { apiRequest } from "../utils/api";
import { useUser } from "../utils/auth/useUser";

const useHumidor = () => {
  const queryClient = useQueryClient();
  const { user } = useUser();

  // Fetch humidor entries and smoking sessions
  const {
    data: humidorData,
    loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["humidor"],
    queryFn: async () => {
      const [humidorResponse, sessionsResponse] = await Promise.all([
        apiRequest("/api/humidor?includeWishlist=true"),
        apiRequest("/api/smoking-sessions")
      ]);
      
      if (!humidorResponse.ok) {
        throw new Error(`HTTP error! status: ${humidorResponse.status}`);
      }
      
      const humidorData = await humidorResponse.json();
      const sessionsData = sessionsResponse.ok ? await sessionsResponse.json() : { sessions: [] };

      // Transform data for the UI
      const owned = humidorData.entries.filter((entry) => entry.status === 'owned');
      const wishlist = humidorData.entries.filter((entry) => entry.status === 'wishlist');
      
      // Transform smoking sessions to match humidor entry format
      const smoked = (sessionsData.sessions || []).map((session) => ({
        id: session.id,
        cigar_id: session.cigar_id,
        brand: session.cigars?.brand || 'Unknown',
        line: session.cigars?.line || '',
        vitola: session.cigars?.vitola || 'Unknown',
        strength: session.cigars?.strength || 'MEDIUM',
        wrapper: session.cigars?.wrapper || 'Unknown',
        image: session.cigars?.image_url || 'https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?w=200&h=150&fit=crop',
        location_name: session.location_name,
        created_at: session.created_at,
        sticker: session.sticker,
      }));

      return {
        owned: owned.map(transformEntry),
        smoked: smoked,
        wishlist: wishlist.map(transformEntry),
        stats: humidorData.stats || {},
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

  // Helper function to normalize strength values to backend requirements
  const normalizeStrength = (strengthValue) => {
    if (!strengthValue) return "MEDIUM";
    const str = strengthValue.toUpperCase();
    // Handle various AI response formats
    if (str.includes("MILD") || str.includes("LIGHT")) return "MILD";
    if (str.includes("MEDIUM")) return "MEDIUM";
    if (str.includes("FULL") || str.includes("STRONG")) return "FULL";
    return "MEDIUM"; // default fallback
  };

  // Add cigar to humidor
  const addToHumidorMutation = useMutation({
    mutationFn: async ({ cigarId, cigarData, isWishlist, quantity = 1, notes = "" }) => {
      console.log("🔧 addToHumidor mutation called with:", { cigarId, cigarData, isWishlist });
      
      // Prepare the payload
      const payload = {
        cigar_id: cigarId, // may be null if not in cigars table
        status: isWishlist ? 'wishlist' : 'owned',
        quantity: isWishlist ? 0 : quantity,
        notes,
      };

      // If we don't have a cigarId, we need to send the full cigar data
      if (!cigarId && cigarData) {
        payload.brand = cigarData.brand;
        payload.line = cigarData.line || "";
        payload.vitola = cigarData.vitola || "Unknown";
        payload.strength = normalizeStrength(cigarData.strength);
        payload.wrapper = cigarData.wrapper || "Unknown";
        payload.binder = cigarData.binder || "Unknown";
        payload.filler = cigarData.filler || "Unknown";
        payload.origin_country = cigarData.origin || "Unknown";
        payload.ring_gauge = safeParseInt(cigarData.ringGauge);
        payload.length_inches = safeParseFloat(cigarData.length);
        payload.price_range = cigarData.priceRange || "";
        payload.flavor_profile = cigarData.flavorProfile || [];
        payload.smoking_time_minutes = safeParseInt(cigarData.smokingTimeMinutes);
        payload.description = cigarData.description || "";
        payload.image_url = cigarData.image_url || null; // Include scanned image
      }

      console.log("📤 Sending humidor entry payload:", payload);

      const response = await apiRequest("/api/humidor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Server error:", errorData);
        throw new Error(errorData.error || "Failed to add to humidor");
      }

      const data = await response.json();
      console.log("✅ Successfully added to humidor:", data);
      return data;
    },
    onSuccess: () => {
      // Refetch humidor data after adding
      queryClient.invalidateQueries({ queryKey: ["humidor"] });
    },
    onError: (error) => {
      console.error("Error adding to humidor:", error);
    },
  });

  // Delete entry from humidor
  const deleteEntryMutation = useMutation({
    mutationFn: async (entryId) => {
      const response = await apiRequest(`/api/humidor/${entryId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete entry");
      }

      return await response.json();
    },
    onSuccess: () => {
      // Refetch humidor data after deleting
      queryClient.invalidateQueries({ queryKey: ["humidor"] });
    },
  });

  // Move entry between tabs (owned/wishlist)
  const moveEntryMutation = useMutation({
    mutationFn: async ({ entryId, newStatus }) => {
      const response = await apiRequest(`/api/humidor/${entryId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to move entry");
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["humidor"] });
    },
  });

  // Wrapper functions for mutations
  const addToHumidor = async (params) => {
    return addToHumidorMutation.mutateAsync(params);
  };

  const deleteEntry = async (entryId) => {
    return deleteEntryMutation.mutateAsync(entryId);
  };

  const moveEntry = async (entryId, newStatus) => {
    return moveEntryMutation.mutateAsync({ entryId, newStatus });
  };

  return {
    humidorData: humidorData || { owned: [], smoked: [], wishlist: [], stats: {} },
    loading,
    error,
    refetch,
    addToHumidor,
    deleteEntry,
    moveEntry,
    isAdding: addToHumidorMutation.isPending,
    isDeleting: deleteEntryMutation.isPending,
  };
};

// Transform database entry to UI format
const transformEntry = (entry) => {
  return {
    id: entry.id,
    cigar_id: entry.cigar_id,
    brand: entry.cigars?.brand || entry.brand,
    line: entry.cigars?.line || entry.line || "",
    vitola: entry.cigars?.vitola || entry.vitola,
    strength: (entry.cigars?.strength || entry.strength || "MEDIUM").toUpperCase(),
    wrapper: entry.cigars?.wrapper || entry.wrapper || "Unknown",
    binder: entry.cigars?.binder || entry.binder || "Unknown",
    filler: entry.cigars?.filler || entry.filler || "Unknown",
    quantity: entry.quantity || 1,
    acquiredDate: entry.acquired_date || entry.purchase_date,
    notes: entry.notes || entry.personal_notes || "",
    image: entry.cigars?.image_url || entry.image_url ||
      "https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?w=200&h=150&fit=crop",
    pricePaid: parseFloat(entry.price_paid ?? entry.purchase_price ?? 0) || 0,
    ringGauge: entry.cigars?.ring_gauge || entry.ring_gauge || "Unknown",
    length: entry.cigars?.length_inches || entry.length_inches || "Unknown",
    isWishlist: entry.status === 'wishlist' || entry.is_wishlist || false,
    // Include cigar specs for direct access
    flavorProfile: entry.cigars?.flavor_profile || entry.flavor_profile || [],
    averageRating: entry.cigars?.average_rating || entry.average_rating || 0,
    priceRange: entry.cigars?.price_range || entry.price_range || "",
    origin: entry.cigars?.origin_country || entry.origin_country || "Unknown",
    description: entry.cigars?.description || entry.description || "",
    // AI Analysis fields
    smokingTimeMinutes: entry.cigars?.smoking_time_minutes || entry.smoking_time_minutes || null,
    smokingTime: (entry.cigars?.smoking_time_minutes || entry.smoking_time_minutes)
      ? `${entry.cigars?.smoking_time_minutes || entry.smoking_time_minutes} minutes`
      : "45-60 minutes",
    smokingExperience: entry.cigars?.smoking_experience || entry.smoking_experience || "",
    aiConfidence: entry.ai_confidence || entry.aiConfidence || 0,
    status: entry.status
  };
};

export default useHumidor;
