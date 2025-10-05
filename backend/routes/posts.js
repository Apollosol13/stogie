import express from 'express';
import supabase from '../config/database.js';

const router = express.Router();

// GET /api/posts - Get feed with counts
router.get('/', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    let userId = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }
    
    // First, get posts without the relationship
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('id,image_url,caption,created_at,user_id')
      .order('created_at', { ascending: false })
      .limit(50);
      
    if (postsError) {
      console.error('[Posts] Error fetching posts:', postsError);
      return res.status(500).json({ success: false, error: postsError.message });
    }

    if (!posts || posts.length === 0) {
      return res.json({ success: true, posts: [] });
    }

    // Get user profiles separately
    const userIds = [...new Set(posts.map(p => p.user_id))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id,username,avatar_url')
      .in('id', userIds);
    
    const profileMap = Object.fromEntries((profiles || []).map(p => [p.id, p]));

    // Get like and comment counts
    const ids = posts.map(p => p.id);
    const [{ data: likeCounts }, { data: commentCounts }, myLikesRes] = await Promise.all([
      supabase.from('post_likes').select('post_id').in('post_id', ids),
      supabase.from('post_comments').select('post_id').in('post_id', ids),
      userId ? supabase.from('post_likes').select('post_id').eq('user_id', userId).in('post_id', ids) : Promise.resolve({ data: [] })
    ]);

    // Count likes and comments per post
    const likeCountMap = {};
    (likeCounts || []).forEach(l => {
      likeCountMap[l.post_id] = (likeCountMap[l.post_id] || 0) + 1;
    });

    const commentCountMap = {};
    (commentCounts || []).forEach(c => {
      commentCountMap[c.post_id] = (commentCountMap[c.post_id] || 0) + 1;
    });

    const myLikeSet = new Set((myLikesRes?.data || []).map(r => r.post_id));

    // Combine everything
    const enrichedPosts = posts.map(p => ({
      ...p,
      profiles: profileMap[p.user_id] || null,
      like_count: likeCountMap[p.id] || 0,
      comment_count: commentCountMap[p.id] || 0,
      liked_by_me: myLikeSet.has(p.id)
    }));

    res.json({ success: true, posts: enrichedPosts });
  } catch (e) {
    console.error('[Posts] Error:', e);
    res.status(500).json({ success: false, error: 'Failed to load posts' });
  }
});

// POST /api/posts - Create post
router.post('/', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }

    const { image_url, caption } = req.body || {};
    if (!image_url) {
      return res.status(400).json({ success: false, error: 'image_url required' });
    }

    const { data, error } = await supabase
      .from('posts')
      .insert({ user_id: user.id, image_url, caption })
      .select()
      .single();
      
    if (error) {
      console.error('[Posts] Create error:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
    
    console.log('[Posts] Created post:', data.id);
    res.status(201).json({ success: true, post: data });
  } catch (e) {
    console.error('[Posts] Error:', e);
    res.status(500).json({ success: false, error: 'Failed to create post' });
  }
});

// POST /api/posts/:id/like - Toggle like
router.post('/:id/like', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }

    const postId = Number(req.params.id);
    
    const { data: existing } = await supabase
      .from('post_likes')
      .select('post_id')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existing) {
      await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', user.id);
    } else {
      await supabase.from('post_likes').insert({ post_id: postId, user_id: user.id });
    }

    const { count } = await supabase
      .from('post_likes')
      .select('post_id', { head: true, count: 'exact' })
      .eq('post_id', postId);

    res.json({ success: true, liked: !existing, like_count: count || 0 });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, error: 'Failed to like' });
  }
});

// GET /api/posts/:id/comments - Get comments
router.get('/:id/comments', async (req, res) => {
  try {
    const postId = Number(req.params.id);
    
    const { data: comments, error } = await supabase
      .from('post_comments')
      .select('id,text,created_at,user_id')
      .eq('post_id', postId)
      .order('created_at', { ascending: false });
      
    if (error) return res.status(500).json({ success: false, error: error.message });
    
    // Get profiles separately
    if (comments && comments.length > 0) {
      const userIds = [...new Set(comments.map(c => c.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id,username,avatar_url')
        .in('id', userIds);
      
      const profileMap = Object.fromEntries((profiles || []).map(p => [p.id, p]));
      
      const enrichedComments = comments.map(c => ({
        ...c,
        profiles: profileMap[c.user_id] || null
      }));
      
      return res.json({ success: true, comments: enrichedComments });
    }
    
    res.json({ success: true, comments: [] });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, error: 'Failed to load comments' });
  }
});

// POST /api/posts/:id/comments - Add comment
router.post('/:id/comments', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }

    const postId = Number(req.params.id);
    const text = (req.body?.text || '').trim();
    
    if (!text) {
      return res.status(400).json({ success: false, error: 'text required' });
    }

    const { data, error } = await supabase
      .from('post_comments')
      .insert({ post_id: postId, user_id: user.id, text })
      .select()
      .single();
      
    if (error) return res.status(500).json({ success: false, error: error.message });
    
    res.status(201).json({ success: true, comment: data });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, error: 'Failed to comment' });
  }
});

export default router;

// DELETE /api/posts/:id - Delete post
router.delete('/:id', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }

    const postId = Number(req.params.id);
    
    // Check if post exists and user owns it
    const { data: post } = await supabase
      .from('posts')
      .select('user_id')
      .eq('id', postId)
      .single();
      
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }
    
    if (post.user_id !== user.id) {
      return res.status(403).json({ success: false, error: 'You can only delete your own posts' });
    }

    // Delete the post (cascade will delete likes and comments)
    const { error: deleteError } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);
      
    if (deleteError) {
      console.error('[Posts] Delete error:', deleteError);
      return res.status(500).json({ success: false, error: deleteError.message });
    }
    
    console.log('[Posts] Deleted post:', postId);
    res.json({ success: true });
  } catch (e) {
    console.error('[Posts] Error:', e);
    res.status(500).json({ success: false, error: 'Failed to delete post' });
  }
});

export default router;
