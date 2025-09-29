export async function POST(request) {
  try {
    const { image } = await request.json();

    if (!image) {
      return Response.json({ error: "No image provided" }, { status: 400 });
    }

    // Call GPT-4 Vision to analyze the cigar image
    const response = await fetch("/integrations/gpt-vision/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `You are a master tobacconist and cigar expert. Analyze this cigar image and provide comprehensive information. Extract what you can see from the band/packaging, and use your extensive cigar knowledge to provide typical characteristics for this specific cigar.

              Please provide detailed information in JSON format with these exact keys:

              {
                "brand": "Brand name (e.g., Padron, Romeo y Julieta, Cohiba)",
                "line": "Series/Line name (e.g., 1964, Churchill, Esplendidos)",
                "vitola": "Size name (e.g., Robusto, Churchill, Toro, Torpedo)",
                "wrapper": "Wrapper type (e.g., Connecticut Shade, Habano, Maduro, Connecticut Broadleaf, Ecuador Sumatra)",
                "binder": "Typical binder for this cigar (e.g., Nicaragua, Dominican, Ecuador, Connecticut)",
                "filler": "Typical filler blend (e.g., Nicaragua, Dominican Republic, Honduras, Cuba)",
                "strength": "Strength level: mild, medium-mild, medium, medium-full, or full",
                "flavorProfile": ["array", "of", "typical", "flavor", "notes"],
                "ringGauge": "Ring gauge number (e.g., 50, 52, 54)",
                "length": "Length in inches (e.g., 5.0, 6.0, 7.0)",
                "smokingTime": "Typical smoking duration (e.g., 45-60 minutes, 1-1.5 hours)",
                "priceRange": "Typical price range (e.g., $8-12, $15-25, $30-50)",
                "origin": "Country of origin (e.g., Nicaragua, Dominican Republic, Cuba, Honduras)",
                "notes": "Brief tasting notes and characteristics",
                "smokingExperience": "Description of the typical smoking experience",
                "description": "Overall description of this cigar"
              }

              IMPORTANT: 
              - Use your cigar knowledge to fill in typical characteristics even if not visible in the image
              - For flavor profile, include 4-6 common tasting notes
              - Strength should be based on the specific brand/line combination
              - If you cannot identify the exact cigar, make your best educated guess based on visible elements
              - All fields should have values - use "Unknown" only if absolutely necessary
              - Focus on accuracy based on your cigar knowledge, not just what's visible`,
              },
              {
                type: "image_url",
                image_url: {
                  url: image,
                },
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Vision API error: ${response.status}`);
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content returned from vision API");
    }

    // Try to parse the JSON response from GPT-4
    let cigarInfo;
    try {
      // Remove any markdown formatting and extract JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cigarInfo = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("JSON parsing failed:", parseError);
      // Fallback: create structured response with defaults
      cigarInfo = {
        brand: "Unknown Brand",
        line: "",
        vitola: "Robusto",
        wrapper: "Natural",
        binder: "Unknown",
        filler: "Unknown",
        strength: "medium",
        flavorProfile: ["tobacco", "wood", "earth"],
        ringGauge: "50",
        length: "5.0",
        smokingTime: "45-60 minutes",
        priceRange: "$10-20",
        origin: "Unknown",
        notes: "Unable to fully analyze this cigar from the image",
        smokingExperience: "Analysis incomplete",
        description: content || "Could not analyze cigar details",
      };
    }

    // Ensure all required fields exist
    const defaultValues = {
      brand: "Unknown Brand",
      line: "",
      vitola: "Robusto",
      wrapper: "Natural",
      binder: "Unknown",
      filler: "Unknown",
      strength: "medium",
      flavorProfile: ["tobacco", "wood"],
      ringGauge: "50",
      length: "5.0",
      smokingTime: "45-60 minutes",
      priceRange: "$10-20",
      origin: "Unknown",
      notes: "",
      smokingExperience: "",
      description: "",
    };

    // Fill in any missing fields with defaults
    Object.keys(defaultValues).forEach((key) => {
      if (!cigarInfo[key] || cigarInfo[key] === null) {
        cigarInfo[key] = defaultValues[key];
      }
    });

    return Response.json({
      success: true,
      analysis: cigarInfo,
      rawResponse: content,
    });
  } catch (error) {
    console.error("Error analyzing cigar:", error);
    return Response.json(
      {
        error: "Failed to analyze cigar image",
        details: error.message,
      },
      { status: 500 },
    );
  }
}