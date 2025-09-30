import express from 'express';
import supabase from '../config/database.js';
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

// Analyze cigar image with OpenAI Vision (requires authentication)
router.post('/analyze', authenticateToken, async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({
        success: false,
        error: 'No image provided'
      });
    }

    // Import OpenAI (dynamic import for ES modules)
    const { OpenAI } = await import('openai');
    
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'OpenAI API key not configured'
      });
    }

    // Call OpenAI GPT-4 Vision (updated model name)
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `You are a master tobacconist and cigar expert. Analyze this cigar image and provide comprehensive information. Extract what you can see from the band/packaging, and use your extensive cigar knowledge to provide typical characteristics for this specific cigar.

Please provide detailed information in JSON format with these exact keys:

{
  "brand": "Brand name (e.g., Padron, Romeo y Julieta, Cohiba)",
  "line": "Series/Line name (e.g., 1964, Churchill, Esplendidos)",
  "vitola": "Size name (e.g., Robusto, Churchill, Toro, Torpedo)",
  "wrapper": "Wrapper type (e.g., Connecticut Shade, Habano, Maduro, Connecticut Broadleaf, Ecuador Sumatra)",
  "binder": "Typical binder for this cigar (e.g., Nicaragua, Dominican, Ecuador, Connecticut)",
  "filler": "Typical filler blend (e.g., Nicaragua, Dominican Republic, Honduras, Cuba)",
  "strength": "Strength level: mild, medium-mild, medium, medium-full, or full",
  "flavorProfile": ["array", "of", "typical", "flavor", "notes"],
  "ringGauge": "Ring gauge number (e.g., 50, 52, 54)",
  "length": "Length in inches (e.g., 5.0, 6.0, 7.0)",
  "smokingTime": "Typical smoking duration (e.g., 45-60 minutes, 1-1.5 hours)",
  "priceRange": "Typical price range (e.g., $8-12, $15-25, $30-50)",
  "origin": "Country of origin (e.g., Nicaragua, Dominican Republic, Cuba, Honduras)",
  "notes": "Brief tasting notes and characteristics",
  "smokingExperience": "Description of the typical smoking experience",
  "description": "Overall description of this cigar"
}

IMPORTANT: 
- Use your cigar knowledge to fill in typical characteristics even if not visible in the image
- For flavor profile, include 4-6 common tasting notes
- Strength should be based on the specific brand/line combination
- If you cannot identify the exact cigar, make your best educated guess based on visible elements
- All fields should have values - use "Unknown" only if absolutely necessary
- Focus on accuracy based on your cigar knowledge, not just what's visible
- Return ONLY the JSON object, no additional text`
            },
            {
              type: "image_url",
              image_url: {
                url: image
              }
            }
          ]
        }
      ],
      max_tokens: 1000
    });

    const analysisText = response.choices[0].message.content;
    
    // Parse the JSON response
    let analysis;
    try {
      analysis = JSON.parse(analysisText);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', analysisText);
      return res.status(500).json({
        success: false,
        error: 'Failed to parse AI analysis'
      });
    }

    res.json({
      success: true,
      analysis: analysis
    });

  } catch (error) {
    console.error('OpenAI analysis error:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.status,
      code: error.code,
      type: error.type
    });
    
    // Return more specific error information
    const errorMessage = error.status === 401 
      ? 'OpenAI API key invalid or expired'
      : error.status === 429
      ? 'OpenAI API rate limit exceeded'
      : error.message || 'Failed to analyze cigar image';
    
    res.status(500).json({
      success: false,
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

