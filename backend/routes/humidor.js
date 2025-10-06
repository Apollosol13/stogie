import express from 'express';
import supabase from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get current user's humidor entries (no userId needed - uses JWT)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status } = req.query;
    const userId = req.user.id; // Get userId from JWT token

    let query = supabase
      .from('humidor_entries')
      .select(`
        *,
        cigars (
          id,
          brand,
          line,
          vitola,
          strength,
          wrapper,
          binder,
          filler,
          ring_gauge,
          length_inches,
          origin_country,
          flavor_profile,
          description,
          image_url,
          average_rating,
          price_range,
          smoking_time_minutes,
          smoking_experience,
          ai_confidence,
          analysis_notes,
          is_ai_identified
        )
      `)
      .eq('user_id', userId);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch humidor entries'
      });
    }

    // Calculate stats
    const stats = {
      totalEntries: data.length,
      ownedCount: data.filter(entry => entry.status === 'owned').length,
      wishlistCount: data.filter(entry => entry.status === 'wishlist').length,
      smokedCount: data.filter(entry => entry.status === 'smoked').length,
      totalValue: data
        .filter(entry => entry.status === 'owned' && entry.purchase_price)
        .reduce((sum, entry) => sum + (parseFloat(entry.purchase_price) * entry.quantity), 0)
    };

    res.json({
      success: true,
      entries: data,
      stats
    });

  } catch (error) {
    console.error('Error fetching humidor entries:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch humidor entries'
    });
  }
});

// Get user's humidor entries by userId (for admin/public access)
router.get('/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.query;

    // Ensure user can only access their own humidor
    if (req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    let query = supabase
      .from('humidor_entries')
      .select(`
        *,
        cigars (
          id,
          brand,
          line,
          vitola,
          strength,
          wrapper,
          image_url,
          average_rating
        )
      `)
      .eq('user_id', userId);

    // Filter by status if provided
    if (status) {
      const validStatuses = ['owned', 'smoked', 'wishlist'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid status. Must be: owned, smoked, or wishlist'
        });
      }
      query = query.eq('status', status);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    // Group by status for easier frontend consumption
    const grouped = {
      owned: data.filter(item => item.status === 'owned'),
      smoked: data.filter(item => item.status === 'smoked'),
      wishlist: data.filter(item => item.status === 'wishlist')
    };

    // Calculate stats
    const stats = {
      totalOwned: grouped.owned.reduce((sum, item) => sum + (item.quantity || 1), 0),
      totalSmoked: grouped.smoked.length,
      totalValue: grouped.owned.reduce((sum, item) => sum + ((item.price_paid || 0) * (item.quantity || 1)), 0),
      avgRating: grouped.smoked.length > 0 
        ? grouped.smoked.reduce((sum, item) => sum + (item.rating || 0), 0) / grouped.smoked.length 
        : 0
    };

    res.json({
      success: true,
      humidor: status ? data : grouped,
      stats: stats
    });

  } catch (error) {
    console.error('Get humidor error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch humidor entries'
    });
  }
});

// Add entry to humidor
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      cigar_id,
      cigarId, // Support both snake_case and camelCase
      status,
      quantity = 1,
      pricePaid,
      acquiredDate,
      notes,
      rating,
      // Fields for creating a new cigar
      brand,
      line,
      vitola,
      strength,
      wrapper,
      binder,
      filler,
      origin_country,
      ring_gauge,
      length_inches,
      price_range,
      flavor_profile,
      smoking_time_minutes,
      description
    } = req.body;

    const finalCigarId = cigar_id || cigarId;

    // Validate status
    const validStatuses = ['owned', 'smoked', 'wishlist'];
    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status is required'
      });
    }
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be: owned, smoked, or wishlist'
      });
    }

    // Validate rating if provided
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        success: false,
        error: 'Rating must be between 1 and 5'
      });
    }

    let actualCigarId = finalCigarId;

    // If no cigar ID, create the cigar first
    if (!finalCigarId && brand && vitola) {
      console.log('[Humidor] Creating new cigar:', { brand, line, vitola });
      
      const { data: newCigar, error: createError } = await supabase
        .from('cigars')
        .insert([{
          brand: brand,
          line: line || '',
          vitola: vitola,
          strength: strength || 'MEDIUM',
          wrapper: wrapper || 'Unknown',
          binder: binder || 'Unknown',
          filler: filler || 'Unknown',
          origin_country: origin_country || 'Unknown',
          ring_gauge: ring_gauge || null,
          length_inches: length_inches || null,
          price_range: price_range || '',
          flavor_profile: flavor_profile || [],
          smoking_time_minutes: smoking_time_minutes || null,
          description: description || '',
          image_url: req.body.image_url || null // Add scanned image
        }])
        .select()
        .single();

      if (createError) {
        console.error('[Humidor] Error creating cigar:', createError);
        return res.status(500).json({
          success: false,
          error: 'Failed to create cigar'
        });
      }

      actualCigarId = newCigar.id;
      console.log('[Humidor] Created cigar with ID:', actualCigarId);
    } else if (!finalCigarId) {
      return res.status(400).json({
        success: false,
        error: 'Either cigar_id or brand/vitola must be provided'
      });
    } else {
      // Check if cigar exists
      const { data: cigar, error: cigarError } = await supabase
        .from('cigars')
        .select('id')
        .eq('id', finalCigarId)
        .single();

      if (cigarError || !cigar) {
        return res.status(404).json({
          success: false,
          error: 'Cigar not found'
        });
      }
    }

    const entryData = {
      user_id: req.user.id,
      cigar_id: actualCigarId,
      status,
      quantity: status === 'owned' ? quantity : 1,
      price_paid: pricePaid || null,
      acquired_date: acquiredDate || null,
      notes: notes?.trim() || null
    };

    // Only include rating when table supports it (status smoked and rating provided)
    if (status === 'smoked' && typeof rating === 'number') {
      entryData.rating = rating;
    }

    const { data, error } = await supabase
      .from('humidor_entries')
      .insert([entryData])
      .select(`
        *,
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
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json({
      success: true,
      entry: data
    });

  } catch (error) {
    console.error('Add humidor entry error:', error);
    
    // Handle duplicate entries
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        error: 'This cigar is already in your humidor with this status'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to add humidor entry'
    });
  }
});

// Update humidor entry
router.put('/:entryId', authenticateToken, async (req, res) => {
  try {
    const { entryId } = req.params;
    const updates = req.body;

    // Remove fields that shouldn't be updated
    delete updates.id;
    delete updates.user_id;
    delete updates.cigar_id;
    delete updates.created_at;

    // Validate status if provided
    if (updates.status) {
      const validStatuses = ['owned', 'smoked', 'wishlist'];
      if (!validStatuses.includes(updates.status)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid status. Must be: owned, smoked, or wishlist'
        });
      }
    }

    // Validate rating if provided
    if (updates.rating && (updates.rating < 1 || updates.rating > 5)) {
      return res.status(400).json({
        success: false,
        error: 'Rating must be between 1 and 5'
      });
    }

    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('humidor_entries')
      .update(updates)
      .eq('id', entryId)
      .eq('user_id', req.user.id) // Ensure user owns this entry
      .select(`
        *,
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
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Humidor entry not found'
        });
      }
      throw error;
    }

    res.json({
      success: true,
      entry: data
    });

  } catch (error) {
    console.error('Update humidor entry error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update humidor entry'
    });
  }
});

// Delete humidor entry
router.delete('/:entryId', authenticateToken, async (req, res) => {
  try {
    const { entryId } = req.params;

    const { error } = await supabase
      .from('humidor_entries')
      .delete()
      .eq('id', entryId)
      .eq('user_id', req.user.id); // Ensure user owns this entry

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: 'Humidor entry deleted successfully'
    });

  } catch (error) {
    console.error('Delete humidor entry error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete humidor entry'
    });
  }
});

// Get humidor statistics
router.get('/:userId/stats', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // Ensure user can only access their own stats
    if (req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const { data, error } = await supabase
      .from('humidor_entries')
      .select('status, quantity, price_paid, rating')
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    const stats = {
      totalOwned: data
        .filter(item => item.status === 'owned')
        .reduce((sum, item) => sum + (item.quantity || 1), 0),
      totalSmoked: data.filter(item => item.status === 'smoked').length,
      totalWishlist: data.filter(item => item.status === 'wishlist').length,
      totalValue: data
        .filter(item => item.status === 'owned')
        .reduce((sum, item) => sum + ((item.price_paid || 0) * (item.quantity || 1)), 0),
      avgRating: (() => {
        const smokedWithRatings = data.filter(item => item.status === 'smoked' && item.rating);
        return smokedWithRatings.length > 0
          ? smokedWithRatings.reduce((sum, item) => sum + item.rating, 0) / smokedWithRatings.length
          : 0;
      })(),
      strengthBreakdown: (() => {
        const breakdown = { MILD: 0, MEDIUM: 0, FULL: 0 };
        // This would require joining with cigars table for strength data
        return breakdown;
      })()
    };

    res.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Get humidor stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch humidor statistics'
    });
  }
});

export default router;
