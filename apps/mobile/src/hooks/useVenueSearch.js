import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { apiRequest } from "../utils/api";

export function useVenueSearch(userLocation, isVisible) {
  const [searchQuery, setSearchQuery] = useState("");
  const [cityQuery, setCityQuery] = useState("");
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchMode, setSearchMode] = useState(
    userLocation ? "nearby" : "city",
  );
  const [selectedCity, setSelectedCity] = useState(null);
  const [loadingCities, setLoadingCities] = useState(false);

  useEffect(() => {
    if (isVisible && userLocation && searchMode === "nearby") {
      searchNearbyVenues();
    }
  }, [isVisible, userLocation, searchMode]);

  useEffect(() => {
    if (cityQuery.trim().length > 2) {
      const timeoutId = setTimeout(() => {
        searchCities(cityQuery);
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setCitySuggestions([]);
    }
  }, [cityQuery]);

  const searchCities = async (query) => {
    setLoadingCities(true);
    try {
      const response = await apiRequest(
        `/integrations/google-place-autocomplete/autocomplete/json?input=${encodeURIComponent(query)}&radius=50000&types=(cities)`,
      );
      if (response.ok) {
        const data = await response.json();
        if (data.predictions) {
          const cities = data.predictions
            .filter(
              (prediction) =>
                prediction.types.includes("locality") ||
                prediction.types.includes("administrative_area_level_1") ||
                prediction.types.includes("administrative_area_level_2"),
            )
            .slice(0, 5);
          setCitySuggestions(cities);
        }
      }
    } catch (error) {
      console.error("Error searching cities:", error);
    } finally {
      setLoadingCities(false);
    }
  };

  const selectCity = async (city) => {
    setSelectedCity(city);
    setCityQuery(city.structured_formatting?.main_text || city.description.split(',')[0]);
    setCitySuggestions([]);

    try {
      const response = await apiRequest(
        `/integrations/google-place-autocomplete/details/json?place_id=${city.place_id}&fields=geometry`,
      );
      if (response.ok) {
        const data = await response.json();
        if (data.result?.geometry?.location) {
          searchVenuesInCity(
            city.description,
            "",
            data.result.geometry.location.lat,
            data.result.geometry.location.lng,
          );
        } else {
          searchVenuesInCity(city.description);
        }
      } else {
        searchVenuesInCity(city.description);
      }
    } catch (error) {
      console.error("Error getting city details:", error);
      searchVenuesInCity(city.description);
    }
  };

  const searchVenuesInCity = async (
    cityName,
    customQuery = "",
    cityLat = null,
    cityLng = null,
  ) => {
    setLoading(true);
    setHasSearched(true);
    try {
      const queryParams = new URLSearchParams({
        city: cityName,
        radius: "25000",
      });
      if (customQuery.trim()) {
        queryParams.set("query", customQuery.trim());
      }
      if (cityLat && cityLng) {
        queryParams.set("latitude", cityLat.toString());
        queryParams.set("longitude", cityLng.toString());
      }
      const response = await apiRequest(`/api/shops/search?${queryParams}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.results) {
          setSearchResults(data.results);
        } else {
          setSearchResults([]);
        }
      } else {
        throw new Error(`Search failed: ${response.status}`);
      }
    } catch (error) {
      console.error("Search error:", error);
      Alert.alert(
        "Search Error",
        `Failed to search for venues in ${cityName}. Please try again.`,
      );
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const searchNearbyVenues = async (customQuery = "") => {
    if (!userLocation) {
      Alert.alert(
        "Location Required",
        "Please enable location access to search for nearby venues.",
      );
      return;
    }
    setLoading(true);
    setHasSearched(true);
    try {
      const queryParams = new URLSearchParams({
        latitude: userLocation.latitude.toString(),
        longitude: userLocation.longitude.toString(),
        radius: "25000",
      });
      if (customQuery.trim()) {
        queryParams.set("query", customQuery.trim());
      }
      const response = await apiRequest(`/api/shops/search?${queryParams}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.results) {
          setSearchResults(data.results);
        } else {
          setSearchResults([]);
        }
      } else {
        throw new Error("Search failed");
      }
    } catch (error) {
      console.error("Search error:", error);
      Alert.alert(
        "Search Error",
        "Failed to search for venues. Please try again.",
      );
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchMode === "nearby") {
      searchNearbyVenues(searchQuery);
    } else if (selectedCity) {
      searchVenuesInCity(selectedCity.description, searchQuery);
    } else if (cityQuery.trim()) {
      searchVenuesInCity(cityQuery, searchQuery);
    } else {
      Alert.alert("City Required", "Please select a city to search in.");
    }
  };

  const resetState = () => {
    setSearchQuery("");
    setCityQuery("");
    setSelectedCity(null);
    setSearchResults([]);
    setHasSearched(false);
  };

  return {
    searchQuery,
    setSearchQuery,
    cityQuery,
    setCityQuery,
    citySuggestions,
    searchResults,
    setSearchResults,
    loading,
    hasSearched,
    setHasSearched,
    searchMode,
    setSearchMode,
    selectedCity,
    loadingCities,
    selectCity,
    handleSearch,
    resetState,
  };
}
