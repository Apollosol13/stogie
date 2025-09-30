import express from 'express';
import supabase from '../config/database.js';

const router = express.Router();

// GET /api/profiles - Get current user's profile
router.get('/', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    
    // Verify the JWT token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
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
router.put('/', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    
    // Verify the JWT token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }

    const { full_name, username, bio, location, favorite_cigar } = req.body;

    // Update user profile
    const { data: profile, error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name,
        username,
        bio,
        location,
        favorite_cigar,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Profile update error:', updateError);
      return res.status(400).json({ success: false, error: 'Failed to update profile' });
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
router.post('/image', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    
    // Verify the JWT token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }

    // For now, return a placeholder response
    // In a real implementation, you'd handle file upload to Supabase Storage
    res.json({
      success: true,
      message: 'Profile image upload functionality coming soon',
      avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${user.email}`
    });

  } catch (error) {
    console.error('Profile image upload error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;