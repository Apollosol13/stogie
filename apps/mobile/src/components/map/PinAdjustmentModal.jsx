import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { X, Check } from 'lucide-react-native';
import { customMapStyle } from './mapStyle';

const colors = {
  bgPrimary: '#0F0F0F',
  surface: '#1A1A1A',
  surface2: '#242424',
  textPrimary: '#FFFFFF',
  textSecondary: '#B0B0B0',
  accentGold: '#D4B896',
};

const PinAdjustmentModal = ({ isVisible, onClose, initialLocation, onConfirm }) => {
  const insets = useSafeAreaInsets();
  const mapRef = useRef(null);
  const [pinLocation, setPinLocation] = useState(initialLocation);
  const [region, setRegion] = useState(null);
  const isUserInteracting = useRef(false);

  useEffect(() => {
    if (isVisible && initialLocation) {
      setPinLocation(initialLocation);
      setRegion({
        latitude: initialLocation.latitude,
        longitude: initialLocation.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
    }
  }, [isVisible, initialLocation]);

  const handleConfirm = () => {
    onConfirm(pinLocation);
    onClose();
  };

  if (!initialLocation?.latitude || !initialLocation?.longitude) {
    return null;
  }

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <StatusBar style="light" />
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
            <X size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Adjust Pin Location</Text>
            <Text style={styles.headerSubtitle}>
              Tap or drag the pin to set exact location
            </Text>
          </View>
          <TouchableOpacity onPress={handleConfirm} style={styles.headerButton}>
            <Check size={24} color={colors.accentGold} />
          </TouchableOpacity>
        </View>

        {/* Full Screen Map */}
        {region && (
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            region={region}
            customMapStyle={customMapStyle}
            userInterfaceStyle="dark"
            showsUserLocation={true}
            showsMyLocationButton={false}
            scrollEnabled={true}
            zoomEnabled={true}
            onTouchStart={() => {
              isUserInteracting.current = true;
            }}
            onTouchEnd={() => {
              isUserInteracting.current = false;
            }}
            onRegionChangeComplete={(newRegion) => {
              // Only update pin if user is actively dragging
              if (isUserInteracting.current) {
                setPinLocation({
                  latitude: newRegion.latitude,
                  longitude: newRegion.longitude,
                });
              }
              setRegion(newRegion);
            }}
          >
            {/* Pin stays fixed at center of map */}
          </MapView>
        )}

        {/* Centered Pin Overlay - Always in center of screen */}
        <View style={styles.centerMarker} pointerEvents="none">
          <View style={styles.pinContainer}>
            <View style={styles.pinDot} />
            <View style={styles.pinStem} />
          </View>
        </View>

        {/* Coordinates Display */}
        <View style={[styles.coordsContainer, { paddingBottom: insets.bottom + 20 }]}>
          <Text style={styles.coordsLabel}>Selected Location</Text>
          <Text style={styles.coordsText}>
            {pinLocation.latitude.toFixed(6)}, {pinLocation.longitude.toFixed(6)}
          </Text>
        </View>

        {/* Confirm Button */}
        <View style={[styles.buttonContainer, { paddingBottom: insets.bottom + 20 }]}>
          <TouchableOpacity onPress={handleConfirm} style={styles.confirmButton}>
            <Check size={20} color={colors.bgPrimary} />
            <Text style={styles.confirmButtonText}>Confirm Location</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface2,
  },
  headerButton: {
    padding: 8,
    width: 40,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  map: {
    flex: 1,
  },
  centerMarker: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -15,
    marginTop: -45,
    zIndex: 10,
  },
  pinContainer: {
    alignItems: 'center',
  },
  pinDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.accentGold,
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  pinStem: {
    width: 2,
    height: 15,
    backgroundColor: colors.accentGold,
  },
  coordsContainer: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    right: 20,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  coordsLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 4,
  },
  coordsText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },
  confirmButton: {
    backgroundColor: colors.accentGold,
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  confirmButtonText: {
    color: colors.bgPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
});

export default PinAdjustmentModal;
