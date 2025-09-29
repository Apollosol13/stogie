import { auth } from "@/auth";
import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const cigarId = searchParams.get("cigarId");
    const userId = searchParams.get("userId");

    let reviews;

    if (cigarId) {
      // Get all reviews for a specific cigar
      reviews = await sql`
        SELECT 
          cr.*,
          au.name as user_name,
          au.email as user_email,
          up.username,
          up.display_name,
          up.profile_image_url,
          c.brand,
          c.line,
          c.vitola
        FROM cigar_reviews cr
        JOIN auth_users au ON cr.user_id = au.id
        LEFT JOIN user_profiles up ON cr.user_id = up.user_id
        LEFT JOIN cigars c ON cr.cigar_id = c.id
        WHERE cr.cigar_id = ${cigarId}
        ORDER BY cr.created_at DESC
      `;
    } else if (userId) {
      // Get all reviews by a specific user
      reviews = await sql`
        SELECT 
          cr.*,
          c.brand,
          c.line,
          c.vitola,
          c.wrapper,
          c.strength,
          c.image_url
        FROM cigar_reviews cr
        JOIN cigars c ON cr.cigar_id = c.id
        WHERE cr.user_id = ${userId}
        ORDER BY cr.created_at DESC
      `;
    } else {
      // Get recent reviews (public feed)
      reviews = await sql`
        SELECT 
          cr.*,
          au.name as user_name,
          up.username,
          up.display_name,
          up.profile_image_url,
          c.brand,
          c.line,
          c.vitola,
          c.wrapper,
          c.strength,
          c.image_url
        FROM cigar_reviews cr
        JOIN auth_users au ON cr.user_id = au.id
        LEFT JOIN user_profiles up ON cr.user_id = up.user_id
        JOIN cigars c ON cr.cigar_id = c.id
        WHERE cr.is_featured = true OR cr.helpful_votes > 0
        ORDER BY cr.created_at DESC
        LIMIT 20
      `;
    }

    return Response.json({
      success: true,
      reviews,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return Response.json(
      { success: false, error: "Failed to fetch reviews" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const {
      cigarId,
      rating,
      title,
      reviewText,
      smokeDate,
      smokeDuration,
      pairing,
      environment,
      flavorNotes,
      constructionRating,
      drawRating,
      burnRating,
      flavorRating,
      wouldSmokeAgain,
      wouldRecommend,
      images,
      reviewId, // Check if this is an update
    } = body;

    if (!cigarId || !rating || rating < 1 || rating > 5) {
      return Response.json(
        {
          success: false,
          error: "Cigar ID and valid rating (1-5) are required",
        },
        { status: 400 },
      );
    }

    // Check if user already reviewed this cigar
    const existingReview = await sql`
      SELECT id FROM cigar_reviews 
      WHERE user_id = ${session.user.id} AND cigar_id = ${cigarId}
    `;

    let review;

    if (existingReview.length > 0) {
      // Update existing review
      [review] = await sql`
        UPDATE cigar_reviews SET
          rating = ${rating},
          title = ${title},
          review_text = ${reviewText},
          smoke_date = ${smokeDate},
          smoke_duration = ${smokeDuration},
          pairing = ${pairing},
          environment = ${environment},
          flavor_notes = ${flavorNotes ? JSON.stringify(flavorNotes) : null},
          construction_rating = ${constructionRating},
          draw_rating = ${drawRating},
          burn_rating = ${burnRating},
          flavor_rating = ${flavorRating},
          would_smoke_again = ${wouldSmokeAgain},
          would_recommend = ${wouldRecommend},
          images = ${images ? JSON.stringify(images) : null},
          updated_at = now()
        WHERE user_id = ${session.user.id} AND cigar_id = ${cigarId}
        RETURNING *
      `;
    } else {
      // Create new review
      [review] = await sql`
        INSERT INTO cigar_reviews (
          user_id, cigar_id, rating, title, review_text, smoke_date, 
          smoke_duration, pairing, environment, flavor_notes,
          construction_rating, draw_rating, burn_rating, flavor_rating,
          would_smoke_again, would_recommend, images, created_at, updated_at
        ) VALUES (
          ${session.user.id}, ${cigarId}, ${rating}, ${title}, ${reviewText},
          ${smokeDate}, ${smokeDuration}, ${pairing}, ${environment}, 
          ${flavorNotes ? JSON.stringify(flavorNotes) : null},
          ${constructionRating}, ${drawRating}, ${burnRating}, ${flavorRating},
          ${wouldSmokeAgain}, ${wouldRecommend}, 
          ${images ? JSON.stringify(images) : null},
          now(), now()
        ) RETURNING *
      `;
    }

    // Update cigar's average rating and review count
    await sql`
      UPDATE cigars SET 
        average_rating = (
          SELECT AVG(rating) FROM cigar_reviews WHERE cigar_id = ${cigarId}
        ),
        total_reviews = (
          SELECT COUNT(*) FROM cigar_reviews WHERE cigar_id = ${cigarId}
        ),
        updated_at = now()
      WHERE id = ${cigarId}
    `;

    return Response.json({
      success: true,
      review,
      message:
        existingReview.length > 0
          ? "Review updated successfully"
          : "Review created successfully",
    });
  } catch (error) {
    console.error("Error creating/updating review:", error);
    return Response.json(
      { success: false, error: "Failed to save review" },
      { status: 500 },
    );
  }
}

export async function PUT(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const {
      reviewId,
      rating,
      title,
      reviewText,
      smokeDate,
      smokeDuration,
      pairing,
      environment,
      flavorNotes,
      constructionRating,
      drawRating,
      burnRating,
      flavorRating,
      wouldSmokeAgain,
      wouldRecommend,
      images,
    } = body;

    if (!reviewId) {
      return Response.json(
        { success: false, error: "Review ID is required" },
        { status: 400 },
      );
    }

    // Check if review exists and belongs to user
    const [existingReview] = await sql`
      SELECT id, cigar_id FROM cigar_reviews 
      WHERE id = ${reviewId} AND user_id = ${session.user.id}
    `;

    if (!existingReview) {
      return Response.json(
        { success: false, error: "Review not found or access denied" },
        { status: 404 },
      );
    }

    // Update review
    const [updatedReview] = await sql`
      UPDATE cigar_reviews SET
        rating = ${rating},
        title = ${title},
        review_text = ${reviewText},
        smoke_date = ${smokeDate},
        smoke_duration = ${smokeDuration},
        pairing = ${pairing},
        environment = ${environment},
        flavor_notes = ${flavorNotes ? JSON.stringify(flavorNotes) : null},
        construction_rating = ${constructionRating},
        draw_rating = ${drawRating},
        burn_rating = ${burnRating},
        flavor_rating = ${flavorRating},
        would_smoke_again = ${wouldSmokeAgain},
        would_recommend = ${wouldRecommend},
        images = ${images ? JSON.stringify(images) : null},
        updated_at = now()
      WHERE id = ${reviewId}
      RETURNING *
    `;

    // Update cigar's average rating
    await sql`
      UPDATE cigars SET 
        average_rating = (
          SELECT AVG(rating) FROM cigar_reviews WHERE cigar_id = ${existingReview.cigar_id}
        ),
        updated_at = now()
      WHERE id = ${existingReview.cigar_id}
    `;

    return Response.json({
      success: true,
      review: updatedReview,
    });
  } catch (error) {
    console.error("Error updating review:", error);
    return Response.json(
      { success: false, error: "Failed to update review" },
      { status: 500 },
    );
  }
}

export async function DELETE(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get("reviewId");

    if (!reviewId) {
      return Response.json(
        { success: false, error: "Review ID is required" },
        { status: 400 },
      );
    }

    // Get review details before deletion
    const [review] = await sql`
      SELECT id, cigar_id FROM cigar_reviews 
      WHERE id = ${reviewId} AND user_id = ${session.user.id}
    `;

    if (!review) {
      return Response.json(
        { success: false, error: "Review not found or access denied" },
        { status: 404 },
      );
    }

    // Delete review
    await sql`DELETE FROM cigar_reviews WHERE id = ${reviewId}`;

    // Update cigar's average rating and review count
    await sql`
      UPDATE cigars SET 
        average_rating = (
          SELECT COALESCE(AVG(rating), 0) FROM cigar_reviews WHERE cigar_id = ${review.cigar_id}
        ),
        total_reviews = (
          SELECT COUNT(*) FROM cigar_reviews WHERE cigar_id = ${review.cigar_id}
        ),
        updated_at = now()
      WHERE id = ${review.cigar_id}
    `;

    return Response.json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting review:", error);
    return Response.json(
      { success: false, error: "Failed to delete review" },
      { status: 500 },
    );
  }
}
