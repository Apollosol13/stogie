import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Search as SearchIcon, User } from 'lucide-react-native';
import { router } from 'expo-router';
import { apiRequest } from '@/utils/api';

const colors = {
  bgPrimary: '#0F0F0F',
  surface: '#1A1A1A',
  surface2: '#242424',
  textPrimary: '#FFFFFF',
  textSecondary: '#B0B0B0',
  accentGold: '#D4B896',
  divider: 'rgba(255, 255, 255, 0.08)',
};

export default function UserSearchModal({ visible, onClose }) {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [isSuggested, setIsSuggested] = useState(false);

  // Load suggested users when modal opens
  React.useEffect(() => {
    if (visible && searchResults.length === 0 && !searchQuery) {
      loadSuggestedUsers();
    }
  }, [visible]);

  const loadSuggestedUsers = async () => {
    setLoading(true);
    try {
      const response = await apiRequest('/api/profiles/search');
      const data = await response.json();
      
      if (data.success) {
        setSearchResults(data.profiles || []);
        setIsSuggested(true);
      }
    } catch (error) {
      console.error('Load suggested users error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    setIsSuggested(false);
    
    if (query.trim().length === 0) {
      // Load suggested users when query is cleared
      loadSuggestedUsers();
      setSearched(false);
      return;
    }

    if (query.trim().length < 2) {
      setSearchResults([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    setSearched(true);
    
    try {
      const response = await apiRequest(`/api/profiles/search?q=${encodeURIComponent(query.trim())}`);
      const data = await response.json();
      
      if (data.success) {
        setSearchResults(data.profiles || []);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('User search error:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUserPress = (userId) => {
    onClose();
    setSearchQuery('');
    setSearchResults([]);
    setSearched(false);
    router.push(`/user/${userId}`);
  };

  const handleClose = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSearched(false);
    setIsSuggested(false);
    onClose();
  };

  const renderUserItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => handleUserPress(item.id)}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
      }}
    >
      {item.avatar_url ? (
        <Image
          source={{ uri: item.avatar_url }}
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: colors.surface2,
          }}
        />
      ) : (
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: colors.surface2,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <User size={24} color={colors.textSecondary} />
        </View>
      )}
      
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '600' }}>
          {item.full_name || 'Unknown User'}
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 2 }}>
          @{item.username}
        </Text>
        {item.bio && (
          <Text
            style={{ color: colors.textSecondary, fontSize: 13, marginTop: 4 }}
            numberOfLines={1}
          >
            {item.bio}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: colors.bgPrimary,
          paddingTop: insets.top,
        }}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: colors.divider,
          }}
        >
          <Text style={{ color: colors.textPrimary, fontSize: 20, fontWeight: '700' }}>
            Search Users
          </Text>
          <TouchableOpacity
            onPress={handleClose}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: colors.surface,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <X size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Search Input */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            margin: 20,
            backgroundColor: colors.surface,
            borderRadius: 12,
            paddingHorizontal: 16,
          }}
        >
          <SearchIcon size={20} color={colors.textSecondary} />
          <TextInput
            style={{
              flex: 1,
              color: colors.textPrimary,
              fontSize: 16,
              paddingVertical: 14,
              paddingHorizontal: 12,
            }}
            placeholder="Search by username or name..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={handleSearch}
            autoFocus
            autoCorrect={false}
            autoCapitalize="none"
          />
          {loading && <ActivityIndicator color={colors.accentGold} />}
        </View>

        {/* Results */}
        {searched && !loading && searchResults.length === 0 && (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
            <User size={48} color={colors.textSecondary} />
            <Text style={{ color: colors.textSecondary, fontSize: 16, marginTop: 16, textAlign: 'center' }}>
              No users found
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 8, textAlign: 'center' }}>
              Try a different search term
            </Text>
          </View>
        )}

        {searchResults.length > 0 && (
          <>
            {isSuggested && (
              <View style={{ paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.divider }}>
                <Text style={{ color: colors.textSecondary, fontSize: 14, fontWeight: '600' }}>
                  SUGGESTED USERS
                </Text>
              </View>
            )}
            <FlatList
              data={searchResults}
              renderItem={renderUserItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingBottom: insets.bottom }}
            />
          </>
        )}
      </View>
    </Modal>
  );
}

