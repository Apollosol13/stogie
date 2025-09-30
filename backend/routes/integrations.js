import express from 'express';

const router = express.Router();

// Google Places API proxy endpoints
// These endpoints proxy requests to Google Places API to avoid CORS issues

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// Places Autocomplete API
router.get('/google-place-autocomplete/autocomplete/json', async (req, res) => {
  try {
    const { input, radius, types } = req.query;
    
    if (!GOOGLE_MAPS_API_KEY) {
      return res.status(500).json({
        error: 'Google Maps API key not configured'
      });
    }

    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${GOOGLE_MAPS_API_KEY}`;
    
    // Add optional parameters
    const params = new URLSearchParams();
    if (radius) params.append('radius', radius);
    if (types) params.append('types', types);
    
    const fullUrl = params.toString() ? `${url}&${params.toString()}` : url;
    
    const response = await fetch(fullUrl);
    const data = await response.json();
    
    res.json(data);

  } catch (error) {
    console.error('Google Places Autocomplete error:', error);
    res.status(500).json({
      error: 'Failed to fetch place suggestions',
      predictions: []
    });
  }
});

// Places Details API
router.get('/google-place-autocomplete/details/json', async (req, res) => {
  try {
    const { place_id, fields } = req.query;
    
    if (!GOOGLE_MAPS_API_KEY) {
      return res.status(500).json({
        error: 'Google Maps API key not configured'
      });
    }

    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&key=${GOOGLE_MAPS_API_KEY}`;
    
    // Add optional fields parameter
    const params = new URLSearchParams();
    if (fields) params.append('fields', fields);
    
    const fullUrl = params.toString() ? `${url}&${params.toString()}` : url;
    
    const response = await fetch(fullUrl);
    const data = await response.json();
    
    res.json(data);

  } catch (error) {
    console.error('Google Places Details error:', error);
    res.status(500).json({
      error: 'Failed to fetch place details',
      result: null
    });
  }
});

// Places Nearby Search API
router.get('/google-place-autocomplete/nearbysearch/json', async (req, res) => {
  try {
    const { location, radius, type, keyword } = req.query;
    
    if (!GOOGLE_MAPS_API_KEY) {
      return res.status(500).json({
        error: 'Google Maps API key not configured'
      });
    }

    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location}&radius=${radius}&key=${GOOGLE_MAPS_API_KEY}`;
    
    // Add optional parameters
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (keyword) params.append('keyword', keyword);
    
    const fullUrl = params.toString() ? `${url}&${params.toString()}` : url;
    
    const response = await fetch(fullUrl);
    const data = await response.json();
    
    res.json(data);

  } catch (error) {
    console.error('Google Places Nearby Search error:', error);
    res.status(500).json({
      error: 'Failed to search nearby places',
      results: []
    });
  }
});

export default router;
