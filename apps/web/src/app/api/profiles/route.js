import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Get user profile
export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const userId = url.searchParams.get('userId') || session.user.id;

    const profiles = await sql`
      SELECT p.*, u.name, u.email, u.image
      FROM user_profiles p
      JOIN auth_users u ON p.user_id = u.id
      WHERE p.user_id = ${userId}
    `;

    if (profiles.length === 0) {
      // Create default profile if none exists
      const newProfile = await sql`
        INSERT INTO user_profiles (user_id, display_name, username)
        VALUES (${userId}, ${session.user.name || 'Anonymous'}, ${`user_${userId}_${Date.now()}`})
        RETURNING *
      `;
      
      return Response.json({
        ...newProfile[0],
        name: session.user.name,
        email: session.user.email,
        image: session.user.image
      });
    }

    return Response.json(profiles[0]);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return Response.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

// Create or update user profile
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const userId = session.user.id;

    // Check if profile exists
    const existing = await sql`
      SELECT id FROM user_profiles WHERE user_id = ${userId}
    `;

    let result;
    if (existing.length > 0) {
      // Update existing profile
      const updateFields = [];
      const values = [];
      let paramIndex = 1;

      const allowedFields = [
        'username', 'display_name', 'bio', 'profile_image_url',
        'experience_level', 'favorite_wrapper', 'favorite_strength',
        'location', 'preferences'
      ];

      for (const field of allowedFields) {
        if (data[field] !== undefined) {
          updateFields.push(`${field} = $${paramIndex}`);
          values.push(data[field]);
          paramIndex++;
        }
      }

      if (updateFields.length > 0) {
        updateFields.push(`updated_at = $${paramIndex}`);
        values.push(new Date());
        values.push(userId); // for WHERE clause

        const query = `
          UPDATE user_profiles 
          SET ${updateFields.join(', ')}
          WHERE user_id = $${paramIndex + 1}
          RETURNING *
        `;

        result = await sql(query, values);
      } else {
        result = existing;
      }
    } else {
      // Create new profile
      result = await sql`
        INSERT INTO user_profiles (
          user_id, username, display_name, bio, profile_image_url,
          experience_level, favorite_wrapper, favorite_strength,
          location, preferences
        ) VALUES (
          ${userId}, 
          ${data.username || `user_${userId}_${Date.now()}`},
          ${data.display_name || session.user.name || 'Anonymous'},
          ${data.bio || ''},
          ${data.profile_image_url || ''},
          ${data.experience_level || 'beginner'},
          ${data.favorite_wrapper || ''},
          ${data.favorite_strength || 'medium'},
          ${data.location || ''},
          ${JSON.stringify(data.preferences || {})}
        )
        RETURNING *
      `;
    }

    return Response.json(result[0]);
  } catch (error) {
    console.error('Error updating profile:', error);
    return Response.json({ error: "Failed to update profile" }, { status: 500 });
  }
}