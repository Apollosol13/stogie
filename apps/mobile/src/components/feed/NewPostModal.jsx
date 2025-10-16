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
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Camera, Image as ImageIcon, X } from 'lucide-react-native';
import { apiRequest } from '@/utils/api';

const colors = {
  bgPrimary: '#0F0F0F',
  surface: '#1A1A1A',
  surface2: '#242424',
  textPrimary: '#FFFFFF',
  textSecondary: '#B0B0B0',
  accentGold: '#D4B896',
};

export default function NewPostModal({ visible, onClose, onPosted }) {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(1); // 1 = select method, 2 = caption
  const [selectedImage, setSelectedImage] = useState(null);
  const [caption, setCaption] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Reset state when modal closes
  React.useEffect(() => {
    if (!visible) {
      setStep(1);
      setSelectedImage(null);
      setCaption('');
    }
  }, [visible]);

  const handleCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera access is needed to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (!result.canceled && result.assets?.length) {
        setSelectedImage(result.assets[0]);
        setStep(2);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to open camera');
    }
  };

  const handleGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Photo library access is needed to select photos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.9,
      });

      if (!result.canceled && result.assets?.length) {
        setSelectedImage(result.assets[0]);
        setStep(2);
      }
    } catch (error) {
      console.error('Gallery error:', error);
      Alert.alert('Error', 'Failed to open photo library');
    }
  };

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
      setSelectedImage(null);
      setStep(1);
      onPosted?.();
      onClose?.();
    } catch (error) {
      console.error('Post error:', error);
      Alert.alert('Error', error.message || 'Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    setStep(1);
    setSelectedImage(null);
  };

  // Step 1: Bottom Sheet Selection
  if (step === 1) {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={onClose}
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'flex-end',
          }}
        >
          <TouchableOpacity activeOpacity={1}>
            <View
              style={{
                backgroundColor: colors.surface,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                paddingBottom: insets.bottom + 20,
              }}
            >
              {/* Header */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingHorizontal: 20,
                  paddingTop: 20,
                  paddingBottom: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.surface2,
                }}
              >
                <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: '700' }}>
                  Create Post
                </Text>
                <TouchableOpacity onPress={onClose}>
                  <X size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Options */}
              <View style={{ paddingTop: 8 }}>
                {/* Camera Option */}
                <TouchableOpacity
                  onPress={handleCamera}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 20,
                    paddingVertical: 16,
                  }}
                >
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      backgroundColor: colors.surface2,
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 16,
                    }}
                  >
                    <Camera size={24} color={colors.accentGold} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '600' }}>
                      Take Photo
                    </Text>
                    <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 2 }}>
                      Use camera to capture a moment
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Gallery Option */}
                <TouchableOpacity
                  onPress={handleGallery}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 20,
                    paddingVertical: 16,
                  }}
                >
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      backgroundColor: colors.surface2,
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 16,
                    }}
                  >
                    <ImageIcon size={24} color={colors.accentGold} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '600' }}>
                      Choose from Library
                    </Text>
                    <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 2 }}>
                      Select from your photo library
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    );
  }

  // Step 2: Caption Screen
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleBack}
    >
      <View style={{ flex: 1, backgroundColor: colors.bgPrimary, paddingTop: insets.top }}>
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
          <TouchableOpacity onPress={handleBack}>
            <Text style={{ color: colors.textPrimary, fontSize: 24 }}>‹</Text>
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

        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {/* Image Preview */}
          <View
            style={{
              width: '100%',
              aspectRatio: 1,
              backgroundColor: colors.surface,
              borderRadius: 12,
              overflow: 'hidden',
              marginBottom: 20,
            }}
          >
            <Image
              source={{ uri: selectedImage?.uri }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          </View>

          {/* Caption Input */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ color: colors.textSecondary, fontSize: 14, marginBottom: 8 }}>
              Add a caption...
            </Text>
            <TextInput
              placeholder="Write a caption..."
              placeholderTextColor={colors.textSecondary}
              value={caption}
              onChangeText={setCaption}
              style={{
                backgroundColor: colors.surface,
                color: colors.textPrimary,
                borderRadius: 12,
                padding: 16,
                minHeight: 100,
                textAlignVertical: 'top',
              }}
              multiline
              maxLength={2000}
            />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
