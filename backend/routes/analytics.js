import express from 'express';
import supabase, { supabaseAuth } from '../config/database.js';

const router = express.Router();

// GET /api/analytics - Get user analytics data
router.get('/', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    
    // Verify the JWT token using anon client
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);
    
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

    // Get user's smoking sessions count
    const { data: smokingSessions, error: sessionsError } = await supabase
      .from('smoking_sessions')
      .select('id, created_at, location_name, latitude, longitude')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    // Get followers count
    const { count: followersCount } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', user.id);

    // Get following count
    const { count: followingCount } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', user.id);

    // Calculate analytics
    const totalReviews = reviews ? reviews.length : 0;
    const totalCigarsInHumidor = humidorEntries ? humidorEntries.length : 0;
    const totalSmokingSessions = smokingSessions ? smokingSessions.length : 0;
    
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

    const recentSessions = smokingSessions ? smokingSessions.filter(session => 
      new Date(session.created_at) > thirtyDaysAgo
    ).length : 0;

    // Calculate unique countries from smoking sessions
    const uniqueCountries = new Set();
    if (smokingSessions && smokingSessions.length > 0) {
      // For now, we'll count unique location names as a proxy for countries
      // In the future, you could use reverse geocoding to get actual country names
      smokingSessions.forEach(session => {
        if (session.location_name) {
          uniqueCountries.add(session.location_name);
        }
      });
    }

    // Monthly activity for charts
    const monthlyActivity = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
      const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
      
      const monthReviews = reviews ? reviews.filter(r => {
        const date = new Date(r.created_at);
        return date >= monthStart && date <= monthEnd;
      }).length : 0;
      
      const monthSessions = smokingSessions ? smokingSessions.filter(s => {
        const date = new Date(s.created_at);
        return date >= monthStart && date <= monthEnd;
      }).length : 0;
      
      monthlyActivity.push({
        month: monthNames[month.getMonth()],
        reviews: monthReviews,
        sessions: monthSessions
      });
    }

    // Calculate frequency stats
    const accountAge = user.created_at ? 
      Math.max(1, Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24))) : 1;
    
    const cigarsPerDay = totalSmokingSessions / accountAge;
    const cigarsPerWeek = cigarsPerDay * 7;
    const cigarsPerMonth = cigarsPerDay * 30;

    res.json({
      success: true,
      followers: followersCount || 0,
      following: followingCount || 0,
      totalSmoked: totalSmokingSessions,
      countries: uniqueCountries.size,
      analytics: {
        // Session stats (for "Smoked" metric)
        sessionStats: {
          total_sessions: totalSmokingSessions
        },
        // Review stats (for "Avg Rating" metric)
        reviewStats: {
          avg_rating_given: averageRating,
          total_reviews: totalReviews
        },
        // Location stats (for "Countries" metric)
        locationStats: {
          countries_visited: uniqueCountries.size
        },
        // Frequency stats (for cigars per day/week/month)
        frequencyStats: {
          cigars_per_day: cigarsPerDay,
          cigars_per_week: cigarsPerWeek,
          cigars_per_month: cigarsPerMonth
        },
        // User stats (general info)
        userStats: {
          account_age_days: accountAge,
          total_spent: 0, // TODO: implement spending tracking
          followers: followersCount || 0,
          following: followingCount || 0
        },
        // Legacy data for existing components
        overview: {
          totalReviews,
          totalCigarsInHumidor,
          totalSmokingSessions,
          averageRating: Math.round(averageRating * 10) / 10
        },
        recentActivity: {
          reviewsLast30Days: recentReviews,
          humidorAdditionsLast30Days: recentHumidorAdditions,
          sessionsLast30Days: recentSessions
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

// GET /api/analytics/:userId - Get analytics for a specific user (for viewing other profiles)
router.get('/:userId', async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    console.log(`[Analytics] Fetching analytics for user: ${targetUserId}`);

    // Get user's reviews count
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('id, rating, created_at')
      .eq('user_id', targetUserId);

    // Get user's humidor entries count
    const { data: humidorEntries, error: humidorError } = await supabase
      .from('humidor_entries')
      .select('id, created_at')
      .eq('user_id', targetUserId);

    // Get user's smoking sessions count
    const { data: smokingSessions, error: sessionsError } = await supabase
      .from('smoking_sessions')
      .select('id, created_at, location_name, latitude, longitude')
      .eq('user_id', targetUserId)
      .order('created_at', { ascending: false });

    // Get followers count
    const { count: followersCount, error: followersError } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', targetUserId);

    console.log(`[Analytics] Followers count for ${targetUserId}: ${followersCount}`);
    if (followersError) console.error('[Analytics] Followers error:', followersError);

    // Get following count
    const { count: followingCount, error: followingError } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', targetUserId);
    
    console.log(`[Analytics] Following count for ${targetUserId}: ${followingCount}`);
    if (followingError) console.error('[Analytics] Following error:', followingError);

    // Calculate analytics
    const totalReviews = reviews ? reviews.length : 0;
    const totalCigarsInHumidor = humidorEntries ? humidorEntries.length : 0;
    const totalSmokingSessions = smokingSessions ? smokingSessions.length : 0;
    
    // Calculate average rating
    const averageRating = reviews && reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
      : 0;

    // Calculate unique countries from smoking sessions
    const uniqueCountries = new Set();
    if (smokingSessions && smokingSessions.length > 0) {
      smokingSessions.forEach(session => {
        if (session.location_name) {
          uniqueCountries.add(session.location_name);
        }
      });
    }

    // Get user creation date for frequency stats
    const { data: profile } = await supabase
      .from('profiles')
      .select('created_at')
      .eq('id', targetUserId)
      .single();

    const accountAge = profile?.created_at ? 
      Math.max(1, Math.floor((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24))) : 1;
    
    const cigarsPerDay = totalSmokingSessions / accountAge;
    const cigarsPerWeek = cigarsPerDay * 7;
    const cigarsPerMonth = cigarsPerDay * 30;

    res.json({
      success: true,
      followers: followersCount || 0,
      following: followingCount || 0,
      totalSmoked: totalSmokingSessions,
      countries: uniqueCountries.size,
      analytics: {
        sessionStats: {
          total_sessions: totalSmokingSessions
        },
        reviewStats: {
          avg_rating_given: averageRating,
          total_reviews: totalReviews
        },
        locationStats: {
          countries_visited: uniqueCountries.size
        },
        frequencyStats: {
          cigars_per_day: cigarsPerDay,
          cigars_per_week: cigarsPerWeek,
          cigars_per_month: cigarsPerMonth
        },
        userStats: {
          account_age_days: accountAge,
          total_spent: 0,
          followers: followersCount || 0,
          following: followingCount || 0
        },
        overview: {
          totalReviews,
          totalCigarsInHumidor,
          totalSmokingSessions,
          averageRating: Math.round(averageRating * 10) / 10
        }
      }
    });

  } catch (error) {
    console.error('Analytics by userId endpoint error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;
