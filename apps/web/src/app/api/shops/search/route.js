import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get("query") || "";
    const city = url.searchParams.get("city") || "";
    const latitude = parseFloat(url.searchParams.get("latitude"));
    const longitude = parseFloat(url.searchParams.get("longitude"));
    const radius = url.searchParams.get("radius") || "25000"; // 25km default

    let searchLatitude = latitude;
    let searchLongitude = longitude;

    // If city is provided, convert to coordinates first
    if (city.trim() && (!latitude || !longitude)) {
      const cityCoords = getCityCoordinates(city);
      if (cityCoords) {
        searchLatitude = cityCoords.latitude;
        searchLongitude = cityCoords.longitude;
      }
    }

    let allResults = [];

    // Define search terms - more comprehensive for city searches
    let searchTerms;
    if (query.trim()) {
      searchTerms = [query.trim()];
    } else {
      // For city searches, try broader terms
      if (city.trim()) {
        // Extract just the main city name for cleaner search
        const mainCity = city.split(",")[0].trim();
        searchTerms = [
          `Cigar lounge ${mainCity}`,
          `Cigar shop ${mainCity}`,
          `Tobacco shop ${mainCity}`,
          `Smoke shop ${mainCity}`,
          `Cigar bar ${mainCity}`,
        ];
      } else {
        searchTerms = [
          "cigar lounge",
          "cigar shop",
          "tobacco shop",
          "smoke shop",
        ];
      }
    }

    console.log("Search terms:", searchTerms);
    console.log("Search coordinates:", { searchLatitude, searchLongitude });

    // Search for each term
    for (const term of searchTerms.slice(0, 4)) {
      // Limit to 4 searches
      try {
        let searchQuery = term;

        const queryParams = new URLSearchParams({
          query: searchQuery,
          limit: "20",
          region: "us",
          verified: "false",
          business_status: "OPEN",
        });

        // Add coordinates if available
        if (searchLatitude && searchLongitude) {
          queryParams.set("lat", searchLatitude.toString());
          queryParams.set("lng", searchLongitude.toString());
        }

        console.log(
          "Fetching:",
          `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/integrations/local-business-data/search?${queryParams}`,
        );

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/integrations/local-business-data/search?${queryParams}`,
        );

        if (response.ok) {
          const data = await response.json();
          console.log(`Results for "${term}":`, data.data?.length || 0);
          if (data.data && Array.isArray(data.data)) {
            allResults = allResults.concat(data.data);
          }
        } else {
          console.error(`Search failed for "${term}":`, response.status);
        }
      } catch (error) {
        console.error(`Error searching for ${term}:`, error);
      }
    }

    console.log("Total raw results:", allResults.length);

    // Process and deduplicate results with more lenient filtering
    const processedResults = [];
    const seenNames = new Set();

    for (const business of allResults) {
      // Skip if we've seen this business name and location before
      const businessKey = `${business.name?.toLowerCase()}-${business.latitude}-${business.longitude}`;
      if (!business.name || seenNames.has(businessKey)) {
        continue;
      }
      seenNames.add(businessKey);

      // Much more lenient filtering - include almost everything from our targeted search
      const name = business.name?.toLowerCase() || "";
      const type = business.type?.toLowerCase() || "";
      const subtypes = (business.subtypes || []).join(" ").toLowerCase();
      const address = business.full_address?.toLowerCase() || "";
      const description = business.about?.summary?.toLowerCase() || "";

      // Check for relevant keywords (very broad)
      const relevantKeywords = [
        "cigar",
        "tobacco",
        "smoke",
        "smoking",
        "humidor",
        "lounge",
        "pipe",
        "vape",
        "hookah",
        "shisha",
        "bar",
        "club",
        "spirits",
      ];

      const isRelevant = relevantKeywords.some(
        (keyword) =>
          name.includes(keyword) ||
          type.includes(keyword) ||
          subtypes.includes(keyword) ||
          address.includes(keyword) ||
          description.includes(keyword),
      );

      // If our search was specifically for cigar/tobacco terms, be very lenient
      const wasSpecificSearch = searchTerms.some(
        (term) =>
          term.toLowerCase().includes("cigar") ||
          term.toLowerCase().includes("tobacco") ||
          term.toLowerCase().includes("smoke"),
      );

      // If we did a specific search, include almost everything
      // Otherwise apply keyword filtering
      if (!wasSpecificSearch && !isRelevant) {
        continue;
      }

      const processedBusiness = {
        name: business.name || "Unknown",
        address: business.full_address || business.address || "",
        latitude: business.latitude,
        longitude: business.longitude,
        rating: business.rating || 0,
        reviews: business.review_count || 0,
        phone: business.phone_number || null,
        website: business.website || null,
        hours: business.working_hours || null,
        type: business.type || "shop",
        // Determine if it's a lounge based on keywords
        hasLounge:
          name.includes("lounge") ||
          type.includes("lounge") ||
          subtypes.includes("lounge"),
        hasHumidor: true, // Assume most tobacco shops have humidors
        allowsSmoking: name.includes("lounge") || type.includes("lounge"),
        description: business.about?.summary || null,
        googlePlaceId: business.place_id || null,
        verified: business.verified || false,
      };

      // Only include if we have coordinates
      if (processedBusiness.latitude && processedBusiness.longitude) {
        processedResults.push(processedBusiness);
      }
    }

    console.log("Processed results:", processedResults.length);

    // Sort by rating and distance (prioritize higher rated places)
    processedResults.sort((a, b) => {
      const ratingDiff = (b.rating || 0) - (a.rating || 0);
      if (Math.abs(ratingDiff) > 0.5) return ratingDiff;

      // If ratings are similar, sort by distance if we have user location
      if (searchLatitude && searchLongitude) {
        const distanceA = Math.sqrt(
          Math.pow(a.latitude - searchLatitude, 2) +
            Math.pow(a.longitude - searchLongitude, 2),
        );
        const distanceB = Math.sqrt(
          Math.pow(b.latitude - searchLatitude, 2) +
            Math.pow(b.longitude - searchLongitude, 2),
        );
        return distanceA - distanceB;
      }

      // Otherwise sort by review count
      return (b.reviews || 0) - (a.reviews || 0);
    });

    return Response.json({
      success: true,
      results: processedResults.slice(0, 20), // Limit to top 20 results
      count: processedResults.length,
      searchLocation:
        searchLatitude && searchLongitude
          ? {
              latitude: searchLatitude,
              longitude: searchLongitude,
            }
          : null,
      debug: {
        searchTerms,
        rawResultsCount: allResults.length,
        processedCount: processedResults.length,
      },
    });
  } catch (error) {
    console.error("Error searching for venues:", error);
    return Response.json(
      {
        success: false,
        error: "Failed to search venues",
        results: [],
        count: 0,
      },
      { status: 500 },
    );
  }
}

// Helper function to get coordinates for major cities
function getCityCoordinates(cityName) {
  const cityLower = cityName.toLowerCase();

  const majorCities = {
    // US Major Cities
    "new york": { latitude: 40.7128, longitude: -74.006 },
    "los angeles": { latitude: 34.0522, longitude: -118.2437 },
    chicago: { latitude: 41.8781, longitude: -87.6298 },
    houston: { latitude: 29.7604, longitude: -95.3698 },
    phoenix: { latitude: 33.4484, longitude: -112.074 },
    philadelphia: { latitude: 39.9526, longitude: -75.1652 },
    "san antonio": { latitude: 29.4241, longitude: -98.4936 },
    "san diego": { latitude: 32.7157, longitude: -117.1611 },
    dallas: { latitude: 32.7767, longitude: -96.797 },
    "san jose": { latitude: 37.3382, longitude: -121.8863 },
    austin: { latitude: 30.2672, longitude: -97.7431 },
    jacksonville: { latitude: 30.3322, longitude: -81.6557 },
    "fort worth": { latitude: 32.7555, longitude: -97.3308 },
    columbus: { latitude: 39.9612, longitude: -82.9988 },
    charlotte: { latitude: 35.2271, longitude: -80.8431 },
    "san francisco": { latitude: 37.7749, longitude: -122.4194 },
    indianapolis: { latitude: 39.7684, longitude: -86.1581 },
    seattle: { latitude: 47.6062, longitude: -122.3321 },
    denver: { latitude: 39.7392, longitude: -104.9903 },
    washington: { latitude: 38.9072, longitude: -77.0369 },
    boston: { latitude: 42.3601, longitude: -71.0589 },
    "el paso": { latitude: 31.7619, longitude: -106.485 },
    detroit: { latitude: 42.3314, longitude: -83.0458 },
    nashville: { latitude: 36.1627, longitude: -86.7816 },
    portland: { latitude: 45.5152, longitude: -122.6784 },
    memphis: { latitude: 35.1495, longitude: -90.049 },
    "oklahoma city": { latitude: 35.4676, longitude: -97.5164 },
    "las vegas": { latitude: 36.1699, longitude: -115.1398 },
    louisville: { latitude: 38.2527, longitude: -85.7585 },
    baltimore: { latitude: 39.2904, longitude: -76.6122 },
    milwaukee: { latitude: 43.0389, longitude: -87.9065 },
    albuquerque: { latitude: 35.0844, longitude: -106.6504 },
    tucson: { latitude: 32.2226, longitude: -110.9747 },
    fresno: { latitude: 36.7378, longitude: -119.7871 },
    sacramento: { latitude: 38.5816, longitude: -121.4944 },
    "kansas city": { latitude: 39.0997, longitude: -94.5786 },
    mesa: { latitude: 33.4152, longitude: -111.8315 },
    atlanta: { latitude: 33.749, longitude: -84.388 },
    "colorado springs": { latitude: 38.8339, longitude: -104.8214 },
    raleigh: { latitude: 35.7796, longitude: -78.6382 },
    omaha: { latitude: 41.2565, longitude: -95.9345 },
    miami: { latitude: 25.7617, longitude: -80.1918 },
    oakland: { latitude: 37.8044, longitude: -122.2711 },
    minneapolis: { latitude: 44.9778, longitude: -93.265 },
    tulsa: { latitude: 36.154, longitude: -95.9928 },
    cleveland: { latitude: 41.4993, longitude: -81.6944 },
    wichita: { latitude: 37.6872, longitude: -97.3301 },
    arlington: { latitude: 32.7357, longitude: -97.1081 },
    tampa: { latitude: 27.9506, longitude: -82.4572 },
    "new orleans": { latitude: 29.9511, longitude: -90.0715 },
    honolulu: { latitude: 21.3099, longitude: -157.8581 },
  };

  // Check for exact matches first
  for (const [city, coords] of Object.entries(majorCities)) {
    if (cityLower.includes(city)) {
      return coords;
    }
  }

  // Check for state matches
  if (cityLower.includes("new york")) return majorCities["new york"];
  if (cityLower.includes("california") || cityLower.includes("ca,"))
    return majorCities["los angeles"];
  if (cityLower.includes("texas") || cityLower.includes("tx,"))
    return majorCities["houston"];
  if (cityLower.includes("florida") || cityLower.includes("fl,"))
    return majorCities["miami"];
  if (cityLower.includes("illinois") || cityLower.includes("il,"))
    return majorCities["chicago"];

  return null;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const venues = body.venues || [];

    if (!Array.isArray(venues) || venues.length === 0) {
      return Response.json({ error: "No venues to save" }, { status: 400 });
    }

    const savedVenues = [];

    for (const venue of venues) {
      try {
        // Check if venue already exists
        const existing = await sql`
          SELECT id FROM shops 
          WHERE name = ${venue.name} 
          AND ABS(latitude - ${venue.latitude}) < 0.001 
          AND ABS(longitude - ${venue.longitude}) < 0.001
        `;

        if (existing.length > 0) {
          savedVenues.push({ ...venue, id: existing[0].id, existed: true });
          continue;
        }

        // Insert new venue
        const result = await sql`
          INSERT INTO shops (
            name,
            address,
            latitude,
            longitude,
            phone,
            website,
            has_lounge,
            has_humidor,
            allows_smoking,
            description,
            average_rating,
            total_reviews,
            verified
          ) VALUES (
            ${venue.name},
            ${venue.address},
            ${venue.latitude},
            ${venue.longitude},
            ${venue.phone},
            ${venue.website},
            ${venue.hasLounge || false},
            ${venue.hasHumidor || false},
            ${venue.allowsSmoking || false},
            ${venue.description},
            ${venue.rating || 0},
            ${venue.reviews || 0},
            ${venue.verified || false}
          )
          RETURNING *
        `;

        savedVenues.push({ ...venue, id: result[0].id, existed: false });
      } catch (error) {
        console.error("Error saving individual venue:", error);
        // Continue with other venues
      }
    }

    return Response.json({
      success: true,
      saved: savedVenues.length,
      venues: savedVenues,
    });
  } catch (error) {
    console.error("Error saving venues:", error);
    return Response.json({ error: "Failed to save venues" }, { status: 500 });
  }
}
