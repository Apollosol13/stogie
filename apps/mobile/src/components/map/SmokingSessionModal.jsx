import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  Alert,
  Animated,
  ActivityIndicator
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  X,
  MapPin,
  Cigarette,
  Clock,
  Users,
  Wine,
  MessageCircle,
  Camera,
  Check
} from 'lucide-react-native';
import useHumidor from '@/hooks/useHumidor';

const colors = {
  bgPrimary: '#0F0F0F',
  surface: '#1A1A1A',
  surface2: '#242424',
  textPrimary: '#FFFFFF',
  textSecondary: '#B0B0B0',
  textTertiary: '#6B7280',
  accentGold: '#D4B896',
  accentGreen: '#68D391',
  divider: 'rgba(255, 255, 255, 0.1)',
  overlay: 'rgba(0, 0, 0, 0.8)',
};

const SmokingSessionModal = ({ 
  isVisible, 
  onClose, 
  location, 
  onCreateSession 
}) => {
  const insets = useSafeAreaInsets();
  const { humidorData, loading: humidorLoading } = useHumidor();
  
  const [selectedCigar, setSelectedCigar] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [pairing, setPairing] = useState('');
  const [companions, setCompanions] = useState('');
  const [notes, setNotes] = useState('');
  const [moodBefore, setMoodBefore] = useState('');
  const [occasion, setOccasion] = useState('');
  const [weather, setWeather] = useState('');
  const [selectedSticker, setSelectedSticker] = useState(null);
  const [creating, setCreating] = useState(false);
  const [pinLocation, setPinLocation] = useState(null);

  const slideAnim = useRef(new Animated.Value(0)).current;

  const resetForm = () => {
    setSelectedCigar(null);
    setLocationName('');
    setPairing('');
    setCompanions('');
    setNotes('');
    setMoodBefore('');
    setOccasion('');
    setWeather('');
    setSelectedSticker(null);
    setPinLocation(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleCreateSession = async () => {
    if (!selectedCigar) {
      Alert.alert('Select a Cigar', 'Please select a cigar from your humidor to continue.');
      return;
    }

    if (!locationName.trim()) {
      Alert.alert('Add Location Name', 'Please add a name for this location.');
      return;
    }

    setCreating(true);

    try {
      const sessionData = {
        cigar_id: selectedCigar.cigar_id,
        location_name: locationName.trim(),
        latitude: pinLocation?.latitude ?? location?.latitude,
        longitude: pinLocation?.longitude ?? location?.longitude,
      };

      await onCreateSession(sessionData);
      handleClose();
    } catch (error) {
      console.error('Error creating session:', error);
      Alert.alert('Error', 'Failed to create smoking session. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const availableCigars = humidorData?.owned?.filter(entry => entry.quantity > 0) || [];

  React.useEffect(() => {
    if (isVisible) {
      if (location?.latitude && location?.longitude) {
        setPinLocation({ latitude: location.latitude, longitude: location.longitude });
      }
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      slideAnim.setValue(0);
    }
  }, [isVisible]);

  const animatedStyle = {
    transform: [
      {
        translateY: slideAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [300, 0],
        }),
      },
    ],
  };

  // Sticker set (emoji only)

  return (
    <Modal
      visible={isVisible}
      animationType="fade"
      transparent={true}
      onRequestClose={handleClose}
    >
      <StatusBar style="light" />
      <View style={{ flex: 1, backgroundColor: colors.overlay }}>
        {/* Backdrop */}
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={handleClose}
        />

        {/* Modal Content */}
        <Animated.View
          style={[
            {
              backgroundColor: colors.surface,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              height: '85%',
              paddingBottom: insets.bottom,
            },
            animatedStyle,
          ]}
        >
          {/* Handle */}
          <View
            style={{
              width: 40,
              height: 4,
              backgroundColor: colors.textTertiary,
              alignSelf: 'center',
              marginTop: 12,
              borderRadius: 2,
            }}
          />

          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 20,
              paddingBottom: 16,
            }}
          >
            <View>
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: 24,
                  fontWeight: '700',
                }}
              >
                New Smoking Session
              </Text>
              {location && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                  <MapPin size={14} color={colors.textSecondary} />
                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontSize: 14,
                      marginLeft: 4,
                    }}
                  >
                    {location.latitude?.toFixed(4)}, {location.longitude?.toFixed(4)}
                  </Text>
                </View>
              )}
            </View>

            <TouchableOpacity onPress={handleClose}>
              <X size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={{ flexGrow: 1 }} 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Sticker Picker */}
            <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
              <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
                Pick a sticker
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {[
                  { key: 'classic', label: '🚬' },
                  { key: 'maduro', label: '🥃' },
                  { key: 'ash', label: '🧱' },
                  { key: 'flame', label: '🔥' },
                  { key: 'cheers', label: '🍻' },
                ].map((s) => (
                  <TouchableOpacity
                    key={s.key}
                    onPress={() => setSelectedSticker(s.key)}
                    style={{
                      backgroundColor: selectedSticker === s.key ? colors.accentGold : colors.surface2,
                      borderRadius: 12,
                      paddingVertical: 10,
                      paddingHorizontal: 14,
                      marginRight: 8,
                    }}
                  >
                    <Text style={{ fontSize: 22, color: selectedSticker === s.key ? colors.bgPrimary : colors.textPrimary }}>
                      {s.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            {/* Cigar Selection */}
            <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <Cigarette size={20} color={colors.accentGold} />
                <Text
                  style={{
                    color: colors.textPrimary,
                    fontSize: 16,
                    fontWeight: '600',
                    marginLeft: 8,
                  }}
                >
                  Select Cigar *
                </Text>
              </View>

              {humidorLoading ? (
                <View
                  style={{
                    padding: 20,
                    alignItems: 'center',
                    backgroundColor: colors.surface2,
                    borderRadius: 12,
                  }}
                >
                  <ActivityIndicator color={colors.accentGold} />
                  <Text style={{ color: colors.textSecondary, marginTop: 8 }}>
                    Loading your humidor...
                  </Text>
                </View>
              ) : availableCigars.length === 0 ? (
                <View
                  style={{
                    padding: 20,
                    alignItems: 'center',
                    backgroundColor: colors.surface2,
                    borderRadius: 12,
                  }}
                >
                  <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>
                    No cigars available in your humidor.{'\n'}Add some cigars first!
                  </Text>
                </View>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingRight: 20 }}
                >
                  {availableCigars.map((entry, index) => (
                    <TouchableOpacity
                      key={entry.id || index}
                      onPress={() => setSelectedCigar(entry)}
                      style={{
                        backgroundColor: selectedCigar?.id === entry.id 
                          ? colors.accentGold 
                          : colors.surface2,
                        padding: 16,
                        borderRadius: 12,
                        marginRight: 12,
                        minWidth: 160,
                        maxWidth: 200,
                      }}
                    >
                      <Text
                        style={{
                          color: selectedCigar?.id === entry.id 
                            ? colors.bgPrimary 
                            : colors.textPrimary,
                          fontSize: 16,
                          fontWeight: '600',
                          marginBottom: 4,
                        }}
                        numberOfLines={1}
                      >
                        {entry.brand} {entry.line}
                      </Text>
                      <Text
                        style={{
                          color: selectedCigar?.id === entry.id 
                            ? colors.bgPrimary 
                            : colors.textSecondary,
                          fontSize: 14,
                          marginBottom: 8,
                        }}
                        numberOfLines={1}
                      >
                        {entry.vitola}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text
                          style={{
                            color: selectedCigar?.id === entry.id 
                              ? colors.bgPrimary 
                              : colors.textTertiary,
                            fontSize: 12,
                          }}
                        >
                          Qty: {entry.quantity}
                        </Text>
                        {selectedCigar?.id === entry.id && (
                          <View style={{ marginLeft: 'auto' }}>
                            <Check size={16} color={colors.bgPrimary} />
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>

            {/* Location Name */}
            <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <MapPin size={20} color={colors.accentGold} />
                <Text
                  style={{
                    color: colors.textPrimary,
                    fontSize: 16,
                    fontWeight: '600',
                    marginLeft: 8,
                  }}
                >
                  Location Name *
                </Text>
              </View>
              <TextInput
                value={locationName}
                onChangeText={setLocationName}
                placeholder="e.g., My backyard, Central Park, Joe's Cigar Lounge"
                placeholderTextColor={colors.textTertiary}
                style={{
                  backgroundColor: colors.surface2,
                  color: colors.textPrimary,
                  fontSize: 16,
                  padding: 16,
                  borderRadius: 12,
                }}
              />
            </View>

            {/* Tiny map to fine-tune drop location */}
            <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
              <Text style={{ color: colors.textSecondary, marginBottom: 8 }}>Adjust pin location</Text>
              <View style={{ height: 160, borderRadius: 12, overflow: 'hidden' }}>
                <MapView
                  style={{ flex: 1 }}
                  initialRegion={{
                    latitude: pinLocation?.latitude || location?.latitude || 0,
                    longitude: pinLocation?.longitude || location?.longitude || 0,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                  onPress={(e) => setPinLocation(e.nativeEvent.coordinate)}
                  userInterfaceStyle="dark"
                  customMapStyle={[]}
                  scrollEnabled
                  zoomEnabled
                >
                  {(pinLocation || location) && (
                    <Marker coordinate={pinLocation || location} />
                  )}
                </MapView>
              </View>
            </View>

            

            {/* Action Buttons */}
            <View
              style={{
                flexDirection: 'row',
                paddingHorizontal: 20,
                paddingBottom: 20,
                gap: 12,
              }}
            >
              <TouchableOpacity
                onPress={handleClose}
                style={{
                  flex: 1,
                  backgroundColor: colors.surface2,
                  paddingVertical: 16,
                  borderRadius: 12,
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    color: colors.textPrimary,
                    fontSize: 16,
                    fontWeight: '600',
                  }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleCreateSession}
                disabled={creating || !selectedCigar || !locationName.trim()}
                style={{
                  flex: 2,
                  backgroundColor: (!selectedCigar || !locationName.trim()) 
                    ? colors.textTertiary 
                    : colors.accentGold,
                  paddingVertical: 16,
                  borderRadius: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {creating ? (
                  <ActivityIndicator color={colors.bgPrimary} />
                ) : (
                  <>
                    <MapPin size={20} color={colors.bgPrimary} />
                    <Text
                      style={{
                        color: colors.bgPrimary,
                        fontSize: 16,
                        fontWeight: '600',
                        marginLeft: 8,
                      }}
                    >
                      Check In Here
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default SmokingSessionModal;