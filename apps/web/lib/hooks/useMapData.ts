'use client';

import { useState, useEffect, useCallback } from 'react';

interface Shop {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
  description?: string;
  hasLounge?: boolean;
}

interface Session {
  id: string;
  latitude: number;
  longitude: number;
  location_name?: string;
  created_at?: string;
  profiles?: {
    username?: string;
  };
  cigars?: {
    brand?: string;
    line?: string;
  };
  sticker?: string;
}

interface Marker {
  id: string;
  type: 'shop' | 'lounge' | 'session';
  position: { lat: number; lng: number };
  title: string;
  description?: string;
  data: Shop | Session;
}

export default function useMapData() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [recentActivity, setRecentActivity] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'shops' | 'lounges' | 'sessions'>('all');

  const loadMapData = useCallback(async () => {
    try {
      setLoading(true);
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://stogie-production.up.railway.app';
      
      const [shopsResponse, sessionsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/shops`),
        fetch(`${API_BASE_URL}/api/smoking-sessions`),
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
      console.error('Error loading map data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMapData();
  }, [loadMapData]);

  // Optimistically add a session to the map immediately
  const addSessionImmediate = (session: Session) => {
    setSessions((prev) => [session, ...prev]);
    setRecentActivity((prev) => [session, ...prev].slice(0, 3));
  };

  const getFilteredMarkers = (): Marker[] => {
    const markers: Marker[] = [];
    
    if (activeFilter === 'all' || activeFilter === 'shops' || activeFilter === 'lounges') {
      const filteredShops = shops.filter((shop) => {
        if (activeFilter === 'lounges') return shop.hasLounge;
        if (activeFilter === 'shops') return !shop.hasLounge;
        return true;
      });
      
      markers.push(
        ...filteredShops.map((shop) => ({
          id: `shop-${shop.id}`,
          type: (shop.hasLounge ? 'lounge' : 'shop') as 'shop' | 'lounge',
          position: { lat: shop.latitude, lng: shop.longitude },
          title: shop.name,
          description: shop.description || shop.address,
          data: shop,
        }))
      );
    }

    if (activeFilter === 'all' || activeFilter === 'sessions') {
      const now = new Date();
      const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
      
      const validSessions = sessions.filter((session) => {
        // Must have coordinates
        if (!session.latitude || !session.longitude) return false;
        
        // Must be within last 24 hours
        if (!session.created_at) return false;
        const sessionDate = new Date(session.created_at);
        return sessionDate > twentyFourHoursAgo;
      });
      
      markers.push(
        ...validSessions.map((session) => ({
          id: `session-${session.id}`,
          type: 'session' as const,
          position: {
            lat: session.latitude,
            lng: session.longitude,
          },
          title: `${session.profiles?.username || 'User'} - ${
            session.cigars?.brand || 'Unknown'
          } ${session.cigars?.line || ''}`,
          description: session.location_name || 'Smoking Session',
          data: session,
        }))
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
    addSessionImmediate,
  };
}

