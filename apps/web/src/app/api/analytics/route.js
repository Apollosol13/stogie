import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const userId = url.searchParams.get('userId') || session.user.id;
    const period = url.searchParams.get('period') || '30'; // days

    // Get basic user stats
    const userStats = await sql`
      SELECT 
        COUNT(*) as total_cigars,
        SUM(quantity) as total_quantity,
        AVG(purchase_price) as avg_price,
        SUM(purchase_price * quantity) as total_spent
      FROM humidor_entries 
      WHERE user_id = ${userId} AND is_wishlist = false
    `;

    // Get brand distribution
    const brandStats = await sql`
      SELECT 
        c.brand,
        COUNT(*) as count,
        SUM(h.quantity) as total_quantity,
        AVG(c.average_rating) as avg_rating
      FROM humidor_entries h
      JOIN cigars c ON h.cigar_id = c.id
      WHERE h.user_id = ${userId} AND h.is_wishlist = false
      GROUP BY c.brand
      ORDER BY total_quantity DESC
      LIMIT 10
    `;

    // Get strength preference
    const strengthStats = await sql`
      SELECT 
        c.strength,
        COUNT(*) as count,
        SUM(h.quantity) as total_quantity
      FROM humidor_entries h
      JOIN cigars c ON h.cigar_id = c.id
      WHERE h.user_id = ${userId} AND h.is_wishlist = false
      GROUP BY c.strength
      ORDER BY total_quantity DESC
    `;

    // Get wrapper type distribution
    const wrapperStats = await sql`
      SELECT 
        c.wrapper,
        COUNT(*) as count,
        SUM(h.quantity) as total_quantity
      FROM humidor_entries h
      JOIN cigars c ON h.cigar_id = c.id
      WHERE h.user_id = ${userId} 
      AND h.is_wishlist = false 
      AND c.wrapper IS NOT NULL 
      AND c.wrapper != ''
      GROUP BY c.wrapper
      ORDER BY total_quantity DESC
      LIMIT 8
    `;

    // Get recent activity
    const recentActivities = await sql`
      SELECT 
        activity_type,
        details,
        timestamp
      FROM user_activities
      WHERE user_id = ${userId}
      ORDER BY timestamp DESC
      LIMIT 20
    `;

    // Get reviews stats
    const reviewStats = await sql`
      SELECT 
        COUNT(*) as total_reviews,
        AVG(rating) as avg_rating_given,
        COUNT(CASE WHEN would_recommend = true THEN 1 END) as recommendations_given
      FROM cigar_reviews
      WHERE user_id = ${userId}
    `;

    // Get smoking sessions stats
    const sessionStats = await sql`
      SELECT 
        COUNT(*) as total_sessions,
        AVG(duration_minutes) as avg_duration,
        COUNT(DISTINCT DATE(start_time)) as unique_days
      FROM smoking_sessions
      WHERE user_id = ${userId}
      AND start_time >= NOW() - INTERVAL '${parseInt(period)} days'
    `;

    // Get monthly activity over time
    const monthlyActivity = await sql`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        COUNT(*) as entries_added,
        SUM(quantity) as cigars_added
      FROM humidor_entries
      WHERE user_id = ${userId}
      AND created_at >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month DESC
      LIMIT 12
    `;

    // Calculate collection value over time
    const collectionValue = await sql`
      SELECT 
        DATE_TRUNC('month', h.created_at) as month,
        SUM(h.purchase_price * h.quantity) as value_added,
        COUNT(*) as items_added
      FROM humidor_entries h
      WHERE h.user_id = ${userId}
      AND h.is_wishlist = false
      AND h.purchase_price IS NOT NULL
      AND h.created_at >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', h.created_at)
      ORDER BY month DESC
    `;

    return Response.json({
      userStats: userStats[0] || {},
      brandStats: brandStats || [],
      strengthStats: strengthStats || [],
      wrapperStats: wrapperStats || [],
      recentActivities: recentActivities || [],
      reviewStats: reviewStats[0] || {},
      sessionStats: sessionStats[0] || {},
      monthlyActivity: monthlyActivity || [],
      collectionValue: collectionValue || [],
      period: period
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return Response.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}