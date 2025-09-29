import { useState, useEffect, useCallback } from "react";
import { Alert } from "react-native";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LOCATION_PERMISSION_KEY } from "../components/map/constants";

export default function useLocationManager(mapRef) {
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [userLocation, setUserLocation] = useState(null);
  const [locationPermission, setLocationPermission] = useState(false);
  const [showLocationPermissionModal, setShowLocationPermissionModal] =
    useState(false);
  const [hasAnimatedToUserLocation, setHasAnimatedToUserLocation] =
    useState(false);

  const checkLocationPermission = useCallback(async () => {
    const hasAsked = await AsyncStorage.getItem(LOCATION_PERMISSION_KEY);
    const { status } = await Location.getForegroundPermissionsAsync();

    if (status === "granted") {
      setLocationPermission(true);
      return true;
    }

    if (hasAsked) {
      setLocationPermission(false);
      return false;
    }
    // Haven't asked and don't have permission
    setShowLocationPermissionModal(true);
    return false;
  }, []);

  const getUserLocation = useCallback(
    async (animate = false) => {
      const hasPermission = await checkLocationPermission();
      if (!hasPermission && !locationPermission) return;

      try {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        const { latitude, longitude } = location.coords;
        setUserLocation({ latitude, longitude });

        // Only animate to user location when explicitly requested via centerOnUser
        if (animate) {
          const newRegion = {
            latitude,
            longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          };
          setRegion(newRegion);
          mapRef.current?.animateToRegion(newRegion, 1000);
        }

        // Set this flag after first location fetch to prevent auto-animation
        if (!hasAnimatedToUserLocation) {
          setHasAnimatedToUserLocation(true);
        }
      } catch (error) {
        console.error("Error getting user location:", error);
      }
    },
    [
      checkLocationPermission,
      hasAnimatedToUserLocation,
      mapRef,
      locationPermission,
    ],
  );

  useEffect(() => {
    (async () => {
      const hasPermission = await checkLocationPermission();
      if (hasPermission) {
        // Don't auto-animate on initial load, just get the location
        getUserLocation(false);
      }
    })();
  }, [checkLocationPermission, getUserLocation]);

  const requestPermission = async () => {
    await AsyncStorage.setItem(LOCATION_PERMISSION_KEY, "true");
    setShowLocationPermissionModal(false);

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === "granted") {
      setLocationPermission(true);
      getUserLocation(true);
    } else {
      Alert.alert(
        "Permission Denied",
        "You can enable location services in your device settings.",
      );
    }
  };

  const declinePermission = async () => {
    await AsyncStorage.setItem(LOCATION_PERMISSION_KEY, "true");
    setShowLocationPermissionModal(false);
  };

  const centerOnUser = () => {
    if (userLocation) {
      getUserLocation(true);
    } else {
      checkLocationPermission().then((hasPermission) => {
        if (hasPermission) {
          getUserLocation(true);
        } else {
          Alert.alert(
            "Location Permission Required",
            "Please enable location services in your settings to use this feature.",
          );
        }
      });
    }
  };

  return {
    region,
    setRegion,
    userLocation,
    locationPermission,
    showLocationPermissionModal,
    centerOnUser,
    handleLocationPermissionAllow: requestPermission,
    handleLocationPermissionDecline: declinePermission,
  };
}
