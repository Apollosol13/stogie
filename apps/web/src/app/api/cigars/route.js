import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Get cigars with filtering and search
export async function GET(request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id"); // Single cigar lookup
    const search = url.searchParams.get("search") || "";
    const strength = url.searchParams.get("strength");
    const brand = url.searchParams.get("brand");
    const minRating = url.searchParams.get("minRating");
    const limit = parseInt(url.searchParams.get("limit")) || 20;
    const offset = parseInt(url.searchParams.get("offset")) || 0;

    // If requesting a single cigar by ID
    if (id) {
      const cigar = await sql`
        SELECT *, smoking_time_minutes, smoking_experience
        FROM cigars 
        WHERE id = ${id}
      `;

      if (cigar.length === 0) {
        return Response.json(
          { success: false, error: "Cigar not found" },
          { status: 404 },
        );
      }

      return Response.json({
        success: true,
        cigars: [cigar[0]],
      });
    }

    // Otherwise, handle list/search requests
    let query =
      "SELECT *, smoking_time_minutes, smoking_experience FROM cigars WHERE 1=1";
    const params = [];
    let paramIndex = 1;

    if (search) {
      query += ` AND (
        LOWER(brand) LIKE LOWER($${paramIndex}) OR 
        LOWER(line) LIKE LOWER($${paramIndex}) OR 
        LOWER(vitola) LIKE LOWER($${paramIndex}) OR
        LOWER(description) LIKE LOWER($${paramIndex})
      )`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (strength) {
      query += ` AND strength = $${paramIndex}`;
      params.push(strength);
      paramIndex++;
    }

    if (brand) {
      query += ` AND LOWER(brand) = LOWER($${paramIndex})`;
      params.push(brand);
      paramIndex++;
    }

    if (minRating) {
      query += ` AND average_rating >= $${paramIndex}`;
      params.push(parseFloat(minRating));
      paramIndex++;
    }

    query += ` ORDER BY average_rating DESC, brand, line, vitola`;
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const cigars = await sql(query, params);

    // Also get total count for pagination
    let countQuery = "SELECT COUNT(*) as total FROM cigars WHERE 1=1";
    const countParams = [];
    let countParamIndex = 1;

    if (search) {
      countQuery += ` AND (
        LOWER(brand) LIKE LOWER($${countParamIndex}) OR 
        LOWER(line) LIKE LOWER($${countParamIndex}) OR 
        LOWER(vitola) LIKE LOWER($${countParamIndex}) OR
        LOWER(description) LIKE LOWER($${countParamIndex})
      )`;
      countParams.push(`%${search}%`);
      countParamIndex++;
    }

    if (strength) {
      countQuery += ` AND strength = $${countParamIndex}`;
      countParams.push(strength);
      countParamIndex++;
    }

    if (brand) {
      countQuery += ` AND LOWER(brand) = LOWER($${countParamIndex})`;
      countParams.push(brand);
      countParamIndex++;
    }

    if (minRating) {
      countQuery += ` AND average_rating >= $${countParamIndex}`;
      countParams.push(parseFloat(minRating));
      countParamIndex++;
    }

    const countResult = await sql(countQuery, countParams);
    const total = parseInt(countResult[0].total);

    return Response.json({
      success: true,
      cigars,
      total,
      hasMore: offset + limit < total,
    });
  } catch (error) {
    console.error("Error fetching cigars:", error);
    return Response.json({ error: "Failed to fetch cigars" }, { status: 500 });
  }
}

// Create new cigar (admin function)
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      console.log("POST /api/cigars - No session found");
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    console.log(
      "POST /api/cigars - Received data:",
      JSON.stringify(data, null, 2),
    );

    // Basic validation
    if (!data.brand || !data.vitola) {
      console.log("POST /api/cigars - Missing required fields:", {
        brand: data.brand,
        vitola: data.vitola,
      });
      return Response.json(
        { error: "Brand and vitola are required" },
        { status: 400 },
      );
    }

    // Parse smoking time from various formats (e.g., "45-60 minutes" -> 52.5)
    let smokingTimeMinutes = null;
    if (data.smoking_time || data.smokingTime || data.smoking_time_minutes) {
      const timeValue =
        data.smoking_time_minutes || data.smoking_time || data.smokingTime;
      if (typeof timeValue === "number") {
        smokingTimeMinutes = timeValue;
      } else if (typeof timeValue === "string") {
        const match = timeValue.match(/(\d+)(?:-(\d+))?/);
        if (match) {
          const min = parseInt(match[1]);
          const max = match[2] ? parseInt(match[2]) : min;
          smokingTimeMinutes = Math.round((min + max) / 2);
        }
      }
      console.log("Parsed smoking time:", {
        input: timeValue,
        output: smokingTimeMinutes,
      });
    }

    // Ensure flavor_profile is an array
    let flavorProfile = data.flavor_profile || [];
    if (typeof flavorProfile === "string") {
      try {
        flavorProfile = JSON.parse(flavorProfile);
      } catch {
        flavorProfile = [flavorProfile];
      }
    }
    if (!Array.isArray(flavorProfile)) {
      flavorProfile = [];
    }

    // Ensure strength is valid for database constraint
    let validStrength = "medium"; // default
    if (data.strength) {
      const strengthLower = String(data.strength).toLowerCase();
      if (["mild", "light", "weak"].includes(strengthLower)) {
        validStrength = "mild";
      } else if (["medium", "med", "moderate"].includes(strengthLower)) {
        validStrength = "medium";
      } else if (["full", "strong", "heavy", "bold"].includes(strengthLower)) {
        validStrength = "full";
      }
    }

    // Prepare the insert data with proper type conversion
    const insertData = {
      brand: String(data.brand || ""),
      line: String(data.line || ""),
      vitola: String(data.vitola || ""),
      length_inches: data.length_inches ? parseFloat(data.length_inches) : null,
      ring_gauge: data.ring_gauge ? parseInt(data.ring_gauge) : null,
      wrapper: String(data.wrapper || ""),
      binder: String(data.binder || ""),
      filler: String(data.filler || ""),
      strength: validStrength, // Use validated strength
      flavor_profile: flavorProfile,
      origin_country: String(data.origin_country || ""),
      price_range: String(data.price_range || ""),
      description: String(data.description || ""),
      image_url: String(data.image_url || ""),
      barcode: String(data.barcode || ""),
      manufacturer: String(data.manufacturer || ""),
      year_released: data.year_released ? parseInt(data.year_released) : null,
      limited_edition: Boolean(data.limited_edition || false),
      smoking_time_minutes: smokingTimeMinutes,
      smoking_experience: String(
        data.smoking_experience || data.smokingExperience || "",
      ),
      ai_confidence: data.ai_confidence ? parseFloat(data.ai_confidence) : null,
      analysis_notes: String(data.analysis_notes || ""),
      is_ai_identified: Boolean(data.is_ai_identified || false),
    };

    console.log(
      "POST /api/cigars - Insert data prepared:",
      JSON.stringify(insertData, null, 2),
    );

    const result = await sql`
      INSERT INTO cigars (
        brand, line, vitola, length_inches, ring_gauge, wrapper,
        binder, filler, strength, flavor_profile, origin_country,
        price_range, description, image_url, barcode, manufacturer,
        year_released, limited_edition, smoking_time_minutes,
        smoking_experience, ai_confidence, analysis_notes, is_ai_identified
      ) VALUES (
        ${insertData.brand},
        ${insertData.line},
        ${insertData.vitola},
        ${insertData.length_inches},
        ${insertData.ring_gauge},
        ${insertData.wrapper},
        ${insertData.binder},
        ${insertData.filler},
        ${insertData.strength},
        ${insertData.flavor_profile},
        ${insertData.origin_country},
        ${insertData.price_range},
        ${insertData.description},
        ${insertData.image_url},
        ${insertData.barcode},
        ${insertData.manufacturer},
        ${insertData.year_released},
        ${insertData.limited_edition},
        ${insertData.smoking_time_minutes},
        ${insertData.smoking_experience},
        ${insertData.ai_confidence},
        ${insertData.analysis_notes},
        ${insertData.is_ai_identified}
      )
      RETURNING *
    `;

    console.log("POST /api/cigars - Cigar created successfully:", result[0]);
    return Response.json(result[0]);
  } catch (error) {
    console.error("POST /api/cigars - Error creating cigar:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    return Response.json(
      {
        error: "Failed to create cigar",
        details: error.message,
        type: error.name,
      },
      { status: 500 },
    );
  }
}
