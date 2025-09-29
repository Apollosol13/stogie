import { useState, useEffect, useCallback } from "react";

export default function useMapData() {
  const [shops, setShops] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");

  const loadMapData = useCallback(async () => {
    try {
      setLoading(true);
      const [shopsResponse, sessionsResponse] = await Promise.all([
        fetch("/api/shops"),
        fetch("/api/smoking-sessions"),
      ]);

      if (shopsResponse.ok) {
        const shopsData = await shopsResponse.json();
        setShops(shopsData.shops || []);
      }

      if (sessionsResponse.ok) {
        const sessionsData = await sessionsResponse.json();
        setSessions(sessionsData.sessions || []);
        setRecentActivity(sessionsData.sessions?.slice(0, 3) || []);
      }
    } catch (error) {
      console.error("Error loading map data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMapData();
  }, [loadMapData]);

  const getFilteredMarkers = () => {
    let markers = [];
    if (
      activeFilter === "all" ||
      activeFilter === "shops" ||
      activeFilter === "lounges"
    ) {
      const filteredShops = shops.filter((shop) => {
        if (activeFilter === "lounges") return shop.hasLounge;
        if (activeFilter === "shops") return !shop.hasLounge;
        return true;
      });
      markers.push(
        ...filteredShops.map((shop) => ({
          id: `shop-${shop.id}`,
          type: shop.hasLounge ? "lounge" : "shop",
          coordinate: { latitude: shop.latitude, longitude: shop.longitude },
          title: shop.name,
          description: shop.description || shop.address,
          data: shop,
        })),
      );
    }

    if (activeFilter === "all" || activeFilter === "sessions") {
      const validSessions = sessions.filter(
        (session) => session.latitude && session.longitude,
      );
      markers.push(
        ...validSessions.map((session) => ({
          id: `session-${session.id}`,
          type: "session",
          coordinate: {
            latitude: session.latitude,
            longitude: session.longitude,
          },
          title: `${session.userName} - ${
            session.cigar?.brand || "Unknown"
          } ${session.cigar?.line || ""}`,
          description: session.location || "Smoking Session",
          data: session,
        })),
      );
    }
    return markers;
  };

  const filteredMarkers = getFilteredMarkers();

  return {
    loading,
    recentActivity,
    activeFilter,
    setActiveFilter,
    filteredMarkers,
    loadMapData,
  };
}
