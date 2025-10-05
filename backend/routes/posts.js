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
    
    const { data: posts, error } = await supabase
      .from('posts')
      .select('id,image_url,caption,created_at,profiles:profiles(username,avatar_url)')
      .order('created_at', { ascending: false })
      .limit(50);
      
    if (error) return res.status(500).json({ success: false, error: error.message });

    const ids = posts.map(p => p.id);
    if (!ids.length) return res.json({ success: true, posts });

    const [{ data: likeCounts }, { data: commentCounts }, myLikesRes] = await Promise.all([
      supabase.from('post_likes').select('post_id, count:post_id').in('post_id', ids).group('post_id'),
      supabase.from('post_comments').select('post_id, count:post_id').in('post_id', ids).group('post_id'),
      userId ? supabase.from('post_likes').select('post_id').eq('user_id', userId).in('post_id', ids) : Promise.resolve({ data: [] })
    ]);

    const likeMap = Object.fromEntries((likeCounts||[]).map(r => [r.post_id, r.count]));
    const commentMap = Object.fromEntries((commentCounts||[]).map(r => [r.post_id, r.count]));
    const myLikeSet = new Set((myLikesRes?.data||[]).map(r => r.post_id));

    res.json({
      success: true,
      posts: posts.map(p => ({
        ...p,
        like_count: likeMap[p.id] || 0,
        comment_count: commentMap[p.id] || 0,
        liked_by_me: myLikeSet.has(p.id)
      }))
    });
  } catch (e) {
    console.error(e);
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
      
    if (error) return res.status(500).json({ success: false, error: error.message });
    
    res.status(201).json({ success: true, post: data });
  } catch (e) {
    console.error(e);
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
    
    const { data, error } = await supabase
      .from('post_comments')
      .select('id,text,created_at,profiles:profiles(username,avatar_url)')
      .eq('post_id', postId)
      .order('created_at', { ascending: false });
      
    if (error) return res.status(500).json({ success: false, error: error.message });
    
    res.json({ success: true, comments: data });
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
      .select('id,text,created_at,profiles:profiles(username,avatar_url)')
      .single();
      
    if (error) return res.status(500).json({ success: false, error: error.message });
    
    res.status(201).json({ success: true, comment: data });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, error: 'Failed to comment' });
  }
});

export default router;

