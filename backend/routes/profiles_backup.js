import express from 'express';
import { supabase } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get user profile by ID
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Profile not found'
        });
      }
      throw error;
    }

    // Remove sensitive information if not the user's own profile
    const publicProfile = {
      id: data.id,
      username: data.username,
      full_name: data.full_name,
      avatar_url: data.avatar_url,
      created_at: data.created_at
    };

    res.json({
      success: true,
      profile: publicProfile
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch profile'
    });
  }
});

// Get current user's profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Profile not found'
        });
      }
      throw error;
    }

    res.json({
      success: true,
      profile: data
    });

  } catch (error) {
    console.error('Get current profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch profile'
    });
  }
});

// Update user profile
router.put('/me', authenticateToken, async (req, res) => {
  try {
    const { username, fullName, avatarUrl, bio } = req.body;
    
    const updates = {};
    
    if (username !== undefined) {
      // Validate username
      if (username && (username.length < 3 || username.length > 30)) {
        return res.status(400).json({
          success: false,
          error: 'Username must be between 3 and 30 characters'
        });
      }
      
      // Check if username is already taken
      if (username) {
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', username)
          .neq('id', req.user.id)
          .single();

        if (existingUser) {
          return res.status(409).json({
            success: false,
            error: 'Username is already taken'
          });
        }
      }
      
      updates.username = username;
    }
    
    if (fullName !== undefined) updates.full_name = fullName;
    if (avatarUrl !== undefined) updates.avatar_url = avatarUrl;
    if (bio !== undefined) updates.bio = bio;
    
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      profile: data
    });

  } catch (error) {
    console.error('Update profile error:', error);
    
    // Handle unique constraint violation (username already exists)
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        error: 'Username is already taken'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    });
  }
});

// Search profiles
router.get('/search', async (req, res) => {
  try {
    const { query, page = 1, limit = 20 } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { data, error, count } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url, created_at', { count: 'exact' })
      .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      profiles: data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Search profiles error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search profiles'
    });
  }
});

// Get profile statistics
router.get('/:userId/stats', async (req, res) => {
  try {
    const { userId } = req.params;

    // Get review count and average rating given
    const { data: reviewStats, error: reviewError } = await supabase
      .from('reviews')
      .select('rating')
      .eq('user_id', userId);

    if (reviewError) {
      throw reviewError;
    }

    // Get humidor stats
    const { data: humidorStats, error: humidorError } = await supabase
      .from('humidor_entries')
      .select('status, quantity, price_paid')
      .eq('user_id', userId);

    if (humidorError) {
      throw humidorError;
    }

    const stats = {
      totalReviews: reviewStats.length,
      averageRatingGiven: reviewStats.length > 0 
        ? reviewStats.reduce((sum, review) => sum + review.rating, 0) / reviewStats.length 
        : 0,
      totalOwned: humidorStats
        .filter(item => item.status === 'owned')
        .reduce((sum, item) => sum + (item.quantity || 1), 0),
      totalSmoked: humidorStats.filter(item => item.status === 'smoked').length,
      totalWishlist: humidorStats.filter(item => item.status === 'wishlist').length,
      collectionValue: humidorStats
        .filter(item => item.status === 'owned')
        .reduce((sum, item) => sum + ((item.price_paid || 0) * (item.quantity || 1)), 0)
    };

    res.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Get profile stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch profile statistics'
    });
  }
});

// Get user's recent activity
router.get('/:userId/activity', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Get recent reviews
    const { data: reviews, error: reviewError } = await supabase
      .from('reviews')
      .select(`
        id,
        rating,
        title,
        created_at,
        cigars (
          id,
          brand,
          line,
          vitola,
          image_url
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    if (reviewError) {
      throw reviewError;
    }

    // Get recent humidor additions
    const { data: humidorEntries, error: humidorError } = await supabase
      .from('humidor_entries')
      .select(`
        id,
        status,
        quantity,
        created_at,
        cigars (
          id,
          brand,
          line,
          vitola,
          image_url
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    if (humidorError) {
      throw humidorError;
    }

    // Combine and sort activities
    const activities = [
      ...reviews.map(review => ({
        type: 'review',
        id: review.id,
        created_at: review.created_at,
        data: review
      })),
      ...humidorEntries.map(entry => ({
        type: 'humidor',
        id: entry.id,
        created_at: entry.created_at,
        data: entry
      }))
    ]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(offset, offset + parseInt(limit));

    res.json({
      success: true,
      activities,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: activities.length
      }
    });

  } catch (error) {
    console.error('Get user activity error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user activity'
    });
  }
});

// Delete user account
router.delete('/me', authenticateToken, async (req, res) => {
  try {
    // Delete user from Supabase auth (this will cascade to profile due to foreign key)
    const { error } = await supabase.auth.admin.deleteUser(req.user.id);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete account'
    });
  }
});

export default router;
