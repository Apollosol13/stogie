import sql from '@/app/api/utils/sql';

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const bounds = url.searchParams.get('bounds');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '100'), 100);

    let whereClause = 'WHERE 1=1';
    let values = [];
    let paramCount = 0;

    // Filter by bounds if provided (format: "lat1,lng1,lat2,lng2")
    if (bounds) {
      const [lat1, lng1, lat2, lng2] = bounds.split(',').map(Number);
      const minLat = Math.min(lat1, lat2);
      const maxLat = Math.max(lat1, lat2);
      const minLng = Math.min(lng1, lng2);
      const maxLng = Math.max(lng1, lng2);
      
      whereClause += ` AND latitude BETWEEN $${++paramCount} AND $${++paramCount}`;
      whereClause += ` AND longitude BETWEEN $${++paramCount} AND $${++paramCount}`;
      values.push(minLat, maxLat, minLng, maxLng);
    }

    const query = `
      SELECT 
        s.*,
        COUNT(DISTINCT ss.id) as session_count,
        ARRAY_AGG(DISTINCT c.brand || ' ' || COALESCE(c.line, '') ORDER BY c.brand) 
          FILTER (WHERE c.brand IS NOT NULL) as popular_cigars
      FROM shops s
      LEFT JOIN smoking_sessions ss ON s.id = ss.shop_id AND ss.created_at > NOW() - INTERVAL '30 days'
      LEFT JOIN cigars c ON ss.cigar_id = c.id
      ${whereClause}
      GROUP BY s.id
      ORDER BY s.average_rating DESC, s.created_at DESC
      LIMIT $${++paramCount}
    `;
    
    values.push(limit);

    const shops = await sql(query, values);

    return Response.json({
      success: true,
      shops: shops.map(shop => ({
        id: shop.id,
        name: shop.name,
        address: shop.address,
        city: shop.city,
        state: shop.state,
        country: shop.country,
        postalCode: shop.postal_code,
        latitude: parseFloat(shop.latitude),
        longitude: parseFloat(shop.longitude),
        phone: shop.phone,
        website: shop.website,
        hoursOfOperation: shop.hours_of_operation,
        hasLounge: shop.has_lounge,
        hasHumidor: shop.has_humidor,
        allowsSmoking: shop.allows_smoking,
        description: shop.description,
        imageUrls: shop.image_urls || [],
        averageRating: parseFloat(shop.average_rating) || 0,
        totalReviews: shop.total_reviews || 0,
        verified: shop.verified,
        sessionCount: parseInt(shop.session_count) || 0,
        popularCigars: shop.popular_cigars ? shop.popular_cigars.filter(Boolean).slice(0, 5) : [],
        createdAt: shop.created_at,
        updatedAt: shop.updated_at
      }))
    });

  } catch (error) {
    console.error('Error fetching shops:', error);
    return Response.json({ error: 'Failed to fetch shops' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      name,
      address,
      city,
      state,
      country,
      postalCode,
      latitude,
      longitude,
      phone,
      website,
      hoursOfOperation,
      hasLounge = false,
      hasHumidor = false,
      allowsSmoking = false,
      description
    } = body;

    // Validation
    if (!name || !latitude || !longitude) {
      return Response.json({ 
        error: 'Name, latitude, and longitude are required' 
      }, { status: 400 });
    }

    // Insert new shop
    const result = await sql`
      INSERT INTO shops (
        name,
        address,
        city,
        state,
        country,
        postal_code,
        latitude,
        longitude,
        phone,
        website,
        hours_of_operation,
        has_lounge,
        has_humidor,
        allows_smoking,
        description,
        verified
      ) VALUES (
        ${name},
        ${address || null},
        ${city || null},
        ${state || null},
        ${country || null},
        ${postalCode || null},
        ${latitude},
        ${longitude},
        ${phone || null},
        ${website || null},
        ${hoursOfOperation || null},
        ${hasLounge},
        ${hasHumidor},
        ${allowsSmoking},
        ${description || null},
        false
      )
      RETURNING *
    `;

    return Response.json({
      success: true,
      shop: {
        id: result[0].id,
        name: result[0].name,
        address: result[0].address,
        city: result[0].city,
        state: result[0].state,
        country: result[0].country,
        latitude: parseFloat(result[0].latitude),
        longitude: parseFloat(result[0].longitude),
        phone: result[0].phone,
        website: result[0].website,
        hoursOfOperation: result[0].hours_of_operation,
        hasLounge: result[0].has_lounge,
        hasHumidor: result[0].has_humidor,
        allowsSmoking: result[0].allows_smoking,
        description: result[0].description,
        verified: result[0].verified,
        createdAt: result[0].created_at
      }
    });

  } catch (error) {
    console.error('Error creating shop:', error);
    return Response.json({ error: 'Failed to create shop' }, { status: 500 });
  }
}