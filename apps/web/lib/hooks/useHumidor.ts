'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../auth/hooks';
import { apiRequest } from '../api';

interface HumidorEntry {
  id: string;
  cigar_id: string;
  brand: string;
  line: string;
  vitola?: string;
  quantity: number;
  status: 'owned' | 'smoked' | 'wishlist';
  image?: string;
}

interface HumidorData {
  owned: HumidorEntry[];
  smoked: HumidorEntry[];
  wishlist: HumidorEntry[];
}

export default function useHumidor() {
  const { jwt } = useAuth();
  const [humidorData, setHumidorData] = useState<HumidorData>({
    owned: [],
    smoked: [],
    wishlist: [],
  });
  const [loading, setLoading] = useState(true);

  const loadHumidor = useCallback(async () => {
    if (!jwt) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await apiRequest('/api/humidor', { method: 'GET' }, jwt);
      
      // Transform entries array to grouped object
      if (data.entries) {
        const grouped = {
          owned: data.entries.filter((e: any) => e.status === 'owned').map((e: any) => ({
            ...e,
            ...e.cigars,
            entry_id: e.id,
            id: e.cigar_id,
            cigar_id: e.cigar_id,
            quantity: e.quantity || 1,
            image: e.cigars?.image_url
          })),
          smoked: data.entries.filter((e: any) => e.status === 'smoked').map((e: any) => ({
            ...e,
            ...e.cigars,
            entry_id: e.id,
            id: e.cigar_id,
            cigar_id: e.cigar_id,
            image: e.cigars?.image_url
          })),
          wishlist: data.entries.filter((e: any) => e.status === 'wishlist').map((e: any) => ({
            ...e,
            ...e.cigars,
            entry_id: e.id,
            id: e.cigar_id,
            cigar_id: e.cigar_id,
            image: e.cigars?.image_url
          }))
        };
        setHumidorData(grouped);
      } else {
        setHumidorData(data);
      }
    } catch (error) {
      console.error('Failed to load humidor:', error);
    } finally {
      setLoading(false);
    }
  }, [jwt]);

  useEffect(() => {
    loadHumidor();
  }, [loadHumidor]);

  return {
    humidorData,
    loading,
    refetch: loadHumidor,
  };
}

