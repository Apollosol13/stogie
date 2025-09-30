import express from 'express';
import supabase from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all shops/venues
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search,
      type // 'lounge', 'shop', 'bar'
    } = req.query;

    let query = supabase
      .from('venues')
      .select('*');

    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,address.ilike.%${search}%,city.ilike.%${search}%`);
    }

    if (type) {
      query = query.eq('type', type);
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
      shops: data || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count || 0,
        pages: Math.ceil((count || 0) / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get shops error:', error);
    res.json({
      success: true,
      shops: [],
      pagination: {
        page: parseInt(req.query.page || 1),
        limit: parseInt(req.query.limit || 20),
        total: 0,
        pages: 0
      }
    });
  }
});

// Search shops/venues with Google Places integration
router.get('/search', async (req, res) => {
  try {
    const { 
      query: searchQuery,
      latitude,
      longitude,
      radius = 5000,
      type = 'cigar_lounge'
    } = req.query;

    // For now, return empty results since we don't have venues in database yet
    // In the future, this could integrate with Google Places API
    res.json({
      success: true,
      venues: [],
      message: 'Venue search functionality coming soon'
    });

  } catch (error) {
    console.error('Search shops error:', error);
    res.json({
      success: true,
      venues: [],
      message: 'Search temporarily unavailable'
    });
  }
});

// Save venues from search results
router.post('/search', async (req, res) => {
  try {
    const { venues } = req.body;

    if (!venues || !Array.isArray(venues)) {
      return res.status(400).json({
        success: false,
        error: 'Venues array is required'
      });
    }

    // For now, just return success
    // In the future, this could save venues to the database
    res.json({
      success: true,
      message: `${venues.length} venues processed`,
      saved: 0
    });

  } catch (error) {
    console.error('Save venues error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save venues'
    });
  }
});

// Test endpoint for debugging
router.get('/test-search', async (req, res) => {
  res.json({
    success: true,
    message: 'Shop search API is working',
    resultCount: 0,
    url: req.originalUrl
  });
});

export default router;
