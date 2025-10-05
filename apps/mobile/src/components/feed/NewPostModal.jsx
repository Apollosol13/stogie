import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, Image, TextInput, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
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
  const [image, setImage] = useState(null);
  const [caption, setCaption] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const res = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, quality: 0.85 });
    if (!res.canceled) {
      setImage(res.assets[0]);
    }
  };

  const submit = async () => {
    if (!image) return;
    setSubmitting(true);
    try {
      console.log('[NewPost] Starting upload...');
      const formData = new FormData();
      formData.append('image', {
        uri: image.uri,
        name: `post-${Date.now()}.jpg`,
        type: image.mimeType || 'image/jpeg',
      });

      const uploadRes = await apiRequest('/api/upload', { method: 'POST', body: formData });
      console.log('[NewPost] Upload status:', uploadRes.status);
      
      if (!uploadRes.ok) {
        const errorText = await uploadRes.text();
        console.error('[NewPost] Upload error:', errorText);
        Alert.alert('Upload Failed', errorText);
        throw new Error('Upload failed');
      }
      
      const { url } = await uploadRes.json();
      console.log('[NewPost] Upload success, URL:', url);

      const createRes = await apiRequest('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_url: url, caption: caption.trim() || null })
      });
      console.log('[NewPost] Create post status:', createRes.status);
      
      if (!createRes.ok) {
        const errorText = await createRes.text();
        console.error('[NewPost] Create post error:', errorText);
        Alert.alert('Post Failed', errorText);
        throw new Error('Create post failed');
      }

      console.log('[NewPost] Success! Refreshing feed...');
      setImage(null);
      setCaption('');
      onPosted?.();
      onClose?.();
    } catch (e) {
      console.error('[NewPost] Error:', e);
      Alert.alert('Error', e.message || 'Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
        <View style={{ padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <TouchableOpacity onPress={onClose}><Text style={{ color: colors.textSecondary, fontSize: 16 }}>Cancel</Text></TouchableOpacity>
          <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: '700' }}>New Post</Text>
          <TouchableOpacity disabled={!image || submitting} onPress={submit}>
            {submitting ? (
              <ActivityIndicator color={colors.accentGold} />
            ) : (
              <Text style={{ color: !image ? colors.textSecondary : colors.accentGold, fontSize: 16, fontWeight: '700' }}>Post</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={{ padding: 16 }}>
          <TouchableOpacity onPress={pickImage} style={{ backgroundColor: colors.surface, borderRadius: 12, height: 240, alignItems: 'center', justifyContent: 'center' }}>
            {image ? (
              <Image source={{ uri: image.uri }} style={{ width: '100%', height: '100%', borderRadius: 12 }} resizeMode="cover" />
            ) : (
              <Text style={{ color: colors.textSecondary }}>Tap to pick a photo</Text>
            )}
          </TouchableOpacity>

          <TextInput
            placeholder="Write a caption..."
            placeholderTextColor={colors.textSecondary}
            value={caption}
            onChangeText={setCaption}
            style={{ marginTop: 12, backgroundColor: colors.surface, color: colors.textPrimary, borderRadius: 12, padding: 12 }}
            multiline
          />
        </View>
      </View>
    </Modal>
  );
}
