import * as React from 'react';
import { apiRequest } from '@/utils/api';

export default function useFeed() {
  const [posts, setPosts] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const load = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('[useFeed] Loading posts...');
      const res = await apiRequest('/api/posts');
      console.log('[useFeed] Response status:', res.status);
      if (!res.ok) throw new Error('Failed to load feed');
      const data = await res.json();
      console.log('[useFeed] Posts received:', data.posts?.length || 0);
      setPosts(data.posts || []);
    } catch (e) {
      console.error('[useFeed] Error:', e);
      setError(e.message || 'Failed to load feed');
    } finally {
      setLoading(false);
    }
  }, []);

  // Optimistic like toggle
  const toggleLike = React.useCallback((postId) => {
    setPosts(prevPosts => 
      prevPosts.map(post => {
        if (post.id === postId) {
          const wasLiked = post.liked_by_me;
          return {
            ...post,
            liked_by_me: !wasLiked,
            like_count: wasLiked ? post.like_count - 1 : post.like_count + 1,
          };
        }
        return post;
      })
    );
  }, []);

  // Remove a post (for delete)
  const removePost = React.useCallback((postId) => {
    setPosts(prevPosts => prevPosts.filter(p => p.id !== postId));
  }, []);

  React.useEffect(() => {
    console.log('[useFeed] Initial load on mount');
    load();
  }, [load]);

  return { posts, loading, error, load, toggleLike, removePost };
}
