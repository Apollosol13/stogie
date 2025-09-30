import express from 'express';
import supabase from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get smoking sessions
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20,
      userId 
    } = req.query;

    let query = supabase
      .from('smoking_sessions')
      .select(`
        *,
        profiles:user_id (
          username,
          full_name,
          avatar_url
        ),
        cigars:cigar_id (
          brand,
          line,
          vitola
        )
      `);

    // Filter by user if specified
    if (userId) {
      query = query.eq('user_id', userId);
    }

    // Apply pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      sessions: data || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count || 0,
        pages: Math.ceil((count || 0) / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get smoking sessions error:', error);
    res.json({
      success: true,
      sessions: [],
      pagination: {
        page: parseInt(req.query.page || 1),
        limit: parseInt(req.query.limit || 20),
        total: 0,
        pages: 0
      }
    });
  }
});

// Create smoking session
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      cigar_id,
      location_name,
      latitude,
      longitude,
      notes,
      rating,
      venue_id
    } = req.body;

    const userId = req.user.id;

    const sessionData = {
      user_id: userId,
      cigar_id,
      location_name,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      notes,
      rating: rating ? parseInt(rating) : null,
      venue_id,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('smoking_sessions')
      .insert([sessionData])
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json({
      success: true,
      session: data,
      message: 'Smoking session created successfully'
    });

  } catch (error) {
    console.error('Create smoking session error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create smoking session'
    });
  }
});

// Update smoking session
router.put('/:sessionId', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    // Verify ownership
    const { data: session, error: fetchError } = await supabase
      .from('smoking_sessions')
      .select('user_id')
      .eq('id', sessionId)
      .single();

    if (fetchError || !session) {
      return res.status(404).json({
        success: false,
        error: 'Smoking session not found'
      });
    }

    if (session.user_id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this session'
      });
    }

    const { data, error } = await supabase
      .from('smoking_sessions')
      .update(updateData)
      .eq('id', sessionId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      session: data
    });

  } catch (error) {
    console.error('Update smoking session error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update smoking session'
    });
  }
});

// Delete smoking session
router.delete('/:sessionId', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    // Verify ownership
    const { data: session, error: fetchError } = await supabase
      .from('smoking_sessions')
      .select('user_id')
      .eq('id', sessionId)
      .single();

    if (fetchError || !session) {
      return res.status(404).json({
        success: false,
        error: 'Smoking session not found'
      });
    }

    if (session.user_id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this session'
      });
    }

    const { error } = await supabase
      .from('smoking_sessions')
      .delete()
      .eq('id', sessionId);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: 'Smoking session deleted successfully'
    });

  } catch (error) {
    console.error('Delete smoking session error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete smoking session'
    });
  }
});

export default router;
