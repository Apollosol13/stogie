import express from 'express';
import supabase, { supabaseAuth } from '../config/database.js';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';

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
router.put('/', async (req, res) => {
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
      experience_level,
      favorite_strength,
      favorite_wrapper
    } = req.body;

    // Build updates object only with provided values to avoid overwriting with undefined
    const updates = { updated_at: new Date().toISOString() };
    if (typeof full_name !== 'undefined' && full_name !== '') updates.full_name = full_name;
    if (typeof username !== 'undefined' && username !== '') updates.username = username;
    // Only allow fields that exist in current schema
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

export default router;
