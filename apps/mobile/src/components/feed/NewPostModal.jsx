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
import { AppState } from 'react-native';
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
  const [permissionInfo, setPermissionInfo] = useState(null);
  const [pickerPermission, setPickerPermission] = useState(null);
  const [endCursor, setEndCursor] = useState(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');

  // Load recent photos when modal opens and when app comes back to foreground
  useEffect(() => {
    if (visible) {
      loadRecentPhotos();
      const sub = AppState.addEventListener('change', (s) => {
        if (s === 'active') {
          loadRecentPhotos();
        }
      });
      return () => sub.remove();
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
      // iOS 14+: accessPrivileges can be 'all' | 'limited' | 'none'
      const perm = await MediaLibrary.requestPermissionsAsync({ accessPrivileges: 'all' });
      // Also ask ImagePicker for media library permission as a fallback
      const pickerPerm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      setPickerPermission(pickerPerm);
      setPermissionInfo(perm);
      const granted = perm.status === 'granted' || perm.accessPrivileges === 'all' || perm.accessPrivileges === 'limited';
      setHasPermission(granted);

      if (!granted) return;

      // Try fetching assets (no album filter – returns Recents/All Photos)
      let result = await MediaLibrary.getAssetsAsync({
        first: 60,
        mediaType: [MediaLibrary.MediaType.photo, MediaLibrary.MediaType.video],
        sortBy: MediaLibrary.SortBy.modificationTime,
      });

      // If nothing returned, try to locate the "Recents/Recent/Camera Roll" smart album
      if (!result.assets?.length) {
        const albums = await MediaLibrary.getAlbumsAsync();
        const recents = albums.find(a => ['Recents', 'Recent', 'Camera Roll', 'All Photos'].includes(a.title));
        if (recents) {
          result = await MediaLibrary.getAssetsAsync({
            album: recents,
            first: 60,
            mediaType: [MediaLibrary.MediaType.photo, MediaLibrary.MediaType.video],
            sortBy: MediaLibrary.SortBy.modificationTime,
          });
        }
      }

      // Final fallback: no filters, default sort
      if (!result.assets?.length) {
        result = await MediaLibrary.getAssetsAsync({ first: 60 });
      }

      // Retry once shortly after opening; some devices need a small delay
      if (!result.assets?.length) {
        await new Promise((r) => setTimeout(r, 300));
        result = await MediaLibrary.getAssetsAsync({ first: 60, mediaType: MediaLibrary.MediaType.photo });
      }

      setRecentPhotos(result.assets || []);
      // Save paging info if available
      if (result.endCursor !== undefined) setEndCursor(result.endCursor);
      if (result.hasNextPage !== undefined) setHasNextPage(result.hasNextPage);
      setDebugInfo(`perm:${perm.status}/${perm.accessPrivileges ?? 'n/a'} picker:${pickerPerm.status} assets:${result.assets?.length ?? 0}`);
    } catch (error) {
      console.error('Error loading photos:', error);
      setDebugInfo(`error:${String(error)}`);
    }
  };

  const loadMorePhotos = async () => {
    if (!hasNextPage || loadingMore || !endCursor) return;
    try {
      setLoadingMore(true);
      const more = await MediaLibrary.getAssetsAsync({
        first: 60,
        after: endCursor,
        mediaType: [MediaLibrary.MediaType.photo, MediaLibrary.MediaType.video],
        sortBy: MediaLibrary.SortBy.modificationTime,
      });
      setRecentPhotos((prev) => [...prev, ...(more.assets || [])]);
      if (more.endCursor !== undefined) setEndCursor(more.endCursor);
      if (more.hasNextPage !== undefined) setHasNextPage(more.hasNextPage);
    } catch (e) {
      console.error('Error loading more photos:', e);
    } finally {
      setLoadingMore(false);
    }
  };

  const pickFromLibrary = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.9,
        allowsEditing: false,
      });
      if (!result.canceled && result.assets?.length) {
        const asset = result.assets[0];
        setSelectedImage({ uri: asset.uri, width: asset.width, height: asset.height });
        setStep(2);
      }
      // Always refresh the grid after picker returns
      await loadRecentPhotos();
    } catch (e) {
      console.error('Image picker error:', e);
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

          {/* Selected Image Preview (Instagram-like center) */}
          {selectedImage && (
            <View style={{ width: '100%', aspectRatio: 1, backgroundColor: colors.surface }}>
              {/* Background blur fills square for landscape images */}
              <Image
                source={{ uri: selectedImage.uri }}
                style={{ position: 'absolute', width: '100%', height: '100%' }}
                blurRadius={20}
                resizeMode="cover"
              />
              {/* Foreground image centered; contain preserves full photo */}
              <Image 
                source={{ uri: selectedImage.uri }} 
                style={{ width: '100%', height: '100%' }}
                resizeMode="contain"
              />
            </View>
          )}

          {/* Recent Label + debug line (temporary) */}
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 12,
          }}>
            <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '600' }}>
              Recent
            </Text>
            {!!debugInfo && (
              <Text style={{ color: colors.textSecondary, fontSize: 10, marginLeft: 8 }}>
                {debugInfo}
              </Text>
            )}
          </View>

          {/* Photo Grid */}
          {!hasPermission ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
              <Text style={{ color: colors.textSecondary, textAlign: 'center', marginBottom: 16 }}>
                Photo library access is needed to display recent photos
              </Text>
              <TouchableOpacity 
                onPress={async () => {
                  if (permissionInfo?.accessPrivileges === 'limited') {
                    // Allow user to pick more photos when permission is limited
                    await MediaLibrary.presentLimitedLibraryPickerAsync();
                  }
                  await loadRecentPhotos();
                }}
                style={{
                  backgroundColor: colors.accentGold,
                  paddingHorizontal: 24,
                  paddingVertical: 12,
                  borderRadius: 8,
                }}
              >
                <Text style={{ color: colors.bgPrimary, fontWeight: '600' }}>
                  {permissionInfo?.accessPrivileges === 'limited' ? 'Select Photos…' : 'Grant Permission'}
                </Text>
              </TouchableOpacity>
              {/* Always offer a direct picker fallback */}
              <TouchableOpacity
                onPress={pickFromLibrary}
                style={{ marginTop: 12, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: colors.surface }}
              >
                <Text style={{ color: colors.textPrimary }}>Choose from Library</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {recentPhotos.length === 0 ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                  <TouchableOpacity onPress={pickFromLibrary} style={{ paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: colors.surface }}>
                    <Text style={{ color: colors.textPrimary }}>Choose from Library</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <FlatList
                  data={[{ id: 'camera' }, ...recentPhotos]}
                  keyExtractor={(item) => item.id || item.uri}
                  numColumns={3}
                  contentContainerStyle={{ paddingBottom: 20 }}
                  onEndReached={loadMorePhotos}
                  onEndReachedThreshold={0.5}
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
            </>
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
