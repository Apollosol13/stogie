import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AlertTriangle } from 'lucide-react-native';

const colors = {
  bgPrimary: '#0F0F0F',
  surface: '#1A1A1A',
  textPrimary: '#FFFFFF',
  textSecondary: '#B0B0B0',
  accentGold: '#D4B896',
  accentRed: '#FF4444',
};

export default function HealthWarningModal({ visible, onAcknowledge }) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      animationType="fade"
      presentationStyle="overFullScreen"
      transparent={false}
      onRequestClose={() => {}} // Prevent dismissal - must acknowledge
    >
      <View
        style={{
          flex: 1,
          backgroundColor: colors.bgPrimary,
          paddingTop: insets.top,
        }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            padding: 24,
            paddingBottom: insets.bottom + 24,
          }}
        >
          {/* Warning Icon */}
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: colors.accentRed,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <AlertTriangle size={40} color={colors.textPrimary} />
            </View>
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: 28,
                fontWeight: '700',
                textAlign: 'center',
              }}
            >
              Important Health Warning
            </Text>
          </View>

          {/* Warning Content */}
          <View
            style={{
              backgroundColor: colors.surface,
              padding: 24,
              borderRadius: 16,
              borderWidth: 2,
              borderColor: colors.accentRed,
              marginBottom: 24,
            }}
          >
            <Text
              style={{
                color: colors.accentRed,
                fontSize: 16,
                fontWeight: '700',
                marginBottom: 16,
              }}
            >
              ⚠️ SURGEON GENERAL'S WARNING
            </Text>

            <Text
              style={{
                color: colors.textPrimary,
                fontSize: 15,
                lineHeight: 24,
                marginBottom: 16,
              }}
            >
              Cigar smoking can cause cancers of the mouth and throat, even if you do not inhale. 
              Cigar smoking is also linked to cancer of the lungs and can increase the risk of heart disease and stroke.
            </Text>

            <Text
              style={{
                color: colors.textPrimary,
                fontSize: 15,
                lineHeight: 24,
                marginBottom: 16,
              }}
            >
              Tobacco use can cause serious health issues including cancer, heart disease, lung disease, and premature death.
            </Text>

            <View
              style={{
                height: 1,
                backgroundColor: colors.accentRed,
                marginVertical: 16,
              }}
            />

            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 14,
                lineHeight: 22,
              }}
            >
              <Text style={{ fontWeight: '700' }}>About This App:{'\n'}</Text>
              Stogie is designed for adult cigar enthusiasts (21+) to catalog and manage their collections. 
              This app is NOT intended to encourage tobacco use or promote smoking to non-users.
              {'\n\n'}
              This is a collection management tool, similar to wine or whiskey collection apps, for existing adult enthusiasts.
            </Text>
          </View>

          {/* Acknowledgment Button */}
          <TouchableOpacity
            onPress={onAcknowledge}
            style={{
              backgroundColor: colors.accentGold,
              paddingVertical: 18,
              borderRadius: 12,
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                color: colors.bgPrimary,
                fontSize: 18,
                fontWeight: '700',
              }}
            >
              I Understand & Acknowledge
            </Text>
          </TouchableOpacity>

          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 12,
              textAlign: 'center',
              lineHeight: 18,
            }}
          >
            By continuing, you confirm you are 21 years or older and understand the health risks associated with tobacco use.
          </Text>
        </ScrollView>
      </View>
    </Modal>
  );
}

