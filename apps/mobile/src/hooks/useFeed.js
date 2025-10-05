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
      const res = await apiRequest('/api/posts');
      if (!res.ok) throw new Error('Failed to load feed');
      const data = await res.json();
      setPosts(data.posts || []);
    } catch (e) {
      setError(e.message || 'Failed to load feed');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  return { posts, loading, error, load };
}


