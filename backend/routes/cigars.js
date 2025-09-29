import express from 'express';
import { supabase } from '../server.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all cigars (public endpoint)
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search, 
      brand, 
      strength,
      id 
    } = req.query;

    let query = supabase
      .from('cigars')
      .select('*');

    // If specific ID requested
    if (id) {
      query = query.eq('id', id);
    }

    // Apply filters
    if (search) {
      query = query.or(`brand.ilike.%${search}%,line.ilike.%${search}%,vitola.ilike.%${search}%`);
    }

    if (brand) {
      query = query.ilike('brand', `%${brand}%`);
    }

    if (strength) {
      query = query.eq('strength', strength.toUpperCase());
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
      cigars: data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get cigars error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch cigars'
    });
  }
});

// Get single cigar by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('cigars')
      .select(`
        *,
        reviews (
          id,
          rating,
          title,
          content,
          created_at,
          profiles (
            username,
            full_name,
            avatar_url
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Cigar not found'
        });
      }
      throw error;
    }

    res.json({
      success: true,
      cigar: data
    });

  } catch (error) {
    console.error('Get cigar error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch cigar'
    });
  }
});

// Create new cigar (authenticated)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      brand,
      line,
      vitola,
      strength,
      wrapper,
      binder,
      filler,
      country,
      imageUrl,
      description
    } = req.body;

    // Validate required fields
    if (!brand || !vitola) {
      return res.status(400).json({
        success: false,
        error: 'Brand and vitola are required'
      });
    }

    // Validate strength
    const validStrengths = ['MILD', 'MEDIUM', 'FULL'];
    if (strength && !validStrengths.includes(strength.toUpperCase())) {
      return res.status(400).json({
        success: false,
        error: 'Strength must be MILD, MEDIUM, or FULL'
      });
    }

    const cigarData = {
      brand: brand.trim(),
      line: line?.trim() || null,
      vitola: vitola.trim(),
      strength: strength?.toUpperCase() || null,
      wrapper: wrapper?.trim() || null,
      binder: binder?.trim() || null,
      filler: filler?.trim() || null,
      country: country?.trim() || null,
      image_url: imageUrl || null,
      description: description?.trim() || null
    };

    const { data, error } = await supabase
      .from('cigars')
      .insert([cigarData])
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json({
      success: true,
      cigar: data
    });

  } catch (error) {
    console.error('Create cigar error:', error);
    
    // Handle duplicate entries
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        error: 'A cigar with this brand, line, and vitola already exists'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to create cigar'
    });
  }
});

// Update cigar (authenticated)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Remove fields that shouldn't be updated directly
    delete updates.id;
    delete updates.created_at;
    delete updates.average_rating;
    delete updates.total_reviews;

    // Validate strength if provided
    if (updates.strength) {
      const validStrengths = ['MILD', 'MEDIUM', 'FULL'];
      if (!validStrengths.includes(updates.strength.toUpperCase())) {
        return res.status(400).json({
          success: false,
          error: 'Strength must be MILD, MEDIUM, or FULL'
        });
      }
      updates.strength = updates.strength.toUpperCase();
    }

    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('cigars')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Cigar not found'
        });
      }
      throw error;
    }

    res.json({
      success: true,
      cigar: data
    });

  } catch (error) {
    console.error('Update cigar error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update cigar'
    });
  }
});

// Delete cigar (authenticated - admin only in future)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('cigars')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: 'Cigar deleted successfully'
    });

  } catch (error) {
    console.error('Delete cigar error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete cigar'
    });
  }
});

// Search cigars with advanced filters
router.get('/search/advanced', async (req, res) => {
  try {
    const {
      query: searchQuery,
      brand,
      strength,
      wrapper,
      country,
      minRating,
      sortBy = 'created_at',
      sortOrder = 'desc',
      page = 1,
      limit = 20
    } = req.query;

    let query = supabase
      .from('cigars')
      .select('*');

    // Text search across multiple fields
    if (searchQuery) {
      query = query.or(`brand.ilike.%${searchQuery}%,line.ilike.%${searchQuery}%,vitola.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
    }

    // Apply filters
    if (brand) query = query.ilike('brand', `%${brand}%`);
    if (strength) query = query.eq('strength', strength.toUpperCase());
    if (wrapper) query = query.ilike('wrapper', `%${wrapper}%`);
    if (country) query = query.ilike('country', `%${country}%`);
    if (minRating) query = query.gte('average_rating', parseFloat(minRating));

    // Apply sorting
    const validSortFields = ['created_at', 'brand', 'average_rating', 'total_reviews'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const ascending = sortOrder.toLowerCase() === 'asc';

    query = query.order(sortField, { ascending });

    // Apply pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query = query.range(offset, offset + parseInt(limit) - 1);

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      cigars: data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Advanced search error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search cigars'
    });
  }
});

export default router;
