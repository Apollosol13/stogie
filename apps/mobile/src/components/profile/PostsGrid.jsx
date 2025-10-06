import React from "react";
import { View, Text, Image, TouchableOpacity, FlatList } from "react-native";
import { colors } from "@/constants/colors";

export default function PostsGrid({ posts, onPostPress }) {
  if (!posts || posts.length === 0) {
    return (
      <View
        style={{
          padding: 40,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            color: colors.textSecondary,
            fontSize: 16,
            textAlign: "center",
            marginBottom: 8,
          }}
        >
          No posts yet
        </Text>
        <Text
          style={{
            color: colors.textTertiary,
            fontSize: 14,
            textAlign: "center",
          }}
        >
          Share your first cigar moment on the feed!
        </Text>
      </View>
    );
  }

  const renderPost = ({ item }) => (
    <TouchableOpacity
      onPress={() => onPostPress?.(item)}
      style={{
        width: "33.33%",
        aspectRatio: 1,
        padding: 1,
      }}
      activeOpacity={0.9}
    >
      <Image
        source={{ uri: item.image_url }}
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: colors.surface,
        }}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={posts}
      renderItem={renderPost}
      keyExtractor={(item) => item.id}
      numColumns={3}
      scrollEnabled={false}
      contentContainerStyle={{
        paddingHorizontal: 0,
      }}
    />
  );
}

