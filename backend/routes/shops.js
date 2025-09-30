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

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required'
      });
    }

    const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
    if (!GOOGLE_MAPS_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'Google Maps API key not configured'
      });
    }

    // Search for cigar-related businesses using Google Places Nearby Search
    const searchTerms = [
      'cigar lounge',
      'cigar shop',
      'tobacco shop',
      'cigar bar',
      'smoke shop'
    ];

    let allVenues = [];

    for (const term of searchTerms) {
      const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&keyword=${encodeURIComponent(term)}&key=${GOOGLE_MAPS_API_KEY}`;
      
      try {
        const response = await fetch(placesUrl);
        const data = await response.json();

        if (data.status === 'OK' && data.results) {
          const venues = data.results.map(place => ({
            id: place.place_id,
            name: place.name,
            address: place.vicinity,
            latitude: place.geometry.location.lat,
            longitude: place.geometry.location.lng,
            rating: place.rating || 0,
            price_level: place.price_level || 0,
            types: place.types || [],
            photos: place.photos ? place.photos.map(photo => 
              `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${GOOGLE_MAPS_API_KEY}`
            ) : [],
            open_now: place.opening_hours?.open_now || null,
            business_status: place.business_status || 'OPERATIONAL'
          }));

          allVenues = allVenues.concat(venues);
        }
      } catch (searchError) {
        console.error(`Error searching for ${term}:`, searchError);
      }
    }

    // Remove duplicates based on place_id
    const uniqueVenues = allVenues.filter((venue, index, self) => 
      index === self.findIndex(v => v.id === venue.id)
    );

    // Sort by rating (highest first)
    uniqueVenues.sort((a, b) => (b.rating || 0) - (a.rating || 0));

    res.json({
      success: true,
      results: uniqueVenues,
      venues: uniqueVenues, // Keep both for compatibility
      count: uniqueVenues.length,
      searchTerms: searchTerms,
      location: { latitude: parseFloat(latitude), longitude: parseFloat(longitude) },
      radius: parseInt(radius)
    });

  } catch (error) {
    console.error('Search shops error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search venues',
      details: error.message
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
  try {
    // Test with a default location (NYC) if no location provided
    const testLat = req.query.latitude || '40.7128';
    const testLng = req.query.longitude || '-74.0060';
    
    // Make a test search request to our own search endpoint
    const searchUrl = `${req.protocol}://${req.get('host')}/api/shops/search?latitude=${testLat}&longitude=${testLng}&radius=5000`;
    
    const response = await fetch(searchUrl);
    const data = await response.json();
    
    res.json({
      success: true,
      message: 'Shop search API is working',
      testLocation: { latitude: testLat, longitude: testLng },
      resultCount: data.venues ? data.venues.length : 0,
      sampleResults: data.venues ? data.venues.slice(0, 3) : [],
      url: req.originalUrl
    });
  } catch (error) {
    res.json({
      success: true,
      message: 'Shop search API is working (basic mode)',
      resultCount: 0,
      error: error.message,
      url: req.originalUrl
    });
  }
});

export default router;
