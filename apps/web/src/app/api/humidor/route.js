import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Get user's humidor
export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const userId = url.searchParams.get("userId") || session.user.id;
    const includeWishlist = url.searchParams.get("includeWishlist") === "true";

    let query = `
      SELECT 
        h.*,
        c.brand,
        c.line,
        c.vitola,
        c.strength,
        c.wrapper,
        c.binder,
        c.filler,
        c.length_inches,
        c.ring_gauge,
        c.image_url,
        c.average_rating,
        c.price_range,
        c.flavor_profile,
        c.origin_country,
        c.description,
        c.smoking_time_minutes,
        c.smoking_experience,
        c.ai_confidence,
        c.analysis_notes,
        c.is_ai_identified
      FROM humidor_entries h
      JOIN cigars c ON h.cigar_id = c.id
      WHERE h.user_id = $1
    `;

    const params = [userId];

    if (!includeWishlist) {
      query += ` AND h.is_wishlist = false`;
    }

    query += ` ORDER BY h.created_at DESC`;

    const entries = await sql(query, params);

    // Calculate total value and stats
    const stats = {
      totalCigars: entries
        .filter((e) => !e.is_wishlist)
        .reduce((sum, e) => sum + e.quantity, 0),
      totalValue: entries
        .filter((e) => !e.is_wishlist && e.purchase_price)
        .reduce((sum, e) => sum + e.purchase_price * e.quantity, 0),
      wishlistCount: entries.filter((e) => e.is_wishlist).length,
      uniqueBrands: new Set(entries.map((e) => e.brand)).size,
      averageRating:
        entries.length > 0
          ? entries.reduce((sum, e) => sum + (e.average_rating || 0), 0) /
            entries.length
          : 0,
    };

    return Response.json({
      entries,
      stats,
    });
  } catch (error) {
    console.error("Error fetching humidor:", error);
    return Response.json({ error: "Failed to fetch humidor" }, { status: 500 });
  }
}

// Add cigar to humidor
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const userId = session.user.id;

    if (!data.cigar_id) {
      return Response.json({ error: "Cigar ID is required" }, { status: 400 });
    }

    // Check if entry already exists
    const existing = await sql`
      SELECT * FROM humidor_entries 
      WHERE user_id = ${userId} AND cigar_id = ${data.cigar_id}
    `;

    let result;
    if (existing.length > 0) {
      // Update existing entry
      const entry = existing[0];
      const newQuantity = data.is_wishlist
        ? entry.quantity
        : (entry.quantity || 0) + (data.quantity || 1);

      result = await sql`
        UPDATE humidor_entries 
        SET 
          quantity = ${newQuantity},
          purchase_date = ${data.purchase_date || entry.purchase_date},
          purchase_price = ${data.purchase_price || entry.purchase_price},
          purchase_location = ${data.purchase_location || entry.purchase_location},
          storage_location = ${data.storage_location || entry.storage_location},
          personal_notes = ${data.personal_notes || entry.personal_notes},
          is_wishlist = ${data.is_wishlist !== undefined ? data.is_wishlist : entry.is_wishlist},
          updated_at = NOW()
        WHERE id = ${entry.id}
        RETURNING *
      `;
    } else {
      // Create new entry
      result = await sql`
        INSERT INTO humidor_entries (
          user_id, cigar_id, quantity, purchase_date, purchase_price,
          purchase_location, storage_location, personal_notes, is_wishlist
        ) VALUES (
          ${userId},
          ${data.cigar_id},
          ${data.quantity || 1},
          ${data.purchase_date || null},
          ${data.purchase_price || null},
          ${data.purchase_location || ""},
          ${data.storage_location || ""},
          ${data.personal_notes || ""},
          ${data.is_wishlist || false}
        )
        RETURNING *
      `;
    }

    // Log user activity
    await sql`
      INSERT INTO user_activities (user_id, activity_type, details)
      VALUES (${userId}, 'humidor_add', ${JSON.stringify({
        cigar_id: data.cigar_id,
        quantity: data.quantity || 1,
        is_wishlist: data.is_wishlist || false,
      })})
    `;

    return Response.json(result[0]);
  } catch (error) {
    console.error("Error adding to humidor:", error);
    return Response.json(
      { error: "Failed to add to humidor" },
      { status: 500 },
    );
  }
}

// Update humidor entry
export async function PUT(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const userId = session.user.id;

    if (!data.id) {
      return Response.json({ error: "Entry ID is required" }, { status: 400 });
    }

    // Verify ownership
    const existing = await sql`
      SELECT * FROM humidor_entries 
      WHERE id = ${data.id} AND user_id = ${userId}
    `;

    if (existing.length === 0) {
      return Response.json({ error: "Entry not found" }, { status: 404 });
    }

    const updateFields = [];
    const values = [];
    let paramIndex = 1;

    const allowedFields = [
      "quantity",
      "purchase_date",
      "purchase_price",
      "purchase_location",
      "storage_location",
      "age_years",
      "personal_notes",
      "condition",
      "is_wishlist",
    ];

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updateFields.push(`${field} = $${paramIndex}`);
        values.push(data[field]);
        paramIndex++;
      }
    }

    if (updateFields.length === 0) {
      return Response.json(existing[0]);
    }

    updateFields.push(`updated_at = $${paramIndex}`);
    values.push(new Date());
    values.push(data.id);

    const query = `
      UPDATE humidor_entries 
      SET ${updateFields.join(", ")}
      WHERE id = $${paramIndex + 1}
      RETURNING *
    `;

    const result = await sql(query, values);

    return Response.json(result[0]);
  } catch (error) {
    console.error("Error updating humidor entry:", error);
    return Response.json(
      { error: "Failed to update humidor entry" },
      { status: 500 },
    );
  }
}

// Delete humidor entry
export async function DELETE(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const entryId = url.searchParams.get("id");
    const userId = session.user.id;

    if (!entryId) {
      return Response.json({ error: "Entry ID is required" }, { status: 400 });
    }

    // Verify ownership and delete
    const result = await sql`
      DELETE FROM humidor_entries 
      WHERE id = ${entryId} AND user_id = ${userId}
      RETURNING *
    `;

    if (result.length === 0) {
      return Response.json({ error: "Entry not found" }, { status: 404 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting humidor entry:", error);
    return Response.json(
      { error: "Failed to delete humidor entry" },
      { status: 500 },
    );
  }
}
