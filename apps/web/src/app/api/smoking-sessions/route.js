import sql from '@/app/api/utils/sql';
import { auth } from '@/auth';

export async function GET(request) {
  try {
    const session = await auth();
    if (!session) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }

    const url = new URL(request.url);
    const bounds = url.searchParams.get('bounds');
    const userId = url.searchParams.get('userId');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);

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

    // Filter by user if provided
    if (userId) {
      whereClause += ` AND ss.user_id = $${++paramCount}`;
      values.push(userId);
    }

    const query = `
      SELECT 
        ss.*,
        c.brand,
        c.line,
        c.vitola,
        c.strength,
        c.wrapper,
        c.image_url as cigar_image,
        u.name as user_name,
        s.name as shop_name,
        s.latitude as shop_latitude,
        s.longitude as shop_longitude
      FROM smoking_sessions ss
      LEFT JOIN cigars c ON ss.cigar_id = c.id
      LEFT JOIN auth_users u ON ss.user_id = u.id
      LEFT JOIN shops s ON ss.shop_id = s.id
      ${whereClause}
      ORDER BY ss.created_at DESC
      LIMIT $${++paramCount}
    `;
    
    values.push(limit);

    const sessions = await sql(query, values);

    return Response.json({
      success: true,
      sessions: sessions.map(session => ({
        id: session.id,
        userId: session.user_id,
        userName: session.user_name,
        cigar: {
          id: session.cigar_id,
          brand: session.brand,
          line: session.line,
          vitola: session.vitola,
          strength: session.strength,
          wrapper: session.wrapper,
          image: session.cigar_image
        },
        shop: session.shop_id ? {
          id: session.shop_id,
          name: session.shop_name,
          latitude: session.shop_latitude,
          longitude: session.shop_longitude
        } : null,
        location: session.location,
        latitude: parseFloat(session.latitude) || null,
        longitude: parseFloat(session.longitude) || null,
        startTime: session.start_time,
        endTime: session.end_time,
        duration: session.duration_minutes,
        weather: session.weather,
        companions: session.companions,
        pairing: session.pairing,
        notes: session.notes,
        moodBefore: session.mood_before,
        moodAfter: session.mood_after,
        occasion: session.occasion,
        photos: session.photos,
        createdAt: session.created_at
      }))
    });

  } catch (error) {
    console.error('Error fetching smoking sessions:', error);
    return Response.json({ error: 'Failed to fetch smoking sessions' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const {
      cigarId,
      shopId,
      location,
      latitude,
      longitude,
      weather,
      companions = [],
      pairing,
      notes,
      moodBefore,
      occasion,
      photos = []
    } = body;

    // Validation
    if (!cigarId && !location) {
      return Response.json({ error: 'Either cigarId or location is required' }, { status: 400 });
    }

    // Insert new smoking session
    const result = await sql`
      INSERT INTO smoking_sessions (
        user_id,
        cigar_id,
        shop_id,
        start_time,
        location,
        latitude,
        longitude,
        weather,
        companions,
        pairing,
        notes,
        mood_before,
        occasion,
        photos
      ) VALUES (
        ${session.user.id},
        ${cigarId || null},
        ${shopId || null},
        NOW(),
        ${location || null},
        ${latitude || null},
        ${longitude || null},
        ${weather || null},
        ${companions},
        ${pairing || null},
        ${notes || null},
        ${moodBefore || null},
        ${occasion || null},
        ${photos}
      )
      RETURNING *
    `;

    // Log activity
    await sql`
      INSERT INTO user_activities (user_id, activity_type, details)
      VALUES (
        ${session.user.id},
        'smoking_session_created',
        ${JSON.stringify({
          sessionId: result[0].id,
          location: location,
          cigarId: cigarId
        })}
      )
    `;

    return Response.json({
      success: true,
      session: {
        id: result[0].id,
        ...result[0]
      }
    });

  } catch (error) {
    console.error('Error creating smoking session:', error);
    return Response.json({ error: 'Failed to create smoking session' }, { status: 500 });
  }
}