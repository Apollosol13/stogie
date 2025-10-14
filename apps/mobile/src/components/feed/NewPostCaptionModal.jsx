import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { apiRequest } from '@/utils/api';

const colors = {
  bgPrimary: '#0F0F0F',
  surface: '#1A1A1A',
  surface2: '#242424',
  textPrimary: '#FFFFFF',
  textSecondary: '#B0B0B0',
  accentGold: '#D4B896',
};

export default function NewPostCaptionModal({ visible, onClose, selectedImage, onPosted }) {
  const insets = useSafeAreaInsets();
  const [caption, setCaption] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedImage || submitting) return;

    try {
      setSubmitting(true);

      // Upload image
      const formData = new FormData();
      formData.append('image', {
        uri: selectedImage.uri,
        name: `post-${Date.now()}.jpg`,
        type: selectedImage.mimeType || 'image/jpeg',
      });

      const uploadRes = await apiRequest('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error('Failed to upload image');
      }

      const { url } = await uploadRes.json();

      // Create post
      const createRes = await apiRequest('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: url,
          caption: caption.trim() || null,
        }),
      });

      if (!createRes.ok) {
        throw new Error('Failed to create post');
      }

      // Success
      setCaption('');
      onPosted?.();
      onClose();
    } catch (error) {
      console.error('Post error:', error);
      Alert.alert('Error', error.message || 'Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, backgroundColor: colors.bgPrimary }}
      >
        <View style={{ flex: 1, paddingTop: insets.top }}>
          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderBottomColor: colors.surface2,
            }}
          >
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={colors.textSecondary} />
            </TouchableOpacity>
            <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: '700' }}>
              New Post
            </Text>
            <TouchableOpacity onPress={handleSubmit} disabled={submitting}>
              {submitting ? (
                <ActivityIndicator color={colors.accentGold} />
              ) : (
                <Text
                  style={{
                    color: colors.accentGold,
                    fontSize: 16,
                    fontWeight: '700',
                  }}
                >
                  Share
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={{ flexDirection: 'row', padding: 16 }}>
            {selectedImage && (
              <Image
                source={{ uri: selectedImage.uri }}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 8,
                  marginRight: 16,
                  backgroundColor: colors.surface,
                }}
                resizeMode="cover"
              />
            )}
            <TextInput
              placeholder="Write a caption..."
              placeholderTextColor={colors.textSecondary}
              value={caption}
              onChangeText={setCaption}
              style={{
                flex: 1,
                color: colors.textPrimary,
                fontSize: 16,
                paddingTop: 0,
                textAlignVertical: 'top',
              }}
              multiline
              maxLength={2000}
              autoFocus
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

