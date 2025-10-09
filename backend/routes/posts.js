import express from 'express';
import supabase from '../config/database.js';
import { validatePost, validateComment, validateId } from '../middleware/validation.js';

const router = express.Router();

// Calculate trending score for a post
function calculateTrendingScore(post, likeCount, commentCount) {
  const now = new Date();
  const postDate = new Date(post.created_at);
  const hoursSincePosted = Math.max((now - postDate) / (1000 * 60 * 60), 0.5); // At least 0.5 hours
  
  // Weighted score: comments are worth more than likes
  // Likes × 2 + Comments × 5 = engagement score
  // Divide by (hours + 2) to decay older posts but not too aggressively
  const engagementScore = (likeCount * 2) + (commentCount * 5);
  const trendingScore = engagementScore / (hoursSincePosted + 2);
  
  return trendingScore;
}

// GET /api/posts - Get feed with counts
router.get('/', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const filterType = req.query.filter; // 'following' or undefined (all)
    let userId = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }
    
    let posts;
    
    // If filtering by following, get posts from followed users only
    if (filterType === 'following' && userId) {
      // Get users that current user follows
      const { data: following } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', userId);
      
      const followedUserIds = (following || []).map(f => f.following_id);
      
      if (followedUserIds.length === 0) {
        // User doesn't follow anyone yet
        return res.json({ success: true, posts: [] });
      }
      
      // Get posts from followed users
      const { data: followingPosts, error: postsError } = await supabase
        .from('posts')
        .select('id,image_url,caption,created_at,user_id')
        .in('user_id', followedUserIds)
        .order('created_at', { ascending: false })
        .limit(100); // Get more for better sorting
        
      if (postsError) {
        console.error('[Posts] Error fetching posts:', postsError);
        return res.status(500).json({ success: false, error: postsError.message });
      }
      
      posts = followingPosts;
    } else {
      // Get all posts (For You feed) - get more posts for trending algorithm
      const { data: allPosts, error: postsError } = await supabase
        .from('posts')
        .select('id,image_url,caption,created_at,user_id')
        .order('created_at', { ascending: false })
        .limit(100); // Get last 100 posts to calculate trending from
        
      if (postsError) {
        console.error('[Posts] Error fetching posts:', postsError);
        return res.status(500).json({ success: false, error: postsError.message });
      }
      
      posts = allPosts;
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

    // Combine everything with trending scores
    const enrichedPosts = posts.map(p => {
      const likeCount = likeCountMap[p.id] || 0;
      const commentCount = commentCountMap[p.id] || 0;
      const trendingScore = calculateTrendingScore(p, likeCount, commentCount);
      
      return {
        ...p,
        profiles: profileMap[p.user_id] || null,
        like_count: likeCount,
        comment_count: commentCount,
        liked_by_me: myLikeSet.has(p.id),
        trending_score: trendingScore
      };
    });

    // Sort by trending score for "For You" feed, chronological for "Following"
    if (filterType === 'following') {
      // Following feed: chronological order (already sorted by created_at)
      enrichedPosts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else {
      // For You feed: sort by trending score
      enrichedPosts.sort((a, b) => b.trending_score - a.trending_score);
    }

    // Return top 50 posts
    const topPosts = enrichedPosts.slice(0, 50);

    res.json({ success: true, posts: topPosts });
  } catch (e) {
    console.error('[Posts] Error:', e);
    res.status(500).json({ success: false, error: 'Failed to load posts' });
  }
});

// POST /api/posts - Create post
router.post('/', validatePost, async (req, res) => {
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
      .insert([
        {
          user_id: user.id,
          image_url,
          caption: caption?.trim() || null,
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('[Posts] Insert error:', error);
      return res.status(500).json({ success: false, error: error.message });
    }

    res.status(201).json({ success: true, post: data });
  } catch (e) {
    console.error('[Posts] Create error:', e);
    res.status(500).json({ success: false, error: 'Failed to create post' });
  }
});

// POST /api/posts/:id/like - Toggle like on post
router.post('/:id/like', validateId, async (req, res) => {
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

    // Check if already liked
    const { data: existing } = await supabase
      .from('post_likes')
      .select('id')
      .eq('user_id', user.id)
      .eq('post_id', postId)
      .maybeSingle();

    if (existing) {
      // Unlike
      const { error: deleteError } = await supabase
        .from('post_likes')
        .delete()
        .eq('user_id', user.id)
        .eq('post_id', postId);

      if (deleteError) throw deleteError;
      
      return res.json({ success: true, liked: false });
    } else {
      // Like
      const { error: insertError } = await supabase
        .from('post_likes')
        .insert([{ user_id: user.id, post_id: postId }]);

      if (insertError) throw insertError;
      
      return res.json({ success: true, liked: true });
    }
  } catch (e) {
    console.error('[Posts] Like error:', e);
    res.status(500).json({ success: false, error: 'Failed to like post' });
  }
});

// DELETE /api/posts/:id - Delete a post
router.delete('/:id', validateId, async (req, res) => {
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

    // Verify ownership
    const { data: post, error: fetchError } = await supabase
      .from('posts')
      .select('user_id')
      .eq('id', postId)
      .single();

    if (fetchError || !post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    if (post.user_id !== user.id) {
      return res.status(403).json({ success: false, error: 'Unauthorized to delete this post' });
    }

    const { error: deleteError } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    if (deleteError) {
      console.error('[Posts] Error deleting post:', deleteError);
      return res.status(500).json({ success: false, error: deleteError.message });
    }

    res.json({ success: true, message: 'Post deleted successfully' });
  } catch (e) {
    console.error('[Posts] Error in DELETE /api/posts/:id:', e);
    res.status(500).json({ success: false, error: 'Failed to delete post' });
  }
});

// GET /api/posts/:id/comments - Get comments for a post
router.get('/:id/comments', async (req, res) => {
  try {
    const postId = Number(req.params.id);
    const authHeader = req.headers.authorization;
    let userId = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }
    
    const { data: comments, error } = await supabase
      .from('post_comments')
      .select('id,text,created_at,user_id,parent_comment_id')
      .eq('post_id', postId)
      .order('created_at', { ascending: true }); // Order by ascending for threaded view
      
    if (error) return res.status(500).json({ success: false, error: error.message });
    
    // Get profiles separately
    if (comments && comments.length > 0) {
      const userIds = [...new Set(comments.map(c => c.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id,username,avatar_url')
        .in('id', userIds);
      
      const profileMap = Object.fromEntries((profiles || []).map(p => [p.id, p]));
      
      // Get like counts for all comments
      const commentIds = comments.map(c => c.id);
      const { data: likeCounts } = await supabase
        .from('comment_likes')
        .select('comment_id')
        .in('comment_id', commentIds);
      
      const likeCountMap = {};
      (likeCounts || []).forEach(l => {
        likeCountMap[l.comment_id] = (likeCountMap[l.comment_id] || 0) + 1;
      });
      
      // Get user's liked comments
      let myLikeSet = new Set();
      if (userId) {
        const { data: myLikes } = await supabase
          .from('comment_likes')
          .select('comment_id')
          .eq('user_id', userId)
          .in('comment_id', commentIds);
        myLikeSet = new Set((myLikes || []).map(l => l.comment_id));
      }
      
      const enrichedComments = comments.map(c => ({
        ...c,
        profiles: profileMap[c.user_id] || null,
        like_count: likeCountMap[c.id] || 0,
        liked_by_me: myLikeSet.has(c.id)
      }));
      
      return res.json({ success: true, comments: enrichedComments });
    }
    
    res.json({ success: true, comments: [] });
  } catch (e) {
    console.error('[Posts] Comments error:', e);
    res.status(500).json({ success: false, error: 'Failed to load comments' });
  }
});

// POST /api/posts/:id/comments - Add comment
router.post('/:id/comments', validateId, validateComment, async (req, res) => {
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
    const { text, parent_comment_id } = req.body || {};

    if (!text?.trim()) {
      return res.status(400).json({ success: false, error: 'Comment text required' });
    }

    const { data, error } = await supabase
      .from('post_comments')
      .insert([{
        post_id: postId,
        user_id: user.id,
        text: text.trim(),
        parent_comment_id: parent_comment_id || null
      }])
      .select()
      .single();

    if (error) throw error;

    // Fetch profile for the new comment
    const { data: profile } = await supabase
      .from('profiles')
      .select('id,username,avatar_url')
      .eq('id', user.id)
      .single();

    const enrichedComment = {
      ...data,
      profiles: profile || null,
      like_count: 0,
      liked_by_me: false
    };

    res.status(201).json({ success: true, comment: enrichedComment });
  } catch (e) {
    console.error('[Posts] Add comment error:', e);
    res.status(500).json({ success: false, error: 'Failed to add comment' });
  }
});

// POST /api/posts/:postId/comments/:commentId/like - Toggle like on comment
router.post('/:postId/comments/:commentId/like', async (req, res) => {
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

    const commentId = Number(req.params.commentId);

    // Check if already liked
    const { data: existing } = await supabase
      .from('comment_likes')
      .select('id')
      .eq('user_id', user.id)
      .eq('comment_id', commentId)
      .maybeSingle();

    if (existing) {
      // Unlike
      const { error: deleteError } = await supabase
        .from('comment_likes')
        .delete()
        .eq('user_id', user.id)
        .eq('comment_id', commentId);

      if (deleteError) throw deleteError;
      
      return res.json({ success: true, liked: false });
    } else {
      // Like
      const { error: insertError } = await supabase
        .from('comment_likes')
        .insert([{ user_id: user.id, comment_id: commentId }]);

      if (insertError) throw insertError;
      
      return res.json({ success: true, liked: true });
    }
  } catch (e) {
    console.error('[Posts] Like comment error:', e);
    res.status(500).json({ success: false, error: 'Failed to like comment' });
  }
});

export default router;
