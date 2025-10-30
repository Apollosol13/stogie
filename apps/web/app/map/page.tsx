'use client';

import { useState, useCallback, useRef } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/lib/auth/hooks';
import { MapPin, Navigation2, Search } from 'lucide-react';
import useMapData from '@/lib/hooks/useMapData';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const defaultCenter = {
  lat: 37.78825,
  lng: -122.4324,
};

const darkMapStyles = [
  { elementType: 'geometry', stylers: [{ color: '#212121' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#212121' }] },
  {
    featureType: 'administrative',
    elementType: 'geometry',
    stylers: [{ color: '#757575' }],
  },
  {
    featureType: 'administrative.country',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#9e9e9e' }],
  },
  {
    featureType: 'administrative.land_parcel',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#bdbdbd' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#757575' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#181818' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#616161' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#1b1b1b' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.fill',
    stylers: [{ color: '#2c2c2c' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#8a8a8a' }],
  },
  {
    featureType: 'road.arterial',
    elementType: 'geometry',
    stylers: [{ color: '#373737' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#3c3c3c' }],
  },
  {
    featureType: 'road.highway.controlled_access',
    elementType: 'geometry',
    stylers: [{ color: '#4e4e4e' }],
  },
  {
    featureType: 'road.local',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#616161' }],
  },
  {
    featureType: 'transit',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#757575' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#000000' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#3d3d3d' }],
  },
];

export default function MapPage() {
  return (
    <ProtectedRoute>
      <MapContent />
    </ProtectedRoute>
  );
}

function MapContent() {
  const { user } = useAuth();
  const { loading, filteredMarkers, activeFilter, setActiveFilter } = useMapData();
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<any>(null);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
    
    // Try to get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(pos);
          map.setCenter(pos);
        },
        () => {
          console.log('Location permission denied');
        }
      );
    }
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const centerOnUser = () => {
    if (userLocation && map) {
      map.panTo(userLocation);
      map.setZoom(15);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(pos);
          if (map) {
            map.panTo(pos);
            map.setZoom(15);
          }
        },
        () => {
          alert('Unable to get your location. Please enable location permissions.');
        }
      );
    }
  };

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    
    console.log('Map clicked:', {
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    });
    // TODO: Open session creation modal
  };

  const getMarkerIcon = (type: string) => {
    switch (type) {
      case 'shop':
        return 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png';
      case 'lounge':
        return 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
      case 'session':
        return 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
      default:
        return undefined;
    }
  };

  // Use NEXT_PUBLIC_GOOGLE_MAPS_API_KEY for the API key
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  return (
    <div className="h-screen bg-bgPrimary pb-20 relative">
      <LoadScript googleMapsApiKey={apiKey}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={userLocation || defaultCenter}
          zoom={13}
          onLoad={onLoad}
          onUnmount={onUnmount}
          onClick={handleMapClick}
          options={{
            styles: darkMapStyles,
            disableDefaultUI: true,
            zoomControl: false,
            mapTypeControl: false,
            scaleControl: false,
            streetViewControl: false,
            rotateControl: false,
            fullscreenControl: false,
          }}
        >
          {/* User location marker */}
          {userLocation && (
            <Marker
              position={userLocation}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: '#60A5FA',
                fillOpacity: 1,
                strokeColor: '#FFFFFF',
                strokeWeight: 2,
              }}
            />
          )}

          {/* Map markers */}
          {filteredMarkers.map((marker) => (
            <Marker
              key={marker.id}
              position={marker.position}
              title={marker.title}
              icon={getMarkerIcon(marker.type)}
              onClick={() => setSelectedMarker(marker)}
            />
          ))}
        </GoogleMap>
      </LoadScript>

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 bg-gradient-to-b from-bgPrimary/90 to-transparent z-10">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-textPrimary" style={{ fontFamily: 'serif' }}>
              Discover
            </h1>
            <button className="text-textPrimary hover:text-accentGold transition-colors">
              <Search size={24} />
            </button>
          </div>

          {/* Filter pills */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {['all', 'shops', 'lounges', 'sessions'].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter as any)}
                className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                  activeFilter === filter
                    ? 'bg-accentGold text-bgPrimary'
                    : 'bg-surface text-textSecondary'
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Center on user button */}
      <button
        onClick={centerOnUser}
        className="absolute bottom-32 right-6 w-12 h-12 bg-surface rounded-full flex items-center justify-center shadow-lg border border-white/[0.08] hover:bg-surface2 transition-colors z-10"
      >
        <Navigation2 size={20} className="text-accentGold" />
      </button>

      {/* Log Session button */}
      <div className="absolute bottom-24 left-6 right-6 z-10">
        <button
          onClick={() => {
            if (!user) {
              alert('Please sign in to log a session');
              return;
            }
            // TODO: Open session modal
            console.log('Log session clicked');
          }}
          className="w-full bg-accentGold text-bgPrimary py-4 rounded-full font-bold text-lg shadow-lg hover:bg-opacity-90 transition-all"
        >
          Log Session
        </button>
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-bgPrimary/80 flex items-center justify-center z-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accentGold"></div>
        </div>
      )}

      <Navigation />
    </div>
  );
}
