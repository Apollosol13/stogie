import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, AlertCircle } from 'lucide-react-native';
import { apiRequest } from '@/utils/api';

const colors = {
  bgPrimary: '#0F0F0F',
  surface: '#1A1A1A',
  surface2: '#242424',
  textPrimary: '#FFFFFF',
  textSecondary: '#B0B0B0',
  textTertiary: '#6B7280',
  accentGold: '#D4B896',
  accentRed: '#FF4444',
};

const REPORT_REASONS = [
  'Spam or misleading',
  'Harassment or hate speech',
  'Violence or dangerous behavior',
  'Inappropriate content',
  'Intellectual property violation',
  'Other'
];

export default function ReportModal({ visible, onClose, contentType, contentId, postId }) {
  const insets = useSafeAreaInsets();
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const reason = selectedReason === 'Other' ? customReason : selectedReason;
    
    if (!reason.trim()) {
      Alert.alert('Required', 'Please select or enter a reason for reporting');
      return;
    }

    setSubmitting(true);
    try {
      let endpoint;
      if (contentType === 'post') {
        endpoint = `/api/posts/${contentId}/report`;
      } else {
        endpoint = `/api/posts/${postId}/comments/${contentId}/report`;
      }

      const response = await apiRequest(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reason.trim() }),
      });

      if (response.ok) {
        Alert.alert(
          'Report Submitted',
          'Thank you for helping keep our community safe. We will review this report within 24 hours.'
        );
        setSelectedReason('');
        setCustomReason('');
        onClose();
      } else {
        const error = await response.json();
        Alert.alert('Error', error.error || 'Failed to submit report');
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      Alert.alert('Error', 'Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          justifyContent: 'flex-end',
        }}
      >
        <View
          style={{
            backgroundColor: colors.surface,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingTop: 20,
            paddingBottom: insets.bottom + 20,
            maxHeight: '80%',
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 20,
              marginBottom: 20,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={24} color={colors.accentRed} />
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: 20,
                  fontWeight: '700',
                }}
              >
                Report {contentType === 'post' ? 'Post' : 'Comment'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: colors.surface2,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <X size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Reasons List */}
          <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
            <Text style={{ color: colors.textSecondary, marginBottom: 12 }}>
              Why are you reporting this {contentType}?
            </Text>
            {REPORT_REASONS.map((reason) => (
              <TouchableOpacity
                key={reason}
                onPress={() => setSelectedReason(reason)}
                style={{
                  backgroundColor:
                    selectedReason === reason ? colors.accentGold + '20' : colors.surface2,
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  borderRadius: 12,
                  marginBottom: 8,
                  borderWidth: selectedReason === reason ? 1 : 0,
                  borderColor: colors.accentGold,
                }}
              >
                <Text
                  style={{
                    color: selectedReason === reason ? colors.accentGold : colors.textPrimary,
                    fontSize: 15,
                  }}
                >
                  {reason}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Custom Reason Input */}
          {selectedReason === 'Other' && (
            <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
              <TextInput
                value={customReason}
                onChangeText={setCustomReason}
                placeholder="Please describe the issue..."
                placeholderTextColor={colors.textTertiary}
                multiline
                numberOfLines={3}
                style={{
                  backgroundColor: colors.surface2,
                  color: colors.textPrimary,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  fontSize: 15,
                  minHeight: 80,
                  textAlignVertical: 'top',
                }}
              />
            </View>
          )}

          {/* Submit Button */}
          <View style={{ paddingHorizontal: 20 }}>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!selectedReason || submitting}
              style={{
                backgroundColor: !selectedReason || submitting ? colors.surface2 : colors.accentRed,
                paddingVertical: 16,
                borderRadius: 12,
                alignItems: 'center',
              }}
            >
              {submitting ? (
                <ActivityIndicator color={colors.textPrimary} />
              ) : (
                <Text
                  style={{
                    color: !selectedReason ? colors.textTertiary : colors.textPrimary,
                    fontSize: 16,
                    fontWeight: '600',
                  }}
                >
                  Submit Report
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

