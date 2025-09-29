import { auth } from "@/auth";
import { upload } from "@/app/api/utils/upload";
import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const userId = session.user.id;

    // Handle file upload
    const formData = await request.formData();
    const imageFile = formData.get("image");

    if (!imageFile) {
      return new Response(JSON.stringify({ error: "No image file provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Convert the file to buffer for upload
    const buffer = Buffer.from(await imageFile.arrayBuffer());

    // Upload the image and get the URL
    const uploadResult = await upload({ buffer });
    const imageUrl = uploadResult?.url;

    if (!imageUrl) {
      return new Response(JSON.stringify({ error: "Failed to upload image" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check if profile exists first
    const existingProfile = await sql`
      SELECT id FROM user_profiles WHERE user_id = ${userId}
    `;

    if (existingProfile.length > 0) {
      // Update existing profile
      await sql`
        UPDATE user_profiles 
        SET profile_image_url = ${imageUrl}, updated_at = NOW()
        WHERE user_id = ${userId}
      `;
    } else {
      // Create new profile with image
      await sql`
        INSERT INTO user_profiles (
          user_id, 
          profile_image_url, 
          display_name, 
          username,
          updated_at
        )
        VALUES (
          ${userId}, 
          ${imageUrl}, 
          ${session.user.name || "Anonymous"},
          ${`user_${userId}_${Date.now()}`},
          NOW()
        )
      `;
    }

    return new Response(
      JSON.stringify({
        success: true,
        imageUrl: imageUrl,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error uploading profile image:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
