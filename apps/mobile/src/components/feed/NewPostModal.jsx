import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  Image, 
  TextInput, 
  ActivityIndicator, 
  Alert, 
  FlatList, 
  Dimensions,
  ScrollView 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { Camera } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiRequest } from '@/utils/api';

const colors = {
  bgPrimary: '#0F0F0F',
  surface: '#1A1A1A',
  surface2: '#242424',
  textPrimary: '#FFFFFF',
  textSecondary: '#B0B0B0',
  accentGold: '#D4B896',
};

const SCREEN_WIDTH = Dimensions.get('window').width;
const IMAGE_SIZE = SCREEN_WIDTH / 3 - 4;

export default function NewPostModal({ visible, onClose, onPosted }) {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(1); // 1 = pick image, 2 = caption/details
  const [recentPhotos, setRecentPhotos] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [caption, setCaption] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  // Load recent photos when modal opens
  useEffect(() => {
    if (visible) {
      loadRecentPhotos();
    } else {
      // Reset when modal closes
      setStep(1);
      setSelectedImage(null);
      setCaption('');
      setRecentPhotos([]);
    }
  }, [visible]);

  const loadRecentPhotos = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      setHasPermission(status === 'granted');
      
      if (status === 'granted') {
        const album = await MediaLibrary.getAlbumAsync('Recent');
        const media = await MediaLibrary.getAssetsAsync({
          album: album,
          first: 50,
          mediaType: 'photo',
          sortBy: MediaLibrary.SortBy.creationTime,
        });
        setRecentPhotos(media.assets);
      }
    } catch (error) {
      console.error('Error loading photos:', error);
    }
  };

  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required to take photos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.85,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0]);
      setStep(2);
    }
  };

  const selectPhoto = (asset) => {
    setSelectedImage({
      uri: asset.uri,
      width: asset.width,
      height: asset.height,
    });
  };

  const handleNext = () => {
    if (selectedImage) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const handlePost = async () => {
    if (!selectedImage) return;
    
    setSubmitting(true);
    try {
      // Upload image
      const formData = new FormData();
      formData.append('image', {
        uri: selectedImage.uri,
        name: `post-${Date.now()}.jpg`,
        type: 'image/jpeg',
      });

      const uploadRes = await apiRequest('/api/upload', { 
        method: 'POST', 
        body: formData 
      });
      
      if (!uploadRes.ok) {
        throw new Error('Upload failed');
      }
      
      const { url } = await uploadRes.json();

      // Create post
      const createRes = await apiRequest('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          image_url: url, 
          caption: caption.trim() || null 
        })
      });
      
      if (!createRes.ok) {
        throw new Error('Failed to create post');
      }

      // Success
      setSelectedImage(null);
      setCaption('');
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

  // Step 1: Image Selection
  if (step === 1) {
    return (
      <Modal 
        visible={visible} 
        animationType="slide" 
        presentationStyle="fullScreen"
        onRequestClose={onClose}
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
            }}
          >
            <TouchableOpacity onPress={onClose}>
              <Text style={{ color: colors.textPrimary, fontSize: 24 }}>✕</Text>
            </TouchableOpacity>
            <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: '700' }}>
              New post
            </Text>
            <TouchableOpacity 
              onPress={handleNext} 
              disabled={!selectedImage}
            >
              <Text 
                style={{ 
                  color: selectedImage ? colors.accentGold : colors.textSecondary, 
                  fontSize: 16,
                  fontWeight: '600'
                }}
              >
                Next
              </Text>
            </TouchableOpacity>
          </View>

          {/* Selected Image Preview */}
          {selectedImage && (
            <View style={{ width: '100%', aspectRatio: 1, backgroundColor: colors.surface }}>
              <Image 
                source={{ uri: selectedImage.uri }} 
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
            </View>
          )}

          {/* Recent Label */}
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 12,
          }}>
            <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '600' }}>
              Recent
            </Text>
          </View>

          {/* Photo Grid */}
          {!hasPermission ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
              <Text style={{ color: colors.textSecondary, textAlign: 'center', marginBottom: 16 }}>
                Photo library access is needed to display recent photos
              </Text>
              <TouchableOpacity 
                onPress={loadRecentPhotos}
                style={{
                  backgroundColor: colors.accentGold,
                  paddingHorizontal: 24,
                  paddingVertical: 12,
                  borderRadius: 8,
                }}
              >
                <Text style={{ color: colors.bgPrimary, fontWeight: '600' }}>
                  Grant Permission
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={[{ id: 'camera' }, ...recentPhotos]}
              keyExtractor={(item) => item.id || item.uri}
              numColumns={3}
              contentContainerStyle={{ paddingBottom: 20 }}
              renderItem={({ item }) => {
                if (item.id === 'camera') {
                  return (
                    <TouchableOpacity
                      onPress={openCamera}
                      style={{
                        width: IMAGE_SIZE,
                        height: IMAGE_SIZE,
                        margin: 2,
                        backgroundColor: colors.surface,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Camera size={32} color={colors.textSecondary} />
                    </TouchableOpacity>
                  );
                }

                const isSelected = selectedImage?.uri === item.uri;
                return (
                  <TouchableOpacity
                    onPress={() => selectPhoto(item)}
                    style={{
                      width: IMAGE_SIZE,
                      height: IMAGE_SIZE,
                      margin: 2,
                      borderWidth: isSelected ? 3 : 0,
                      borderColor: colors.accentGold,
                    }}
                  >
                    <Image 
                      source={{ uri: item.uri }} 
                      style={{ width: '100%', height: '100%' }}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </View>
      </Modal>
    );
  }

  // Step 2: Caption & Details
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
            borderBottomColor: colors.surface,
          }}
        >
          <TouchableOpacity onPress={handleBack}>
            <Text style={{ color: colors.textPrimary, fontSize: 24 }}>‹</Text>
          </TouchableOpacity>
          <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: '700' }}>
            New post
          </Text>
          <TouchableOpacity 
            onPress={handlePost} 
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color={colors.accentGold} />
            ) : (
              <Text 
                style={{ 
                  color: colors.accentGold, 
                  fontSize: 16,
                  fontWeight: '600'
                }}
              >
                Share
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {/* Image Preview */}
          <View style={{ 
            width: '100%', 
            aspectRatio: 1, 
            backgroundColor: colors.surface,
            borderRadius: 12,
            overflow: 'hidden',
            marginBottom: 20,
          }}>
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
                textAlignVertical: 'top'
              }}
              multiline
              maxLength={2000}
            />
          </View>

          {/* Tag People (Coming Soon) */}
          <TouchableOpacity 
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: colors.surface,
              padding: 16,
              borderRadius: 12,
              marginBottom: 12,
              opacity: 0.5,
            }}
            disabled
          >
            <Text style={{ color: colors.textPrimary, fontSize: 16 }}>
              Tag people
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
              Coming soon
            </Text>
          </TouchableOpacity>

          {/* Add Location (Coming Soon) */}
          <TouchableOpacity 
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: colors.surface,
              padding: 16,
              borderRadius: 12,
              opacity: 0.5,
            }}
            disabled
          >
            <Text style={{ color: colors.textPrimary, fontSize: 16 }}>
              Add location
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
              Coming soon
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}
