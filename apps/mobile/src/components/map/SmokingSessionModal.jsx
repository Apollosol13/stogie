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
import { SvgXml } from 'react-native-svg';
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

// SVG icon for cigarette/cigar sticker
const CIGAR_SVG = `<?xml version="1.0" encoding="UTF-8"?>${
  // Strip the outer svg id to avoid duplicates
  '<svg height="512pt" viewBox="0 -5 512 511" width="512pt" xmlns="http://www.w3.org/2000/svg"><path d="m413.539062 411.808594c6.457032 0 12.320313-2.527344 16.660157-6.652344 4.335937 4.125 10.203125 6.652344 16.667969 6.652344 6.472656 0 12.351562-2.550782 16.695312-6.695313 4.425781 4.175781 10.367188 6.695313 16.632812 6.695313 11.527344 0 21.691407-8.472656 23.789063-19.800782 1.402344-7.570312-1.03125-15.363281-6.144531-20.890624 4.0625-4.328126 6.554687-10.148438 6.554687-16.546876 0-6.390624-2.476562-12.199218-6.523437-16.523437 4.046875-4.328125 6.523437-10.136719 6.523437-16.523437 0-6.390626-2.476562-12.199219-6.523437-16.523438 4.046875-4.328125 6.523437-10.136719 6.523437-16.527344 0-6.414062-2.503906-12.246094-6.585937-16.578125 3.097656-3.296875 5.316406-7.4375 6.175781-12.066406 1.804687-9.738281-2.734375-19.929687-11.214844-25.058594-8.808593-5.332031-20.25-4.457031-28.148437 2.144531-.378906.316407-.734375.652344-1.089844.988282-4.339844-4.128906-10.207031-6.664063-16.664062-6.664063-6.46875 0-12.332032 2.523438-16.667969 6.648438-4.339844-4.125-10.203125-6.648438-16.660157-6.648438zm0 0" fill="#e6e6e6"></path><path d="m504.398438 354.570312c0 6.398438-2.492188 12.214844-6.558594 16.546876 5.109375 5.523437 7.554687 13.320312 6.144531 20.894531-2.101563 11.324219-12.257813 19.789062-23.785156 19.789062-6.265625 0-12.207031-2.511719-16.636719-6.691406-4.339844 4.148437-10.222656 6.691406-16.691406 6.691406s-12.335938-2.523437-16.667969-6.640625c-4.335937 4.117188-10.207031 6.640625-16.667969 6.640625v-57.726562c6.460938 0 12.332032-2.527344 16.667969-6.652344 4.332031 4.125 10.199219 6.652344 16.667969 6.652344s12.351562-2.546875 16.691406-6.691407c4.429688 4.175782 10.371094 6.691407 16.636719 6.691407 8.625 0 16.496093-4.746094 20.773437-11.894531 2.179688 3.621093 3.425782 7.859374 3.425782 12.390624zm0 0" fill="#ccc"></path><path d="m413.535156 231.234375v180.566406h-340.960937c-35.878907 0-64.96875-29.085937-64.96875-64.964843v-50.625c0-1.195313.03125-2.382813.09375-3.558594 1.855469-34.226563 30.191406-61.417969 64.875-61.417969zm0 0" fill="#7c4635"></path><path d="m413.535156 231.234375v122.839844h-340.960937c-34.683594 0-63.019531-27.183594-64.875-61.421875 1.855469-34.226563 30.191406-61.417969 64.875-61.417969zm0 0" fill="#996652"></path><path d="m250.8125 231.238281-45.746094 90.285157 45.746094 90.285156h-110.917969l-45.75-90.285156 45.75-90.285157" fill="#edac29"></path><path d="m205.0625 321.519531 16.496094 32.554688h-110.914063l-16.496093-32.554688 45.746093-90.285156h110.914063zm0 0" fill="#fcc854"></path><path d="m181.929688 321.523438c0 14.59375-11.828126 26.421874-26.421876 26.421874s-26.425781-11.828124-26.425781-26.421874 11.832031-26.425782 26.425781-26.425782 26.421876 11.832032 26.421876 26.425782zm0 0" fill="#f7583e"></path><path d="m436.007812 207.636719c-8.402343 0-15.210937-6.808594-15.210937-15.207031v-36.335938c0-22.589844 18.378906-40.972656 40.972656-40.972656h1.320313c5.820312 0 10.558594-4.734375 10.558594-10.554688 0-5.820312-4.734376-10.558594-10.558594-10.558594h-184.308594c-23.6875 0-42.953125-19.269531-42.953125-42.953124 0-23.683594 19.265625-42.953126 42.953125-42.953126h75.308594c8.398437 0 15.207031 6.808594 15.207031 15.210938 0 8.398438-6.808594 15.207031-15.207031 15.207031h-75.308594c-6.914062 0-12.539062 5.625-12.539062 12.535157 0 6.914062 5.625 12.539062 12.539062 12.539062h184.308594c22.59375 0 40.972656 18.378906 40.972656 40.972656 0 22.589844-18.378906 40.972656-40.972656 40.972656h-1.320313c-5.820312 0-10.554687 4.734376-10.554687 10.554688v36.335938c0 8.398437-6.808594 15.207031-15.207032 15.207031zm0 0" fill="#e6e6e6"></path><path d="m507.375 305c3.011719-4.945312 4.625-10.632812 4.625-16.527344 0-5.914062-1.628906-11.621094-4.664062-16.574218 2.023437-3.285157 3.425781-6.902344 4.125-10.6875 2.394531-12.917969-3.535157-26.160157-14.757813-32.949219-10.304687-6.234375-23.109375-6.070313-33.164063.089843-4.972656-3.074218-10.714843-4.71875-16.671874-4.71875-5.960938 0-11.703126 1.640626-16.667969 4.703126-4.96875-3.0625-10.703125-4.703126-16.660157-4.703126h-340.960937c-40.019531 0-72.578125 32.558594-72.578125 72.578126v50.621093c0 40.019531 32.558594 72.582031 72.578125 72.582031h115.039063c4.199218 0 7.601562-3.40625 7.601562-7.605468 0-4.199219-3.402344-7.605469-7.601562-7.605469h-43.054688l-41.894531-82.679687 41.894531-82.683594h93.871094l-40.152344 79.246094c-1.09375 2.160156-1.09375 4.714843 0 6.875l40.152344 79.242187h-20.398438c-4.199218 0-7.605468 3.40625-7.605468 7.605469 0 4.199218 3.40625 7.605468 7.605468 7.605468h195.503906c5.957032 0 11.691407-1.644531 16.660157-4.707031 4.96875 3.0625 10.707031 4.707031 16.667969 4.707031 5.972656 0 11.726562-1.65625 16.707031-4.742187 4.992187 3.085937 10.714843 4.742187 16.621093 4.742187 15.078126 0 28.519532-11.1875 31.265626-26.019531 1.421874-7.65625-.113282-15.601562-4.128907-22.242187 3.039063-4.953125 4.667969-10.667969 4.667969-16.582032 0-5.890624-1.613281-11.582031-4.625-16.523437 3.011719-4.941406 4.625-10.632813 4.625-16.523437 0-5.890626-1.613281-11.582032-4.625-16.523438zm-420.011719 13.085938c-1.097656 2.160156-1.097656 4.710937 0 6.871093l40.152344 79.246094h-54.9375c-31.632813 0-57.371094-25.738281-57.371094-57.371094v-50.621093c0-31.632813 25.738281-57.371094 57.371094-57.371094h54.9375zm126.226563 3.4375 41.894531-82.683594h150.453125v165.363281h-150.453125zm278.726562-11.332032c2.886719 3.085938 4.476563 7.109375 4.476563 11.332032 0 4.21875-1.589844 8.242187-4.476563 11.328124-2.730468 2.921876-2.730468 7.464844 0 10.386719 2.886719 3.085938 4.476563 7.109375 4.476563 11.332031 0 4.222657-1.597657 8.253907-4.5 11.34375-2.730469 2.910157-2.746094 7.441407-.035157 10.371094 3.605469 3.894532 5.191407 9.253906 4.25 14.335938-1.433593 7.742187-8.445312 13.582031-16.3125 13.582031-4.144531 0-8.300781-1.683594-11.414062-4.621094-2.941406-2.777343-7.542969-2.761719-10.46875.027344-3.101562 2.960937-7.167969 4.59375-11.445312 4.59375-4.28125 0-8.339844-1.617187-11.429688-4.558594-2.9375-2.789062-7.542969-2.789062-10.480469 0-1.148437 1.09375-2.433593 2.003907-3.8125 2.714844v-161.679687c1.378907.714843 2.664063 1.625 3.8125 2.71875 2.9375 2.789062 7.542969 2.789062 10.480469 0 3.089844-2.941407 7.148438-4.558594 11.429688-4.558594 4.265624 0 8.324218 1.625 11.425781 4.570312 2.933593 2.792969 7.539062 2.792969 10.476562.003906.238281-.226562.472657-.453124.726563-.664062 5.382812-4.5 13.332031-5.105469 19.335937-1.476562 5.746094 3.480468 8.902344 7.675781 17.171874-.5625 3.039063-2.027343 5.890626-4.238281 8.242188-2.753906 2.929688-2.75 7.496094.003907 10.421875 2.914062 3.089844 4.519531 7.128906 4.519531 11.367187 0 4.21875-1.589844 8.242188-4.476563 11.328126-2.730468 2.921874-2.730468 7.464843 0 10.386718z"/></svg>'
}`;

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
        sticker: selectedSticker || null,
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
                  { key: 'marker_green', label: 'pin' },
                  { key: 'classic', label: 'svg' },
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
                    {s.key === 'marker_green' ? (
                      <MapPin size={22} color={selectedSticker === s.key ? colors.bgPrimary : colors.accentGreen} />
                    ) : s.key === 'classic' ? (
                      <SvgXml xml={CIGAR_SVG} width={28} height={22} />
                    ) : (
                      <Text style={{ fontSize: 22, color: selectedSticker === s.key ? colors.bgPrimary : colors.textPrimary }}>
                        {s.label}
                      </Text>
                    )}
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