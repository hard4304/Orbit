import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";

export async function GET(request: Request) {
  try {
    await requireAuth();

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json({ products: [] });
    }

    // Use Search-a-licious API (Elasticsearch-powered, has fuzzy/typo tolerance)
    const apiUrl = `https://search.openfoodfacts.org/search?q=${encodeURIComponent(query)}&page_size=10&langs=en`;

    const res = await fetch(apiUrl, {
      headers: {
        "User-Agent": "OrbitLifeTracker/1.0 - utkarsh",
      },
    });

    if (!res.ok) {
      throw new Error(`OpenFoodFacts Search API error: ${res.status}`);
    }

    const data = await res.json();

    // Search-a-licious returns "hits" instead of "products" — normalize for client
    return NextResponse.json({ products: data.hits || [] });
  } catch (error) {
    console.error("Food search API error:", error);
    return NextResponse.json(
      { error: "Failed to search food" },
      { status: 500 }
    );
  }
}
