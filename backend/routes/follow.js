import express from 'express';
import supabase from '../config/database.js';

const router = express.Router();

// POST /api/follow/:userId - Follow/unfollow a user
router.post('/:userId', async (req, res) => {
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

    const followingId = req.params.userId;
    const followerId = user.id;

    if (followerId === followingId) {
      return res.status(400).json({ success: false, error: 'Cannot follow yourself' });
    }

    // Check if already following
    const { data: existing } = await supabase
      .from('follows')
      .select('follower_id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .maybeSingle();

    if (existing) {
      // Unfollow
      console.log(`[Follow] Unfollowing: ${followerId} -> ${followingId}`);
      const { error: deleteError } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', followerId)
        .eq('following_id', followingId);
      
      if (deleteError) {
        console.error('[Follow] Delete error:', deleteError);
        return res.status(500).json({ success: false, error: 'Failed to unfollow' });
      }

      console.log('[Follow] Successfully unfollowed');
      return res.json({ success: true, following: false });
    } else {
      // Follow
      console.log(`[Follow] Following: ${followerId} -> ${followingId}`);
      const { error: insertError } = await supabase
        .from('follows')
        .insert({ follower_id: followerId, following_id: followingId });
      
      if (insertError) {
        console.error('[Follow] Insert error:', insertError);
        return res.status(500).json({ success: false, error: 'Failed to follow' });
      }

      console.log('[Follow] Successfully followed');
      return res.json({ success: true, following: true });
    }
  } catch (e) {
    console.error('[Follow]', e);
    res.status(500).json({ success: false, error: 'Failed to follow/unfollow' });
  }
});

// GET /api/follow/status/:userId - Check if following a user
router.get('/status/:userId', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.json({ success: true, following: false });
    }

    const token = authHeader.substring(7);
    const { data: { user } } = await supabase.auth.getUser(token);
    
    if (!user) {
      return res.json({ success: true, following: false });
    }

    const followingId = req.params.userId;
    
    const { data } = await supabase
      .from('follows')
      .select('follower_id')
      .eq('follower_id', user.id)
      .eq('following_id', followingId)
      .maybeSingle();

    res.json({ success: true, following: !!data });
  } catch (e) {
    console.error('[Follow Status]', e);
    res.status(500).json({ success: false, error: 'Failed to check follow status' });
  }
});

// GET /api/follow/followers/:userId - Get user's followers
router.get('/followers/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    const { data: followers } = await supabase
      .from('follows')
      .select('follower_id, profiles!follows_follower_id_fkey(id, username, full_name, avatar_url)')
      .eq('following_id', userId);

    res.json({ 
      success: true, 
      followers: (followers || []).map(f => f.profiles) 
    });
  } catch (e) {
    console.error('[Get Followers]', e);
    res.status(500).json({ success: false, error: 'Failed to get followers' });
  }
});

// GET /api/follow/following/:userId - Get users that user is following
router.get('/following/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    const { data: following } = await supabase
      .from('follows')
      .select('following_id, profiles!follows_following_id_fkey(id, username, full_name, avatar_url)')
      .eq('follower_id', userId);

    res.json({ 
      success: true, 
      following: (following || []).map(f => f.profiles) 
    });
  } catch (e) {
    console.error('[Get Following]', e);
    res.status(500).json({ success: false, error: 'Failed to get following' });
  }
});

export default router;

