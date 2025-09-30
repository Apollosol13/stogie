import express from 'express';
import supabase from '../config/database.js';

const router = express.Router();

// GET /api/analytics - Get user analytics data
router.get('/', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    
    // Verify the JWT token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }

    // Get user's reviews count
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('id, rating, created_at')
      .eq('user_id', user.id);

    // Get user's humidor entries count
    const { data: humidorEntries, error: humidorError } = await supabase
      .from('humidor_entries')
      .select('id, created_at')
      .eq('user_id', user.id);

    // Get user's smoking sessions count (when implemented)
    const smokingSessions = []; // Placeholder for now

    // Calculate analytics
    const totalReviews = reviews ? reviews.length : 0;
    const totalCigarsInHumidor = humidorEntries ? humidorEntries.length : 0;
    const totalSmokingSessions = smokingSessions.length;
    
    // Calculate average rating
    const averageRating = reviews && reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
      : 0;

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentReviews = reviews ? reviews.filter(review => 
      new Date(review.created_at) > thirtyDaysAgo
    ).length : 0;

    const recentHumidorAdditions = humidorEntries ? humidorEntries.filter(entry => 
      new Date(entry.created_at) > thirtyDaysAgo
    ).length : 0;

    // Monthly activity for charts (placeholder data)
    const monthlyActivity = [
      { month: 'Jan', reviews: Math.floor(Math.random() * 10), sessions: Math.floor(Math.random() * 15) },
      { month: 'Feb', reviews: Math.floor(Math.random() * 10), sessions: Math.floor(Math.random() * 15) },
      { month: 'Mar', reviews: Math.floor(Math.random() * 10), sessions: Math.floor(Math.random() * 15) },
      { month: 'Apr', reviews: Math.floor(Math.random() * 10), sessions: Math.floor(Math.random() * 15) },
      { month: 'May', reviews: Math.floor(Math.random() * 10), sessions: Math.floor(Math.random() * 15) },
      { month: 'Jun', reviews: Math.floor(Math.random() * 10), sessions: Math.floor(Math.random() * 15) }
    ];

    res.json({
      success: true,
      analytics: {
        overview: {
          totalReviews,
          totalCigarsInHumidor,
          totalSmokingSessions,
          averageRating: Math.round(averageRating * 10) / 10
        },
        recentActivity: {
          reviewsLast30Days: recentReviews,
          humidorAdditionsLast30Days: recentHumidorAdditions,
          sessionsLast30Days: 0 // Placeholder
        },
        monthlyActivity,
        topBrands: [
          { name: 'Cohiba', count: 5 },
          { name: 'Montecristo', count: 4 },
          { name: 'Romeo y Julieta', count: 3 }
        ],
        ratingDistribution: {
          5: Math.floor(totalReviews * 0.3),
          4: Math.floor(totalReviews * 0.4),
          3: Math.floor(totalReviews * 0.2),
          2: Math.floor(totalReviews * 0.08),
          1: Math.floor(totalReviews * 0.02)
        }
      }
    });

  } catch (error) {
    console.error('Analytics endpoint error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;
