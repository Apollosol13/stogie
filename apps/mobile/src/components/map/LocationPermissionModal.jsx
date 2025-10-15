import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapPin, Target, Shield, X } from 'lucide-react-native';

const { height } = Dimensions.get('window');

const colors = {
  bgPrimary: '#0F0F0F',
  surface: '#1A1A1A',
  surface2: '#242424',
  textPrimary: '#FFFFFF',
  textSecondary: '#B0B0B0',
  textTertiary: '#6B7280',
  accentGold: '#D4B896',
  accentGreen: '#68D391',
  overlay: 'rgba(0, 0, 0, 0.8)',
};

export default function LocationPermissionModal({ 
  isVisible, 
  onAllow
}) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={isVisible}
      animationType="fade"
      transparent={true}
      onRequestClose={() => {}} // Prevent Android back button from dismissing
    >
      <View style={{ flex: 1, backgroundColor: colors.overlay }}>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 32,
          }}
        >
          {/* Modal Content */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 24,
              padding: 32,
              width: '100%',
              maxWidth: 400,
              alignItems: 'center',
            }}
          >
            {/* Icon */}
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: colors.accentGold + '20',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 24,
              }}
            >
              <MapPin size={40} color={colors.accentGold} />
            </View>

            {/* Title */}
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: 24,
                fontWeight: '700',
                textAlign: 'center',
                marginBottom: 12,
              }}
            >
              Enable Location Access
            </Text>

            {/* Description */}
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 16,
                textAlign: 'center',
                lineHeight: 24,
                marginBottom: 32,
              }}
            >
              To help you discover nearby cigar lounges and tobacco shops, we'd like to access your location. This will enable features like:
            </Text>

            {/* Features List */}
            <View style={{ width: '100%', marginBottom: 32 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 16,
                }}
              >
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: colors.accentGreen + '20',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 16,
                  }}
                >
                  <Target size={16} color={colors.accentGreen} />
                </View>
                <Text
                  style={{
                    color: colors.textPrimary,
                    fontSize: 16,
                    flex: 1,
                  }}
                >
                  Find venues near you automatically
                </Text>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 16,
                }}
              >
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: colors.accentGold + '20',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 16,
                  }}
                >
                  <MapPin size={16} color={colors.accentGold} />
                </View>
                <Text
                  style={{
                    color: colors.textPrimary,
                    fontSize: 16,
                    flex: 1,
                  }}
                >
                  Post smoking sessions on the map
                </Text>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: colors.surface2,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 16,
                  }}
                >
                  <Shield size={16} color={colors.textSecondary} />
                </View>
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontSize: 14,
                    flex: 1,
                  }}
                >
                  Your location data stays private and secure
                </Text>
              </View>
            </View>

            {/* Button */}
            <TouchableOpacity
              onPress={onAllow}
              style={{
                backgroundColor: colors.accentGold,
                paddingVertical: 16,
                borderRadius: 12,
                alignItems: 'center',
                width: '100%',
              }}
            >
              <Text
                style={{
                  color: colors.bgPrimary,
                  fontSize: 16,
                  fontWeight: '600',
                }}
              >
                Continue
              </Text>
            </TouchableOpacity>

            {/* Small disclaimer */}
            <Text
              style={{
                color: colors.textTertiary,
                fontSize: 12,
                textAlign: 'center',
                marginTop: 16,
                lineHeight: 16,
              }}
            >
              You'll be able to allow or deny location access in the next step
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}