import express from 'express';
import supabase, { supabaseAuth } from '../config/database.js';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { validateProfile, validateUUID } from '../middleware/validation.js';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// GET /api/profiles/:userId - Get any user's profile by ID
router.get('/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log('[Profiles] Fetching profile for user:', userId);

    // Get user profile from profiles table (public data)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('[Profiles] Profile fetch error:', profileError);
      return res.status(404).json({ success: false, error: 'Profile not found' });
    }

    console.log('[Profiles] Profile found:', profile.username);

    res.json({
      success: true,
      profile: {
        id: profile.id,
        full_name: profile.full_name,
        username: profile.username,
        avatar_url: profile.avatar_url,
        bio: profile.bio,
        location: profile.location,
        favorite_cigar: profile.favorite_cigar,
        created_at: profile.created_at,
        updated_at: profile.updated_at
      }
    });

  } catch (error) {
    console.error('[Profiles] Profile endpoint error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// GET /api/profiles - Get current user's profile
router.get('/', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    
    // Verify the JWT token using anon client
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }

    // Get user profile from profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return res.status(404).json({ success: false, error: 'Profile not found' });
    }

    // Prevent caching so clients always get the latest avatar/profile
    res.set('Cache-Control', 'no-store');

    res.json({
      success: true,
      profile: {
        id: profile.id,
        email: user.email,
        full_name: profile.full_name,
        username: profile.username,
        avatar_url: profile.avatar_url,
        bio: profile.bio,
        location: profile.location,
        favorite_cigar: profile.favorite_cigar,
        created_at: profile.created_at,
        updated_at: profile.updated_at
      }
    });

  } catch (error) {
    console.error('Profile endpoint error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// PUT /api/profiles - Update current user's profile
router.put('/', validateProfile, async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    
    // Verify the JWT token using anon client
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }

    const {
      full_name,
      username,
      bio,
      location,
      favorite_cigar,
      experience_level,
      favorite_strength,
      favorite_wrapper
    } = req.body;

    // Build updates object only with provided values to avoid overwriting with undefined
    const updates = { updated_at: new Date().toISOString() };
    if (typeof full_name !== 'undefined' && full_name !== '') updates.full_name = full_name;
    if (typeof username !== 'undefined' && username !== '') updates.username = username;
    // Only allow fields that exist in current schema
    if (typeof bio !== 'undefined') updates.bio = bio;
    if (typeof location !== 'undefined') updates.location = location;
    if (typeof favorite_cigar !== 'undefined') updates.favorite_cigar = favorite_cigar;
    if (typeof experience_level !== 'undefined') updates.experience_level = experience_level;
    if (typeof favorite_strength !== 'undefined') updates.favorite_strength = favorite_strength;
    if (typeof favorite_wrapper !== 'undefined') updates.favorite_wrapper = favorite_wrapper;

    // Update user profile
    const { data: profile, error: updateError } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Profile update error:', updateError);
      return res.status(400).json({ success: false, error: 'Failed to update profile', details: updateError.message || updateError });
    }

    res.json({
      success: true,
      profile: {
        id: profile.id,
        email: user.email,
        full_name: profile.full_name,
        username: profile.username,
        avatar_url: profile.avatar_url,
        bio: profile.bio,
        location: profile.location,
        favorite_cigar: profile.favorite_cigar,
        created_at: profile.created_at,
        updated_at: profile.updated_at
      }
    });

  } catch (error) {
    console.error('Profile update endpoint error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// POST /api/profiles/image - Upload profile image
router.post('/image', upload.single('image'), async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    
    // Verify the JWT token using anon client
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image file provided' });
    }

    let avatarUrl;

    try {
      // Try to upload to Supabase Storage first
      const fileName = `${user.id}-${Date.now()}.${req.file.mimetype.split('/')[1]}`;
      const filePath = `avatars/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(filePath, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: true
        });

      if (uploadError) {
        console.log('Supabase Storage upload failed:', uploadError);
        console.log('Upload error details:', { message: uploadError.message, statusCode: uploadError.statusCode });
        // Fallback to generated avatar
        const timestamp = Date.now();
        avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}-${timestamp}&backgroundColor=b6e3f4,c0aede,d1d4f9&radius=50`;
      } else {
        // Get public URL for the uploaded image
        const { data: { publicUrl } } = supabase.storage
          .from('profile-images')
          .getPublicUrl(filePath);
        
        console.log('Image uploaded successfully:', { filePath, publicUrl });
        avatarUrl = publicUrl;
      }
    } catch (storageError) {
      console.log('Storage error, using generated avatar:', storageError.message);
      // Fallback to generated avatar
      const timestamp = Date.now();
      avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}-${timestamp}&backgroundColor=b6e3f4,c0aede,d1d4f9&radius=50`;
    }

    try {
      // Update user profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('Profile update error:', updateError);
        return res.status(500).json({ success: false, error: 'Failed to update profile' });
      }

      res.json({
        success: true,
        message: 'Profile image updated successfully',
        avatar_url: avatarUrl
      });

    } catch (dbError) {
      console.error('Database update error:', dbError);
      res.status(500).json({ success: false, error: 'Failed to update profile' });
    }

  } catch (error) {
    console.error('Profile image upload error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// DELETE /api/profiles/me - Delete current user's account
router.delete('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    
    // Verify the JWT token
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }

    console.log(`[Account Deletion] Starting deletion for user: ${user.id}`);

    // Delete user's data in this order (to respect foreign key constraints):
    // 1. Comments
    await supabase.from('comments').delete().eq('user_id', user.id);
    
    // 2. Likes
    await supabase.from('likes').delete().eq('user_id', user.id);
    
    // 3. Posts
    await supabase.from('posts').delete().eq('user_id', user.id);
    
    // 4. Reviews
    await supabase.from('reviews').delete().eq('user_id', user.id);
    
    // 5. Humidor entries
    await supabase.from('humidor').delete().eq('user_id', user.id);
    
    // 6. Follows (both following and followers)
    await supabase.from('follows').delete().eq('follower_id', user.id);
    await supabase.from('follows').delete().eq('following_id', user.id);
    
    // 7. Profile
    await supabase.from('profiles').delete().eq('id', user.id);
    
    // 8. Finally delete the auth user
    const { error: deleteAuthError } = await supabaseAuth.auth.admin.deleteUser(user.id);
    
    if (deleteAuthError) {
      console.error('[Account Deletion] Failed to delete auth user:', deleteAuthError);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to delete account completely' 
      });
    }

    console.log(`[Account Deletion] Successfully deleted user: ${user.id}`);
    
    res.json({
      success: true,
      message: 'Account deleted successfully'
    });

  } catch (error) {
    console.error('[Account Deletion] Error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// POST /api/profiles/:userId/block - Block a user
router.post('/:userId/block', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }

    const blockedUserId = req.params.userId;

    if (user.id === blockedUserId) {
      return res.status(400).json({ success: false, error: 'Cannot block yourself' });
    }

    // Check if already blocked
    const { data: existing } = await supabase
      .from('blocked_users')
      .select('id')
      .eq('blocker_id', user.id)
      .eq('blocked_id', blockedUserId)
      .maybeSingle();

    if (existing) {
      // Unblock
      await supabase
        .from('blocked_users')
        .delete()
        .eq('blocker_id', user.id)
        .eq('blocked_id', blockedUserId);

      console.log(`[MODERATION] User ${user.id} unblocked user ${blockedUserId}`);
      return res.json({ success: true, blocked: false, message: 'User unblocked' });
    } else {
      // Block
      await supabase
        .from('blocked_users')
        .insert([{
          blocker_id: user.id,
          blocked_id: blockedUserId
        }]);

      // Also remove any follow relationships
      await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', blockedUserId);
      await supabase.from('follows').delete().eq('follower_id', blockedUserId).eq('following_id', user.id);

      console.log(`[MODERATION] User ${user.id} blocked user ${blockedUserId}`);
      return res.json({ success: true, blocked: true, message: 'User blocked' });
    }
  } catch (error) {
    console.error('[Profiles] Block user error:', error);
    res.status(500).json({ success: false, error: 'Failed to block user' });
  }
});

// GET /api/profiles/:userId/is-blocked - Check if a user is blocked
router.get('/:userId/is-blocked', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.json({ success: true, blocked: false });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);
    
    if (authError || !user) {
      return res.json({ success: true, blocked: false });
    }

    const targetUserId = req.params.userId;

    const { data } = await supabase
      .from('blocked_users')
      .select('id')
      .eq('blocker_id', user.id)
      .eq('blocked_id', targetUserId)
      .maybeSingle();

    res.json({ success: true, blocked: !!data });
  } catch (error) {
    console.error('[Profiles] Check blocked error:', error);
    res.status(500).json({ success: false, error: 'Failed to check block status' });
  }
});

export default router;
