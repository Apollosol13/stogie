export async function GET(request) {
  try {
    console.log("Testing local business data integration...");

    // Test a very simple search first
    const testQuery = "Cigar shop San Francisco";
    console.log("Testing query:", testQuery);

    const queryParams = new URLSearchParams({
      query: testQuery,
      limit: "10",
      region: "us",
      lat: "37.7749",
      lng: "-122.4194",
    });

    const url = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/integrations/local-business-data/search?${queryParams}`;
    console.log("Full URL:", url);

    const response = await fetch(url);
    console.log("Response status:", response.status);

    if (response.ok) {
      const data = await response.json();
      console.log("Response data:", JSON.stringify(data, null, 2));

      return Response.json({
        success: true,
        url,
        status: response.status,
        data: data,
        resultCount: data.data?.length || 0,
      });
    } else {
      const errorText = await response.text();
      console.error("API Error:", response.status, errorText);

      return Response.json({
        success: false,
        url,
        status: response.status,
        error: errorText,
      });
    }
  } catch (error) {
    console.error("Test error:", error);
    return Response.json({
      success: false,
      error: error.message,
    });
  }
}
