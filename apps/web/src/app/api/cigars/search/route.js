import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get('query') || '';

    if (!query) {
      return Response.json({ error: "Query parameter required" }, { status: 400 });
    }

    // First search our local database
    const localResults = await sql`
      SELECT * FROM cigars 
      WHERE 
        LOWER(brand) LIKE LOWER(${'%' + query + '%'}) OR 
        LOWER(line) LIKE LOWER(${'%' + query + '%'}) OR 
        LOWER(vitola) LIKE LOWER(${'%' + query + '%'})
      ORDER BY average_rating DESC
      LIMIT 5
    `;

    // If we have local results, return them
    if (localResults.length > 0) {
      return Response.json({
        source: 'local',
        cigars: localResults.map(cigar => ({
          id: cigar.id,
          brand: cigar.brand,
          line: cigar.line,
          vitola: cigar.vitola,
          strength: cigar.strength,
          wrapper: cigar.wrapper,
          ringGauge: cigar.ring_gauge,
          length: cigar.length_inches,
          rating: cigar.average_rating,
          image: cigar.image_url,
          description: cigar.description,
          confidence: 1.0 // Local matches are 100% confident
        }))
      });
    }

    // If no local results, try RapidAPI
    if (process.env.RAPIDAPI_KEY) {
      try {
        const rapidApiResponse = await fetch(
          `https://cigars2.p.rapidapi.com/cigars/search?q=${encodeURIComponent(query)}`,
          {
            method: 'GET',
            headers: {
              'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
              'X-RapidAPI-Host': 'cigars2.p.rapidapi.com'
            }
          }
        );

        if (rapidApiResponse.ok) {
          const apiData = await rapidApiResponse.json();
          
          // Transform RapidAPI data to our format
          const apiCigars = (apiData.cigars || []).slice(0, 5).map(cigar => ({
            external_id: cigar.id,
            brand: cigar.brand || 'Unknown',
            line: cigar.line || '',
            vitola: cigar.vitola || cigar.size || 'Unknown',
            strength: cigar.strength || 'medium',
            wrapper: cigar.wrapper || '',
            ringGauge: cigar.ringGauge || cigar.ring_gauge,
            length: cigar.length,
            rating: cigar.rating || 0,
            image: cigar.image || cigar.imageUrl,
            description: cigar.description || '',
            confidence: 0.85 // API matches are 85% confident
          }));

          return Response.json({
            source: 'external',
            cigars: apiCigars
          });
        }
      } catch (apiError) {
        console.error('RapidAPI error:', apiError);
        // Fall through to mock data
      }
    }

    // Fallback to mock data if no API key or API fails
    const mockMatches = [
      {
        id: 'mock-1',
        brand: 'Padron',
        line: '1926 Series',
        vitola: 'Robusto',
        strength: 'full',
        wrapper: 'Maduro',
        ringGauge: 50,
        length: 5.5,
        rating: 4.5,
        image: 'https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?w=200&h=150&fit=crop',
        description: 'A premium Nicaraguan cigar with rich, complex flavors.',
        confidence: 0.75
      },
      {
        id: 'mock-2', 
        brand: 'Romeo y Julieta',
        line: '1875',
        vitola: 'Robusto',
        strength: 'mild',
        wrapper: 'Connecticut',
        ringGauge: 50,
        length: 5.0,
        rating: 4.0,
        image: 'https://images.unsplash.com/photo-1582568209097-5d90cc5feda3?w=200&h=150&fit=crop',
        description: 'Smooth and creamy with hints of cedar and vanilla.',
        confidence: 0.65
      }
    ].filter(cigar => 
      cigar.brand.toLowerCase().includes(query.toLowerCase()) ||
      cigar.line.toLowerCase().includes(query.toLowerCase())
    );

    return Response.json({
      source: 'mock',
      cigars: mockMatches
    });

  } catch (error) {
    console.error('Error searching cigars:', error);
    return Response.json({ error: "Failed to search cigars" }, { status: 500 });
  }
}

// Import cigar data from RapidAPI into our database
export async function POST(request) {
  try {
    const { cigar } = await request.json();

    if (!cigar) {
      return Response.json({ error: "Cigar data required" }, { status: 400 });
    }

    // Check if cigar already exists
    const existing = await sql`
      SELECT id FROM cigars 
      WHERE LOWER(brand) = LOWER(${cigar.brand}) 
      AND LOWER(line) = LOWER(${cigar.line || ''})
      AND LOWER(vitola) = LOWER(${cigar.vitola})
    `;

    if (existing.length > 0) {
      return Response.json({ 
        message: "Cigar already exists",
        id: existing[0].id 
      });
    }

    // Insert new cigar
    const result = await sql`
      INSERT INTO cigars (
        brand, line, vitola, length_inches, ring_gauge, wrapper,
        strength, description, image_url, average_rating
      ) VALUES (
        ${cigar.brand},
        ${cigar.line || ''},
        ${cigar.vitola},
        ${cigar.length || null},
        ${cigar.ringGauge || null},
        ${cigar.wrapper || ''},
        ${cigar.strength || 'medium'},
        ${cigar.description || ''},
        ${cigar.image || ''},
        ${cigar.rating || 0}
      )
      RETURNING *
    `;

    return Response.json({ 
      message: "Cigar imported successfully",
      cigar: result[0]
    });

  } catch (error) {
    console.error('Error importing cigar:', error);
    return Response.json({ error: "Failed to import cigar" }, { status: 500 });
  }
}