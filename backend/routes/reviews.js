import express from 'express';
import supabase from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateReview, validateId } from '../middleware/validation.js';

const router = express.Router();

// Get reviews for a specific cigar
router.get('/cigar/:cigarId', async (req, res) => {
  try {
    const { cigarId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { data, error, count } = await supabase
      .from('reviews')
      .select(`
        *,
        profiles (
          id,
          username,
          full_name,
          avatar_url
        )
      `, { count: 'exact' })
      .eq('cigar_id', cigarId)
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      reviews: data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch reviews'
    });
  }
});

// Get reviews by a specific user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { data, error, count } = await supabase
      .from('reviews')
      .select(`
        *,
        cigars (
          id,
          brand,
          line,
          vitola,
          image_url
        )
      `, { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      reviews: data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user reviews'
    });
  }
});

// Get single review
router.get('/:reviewId', async (req, res) => {
  try {
    const { reviewId } = req.params;

    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        profiles (
          id,
          username,
          full_name,
          avatar_url
        ),
        cigars (
          id,
          brand,
          line,
          vitola,
          strength,
          wrapper,
          image_url
        )
      `)
      .eq('id', reviewId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Review not found'
        });
      }
      throw error;
    }

    res.json({
      success: true,
      review: data
    });

  } catch (error) {
    console.error('Get review error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch review'
    });
  }
});

// Create new review
router.post('/', authenticateToken, validateReview, async (req, res) => {
  try {
    const {
      cigarId,
      rating,
      title,
      content,
      flavorNotes,
      smokingDuration,
      smokingDate,
      location
    } = req.body;

    // Validate required fields
    if (!cigarId || !rating) {
      return res.status(400).json({
        success: false,
        error: 'Cigar ID and rating are required'
      });
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Rating must be between 1 and 5'
      });
    }

    // Check if cigar exists
    const { data: cigar, error: cigarError } = await supabase
      .from('cigars')
      .select('id')
      .eq('id', cigarId)
      .single();

    if (cigarError || !cigar) {
      return res.status(404).json({
        success: false,
        error: 'Cigar not found'
      });
    }

    // Check if user already reviewed this cigar
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('user_id', req.user.id)
      .eq('cigar_id', cigarId)
      .single();

    if (existingReview) {
      return res.status(409).json({
        success: false,
        error: 'You have already reviewed this cigar'
      });
    }

    const reviewData = {
      user_id: req.user.id,
      cigar_id: cigarId,
      rating: parseInt(rating),
      title: title?.trim() || null,
      content: content?.trim() || null,
      flavor_notes: flavorNotes || null,
      smoking_duration: smokingDuration ? parseInt(smokingDuration) : null,
      smoking_date: smokingDate || null,
      location: location?.trim() || null
    };

    const { data, error } = await supabase
      .from('reviews')
      .insert([reviewData])
      .select(`
        *,
        profiles (
          id,
          username,
          full_name,
          avatar_url
        ),
        cigars (
          id,
          brand,
          line,
          vitola,
          image_url
        )
      `)
      .single();

    if (error) {
      throw error;
    }

    // Update cigar's average rating and review count
    await updateCigarRating(cigarId);

    res.status(201).json({
      success: true,
      review: data
    });

  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create review'
    });
  }
});

// Update review
router.put('/:reviewId', authenticateToken, validateId, validateReview, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const updates = req.body;

    // Remove fields that shouldn't be updated
    delete updates.id;
    delete updates.user_id;
    delete updates.cigar_id;
    delete updates.created_at;

    // Validate rating if provided
    if (updates.rating && (updates.rating < 1 || updates.rating > 5)) {
      return res.status(400).json({
        success: false,
        error: 'Rating must be between 1 and 5'
      });
    }

    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('reviews')
      .update(updates)
      .eq('id', reviewId)
      .eq('user_id', req.user.id) // Ensure user owns this review
      .select(`
        *,
        profiles (
          id,
          username,
          full_name,
          avatar_url
        ),
        cigars (
          id,
          brand,
          line,
          vitola,
          image_url
        )
      `)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Review not found or access denied'
        });
      }
      throw error;
    }

    // Update cigar's average rating if rating was changed
    if (updates.rating) {
      await updateCigarRating(data.cigar_id);
    }

    res.json({
      success: true,
      review: data
    });

  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update review'
    });
  }
});

// Delete review
router.delete('/:reviewId', authenticateToken, async (req, res) => {
  try {
    const { reviewId } = req.params;

    // Get the review first to get the cigar ID
    const { data: review, error: getError } = await supabase
      .from('reviews')
      .select('cigar_id')
      .eq('id', reviewId)
      .eq('user_id', req.user.id)
      .single();

    if (getError) {
      if (getError.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Review not found or access denied'
        });
      }
      throw getError;
    }

    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId)
      .eq('user_id', req.user.id);

    if (error) {
      throw error;
    }

    // Update cigar's average rating
    await updateCigarRating(review.cigar_id);

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });

  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete review'
    });
  }
});

// Get recent reviews (public feed)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { data, error, count } = await supabase
      .from('reviews')
      .select(`
        *,
        profiles (
          id,
          username,
          full_name,
          avatar_url
        ),
        cigars (
          id,
          brand,
          line,
          vitola,
          strength,
          wrapper,
          image_url
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      reviews: data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get recent reviews error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recent reviews'
    });
  }
});

// Helper function to update cigar rating
async function updateCigarRating(cigarId) {
  try {
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('rating')
      .eq('cigar_id', cigarId);

    if (error) {
      throw error;
    }

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
      : 0;

    await supabase
      .from('cigars')
      .update({
        average_rating: Math.round(averageRating * 100) / 100, // Round to 2 decimal places
        total_reviews: totalReviews,
        updated_at: new Date().toISOString()
      })
      .eq('id', cigarId);

  } catch (error) {
    console.error('Update cigar rating error:', error);
  }
}

export default router;
